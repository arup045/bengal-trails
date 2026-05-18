import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, MapPin, Calendar, UtensilsCrossed, Loader2, ArrowRight } from 'lucide-react';
import { API_BASE } from '../utils/api';

export interface Suggestion {
  type: 'destination' | 'festival' | 'food';
  id: string;
  name: string;
  slug: string;
  subtitle: string;
  image: string | null;
  url: string;
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
  destination: { icon: MapPin,           color: 'text-purple-600', bg: 'bg-purple-50', label: 'Destinations' },
  festival:    { icon: Calendar,         color: 'text-amber-600',  bg: 'bg-amber-50',  label: 'Festivals'    },
  food:        { icon: UtensilsCrossed,  color: 'text-rose-600',   bg: 'bg-rose-50',   label: 'Food'         },
};

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

  const inputRef     = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef  = useRef<number | null>(null);
  const abortRef     = useRef<AbortController | null>(null);

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

  const flat = useMemo(() => {
    return (['destination', 'festival', 'food'] as Suggestion['type'][]).flatMap(t => grouped[t] || []);
  }, [grouped]);

  // Fetch suggestions from backend
  const fetchSuggestions = useCallback((q: string) => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    if (abortRef.current) abortRef.current.abort();
    if (!q.trim()) { setSuggestions([]); setIsLoading(false); return; }
    setIsLoading(true);
    debounceRef.current = window.setTimeout(async () => {
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      try {
        const res = await fetch(`${API_BASE}/suggestions?query=${encodeURIComponent(q)}`, { signal: ctrl.signal });
        if (!res.ok) throw new Error('Search failed');
        const data = await res.json();
        // normalise backend response: {suggestions:[{name,slug,type,thumbnail_url}]}
        const raw: any[] = data.suggestions || [];
        const normalised: Suggestion[] = raw.map(s => ({
          type:     (s.type === 'destination' ? 'destination' : s.type === 'festival' ? 'festival' : 'food') as Suggestion['type'],
          id:       s.id || s.slug,
          name:     s.name,
          slug:     s.slug || s.id,
          subtitle: s.region ? `${s.region}${s.category ? ' • ' + s.category : ''}` : (s.subtitle || ''),
          image:    s.thumbnail_url || s.image || null,
          url:      s.type === 'destination' ? `#/explore/${s.slug || s.id}`
                  : s.type === 'festival'   ? '#/festivals'
                  : '#/food',
        }));
        setSuggestions(normalised);
      } catch (err: any) {
        if (err?.name !== 'AbortError') setSuggestions([]);
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
  useEffect(() => setHighlightIndex(-1), [flat.length]);

  const handleSelect = (s: Suggestion) => {
    setQuery(s.name);
    setIsOpen(false);
    onChange?.(s.name);
    if (onSelect) onSelect(s);
    else if (s.url) window.location.hash = s.url.startsWith('#') ? s.url.slice(1) : s.url;
  };

  const handleSubmit = () => {
    if (!query.trim()) return;
    setIsOpen(false);
    if (onSearch) {
      onSearch(query.trim());
    } else if (onSelect) {
      onSelect({ type: 'query', query: query.trim() });
    } else {
      window.location.hash = `/explore?q=${encodeURIComponent(query.trim())}`;
    }
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
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKey}
            placeholder={placeholder}
            autoComplete="off"
            spellCheck={false}
            className={`w-full ${sz.wrap} ${sz.input} bg-white border border-gray-200 rounded-full shadow-sm outline-none focus:border-gray-300 transition-colors`}
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
            onClick={handleSubmit}
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
            {/* Popular label (empty query) */}
            {!query.trim() && (
              <div className="px-4 pt-3 pb-1 text-[11px] uppercase tracking-wider text-gray-400 font-semibold font-poppins">
                Popular Searches
              </div>
            )}

            {/* Grouped results */}
            {(['destination', 'festival', 'food'] as Suggestion['type'][]).map(type => {
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
                onClick={handleSubmit}
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
