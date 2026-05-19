import { useState, useEffect, useRef } from 'react';
import { UtensilsCrossed, MapPin, Star, Search, Heart, ChefHat, Coffee, Cake, Flame, Leaf, Clock, DollarSign, BookOpen, ArrowRight, X } from 'lucide-react';
import { API_BASE } from '../utils/api';

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

const CATEGORY_META: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  all:        { label: 'All',         icon: UtensilsCrossed, color: 'text-purple-600', bg: 'bg-purple-50' },
  mains:      { label: 'Main Course', icon: ChefHat,         color: 'text-orange-600', bg: 'bg-orange-50' },
  sweets:     { label: 'Sweets',      icon: Cake,            color: 'text-pink-600',   bg: 'bg-pink-50'   },
  streetfood: { label: 'Street Food', icon: MapPin,          color: 'text-yellow-600', bg: 'bg-yellow-50' },
  snacks:     { label: 'Snacks',      icon: Coffee,          color: 'text-amber-600',  bg: 'bg-amber-50'  },
  breakfast:  { label: 'Breakfast',   icon: Clock,           color: 'text-blue-600',   bg: 'bg-blue-50'   },
  beverages:  { label: 'Drinks',      icon: Coffee,          color: 'text-teal-600',   bg: 'bg-teal-50'   },
};

const TYPE_BADGE: Record<string, { label: string; color: string }> = {
  veg:       { label: '🟢 Veg',     color: 'bg-green-100 text-green-700 border-green-200' },
  'non-veg': { label: '🔴 Non-Veg', color: 'bg-red-100   text-red-700   border-red-200'   },
};

const SPICE_COLOR: Record<string, string> = {
  mild: 'text-green-500', medium: 'text-amber-500',
  'medium-hot': 'text-orange-500', hot: 'text-red-500',
};

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1630409346824-4f0e7b080087?w=800&q=80';

