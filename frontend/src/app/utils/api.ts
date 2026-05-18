/**
 * api.ts — Central API helper for Bengal Trails
 *
 * Security model (Phase 1 upgrade):
 *   - Access token  → stored in MEMORY only (module variable). Never touches localStorage.
 *                     XSS cannot steal it because there is no persistent storage.
 *   - Refresh token → stored in httpOnly cookie by the backend.
 *                     JS cannot read it at all. Sent automatically with credentials:'include'.
 *
 * On page refresh the access token is gone from memory, so on app mount AuthContext
 * calls POST /auth/refresh (with the httpOnly cookie) to silently restore the session.
 */

export const API_BASE = (import.meta.env.VITE_API_BASE as string | undefined)?.replace(/\/$/, '')
  || 'http://localhost:3000/api';

// ── In-memory token store ──────────────────────────────────────────────────────
// This is a module-level variable — lives for the lifetime of the tab.
// Deliberately NOT exported so nothing outside this module can write to it directly.
let _accessToken: string | null = null;

export const getToken  = ()           => _accessToken;
export const setToken  = (t: string | null) => { _accessToken = t; };
export const clearToken = ()          => { _accessToken = null; };

// Legacy: kept for backwards compat but now always returns null.
// Nothing should call localStorage for tokens anymore.
export const getRefreshToken = () => null;

export const authHeaders = (): Record<string, string> => ({
  'Content-Type': 'application/json',
  ...(_accessToken ? { Authorization: `Bearer ${_accessToken}` } : {}),
});

// ── Silent token refresh ───────────────────────────────────────────────────────
// Calls POST /auth/refresh. The httpOnly bt_refresh cookie is sent automatically
// by the browser (credentials:'include'). Returns the new access token or null.
let _refreshInFlight: Promise<string | null> | null = null;

export async function tryRefresh(): Promise<string | null> {
  // De-duplicate concurrent refresh attempts (e.g. multiple parallel 401s)
  if (_refreshInFlight) return _refreshInFlight;

  _refreshInFlight = (async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',   // ← sends the httpOnly bt_refresh cookie
      });
      if (!res.ok) return null;
      const data = await res.json();
      const newToken = data?.session?.access_token || data?.session?.accessToken;
      if (!newToken) return null;
      setToken(newToken);
      return newToken;
    } catch {
      return null;
    } finally {
      setTimeout(() => { _refreshInFlight = null; }, 0);
    }
  })();

  return _refreshInFlight;
}

// ── authFetch — authenticated fetch with auto-retry on 401 ────────────────────
export async function authFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const isAbsolute = /^https?:\/\//.test(path);
  const url = isAbsolute ? path : `${API_BASE}${path.startsWith('/') ? path : '/' + path}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string> || {}),
  };
  if (_accessToken) headers['Authorization'] = `Bearer ${_accessToken}`;

  let res = await fetch(url, { ...init, headers, credentials: 'include' });

  // On 401 — silently try to refresh once, then retry
  if (res.status === 401) {
    const newToken = await tryRefresh();
    if (newToken) {
      headers['Authorization'] = `Bearer ${newToken}`;
      res = await fetch(url, { ...init, headers, credentials: 'include' });
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
