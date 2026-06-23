package queue

import (
	"context"
	"encoding/json"
	"errors"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/sqs"
	"github.com/aws/aws-sdk-go-v2/service/sqs/types"

	"github.com/FCRez95/tbl-ingestion-api/internal/domain"
)

func TestSQSSenderSendsSuccessfulBatchOnce(t *testing.T) {
	fake := &fakeSQSBatchClient{}
	sender := testSQSSender(fake, nil)

	if err := sender.send(context.Background(), []domain.Click{
		testClick("click-a"),
		testClick("click-b"),
	}); err != nil {
		t.Fatalf("send: %v", err)
	}

	calls := fake.snapshotCalls()
	if len(calls) != 1 {
		t.Fatalf("expected 1 SQS call, got %d", len(calls))
	}
	assertStrings(t, clickIDsFromEntries(t, calls[0]), []string{"click-a", "click-b"})
}

func TestSQSSenderRetriesFullRequestError(t *testing.T) {
	temporaryErr := errors.New("temporary network error")
	fake := &fakeSQSBatchClient{
		responses: []fakeSQSResponse{
			{err: temporaryErr},
			{},
		},
	}
	sender := testSQSSender(fake, nil)

	if err := sender.send(context.Background(), []domain.Click{
		testClick("click-a"),
		testClick("click-b"),
	}); err != nil {
		t.Fatalf("send: %v", err)
	}

	calls := fake.snapshotCalls()
	if len(calls) != 2 {
		t.Fatalf("expected 2 SQS calls, got %d", len(calls))
	}
	assertStrings(t, clickIDsFromEntries(t, calls[0]), []string{"click-a", "click-b"})
	assertStrings(t, clickIDsFromEntries(t, calls[1]), []string{"click-a", "click-b"})
}

func TestSQSSenderRetriesOnlyFailedPartialEntries(t *testing.T) {
	reporter := &recordingFailureReporter{}
	fake := &fakeSQSBatchClient{
		responses: []fakeSQSResponse{
			{out: &sqs.SendMessageBatchOutput{
				Failed: []types.BatchResultErrorEntry{
					failedBatchEntry("1", "ThrottlingException", "slow down", false),
				},
			}},
			{},
		},
	}
	sender := testSQSSender(fake, reporter)

	if err := sender.send(context.Background(), []domain.Click{
		testClick("click-a"),
		testClick("click-b"),
		testClick("click-c"),
	}); err != nil {
		t.Fatalf("send: %v", err)
	}

	calls := fake.snapshotCalls()
	if len(calls) != 2 {
		t.Fatalf("expected 2 SQS calls, got %d", len(calls))
	}
	assertStrings(t, entryIDs(calls[0]), []string{"0", "1", "2"})
	assertStrings(t, entryIDs(calls[1]), []string{"1"})
	assertStrings(t, clickIDsFromEntries(t, calls[1]), []string{"click-b"})

	if failures := reporter.snapshot(); len(failures) != 0 {
		t.Fatalf("expected no permanent failures, got %+v", failures)
	}
}

func TestSQSSenderDoesNotRetrySenderFault(t *testing.T) {
	reporter := &recordingFailureReporter{}
	fake := &fakeSQSBatchClient{
		responses: []fakeSQSResponse{
			{out: &sqs.SendMessageBatchOutput{
				Failed: []types.BatchResultErrorEntry{
					failedBatchEntry("1", "InvalidMessageContents", "bad message", true),
				},
			}},
		},
	}
	sender := testSQSSender(fake, reporter)

	err := sender.send(context.Background(), []domain.Click{
		testClick("click-a"),
		testClick("click-b"),
	})
	var sendErr *SQSSendError
	if !errors.As(err, &sendErr) {
		t.Fatalf("expected SQSSendError, got %v", err)
	}
	if !strings.Contains(err.Error(), "click-b") {
		t.Fatalf("expected error to include failed click id, got %q", err.Error())
	}

	if calls := fake.snapshotCalls(); len(calls) != 1 {
		t.Fatalf("expected no retry for sender fault, got %d calls", len(calls))
	}

	failures := reporter.snapshot()
	if len(failures) != 1 {
		t.Fatalf("expected 1 reported failure, got %+v", failures)
	}
	if failures[0].ClickID != "click-b" || !failures[0].SenderFault {
		t.Fatalf("unexpected reported failure: %+v", failures[0])
	}
}

func TestSQSSenderExhaustedRetriesReportsFailedClickIDs(t *testing.T) {
	reporter := &recordingFailureReporter{}
	fake := &fakeSQSBatchClient{
		responses: []fakeSQSResponse{
			{out: &sqs.SendMessageBatchOutput{Failed: []types.BatchResultErrorEntry{
				failedBatchEntry("0", "ServiceUnavailable", "try later", false),
			}}},
			{out: &sqs.SendMessageBatchOutput{Failed: []types.BatchResultErrorEntry{
				failedBatchEntry("0", "ServiceUnavailable", "still unavailable", false),
			}}},
			{out: &sqs.SendMessageBatchOutput{Failed: []types.BatchResultErrorEntry{
				failedBatchEntry("0", "ServiceUnavailable", "still unavailable", false),
			}}},
		},
	}
	sender := testSQSSender(fake, reporter)

	err := sender.send(context.Background(), []domain.Click{testClick("click-a")})
	var sendErr *SQSSendError
	if !errors.As(err, &sendErr) {
		t.Fatalf("expected SQSSendError, got %v", err)
	}
	if !strings.Contains(err.Error(), "click-a") || !strings.Contains(err.Error(), "ServiceUnavailable") {
		t.Fatalf("expected useful final error, got %q", err.Error())
	}

	calls := fake.snapshotCalls()
	if len(calls) != 3 {
		t.Fatalf("expected 3 attempts, got %d", len(calls))
	}
	for i, call := range calls {
		assertStrings(t, entryIDs(call), []string{"0"})
		if got := clickIDsFromEntries(t, call); len(got) != 1 || got[0] != "click-a" {
			t.Fatalf("unexpected attempt %d click ids: %v", i+1, got)
		}
	}

	failures := reporter.snapshot()
	if len(failures) != 1 {
		t.Fatalf("expected 1 reported failure, got %+v", failures)
	}
	if failures[0].ClickID != "click-a" || failures[0].Code != "ServiceUnavailable" {
		t.Fatalf("unexpected reported failure: %+v", failures[0])
	}
}

