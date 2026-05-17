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
  /** Visual size: 'lg' for hero, 'md' for default, 'sm' for header */
  size?: 'sm' | 'md' | 'lg';
  /** Custom placeholder; defaults to a tourism-friendly phrase */
  placeholder?: string;
  /** Auto-focus on mount */
  autoFocus?: boolean;
  /** Called when user picks a suggestion or hits Enter */
  onSelect?: (suggestion: Suggestion | { type: 'query'; query: string }) => void;
  /** Optional className */
  className?: string;
  /** When true, dropdown is rendered above the input instead of below */
  dropdownAbove?: boolean;
}

const TYPE_META: Record<Suggestion['type'], { icon: any; color: string; bg: string; label: string }> = {
  destination: { icon: MapPin, color: 'text-purple-600', bg: 'bg-purple-50', label: 'Destinations' },
  festival:    { icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-50', label: 'Festivals' },
  food:        { icon: UtensilsCrossed, color: 'text-rose-600', bg: 'bg-rose-50', label: 'Food' },
};

// Popular default suggestions when input is empty
const POPULAR_DEFAULTS: Suggestion[] = [
  { type: 'destination', id: 'darjeeling', name: 'Darjeeling', slug: 'darjeeling', subtitle: 'North Bengal • Hill station', image: null, url: '#/explore/darjeeling' },
  { type: 'destination', id: 'sundarbans-national-park', name: 'Sundarbans', slug: 'sundarbans-national-park', subtitle: 'South Bengal • Wildlife', image: null, url: '#/explore/sundarbans-national-park' },
  { type: 'destination', id: 'victoria-memorial-kolkata', name: 'Victoria Memorial', slug: 'victoria-memorial-kolkata', subtitle: 'Kolkata • Heritage', image: null, url: '#/explore/victoria-memorial-kolkata' },
  { type: 'festival', id: 'durga-puja', name: 'Durga Puja', slug: 'durga-puja', subtitle: 'দুর্গা পূজা • Sep–Oct', image: null, url: '#/festivals' },
];

export function SmartSearchBar({
  size = 'md',
  placeholder = 'Search destinations, festivals, food…',
  autoFocus = false,
  onSelect,
  className = '',
  dropdownAbove = false,
  showButton = false,
}: SmartSearchBarProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Group suggestions by type for the dropdown
  const grouped = useMemo(() => {
    const list = query.trim() ? suggestions : POPULAR_DEFAULTS;
    const map: Record<string, Suggestion[]> = {};
    for (const s of list) {
      if (!map[s.type]) map[s.type] = [];
      map[s.type].push(s);
    }
    return map;
  }, [suggestions, query]);

  const flatSuggestions = useMemo(() => {
    const order: Suggestion['type'][] = ['destination', 'festival', 'food'];
    return order.flatMap((t) => grouped[t] || []);
  }, [grouped]);

  // Debounced search
  const performSearch = useCallback((q: string) => {
    if (debounceTimer.current) window.clearTimeout(debounceTimer.current);
    if (abortRef.current) abortRef.current.abort();
    if (!q.trim()) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    debounceTimer.current = window.setTimeout(async () => {
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      try {
        const res = await fetch(`${API_BASE}/search/suggestions?q=${encodeURIComponent(q)}&limit=10`, { signal: ctrl.signal });
        if (!res.ok) throw new Error('Search failed');
        const data = await res.json();
        setSuggestions(data.suggestions || []);
      } catch (err: any) {
        if (err?.name !== 'AbortError') setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 250); // 250ms debounce — feels instant but doesn't hammer backend
  }, []);

  useEffect(() => {
    performSearch(query);
    return () => {
      if (debounceTimer.current) window.clearTimeout(debounceTimer.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [query, performSearch]);

  // Click outside to close
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Auto-focus
  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  // Reset highlight when suggestions change
  useEffect(() => setHighlightIndex(-1), [flatSuggestions.length]);

  const handleSelect = (s: Suggestion) => {
    setQuery(s.name);
    setIsOpen(false);
    if (onSelect) onSelect(s);
    else if (s.url) window.location.hash = s.url.startsWith('#') ? s.url.slice(1) : s.url;
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIsOpen(true);
      setHighlightIndex((i) => Math.min(i + 1, flatSuggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightIndex >= 0 && flatSuggestions[highlightIndex]) {
        handleSelect(flatSuggestions[highlightIndex]);
      } else if (query.trim()) {
        // Free-text submit → go to explore filtered
        setIsOpen(false);
        if (onSelect) onSelect({ type: 'query', query: query.trim() });
        else window.location.hash = `#/explore?q=${encodeURIComponent(query.trim())}`;
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  // Size styles
  const sizeClasses = {
    sm: { container: 'h-10', input: 'text-sm pl-10 pr-9', icon: 'w-4 h-4 left-3', clear: 'w-4 h-4 right-3' },
    md: { container: 'h-12', input: 'text-base pl-11 pr-10', icon: 'w-5 h-5 left-3.5', clear: 'w-4 h-4 right-3.5' },
    lg: { container: 'h-14', input: 'text-lg pl-12 pr-11', icon: 'w-5 h-5 left-4', clear: 'w-5 h-5 right-4' },
  }[size];

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="flex items-center gap-2">
        <div className={`relative flex-1 ${sizeClasses.container}`}>
        <Search className={`absolute top-1/2 -translate-y-1/2 ${sizeClasses.icon} text-gray-400 pointer-events-none`} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKey}
          placeholder={placeholder}
          className={`w-full ${sizeClasses.container} ${sizeClasses.input} bg-white border border-gray-200 rounded-full shadow-sm focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all`}
          aria-label="Search"
          aria-expanded={isOpen}
          aria-autocomplete="list"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setSuggestions([]); inputRef.current?.focus(); }}
            className={`absolute top-1/2 -translate-y-1/2 ${sizeClasses.clear} text-gray-400 hover:text-gray-600`}
            aria-label="Clear search"
          >
            <X />
          </button>
        )}
        </div>
        {showButton && (
          <button onClick={() => { if (query.trim()) { window.location.hash = '/explore?q=' + encodeURIComponent(query.trim()); setIsOpen(false); } }}
            className="shrink-0 h-14 px-6 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-full flex items-center gap-2 transition-all shadow-md text-base">
            <Search className="w-5 h-5" />
            <span>Search</span>
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (flatSuggestions.length > 0 || isLoading) && (
          <motion.div
            initial={{ opacity: 0, y: dropdownAbove ? 8 : -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: dropdownAbove ? 8 : -8 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-50 left-0 right-0 ${dropdownAbove ? 'bottom-full mb-2' : 'top-full mt-2'} bg-white border border-gray-200 shadow-xl rounded-2xl overflow-hidden max-h-[70vh] overflow-y-auto`}
          >
            {!query.trim() && (
              <div className="px-4 pt-3 pb-1 text-[11px] uppercase tracking-wider text-gray-400 font-semibold">
                Popular searches
              </div>
            )}

            {(['destination', 'festival', 'food'] as const).map((type) => {
              const items = grouped[type] || [];
              if (items.length === 0) return null;
              const meta = TYPE_META[type];
              return (
                <div key={type} className="py-1">
                  {query.trim() && (
                    <div className="px-4 pt-2 pb-1 text-[11px] uppercase tracking-wider text-gray-400 font-semibold">
                      {meta.label}
                    </div>
                  )}
                  {items.map((s) => {
                    const flatIdx = flatSuggestions.indexOf(s);
                    const isHi = flatIdx === highlightIndex;
                    const Icon = meta.icon;
                    return (
                      <button
                        key={`${s.type}-${s.id}`}
                        onClick={() => handleSelect(s)}
                        onMouseEnter={() => setHighlightIndex(flatIdx)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${isHi ? 'bg-purple-50' : 'hover:bg-gray-50'}`}
                      >
                        {s.image ? (
                          <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                            <img src={s.image} alt={s.name} className="w-full h-full object-cover" loading="lazy" />
                          </div>
                        ) : (
                          <div className={`w-10 h-10 rounded-lg ${meta.bg} ${meta.color} grid place-items-center flex-shrink-0`}>
                            <Icon className="w-4 h-4" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">{s.name}</div>
                          {s.subtitle && (
                            <div className="text-xs text-gray-500 truncate">{s.subtitle}</div>
                          )}
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                      </button>
                    );
                  })}
                </div>
              );
            })}

            {isLoading && (
              <div className="px-4 py-3 flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" /> Searching…
              </div>
            )}

            {query.trim() && flatSuggestions.length === 0 && !isLoading && (
              <div className="px-4 py-6 text-center text-sm text-gray-500">
                No results for "<span className="font-medium text-gray-700">{query}</span>"
                <button
                  onClick={() => {
                    window.location.hash = `#/explore?q=${encodeURIComponent(query)}`;
                    setIsOpen(false);
                  }}
                  className="block mt-2 mx-auto text-purple-600 hover:text-purple-700 font-medium"
                >
                  Browse all destinations →
                </button>
              </div>
            )}

            {query.trim() && flatSuggestions.length > 0 && (
              <button
                onClick={() => {
                  window.location.hash = `#/explore?q=${encodeURIComponent(query)}`;
                  setIsOpen(false);
                }}
                className="w-full px-4 py-3 text-sm font-medium text-purple-600 hover:bg-purple-50 border-t border-gray-100 flex items-center justify-center gap-2"
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
