package queue

import (
	"encoding/json"
	"fmt"
	"strconv"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/sqs/types"

	"github.com/FCRez95/tbl-ingestion-api/internal/domain"
)

type clickMsg struct {
	ID            string `json:"id"`
	ClickAuth     string `json:"click_auth"`
	CampaignID    string `json:"campaign_id"`
	TblCampaignID string `json:"tbl_campaign_id"`
	SiteID        string `json:"site_id"`
	AdID          string `json:"ad_id"`
	Step1         string `json:"step_1"`
	Step2         string `json:"step_2"`
	Step3         string `json:"step_3"`
	Checkout      string `json:"checkout"`
	IngestTS      int64  `json:"ingest_ts"`
}

type sqsBatchEntry struct {
	entry types.SendMessageBatchRequestEntry
	click domain.Click
}

func buildSQSBatchEntries(items []domain.Click) ([]sqsBatchEntry, error) {
	entries := make([]sqsBatchEntry, 0, len(items))
	for i, c := range items {
		body, err := json.Marshal(clickMsg{
			ID:            c.ID,
			ClickAuth:     c.ClickAuth,
			CampaignID:    c.CampaignID,
			TblCampaignID: c.TblCampaignID,
			SiteID:        c.SiteID,
			AdID:          c.AdID,
			Step1:         c.Step1,
			Step2:         c.Step2,
			Step3:         c.Step3,
			Checkout:      c.Checkout,
			IngestTS:      c.IngestTS.UnixMilli(),
		})
		if err != nil {
			return nil, fmt.Errorf("marshal: %w", err)
		}

		entries = append(entries, sqsBatchEntry{
			entry: types.SendMessageBatchRequestEntry{
				Id:          aws.String(strconv.Itoa(i)),
				MessageBody: aws.String(string(body)),
			},
			click: c,
		})
	}
	return entries, nil
}
