// backend/src/routes/geo.js
//
// Server-side proxy + cache for the free third-party geo/content APIs the place
// pages use (Overpass, Wikipedia, OSRM, Open-Elevation, Sunrise-Sunset, Unsplash).
//
// Why proxy: calling these from the browser is fragile — CORS, the site's CSP,
// per-IP rate limits, and slow mirrors all cause intermittent failures. Routing
// through our own origin removes CORS/CSP entirely, lets us cache responses
// (fast + dodges rate limits), and gives one resilient code path with mirror
// fallback + timeouts. Every endpoint degrades gracefully: on failure it returns
// an empty-but-valid shape so the UI shows a clean empty state, never an error.

'use strict';

const router = require('express').Router();

// ── Tiny in-memory TTL cache (per dyno; fine for this use) ──────────────────
const cache = new Map(); // key -> { ts, ttl, v }
function cacheGet(key) {
  const hit = cache.get(key);
  if (!hit) return undefined;
  if (Date.now() - hit.ts > hit.ttl) { cache.delete(key); return undefined; }
  return hit.v;
}
function cacheSet(key, v, ttlMs) {
  cache.set(key, { ts: Date.now(), ttl: ttlMs, v });
  if (cache.size > 2000) { // bound memory
    const oldest = [...cache.entries()].sort((a, b) => a[1].ts - b[1].ts).slice(0, 500);
    for (const [k] of oldest) cache.delete(k);
  }
}

// A descriptive User-Agent is REQUIRED by Overpass and Wikipedia (their abuse
// policy 406/403s requests with a missing or generic "node" UA — which is why
// every mirror failed from the server). Send it (+ Accept) on every call.
const UA = 'BengalTrails/1.0 (https://bengal-trails.vercel.app; travel guide)';

// fetch with an abort timeout — never let a slow upstream hang a request.
async function fetchT(url, opts = {}, timeoutMs = 12000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(url, {
      ...opts,
      signal: ctrl.signal,
      headers: { 'User-Agent': UA, Accept: 'application/json', ...(opts.headers || {}) },
    });
  } finally {
    clearTimeout(t);
  }
}

