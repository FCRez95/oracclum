package http

import (
	"crypto/subtle"
	stdhttp "net/http"
	"strings"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func PublicCORS() gin.HandlerFunc {
	return cors.New(cors.Config{
		AllowAllOrigins:  true,
		AllowMethods:     []string{stdhttp.MethodGet, stdhttp.MethodPost, stdhttp.MethodOptions},
		AllowHeaders:     []string{"Origin", "Content-Type"},
		ExposeHeaders:    []string{"X-Path"},
		AllowCredentials: false,
		MaxAge:           12 * time.Hour,
	})
}

func RequireBearerToken(token string) gin.HandlerFunc {
	return func(c *gin.Context) {
		auth := c.GetHeader("Authorization")
		provided, ok := strings.CutPrefix(auth, "Bearer ")
		if token == "" || !ok || subtle.ConstantTimeCompare([]byte(provided), []byte(token)) != 1 {
			writeUnauthorized(c)
			c.Abort()
			return
		}
		c.Next()
	}
}
