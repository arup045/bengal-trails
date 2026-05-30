import { useEffect, useState } from 'react';
import { API_BASE } from './api';

// Pulls real photos for a place from the free Wikipedia Commons media-list API
// (no key, CORS-friendly). Used to auto-fill the gallery on places whose admin
// `gallery` field is empty so the Photos section is never blank for famous
// destinations. Results are cached in localStorage for 7 days per place.

const CACHE_KEY = 'bt-wiki-photos-v1';
const TTL_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_PHOTOS = 8;

function cacheGet(key: string): string[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const map = JSON.parse(raw);
    const hit = map?.[key];
    if (!hit || Date.now() - hit.ts > TTL_MS) return null;
    return hit.v as string[];
  } catch { return null; }
}
function cacheSet(key: string, value: string[]) {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    const map = raw ? JSON.parse(raw) : {};
    map[key] = { ts: Date.now(), v: value };
    const keys = Object.keys(map);
    if (keys.length > 80) {
      keys.sort((a, b) => (map[a].ts || 0) - (map[b].ts || 0))
        .slice(0, keys.length - 80)
        .forEach((k) => delete map[k]);
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(map));
  } catch { /* quota */ }
}

async function fetchMedia(title: string): Promise<string[]> {
  // Via our backend proxy (/api/geo/wiki?kind=media) — server-side + cached,
  // already filtered to real photos. Avoids browser CORS/CSP limits.
  try {
    const res = await fetch(`${API_BASE}/geo/wiki?title=${encodeURIComponent(title)}&kind=media`);
    if (!res.ok) return [];
    const data = await res.json();
    const photos: string[] = Array.isArray(data?.photos) ? data.photos : [];
    return photos.slice(0, MAX_PHOTOS);
  } catch {
    return [];
  }
}

export function usePlaceWikiPhotos(title: string, district?: string): { photos: string[]; loaded: boolean } {
  const [photos, setPhotos] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!title) { setPhotos([]); setLoaded(true); return; }
    let alive = true;
    setPhotos([]);
    setLoaded(false);

    const key = district ? `${title}|${district}` : title;
    const cached = cacheGet(key);
    if (cached) { setPhotos(cached); setLoaded(true); return () => { alive = false; }; }

    (async () => {
      // Try the most specific lookup first ("Name, District"), then plain name.
      const candidates = district ? [`${title}, ${district}`, title] : [title];
      let out: string[] = [];
      for (const c of candidates) {
        out = await fetchMedia(c);
        if (out.length > 0) break;
      }
      if (!alive) return;
      cacheSet(key, out);
      setPhotos(out);
      setLoaded(true);
    })();

    return () => { alive = false; };
  }, [title, district]);

  return { photos, loaded };
}
