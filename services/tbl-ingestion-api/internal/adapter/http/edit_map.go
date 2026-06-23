package http

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/FCRez95/tbl-ingestion-api/internal/infra/cache"
)

type EditMapHandler struct {
	resolver *cache.Resolver
}

type UpsertInput struct {
	Token      string `json:"token"       binding:"required"`
	CampaignID string `json:"campaign_id" binding:"required"`
}

// RegisterEditMapRoutes registers endpoints to add/update and delete entries in the click_auth map.
func RegisterEditMapRoutes(r gin.IRouter, resolver *cache.Resolver) {
	h := &EditMapHandler{resolver: resolver}
	r.PUT("/clickauth", h.Upsert)
	r.DELETE("/clickauth/:token", h.Delete)
}

func (h *EditMapHandler) Upsert(c *gin.Context) {
	var in UpsertInput
	if err := c.ShouldBindJSON(&in); err != nil {
		writeInvalidRequest(c)
		return
	}
	h.resolver.Set(in.Token, in.CampaignID)
	c.Status(http.StatusNoContent)
}

func (h *EditMapHandler) Delete(c *gin.Context) {
	token := c.Param("token")
	if token == "" {
		writeInvalidRequest(c)
		return
	}
	h.resolver.Delete(token)
	c.Status(http.StatusNoContent)
}
