package cache

import (
	"context"
	"sync/atomic"
)

// Resolver is an in-memory, read-optimized map: click_auth -> campaign_id.
type Resolver struct {
	s atomic.Value // holds map[string]string
}

func NewResolver(initial map[string]string) *Resolver {
	r := &Resolver{}
	if initial == nil {
		initial = map[string]string{}
	}
	r.s.Store(cloneMap(initial))
	return r
}

// Resolve implements the usecase.ClickAuthLookup contract.
func (r *Resolver) Resolve(_ context.Context, token string) (string, bool) {
	m := r.s.Load().(map[string]string)
	v, ok := m[token]
	return v, ok
}

// Refresh swaps the whole map atomically.
func (r *Resolver) Refresh(newMap map[string]string) {
	if newMap == nil {
		newMap = map[string]string{}
	}
	r.s.Store(cloneMap(newMap))
}

// Set performs an upsert of a single mapping using copy-on-write for atomicity.
func (r *Resolver) Set(token, campaignID string) {
	old := r.s.Load().(map[string]string)
	next := make(map[string]string, len(old)+1)
	for k, v := range old {
		next[k] = v
	}
	next[token] = campaignID
	r.s.Store(next)
}

// Delete removes a mapping if present using copy-on-write for atomicity.
func (r *Resolver) Delete(token string) {
	old := r.s.Load().(map[string]string)
	if _, ok := old[token]; !ok {
		return
	}
	next := make(map[string]string, len(old))
	for k, v := range old {
		if k == token {
			continue
		}
		next[k] = v
	}
	r.s.Store(next)
}

func cloneMap(m map[string]string) map[string]string {
	next := make(map[string]string, len(m))
	for k, v := range m {
		next[k] = v
	}
	return next
}