export function FoodGuidePage() {
  const [dishes,       setDishes]       = useState<Dish[]>([]);
  const [streets,      setStreets]      = useState<FoodStreet[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [selectedCat,  setSelectedCat]  = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [searchQuery,  setSearchQuery]  = useState('');
  const [savedDishes,  setSavedDishes]  = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem('savedDishes') || '[]')); } catch { return new Set(); }
  });
  const [openStreet, setOpenStreet] = useState<string | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    Promise.all([
      fetch(`${API_BASE}/bengal/food`,         { signal: ctrl.signal }).then(r => r.ok ? r.json() : { food: [] }),
      fetch(`${API_BASE}/bengal/food/streets`,  { signal: ctrl.signal }).then(r => r.ok ? r.json() : { streets: [] }),
    ])
      .then(([f, s]) => { setDishes(f.food || []); setStreets(s.streets || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, []);

  const toggleSave = (id: string) => {
    setSavedDishes(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      localStorage.setItem('savedDishes', JSON.stringify([...next]));
      return next;
    });
  };

  const filtered = dishes.filter(d => {
    const matchCat    = selectedCat  === 'all' || d.category === selectedCat;
    const matchType   = selectedType === 'all' || d.type === selectedType;
    const matchSearch = !searchQuery  ||
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.origin || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchType && matchSearch;
  });

  const categories = ['all', 'mains', 'sweets', 'streetfood', 'snacks', 'breakfast', 'beverages'];

  return (
    <div className="min-h-screen bg-white pt-16">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-amber-900 via-orange-900 to-red-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=1400&q=60)' }} />
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/80 via-orange-900/70 to-red-900/80" />
        <div className="relative max-w-6xl mx-auto px-6 py-20">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <UtensilsCrossed className="w-4 h-4 text-amber-300" />
            Bengali Cuisine — A World in Every Bite
          </div>
          <h1 className="font-poppins text-5xl sm:text-6xl font-bold mb-4 leading-tight">Bengali Food Guide</h1>
          <p className="text-amber-200 text-lg max-w-2xl leading-relaxed mb-10">
            From the spicy streets of Kolkata to the sweet shops of North Bengal —
            explore every dish, every flavour, every story.
          </p>
          {/* Search */}
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-300" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search dishes, sweets, street food..."
              className="w-full pl-12 pr-10 py-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-amber-300/70 font-poppins focus:outline-none focus:border-amber-300 transition-colors"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-300 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── Quick Stats ───────────────────────────────────────────── */}
      <section className="bg-amber-50 border-b border-amber-100 py-5">
        <div className="max-w-6xl mx-auto px-6 flex gap-8 overflow-x-auto">
          {[
            { icon: UtensilsCrossed, label: `${dishes.length || '30+'} Dishes`,          color: 'text-orange-600' },
            { icon: MapPin,          label: `${streets.length || '8'} Food Streets`,     color: 'text-amber-600'  },
            { icon: Star,            label: 'GI Tag Protected',                           color: 'text-yellow-600' },
            { icon: Leaf,            label: 'Veg & Non-Veg',                             color: 'text-green-600'  },
          ].map(({ icon: Icon, label, color }) => (
            <div key={label} className={`flex items-center gap-2 ${color} whitespace-nowrap font-poppins text-sm font-medium`}>
              <Icon className="w-4 h-4" />{label}
            </div>
          ))}
        </div>
      </section>

      {/* ── Category Filter ───────────────────────────────────────── */}
      <section className="sticky top-16 z-30 bg-white border-b border-gray-100 py-4 shadow-sm">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-3 overflow-x-auto pb-1">
            {categories.map(cat => {
              const meta   = CATEGORY_META[cat] || CATEGORY_META.all;
              const Icon   = meta.icon;
              const active = selectedCat === cat;
              return (
                <button key={cat} onClick={() => setSelectedCat(cat)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-poppins text-sm font-medium whitespace-nowrap transition-all border
                    ${active ? `${meta.bg} ${meta.color} border-current` : 'bg-gray-50 text-gray-500 border-transparent hover:bg-gray-100'}`}>
                  <Icon className="w-4 h-4" />
                  {meta.label}
                </button>
              );
            })}
            <div className="w-px h-6 bg-gray-200 mx-1 shrink-0" />
            {(['all', 'veg', 'non-veg'] as const).map(type => (
              <button key={type} onClick={() => setSelectedType(type)}
                className={`px-3 py-2 rounded-full font-poppins text-sm font-medium whitespace-nowrap transition-all border
                  ${selectedType === type
                    ? type === 'veg' ? 'bg-green-100 text-green-700 border-green-200'
                      : type === 'non-veg' ? 'bg-red-100 text-red-700 border-red-200'
                      : 'bg-slate-900 text-white border-transparent'
                    : 'bg-gray-50 text-gray-500 border-transparent hover:bg-gray-100'}`}>
                {type === 'all' ? 'All Types' : type === 'veg' ? '🟢 Veg' : '🔴 Non-Veg'}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Dishes Grid ───────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-3xl h-72 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="font-poppins text-xl font-semibold text-slate-900 mb-2">No dishes found</h3>
            <p className="text-gray-500 font-poppins text-sm">Try adjusting your filters</p>
            <button onClick={() => { setSelectedCat('all'); setSelectedType('all'); setSearchQuery(''); }}
              className="mt-4 px-4 py-2 bg-amber-100 text-amber-700 rounded-full font-poppins text-sm font-medium hover:bg-amber-200 transition-colors">
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <p className="font-poppins text-sm text-gray-500 mb-6">
              Showing <span className="font-semibold text-slate-900">{filtered.length}</span> dishes
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(dish => {
                const catMeta   = CATEGORY_META[dish.category] || CATEGORY_META.all;
                const typeBadge = TYPE_BADGE[dish.type || ''];
                const saved     = savedDishes.has(dish.id);
                const CatIcon   = catMeta.icon;
                return (
                  <div key={dish.id}
                    className="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden bg-gray-100">
                      <img
                        src={dish.image || FALLBACK_IMG}
                        alt={dish.name}
                        loading="lazy"
                        onError={e => { (e.target as HTMLImageElement).src = FALLBACK_IMG; }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      <div className={`absolute top-3 left-3 flex items-center gap-1 ${catMeta.bg} ${catMeta.color} rounded-full px-2.5 py-1 text-xs font-poppins font-semibold`}>
                        <CatIcon className="w-3 h-3" />{catMeta.label}
                      </div>
                      <button onClick={() => toggleSave(dish.id)}
                        className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform">
                        <Heart className={`w-4 h-4 ${saved ? 'fill-rose-500 text-rose-500' : 'text-gray-400'}`} />
                      </button>
                      {typeBadge && (
                        <div className={`absolute bottom-3 left-3 text-xs font-poppins font-semibold px-2 py-0.5 rounded-full border ${typeBadge.color}`}>
                          {typeBadge.label}
                        </div>
                      )}
                    </div>
                    {/* Content */}
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h3 className="font-poppins text-lg font-semibold text-slate-900 leading-tight">{dish.name}</h3>
                          {dish.bengaliName && <p className="text-amber-600 text-sm font-medium mt-0.5">{dish.bengaliName}</p>}
                        </div>
                        {dish.priceRange && (
                          <span className="font-poppins text-xs text-gray-500 whitespace-nowrap bg-gray-50 rounded-full px-2 py-0.5 shrink-0">
                            {dish.priceRange}
                          </span>
                        )}
                      </div>
                      <p className="font-poppins text-sm text-gray-600 leading-relaxed line-clamp-2 mb-4">{dish.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {dish.origin && (
                          <span className="inline-flex items-center gap-1 text-xs font-poppins text-gray-500 bg-gray-50 rounded-full px-2.5 py-1">
                            <MapPin className="w-3 h-3" />{dish.origin}
                          </span>
                        )}
                        {dish.spiceLevel && (
                          <span className={`inline-flex items-center gap-1 text-xs font-poppins ${SPICE_COLOR[dish.spiceLevel] || 'text-gray-500'} bg-gray-50 rounded-full px-2.5 py-1`}>
                            <Flame className="w-3 h-3" />{dish.spiceLevel}
                          </span>
                        )}
                      </div>
                      {dish.whereToTry && dish.whereToTry.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <p className="font-poppins text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Best at</p>
                          <div className="flex flex-wrap gap-1.5">
                            {dish.whereToTry.slice(0, 3).map(place => (
                              <span key={place} className="text-xs font-poppins text-purple-700 bg-purple-50 rounded-full px-2.5 py-1">{place}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </section>

      {/* ── Food Streets ─────────────────────────────────────────── */}
      {streets.length > 0 && (
        <section className="bg-gradient-to-br from-orange-50 to-amber-50 border-t border-amber-100 py-16">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-12">
              <span className="font-poppins text-sm font-semibold text-amber-600 uppercase tracking-widest">Street Food Culture</span>
              <h2 className="font-poppins text-4xl font-bold text-slate-900 mt-3">Bengal's Best Food Streets</h2>
              <p className="text-gray-500 font-poppins mt-2 max-w-lg mx-auto">
                Where the real flavours live — down the lanes, past the chai stalls.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {streets.map((street, i) => {
                const isOpen = openStreet === street.name;
                return (
                  <div key={`${street.name}-${i}`}
                    onClick={() => setOpenStreet(isOpen ? null : street.name)}
                    className="bg-white rounded-2xl p-5 border border-amber-100 shadow-sm hover:shadow-md cursor-pointer hover:-translate-y-0.5 transition-all duration-200">
                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
                      <MapPin className="w-5 h-5 text-amber-600" />
                    </div>
                    <h3 className="font-poppins text-base font-semibold text-slate-900 mb-1">{street.name}</h3>
                    <p className="font-poppins text-xs text-amber-600 font-medium mb-2">{street.city}</p>
                    <p className="font-poppins text-xs text-gray-500 line-clamp-2">{street.specialty}</p>
                    {isOpen && (
                      <div className="mt-4 pt-4 border-t border-amber-100">
                        <p className="font-poppins text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Must Eat</p>
                        <div className="flex flex-wrap gap-1">
                          {street.mustEat.map(item => (
                            <span key={item} className="text-xs font-poppins text-orange-700 bg-orange-50 rounded-full px-2 py-0.5">{item}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── Food Culture Tips ─────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-3 gap-6">
          {[
            { icon: BookOpen, title: 'The Bengali Thali',      color: 'bg-purple-50 text-purple-600',
              desc: 'A traditional Bengali meal starts with bitter (shukto), moves through fritters, dals, fish curries, chutneys, and ends with mishti doi. Every dish has a purpose.' },
            { icon: Clock,    title: 'When to Visit for Food', color: 'bg-blue-50 text-blue-600',
              desc: 'Monsoon (June–Sept) is Ilish season. Winter brings Nolen Gur (date palm jaggery) sweets. Durga Puja sees the best street food pop-ups.' },
            { icon: DollarSign, title: 'Budget Eating in Bengal', color: 'bg-green-50 text-green-600',
              desc: 'A full thali costs ₹80–150. Street puchka is ₹20–50. Even upscale Bengali restaurants rarely exceed ₹600 per person.' },
          ].map(({ icon: Icon, title, color, desc }) => (
            <div key={title} className="bg-gray-50 rounded-3xl p-7 border border-gray-100">
              <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center mb-5`}>
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="font-poppins text-lg font-semibold text-slate-900 mb-3">{title}</h3>
              <p className="font-poppins text-sm text-gray-600 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section className="bg-slate-900 py-14 text-center text-white">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="font-poppins text-3xl font-bold mb-3">Ready to taste Bengal?</h2>
          <p className="text-gray-400 font-poppins text-sm mb-8">Plan your trip around Bengal's best food experiences.</p>
          <a href="#/planner" className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white px-8 py-4 rounded-full font-poppins font-semibold transition-colors">
            Plan a Food Trip <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>
    </div>
  );
}
