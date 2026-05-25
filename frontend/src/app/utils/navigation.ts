// navigation.ts — History API (path) navigation for the SPA.
//
// The app moved from hash routing (/#/explore) to real path routing
// (/explore) so search engines can crawl and index every page. Vercel rewrites
// all paths to index.html, so deep links like /explore/darjeeling work.
//
// A backward-compatibility bridge in App.tsx still accepts old `#/...` links
// (and any `location.hash = ...` assignment) and rewrites them to clean paths,
// so already-shared/bookmarked links keep working.

/** Normalize any internal link target to a clean path.
 *  '#/explore' → '/explore' · '/explore' → '/explore' · 'explore' → '/explore' · '#/' → '/' */
export function toPath(target: string): string {
  if (!target) return '/';
  let t = target.trim();
  if (t.startsWith('#')) t = t.slice(1);   // '#/explore' → '/explore', '#' → ''
  if (t === '') return '/';
  if (!t.startsWith('/')) t = '/' + t;
  return t;
}

/** True for URL fragments that carry auth tokens/params and must stay hash-based
 *  (OAuth callback, Supabase recovery/signup, and our own auth pages that read
 *  params from the fragment). The bridge must NOT rewrite these to paths. */
export function isAuthFragment(hash: string): boolean {
  return (
    hash.includes('access_token') ||
    hash.startsWith('#/oauth-success') ||
    hash.startsWith('#/reset-password') ||
    hash.startsWith('#/verify-email')
  );
}

/** SPA navigation: push a clean path and notify the router. */
export function navigate(target: string): void {
  const path = toPath(target);
  const current = window.location.pathname + window.location.search;
  if (path !== current) {
    window.history.pushState({}, '', path);
  }
  // pushState doesn't emit popstate; dispatch one so the router re-resolves.
  window.dispatchEvent(new PopStateEvent('popstate'));
}

/** The path the router should resolve (pathname + querystring, no origin). */
export function currentPath(): string {
  return window.location.pathname + window.location.search;
}
