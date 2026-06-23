package batch

import (
	"context"
	"errors"
	"sort"
	"sync"
	"sync/atomic"
	"testing"
	"time"
)

type testItem struct {
	ID    string
	Value int
}

func keys(items []testItem) []string {
	out := make([]string, 0, len(items))
	for _, it := range items {
		out = append(out, it.ID)
	}
	sort.Strings(out)
	return out
}

type recordingSink struct {
	mu      sync.Mutex
	batches [][]testItem
	notify  chan struct{}
}

func newRecordingSink() *recordingSink {
	return &recordingSink{notify: make(chan struct{}, 16)}
}

func (s *recordingSink) send(_ context.Context, batch []testItem) error {
	s.record(batch)
	return nil
}

func (s *recordingSink) record(batch []testItem) {
	cp := append([]testItem(nil), batch...)
	s.mu.Lock()
	s.batches = append(s.batches, cp)
	s.mu.Unlock()
	select {
	case s.notify <- struct{}{}:
	default:
	}
}

func (s *recordingSink) snapshot() [][]testItem {
	s.mu.Lock()
	defer s.mu.Unlock()

	out := make([][]testItem, len(s.batches))
	for i, batch := range s.batches {
		out[i] = append([]testItem(nil), batch...)
	}
	return out
}

func (s *recordingSink) waitFor(t *testing.T, timeout time.Duration, desc string, condition func([][]testItem) bool) [][]testItem {
	t.Helper()

	deadline := time.NewTimer(timeout)
	defer deadline.Stop()

	for {
		batches := s.snapshot()
		if condition(batches) {
			return batches
		}

		select {
		case <-s.notify:
		case <-deadline.C:
			batches = s.snapshot()
			if condition(batches) {
				return batches
			}
			t.Fatalf("timed out waiting for %s; batches=%+v", desc, batches)
		}
	}
}

func TestBatcherFlushesUniqueItemsBySize(t *testing.T) {
	sink := newRecordingSink()

	b := NewBatcher(
		sink.send,
		func(it testItem) string { return it.ID },
		func(_, incoming testItem) testItem { return incoming },
		16, 1, 3, time.Second,
	)
	defer b.Close()

	for _, it := range []testItem{
		{ID: "a", Value: 1},
		{ID: "b", Value: 2},
		{ID: "c", Value: 3},
	} {
		if err := b.Enqueue(context.Background(), it); err != nil {
			t.Fatalf("enqueue: %v", err)
		}
	}

	batches := sink.waitFor(t, 2*time.Second, "size flush", func(batches [][]testItem) bool {
		return len(batches) == 1
	})
	if len(batches) != 1 {
		t.Fatalf("expected 1 batch, got %d", len(batches))
	}
	if got := len(batches[0]); got != 3 {
		t.Fatalf("expected 3 unique items, got %d", got)
	}
	if got := keys(batches[0]); !equalStrings(got, []string{"a", "b", "c"}) {
		t.Fatalf("unexpected keys: %v", got)
	}
}

func TestBatcherMergesSameKeyWithinWorker(t *testing.T) {
	var merges atomic.Int64
	sink := newRecordingSink()

	b := NewBatcher(
		sink.send,
		func(it testItem) string { return it.ID },
		func(existing, incoming testItem) testItem {
			merges.Add(1)
			if incoming.Value > existing.Value {
				return incoming
			}
			return existing
		},
		16, 1, 2, 50*time.Millisecond,
	)
	defer b.Close()

	_ = b.Enqueue(context.Background(), testItem{ID: "dup", Value: 1})
	_ = b.Enqueue(context.Background(), testItem{ID: "dup", Value: 9})

	batches := sink.waitFor(t, 500*time.Millisecond, "same-key timer flush", func(batches [][]testItem) bool {
		return batchContains(batches, "dup", 9)
	})
	if merges.Load() == 0 {
		t.Fatal("expected mergeFn to be invoked")
	}
	gotBatch := batches[0]
	if len(gotBatch) != 1 {
		t.Fatalf("expected 1 merged item, got %d", len(gotBatch))
	}
	if gotBatch[0].Value != 9 {
		t.Fatalf("expected merged value 9, got %d", gotBatch[0].Value)
	}
}

