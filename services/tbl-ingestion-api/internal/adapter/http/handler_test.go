package http

import (
	"context"
	"encoding/json"
	"errors"
	stdhttp "net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/gin-gonic/gin"

	"github.com/FCRez95/tbl-ingestion-api/internal/domain"
	"github.com/FCRez95/tbl-ingestion-api/internal/infra/cache"
	"github.com/FCRez95/tbl-ingestion-api/internal/usecase"
)

type fakeSink struct {
	err error
}

func (s fakeSink) Enqueue(_ context.Context, _ domain.Click) error {
	return s.err
}

func newSaveClick(tokens map[string]string, sinkErr error) *usecase.SaveClick {
	return usecase.NewSaveClick(usecase.SaveDeps{
		Sink:   fakeSink{err: sinkErr},
		Lookup: cache.NewResolver(tokens),
		Now: func() time.Time {
			return time.UnixMilli(1234)
		},
	})
}

func newPublicRouter(save *usecase.SaveClick) *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.New()
	public := r.Group("/")
	public.Use(PublicCORS())
	RegisterRoutes(public, save)
	return r
}

func newAdminRouter(token string, resolver *cache.Resolver) *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.New()
	admin := r.Group("/admin")
	admin.Use(RequireBearerToken(token))
	RegisterEditMapRoutes(admin, resolver)
	return r
}

func TestPostValidClickReturnsQueuedResponse(t *testing.T) {
	r := newPublicRouter(newSaveClick(map[string]string{"demo-token": "campaign-001"}, nil))

	w := httptest.NewRecorder()
	req := httptest.NewRequest(stdhttp.MethodPost, "/clicks", strings.NewReader(`{
		"id":"click-1",
		"click_auth":"demo-token",
		"tbl_campaign_id":"tbl-001",
		"site_id":"site-001",
		"ad_id":"ad-001",
		"step_1":"1",
		"step_2":"0",
		"step_3":"0",
		"checkout":"0"
	}`))
	req.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(w, req)

	if w.Code != stdhttp.StatusAccepted {
		t.Fatalf("expected status %d, got %d body=%s", stdhttp.StatusAccepted, w.Code, w.Body.String())
	}
	if got := w.Header().Get("X-Path"); got != "queued" {
		t.Fatalf("expected X-Path queued, got %q", got)
	}

	var got ClickOut
	if err := json.Unmarshal(w.Body.Bytes(), &got); err != nil {
		t.Fatalf("decode response: %v body=%s", err, w.Body.String())
	}
	if got.ID != "click-1" ||
		got.ClickAuth != "demo-token" ||
		got.CampaignID != "campaign-001" ||
		got.TblCampaignID != "tbl-001" ||
		got.SiteID != "site-001" ||
		got.AdID != "ad-001" ||
		got.Step1 != "1" ||
		got.Step2 != "0" ||
		got.Step3 != "0" ||
		got.Checkout != "0" ||
		got.IngestTS != 1234 ||
		got.Path != "queued" {
		t.Fatalf("unexpected response: %+v", got)
	}
}

func TestPostMinimalValidClickReturnsQueuedResponse(t *testing.T) {
	r := newPublicRouter(newSaveClick(map[string]string{"demo-token": "campaign-001"}, nil))

	w := httptest.NewRecorder()
	req := httptest.NewRequest(stdhttp.MethodPost, "/clicks", strings.NewReader(`{
		"id":" click-1 ",
		"click_auth":" demo-token "
	}`))
	req.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(w, req)

	if w.Code != stdhttp.StatusAccepted {
		t.Fatalf("expected status %d, got %d body=%s", stdhttp.StatusAccepted, w.Code, w.Body.String())
	}

	var got ClickOut
	if err := json.Unmarshal(w.Body.Bytes(), &got); err != nil {
		t.Fatalf("decode response: %v body=%s", err, w.Body.String())
	}
	if got.ID != "click-1" ||
		got.ClickAuth != "demo-token" ||
		got.CampaignID != "campaign-001" ||
		got.TblCampaignID != "" ||
		got.SiteID != "" ||
		got.AdID != "" ||
		got.Step1 != "" ||
		got.Step2 != "" ||
		got.Step3 != "" ||
		got.Checkout != "" ||
		got.Path != "queued" {
		t.Fatalf("unexpected response: %+v", got)
	}
}

