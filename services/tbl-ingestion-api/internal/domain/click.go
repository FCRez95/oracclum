package domain

import "time"

// Click is the normalized ingestion event sent to the queue.
type Click struct {
	ID            string    // client-provided id (required)
	ClickAuth     string    // required
	CampaignID    string    // optional
	TblCampaignID string    // optional
	SiteID        string    // optional
	AdID          string    // optional
	Step1         string    // optional
	Step2         string    // optional
	Step3         string    // optional
	Checkout      string    // optional
	IngestTS      time.Time // set by the API when received
}
