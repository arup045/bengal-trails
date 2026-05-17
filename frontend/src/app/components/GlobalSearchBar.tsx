import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, MapPin, Calendar, Utensils, Loader2, ArrowRight, TrendingUp } from 'lucide-react';
import { useDebounce } from '../utils/useDebounce';

const API_BASE = import.meta.env.VITE_API_BASE || '';

interface Suggestion {
  id: string;
  name: string;
  type: 'destination' | 'festival' | 'food';
  thumbnail_url: string | null;
}

interface Grouped {
  destination: Suggestion[];
  festival: Suggestion[];
  food: Suggestion[];
}

const TYPE_CONFIG = {
  destination: { label: 'Destinations', icon: MapPin,   color: 'text-purple-600', bg: 'bg-purple-50' },
  festival:    { label: 'Festivals',    icon: Calendar,  color: 'text-amber-600',  bg: 'bg-amber-50'  },
  food:        { label: 'Food',         icon: Utensils,  color: 'text-rose-600',   bg: 'bg-rose-50'   },
};

const POPULAR: Suggestion[] = [
  { id: 'darjeeling',             name: 'Darjeeling',        type: 'destination', thumbnail_url: null },
  { id: 'sundarbans-national-park', name: 'Sundarbans',      type: 'destination', thumbnail_url: null },
  { id: 'victoria-memorial',      name: 'Victoria Memorial', type: 'destination', thumbnail_url: null },
  { id: 'durga-puja',             name: 'Durga Puja',        type: 'festival',    thumbnail_url: null },
  { id: 'ilish-maach',            name: 'Ilish Maach',       type: 'food',        thumbnail_url: null },
];

function highlight(text: string, query: string) {
  if (!query.trim()) return <span>{text}</span>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <span>{text}</span>;
  return (
    <span>
      {text.slice(0, idx)}
      <strong className="text-gray-900 font-bold">{text.slice(idx, idx + query.length)}</strong>
      {text.slice(idx + query.length)}
    </span>
  );
}

interface Props {
  size?: 'sm' | 'md' | 'lg';
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  onNavigate?: (suggestion: Suggestion) => void;
}