func TestPostInvalidJSONUsesStableError(t *testing.T) {
	r := newPublicRouter(newSaveClick(map[string]string{"demo-token": "campaign-001"}, nil))

	w := httptest.NewRecorder()
	req := httptest.NewRequest(stdhttp.MethodPost, "/clicks", strings.NewReader("{"))
	req.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(w, req)

	assertAPIError(t, w, apiErrorInvalidRequest, "invalid character")
}

func TestPostMissingRequiredFieldsUsesStableError(t *testing.T) {
	r := newPublicRouter(newSaveClick(map[string]string{"demo-token": "campaign-001"}, nil))

	for _, tc := range []struct {
		name string
		body string
	}{
		{name: "missing id", body: `{"click_auth":"demo-token"}`},
		{name: "missing click_auth", body: `{"id":"click-1"}`},
		{name: "blank id", body: `{"id":"   ","click_auth":"demo-token"}`},
		{name: "blank click_auth", body: `{"id":"click-1","click_auth":"   "}`},
	} {
		t.Run(tc.name, func(t *testing.T) {
			w := httptest.NewRecorder()
			req := httptest.NewRequest(stdhttp.MethodPost, "/clicks", strings.NewReader(tc.body))
			req.Header.Set("Content-Type", "application/json")
			r.ServeHTTP(w, req)

			assertAPIError(t, w, apiErrorInvalidRequest)
		})
	}
}

func TestPostInvalidProgressFieldsUseStableError(t *testing.T) {
	r := newPublicRouter(newSaveClick(map[string]string{"demo-token": "campaign-001"}, nil))

	for _, tc := range []struct {
		name string
		body string
	}{
		{name: "non numeric step", body: `{"id":"click-1","click_auth":"demo-token","step_1":"yes"}`},
		{name: "negative checkout", body: `{"id":"click-1","click_auth":"demo-token","checkout":"-1"}`},
		{name: "non numeric checkout", body: `{"id":"click-1","click_auth":"demo-token","checkout":"done"}`},
	} {
		t.Run(tc.name, func(t *testing.T) {
			w := httptest.NewRecorder()
			req := httptest.NewRequest(stdhttp.MethodPost, "/clicks", strings.NewReader(tc.body))
			req.Header.Set("Content-Type", "application/json")
			r.ServeHTTP(w, req)

			assertAPIError(t, w, apiErrorInvalidRequest)
		})
	}
}

func TestPostUnknownTokenUsesStableError(t *testing.T) {
	r := newPublicRouter(newSaveClick(map[string]string{}, nil))

	w := httptest.NewRecorder()
	req := httptest.NewRequest(stdhttp.MethodPost, "/clicks", strings.NewReader(`{"id":"click-1","click_auth":"missing"}`))
	req.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(w, req)

	assertAPIError(t, w, apiErrorInvalidClickAuth)
}

func TestPostSinkFailureDoesNotLeakInternalError(t *testing.T) {
	r := newPublicRouter(newSaveClick(
		map[string]string{"demo-token": "campaign-001"},
		errors.New("aws credentials exploded"),
	))

	w := httptest.NewRecorder()
	req := httptest.NewRequest(stdhttp.MethodPost, "/clicks", strings.NewReader(`{"id":"click-1","click_auth":"demo-token"}`))
	req.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(w, req)

	assertAPIError(t, w, apiErrorQueueUnavailable, "aws credentials exploded")
}

func TestPublicCORSAllowsArbitraryFunnelOriginsWithoutCredentials(t *testing.T) {
	r := newPublicRouter(newSaveClick(map[string]string{"demo-token": "campaign-001"}, nil))

	w := httptest.NewRecorder()
	req := httptest.NewRequest(stdhttp.MethodOptions, "/clicks", nil)
	req.Header.Set("Origin", "https://random-funnel.example")
	req.Header.Set("Access-Control-Request-Method", stdhttp.MethodPost)
	req.Header.Set("Access-Control-Request-Headers", "Content-Type")
	r.ServeHTTP(w, req)

	if w.Code != stdhttp.StatusNoContent {
		t.Fatalf("expected status %d, got %d body=%s", stdhttp.StatusNoContent, w.Code, w.Body.String())
	}
	if got := w.Header().Get("Access-Control-Allow-Origin"); got != "*" {
		t.Fatalf("expected wildcard public CORS origin, got %q", got)
	}
	if got := w.Header().Get("Access-Control-Allow-Credentials"); got != "" {
		t.Fatalf("expected credentials to be disabled, got %q", got)
	}
}