const numOk = (v) => typeof v === 'number' && Number.isFinite(v);
const parseLatLng = (req) => {
  const lat = parseFloat(req.query.lat);
  const lng = parseFloat(req.query.lng);
  return numOk(lat) && numOk(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180 ? { lat, lng } : null;
};

// ── 1) Overpass amenities ───────────────────────────────────────────────────
// GET /api/geo/amenities?lat=&lng=&type=atm|hospital|police|fuel|food|hotel|park&radius=7000
const OVERPASS_MIRRORS = [
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
  'https://overpass-api.de/api/interpreter',
];
const OVERPASS_FILTERS = {
  atm:      'node["amenity"="atm"];node["amenity"="bank"]',
  hospital: 'node["amenity"~"^(hospital|clinic|doctors|pharmacy)$"]',
  police:   'node["amenity"="police"]',
  fuel:     'node["amenity"="fuel"]',
  food:     'node["amenity"~"^(restaurant|cafe|fast_food|food_court)$"]',
  hotel:    'node["tourism"~"^(hotel|hostel|guest_house|motel|apartment)$"]',
  park:     'node["leisure"~"^(park|garden)$"]',
};

router.get('/amenities', async (req, res) => {
  const ll = parseLatLng(req);
  const type = String(req.query.type || 'atm').toLowerCase();
  const radius = Math.min(parseInt(req.query.radius, 10) || 7000, 20000);
  const filter = OVERPASS_FILTERS[type];
  if (!ll || !filter) return res.json({ items: [], type, ok: false });

  const key = `amen:${type}:${ll.lat.toFixed(3)}:${ll.lng.toFixed(3)}:${radius}`;
  const cached = cacheGet(key);
  if (cached) return res.json({ items: cached, type, cached: true, ok: true });

  // Build the area-bounded query for each sub-filter.
  const around = `(around:${radius},${ll.lat},${ll.lng})`;
  const body = `[out:json][timeout:18];(${filter.split(';').map((f) => `${f}${around};`).join('')});out center 40;`;

  for (const base of OVERPASS_MIRRORS) {
    try {
      const r = await fetchT(`${base}?data=${encodeURIComponent(body)}`, {}, 24000);
      if (!r.ok) continue;
      const data = await r.json();
      const items = (data?.elements || [])
        .map((el) => {
          const lat = el.lat ?? el.center?.lat;
          const lon = el.lon ?? el.center?.lon;
          if (!numOk(lat) || !numOk(lon)) return null;
          return {
            name: el.tags?.name || el.tags?.operator || el.tags?.brand || (el.tags?.amenity || el.tags?.tourism || el.tags?.leisure || 'Place'),
            lat, lon,
            type: el.tags?.amenity || el.tags?.tourism || el.tags?.leisure || type,
          };
        })
        .filter(Boolean)
        .slice(0, 40);
      cacheSet(key, items, 24 * 60 * 60 * 1000); // 24h — amenities rarely change
      return res.json({ items, type, ok: true });
    } catch { /* next mirror */ }
  }
  return res.json({ items: [], type, ok: false });
});

// ── 2) Wikipedia (summary text + media images) ──────────────────────────────
// GET /api/geo/wiki?title=Darjeeling&kind=summary|media
router.get('/wiki', async (req, res) => {
  const title = String(req.query.title || '').slice(0, 120).trim();
  const kind = String(req.query.kind || 'summary');
  if (!title) return res.json({ ok: false });

  const key = `wiki:${kind}:${title.toLowerCase()}`;
  const cached = cacheGet(key);
  if (cached) return res.json({ ...cached, cached: true });

  try {
    if (kind === 'media') {
      const r = await fetchT(`https://en.wikipedia.org/api/rest_v1/page/media-list/${encodeURIComponent(title)}`, { headers: { Accept: 'application/json' } });
      if (!r.ok) return res.json({ ok: false, photos: [] });
      const data = await r.json();
      const photos = [];
      for (const it of (data?.items || [])) {
        if (it.type !== 'image') continue;
        const srcset = Array.isArray(it.srcset) ? it.srcset : [];
        const best = srcset.reduce((a, c) => (Number(c?.scale) > Number(a?.scale || 0) ? c : a), srcset[0]);
        if (!best?.src) continue;
        const src = best.src.startsWith('//') ? `https:${best.src}` : best.src;
        if (/\.svg(\?|$)/i.test(src)) continue;
        if (/(coat[-_ ]of[-_ ]arms|logo|seal|map|disambig|edit-icon|flag|icon)/i.test(src)) continue;
        photos.push(src);
        if (photos.length >= 10) break;
      }
      const out = { ok: true, photos };
      cacheSet(key, out, 7 * 24 * 60 * 60 * 1000);
      return res.json(out);
    }
    // summary
    const r = await fetchT(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`, { headers: { Accept: 'application/json' } });
    if (!r.ok) return res.json({ ok: false });
    const d = await r.json();
    const out = {
      ok: true,
      extract: d?.extract || '',
      thumbnail: d?.thumbnail?.source || d?.originalimage?.source || null,
      url: d?.content_urls?.desktop?.page || null,
    };
    cacheSet(key, out, 7 * 24 * 60 * 60 * 1000);
    return res.json(out);
  } catch {
    return res.json({ ok: false });
  }
});

// ── 3) Quick facts: drive-from-Kolkata + altitude + sunrise/sunset ──────────
// GET /api/geo/facts?lat=&lng=
const KOLKATA = { lat: 22.5851, lng: 88.3468 };
router.get('/facts', async (req, res) => {
  const ll = parseLatLng(req);
  if (!ll) return res.json({ ok: false });

  const key = `facts:${ll.lat.toFixed(3)}:${ll.lng.toFixed(3)}`;
  const cached = cacheGet(key);
  if (cached) return res.json({ ...cached, cached: true });

  const out = {};

  // Drive time/distance from Kolkata (OSRM, with a routing mirror fallback).
  const osrm = [
    `https://router.project-osrm.org/route/v1/driving/${KOLKATA.lng},${KOLKATA.lat};${ll.lng},${ll.lat}?overview=false`,
    `https://routing.openstreetmap.de/routed-car/route/v1/driving/${KOLKATA.lng},${KOLKATA.lat};${ll.lng},${ll.lat}?overview=false`,
  ];
  for (const u of osrm) {
    try { const r = await fetchT(u, {}, 10000); if (r.ok) { const d = await r.json(); const rt = d?.routes?.[0]; if (rt) { out.driveTime = rt.duration; out.driveKm = Math.round(rt.distance / 1000); break; } } } catch { /* next */ }
  }
  // Altitude (Open-Elevation → OpenTopoData fallback).
  const elev = [
    `https://api.open-elevation.com/api/v1/lookup?locations=${ll.lat},${ll.lng}`,
    `https://api.opentopodata.org/v1/aster30m?locations=${ll.lat},${ll.lng}`,
  ];
  for (const u of elev) {
    try { const r = await fetchT(u, {}, 9000); if (r.ok) { const d = await r.json(); const m = d?.results?.[0]?.elevation; if (numOk(m)) { out.altitude = Math.round(m); break; } } } catch { /* next */ }
  }
  // Sunrise/sunset.
  try {
    const r = await fetchT(`https://api.sunrise-sunset.org/json?lat=${ll.lat}&lng=${ll.lng}&formatted=0`, {}, 9000);
    if (r.ok) { const d = await r.json(); if (d?.results) { out.sunrise = d.results.sunrise; out.sunset = d.results.sunset; } }
  } catch { /* skip */ }

  const result = { ok: true, ...out };
  // Facts are stable for a day (sunrise shifts slowly; drive/altitude are static).
  cacheSet(key, result, 12 * 60 * 60 * 1000);
  return res.json(result);
});

// ── 4) Unsplash photo (backfill for items with no image) ────────────────────
// GET /api/geo/photo?query=Tiger+Hill+Darjeeling
router.get('/photo', async (req, res) => {
  const query = String(req.query.query || '').slice(0, 120).trim();
  if (!query) return res.json({ ok: false, url: null });

  const key = `photo:${query.toLowerCase()}`;
  const cached = cacheGet(key);
  if (cached !== undefined) return res.json({ ok: true, url: cached, cached: true });

  const accessKey = process.env.UNSPLASH_ACCESS_KEY || process.env.VITE_UNSPLASH_ACCESS_KEY;
  let url = null;
  try {
    if (accessKey) {
      const r = await fetchT(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape&content_filter=high`, { headers: { Authorization: `Client-ID ${accessKey}` } }, 9000);
      if (r.ok) { const d = await r.json(); url = d?.results?.[0]?.urls?.regular || null; }
    }
    if (!url) {
      // Fallback: first Wikipedia Commons image for the query.
      const r = await fetchT(`https://en.wikipedia.org/api/rest_v1/page/media-list/${encodeURIComponent(query)}`, { headers: { Accept: 'application/json' } }, 9000);
      if (r.ok) {
        const d = await r.json();
        for (const it of (d?.items || [])) {
          if (it.type !== 'image') continue;
          const ss = Array.isArray(it.srcset) ? it.srcset : [];
          const best = ss.reduce((a, c) => (Number(c?.scale) > Number(a?.scale || 0) ? c : a), ss[0]);
          if (!best?.src) continue;
          const s = best.src.startsWith('//') ? `https:${best.src}` : best.src;
          if (/\.svg(\?|$)/i.test(s) || /(coat[-_ ]of[-_ ]arms|logo|seal|map|flag|icon)/i.test(s)) continue;
          url = s; break;
        }
      }
    }
  } catch { /* leave url null */ }

  cacheSet(key, url, 7 * 24 * 60 * 60 * 1000); // cache hits AND misses
  return res.json({ ok: true, url });
});

module.exports = router;
