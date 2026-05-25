import { useState, useEffect, useMemo, useRef } from 'react';
import {
  UtensilsCrossed, MapPin, Star, Search, Heart, ChefHat, Coffee, Cake,
  Flame, Leaf, Clock, DollarSign, BookOpen, ArrowRight, X,
  SlidersHorizontal, Sparkles, ChevronRight, Soup, Cookie, Award,
  ExternalLink,
} from 'lucide-react';
import { API_BASE } from '../utils/api';

// ── Types ───────────────────────────────────────────────────────────────────
interface Dish {
  id: string;
  name: string;
  bengaliName?: string;
  description: string;
  category: string;
  type?: string;
  origin?: string;
  spiceLevel?: string;
  priceRange?: string;
  whereToTry?: string[];
  image?: string;
}

interface FoodStreet {
  name: string;
  city: string;
  specialty: string;
  mustEat: string[];
}

type SortKey = 'default' | 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc';

// ── Visual config ───────────────────────────────────────────────────────────
const CATEGORY_META: Record<string, { label: string; icon: any; color: string; bg: string; ring: string }> = {
  all:        { label: 'All',         icon: UtensilsCrossed, color: 'text-purple-700', bg: 'bg-purple-50', ring: 'ring-purple-200' },
  mains:      { label: 'Main Course', icon: ChefHat,         color: 'text-orange-700', bg: 'bg-orange-50', ring: 'ring-orange-200' },
  sweets:     { label: 'Sweets',      icon: Cake,            color: 'text-pink-700',   bg: 'bg-pink-50',   ring: 'ring-pink-200'   },
  streetfood: { label: 'Street Food', icon: Cookie,          color: 'text-amber-700',  bg: 'bg-amber-50',  ring: 'ring-amber-200'  },
  snacks:     { label: 'Snacks',      icon: Soup,            color: 'text-yellow-700', bg: 'bg-yellow-50', ring: 'ring-yellow-200' },
  breakfast:  { label: 'Breakfast',   icon: Coffee,          color: 'text-blue-700',   bg: 'bg-blue-50',   ring: 'ring-blue-200'   },
  beverages:  { label: 'Drinks',      icon: Coffee,          color: 'text-teal-700',   bg: 'bg-teal-50',   ring: 'ring-teal-200'   },
};

const TYPE_BADGE: Record<string, { label: string; color: string }> = {
  veg:       { label: '🟢 Veg',     color: 'bg-green-50 text-green-700 border-green-200' },
  'non-veg': { label: '🔴 Non-Veg', color: 'bg-red-50   text-red-700   border-red-200'   },
};

const SPICE_META: Record<string, { label: string; color: string; bg: string }> = {
  mild:         { label: 'Mild',       color: 'text-green-700',  bg: 'bg-green-50'  },
  medium:       { label: 'Medium',     color: 'text-amber-700',  bg: 'bg-amber-50'  },
  'medium-hot': { label: 'Medium-Hot', color: 'text-orange-700', bg: 'bg-orange-50' },
  hot:          { label: 'Hot',        color: 'text-red-700',    bg: 'bg-red-50'    },
};

const PRICE_BANDS = [
  { key: 'all', label: 'Any price' },
  { key: '$',   label: '₹ Budget' },
  { key: '$$',  label: '₹₹ Mid' },
  { key: '$$$', label: '₹₹₹ Premium' },
];

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1630409346824-4f0e7b080087?w=800&q=80';

// ── Helpers ─────────────────────────────────────────────────────────────────
/** Parses '₹50-₹100' → 50, '₹500+' → 500, fallback Infinity. Defensive. */
function parsePriceMin(p?: string): number {
  if (!p) return Number.POSITIVE_INFINITY;
  const m = String(p).match(/(\d{2,5})/);
  return m ? parseInt(m[1], 10) : Number.POSITIVE_INFINITY;
}

/** Maps a numeric min-price to a coarse band for filtering. */
function priceBand(p?: string): '$' | '$$' | '$$$' {
  const min = parsePriceMin(p);
  if (min <= 100) return '$';
  if (min <= 400) return '$$';
  return '$$$';
}

/** Deterministic "featured" pick based on date so it changes weekly without backend support. */
function pickFeatured(dishes: Dish[]): Dish | null {
  if (!dishes.length) return null;
  const week = Math.floor(Date.now() / (1000 * 60 * 60 * 24 * 7));
  return dishes[week % dishes.length];
}

