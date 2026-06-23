package usecase

import (
	"context"
	"time"

	"github.com/FCRez95/tbl-ingestion-api/internal/domain"
)

// ClickAuthLookup resolves campaign IDs without coupling the use case to storage.
type ClickAuthLookup interface {
	// Resolve returns the campaign ID for the token, or empty string if not found.
	Resolve(ctx context.Context, token string) (campaignID string, ok bool)
}

// ClickSink is the output port used by this use case.
type ClickSink interface {
	Enqueue(ctx context.Context, c domain.Click) error
}

type SaveDeps struct {
	Sink   ClickSink
	Lookup ClickAuthLookup
	Now    func() time.Time
}

type SaveClick struct{ d SaveDeps }

func NewSaveClick(d SaveDeps) *SaveClick { return &SaveClick{d: d} }

// SaveInput mirrors what the handler accepts.
type SaveInput struct {
	ID            string // required
	ClickAuth     string // required
	TblCampaignID string // optional
	SiteID        string // optional
	AdID          string // optional
	Step1         string // optional
	Step2         string // optional
	Step3         string // optional
	Checkout      string // optional
}

// Execute builds a Click and pushes it to the configured sink.
func (uc *SaveClick) Execute(ctx context.Context, in SaveInput) (domain.Click, error) {
	// Validate click_auth against the server cache (no DB calls).
	campaignID, ok := uc.d.Lookup.Resolve(ctx, in.ClickAuth)
	if !ok {
		return domain.Click{}, ErrInvalidClickAuth
	}

	now := uc.d.Now()

	click := domain.Click{
		ID:            in.ID,
		ClickAuth:     in.ClickAuth,
		CampaignID:    campaignID,
		TblCampaignID: in.TblCampaignID,
		SiteID:        in.SiteID,
		AdID:          in.AdID,
		Step1:         in.Step1,
		Step2:         in.Step2,
		Step3:         in.Step3,
		Checkout:      in.Checkout,
		IngestTS:      now,
	}

	if err := uc.d.Sink.Enqueue(ctx, click); err != nil {
		return domain.Click{}, err
	}
	return click, nil
}
