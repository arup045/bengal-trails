import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { BookOpen, ExternalLink } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

// Wikipedia REST API — free, no key, CORS-friendly.
// We hit /page/summary/{title} which returns a clean extract + thumbnail and
// auto-redirects to the best match. Disambiguation results are skipped.
//
// Results are cached in localStorage for 7 days so repeat visits to a place
// don't re-hit the API.

interface WikiSummary {
  title: string;
  extract: string;
  pageUrl: string;
  thumbnail?: string;
}

const CACHE_KEY = 'bt-wiki-v1';
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function readCache(key: string): WikiSummary | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const map = JSON.parse(raw);
    const hit = map?.[key];
    if (!hit) return null;
    if (Date.now() - hit.ts > CACHE_TTL_MS) return null;
    return hit.value as WikiSummary;
  } catch { return null; }
}
function writeCache(key: string, value: WikiSummary | null) {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    const map = raw ? JSON.parse(raw) : {};
    map[key] = { ts: Date.now(), value };
    // Bound the cache size — keep newest 60 entries.
    const keys = Object.keys(map);
    if (keys.length > 60) {
      keys.sort((a, b) => (map[a].ts || 0) - (map[b].ts || 0)).slice(0, keys.length - 60).forEach((k) => delete map[k]);
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(map));
  } catch { /* quota */ }
}

async function fetchWiki(title: string): Promise<WikiSummary | null> {
  const enc = encodeURIComponent(title);
  try {
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${enc}?redirect=true`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;
    const d = await res.json();
    if (!d || d.type === 'disambiguation' || !d.extract) return null;
    return {
      title: d.title,
      extract: d.extract,
      pageUrl: d.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${enc}`,
      thumbnail: d.thumbnail?.source,
    };
  } catch {
    return null;
  }
}

export function PlaceHistory({ title, district }: { title: string; district?: string }) {
  const [data, setData] = useState<WikiSummary | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let alive = true;
    setData(null);
    setLoaded(false);
    setExpanded(false);

    // Cache key keys on both title + district (so "Victoria Memorial" in
    // different districts doesn't collide).
    const cacheKey = district ? `${title}|${district}` : title;
    const cached = readCache(cacheKey);
    if (cached) {
      setData(cached);
      setLoaded(true);
      return () => { alive = false; };
    }

    (async () => {
      // Try the most specific title first ("X, District"), then plain title.
      const candidates = district ? [`${title}, ${district}`, title] : [title];
      let hit: WikiSummary | null = null;
      for (const c of candidates) {
        hit = await fetchWiki(c);
        if (hit) break;
      }
      if (!alive) return;
      writeCache(cacheKey, hit);
      setData(hit);
      setLoaded(true);
    })();

    return () => { alive = false; };
  }, [title, district]);

  // Hide the section entirely if Wikipedia has nothing for this spot — better
  // than a half-empty card.
  if (loaded && !data) return null;

  return (
    <section id="history" className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-7 scroll-mt-32">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-100 to-rose-100 flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-rose-700" strokeWidth={2} />
          </span>
          <div>
            <h2 className="font-poppins text-lg sm:text-xl font-bold text-slate-900 leading-tight">History & background</h2>
            <p className="font-poppins text-xs text-gray-500">Curated from Wikipedia</p>
          </div>
        </div>
      </div>

      {!loaded ? (
        <div className="grid grid-cols-1 sm:grid-cols-[120px,1fr] gap-4 animate-pulse">
          <div className="h-28 rounded-2xl bg-gray-100" />
          <div className="space-y-2">
            <div className="h-3 rounded bg-gray-100 w-3/4" />
            <div className="h-3 rounded bg-gray-100 w-full" />
            <div className="h-3 rounded bg-gray-100 w-5/6" />
            <div className="h-3 rounded bg-gray-100 w-2/3" />
          </div>
        </div>
      ) : data ? (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="grid grid-cols-1 sm:grid-cols-[140px,1fr] gap-4 sm:gap-5"
        >
          {data.thumbnail ? (
            <a href={data.pageUrl} target="_blank" rel="noopener noreferrer"
              className="relative block rounded-2xl overflow-hidden border border-gray-100 aspect-[4/3] sm:aspect-auto sm:h-32 group">
              <ImageWithFallback src={data.thumbnail} alt={data.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </a>
          ) : null}
          <div>
            <p className={`font-poppins text-[15px] text-gray-700 leading-relaxed ${expanded ? '' : 'line-clamp-5'}`}>{data.extract}</p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3">
              {data.extract.length > 320 && (
                <button onClick={() => setExpanded((v) => !v)}
                  className="font-poppins text-sm font-semibold text-purple-600 hover:text-purple-700">
                  {expanded ? 'Show less' : 'Read more'}
                </button>
              )}
              <a href={data.pageUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-poppins text-sm font-medium text-gray-500 hover:text-purple-700">
                Open on Wikipedia <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </motion.div>
      ) : null}
    </section>
  );
}

export default PlaceHistory;
