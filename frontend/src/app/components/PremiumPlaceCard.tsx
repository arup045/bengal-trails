import { useEffect, useState } from 'react';
import { MapPin, Star, ArrowUpRight, Mountain, Utensils, Hotel, Trees, Compass, Sparkles } from 'lucide-react';

// Photo backfill — when a card has no usable real photo, try Unsplash first
// (better travel photography), then Wikipedia Commons as the fallback. Result
// (URL or null) is cached in localStorage for 7 days so we never re-query.
const BACKFILL_CACHE_KEY = 'bt-cardphoto-v2';
const TTL_MS = 7 * 24 * 60 * 60 * 1000;

function cacheGet(key: string): string | null | undefined {
  try {
    const raw = localStorage.getItem(BACKFILL_CACHE_KEY);
    if (!raw) return undefined;
    const map = JSON.parse(raw);
    const hit = map?.[key];
    if (!hit) return undefined;
    if (Date.now() - hit.ts > TTL_MS) return undefined;
    // `null` is a valid cached miss — distinct from `undefined` (not-cached).
    return hit.v;
  } catch { return undefined; }
}
function cacheSet(key: string, value: string | null) {
  try {
    const raw = localStorage.getItem(BACKFILL_CACHE_KEY);
    const map = raw ? JSON.parse(raw) : {};
    map[key] = { ts: Date.now(), v: value };
    const keys = Object.keys(map);
    if (keys.length > 300) {
      keys.sort((a, b) => (map[a].ts || 0) - (map[b].ts || 0))
        .slice(0, keys.length - 300)
        .forEach((k) => delete map[k]);
    }
    localStorage.setItem(BACKFILL_CACHE_KEY, JSON.stringify(map));
  } catch { /* quota */ }
}

async function fetchUnsplash(query: string): Promise<string | null> {
  const key = (import.meta as any).env?.VITE_UNSPLASH_ACCESS_KEY;
  if (!key) return null;
  try {
    const r = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape&content_filter=high`,
      { headers: { Authorization: `Client-ID ${key}` } },
    );
    if (!r.ok) return null;
    const data = await r.json();
    return data?.results?.[0]?.urls?.regular || null;
  } catch { return null; }
}

async function fetchWiki(title: string): Promise<string | null> {
  try {
    const r = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/media-list/${encodeURIComponent(title)}`,
      { headers: { Accept: 'application/json' } },
    );
    if (!r.ok) return null;
    const data = await r.json();
    const items: any[] = data?.items || [];
    for (const it of items) {
      if (it.type !== 'image') continue;
      const srcset = Array.isArray(it.srcset) ? it.srcset : [];
      const best = srcset.reduce(
        (acc: any, cur: any) => (Number(cur?.scale) > Number(acc?.scale || 0) ? cur : acc),
        srcset[0],
      );
      if (!best?.src) continue;
      const src = best.src.startsWith('//') ? `https:${best.src}` : best.src;
      if (/\.svg(\?|$)/i.test(src)) continue;
      if (/(coat[-_ ]of[-_ ]arms|logo|seal|map|disambig|edit-icon|flag)/i.test(src)) continue;
      return src;
    }
    return null;
  } catch { return null; }
}

// One backfill call: Unsplash → Wikipedia → null. Always cached.
async function fetchBackfillPhoto(query: string): Promise<string | null> {
  const u = await fetchUnsplash(query);
  if (u) return u;
  return await fetchWiki(query);
}

// One uniform card used by every horizontal row on every detail page.
// Strict rules from the spec:
//   • Photo-led (aspect-[4/3]), w-72, real photography only.
//   • NO coloured pill badges, NO coloured panels — only the clean light
//     slate/white backdrop. Purple is reserved for hover + CTA accents.
//   • Whenever an image URL is missing OR fails to load, fall back to a
//     soft neutral slate placeholder with a single muted icon — never a
//     coloured panel, never a generic "broken image" icon.

type FallbackIconKind = 'place' | 'park' | 'food' | 'stay' | 'activity' | 'default';

interface PremiumPlaceCardProps {
  title: string;
  image?: string;
  href: string;
  /** Sub-line under the title — district / region / hotel type / etc. */
  location?: string;
  /** Short flavor line (food cards). Overrides `location` when present. */
  tagline?: string;
  /** Optional rating 0–5; only renders when > 0. */
  rating?: number;
  /** Optional price label (e.g. "₹2,500"); only renders when present. */
  price?: string;
  /** Small note shown after the price. Defaults to "onwards"; pass "/ night" for stays, "" to hide. */
  priceNote?: string;
  /** Category hint for the no-photo placeholder icon. */
  fallbackKind?: FallbackIconKind;
}