func TestBatcherMergesSameKeyAcrossMultipleWorkers(t *testing.T) {
	var merges atomic.Int64
	sink := newRecordingSink()

	b := NewBatcher(
		sink.send,
		func(it testItem) string { return it.ID },
		func(existing, incoming testItem) testItem {
			merges.Add(1)
			if incoming.Value > existing.Value {
				return incoming
			}
			return existing
		},
		16, 4, 10, 40*time.Millisecond,
	)
	defer b.Close()

	_ = b.Enqueue(context.Background(), testItem{ID: "dup", Value: 1})
	_ = b.Enqueue(context.Background(), testItem{ID: "other-a", Value: 2})
	_ = b.Enqueue(context.Background(), testItem{ID: "dup", Value: 9})
	_ = b.Enqueue(context.Background(), testItem{ID: "other-b", Value: 3})

	batches := sink.waitFor(t, 500*time.Millisecond, "same-key flush from sharded worker", func(batches [][]testItem) bool {
		return batchContains(batches, "dup", 9)
	})
	if merges.Load() == 0 {
		t.Fatal("expected same-key events to merge with multiple workers configured")
	}

	foundDup := false
	for _, batch := range batches {
		for _, item := range batch {
			if item.ID == "dup" {
				foundDup = true
				if item.Value != 9 {
					t.Fatalf("expected merged dup value 9, got %d", item.Value)
				}
			}
		}
	}

	if !foundDup {
		t.Fatal("expected a flushed item for dup")
	}
}

func TestBatcherCloseFlushesBufferedItems(t *testing.T) {
	var keyCalls atomic.Int64
	sink := newRecordingSink()

	b := NewBatcher(
		sink.send,
		func(it testItem) string {
			keyCalls.Add(1)
			return it.ID
		},
		func(_, incoming testItem) testItem { return incoming },
		16, 1, 10, time.Hour,
	)
	closed := false
	t.Cleanup(func() {
		if !closed {
			b.Close()
		}
	})

	if err := b.Enqueue(context.Background(), testItem{ID: "close-me", Value: 7}); err != nil {
		t.Fatalf("enqueue: %v", err)
	}

	waitUntil(t, 500*time.Millisecond, "item to reach the worker buffer", func() bool {
		return keyCalls.Load() >= 2
	})

	if err := b.Close(); err != nil {
		t.Fatalf("close: %v", err)
	}
	closed = true

	batches := sink.waitFor(t, 500*time.Millisecond, "close flush", func(batches [][]testItem) bool {
		return batchContains(batches, "close-me", 7)
	})
	if len(batches) != 1 || len(batches[0]) != 1 {
		t.Fatalf("expected one flushed buffered item on close, got %+v", batches)
	}
}

func TestBatcherCloseIsIdempotent(t *testing.T) {
	b := NewBatcher(
		func(_ context.Context, _ []testItem) error { return nil },
		func(it testItem) string { return it.ID },
		func(_, incoming testItem) testItem { return incoming },
		16, 1, 10, time.Hour,
	)

	if err := b.Close(); err != nil {
		t.Fatalf("first close: %v", err)
	}
	if err := b.Close(); err != nil {
		t.Fatalf("second close: %v", err)
	}
}

func TestBatcherEnqueueAfterCloseReturnsErrClosed(t *testing.T) {
	b := NewBatcher(
		func(_ context.Context, _ []testItem) error { return nil },
		func(it testItem) string { return it.ID },
		func(_, incoming testItem) testItem { return incoming },
		16, 1, 10, time.Hour,
	)
	if err := b.Close(); err != nil {
		t.Fatalf("close: %v", err)
	}

	err := b.Enqueue(context.Background(), testItem{ID: "late", Value: 1})
	if !errors.Is(err, ErrClosed) {
		t.Fatalf("expected ErrClosed, got %v", err)
	}
}

func TestBatcherCloseDrainsAcceptedQueuedItems(t *testing.T) {
	sink := newRecordingSink()

	b := NewBatcher(
		sink.send,
		func(it testItem) string { return it.ID },
		func(_, incoming testItem) testItem { return incoming },
		32, 1, 100, time.Hour,
	)

	const total = 20
	for i := 0; i < total; i++ {
		item := testItem{ID: string(rune('a' + i)), Value: i}
		if err := b.Enqueue(context.Background(), item); err != nil {
			t.Fatalf("enqueue item %d: %v", i, err)
		}
	}

	if err := b.Close(); err != nil {
		t.Fatalf("close: %v", err)
	}

	seen := make(map[string]bool, total)
	for _, batch := range sink.snapshot() {
		for _, item := range batch {
			seen[item.ID] = true
		}
	}
	if len(seen) != total {
		t.Fatalf("expected %d drained items, got %d; batches=%+v", total, len(seen), sink.snapshot())
	}
}

func TestBatcherCloseReturnsSendErrors(t *testing.T) {
	sendErr := errors.New("send failed")
	b := NewBatcher(
		func(_ context.Context, _ []testItem) error { return sendErr },
		func(it testItem) string { return it.ID },
		func(_, incoming testItem) testItem { return incoming },
		16, 1, 10, time.Hour,
	)

	if err := b.Enqueue(context.Background(), testItem{ID: "x", Value: 1}); err != nil {
		t.Fatalf("enqueue: %v", err)
	}

	err := b.Close()
	if !errors.Is(err, sendErr) {
		t.Fatalf("expected close to return send error, got %v", err)
	}
	if !errors.Is(b.Close(), sendErr) {
		t.Fatalf("expected repeated close to return same send error")
	}
}

