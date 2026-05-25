// generate-sitemap.mjs — builds public/sitemap.xml from the real content data.
//
// Run:  node scripts/generate-sitemap.mjs        (from the frontend/ folder)
//       SITE_URL=https://bengaltrails.vercel.app node scripts/generate-sitemap.mjs
//
// Emits real path URLs (e.g. /explore/darjeeling) — the site now uses path
// routing, so these are individually crawlable/indexable by search engines.

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SITE = (process.env.SITE_URL || 'https://bengaltrails.vercel.app').replace(/\/$/, '');
const today = new Date().toISOString().slice(0, 10);

const read = (p) => { try { return readFileSync(join(ROOT, p), 'utf8'); } catch { return ''; } };
const uniq = (arr) => [...new Set(arr)];

// Extract slugs from the data sources.
const districtSlugs = uniq([...read('src/app/data/districts.ts').matchAll(/slug:\s*'([a-z0-9-]+)'/g)].map((m) => m[1]));
const placeSlugs    = uniq([...read('src/app/data/places-full.ts').matchAll(/"slug":\s*"([a-z0-9-]+)"/g)].map((m) => m[1]));

// Public, indexable static routes (no auth/admin/profile pages).
const staticRoutes = [
  { loc: '/',          priority: '1.0', freq: 'daily'   },
  { loc: '/explore',   priority: '0.9', freq: 'daily'   },
  { loc: '/festivals', priority: '0.8', freq: 'weekly'  },
  { loc: '/food',      priority: '0.8', freq: 'weekly'  },
  { loc: '/food-map',  priority: '0.6', freq: 'monthly' },
  { loc: '/map',       priority: '0.6', freq: 'monthly' },
  { loc: '/phrasebook',priority: '0.6', freq: 'monthly' },
  { loc: '/planner',   priority: '0.7', freq: 'monthly' },
  { loc: '/itinerary', priority: '0.7', freq: 'monthly' },
  { loc: '/budget',    priority: '0.6', freq: 'monthly' },
  { loc: '/compare',   priority: '0.6', freq: 'monthly' },
  { loc: '/weather',   priority: '0.5', freq: 'monthly' },
  { loc: '/tours',     priority: '0.7', freq: 'weekly'  },
  { loc: '/blog',      priority: '0.7', freq: 'weekly'  },
  { loc: '/partners',  priority: '0.6', freq: 'monthly' },
  { loc: '/about',     priority: '0.5', freq: 'monthly' },
  { loc: '/emergency', priority: '0.5', freq: 'yearly'  },
];

const urls = [
  ...staticRoutes.map((r) => ({ loc: r.loc, priority: r.priority, freq: r.freq })),
  ...districtSlugs.map((s) => ({ loc: `/explore/district/${s}`, priority: '0.8', freq: 'weekly' })),
  ...placeSlugs.map((s) => ({ loc: `/explore/${s}`, priority: '0.7', freq: 'weekly' })),
];

const body = urls.map(({ loc, priority, freq }) =>
  `  <url>\n    <loc>${SITE}${loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${freq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`
).join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;

writeFileSync(join(ROOT, 'public/sitemap.xml'), xml, 'utf8');
console.log(`sitemap.xml written: ${urls.length} URLs (${staticRoutes.length} static, ${districtSlugs.length} districts, ${placeSlugs.length} places)`);
