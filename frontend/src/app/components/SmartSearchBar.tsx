import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, MapPin, Calendar, UtensilsCrossed, Loader2, ArrowRight, Compass, Map as MapIcon, Clock } from 'lucide-react';
import { API_BASE, trackSearch } from '../utils/api';
import { navigate } from '../utils/navigation';

export interface Suggestion {
  type: 'destination' | 'district' | 'experience' | 'festival' | 'food';
  id: string;
  name: string;
  slug: string;
  subtitle: string;
  image: string | null;
  url: string;
}

// ── Instant local index ─────────────────────────────────────────────────────
// The backend only indexes the (sparse) `destinations` table, so server-only
// search misses most of the 288 curated places. We therefore search the bundled
// dataset locally for INSTANT, complete results, and merge the server's
// festival/food/typo matches on top.
//
// The dataset is ~490 KB, so it is NOT imported statically (that would land in
// the initial bundle). It is dynamically imported the moment the user focuses
// the search box, so it's ready before the first keystroke lands.
interface LocalItem { type: Suggestion['type']; name: string; slug: string; subtitle: string; url: string; hay: string }
let localIndexPromise: Promise<LocalItem[]> | null = null;

function loadLocalIndex(): Promise<LocalItem[]> {
  if (!localIndexPromise) {
    localIndexPromise = Promise.all([
      import('../data/places-full'),
      import('../data/districts'),
      import('../data/experiences'),
    ]).then(([places, districts, experiences]) => {
      const items: LocalItem[] = [];
      for (const p of (places as any).placesData as any[]) {
        items.push({
          type: 'destination', name: p.title, slug: p.slug,
          subtitle: `${p.district || p.region}${p.category ? ' • ' + p.category : ''}`,
          url: `/explore/${p.slug}`,
          hay: `${p.title} ${p.district || ''} ${p.region || ''} ${p.category || ''} ${(p.tags || []).join(' ')}`.toLowerCase(),
        });
      }
      for (const d of (districts as any).DISTRICTS as any[]) {
        items.push({
          type: 'district', name: d.name, slug: d.slug, subtitle: `${d.region} • District`,
          url: `/explore/district/${d.slug}`,
          hay: `${d.name} ${d.region} ${d.blurb || ''}`.toLowerCase(),
        });
      }
      for (const e of (experiences as any).experiences as any[]) {
        items.push({
          type: 'experience', name: e.title, slug: e.id, subtitle: e.tagline || 'Experience',
          url: `/experiences/${e.id}`,
          hay: `${e.title} ${e.tagline || ''} ${e.description || ''}`.toLowerCase(),
        });
      }
      return items;
    }).catch(() => []);
  }
  return localIndexPromise;
}

// Rank: exact prefix on the name beats a word-start beats any substring.
function scoreLocal(item: LocalItem, q: string): number {
  const name = item.name.toLowerCase();
  if (name === q) return 100;
  if (name.startsWith(q)) return 80;
  if (new RegExp(`\\b${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`).test(name)) return 60;
  if (name.includes(q)) return 40;
  if (item.hay.includes(q)) return 20;
  return 0;
}

function searchLocal(index: LocalItem[], q: string, limit = 8): Suggestion[] {
  const scored: Array<{ s: number; i: LocalItem }> = [];
  for (const i of index) {
    const s = scoreLocal(i, q);
    if (s > 0) scored.push({ s, i });
  }
  scored.sort((a, b) => b.s - a.s || a.i.name.length - b.i.name.length);
  return scored.slice(0, limit).map(({ i }) => ({
    type: i.type, id: i.slug, name: i.name, slug: i.slug, subtitle: i.subtitle, image: null, url: i.url,
  }));
}

