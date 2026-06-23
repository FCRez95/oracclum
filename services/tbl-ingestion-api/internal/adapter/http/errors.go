package http

import (
	stdhttp "net/http"

	"github.com/gin-gonic/gin"
)

const (
	errorCodeInvalidRequest   = "invalid_request"
	errorCodeInvalidClickAuth = "invalid_click_auth"
	errorCodeQueueUnavailable = "queue_unavailable"
	errorCodeUnauthorized     = "unauthorized"
)

type apiErrorSpec struct {
	status  int
	code    string
	message string
}

var (
	apiErrorInvalidRequest = apiErrorSpec{
		status:  stdhttp.StatusBadRequest,
		code:    errorCodeInvalidRequest,
		message: "invalid request body",
	}
	apiErrorInvalidClickAuth = apiErrorSpec{
		status:  stdhttp.StatusBadRequest,
		code:    errorCodeInvalidClickAuth,
		message: "invalid click_auth",
	}
	apiErrorQueueUnavailable = apiErrorSpec{
		status:  stdhttp.StatusServiceUnavailable,
		code:    errorCodeQueueUnavailable,
		message: "unable to queue click event",
	}
	apiErrorUnauthorized = apiErrorSpec{
		status:  stdhttp.StatusUnauthorized,
		code:    errorCodeUnauthorized,
		message: "admin authorization required",
	}
)

type apiError struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

type errorResponse struct {
	Error apiError `json:"error"`
}

func writeAPIError(c *gin.Context, spec apiErrorSpec) {
	c.JSON(spec.status, errorResponse{
		Error: apiError{
			Code:    spec.code,
			Message: spec.message,
		},
	})
}

func writeInvalidRequest(c *gin.Context) {
	writeAPIError(c, apiErrorInvalidRequest)
}

func writeInvalidClickAuth(c *gin.Context) {
	writeAPIError(c, apiErrorInvalidClickAuth)
}

func writeQueueUnavailable(c *gin.Context) {
	writeAPIError(c, apiErrorQueueUnavailable)
}

func writeUnauthorized(c *gin.Context) {
	writeAPIError(c, apiErrorUnauthorized)
}
