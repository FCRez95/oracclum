package usecase

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/FCRez95/tbl-ingestion-api/internal/domain"
)

func TestSaveClickSuccessQueuesAndReturnsClick(t *testing.T) {
	now := time.UnixMilli(1234)
	sink := &recordingSink{}
	uc := NewSaveClick(SaveDeps{
		Sink: sink,
		Lookup: staticLookup{
			"token-1": "campaign-1",
		},
		Now: func() time.Time { return now },
	})

	got, err := uc.Execute(context.Background(), SaveInput{
		ID:            "click-1",
		ClickAuth:     "token-1",
		TblCampaignID: "tbl-1",
		SiteID:        "site-1",
		AdID:          "ad-1",
		Step1:         "1",
		Step2:         "0",
		Step3:         "0",
		Checkout:      "0",
	})
	if err != nil {
		t.Fatalf("execute: %v", err)
	}

	want := domain.Click{
		ID:            "click-1",
		ClickAuth:     "token-1",
		CampaignID:    "campaign-1",
		TblCampaignID: "tbl-1",
		SiteID:        "site-1",
		AdID:          "ad-1",
		Step1:         "1",
		Step2:         "0",
		Step3:         "0",
		Checkout:      "0",
		IngestTS:      now,
	}

	if got != want {
		t.Fatalf("unexpected returned click: got %+v want %+v", got, want)
	}
	if len(sink.items) != 1 {
		t.Fatalf("expected 1 queued click, got %d", len(sink.items))
	}
	if sink.items[0] != want {
		t.Fatalf("unexpected queued click: got %+v want %+v", sink.items[0], want)
	}
}

func TestSaveClickInvalidClickAuthDoesNotQueue(t *testing.T) {
	sink := &recordingSink{}
	uc := NewSaveClick(SaveDeps{
		Sink:   sink,
		Lookup: staticLookup{},
		Now:    time.Now,
	})

	got, err := uc.Execute(context.Background(), SaveInput{
		ID:        "click-1",
		ClickAuth: "missing",
	})
	if !errors.Is(err, ErrInvalidClickAuth) {
		t.Fatalf("expected ErrInvalidClickAuth, got %v", err)
	}
	if got != (domain.Click{}) {
		t.Fatalf("expected zero click, got %+v", got)
	}
	if len(sink.items) != 0 {
		t.Fatalf("expected sink not to be called, got %d calls", len(sink.items))
	}
}

func TestSaveClickSinkFailurePropagates(t *testing.T) {
	sinkErr := errors.New("queue unavailable")
	sink := &recordingSink{err: sinkErr}
	uc := NewSaveClick(SaveDeps{
		Sink: sink,
		Lookup: staticLookup{
			"token-1": "campaign-1",
		},
		Now: time.Now,
	})

	got, err := uc.Execute(context.Background(), SaveInput{
		ID:        "click-1",
		ClickAuth: "token-1",
	})
	if !errors.Is(err, sinkErr) {
		t.Fatalf("expected sink error, got %v", err)
	}
	if got != (domain.Click{}) {
		t.Fatalf("expected zero click, got %+v", got)
	}
	if len(sink.items) != 1 {
		t.Fatalf("expected sink to be called once, got %d", len(sink.items))
	}
}

type staticLookup map[string]string

func (l staticLookup) Resolve(_ context.Context, token string) (string, bool) {
	campaignID, ok := l[token]
	return campaignID, ok
}

type recordingSink struct {
	err   error
	items []domain.Click
}

func (s *recordingSink) Enqueue(_ context.Context, c domain.Click) error {
	s.items = append(s.items, c)
	return s.err
}