func TestBatcherShardIsDeterministicByKey(t *testing.T) {
	b := NewBatcher(
		func(_ context.Context, _ []testItem) error { return nil },
		func(it testItem) string { return it.ID },
		func(existing, _ testItem) testItem { return existing },
		1, 4, 1, time.Second,
	)
	defer b.Close()

	a := b.shard(testItem{ID: "same-key"})
	bucket := b.shard(testItem{ID: "same-key"})
	if a != bucket {
		t.Fatalf("expected same key to map to same worker, got %d and %d", a, bucket)
	}

	emptyA := b.shard(testItem{})
	emptyB := b.shard(testItem{})
	if emptyA != emptyB {
		t.Fatalf("expected empty key to map deterministically, got %d and %d", emptyA, emptyB)
	}
}

func TestBatcherFlushesByTimer(t *testing.T) {
	done := make(chan []testItem, 1)
	send := func(_ context.Context, batch []testItem) error {
		done <- append([]testItem(nil), batch...)
		return nil
	}

	b := NewBatcher(
		send,
		func(it testItem) string { return it.ID },
		func(_, incoming testItem) testItem { return incoming },
		16, 1, 10, 30*time.Millisecond,
	)
	defer b.Close()

	if err := b.Enqueue(context.Background(), testItem{ID: "x", Value: 1}); err != nil {
		t.Fatalf("enqueue: %v", err)
	}

	select {
	case batch := <-done:
		if len(batch) != 1 || batch[0].ID != "x" {
			t.Fatalf("unexpected batch: %+v", batch)
		}
	case <-time.After(500 * time.Millisecond):
		t.Fatal("timed out waiting for timer flush")
	}
}

func TestBatcherClearsBufferAfterSendError(t *testing.T) {
	var (
		mu       sync.Mutex
		attempts [][]testItem
		done     = make(chan struct{}, 2)
	)
	send := func(_ context.Context, batch []testItem) error {
		mu.Lock()
		attempts = append(attempts, append([]testItem(nil), batch...))
		mu.Unlock()
		select {
		case done <- struct{}{}:
		default:
		}
		return errors.New("boom")
	}

	b := NewBatcher(
		send,
		func(it testItem) string { return it.ID },
		func(_, incoming testItem) testItem { return incoming },
		16, 1, 2, time.Second,
	)
	defer b.Close()

	_ = b.Enqueue(context.Background(), testItem{ID: "a", Value: 1})
	_ = b.Enqueue(context.Background(), testItem{ID: "b", Value: 2})
	<-done // first flush by size

	_ = b.Enqueue(context.Background(), testItem{ID: "c", Value: 3})
	_ = b.Enqueue(context.Background(), testItem{ID: "d", Value: 4})
	<-done // second flush by size

	mu.Lock()
	defer mu.Unlock()
	if len(attempts) < 2 {
		t.Fatalf("expected 2 send attempts, got %d", len(attempts))
	}
	if got := keys(attempts[0]); !equalStrings(got, []string{"a", "b"}) {
		t.Fatalf("unexpected first batch keys: %v", got)
	}
	if got := keys(attempts[1]); !equalStrings(got, []string{"c", "d"}) {
		t.Fatalf("unexpected second batch keys: %v", got)
	}
}

func TestNewBatcherPanicsOnNilCallbacks(t *testing.T) {
	send := func(_ context.Context, _ []testItem) error { return nil }

	assertPanics(t, func() {
		_ = NewBatcher[testItem](nil, func(it testItem) string { return it.ID }, func(a, _ testItem) testItem { return a }, 1, 1, 1, time.Second)
	})
	assertPanics(t, func() {
		_ = NewBatcher[testItem](send, nil, func(a, _ testItem) testItem { return a }, 1, 1, 1, time.Second)
	})
	assertPanics(t, func() {
		_ = NewBatcher[testItem](send, func(it testItem) string { return it.ID }, nil, 1, 1, 1, time.Second)
	})
}

func assertPanics(t *testing.T, fn func()) {
	t.Helper()
	defer func() {
		if recover() == nil {
			t.Fatal("expected panic")
		}
	}()
	fn()
}

func waitUntil(t *testing.T, timeout time.Duration, desc string, condition func() bool) {
	t.Helper()

	deadline := time.NewTimer(timeout)
	defer deadline.Stop()
	ticker := time.NewTicker(5 * time.Millisecond)
	defer ticker.Stop()

	for {
		if condition() {
			return
		}

		select {
		case <-ticker.C:
		case <-deadline.C:
			if condition() {
				return
			}
			t.Fatalf("timed out waiting for %s", desc)
		}
	}
}

func batchContains(batches [][]testItem, id string, value int) bool {
	for _, batch := range batches {
		for _, item := range batch {
			if item.ID == id && item.Value == value {
				return true
			}
		}
	}
	return false
}

func equalStrings(a, b []string) bool {
	if len(a) != len(b) {
		return false
	}
	for i := range a {
		if a[i] != b[i] {
			return false
		}
	}
	return true
}
