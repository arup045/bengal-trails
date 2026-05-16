// Central API helper with automatic token refresh.
// Use authFetch(path, init) instead of raw fetch for any authenticated endpoint.
// If the server returns 401, we silently call /auth/refresh, store the new token,
// and retry the original request once. This eliminates the 7-day silent-logout problem.

export const API_BASE = (import.meta.env.VITE_API_BASE as string | undefined)?.replace(/\/$/, '')
  || 'http://localhost:3000/api';

export const getToken = () => localStorage.getItem('access_token');
export const getRefreshToken = () => localStorage.getItem('refresh_token');

export const authHeaders = () => ({
  'Content-Type': 'application/json',
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
});

// Internal: try to refresh the access token using the stored refresh token.
// Returns the new access token on success, or null if refresh failed.
let refreshInFlight: Promise<string | null> | null = null;
async function tryRefresh(): Promise<string | null> {
  // De-duplicate concurrent refresh attempts
  if (refreshInFlight) return refreshInFlight;
  const rt = getRefreshToken();
  if (!rt) return null;
  refreshInFlight = (async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: rt }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      const newAccess = data?.session?.accessToken || data?.session?.access_token;
      const newRefresh = data?.session?.refreshToken || data?.session?.refresh_token;
      if (!newAccess) return null;
      localStorage.setItem('access_token', newAccess);
      if (newRefresh) localStorage.setItem('refresh_token', newRefresh);
      return newAccess;
    } catch {
      return null;
    } finally {
      // Allow next refresh after a tick to avoid storming
      setTimeout(() => { refreshInFlight = null; }, 0);
    }
  })();
  return refreshInFlight;
}

// Wrap a fetch with automatic 401 → refresh → retry.
// `path` can be absolute (`/auth/user`) or full URL; if relative, API_BASE is prepended.
export async function authFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const isAbsolute = /^https?:\/\//.test(path);
  const url = isAbsolute ? path : `${API_BASE}${path.startsWith('/') ? path : '/' + path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string> || {}),
  };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let res = await fetch(url, { ...init, headers });
  if (res.status !== 401) return res;

  // Try refresh
  const newToken = await tryRefresh();
  if (!newToken) return res; // Refresh failed — return original 401

  // Retry with new token
  headers['Authorization'] = `Bearer ${newToken}`;
  res = await fetch(url, { ...init, headers });
  return res;
}

// Convenience wrapper that parses JSON and throws on non-2xx.
export async function apiJson<T = any>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await authFetch(path, init);
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try { const j = await res.json(); msg = j.error || j.message || msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
}


// Upload a single image to /uploads/image. Backend uses Cloudinary.
// Returns { url, publicId } on success. Requires CLOUDINARY_* env vars on the
// backend (Render) — otherwise the API returns "Cloudinary not configured".
export async function uploadImage(file: File): Promise<{ url: string; publicId: string }> {
  const formData = new FormData();
  formData.append('image', file);
  const token = getToken();
  const res = await fetch(`${API_BASE}/uploads/image`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  if (!res.ok) {
    let msg = `Upload failed (${res.status})`;
    try { const j = await res.json(); msg = j.error || msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

// Upload multiple images at once
export async function uploadImages(files: File[]): Promise<Array<{ url: string; publicId: string }>> {
  const formData = new FormData();
  files.forEach((f) => formData.append('images', f));
  const token = getToken();
  const res = await fetch(`${API_BASE}/uploads/multiple`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  if (!res.ok) {
    let msg = `Upload failed (${res.status})`;
    try { const j = await res.json(); msg = j.error || msg; } catch {}
    throw new Error(msg);
  }
  const data = await res.json();
  return data.images || data;
}
