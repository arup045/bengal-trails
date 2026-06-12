// prerender.mjs — lightweight "SSG" for SEO + social sharing.
//
// Runs AFTER `vite build` (npm postbuild). For every place and district it
// writes a static  dist/<route>/index.html  that is a copy of the built
// index.html with per-route <title>, meta description, canonical, Open Graph /
// Twitter tags and a TouristAttraction JSON-LD injected.
//
// Why: the app is a client-rendered SPA, so social scrapers (WhatsApp,
// Facebook, LinkedIn, Twitter) — which DON'T run JS — otherwise see the same
// generic homepage preview for every shared link. Vercel serves these static
// files (filesystem wins over the SPA rewrite), so each URL now has correct
// metadata and crawlable <head> content. The SPA still hydrates normally.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DIST = join(ROOT, 'dist');
const SITE = (process.env.SITE_URL || 'https://bengal-trails.vercel.app').replace(/\/$/, '');
const DEFAULT_IMG = 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1200';

const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const clip = (s, n = 160) => { const t = String(s || '').replace(/\s+/g, ' ').trim(); return t.length > n ? t.slice(0, n - 1).trimEnd() + '…' : t; };

let template;
try { template = readFileSync(join(DIST, 'index.html'), 'utf8'); }
catch { console.error('[prerender] dist/index.html not found — run vite build first.'); process.exit(0); }

// ── Parse the real content at build time ────────────────────────────────────
function readPlaces() {
  const s = readFileSync(join(ROOT, 'src/app/data/places-full.ts'), 'utf8');
  const m = s.match(/export const placesData[^=]*=\s*/);
  const start = m.index + m[0].length;
  const end = s.indexOf('\n];', start);
  let arr = s.slice(start, end + 2).replace(/,(\s*[}\]])/g, '$1');
  return JSON.parse(arr);
}
function readDistricts() {
  const s = readFileSync(join(ROOT, 'src/app/data/districts.ts'), 'utf8');
  // blurb may be single- or double-quoted (double when it contains an apostrophe).
  const re = /\{\s*name:\s*'([^']+)',\s*slug:\s*'([^']+)',\s*region:\s*'([^']+)',\s*blurb:\s*(['"])(.*?)\4/g;
  const out = []; let m;
  while ((m = re.exec(s))) out.push({ name: m[1], slug: m[2], region: m[3], blurb: m[5] });
  return out;
}

// ── Per-route <head> rewrite ────────────────────────────────────────────────
function render({ title, description, url, image, jsonLd }) {
  let h = template;
  const set = (re, value) => { h = h.replace(re, value); };
  set(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`);
  set(/(<meta name="description" content=")[^"]*(")/, `$1${esc(description)}$2`);
  set(/(<link rel="canonical" href=")[^"]*(")/, `$1${esc(url)}$2`);
  set(/(<meta property="og:title" content=")[^"]*(")/, `$1${esc(title)}$2`);
  set(/(<meta property="og:description" content=")[^"]*(")/, `$1${esc(description)}$2`);
  set(/(<meta property="og:image" content=")[^"]*(")/, `$1${esc(image)}$2`);
  set(/(<meta property="og:url" content=")[^"]*(")/, `$1${esc(url)}$2`);
  set(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${esc(title)}$2`);
  set(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${esc(description)}$2`);
  set(/(<meta name="twitter:image" content=")[^"]*(")/, `$1${esc(image)}$2`);
  // Replace the site-level JSON-LD with the per-page one. Escape "<" to < so
  // a stray "</script>" (or "<!--") in any field can't break out of the tag.
  const ld = JSON.stringify(jsonLd).replace(/</g, '\\u003c');
  set(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, `<script type="application/ld+json">\n${ld}\n</script>`);
  return h;
}

function writeRoute(routePath, html) {
  const dir = join(DIST, routePath);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), html, 'utf8');
}

const places = readPlaces();
const districts = readDistricts();
let count = 0;

for (const p of places) {
  const loc = `${p.district || p.region || 'West Bengal'}`;
  // Avoid "Darjeeling — Darjeeling" when the place name equals its district.
  const locLabel = loc.toLowerCase() === String(p.title).toLowerCase() ? 'West Bengal' : loc;
  const title = `${p.title} — ${locLabel} | Bengal Trails`;
  const description = clip(p.excerpt || p.description || `${p.title}, a destination in ${loc}, West Bengal.`);
  const url = `${SITE}/explore/${p.slug}`;
  const image = (p.heroImage && p.heroImage.url) ? p.heroImage.url : DEFAULT_IMG;
  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'TouristAttraction',
    name: p.title, description, image, url,
    address: { '@type': 'PostalAddress', addressRegion: 'West Bengal', addressCountry: 'IN', addressLocality: loc },
    ...(p.coordinates ? { geo: { '@type': 'GeoCoordinates', latitude: p.coordinates.lat, longitude: p.coordinates.lng } } : {}),
  };
  writeRoute(`explore/${p.slug}`, render({ title, description, url, image, jsonLd }));
  count++;
}

for (const d of districts) {
  const title = `${d.name} Travel Guide — Top Places, Food & Stays | Bengal Trails`;
  const description = clip(d.blurb || `Explore ${d.name}, West Bengal — top places to visit, food and where to stay.`);
  const url = `${SITE}/explore/district/${d.slug}`;
  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'TouristDestination',
    name: d.name, description, url,
    address: { '@type': 'PostalAddress', addressRegion: 'West Bengal', addressCountry: 'IN', addressLocality: d.name },
  };
  writeRoute(`explore/district/${d.slug}`, render({ title, description, url, image: DEFAULT_IMG, jsonLd }));
  count++;
}

console.log(`[prerender] wrote ${count} static route pages (${places.length} places, ${districts.length} districts)`);