func TestAdminRoutesRequireBearerToken(t *testing.T) {
	resolver := cache.NewResolver(nil)
	r := newAdminRouter("secret", resolver)

	for _, tc := range []struct {
		name   string
		header string
	}{
		{name: "missing"},
		{name: "wrong", header: "Bearer wrong"},
	} {
		t.Run(tc.name, func(t *testing.T) {
			w := httptest.NewRecorder()
			req := httptest.NewRequest(stdhttp.MethodPut, "/admin/clickauth", strings.NewReader(`{"token":"demo","campaign_id":"campaign-001"}`))
			req.Header.Set("Content-Type", "application/json")
			if tc.header != "" {
				req.Header.Set("Authorization", tc.header)
			}
			r.ServeHTTP(w, req)

			assertAPIError(t, w, apiErrorUnauthorized)
		})
	}

	w := httptest.NewRecorder()
	req := httptest.NewRequest(stdhttp.MethodPut, "/admin/clickauth", strings.NewReader(`{"token":"demo","campaign_id":"campaign-001"}`))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer secret")
	r.ServeHTTP(w, req)

	if w.Code != stdhttp.StatusNoContent {
		t.Fatalf("expected status %d, got %d body=%s", stdhttp.StatusNoContent, w.Code, w.Body.String())
	}
	if campaignID, ok := resolver.Resolve(context.Background(), "demo"); !ok || campaignID != "campaign-001" {
		t.Fatalf("expected admin upsert to populate resolver, got id=%q ok=%v", campaignID, ok)
	}
}

func TestAdminUpsertInvalidRequestUsesStableError(t *testing.T) {
	resolver := cache.NewResolver(nil)
	r := newAdminRouter("secret", resolver)

	for _, tc := range []struct {
		name   string
		body   string
		absent []string
	}{
		{name: "invalid json", body: `{`, absent: []string{"invalid character"}},
		{name: "missing token", body: `{"campaign_id":"campaign-001"}`, absent: []string{"UpsertInput.Token"}},
		{name: "missing campaign id", body: `{"token":"demo"}`, absent: []string{"UpsertInput.CampaignID"}},
	} {
		t.Run(tc.name, func(t *testing.T) {
			w := httptest.NewRecorder()
			req := httptest.NewRequest(stdhttp.MethodPut, "/admin/clickauth", strings.NewReader(tc.body))
			req.Header.Set("Content-Type", "application/json")
			req.Header.Set("Authorization", "Bearer secret")
			r.ServeHTTP(w, req)

			assertAPIError(t, w, apiErrorInvalidRequest, tc.absent...)
		})
	}
}

func assertAPIError(t *testing.T, w *httptest.ResponseRecorder, want apiErrorSpec, absent ...string) {
	t.Helper()

	body := w.Body.String()
	if w.Code != want.status {
		t.Fatalf("expected status %d, got %d body=%s", want.status, w.Code, body)
	}
	if got := w.Header().Get("Content-Type"); !strings.Contains(got, "application/json") {
		t.Fatalf("expected JSON error response, got Content-Type %q body=%s", got, body)
	}

	var got errorResponse
	if err := json.Unmarshal(w.Body.Bytes(), &got); err != nil {
		t.Fatalf("decode error response: %v body=%s", err, body)
	}
	if got.Error.Code != want.code {
		t.Fatalf("expected error code %q, got %q body=%s", want.code, got.Error.Code, body)
	}
	if got.Error.Message != want.message {
		t.Fatalf("expected error message %q, got %q body=%s", want.message, got.Error.Message, body)
	}
	for _, snippet := range absent {
		if snippet != "" && strings.Contains(body, snippet) {
			t.Fatalf("response leaked %q: %s", snippet, body)
		}
	}
}