/** Group dishes by `origin` field (district/city). Falls back to "Across Bengal". */
function groupByDistrict(dishes: Dish[]): Array<{ district: string; dishes: Dish[] }> {
  const map = new Map<string, Dish[]>();
  for (const d of dishes) {
    const k = (d.origin || 'Across Bengal').trim();
    if (!map.has(k)) map.set(k, []);
    map.get(k)!.push(d);
  }
  return Array.from(map.entries())
    .map(([district, ds]) => ({ district, dishes: ds }))
    .sort((a, b) => b.dishes.length - a.dishes.length)
    .slice(0, 8);
}

const RECIPE_CARDS = [
  {
    title: 'Aloo Posto',
    desc: 'Potato in poppy-seed paste — a Bengali household staple cooked in mustard oil.',
    time: '25 min',
    difficulty: 'Easy',
    color: 'bg-amber-50 text-amber-700 ring-amber-200',
  },
  {
    title: 'Mishti Doi',
    desc: 'Caramelised sweet yoghurt fermented in earthen pots — Bengal\'s signature dessert.',
    time: 'Overnight',
    difficulty: 'Easy',
    color: 'bg-pink-50 text-pink-700 ring-pink-200',
  },
  {
    title: 'Kosha Mangsho',
    desc: 'Slow-cooked dark mutton curry with onion, yoghurt, and a long list of spices.',
    time: '90 min',
    difficulty: 'Intermediate',
    color: 'bg-orange-50 text-orange-700 ring-orange-200',
  },
];

