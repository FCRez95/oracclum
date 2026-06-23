package queue

import (
	"context"
	"log"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/sqs"
	"github.com/aws/aws-sdk-go-v2/service/sqs/types"

	"github.com/FCRez95/tbl-ingestion-api/internal/domain"
)

type sqsBatchClient interface {
	SendMessageBatch(ctx context.Context, input *sqs.SendMessageBatchInput, optFns ...func(*sqs.Options)) (*sqs.SendMessageBatchOutput, error)
}

type sqsSinkConfig struct {
	reporter FailureReporter
	retry    sqsRetryPolicy
}

type sqsRetryPolicy struct {
	maxAttempts    int
	backoffs       []time.Duration
	attemptTimeout time.Duration
}

type sqsBatchSender struct {
	cli      sqsBatchClient
	queueURL string
	reporter FailureReporter
	retry    sqsRetryPolicy
}

func defaultSQSSinkConfig() sqsSinkConfig {
	return sqsSinkConfig{
		reporter: logFailureReporter{},
		retry: sqsRetryPolicy{
			maxAttempts:    3,
			backoffs:       []time.Duration{100 * time.Millisecond, 250 * time.Millisecond, 500 * time.Millisecond},
			attemptTimeout: 5 * time.Second,
		},
	}
}

func withSQSRetryPolicy(policy sqsRetryPolicy) SQSSinkOption {
	return func(cfg *sqsSinkConfig) {
		cfg.retry = policy
	}
}

func (p sqsRetryPolicy) normalize() sqsRetryPolicy {
	if p.maxAttempts <= 0 {
		p.maxAttempts = 1
	}
	if p.attemptTimeout <= 0 {
		p.attemptTimeout = 5 * time.Second
	}
	return p
}

func (s sqsBatchSender) send(ctx context.Context, items []domain.Click) error {
	pending, err := buildSQSBatchEntries(items)
	if err != nil {
		return err
	}

	var permanent []SQSFailure
	for attempt := 1; len(pending) > 0 && attempt <= s.retry.maxAttempts; attempt++ {
		out, err := s.sendAttempt(ctx, pending)
		if err != nil {
			log.Printf("SQS SendMessageBatch error (entries=%d attempt=%d/%d): %v",
				len(pending), attempt, s.retry.maxAttempts, err)
			if attempt == s.retry.maxAttempts {
				return s.finishFailures(ctx, append(permanent, requestFailures(pending, err)...), err)
			}
			if err := s.waitBeforeRetry(ctx, attempt); err != nil {
				return err
			}
			continue
		}

		if out == nil || len(out.Failed) == 0 {
			if len(permanent) > 0 {
				return s.finishFailures(ctx, permanent, nil)
			}
			return nil
		}

		retryable, nonRetryable, retryFailures := classifyBatchFailures(pending, out.Failed)
		permanent = append(permanent, nonRetryable...)
		if len(retryable) == 0 {
			if len(permanent) > 0 {
				return s.finishFailures(ctx, permanent, nil)
			}
			return nil
		}
		if attempt == s.retry.maxAttempts {
			return s.finishFailures(ctx, append(permanent, retryFailures...), nil)
		}

		pending = retryable
		if err := s.waitBeforeRetry(ctx, attempt); err != nil {
			return err
		}
	}

	if len(permanent) > 0 {
		return s.finishFailures(ctx, permanent, nil)
	}
	return nil
}

func (s sqsBatchSender) sendAttempt(ctx context.Context, entries []sqsBatchEntry) (*sqs.SendMessageBatchOutput, error) {
	requestEntries := make([]types.SendMessageBatchRequestEntry, 0, len(entries))
	for _, e := range entries {
		requestEntries = append(requestEntries, e.entry)
	}

	attemptCtx, cancel := context.WithTimeout(ctx, s.retry.attemptTimeout)
	defer cancel()

	return s.cli.SendMessageBatch(attemptCtx, &sqs.SendMessageBatchInput{
		QueueUrl: aws.String(s.queueURL),
		Entries:  requestEntries,
	})
}

func (s sqsBatchSender) waitBeforeRetry(ctx context.Context, attempt int) error {
	delay := retryBackoff(s.retry.backoffs, attempt)
	if delay <= 0 {
		return nil
	}

	timer := time.NewTimer(delay)
	defer timer.Stop()

	select {
	case <-timer.C:
		return nil
	case <-ctx.Done():
		return ctx.Err()
	}
}

func classifyBatchFailures(entries []sqsBatchEntry, failures []types.BatchResultErrorEntry) ([]sqsBatchEntry, []SQSFailure, []SQSFailure) {
	byID := make(map[string]sqsBatchEntry, len(entries))
	for _, entry := range entries {
		byID[aws.ToString(entry.entry.Id)] = entry
	}

	retryableEntries := make([]sqsBatchEntry, 0, len(failures))
	nonRetryableFailures := make([]SQSFailure, 0)
	retryableFailures := make([]SQSFailure, 0, len(failures))
	for _, failure := range failures {
		entryID := aws.ToString(failure.Id)
		entry, ok := byID[entryID]
		reported := sqsFailureFromResult(entryID, entry.click.ID, failure)
		if !ok || failure.SenderFault {
			nonRetryableFailures = append(nonRetryableFailures, reported)
			continue
		}

		retryableEntries = append(retryableEntries, entry)
		retryableFailures = append(retryableFailures, reported)
	}

	return retryableEntries, nonRetryableFailures, retryableFailures
}

func requestFailures(entries []sqsBatchEntry, err error) []SQSFailure {
	failures := make([]SQSFailure, 0, len(entries))
	for _, entry := range entries {
		failures = append(failures, SQSFailure{
			EntryID: aws.ToString(entry.entry.Id),
			ClickID: entry.click.ID,
			Code:    "request_error",
			Message: err.Error(),
		})
	}
	return failures
}

func retryBackoff(backoffs []time.Duration, attempt int) time.Duration {
	if len(backoffs) == 0 {
		return 0
	}
	idx := attempt - 1
	if idx >= len(backoffs) {
		idx = len(backoffs) - 1
	}
	return backoffs[idx]
}
