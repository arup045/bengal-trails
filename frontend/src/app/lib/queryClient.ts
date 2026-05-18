import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:           5 * 60 * 1000,
      gcTime:              10 * 60 * 1000,
      retry:               2,
      refetchOnWindowFocus: false,
    },
  },
});

export const QK = {
  destinations: (f?: object) => ['destinations', f ?? {}],
  destination:  (slug: string) => ['destination', slug],
  suggestions:  (q: string) => ['suggestions', q],
  userProfile:  () => ['user', 'profile'],
  reviews:      (slug: string) => ['reviews', slug],
  festivals:    () => ['festivals'],
  wishlist:     () => ['wishlist'],
  adminStats:   (range: string) => ['admin', 'stats', range],
};
