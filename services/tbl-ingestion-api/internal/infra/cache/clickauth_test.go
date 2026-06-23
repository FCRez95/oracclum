package cache

import (
	"context"
	"testing"
)

func TestResolverResolveUsesInitialMap(t *testing.T) {
	r := NewResolver(map[string]string{
		"token-1": "campaign-1",
	})

	campaignID, ok := r.Resolve(context.Background(), "token-1")
	if !ok || campaignID != "campaign-1" {
		t.Fatalf("expected campaign-1, got id=%q ok=%v", campaignID, ok)
	}

	if campaignID, ok := r.Resolve(context.Background(), "missing"); ok || campaignID != "" {
		t.Fatalf("expected missing token to be absent, got id=%q ok=%v", campaignID, ok)
	}
}

func TestResolverNilInitialMapIsEmpty(t *testing.T) {
	r := NewResolver(nil)

	if campaignID, ok := r.Resolve(context.Background(), "token-1"); ok || campaignID != "" {
		t.Fatalf("expected nil initial map to be empty, got id=%q ok=%v", campaignID, ok)
	}
}

func TestResolverSetAddsAndUpdatesMappings(t *testing.T) {
	r := NewResolver(nil)

	r.Set("token-1", "campaign-1")
	if campaignID, ok := r.Resolve(context.Background(), "token-1"); !ok || campaignID != "campaign-1" {
		t.Fatalf("expected inserted mapping, got id=%q ok=%v", campaignID, ok)
	}

	r.Set("token-1", "campaign-2")
	if campaignID, ok := r.Resolve(context.Background(), "token-1"); !ok || campaignID != "campaign-2" {
		t.Fatalf("expected updated mapping, got id=%q ok=%v", campaignID, ok)
	}
}

func TestResolverDeleteRemovesMappings(t *testing.T) {
	r := NewResolver(map[string]string{
		"token-1": "campaign-1",
		"token-2": "campaign-2",
	})

	r.Delete("missing")
	r.Delete("token-1")

	if campaignID, ok := r.Resolve(context.Background(), "token-1"); ok || campaignID != "" {
		t.Fatalf("expected deleted token to be absent, got id=%q ok=%v", campaignID, ok)
	}
	if campaignID, ok := r.Resolve(context.Background(), "token-2"); !ok || campaignID != "campaign-2" {
		t.Fatalf("expected other token to remain, got id=%q ok=%v", campaignID, ok)
	}
}

func TestResolverRefreshReplacesMappings(t *testing.T) {
	r := NewResolver(map[string]string{
		"old-token": "old-campaign",
	})

	r.Refresh(map[string]string{
		"new-token": "new-campaign",
	})

	if campaignID, ok := r.Resolve(context.Background(), "old-token"); ok || campaignID != "" {
		t.Fatalf("expected old token to be absent, got id=%q ok=%v", campaignID, ok)
	}
	if campaignID, ok := r.Resolve(context.Background(), "new-token"); !ok || campaignID != "new-campaign" {
		t.Fatalf("expected refreshed token, got id=%q ok=%v", campaignID, ok)
	}
}

func TestResolverCopiesInputMaps(t *testing.T) {
	initial := map[string]string{"token-1": "campaign-1"}
	r := NewResolver(initial)
	initial["token-1"] = "mutated"

	if campaignID, ok := r.Resolve(context.Background(), "token-1"); !ok || campaignID != "campaign-1" {
		t.Fatalf("expected initial map to be copied, got id=%q ok=%v", campaignID, ok)
	}

	refreshed := map[string]string{"token-2": "campaign-2"}
	r.Refresh(refreshed)
	refreshed["token-2"] = "mutated"

	if campaignID, ok := r.Resolve(context.Background(), "token-2"); !ok || campaignID != "campaign-2" {
		t.Fatalf("expected refreshed map to be copied, got id=%q ok=%v", campaignID, ok)
	}
}
