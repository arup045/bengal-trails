import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Search, MapPin, Compass, Calendar, Utensils, Map as MapIcon,
  Heart, Home, BookOpen, Route, CornerDownLeft, X,
} from 'lucide-react';
import { getDistrictsWithMeta } from '../data/districts';
import { navigate } from '../utils/navigation';

interface Item { id: string; label: string; sub?: string; path: string; group: string; icon: JSX.Element }

const PAGE_ITEMS: Item[] = [
  { id: 'p-home', label: 'Home', path: '/', group: 'Pages', icon: <Home className="w-4 h-4" /> },
  { id: 'p-explore', label: 'Explore districts', path: '/explore', group: 'Pages', icon: <Compass className="w-4 h-4" /> },
  { id: 'p-food', label: 'Food Guide', path: '/food', group: 'Pages', icon: <Utensils className="w-4 h-4" /> },
  { id: 'p-festivals', label: 'Festival Calendar', path: '/festivals', group: 'Pages', icon: <Calendar className="w-4 h-4" /> },
  { id: 'p-planner', label: 'Trip Planner', path: '/planner', group: 'Pages', icon: <Route className="w-4 h-4" /> },
  { id: 'p-map', label: 'Interactive Map', path: '/map', group: 'Pages', icon: <MapIcon className="w-4 h-4" /> },
  { id: 'p-phrasebook', label: 'Bengali Phrasebook', path: '/phrasebook', group: 'Pages', icon: <BookOpen className="w-4 h-4" /> },
  { id: 'p-wishlist', label: 'My Wishlist', path: '/wishlist', group: 'Pages', icon: <Heart className="w-4 h-4" /> },
  { id: 'p-blog', label: 'Travel Blog', path: '/blog', group: 'Pages', icon: <BookOpen className="w-4 h-4" /> },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [places, setPlaces] = useState<Item[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Districts are tiny + always available; places are lazy-loaded on first open.
  const districtItems = useMemo<Item[]>(
    () => getDistrictsWithMeta().map((d) => ({
      id: `d-${d.slug}`, label: d.name, sub: d.region, path: `/explore/district/${d.slug}`,
      group: 'Districts', icon: <MapPin className="w-4 h-4" />,
    })),
    [],
  );

  // Global shortcut: Ctrl/⌘+K toggles; Esc closes.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    const openHandler = () => setOpen(true);
    window.addEventListener('bt:open-command', openHandler);
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('bt:open-command', openHandler); };
  }, []);

  // Lazy-load the heavy places dataset only when the palette first opens.
  useEffect(() => {
    if (!open || places.length) return;
    import('../data/places-full').then((m) => {
      setPlaces((m.placesData as any[]).map((p) => ({
        id: `pl-${p.slug}`, label: p.title, sub: `${p.district || p.region}`, path: `/explore/${p.slug}`,
        group: 'Destinations', icon: <MapPin className="w-4 h-4" />,
      })));
    }).catch(() => {});
  }, [open, places.length]);

  useEffect(() => {
    if (open) { setQuery(''); setActive(0); setTimeout(() => inputRef.current?.focus(), 30); }
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const all = [...PAGE_ITEMS, ...districtItems, ...places];
    if (!q) {
      // Default view: pages + a few districts, no giant place dump.
      return [...PAGE_ITEMS, ...districtItems.slice(0, 6)];
    }
    const scored = all.filter((it) => `${it.label} ${it.sub || ''}`.toLowerCase().includes(q));
    // Pages first, then districts, then places; cap to keep it snappy.
    const order: Record<string, number> = { Pages: 0, Districts: 1, Destinations: 2 };
    return scored.sort((a, b) => (order[a.group] - order[b.group])).slice(0, 24);
  }, [query, districtItems, places]);

  useEffect(() => { setActive(0); }, [query]);

  const go = (item: Item) => { setOpen(false); navigate(item.path); };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); if (results[active]) go(results[active]); }
  };

  if (!open) return null;

  // Group consecutive results by `group` for labelled sections.
  const groups: { name: string; items: { item: Item; index: number }[] }[] = [];
  results.forEach((item, index) => {
    const last = groups[groups.length - 1];
    if (last && last.name === item.group) last.items.push({ item, index });
    else groups.push({ name: item.group, items: [{ item, index }] });
  });

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4" role="dialog" aria-modal="true" aria-label="Quick search">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100">
          <Search className="w-5 h-5 text-gray-400 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search districts, places, pages…"
            className="flex-1 text-base text-gray-800 placeholder-gray-400 bg-transparent outline-none"
          />
          <button onClick={() => setOpen(false)} aria-label="Close" className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"><X className="w-4 h-4" /></button>
        </div>

        <div className="max-h-[55vh] overflow-y-auto py-2">
          {results.length === 0 ? (
            <div className="px-4 py-10 text-center text-gray-400 font-poppins text-sm">No matches for "{query}"</div>
          ) : groups.map((g) => (
            <div key={g.name} className="px-2 pb-1">
              <div className="px-3 py-1.5 text-[11px] font-poppins font-semibold text-gray-400 uppercase tracking-wider">{g.name}</div>
              {g.items.map(({ item, index }) => (
                <button
                  key={item.id}
                  onMouseEnter={() => setActive(index)}
                  onClick={() => go(item)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${index === active ? 'bg-purple-50 text-purple-700' : 'text-slate-700 hover:bg-gray-50'}`}
                >
                  <span className={index === active ? 'text-purple-600' : 'text-gray-400'}>{item.icon}</span>
                  <span className="flex-1 min-w-0">
                    <span className="font-poppins text-sm font-medium block truncate">{item.label}</span>
                    {item.sub && <span className="font-poppins text-xs text-gray-400 block truncate">{item.sub}</span>}
                  </span>
                  {index === active && <CornerDownLeft className="w-4 h-4 text-purple-400 shrink-0" />}
                </button>
              ))}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between px-4 py-2 border-t border-gray-100 bg-gray-50/60 text-[11px] text-gray-400 font-poppins">
          <span>↑↓ to navigate · ↵ to open</span>
          <span>Esc to close</span>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default CommandPalette;
