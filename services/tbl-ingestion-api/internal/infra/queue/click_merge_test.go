package queue

import (
	"testing"
	"time"

	"github.com/FCRez95/tbl-ingestion-api/internal/domain"
)

func TestMergeClickKeepsHighestProgressAndBackfillsFields(t *testing.T) {
	early := time.UnixMilli(1000)
	later := time.UnixMilli(2000)

	existing := domain.Click{
		ID:            "click-1",
		ClickAuth:     "token",
		CampaignID:    "campaign-1",
		TblCampaignID: "",
		SiteID:        "site-1",
		AdID:          "",
		Step1:         "0",
		Step2:         "1",
		Step3:         "0",
		Checkout:      "0",
		IngestTS:      later,
	}

	incoming := domain.Click{
		ID:            "click-1",
		ClickAuth:     "",
		CampaignID:    "",
		TblCampaignID: "tbl-1",
		SiteID:        "",
		AdID:          "ad-9",
		Step1:         "1",
		Step2:         "0",
		Step3:         "2",
		Checkout:      "1",
		IngestTS:      early,
	}

	got := mergeClick(existing, incoming)

	if got.ID != "click-1" {
		t.Fatalf("expected id to be preserved, got %q", got.ID)
	}
	if got.ClickAuth != "token" {
		t.Fatalf("expected click auth to remain populated, got %q", got.ClickAuth)
	}
	if got.CampaignID != "campaign-1" {
		t.Fatalf("expected campaign id to remain populated, got %q", got.CampaignID)
	}
	if got.TblCampaignID != "tbl-1" {
		t.Fatalf("expected tbl campaign id to be backfilled, got %q", got.TblCampaignID)
	}
	if got.SiteID != "site-1" {
		t.Fatalf("expected site id to remain populated, got %q", got.SiteID)
	}
	if got.AdID != "ad-9" {
		t.Fatalf("expected ad id to be backfilled, got %q", got.AdID)
	}
	if got.Step1 != "1" || got.Step2 != "1" || got.Step3 != "2" || got.Checkout != "1" {
		t.Fatalf("unexpected merged progress values: %+v", got)
	}
	if !got.IngestTS.Equal(early) {
		t.Fatalf("expected earliest ingest timestamp, got %v", got.IngestTS)
	}
}

func TestMergeClickDoesNotDowngradeExistingData(t *testing.T) {
	existing := domain.Click{
		ID:            "click-2",
		ClickAuth:     "token",
		CampaignID:    "campaign-2",
		TblCampaignID: "tbl-2",
		SiteID:        "site-2",
		AdID:          "ad-2",
		Step1:         "3",
		Step2:         "2",
		Step3:         "4",
		Checkout:      "1",
		IngestTS:      time.UnixMilli(1500),
	}

	incoming := domain.Click{
		ID:            "click-2",
		ClickAuth:     "",
		CampaignID:    "",
		TblCampaignID: "",
		SiteID:        "",
		AdID:          "",
		Step1:         "1",
		Step2:         "1",
		Step3:         "0",
		Checkout:      "0",
		IngestTS:      time.UnixMilli(2500),
	}

	got := mergeClick(existing, incoming)

	if got.ClickAuth != existing.ClickAuth ||
		got.CampaignID != existing.CampaignID ||
		got.TblCampaignID != existing.TblCampaignID ||
		got.SiteID != existing.SiteID ||
		got.AdID != existing.AdID {
		t.Fatalf("expected existing populated fields to be preserved, got %+v", got)
	}

	if got.Step1 != existing.Step1 ||
		got.Step2 != existing.Step2 ||
		got.Step3 != existing.Step3 ||
		got.Checkout != existing.Checkout {
		t.Fatalf("expected progress fields not to downgrade, got %+v", got)
	}

	if !got.IngestTS.Equal(existing.IngestTS) {
		t.Fatalf("expected earliest existing ingest timestamp, got %v", got.IngestTS)
	}
}

func TestMaxProgressPrefersNumericValueAndBackfillsEmpty(t *testing.T) {
	if got := maxProgress("", "2"); got != "2" {
		t.Fatalf("expected empty to backfill from incoming, got %q", got)
	}
	if got := maxProgress("3", "2"); got != "3" {
		t.Fatalf("expected larger existing numeric value, got %q", got)
	}
	if got := maxProgress("x", "2"); got != "2" {
		t.Fatalf("expected numeric incoming to win over non-numeric existing, got %q", got)
	}
	if got := maxProgress("x", "y"); got != "x" {
		t.Fatalf("expected deterministic preservation of existing non-numeric value, got %q", got)
	}
}
