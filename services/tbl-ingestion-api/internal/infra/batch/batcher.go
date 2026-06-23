package batch

import (
	"context"
	"errors"
	"hash/fnv"
	"sync"
	"time"
)

type Sender[T any] func(ctx context.Context, batch []T) error
type KeyFunc[T any] func(T) string
type MergeFunc[T any] func(existing, incoming T) T

var ErrClosed = errors.New("batcher is closed")

type Batcher[T any] struct {
	send    Sender[T]
	keyFn   KeyFunc[T]
	mergeFn MergeFunc[T]

	workers int
	batchSz int
	delay   time.Duration

	in chan T

	mu        sync.Mutex
	closed    bool
	closeOnce sync.Once
	closeDone chan struct{}
	closeErr  error

	enqueueWG sync.WaitGroup
	wg        sync.WaitGroup

	errMu sync.Mutex
	err   error
}

// NewBatcher starts the worker pool.
// - buffer: size of the input channel (burst absorption)
// - workers: number of worker goroutines
// - batchSize: max items per flush (e.g., SQS=10, Dynamo=25)
// - maxDelay: time trigger to flush partial batches
// Items are routed deterministically by keyFn(item), so the same key always
// lands on the same worker within a process lifetime.
func NewBatcher[T any](
	send Sender[T],
	keyFn KeyFunc[T],
	mergeFn MergeFunc[T],
	buffer, workers, batchSize int,
	maxDelay time.Duration,
) *Batcher[T] {
	if workers <= 0 {
		panic("workers must be >= 1")
	}
	if batchSize <= 0 {
		panic("batchSize must be >= 1")
	}
	if send == nil {
		panic("send must not be nil")
	}
	if keyFn == nil {
		panic("keyFn must not be nil")
	}
	if mergeFn == nil {
		panic("mergeFn must not be nil")
	}
	b := &Batcher[T]{
		send:      send,
		keyFn:     keyFn,
		mergeFn:   mergeFn,
		workers:   workers,
		batchSz:   batchSize,
		delay:     maxDelay,
		in:        make(chan T, buffer),
		closeDone: make(chan struct{}),
	}
	b.start()
	return b
}

func (b *Batcher[T]) Enqueue(ctx context.Context, item T) error {
	b.mu.Lock()
	if b.closed {
		b.mu.Unlock()
		return ErrClosed
	}
	b.enqueueWG.Add(1)
	b.mu.Unlock()
	defer b.enqueueWG.Done()

	select {
	case b.in <- item:
		return nil
	case <-ctx.Done():
		return ctx.Err()
	}
}

func (b *Batcher[T]) Close() error {
	b.closeOnce.Do(func() {
		b.mu.Lock()
		b.closed = true
		b.mu.Unlock()

		b.enqueueWG.Wait()
		close(b.in)
		b.wg.Wait()

		b.closeErr = b.Err()
		close(b.closeDone)
	})

	<-b.closeDone
	return b.closeErr
}

func (b *Batcher[T]) Err() error {
	b.errMu.Lock()
	defer b.errMu.Unlock()
	return b.err
}

func (b *Batcher[T]) recordError(err error) {
	if err == nil {
		return
	}

	b.errMu.Lock()
	b.err = errors.Join(b.err, err)
	b.errMu.Unlock()
}

func (b *Batcher[T]) start() {
	outs := make([]chan T, b.workers)
	for i := range outs {
		outs[i] = make(chan T, 1024)
	}

	for i := 0; i < b.workers; i++ {
		b.wg.Add(1)
		go b.worker(outs[i])
	}

	// Shard by key so related events are merged by the same worker.
	b.wg.Add(1)
	go func() {
		defer b.wg.Done()
		defer func() {
			for _, ch := range outs {
				close(ch)
			}
		}()

		for it := range b.in {
			outs[b.shard(it)] <- it
		}
	}()
}

func (b *Batcher[T]) shard(it T) int {
	key := b.keyFn(it)
	h := fnv.New32a()
	_, _ = h.Write([]byte(key))
	return int(h.Sum32() % uint32(b.workers))
}

func (b *Batcher[T]) worker(in <-chan T) {
	defer b.wg.Done()
	buf := make(map[string]T, b.batchSz)
	timer := time.NewTimer(b.delay)
	defer timer.Stop()

	flush := func() {
		if len(buf) == 0 {
			return
		}
		items := make([]T, 0, len(buf))
		for _, it := range buf {
			items = append(items, it)
		}
		if err := b.send(context.Background(), items); err != nil {
			b.recordError(err)
		}
		clear(buf)
	}

	for {
		timer.Reset(b.delay)
		select {
		case it, ok := <-in:
			if !ok {
				flush()
				return
			}
			k := b.keyFn(it)
			if existing, ok := buf[k]; ok {
				buf[k] = b.mergeFn(existing, it)
			} else {
				buf[k] = it
			}
			if len(buf) >= b.batchSz {
				if !timer.Stop() {
					select {
					case <-timer.C:
					default:
					}
				}
				flush()
			}
		case <-timer.C:
			flush()
		}
	}
}