type fakeSQSResponse struct {
	out *sqs.SendMessageBatchOutput
	err error
}

type fakeSQSBatchClient struct {
	mu        sync.Mutex
	responses []fakeSQSResponse
	calls     [][]types.SendMessageBatchRequestEntry
}

func (f *fakeSQSBatchClient) SendMessageBatch(_ context.Context, input *sqs.SendMessageBatchInput, _ ...func(*sqs.Options)) (*sqs.SendMessageBatchOutput, error) {
	f.mu.Lock()
	defer f.mu.Unlock()

	f.calls = append(f.calls, cloneEntries(input.Entries))
	idx := len(f.calls) - 1
	if idx >= len(f.responses) {
		return &sqs.SendMessageBatchOutput{}, nil
	}
	response := f.responses[idx]
	if response.out == nil && response.err == nil {
		return &sqs.SendMessageBatchOutput{}, nil
	}
	return response.out, response.err
}

func (f *fakeSQSBatchClient) snapshotCalls() [][]types.SendMessageBatchRequestEntry {
	f.mu.Lock()
	defer f.mu.Unlock()

	out := make([][]types.SendMessageBatchRequestEntry, len(f.calls))
	for i, call := range f.calls {
		out[i] = cloneEntries(call)
	}
	return out
}

type recordingFailureReporter struct {
	mu       sync.Mutex
	failures []SQSFailure
}

func (r *recordingFailureReporter) ReportSQSFailures(_ context.Context, failures []SQSFailure) {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.failures = append(r.failures, failures...)
}

func (r *recordingFailureReporter) snapshot() []SQSFailure {
	r.mu.Lock()
	defer r.mu.Unlock()
	return append([]SQSFailure(nil), r.failures...)
}

type noopFailureReporter struct{}

func (noopFailureReporter) ReportSQSFailures(_ context.Context, _ []SQSFailure) {}

func testSQSSender(cli sqsBatchClient, reporter FailureReporter) sqsBatchSender {
	if reporter == nil {
		reporter = noopFailureReporter{}
	}
	return sqsBatchSender{
		cli:      cli,
		queueURL: "https://sqs.us-east-1.amazonaws.com/123/clicks",
		reporter: reporter,
		retry: sqsRetryPolicy{
			maxAttempts:    3,
			attemptTimeout: time.Second,
		},
	}
}

func testClick(id string) domain.Click {
	return domain.Click{
		ID:            id,
		ClickAuth:     "auth-" + id,
		CampaignID:    "campaign-" + id,
		TblCampaignID: "tbl-" + id,
		SiteID:        "site-" + id,
		AdID:          "ad-" + id,
		Step1:         "1",
		Step2:         "0",
		Step3:         "0",
		Checkout:      "0",
		IngestTS:      time.UnixMilli(1000),
	}
}

func failedBatchEntry(id, code, message string, senderFault bool) types.BatchResultErrorEntry {
	return types.BatchResultErrorEntry{
		Id:          aws.String(id),
		Code:        aws.String(code),
		Message:     aws.String(message),
		SenderFault: senderFault,
	}
}

func cloneEntries(entries []types.SendMessageBatchRequestEntry) []types.SendMessageBatchRequestEntry {
	out := make([]types.SendMessageBatchRequestEntry, len(entries))
	for i, entry := range entries {
		out[i] = entry
		out[i].Id = aws.String(aws.ToString(entry.Id))
		out[i].MessageBody = aws.String(aws.ToString(entry.MessageBody))
	}
	return out
}

func entryIDs(entries []types.SendMessageBatchRequestEntry) []string {
	ids := make([]string, 0, len(entries))
	for _, entry := range entries {
		ids = append(ids, aws.ToString(entry.Id))
	}
	return ids
}

func clickIDsFromEntries(t *testing.T, entries []types.SendMessageBatchRequestEntry) []string {
	t.Helper()

	ids := make([]string, 0, len(entries))
	for _, entry := range entries {
		var msg clickMsg
		if err := json.Unmarshal([]byte(aws.ToString(entry.MessageBody)), &msg); err != nil {
			t.Fatalf("unmarshal message body: %v", err)
		}
		ids = append(ids, msg.ID)
	}
	return ids
}

func assertStrings(t *testing.T, got, want []string) {
	t.Helper()
	if len(got) != len(want) {
		t.Fatalf("expected %v, got %v", want, got)
	}
	for i := range got {
		if got[i] != want[i] {
			t.Fatalf("expected %v, got %v", want, got)
		}
	}
}
