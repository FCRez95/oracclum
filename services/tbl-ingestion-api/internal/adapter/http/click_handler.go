package http

import (
	"context"
	"errors"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"

	"github.com/FCRez95/tbl-ingestion-api/internal/usecase"
)

type ClickIn struct {
	ID            string `json:"id"              binding:"required"`
	ClickAuth     string `json:"click_auth"      binding:"required"`
	TblCampaignID string `json:"tbl_campaign_id"`
	SiteID        string `json:"site_id"`
	AdID          string `json:"ad_id"`
	Step1         string `json:"step_1"`
	Step2         string `json:"step_2"`
	Step3         string `json:"step_3"`
	Checkout      string `json:"checkout"`
}

type ClickOut struct {
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
	Path          string `json:"path"` // "queued"
}

type ClickHandler struct {
	save *usecase.SaveClick
}

func RegisterRoutes(r gin.IRouter, save *usecase.SaveClick) {
	h := &ClickHandler{save: save}
	r.GET("/health", func(c *gin.Context) { c.String(http.StatusOK, "ok") })
	r.OPTIONS("/clicks", func(c *gin.Context) { c.Status(http.StatusNoContent) })
	r.POST("/clicks", h.Post)
}

func (h *ClickHandler) Post(c *gin.Context) {
	var in ClickIn
	if err := c.ShouldBindJSON(&in); err != nil {
		writeInvalidRequest(c)
		return
	}
	if err := normalizeClickIn(&in); err != nil {
		writeInvalidRequest(c)
		return
	}

	// Short per-request timeout so SQS issues don't hang the client.
	ctx, cancel := context.WithTimeout(c.Request.Context(), 2500*time.Millisecond)
	defer cancel()

	click, err := h.save.Execute(ctx, usecase.SaveInput{
		ID:            in.ID,
		ClickAuth:     in.ClickAuth,
		TblCampaignID: in.TblCampaignID,
		SiteID:        in.SiteID,
		AdID:          in.AdID,
		Step1:         in.Step1,
		Step2:         in.Step2,
		Step3:         in.Step3,
		Checkout:      in.Checkout,
	})

	if err != nil {
		switch {
		case errors.Is(err, usecase.ErrInvalidClickAuth):
			writeInvalidClickAuth(c)
			return
		default:
			writeQueueUnavailable(c)
			return
		}
	}

	// Respond explicitly as async/queued.
	c.Header("X-Path", "queued")

	c.JSON(http.StatusAccepted, ClickOut{
		ID:            click.ID,
		ClickAuth:     click.ClickAuth,
		CampaignID:    click.CampaignID,
		TblCampaignID: click.TblCampaignID,
		SiteID:        click.SiteID,
		AdID:          click.AdID,
		Step1:         click.Step1,
		Step2:         click.Step2,
		Step3:         click.Step3,
		Checkout:      click.Checkout,
		IngestTS:      click.IngestTS.UnixMilli(),
		Path:          "queued",
	})
}
