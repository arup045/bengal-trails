/**
 * queries.ts — All TanStack Query hooks for Bengal Trails.
 *
 * Centralised here so cache keys are consistent and any component
 * can import a hook instead of writing raw fetch() calls.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_BASE, authFetch } from '../utils/api';
import { QK } from './queryClient';

// ── Destinations list ─────────────────────────────────────────────────────────
export function useDestinations(filters: Record<string, string | number> = {}) {
  const params = new URLSearchParams(filters as any).toString();
  return useQuery({
    queryKey: QK.destinations(filters),
    queryFn:  async () => {
      const res = await fetch(`${API_BASE}/destinations?${params}`);
      if (!res.ok) throw new Error('Failed to load destinations');
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });
}

// ── Single destination ────────────────────────────────────────────────────────
export function useDestination(slug: string) {
  return useQuery({
    queryKey: QK.destination(slug),
    queryFn:  async () => {
      const res = await fetch(`${API_BASE}/destinations/${slug}`);
      if (!res.ok) throw new Error('Destination not found');
      return res.json();
    },
    enabled:   !!slug,
    staleTime: 10 * 60 * 1000,
  });
}

// ── Suggestions (search autocomplete) ────────────────────────────────────────
export function useSuggestions(query: string) {
  return useQuery({
    queryKey: QK.suggestions(query),
    queryFn:  async () => {
      if (!query || query.length < 2) return { suggestions: [] };
      const res = await fetch(`${API_BASE}/suggestions?query=${encodeURIComponent(query)}`);
      if (!res.ok) return { suggestions: [] };
      return res.json();
    },
    enabled:   query.length >= 2,
    staleTime: 30 * 1000,    // 30 seconds — near real-time for search
    gcTime:    60 * 1000,
  });
}

// ── Reviews for a destination ─────────────────────────────────────────────────
export function useReviews(slug: string) {
  return useQuery({
    queryKey: QK.reviews(slug),
    queryFn:  async () => {
      const res = await fetch(`${API_BASE}/reviews/${slug}`);
      if (!res.ok) throw new Error('Failed to load reviews');
      return res.json();
    },
    enabled:   !!slug,
    staleTime: 2 * 60 * 1000,
  });
}

// ── User wishlist ─────────────────────────────────────────────────────────────
export function useWishlist() {
  return useQuery({
    queryKey: QK.wishlist(),
    queryFn:  async () => {
      const res = await authFetch('/wishlist');
      if (!res.ok) return { wishlist: [] };
      return res.json();
    },
    staleTime: 2 * 60 * 1000,
  });
}

// ── Admin stats ───────────────────────────────────────────────────────────────
export function useAdminStats(range: string = '30d') {
  return useQuery({
    queryKey: QK.adminStats(range),
    queryFn:  async () => {
      const res = await authFetch(`/admin/stats?range=${range}`);
      if (!res.ok) throw new Error('Failed to load stats');
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });
}

// ── Submit review mutation ────────────────────────────────────────────────────
export function useSubmitReview(destinationSlug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (review: Record<string, any>) => {
      const res = await authFetch('/reviews', {
        method: 'POST',
        body: JSON.stringify({ destinationSlug, ...review }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed'); }
      return res.json();
    },
    onSuccess: () => {
      // Invalidate reviews cache so the list refreshes automatically
      qc.invalidateQueries({ queryKey: QK.reviews(destinationSlug) });
    },
  });
}

// ── Toggle wishlist mutation ──────────────────────────────────────────────────
export function useToggleWishlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ slug, action }: { slug: string; action: 'add' | 'remove' }) => {
      const res = await authFetch(`/wishlist/${action === 'remove' ? 'remove' : ''}`, {
        method: action === 'add' ? 'POST' : 'DELETE',
        body: JSON.stringify({ destinationSlug: slug }),
      });
      if (!res.ok) throw new Error('Wishlist update failed');
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.wishlist() });
    },
  });
}
