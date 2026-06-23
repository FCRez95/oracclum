package queue

import (
	"context"
	"time"

	"github.com/aws/aws-sdk-go-v2/service/sqs"

	"github.com/FCRez95/tbl-ingestion-api/internal/domain"
	"github.com/FCRez95/tbl-ingestion-api/internal/infra/batch"
	"github.com/FCRez95/tbl-ingestion-api/internal/usecase"
)

type SQSSinkOption func(*sqsSinkConfig)

type SQSBatchedSink struct {
	b *batch.Batcher[domain.Click]
}

var _ usecase.ClickSink = (*SQSBatchedSink)(nil)

func NewSQSBatchedSink(cli *sqs.Client, queueURL string, opts ...SQSSinkOption) *SQSBatchedSink {
	return newSQSBatchedSink(cli, queueURL, opts...)
}

func newSQSBatchedSink(cli sqsBatchClient, queueURL string, opts ...SQSSinkOption) *SQSBatchedSink {
	cfg := defaultSQSSinkConfig()
	for _, opt := range opts {
		opt(&cfg)
	}

	sender := sqsBatchSender{
		cli:      cli,
		queueURL: queueURL,
		reporter: cfg.reporter,
		retry:    cfg.retry.normalize(),
	}

	b := batch.NewBatcher(
		sender.send,
		func(c domain.Click) string { return c.ID },
		mergeClick,
		4096,                 // input buffer for short ingestion bursts
		30,                   // worker goroutines
		10,                   // SQS SendMessageBatch limit
		150*time.Millisecond, // partial-batch flush interval
	)

	return &SQSBatchedSink{b: b}
}

func (s *SQSBatchedSink) Enqueue(ctx context.Context, c domain.Click) error {
	return s.b.Enqueue(ctx, c)
}

func (s *SQSBatchedSink) Close() error {
	return s.b.Close()
}