// ── Component ───────────────────────────────────────────────────────────────
export function FoodGuidePage() {
  const [dishes,       setDishes]       = useState<Dish[]>([]);
  const [streets,      setStreets]      = useState<FoodStreet[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState<string | null>(null);

  // Filters
  const [selectedCat,   setSelectedCat]   = useState('all');
  const [selectedType,  setSelectedType]  = useState<'all' | 'veg' | 'non-veg'>('all');
  const [selectedPrice, setSelectedPrice] = useState<'all' | '$' | '$$' | '$$$'>('all');
  const [selectedSpice, setSelectedSpice] = useState<'all' | 'mild' | 'medium' | 'medium-hot' | 'hot'>('all');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [sortKey,        setSortKey]      = useState<SortKey>('default');
  const [searchQuery,    setSearchQuery]  = useState('');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [savedDishes, setSavedDishes] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem('savedDishes') || '[]')); } catch { return new Set(); }
  });
  const [openStreet, setOpenStreet] = useState<string | null>(null);

  const dishesGridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    setError(null);

    // Resilient loader: each request is independent (allSettled), and parsing is
    // guarded so a non-JSON response (e.g. an HTML error page) can't blank the
    // whole screen. We only surface an error if the DISHES truly failed to load.
    const safeJson = async (path: string, key: string) => {
      try {
        const r = await fetch(`${API_BASE}${path}`, { signal: ctrl.signal });
        if (!r.ok) return null;
        const data = await r.json();
        return Array.isArray(data?.[key]) ? data[key] : null;
      } catch { return null; }
    };

    Promise.allSettled([safeJson('/bengal/food', 'food'), safeJson('/bengal/food/streets', 'streets')])
      .then(([foodRes, streetsRes]) => {
        if (ctrl.signal.aborted) return;
        const food    = foodRes.status === 'fulfilled' ? foodRes.value : null;
        const streets = streetsRes.status === 'fulfilled' ? streetsRes.value : null;
        setDishes(food || []);
        setStreets(streets || []);
        if (!food) setError('Could not load food data. Please check your connection and refresh.');
      })
      .finally(() => { if (!ctrl.signal.aborted) setLoading(false); });

    return () => ctrl.abort();
  }, []);

  const toggleSave = (id: string) => {
    setSavedDishes(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      try { localStorage.setItem('savedDishes', JSON.stringify([...next])); } catch { /* quota / private mode */ }
      return next;
    });
  };

  const featuredDish = useMemo(() => pickFeatured(dishes), [dishes]);
  const districts    = useMemo(() => groupByDistrict(dishes), [dishes]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const result = dishes.filter(d => {
      if (selectedCat   !== 'all' && d.category !== selectedCat)  return false;
      if (selectedType  !== 'all' && d.type     !== selectedType) return false;
      if (selectedSpice !== 'all' && d.spiceLevel !== selectedSpice) return false;
      if (selectedPrice !== 'all' && priceBand(d.priceRange) !== selectedPrice) return false;
      if (selectedDistrict !== 'all' && (d.origin || '').toLowerCase() !== selectedDistrict.toLowerCase()) return false;
      if (q) {
        const hay = [d.name, d.bengaliName, d.origin, d.description].filter(Boolean).join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    switch (sortKey) {
      case 'name-asc':  return [...result].sort((a, b) => a.name.localeCompare(b.name));
      case 'name-desc': return [...result].sort((a, b) => b.name.localeCompare(a.name));
      case 'price-asc': return [...result].sort((a, b) => parsePriceMin(a.priceRange) - parsePriceMin(b.priceRange));
      case 'price-desc':return [...result].sort((a, b) => parsePriceMin(b.priceRange) - parsePriceMin(a.priceRange));
      default:          return result;
    }
  }, [dishes, selectedCat, selectedType, selectedSpice, selectedPrice, selectedDistrict, searchQuery, sortKey]);

  const categories = ['all', 'mains', 'sweets', 'streetfood', 'snacks', 'breakfast', 'beverages'];
  const activeFilterCount =
    (selectedType !== 'all' ? 1 : 0) +
    (selectedPrice !== 'all' ? 1 : 0) +
    (selectedSpice !== 'all' ? 1 : 0) +
    (selectedDistrict !== 'all' ? 1 : 0);

  const resetFilters = () => {
    setSelectedCat('all'); setSelectedType('all'); setSelectedPrice('all');
    setSelectedSpice('all'); setSelectedDistrict('all'); setSearchQuery('');
    setSortKey('default');
  };

  const jumpToDishes = () => {
    dishesGridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-white pt-16">

      {/* ────────────────────────────── HERO ──────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Vivid food imagery with light gradient overlay for text legibility only */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=1600&q=85)' }}
        />
        {/* Minimal dark overlay just for text readability — no purple blur */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/60" />

        <div className="relative max-w-6xl mx-auto px-6 py-20 sm:py-24 text-white">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm font-poppins font-medium mb-6">
            <Sparkles className="w-4 h-4 text-amber-300" aria-hidden="true" />
            <span>A taste journey across 23 districts</span>
          </div>

          <h1 className="font-poppins text-5xl sm:text-6xl lg:text-7xl font-bold mb-4 leading-tight tracking-tight">
            Bengali <span className="text-amber-300">Food</span> Guide
          </h1>
          <p className="text-purple-100 text-lg max-w-2xl leading-relaxed mb-10 font-poppins">
            From Kolkata's street stalls to North Bengal's sweet shops — every dish, every flavour,
            every story. Curated for travellers, written by locals.
          </p>

          {/* Search */}
          <div className="relative max-w-xl">
            <label htmlFor="food-search" className="sr-only">Search dishes, sweets, or street food</label>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-200" aria-hidden="true" />
            <input
              id="food-search"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search dishes, sweets, street food..."
              className="w-full pl-12 pr-12 py-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-purple-200/70 font-poppins focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-200 hover:text-white p-1 rounded-full hover:bg-white/10 transition"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Stat row */}
          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm font-poppins">
            {[
              { icon: UtensilsCrossed, label: `${dishes.length || '50+'} dishes` },
              { icon: MapPin,          label: `${streets.length || '8'} food streets` },
              { icon: Award,           label: 'GI-tagged sweets' },
              { icon: Leaf,            label: 'Veg & Non-Veg' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-purple-100">
                <Icon className="w-4 h-4 text-amber-300" aria-hidden="true" />
                <span className="font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────── FEATURED DISH ───────────────────── */}
      {featuredDish && (
        <section className="bg-gradient-to-b from-white to-purple-50/40 border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-6 py-14">
            <div className="flex items-center gap-2 mb-5">
              <Sparkles className="w-4 h-4 text-purple-600" aria-hidden="true" />
              <span className="font-poppins text-xs font-semibold text-purple-600 uppercase tracking-widest">
                Dish of the week
              </span>
            </div>
            <div className="grid lg:grid-cols-2 gap-8 items-center bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="relative h-64 lg:h-full min-h-[280px] bg-gray-100">
                <img
                  src={featuredDish.image || FALLBACK_IMG}
                  alt={featuredDish.name}
                  loading="lazy"
                  onError={e => { (e.target as HTMLImageElement).src = FALLBACK_IMG; }}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 bg-white/95 backdrop-blur-sm text-purple-700 text-xs font-poppins font-semibold px-3 py-1.5 rounded-full shadow-sm">
                  <Award className="w-3.5 h-3.5" />
                  Editor's pick
                </div>
              </div>
              <div className="p-7 sm:p-10">
                <h2 className="font-poppins text-3xl font-bold text-slate-900 leading-tight mb-2">
                  {featuredDish.name}
                </h2>
                {featuredDish.bengaliName && (
                  <p className="text-amber-700 font-poppins font-medium mb-4">{featuredDish.bengaliName}</p>
                )}
                <p className="font-poppins text-gray-600 leading-relaxed mb-6">
                  {featuredDish.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {featuredDish.origin && (
                    <span className="inline-flex items-center gap-1 text-xs font-poppins text-gray-700 bg-gray-50 ring-1 ring-gray-200 rounded-full px-3 py-1">
                      <MapPin className="w-3 h-3" />{featuredDish.origin}
                    </span>
                  )}
                  {featuredDish.spiceLevel && SPICE_META[featuredDish.spiceLevel] && (
                    <span className={`inline-flex items-center gap-1 text-xs font-poppins ${SPICE_META[featuredDish.spiceLevel].color} ${SPICE_META[featuredDish.spiceLevel].bg} rounded-full px-3 py-1`}>
                      <Flame className="w-3 h-3" />{SPICE_META[featuredDish.spiceLevel].label}
                    </span>
                  )}
                  {featuredDish.priceRange && (
                    <span className="inline-flex items-center gap-1 text-xs font-poppins text-gray-700 bg-gray-50 ring-1 ring-gray-200 rounded-full px-3 py-1">
                      <DollarSign className="w-3 h-3" />{featuredDish.priceRange}
                    </span>
                  )}
                </div>
                <button
                  onClick={jumpToDishes}
                  className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-full font-poppins font-semibold text-sm transition shadow-sm hover:shadow-md"
                >
                  Explore more dishes <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ────────────── STICKY FILTER BAR (categories + type) ────────────── */}
      <section className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="flex-1 flex items-center gap-2 overflow-x-auto scrollbar-hide pb-0.5">
              {categories.map(cat => {
                const meta   = CATEGORY_META[cat] || CATEGORY_META.all;
                const Icon   = meta.icon;
                const active = selectedCat === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCat(cat)}
                    aria-pressed={active}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full font-poppins text-sm font-medium whitespace-nowrap transition-all border focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500
                      ${active
                        ? `${meta.bg} ${meta.color} ring-1 ${meta.ring} border-transparent`
                        : 'bg-gray-50 text-gray-600 border-transparent hover:bg-gray-100'}`}
                  >
                    <Icon className="w-4 h-4" aria-hidden="true" />
                    {meta.label}
                  </button>
                );
              })}
            </div>

            {/* Mobile filters trigger */}
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden relative shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full font-poppins text-sm font-medium bg-slate-900 text-white hover:bg-slate-800 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
              aria-label={`Open filters${activeFilterCount ? ` (${activeFilterCount} active)` : ''}`}
            >
              <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-1 bg-amber-400 text-slate-900 text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Desktop secondary filters (hidden on mobile, behind sheet there) */}
          <div className="hidden lg:flex items-center gap-2 mt-3 flex-wrap">
            {/* Veg/Non-Veg */}
            <div className="flex items-center gap-1.5 bg-gray-50 rounded-full p-0.5" role="group" aria-label="Diet type">
              {(['all', 'veg', 'non-veg'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setSelectedType(t)}
                  aria-pressed={selectedType === t}
                  className={`px-3 py-1.5 rounded-full font-poppins text-xs font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500
                    ${selectedType === t
                      ? t === 'veg' ? 'bg-green-100 text-green-700'
                        : t === 'non-veg' ? 'bg-red-100 text-red-700'
                        : 'bg-slate-900 text-white'
                      : 'text-gray-600 hover:bg-white'}`}
                >
                  {t === 'all' ? 'All types' : t === 'veg' ? '🟢 Veg' : '🔴 Non-Veg'}
                </button>
              ))}
            </div>

            {/* Price band */}
            <div className="flex items-center gap-1.5 bg-gray-50 rounded-full p-0.5" role="group" aria-label="Price range">
              {PRICE_BANDS.map(b => (
                <button
                  key={b.key}
                  onClick={() => setSelectedPrice(b.key as any)}
                  aria-pressed={selectedPrice === b.key}
                  className={`px-3 py-1.5 rounded-full font-poppins text-xs font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500
                    ${selectedPrice === b.key ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-white'}`}
                >
                  {b.label}
                </button>
              ))}
            </div>

            {/* Spice */}
            <div className="flex items-center gap-1.5 bg-gray-50 rounded-full p-0.5" role="group" aria-label="Spice level">
              {(['all', 'mild', 'medium', 'medium-hot', 'hot'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setSelectedSpice(s)}
                  aria-pressed={selectedSpice === s}
                  className={`px-3 py-1.5 rounded-full font-poppins text-xs font-medium transition flex items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500
                    ${selectedSpice === s
                      ? s === 'all'
                        ? 'bg-slate-900 text-white'
                        : `${SPICE_META[s]?.bg || 'bg-purple-100'} ${SPICE_META[s]?.color || 'text-purple-700'}`
                      : 'text-gray-600 hover:bg-white'}`}
                >
                  {s !== 'all' && <Flame className="w-3 h-3" aria-hidden="true" />}
                  {s === 'all' ? 'All spice' : SPICE_META[s]?.label || s}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div className="ml-auto flex items-center gap-2">
              <label htmlFor="sort-select" className="text-xs font-poppins text-gray-500">Sort by</label>
              <select
                id="sort-select"
                value={sortKey}
                onChange={e => setSortKey(e.target.value as SortKey)}
                className="text-xs font-poppins font-medium bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="default">Recommended</option>
                <option value="name-asc">Name (A–Z)</option>
                <option value="name-desc">Name (Z–A)</option>
                <option value="price-asc">Price (low → high)</option>
                <option value="price-desc">Price (high → low)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Mobile filter bottom-sheet (lightweight inline, no extra deps) */}
        {mobileFiltersOpen && (
          <div
            className="lg:hidden fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-end"
            role="dialog"
            aria-modal="true"
            aria-label="Filters"
            onClick={() => setMobileFiltersOpen(false)}
          >
            <div
              className="bg-white w-full rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-poppins text-lg font-semibold text-slate-900">Filters</h3>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-100"
                  aria-label="Close filters"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {[
                {
                  label: 'Diet',
                  value: selectedType, set: setSelectedType as any,
                  opts: [
                    { k: 'all',     l: 'All types' },
                    { k: 'veg',     l: '🟢 Veg' },
                    { k: 'non-veg', l: '🔴 Non-Veg' },
                  ],
                },
                {
                  label: 'Price',
                  value: selectedPrice, set: setSelectedPrice as any,
                  opts: PRICE_BANDS.map(b => ({ k: b.key, l: b.label })),
                },
                {
                  label: 'Spice',
                  value: selectedSpice, set: setSelectedSpice as any,
                  opts: [
                    { k: 'all',         l: 'All spice' },
                    { k: 'mild',        l: 'Mild' },
                    { k: 'medium',      l: 'Medium' },
                    { k: 'medium-hot',  l: 'Medium-Hot' },
                    { k: 'hot',         l: 'Hot' },
                  ],
                },
              ].map(group => (
                <div key={group.label} className="mb-5">
                  <p className="font-poppins text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{group.label}</p>
                  <div className="flex flex-wrap gap-2">
                    {group.opts.map(o => (
                      <button
                        key={o.k}
                        onClick={() => group.set(o.k)}
                        aria-pressed={group.value === o.k}
                        className={`px-3 py-1.5 rounded-full text-xs font-poppins font-medium transition border
                          ${group.value === o.k
                            ? 'bg-purple-600 text-white border-purple-600'
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                      >
                        {o.l}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {districts.length > 0 && (
                <div className="mb-5">
                  <p className="font-poppins text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">District</p>
                  <select
                    value={selectedDistrict}
                    onChange={e => setSelectedDistrict(e.target.value)}
                    className="w-full text-sm font-poppins font-medium bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">All districts</option>
                    {districts.map(d => (
                      <option key={d.district} value={d.district}>{d.district} ({d.dishes.length})</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={() => { resetFilters(); }}
                  className="flex-1 py-3 rounded-full font-poppins font-medium text-sm border border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  Reset
                </button>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="flex-1 py-3 rounded-full font-poppins font-semibold text-sm bg-purple-600 text-white hover:bg-purple-700"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ────────────────────── DISHES GRID ────────────────────── */}
      <section ref={dishesGridRef} className="max-w-6xl mx-auto px-6 py-12">
        {/* Result count + sort summary */}
        {!loading && !error && (
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <p className="font-poppins text-sm text-gray-500">
              Showing <span className="font-semibold text-slate-900">{filtered.length}</span> of {dishes.length} dishes
              {searchQuery && <> for "<span className="font-medium text-slate-900">{searchQuery}</span>"</>}
            </p>
            {activeFilterCount > 0 && (
              <button
                onClick={resetFilters}
                className="text-xs font-poppins font-medium text-purple-600 hover:text-purple-700 underline-offset-2 hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {error ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">⚠️</div>
            <h3 className="font-poppins text-xl font-semibold text-slate-900 mb-2">{error}</h3>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-5 py-2.5 bg-purple-600 text-white rounded-full font-poppins text-sm font-medium hover:bg-purple-700 transition"
            >
              Refresh
            </button>
          </div>
        ) : loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-3xl h-80 animate-pulse" aria-hidden="true" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-purple-50/30 rounded-3xl border border-purple-100">
            <div className="text-6xl mb-4" aria-hidden="true">🍽️</div>
            <h3 className="font-poppins text-xl font-semibold text-slate-900 mb-2">No dishes match those filters</h3>
            <p className="text-gray-500 font-poppins text-sm mb-5">Try clearing some filters or searching for something else.</p>
            <button
              onClick={resetFilters}
              className="px-5 py-2.5 bg-purple-600 text-white rounded-full font-poppins text-sm font-medium hover:bg-purple-700 transition"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(dish => {
              const catMeta   = CATEGORY_META[dish.category] || CATEGORY_META.all;
              const typeBadge = TYPE_BADGE[dish.type || ''];
              const spiceMeta = dish.spiceLevel ? SPICE_META[dish.spiceLevel] : null;
              const saved     = savedDishes.has(dish.id);
              const CatIcon   = catMeta.icon;
              return (
                <article
                  key={dish.id}
                  className="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden bg-gray-100">
                    <img
                      src={dish.image || FALLBACK_IMG}
                      alt={`${dish.name}${dish.origin ? ` from ${dish.origin}` : ''}`}
                      loading="lazy"
                      onError={e => { (e.target as HTMLImageElement).src = FALLBACK_IMG; }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" aria-hidden="true" />
                    <div className={`absolute top-3 left-3 flex items-center gap-1 ${catMeta.bg} ${catMeta.color} rounded-full px-2.5 py-1 text-xs font-poppins font-semibold shadow-sm`}>
                      <CatIcon className="w-3 h-3" aria-hidden="true" />{catMeta.label}
                    </div>
                    <button
                      onClick={() => toggleSave(dish.id)}
                      aria-label={saved ? `Remove ${dish.name} from saved` : `Save ${dish.name}`}
                      aria-pressed={saved}
                      className="absolute top-3 right-3 w-9 h-9 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
                    >
                      <Heart className={`w-4 h-4 ${saved ? 'fill-rose-500 text-rose-500' : 'text-gray-500'}`} />
                    </button>
                    {typeBadge && (
                      <div className={`absolute bottom-3 left-3 text-xs font-poppins font-semibold px-2 py-0.5 rounded-full border ${typeBadge.color} backdrop-blur-sm`}>
                        {typeBadge.label}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0">
                        <h3 className="font-poppins text-lg font-semibold text-slate-900 leading-tight">{dish.name}</h3>
                        {dish.bengaliName && <p className="text-amber-700 text-sm font-medium mt-0.5">{dish.bengaliName}</p>}
                      </div>
                      {dish.priceRange && (
                        <span className="font-poppins text-xs text-gray-700 whitespace-nowrap bg-gray-50 ring-1 ring-gray-200 rounded-full px-2.5 py-0.5 shrink-0">
                          {dish.priceRange}
                        </span>
                      )}
                    </div>
                    <p className="font-poppins text-sm text-gray-600 leading-relaxed line-clamp-2 mb-4">
                      {dish.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {dish.origin && (
                        <span className="inline-flex items-center gap-1 text-xs font-poppins text-gray-700 bg-gray-50 ring-1 ring-gray-200 rounded-full px-2.5 py-1">
                          <MapPin className="w-3 h-3" aria-hidden="true" />{dish.origin}
                        </span>
                      )}
                      {spiceMeta && (
                        <span className={`inline-flex items-center gap-1 text-xs font-poppins ${spiceMeta.color} ${spiceMeta.bg} rounded-full px-2.5 py-1`}>
                          <Flame className="w-3 h-3" aria-hidden="true" />{spiceMeta.label}
                        </span>
                      )}
                    </div>
                    {dish.whereToTry && dish.whereToTry.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="font-poppins text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Best places to try</p>
                        <div className="flex flex-wrap gap-1.5">
                          {dish.whereToTry.slice(0, 3).map(place => (
                            <span key={place} className="text-xs font-poppins text-purple-700 bg-purple-50 ring-1 ring-purple-100 rounded-full px-2.5 py-1">{place}</span>
                          ))}
                        </div>
                        <a
                          href="/food-map"
                          className="mt-3 inline-flex items-center gap-1 text-xs font-poppins font-medium text-purple-600 hover:text-purple-700 transition"
                        >
                          Find restaurants on map <ChevronRight className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* ───────────────────── BY DISTRICT ───────────────────── */}
      {districts.length > 1 && (
        <section className="bg-gradient-to-b from-purple-50/30 to-white border-t border-purple-100">
          <div className="max-w-6xl mx-auto px-6 py-14">
            <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
              <div>
                <span className="font-poppins text-xs font-semibold text-purple-600 uppercase tracking-widest">Explore by region</span>
                <h2 className="font-poppins text-3xl sm:text-4xl font-bold text-slate-900 mt-2 leading-tight">
                  Signature dishes, district by district
                </h2>
              </div>
              <a
                href="/explore"
                className="hidden sm:inline-flex items-center gap-1.5 text-sm font-poppins font-medium text-purple-600 hover:text-purple-700"
              >
                Explore destinations <ChevronRight className="w-4 h-4" />
              </a>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 scrollbar-hide">
              {districts.map(({ district, dishes: ds }) => (
                <button
                  key={district}
                  onClick={() => { setSelectedDistrict(district); jumpToDishes(); }}
                  className="snap-start shrink-0 w-64 text-left bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-purple-600" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-poppins text-base font-semibold text-slate-900 leading-tight truncate">{district}</p>
                      <p className="font-poppins text-xs text-gray-500">{ds.length} dish{ds.length === 1 ? '' : 'es'}</p>
                    </div>
                  </div>
                  <ul className="space-y-1 mb-3">
                    {ds.slice(0, 3).map(d => (
                      <li key={d.id} className="flex items-center gap-1.5 text-sm font-poppins text-gray-700 truncate">
                        <span className="w-1 h-1 bg-amber-500 rounded-full shrink-0" aria-hidden="true" />
                        {d.name}
                      </li>
                    ))}
                  </ul>
                  <span className="inline-flex items-center gap-1 text-xs font-poppins font-medium text-purple-600">
                    View dishes <ChevronRight className="w-3 h-3" />
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ───────────────────── FOOD STREETS ───────────────────── */}
      {streets.length > 0 && (
        <section className="bg-gradient-to-br from-amber-50/60 to-orange-50/60 border-t border-amber-100">
          <div className="max-w-6xl mx-auto px-6 py-16">
            <div className="text-center mb-12">
              <span className="font-poppins text-xs font-semibold text-amber-700 uppercase tracking-widest">Street food culture</span>
              <h2 className="font-poppins text-3xl sm:text-4xl font-bold text-slate-900 mt-2 leading-tight">
                Bengal's best food streets
              </h2>
              <p className="text-gray-600 font-poppins mt-3 max-w-lg mx-auto">
                Where the real flavours live — down the lanes, past the chai stalls.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {streets.map((street, i) => {
                const isOpen = openStreet === street.name;
                return (
                  <button
                    key={`${street.name}-${i}`}
                    onClick={() => setOpenStreet(isOpen ? null : street.name)}
                    aria-expanded={isOpen}
                    className="text-left bg-white rounded-2xl p-5 border border-amber-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                  >
                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
                      <MapPin className="w-5 h-5 text-amber-700" aria-hidden="true" />
                    </div>
                    <h3 className="font-poppins text-base font-semibold text-slate-900 mb-1">{street.name}</h3>
                    <p className="font-poppins text-xs text-amber-700 font-medium mb-2">{street.city}</p>
                    <p className="font-poppins text-xs text-gray-600 line-clamp-2">{street.specialty}</p>
                    {isOpen && street.mustEat?.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-amber-100">
                        <p className="font-poppins text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Must eat</p>
                        <div className="flex flex-wrap gap-1">
                          {street.mustEat.map(item => (
                            <span key={item} className="text-xs font-poppins text-orange-700 bg-orange-50 ring-1 ring-orange-100 rounded-full px-2 py-0.5">{item}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ───────────────────── FROM THE KITCHEN ───────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <span className="font-poppins text-xs font-semibold text-purple-600 uppercase tracking-widest">From the kitchen</span>
          <h2 className="font-poppins text-3xl sm:text-4xl font-bold text-slate-900 mt-2 leading-tight">
            Try Bengal at home
          </h2>
          <p className="text-gray-600 font-poppins mt-3 max-w-lg mx-auto">
            Easy classics you can recreate — no special equipment, just a pan, a few spices, and patience.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {RECIPE_CARDS.map(r => (
            <div key={r.title} className="bg-white rounded-3xl p-7 border border-gray-100 shadow-sm hover:shadow-md transition flex flex-col">
              <div className={`inline-flex items-center gap-1.5 self-start ring-1 rounded-full px-3 py-1 mb-4 ${r.color}`}>
                <ChefHat className="w-3.5 h-3.5" aria-hidden="true" />
                <span className="font-poppins text-xs font-semibold">{r.difficulty}</span>
              </div>
              <h3 className="font-poppins text-xl font-bold text-slate-900 mb-2">{r.title}</h3>
              <p className="font-poppins text-sm text-gray-600 leading-relaxed flex-1 mb-5">{r.desc}</p>
              <div className="flex items-center justify-between text-xs font-poppins text-gray-500">
                <span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" aria-hidden="true" />{r.time}</span>
                <span className="inline-flex items-center gap-1 text-purple-600 font-medium"><ChefHat className="w-3.5 h-3.5" aria-hidden="true" />{r.difficulty}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ───────────────────── FOOD CULTURE TIPS ───────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="grid lg:grid-cols-3 gap-6">
          {[
            {
              icon: BookOpen, title: 'The Bengali Thali', color: 'bg-purple-50 text-purple-700 ring-purple-100',
              desc: 'A traditional Bengali meal starts with bitter (shukto), moves through fritters, dals, fish curries, chutneys, and ends with mishti doi. Every dish has a purpose.',
            },
            {
              icon: Clock, title: 'When to visit for food', color: 'bg-blue-50 text-blue-700 ring-blue-100',
              desc: 'Monsoon (June–Sept) is Ilish season. Winter brings Nolen Gur (date palm jaggery) sweets. Durga Puja sees the best street food pop-ups.',
            },
            {
              icon: DollarSign, title: 'Budget eating in Bengal', color: 'bg-green-50 text-green-700 ring-green-100',
              desc: 'A full thali costs ₹80–150. Street puchka is ₹20–50. Even upscale Bengali restaurants rarely exceed ₹600 per person.',
            },
          ].map(({ icon: Icon, title, color, desc }) => (
            <div key={title} className="bg-gray-50 rounded-3xl p-7 border border-gray-100">
              <div className={`w-12 h-12 rounded-2xl ${color} ring-1 flex items-center justify-center mb-5`}>
                <Icon className="w-6 h-6" aria-hidden="true" />
              </div>
              <h3 className="font-poppins text-lg font-semibold text-slate-900 mb-3">{title}</h3>
              <p className="font-poppins text-sm text-gray-600 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ───────────────────── FOOD MAP BRIDGE ───────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-purple-700 to-slate-900 p-8 sm:p-12 text-white">
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-amber-400/20 rounded-full blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-purple-400/20 rounded-full blur-3xl" aria-hidden="true" />
          <div className="relative grid md:grid-cols-2 gap-6 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 ring-1 ring-white/20 rounded-full px-3 py-1 mb-4 text-xs font-poppins font-medium">
                <MapPin className="w-3.5 h-3.5 text-amber-300" />
                Interactive food map
              </div>
              <h2 className="font-poppins text-2xl sm:text-3xl font-bold leading-tight mb-3">
                Find real restaurants near every dish
              </h2>
              <p className="text-purple-100 font-poppins leading-relaxed">
                Browse the full restaurant directory — by cuisine, area, price, and rating. Hand-picked
                from across West Bengal so you eat where the locals eat.
              </p>
            </div>
            <div className="flex md:justify-end">
              <a
                href="/food-map"
                className="inline-flex items-center gap-2 bg-white text-purple-700 hover:bg-amber-100 px-6 py-3.5 rounded-full font-poppins font-semibold text-sm transition shadow-lg"
              >
                Open the food map <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────── PLAN A FOOD TRIP CTA ───────────────────── */}
      <section className="bg-slate-900 py-16 text-center text-white">
        <div className="max-w-2xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 bg-white/5 ring-1 ring-white/10 rounded-full px-3 py-1 mb-5">
            <Star className="w-3.5 h-3.5 text-amber-300" aria-hidden="true" />
            <span className="font-poppins text-xs font-medium text-amber-200">Ready to taste Bengal?</span>
          </div>
          <h2 className="font-poppins text-3xl sm:text-4xl font-bold mb-4 leading-tight">
            Build a trip around the food
          </h2>
          <p className="text-gray-400 font-poppins mb-8 leading-relaxed">
            Use the Bengal Trails planner to map your route, lock in dates, and bookmark the dishes you
            want to try at every stop.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a
              href="/planner"
              className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-7 py-3.5 rounded-full font-poppins font-semibold transition shadow-sm hover:shadow-md"
            >
              Plan a food trip <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="/itinerary-builder"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white ring-1 ring-white/20 px-7 py-3.5 rounded-full font-poppins font-semibold transition"
            >
              AI itinerary builder
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