// ── Recent searches (localStorage) ──────────────────────────────────────────
const RECENT_KEY = 'bt-recent-searches';
function readRecent(): string[] {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]').slice(0, 5); } catch { return []; }
}
function pushRecent(q: string) {
  const term = q.trim();
  if (term.length < 2) return;
  try {
    const next = [term, ...readRecent().filter((r) => r.toLowerCase() !== term.toLowerCase())].slice(0, 5);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch { /* quota / private mode */ }
}

interface SmartSearchBarProps {
  size?: 'sm' | 'md' | 'lg';
  placeholder?: string;
  autoFocus?: boolean;
  /** Called when user picks a suggestion or presses Enter (free text) */
  onSelect?: (suggestion: Suggestion | { type: 'query'; query: string }) => void;
  /** Called on EVERY keystroke — use this for live filtering in parent */
  onChange?: (query: string) => void;
  /** Called when Search button is clicked — if provided, button won't navigate */
  onSearch?: (query: string) => void;
  className?: string;
  dropdownAbove?: boolean;
  showButton?: boolean;
}

const TYPE_META: Record<Suggestion['type'], { icon: any; color: string; bg: string; label: string }> = {
  destination: { icon: MapPin,          color: 'text-purple-600', bg: 'bg-purple-50', label: 'Places'      },
  district:    { icon: MapIcon,         color: 'text-purple-600', bg: 'bg-purple-50', label: 'Districts'   },
  experience:  { icon: Compass,         color: 'text-purple-600', bg: 'bg-purple-50', label: 'Experiences' },
  festival:    { icon: Calendar,        color: 'text-purple-600', bg: 'bg-slate-100', label: 'Festivals'   },
  food:        { icon: UtensilsCrossed, color: 'text-purple-600', bg: 'bg-slate-100', label: 'Food'        },
};

const TYPE_ORDER: Suggestion['type'][] = ['destination', 'district', 'experience', 'festival', 'food'];

const POPULAR_DEFAULTS: Suggestion[] = [
  { type: 'destination', id: 'darjeeling',               name: 'Darjeeling',        slug: 'darjeeling',               subtitle: 'North Bengal • Hill station', image: null, url: '#/explore/darjeeling' },
  { type: 'destination', id: 'sundarbans-national-park', name: 'Sundarbans',         slug: 'sundarbans-national-park', subtitle: 'South Bengal • Wildlife',     image: null, url: '#/explore/sundarbans-national-park' },
  { type: 'destination', id: 'victoria-memorial-kolkata',name: 'Victoria Memorial',  slug: 'victoria-memorial-kolkata',subtitle: 'Kolkata • Heritage',          image: null, url: '#/explore/victoria-memorial-kolkata' },
  { type: 'festival',    id: 'durga-puja',               name: 'Durga Puja',         slug: 'durga-puja',               subtitle: 'Sep–Oct',                    image: null, url: '#/festivals' },
  { type: 'destination', id: 'bishnupur',                name: 'Bishnupur',          slug: 'bishnupur',                subtitle: 'Bankura • Temple town',      image: null, url: '#/explore/bishnupur' },
];

export function SmartSearchBar({
  size = 'md',
  placeholder = 'Search destinations, festivals, food…',
  autoFocus = false,
  onSelect,
  onChange,
  onSearch,
  className = '',
  dropdownAbove = false,
  showButton = false,
}: SmartSearchBarProps) {
  const [query, setQuery]             = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading]     = useState(false);
  const [isOpen, setIsOpen]           = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);

  const [recent, setRecent] = useState<string[]>([]);

  const inputRef     = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef  = useRef<number | null>(null);
  const abortRef     = useRef<AbortController | null>(null);
  // Mirrors `query` so async handlers can discard stale (out-of-order) results.
  const queryRef     = useRef('');
  queryRef.current   = query;

  // Group for dropdown
  const grouped = useMemo(() => {
    const list = query.trim() ? suggestions : POPULAR_DEFAULTS;
    const map: Record<string, Suggestion[]> = {};
    for (const s of list) {
      if (!map[s.type]) map[s.type] = [];
      map[s.type].push(s);
    }
    return map;
  }, [suggestions, query]);

  const flat = useMemo(() => TYPE_ORDER.flatMap(t => grouped[t] || []), [grouped]);

  // Instant local results (no network) + debounced server results merged on top.
  const fetchSuggestions = useCallback((q: string) => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    if (abortRef.current) abortRef.current.abort();
    const term = q.trim().toLowerCase();
    if (!term) { setSuggestions([]); setIsLoading(false); return; }

    // 1) INSTANT: search the bundled dataset the moment the user types.
    loadLocalIndex().then((index) => {
      // Ignore if the query moved on while the index was loading.
      if (queryRef.current.trim().toLowerCase() !== term) return;
      setSuggestions(searchLocal(index, term));
    });

    // 2) DEBOUNCED: ask the server for festivals/food + typo-tolerant matches
    //    (its trigram tier catches "darjeling" → "Darjeeling") and merge them in.
    setIsLoading(true);
    debounceRef.current = window.setTimeout(async () => {
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      try {
        const res = await fetch(`${API_BASE}/search/suggestions?q=${encodeURIComponent(q)}&limit=10`, { signal: ctrl.signal });
        if (!res.ok) throw new Error('Search failed');
        const data = await res.json();
        const raw: any[] = data.suggestions || [];
        const fromServer: Suggestion[] = raw.map((s) => ({
          type: (s.type === 'destination' ? 'destination' : s.type === 'festival' ? 'festival' : 'food') as Suggestion['type'],
          id: s.id || s.slug,
          name: s.name,
          slug: s.slug || s.id,
          subtitle: s.region ? `${s.region}${s.category ? ' • ' + s.category : ''}` : (s.subtitle || ''),
          image: s.image || s.thumbnail_url || null,
          url: s.type === 'destination' ? `/explore/${s.slug || s.id}` : s.type === 'festival' ? '/festivals' : '/food',
        }));
        if (queryRef.current.trim().toLowerCase() !== term) return;
        setSuggestions((prev) => {
          const seen = new Set(prev.map((p) => `${p.type}:${p.slug}`));
          const extras = fromServer.filter((s) => !seen.has(`${s.type}:${s.slug}`));
          return [...prev, ...extras].slice(0, 12);
        });
      } catch (err: any) {
        // Local results already stand on their own — a server hiccup is silent.
        if (err?.name !== 'AbortError') { /* keep local suggestions */ }
      } finally {
        setIsLoading(false);
      }
    }, 220);
  }, []);

  // Run search on query change + notify parent via onChange
  useEffect(() => {
    fetchSuggestions(query);
    onChange?.(query);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [query, fetchSuggestions, onChange]);

  // Close on outside click
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => { if (autoFocus) inputRef.current?.focus(); }, [autoFocus]);
  useEffect(() => { setRecent(readRecent()); }, []);
  useEffect(() => setHighlightIndex(-1), [flat.length]);

  const handleSelect = (s: Suggestion) => {
    setQuery(s.name);
    setIsOpen(false);
    onChange?.(s.name);
    pushRecent(s.name);
    setRecent(readRecent());
    if (onSelect) onSelect(s);
    else if (s.url) navigate(s.url.startsWith('#') ? s.url.slice(1) : s.url);
  };

  const handleSubmit = (term = query) => {
    const q = term.trim();
    if (!q) return;
    setIsOpen(false);
    pushRecent(q);
    setRecent(readRecent());
    trackSearch(q); // feeds the admin search-analytics panel
    if (onSearch) onSearch(q);
    else if (onSelect) onSelect({ type: 'query', query: q });
    else navigate(`/explore?q=${encodeURIComponent(q)}`);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown')  { e.preventDefault(); setIsOpen(true); setHighlightIndex(i => Math.min(i + 1, flat.length - 1)); }
    else if (e.key === 'ArrowUp')   { e.preventDefault(); setHighlightIndex(i => Math.max(i - 1, -1)); }
    else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightIndex >= 0 && flat[highlightIndex]) handleSelect(flat[highlightIndex]);
      else handleSubmit();
    } else if (e.key === 'Escape') { setIsOpen(false); inputRef.current?.blur(); }
  };

  const sz = {
    sm: { wrap: 'h-10', input: 'text-sm pl-9 pr-8',   icon: 'w-4 h-4 left-2.5', clear: 'w-3.5 h-3.5 right-2.5' },
    md: { wrap: 'h-12', input: 'text-base pl-11 pr-10',icon: 'w-5 h-5 left-3.5', clear: 'w-4 h-4 right-3.5'   },
    lg: { wrap: 'h-14', input: 'text-lg pl-12 pr-11',  icon: 'w-5 h-5 left-4',   clear: 'w-5 h-5 right-4'     },
  }[size];

  const showDropdown = isOpen && (flat.length > 0 || isLoading);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="flex items-center gap-2">
        {/* Input wrapper */}
        <div className={`relative flex-1 ${sz.wrap}`}>
          <Search className={`absolute top-1/2 -translate-y-1/2 ${sz.icon} text-gray-400 pointer-events-none z-10`} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setIsOpen(true); }}
            // Warm the local index on focus so the first keystroke is instant.
            onFocus={() => { setIsOpen(true); loadLocalIndex(); }}
            onKeyDown={handleKey}
            placeholder={placeholder}
            autoComplete="off"
            spellCheck={false}
            className={`w-full ${sz.wrap} ${sz.input} bg-white border border-gray-200 rounded-full shadow-sm outline-none focus:border-gray-300 transition-colors text-gray-900 placeholder:text-gray-400`}
            aria-label="Search"
            aria-expanded={showDropdown}
            aria-autocomplete="list"
          />
          {query && (
            <button
              onClick={() => { setQuery(''); setSuggestions([]); onChange?.(''); inputRef.current?.focus(); }}
              className={`absolute top-1/2 -translate-y-1/2 ${sz.clear} text-gray-400 hover:text-gray-600 transition-colors`}
              aria-label="Clear"
            >
              <X className="w-full h-full" />
            </button>
          )}
        </div>

        {/* Search button */}
        {showButton && (
          <button
            onClick={() => handleSubmit()}
            className="shrink-0 h-14 px-6 bg-purple-600 hover:bg-purple-700 text-white font-poppins font-medium rounded-full flex items-center gap-2 transition-colors shadow-md text-base"
          >
            <Search className="w-5 h-5" />
            <span>Search</span>
          </button>
        )}
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: dropdownAbove ? 6 : -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: dropdownAbove ? 6 : -6 }}
            transition={{ duration: 0.14 }}
            className={`absolute z-[999] left-0 right-0
              ${dropdownAbove ? 'bottom-full mb-2' : 'top-full mt-2'}
              bg-white border border-gray-200 shadow-xl rounded-2xl overflow-hidden max-h-[70vh] overflow-y-auto`}
          >
            {/* Recent searches (empty query) */}
            {!query.trim() && recent.length > 0 && (
              <div className="py-1 border-b border-gray-100">
                <div className="px-4 pt-3 pb-1 flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold font-poppins">Recent</span>
                  <button
                    onMouseDown={(e) => { e.preventDefault(); localStorage.removeItem(RECENT_KEY); setRecent([]); }}
                    className="text-[11px] font-poppins text-gray-400 hover:text-purple-600 transition-colors"
                  >
                    Clear
                  </button>
                </div>
                {recent.map((r) => (
                  <button
                    key={r}
                    onMouseDown={(e) => { e.preventDefault(); setQuery(r); handleSubmit(r); }}
                    className="w-full px-4 py-2 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
                  >
                    <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="font-poppins text-sm text-gray-700 truncate">{r}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Popular label (empty query) */}
            {!query.trim() && (
              <div className="px-4 pt-3 pb-1 text-[11px] uppercase tracking-wider text-gray-400 font-semibold font-poppins">
                Popular Searches
              </div>
            )}

            {/* Grouped results */}
            {TYPE_ORDER.map(type => {
              const items = grouped[type] || [];
              if (!items.length) return null;
              const meta = TYPE_META[type];
              return (
                <div key={type} className="py-1">
                  {query.trim() && (
                    <div className="px-4 pt-2 pb-1 text-[11px] uppercase tracking-wider text-gray-400 font-semibold font-poppins">
                      {meta.label}
                    </div>
                  )}
                  {items.map(s => {
                    const fi = flat.indexOf(s);
                    const hi = fi === highlightIndex;
                    const Icon = meta.icon;
                    return (
                      <button
                        key={`${s.type}-${s.id}`}
                        onClick={() => handleSelect(s)}
                        onMouseEnter={() => setHighlightIndex(fi)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${hi ? 'bg-purple-50' : 'hover:bg-gray-50'}`}
                      >
                        {s.image ? (
                          <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                            <img src={s.image} alt={s.name} className="w-full h-full object-cover" loading="lazy" />
                          </div>
                        ) : (
                          <div className={`w-10 h-10 rounded-lg ${meta.bg} ${meta.color} grid place-items-center shrink-0`}>
                            <Icon className="w-4 h-4" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-poppins font-medium text-gray-900 truncate text-sm">{s.name}</div>
                          {s.subtitle && <div className="font-poppins text-xs text-gray-400 truncate">{s.subtitle}</div>}
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-300 shrink-0" />
                      </button>
                    );
                  })}
                </div>
              );
            })}

            {/* Loading */}
            {isLoading && (
              <div className="px-4 py-3 flex items-center gap-2 text-sm text-gray-400 font-poppins">
                <Loader2 className="w-4 h-4 animate-spin" /> Searching…
              </div>
            )}

            {/* No results */}
            {query.trim() && flat.length === 0 && !isLoading && (
              <div className="px-4 py-6 text-center">
                <p className="text-sm text-gray-500 font-poppins mb-2">
                  No results for "<span className="font-medium text-gray-700">{query}</span>"
                </p>
                <button
                  onClick={() => { window.location.hash = `/explore?q=${encodeURIComponent(query)}`; setIsOpen(false); }}
                  className="text-purple-600 hover:text-purple-700 font-poppins text-sm font-medium"
                >
                  Browse all destinations →
                </button>
              </div>
            )}

            {/* See all results */}
            {query.trim() && flat.length > 0 && (
              <button
                onClick={() => handleSubmit()}
                className="w-full px-4 py-3 text-sm font-poppins font-medium text-purple-600 hover:bg-purple-50 border-t border-gray-100 flex items-center justify-center gap-2"
              >
                See all results for "{query}" <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SmartSearchBar;
