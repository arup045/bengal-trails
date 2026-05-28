import { useEffect, useState } from 'react';
import { MapPin, Star, ArrowUpRight, Mountain, Utensils, Hotel, Trees, Compass, Sparkles } from 'lucide-react';

// Wikipedia photo auto-backfill — when a place has no real photo URL, try the
// free Wikipedia Commons media-list for a matching article. Result is cached
// in localStorage (7-day TTL) and reused across components.
const WIKI_CACHE_KEY = 'bt-wiki-cardphoto-v1';
const WIKI_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function wikiCacheGet(key: string): string | null {
  try {
    const raw = localStorage.getItem(WIKI_CACHE_KEY);
    if (!raw) return null;
    const map = JSON.parse(raw);
    const hit = map?.[key];
    if (!hit) return null;
    if (Date.now() - hit.ts > WIKI_TTL_MS) return null;
    return hit.v ?? null;
  } catch { return null; }
}
function wikiCacheSet(key: string, value: string | null) {
  try {
    const raw = localStorage.getItem(WIKI_CACHE_KEY);
    const map = raw ? JSON.parse(raw) : {};
    map[key] = { ts: Date.now(), v: value };
    const keys = Object.keys(map);
    // Keep the cache bounded so it never inflates beyond ~200 places.
    if (keys.length > 200) {
      keys.sort((a, b) => (map[a].ts || 0) - (map[b].ts || 0))
        .slice(0, keys.length - 200)
        .forEach((k) => delete map[k]);
    }
    localStorage.setItem(WIKI_CACHE_KEY, JSON.stringify(map));
  } catch { /* quota */ }
}

async function fetchWikiPhoto(title: string): Promise<string | null> {
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
  title, image, href, location, tagline, rating, price, fallbackKind,
}: PremiumPlaceCardProps) {
  // If the supplied URL fails to load (404 / blocked / expired), flip to the
  // wiki-backfilled photo first, and only then to the neutral placeholder.
  const [primaryBroken, setPrimaryBroken] = useState(false);
  const [wikiPhoto, setWikiPhoto] = useState<string | null>(() => wikiCacheGet(title));
  const [wikiBroken, setWikiBroken] = useState(false);

  const primaryUsable = !!(image && image.trim()) && !primaryBroken;
  const wikiUsable = !!wikiPhoto && !wikiBroken;
  const displayedSrc = primaryUsable ? (image as string) : (wikiUsable ? (wikiPhoto as string) : null);
  const hasImage = !!displayedSrc;

  // Lazily fetch a Wikipedia photo whenever we don't have a usable primary image
  // and we haven't already cached/tried one for this title.
  useEffect(() => {
    if (primaryUsable) return;          // primary image is fine, no backfill needed
    if (wikiPhoto != null) return;      // already have one (state or cache hit)
    if (!title) return;
    let alive = true;
    fetchWikiPhoto(title).then((src) => {
      if (!alive) return;
      // Cache both hits and misses — `null` skips future fetches for the TTL window.
      wikiCacheSet(title, src);
      if (src) setWikiPhoto(src);
    });
    return () => { alive = false; };
  }, [primaryUsable, wikiPhoto, title]);

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
                // Route the failure to whichever source is currently in use,
                // so the next render can fall through to the next layer.
                if (primaryUsable) setPrimaryBroken(true);
                else setWikiBroken(true);
              }}
              onLoad={(e) => {
                if ((e.currentTarget as HTMLImageElement).naturalWidth === 0) {
                  if (primaryUsable) setPrimaryBroken(true);
                  else setWikiBroken(true);
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
              <span className="text-[10px] font-normal text-slate-400 ml-0.5">onwards</span>
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