export function GlobalSearchBar({
  size = 'md',
  placeholder = 'Search destinations, festivals, food…',
  className = '',
  autoFocus = false,
  onNavigate,
}: Props) {
  const [query, setQuery]           = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading]       = useState(false);
  const [open, setOpen]             = useState(false);
  const [activeIdx, setActiveIdx]   = useState(-1);
  const debouncedQ                  = useDebounce(query, 300);
  const containerRef                = useRef<HTMLDivElement>(null);
  const inputRef                    = useRef<HTMLInputElement>(null);

  // Fetch suggestions
  useEffect(() => {
    if (!debouncedQ.trim() || debouncedQ.trim().length < 2) {
      setSuggestions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`${API_BASE}/api/suggestions?query=${encodeURIComponent(debouncedQ)}`)
      .then(r => r.json())
      .then(data => setSuggestions(data.suggestions || []))
      .catch(() => setSuggestions([]))
      .finally(() => setLoading(false));
  }, [debouncedQ]);

  // Click outside
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  useEffect(() => { setActiveIdx(-1); }, [suggestions]);
  useEffect(() => { if (autoFocus) inputRef.current?.focus(); }, [autoFocus]);

  const items = query.trim().length >= 2 ? suggestions : POPULAR;

  const grouped: Grouped = { destination: [], festival: [], food: [] };
  items.forEach(s => { if (grouped[s.type]) grouped[s.type].push(s); });
  const flat = [...grouped.destination, ...grouped.festival, ...grouped.food];

  const navigate = useCallback((s: Suggestion) => {
    setQuery(s.name);
    setOpen(false);
    if (onNavigate) { onNavigate(s); return; }
    if (s.type === 'destination') window.location.hash = `/explore/${s.id}`;
    else if (s.type === 'festival') window.location.hash = `/festivals`;
    else window.location.hash = `/food`;
  }, [onNavigate]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, flat.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, -1)); }
    else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIdx >= 0 && flat[activeIdx]) navigate(flat[activeIdx]);
      else if (query.trim()) { window.location.hash = `/explore?q=${encodeURIComponent(query.trim())}`; setOpen(false); }
    }
    else if (e.key === 'Escape') { setOpen(false); inputRef.current?.blur(); }
  };

  const heights = { sm: 'h-10', md: 'h-12', lg: 'h-14' };
  const pads    = { sm: 'pl-10 pr-8 text-sm', md: 'pl-11 pr-10 text-sm', lg: 'pl-12 pr-12 text-base' };
  const icons   = { sm: 'w-4 h-4 left-3', md: 'w-4 h-4 left-3.5', lg: 'w-5 h-5 left-4' };

  const showDropdown = open && (flat.length > 0 || loading);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Input */}
      <div className="relative">
        {loading
          ? <Loader2 className={`absolute top-1/2 -translate-y-1/2 ${icons[size]} text-purple-500 animate-spin pointer-events-none`} />
          : <Search className={`absolute top-1/2 -translate-y-1/2 ${icons[size]} text-gray-400 pointer-events-none`} />
        }
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKey}
          placeholder={placeholder}
          className={`w-full ${heights[size]} ${pads[size]} bg-white border border-gray-200 rounded-full shadow-sm focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all text-gray-800 placeholder-gray-400`}
          aria-label="Search"
          aria-expanded={open}
          aria-autocomplete="list"
          role="combobox"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setSuggestions([]); inputRef.current?.focus(); }}
            className={`absolute top-1/2 -translate-y-1/2 right-3.5 text-gray-400 hover:text-gray-600 p-0.5`}
            aria-label="Clear"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute z-50 left-0 right-0 top-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden max-h-[70vh] overflow-y-auto">
          {/* Header label */}
          {!query.trim() && (
            <div className="px-4 pt-3 pb-1 flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
              <TrendingUp className="w-3.5 h-3.5" /> Popular searches
            </div>
          )}

          {/* Grouped results */}
          {(['destination', 'festival', 'food'] as const).map(type => {
            const group = grouped[type];
            if (!group.length) return null;
            const cfg = TYPE_CONFIG[type];
            const Icon = cfg.icon;
            return (
              <div key={type} className="py-1">
                {query.trim() && (
                  <div className="px-4 pt-2 pb-1 text-[11px] uppercase tracking-wider text-gray-400 font-bold">
                    {cfg.label}
                  </div>
                )}
                {group.map(s => {
                  const fi = flat.indexOf(s);
                  const isActive = fi === activeIdx;
                  return (
                    <button
                      key={`${s.type}-${s.id}`}
                      onClick={() => navigate(s)}
                      onMouseEnter={() => setActiveIdx(fi)}
                      role="option"
                      aria-selected={isActive}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${isActive ? 'bg-purple-50' : 'hover:bg-gray-50'}`}
                    >
                      {/* Thumbnail */}
                      {s.thumbnail_url ? (
                        <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                          <img src={s.thumbnail_url} alt={s.name} className="w-full h-full object-cover" loading="lazy" />
                        </div>
                      ) : (
                        <div className={`w-9 h-9 rounded-xl ${cfg.bg} ${cfg.color} grid place-items-center shrink-0`}>
                          <Icon className="w-4 h-4" />
                        </div>
                      )}
                      {/* Name with highlight */}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-gray-700 truncate">
                          {highlight(s.name, query)}
                        </div>
                        <div className={`text-xs ${cfg.color} font-medium`}>{cfg.label}</div>
                      </div>
                      <ArrowRight className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-purple-400' : 'text-gray-300'}`} />
                    </button>
                  );
                })}
              </div>
            );
          })}

          {/* See all results */}
          {query.trim() && flat.length > 0 && (
            <button
              onClick={() => { window.location.hash = `/explore?q=${encodeURIComponent(query)}`; setOpen(false); }}
              className="w-full px-4 py-3 text-sm font-bold text-purple-600 hover:bg-purple-50 border-t border-gray-100 flex items-center justify-center gap-2 transition-colors"
            >
              See all results for "{query}" <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {/* No results */}
          {query.trim().length >= 2 && flat.length === 0 && !loading && (
            <div className="px-4 py-6 text-center text-sm text-gray-500">
              No results for "<span className="font-bold text-gray-700">{query}</span>"
              <button
                onClick={() => { window.location.hash = `/explore`; setOpen(false); }}
                className="block mt-2 mx-auto text-purple-600 hover:text-purple-700 font-semibold"
              >
                Browse all destinations →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}