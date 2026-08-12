/**
 * api.ts — Central API helper for Bengal Trails
 *
 * Security model:
 *   - Access token  → stored in MEMORY only (module variable). Never touches localStorage.
 *                     XSS cannot steal it because it isn't persisted across reloads.
 *   - Refresh token → stored in BOTH httpOnly cookie AND localStorage.
 *                     Cookie is used when first-party (subdomain setup).
 *                     localStorage is used when third-party cookies are blocked
 *                     (Vercel ↔ Render cross-domain — the common case).
 *                     This is the standard pattern for cross-domain SPAs.
 *
 * On page refresh the access token is gone from memory, so on app mount AuthContext
 * calls POST /auth/refresh with the refresh token to silently restore the session.
 */

// API base URL — hardened so a misconfigured VITE_API_BASE can't take the whole
// site down. On a deployed (https) page we IGNORE a missing / localhost / http://
// value (those cause "Failed to fetch" via mixed-content or an unreachable host)
// and use the production API instead. Dev still uses localhost.
import { setApiDown as markApiDown, setApiUp as markApiUp } from './connection';

const PROD_API = 'https://gobro-api.onrender.com/api';
function resolveApiBase(): string {
  let env = (import.meta.env.VITE_API_BASE as string | undefined)?.trim().replace(/\/+$/, '');
  const onHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
  if (onHttps && (!env || env.startsWith('http://') || /localhost|127\.0\.0\.1/.test(env))) {
    return PROD_API; // broken/unsafe value on a live site → force the real API
  }
  if (!env) return import.meta.env.DEV ? 'http://localhost:3000/api' : PROD_API;
  // The backend mounts EVERY route under /api. If VITE_API_BASE omits the /api
  // suffix (a very common mistake) every call would 404 — so append it for any
  // host that doesn't already end in /api. Fixes food/festivals, OAuth, admin login.
  if (!/\/api$/i.test(env)) env += '/api';
  return env;
}
export const API_BASE = resolveApiBase();
// One-time visibility so any misconfig is obvious in DevTools → Console.
if (typeof window !== 'undefined' && !import.meta.env.DEV) {
  // eslint-disable-next-line no-console
  console.info('[Bengal Trails] API base:', API_BASE);
}

const REFRESH_TOKEN_KEY = 'bt_refresh_token';

// ── In-memory access token ────────────────────────────────────────────────────
let _accessToken: string | null = null;

export const getToken   = ()                  => _accessToken;
export const setToken   = (t: string | null)  => { _accessToken = t; };
export const clearToken = ()                  => { _accessToken = null; };

// ── localStorage refresh token ────────────────────────────────────────────────
// The refresh token allows getting a new access token without re-login.
// Stored in localStorage because cross-domain cookies (Vercel→Render) are blocked
// by modern browsers (Safari ITP, Firefox ETP, Chrome incognito).
export const getRefreshToken   = (): string | null => {
  try { return localStorage.getItem(REFRESH_TOKEN_KEY); } catch { return null; }
};
export const setRefreshToken   = (t: string | null) => {
  try {
    if (t) localStorage.setItem(REFRESH_TOKEN_KEY, t);
    else   localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch { /* localStorage unavailable */ }
};
export const clearRefreshToken = () => setRefreshToken(null);

export const authHeaders = (): Record<string, string> => ({
  'Content-Type': 'application/json',
  ...(_accessToken ? { Authorization: `Bearer ${_accessToken}` } : {}),
});

// ── Silent token refresh ───────────────────────────────────────────────────────
// Sends the refresh token from localStorage in the body (works cross-domain).
// Also sends the httpOnly cookie via credentials:'include' (works same-domain).
// Backend accepts either source. Returns the new access token or null.
let _refreshInFlight: Promise<string | null> | null = null;

export async function tryRefresh(): Promise<string | null> {
  // De-duplicate concurrent refresh attempts (e.g. multiple parallel 401s)
  if (_refreshInFlight) return _refreshInFlight;

  _refreshInFlight = (async () => {
    try {
      const storedRefresh = getRefreshToken();
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',   // ← sends httpOnly cookie if browser allows
        body: JSON.stringify(storedRefresh ? { refresh_token: storedRefresh } : {}),
      });
      if (!res.ok) {
        // Refresh failed — clear stale token so we don't keep retrying
        clearRefreshToken();
        return null;
      }
      const data = await res.json();
      const newAccess  = data?.session?.access_token  || data?.session?.accessToken;
      const newRefresh = data?.session?.refresh_token || data?.session?.refreshToken;
      if (!newAccess) return null;
      setToken(newAccess);
      // Backend rotates the refresh token on every use — store the new one
      if (newRefresh) setRefreshToken(newRefresh);
      return newAccess;
    } catch {
      return null;
    } finally {
      setTimeout(() => { _refreshInFlight = null; }, 0);
    }
  })();

  return _refreshInFlight;
}

