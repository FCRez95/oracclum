package queue

import (
	"strconv"
	"time"

	"github.com/FCRez95/tbl-ingestion-api/internal/domain"
)

func mergeClick(existing, incoming domain.Click) domain.Click {
	merged := existing

	merged.ID = chooseNonEmpty(existing.ID, incoming.ID)
	merged.ClickAuth = chooseNonEmpty(existing.ClickAuth, incoming.ClickAuth)
	merged.CampaignID = chooseNonEmpty(existing.CampaignID, incoming.CampaignID)
	merged.TblCampaignID = chooseNonEmpty(existing.TblCampaignID, incoming.TblCampaignID)
	merged.SiteID = chooseNonEmpty(existing.SiteID, incoming.SiteID)
	merged.AdID = chooseNonEmpty(existing.AdID, incoming.AdID)

	merged.Step1 = maxProgress(existing.Step1, incoming.Step1)
	merged.Step2 = maxProgress(existing.Step2, incoming.Step2)
	merged.Step3 = maxProgress(existing.Step3, incoming.Step3)
	merged.Checkout = maxProgress(existing.Checkout, incoming.Checkout)

	merged.IngestTS = earliestTime(existing.IngestTS, incoming.IngestTS)

	return merged
}

func chooseNonEmpty(existing, incoming string) string {
	if existing != "" {
		return existing
	}
	return incoming
}

func maxProgress(existing, incoming string) string {
	if existing == "" {
		return incoming
	}
	if incoming == "" {
		return existing
	}

	existingInt, existingErr := strconv.Atoi(existing)
	incomingInt, incomingErr := strconv.Atoi(incoming)

	switch {
	case existingErr == nil && incomingErr == nil:
		if incomingInt > existingInt {
			return incoming
		}
		return existing
	case existingErr != nil && incomingErr == nil:
		return incoming
	case existingErr == nil && incomingErr != nil:
		return existing
	default:
		return existing
	}
}

func earliestTime(existing, incoming time.Time) time.Time {
	if existing.IsZero() {
		return incoming
	}
	if incoming.IsZero() {
		return existing
	}
	if incoming.Before(existing) {
		return incoming
	}
	return existing
}
