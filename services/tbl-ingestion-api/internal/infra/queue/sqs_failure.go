package queue

import (
	"context"
	"fmt"
	"log"
	"strings"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/sqs/types"
)

type SQSFailure struct {
	EntryID     string
	ClickID     string
	Code        string
	Message     string
	SenderFault bool
}

type FailureReporter interface {
	ReportSQSFailures(ctx context.Context, failures []SQSFailure)
}

type SQSSendError struct {
	Failures []SQSFailure
	Cause    error
}

func (e *SQSSendError) Error() string {
	if len(e.Failures) == 0 {
		if e.Cause != nil {
			return fmt.Sprintf("sqs batch send failed: %v", e.Cause)
		}
		return "sqs batch send failed"
	}

	first := e.Failures[0]
	return fmt.Sprintf("sqs batch send failed: failed=%d click_ids=%s first_entry_id=%s first_code=%s first_message=%s",
		len(e.Failures), strings.Join(failureClickIDs(e.Failures), ","), first.EntryID, first.Code, first.Message)
}

func (e *SQSSendError) Unwrap() error {
	return e.Cause
}

type logFailureReporter struct{}

func (logFailureReporter) ReportSQSFailures(_ context.Context, failures []SQSFailure) {
	if len(failures) == 0 {
		return
	}

	first := failures[0]
	log.Printf("SQS permanent batch failures (failed=%d click_ids=%s first_entry_id=%s first_code=%s first_msg=%s)",
		len(failures), strings.Join(failureClickIDs(failures), ","), first.EntryID, first.Code, first.Message)
}

func WithSQSFailureReporter(reporter FailureReporter) SQSSinkOption {
	return func(cfg *sqsSinkConfig) {
		if reporter != nil {
			cfg.reporter = reporter
		}
	}
}

func (s sqsBatchSender) finishFailures(ctx context.Context, failures []SQSFailure, cause error) error {
	if len(failures) == 0 {
		return cause
	}
	if s.reporter != nil {
		s.reporter.ReportSQSFailures(ctx, failures)
	}
	return &SQSSendError{
		Failures: append([]SQSFailure(nil), failures...),
		Cause:    cause,
	}
}

func sqsFailureFromResult(entryID, clickID string, failure types.BatchResultErrorEntry) SQSFailure {
	return SQSFailure{
		EntryID:     entryID,
		ClickID:     clickID,
		Code:        aws.ToString(failure.Code),
		Message:     aws.ToString(failure.Message),
		SenderFault: failure.SenderFault,
	}
}

func failureClickIDs(failures []SQSFailure) []string {
	ids := make([]string, 0, len(failures))
	for _, failure := range failures {
		if failure.ClickID != "" {
			ids = append(ids, failure.ClickID)
			continue
		}
		ids = append(ids, "entry:"+failure.EntryID)
	}
	return ids
}