// ── Cold-start resilience ─────────────────────────────────────────────────────
// The API runs on Render's free tier, which SLEEPS after ~15 min idle. The first
// request after sleep either hangs ~20-40s while the container boots, or the edge
// returns 502/503/504 until the app is up. Without handling, that first call
// throws and the page shows a blank/error state — the #1 reason the site "looks
// broken" to a visitor who arrives when it's cold. So we transparently retry
// transient failures (gateway errors + network drops + our own timeout) with
// backoff until the server wakes, showing the calm ConnectionBanner meanwhile.
const RETRYABLE_STATUS = new Set([502, 503, 504, 522, 523, 524, 408]);
const MAX_ATTEMPTS = 5;
const PER_ATTEMPT_TIMEOUT_MS = 30_000;   // aborts a hung request so we can retry a now-booting server
const BACKOFF_MS = [1500, 3000, 5000, 8000];

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// fetch with an abort-based timeout, unless the caller supplied its own signal.
async function fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
  if (init.signal) return fetch(url, init);
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), PER_ATTEMPT_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(id);
  }
}

// ── authFetch — authenticated fetch with cold-start retry + 401 refresh ───────
export async function authFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const isAbsolute = /^https?:\/\//.test(path);
  const url = isAbsolute ? path : `${API_BASE}${path.startsWith('/') ? path : '/' + path}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string> || {}),
  };
  if (_accessToken) headers['Authorization'] = `Bearer ${_accessToken}`;

  const reqInit: RequestInit = { ...init, headers, credentials: 'include' };

  let res: Response | null = null;
  let lastErr: unknown = null;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      res = await fetchWithTimeout(url, reqInit);
    } catch (e) {
      // Network failure or our timeout abort → server likely still cold.
      lastErr = e;
      res = null;
      markApiDown();
      if (attempt < MAX_ATTEMPTS - 1) { await sleep(BACKOFF_MS[Math.min(attempt, BACKOFF_MS.length - 1)]); continue; }
      throw e;
    }

    // Gateway/boot errors → retry until the container wakes.
    if (RETRYABLE_STATUS.has(res.status) && attempt < MAX_ATTEMPTS - 1) {
      markApiDown();
      await sleep(BACKOFF_MS[Math.min(attempt, BACKOFF_MS.length - 1)]);
      continue;
    }

    // Got a real application response (2xx/4xx/5xx from our app).
    if (!RETRYABLE_STATUS.has(res.status)) markApiUp();
    break;
  }

  if (!res) throw lastErr ?? new Error('Network error');

  // On 401 — silently try to refresh once, then retry the request.
  if (res.status === 401) {
    const newToken = await tryRefresh();
    if (newToken) {
      headers['Authorization'] = `Bearer ${newToken}`;
      res = await fetchWithTimeout(url, { ...reqInit, headers });
    }
  }

  return res;
}

// ── apiJson — parse JSON, throw on non-2xx ────────────────────────────────────
export async function apiJson<T = any>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await authFetch(path, init);
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try { const j = await res.json(); msg = j.error || j.message || msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

// ── Search analytics ──────────────────────────────────────────────────────────
// Fire-and-forget: records a COMMITTED search so the admin dashboard can show
// real top queries. Never blocks or throws — analytics must not affect search UX.
let _lastTrackedSearch = '';
export function trackSearch(query: string): void {
  const q = (query || '').trim();
  if (q.length < 2) return;
  // De-dupe identical consecutive searches (e.g. re-mounts firing the same query).
  if (q.toLowerCase() === _lastTrackedSearch) return;
  _lastTrackedSearch = q.toLowerCase();
  try {
    fetch(`${API_BASE}/search/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(_accessToken ? { Authorization: `Bearer ${_accessToken}` } : {}),
      },
      body: JSON.stringify({ query: q }),
      credentials: 'include',
      keepalive: true,
    }).catch(() => {});
  } catch { /* never throw */ }
}

// ── Image upload helpers ──────────────────────────────────────────────────────
export async function uploadImage(file: File): Promise<{ url: string; publicId: string }> {
  const formData = new FormData();
  formData.append('image', file);
  const headers: Record<string, string> = {};
  if (_accessToken) headers['Authorization'] = `Bearer ${_accessToken}`;
  const res = await fetch(`${API_BASE}/uploads/image`, {
    method: 'POST',
    headers,
    body: formData,
    credentials: 'include',
  });
  if (!res.ok) {
    let msg = `Upload failed (${res.status})`;
    try { const j = await res.json(); msg = j.error || msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export async function uploadImages(files: File[]): Promise<Array<{ url: string; publicId: string }>> {
  const formData = new FormData();
  files.forEach(f => formData.append('images', f));
  const headers: Record<string, string> = {};
  if (_accessToken) headers['Authorization'] = `Bearer ${_accessToken}`;
  const res = await fetch(`${API_BASE}/uploads/multiple`, {
    method: 'POST',
    headers,
    body: formData,
    credentials: 'include',
  });
  if (!res.ok) {
    let msg = `Upload failed (${res.status})`;
    try { const j = await res.json(); msg = j.error || msg; } catch {}
    throw new Error(msg);
  }
  const data = await res.json();
  return data.images || data;
}