function iconFor(kind: FallbackIconKind | undefined) {
  switch (kind) {
    case 'park':     return Trees;
    case 'food':     return Utensils;
    case 'stay':     return Hotel;
    case 'activity': return Compass;
    case 'place':    return Mountain;
    default:         return Sparkles;
  }
}

export function PremiumPlaceCard({
  title, image, href, location, tagline, rating, price, priceNote = 'onwards', fallbackKind,
}: PremiumPlaceCardProps) {
  const [primaryBroken, setPrimaryBroken] = useState(false);
  const [backfill, setBackfill] = useState<string | null>(() => {
    const cached = cacheGet(title);
    return cached === undefined ? null : cached;
  });
  const [backfillBroken, setBackfillBroken] = useState(false);

  const primaryUsable = !!(image && image.trim()) && !primaryBroken;
  const backfillUsable = !!backfill && !backfillBroken;
  const displayedSrc = primaryUsable ? (image as string) : (backfillUsable ? (backfill as string) : null);
  const hasImage = !!displayedSrc;

  // Lazily fetch a backfill photo (Unsplash → Wikipedia) when the primary is
  // not usable and we haven't already cached a result for this title.
  useEffect(() => {
    if (primaryUsable) return;
    if (backfill) return;
    if (cacheGet(title) !== undefined) return;   // cached miss — don't re-query
    if (!title) return;
    let alive = true;
    fetchBackfillPhoto(title).then((src) => {
      if (!alive) return;
      cacheSet(title, src);
      if (src) setBackfill(src);
    });
    return () => { alive = false; };
  }, [primaryUsable, backfill, title]);

  const sub = tagline || location;
  const FallbackIcon = iconFor(fallbackKind);

  return (
    <a
      href={href}
      className="group relative block w-72 shrink-0 snap-start rounded-2xl overflow-hidden bg-white border border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 font-poppins"
    >
      {/* Photo slot — real image when it loads, neutral placeholder otherwise */}
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-50">
        {hasImage ? (
          <>
            <img
              src={displayedSrc as string}
              alt={title}
              loading="lazy"
              decoding="async"
              onError={() => {
                // Route the failure to whichever source is in use, so the
                // next render falls through to the next layer.
                if (primaryUsable) setPrimaryBroken(true);
                else setBackfillBroken(true);
              }}
              onLoad={(e) => {
                if ((e.currentTarget as HTMLImageElement).naturalWidth === 0) {
                  if (primaryUsable) setPrimaryBroken(true);
                  else setBackfillBroken(true);
                }
              }}
              className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700 ease-out"
            />
            {/* Very low-contrast bottom gradient — never obscures the body */}
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/15 to-transparent pointer-events-none" />
          </>
        ) : (
          // Neutral slate placeholder — soft, monochrome, intentional.
          // No coloured panel, no "DESTINATION" label, no broken-image icon.
          <div className="w-full h-full bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
            <FallbackIcon className="w-10 h-10 text-slate-300" strokeWidth={1.5} />
          </div>
        )}

        {/* Clean star rating chip (only when a real rating exists) */}
        {rating != null && rating > 0 && (
          <div className="absolute top-3 right-3 inline-flex items-center gap-1 bg-white/95 backdrop-blur-sm rounded-full px-2.5 py-1 shadow-sm ring-1 ring-black/[0.04]">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" strokeWidth={0} />
            <span className="text-[11px] font-semibold text-slate-800">{rating.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        <h3 className="text-base font-semibold text-slate-900 leading-snug line-clamp-1 group-hover:text-purple-600 transition-colors">
          {title}
        </h3>
        {sub && (
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 line-clamp-1">
            {!tagline && location && <MapPin className="w-3 h-3 shrink-0" />}
            <span className="truncate">{sub}</span>
          </p>
        )}

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
          {price ? (
            <span className="text-sm font-semibold text-slate-800">
              {price}
              {priceNote && <span className="text-[10px] font-normal text-slate-400 ml-0.5">{priceNote}</span>}
            </span>
          ) : <span aria-hidden />}
          <span className="text-xs font-medium text-slate-500 group-hover:text-purple-600 inline-flex items-center gap-1 transition-colors">
            View details
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </a>
  );
}

export default PremiumPlaceCard;
