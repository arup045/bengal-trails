import { useEffect, useMemo, useState, lazy, Suspense } from 'react';
import { Search, MapPin, Compass, ArrowRight, X, Navigation, Loader2, LayoutGrid, Map as MapIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { getDistrictsWithMeta, type BengalRegion, type DistrictWithMeta } from '../data/districts';
import { placesData } from '../data/places-full';
import { DistrictCard } from './explore/DistrictCard';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useWishlistSync } from '../utils/useWishlistSync';
import { getCurrentLocation, calculateDistance, type LocationCoords } from '../utils/location';

const REGION_TABS: Array<'All' | BengalRegion> = ['All', 'North Bengal', 'Central Bengal', 'South Bengal'];

// Lazy: Leaflet + its CSS only load when the user opens map view (keeps it out of the bundle).
const DistrictsMap = lazy(() => import('./explore/DistrictsMap'));

const readQueryParam = () => {
  try { return new URLSearchParams(window.location.search).get('q') || ''; } catch { return ''; }
};

// Emoji per category for the visual chip bar (keyword-matched, with a fallback).
const catEmoji = (c: string): string => {
  const s = c.toLowerCase();
  if (/hill|mountain/.test(s)) return '⛰️';
  if (/beach|sea|coast/.test(s)) return '🏖️';
  if (/heritage|fort|palace|monument|colonial/.test(s)) return '🏛️';
  if (/wild|forest|sanctuary|national|nature/.test(s)) return '🐯';
  if (/temple|religious|pilgrim|spiritual/.test(s)) return '🛕';
  if (/lake|river|water|dam/.test(s)) return '🌊';
  if (/tea|garden/.test(s)) return '🍃';
  if (/adventure|trek|hik/.test(s)) return '🥾';
  if (/city|urban/.test(s)) return '🏙️';
  return '📍';
};

export function ExplorePage() {
  const districts = useMemo(() => getDistrictsWithMeta(), []);
  // Seed from ?q= so the global search bar (header/hero) carries its query here.
  const [query, setQuery] = useState(readQueryParam);
  const [region, setRegion] = useState<'All' | BengalRegion>('All');
  const [userLoc, setUserLoc] = useState<LocationCoords | null>(null);
  const [locLoading, setLocLoading] = useState(false);
  const [view, setView] = useState<'grid' | 'map'>('grid');
  // Place-level filters (beyond region).
  const [category, setCategory] = useState('all');
  const [minRating, setMinRating] = useState(0);
  const [budget, setBudget] = useState<'all' | '$' | '$$' | '$$$'>('all');
  const [kidFriendly, setKidFriendly] = useState(false);

  // "Near me": geolocate (browser API — free, no map key) then sort by distance.
  const findNearMe = async () => {
    if (userLoc) { setUserLoc(null); return; } // toggle off
    setLocLoading(true);
    try {
      const loc = await getCurrentLocation();
      setUserLoc(loc);
      setRegion('All');
      toast.success('Showing districts nearest to you');
    } catch (e: any) {
      toast.error(e?.message || 'Could not get your location');
    } finally { setLocLoading(false); }
  };

  // Keep in sync if the user searches again from the header (URL changes, page stays).
  useEffect(() => {
    const sync = () => setQuery(readQueryParam());
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);

  // One wishlist instance for the whole page (cards receive saved + toggle props).
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistSync();

  const wishlistSlug = (d: DistrictWithMeta) => `district-${d.slug}`;
  const onToggleSave = (d: DistrictWithMeta) => {
    const slug = wishlistSlug(d);
    if (isInWishlist(slug)) removeFromWishlist(slug);
    else addToWishlist({ slug, title: d.name, category: 'District', region: d.region, image: d.image, description: d.blurb });
  };

  const q = query.trim().toLowerCase();

  // Category list + counts derived from the real data.
  const placeCategories = useMemo(() => {
    const counts: Record<string, number> = {};
    placesData.forEach((p: any) => { if (p.category) counts[p.category] = (counts[p.category] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count }));
  }, []);

  const priceBand = (priceFrom?: string): '$' | '$$' | '$$$' => {
    const n = parseInt(String(priceFrom || '').replace(/[^0-9]/g, ''), 10) || 0;
    if (n <= 1500) return '$';
    if (n <= 4000) return '$$';
    return '$$$';
  };
  const isKidFriendly = (p: any) => {
    const hay = `${(p.tags || []).join(' ')} ${p.category || ''} ${p.excerpt || ''}`.toLowerCase();
    return /family|kid|child|zoo|park|beach|science|amusement/.test(hay);
  };

  const filtersActive = q.length >= 2 || category !== 'all' || minRating > 0 || budget !== 'all' || kidFriendly;

  // Unified place results: text + category + rating + budget + kid-friendly.
  const placeResults = useMemo(() => {
    if (!filtersActive) return [];
    return placesData.filter((p: any) => {
      if (q.length >= 2) {
        const hay = `${p.title} ${p.excerpt} ${p.district} ${p.region}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (category !== 'all' && p.category !== category) return false;
      if (minRating > 0 && (Number(p.rating) || 0) < minRating) return false;
      if (budget !== 'all' && priceBand(p.priceFrom) !== budget) return false;
      if (kidFriendly && !isKidFriendly(p)) return false;
      return true;
    }).slice(0, 24);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, category, minRating, budget, kidFriendly, filtersActive]);

  const clearFilters = () => { setCategory('all'); setMinRating(0); setBudget('all'); setKidFriendly(false); setQuery(''); };

  const filtered = useMemo(() => {
    let list: Array<DistrictWithMeta & { _distance?: number }> = districts.filter((d) =>
      (region === 'All' || d.region === region) &&
      (!q || d.name.toLowerCase().includes(q) || d.region.toLowerCase().includes(q) || d.blurb.toLowerCase().includes(q)),
    );
    if (userLoc) {
      list = list
        .map((d) => ({ ...d, _distance: calculateDistance(userLoc, { latitude: d.lat, longitude: d.lng }) }))
        .sort((a, b) => (a._distance ?? 0) - (b._distance ?? 0));
    }
    return list;
  }, [districts, q, region, userLoc]);

  const totalPlaces = useMemo(() => districts.reduce((s, d) => s + d.placeCount, 0), [districts]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <div className="relative bg-gradient-to-br from-purple-700 via-purple-800 to-indigo-900 text-white overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 pt-28 pb-14 text-center">
          <motion.div
            initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full mb-5"
          >
            <Compass className="w-4 h-4 text-orange-300" />
            <span className="font-poppins text-sm text-white/90">Explore by district</span>
          </motion.div>
          <h1 className="font-poppins text-4xl sm:text-5xl font-bold mb-4">Discover West Bengal</h1>
          <p className="font-poppins text-base sm:text-lg text-white/80 max-w-2xl mx-auto">
            All <strong>23 districts</strong> — {totalPlaces}+ destinations, from Himalayan hills to mangrove deltas.
            Pick a district to start exploring.
          </p>

          {/* Search */}
          <div className="mt-8 max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search a district, place or region…"
              className="w-full h-13 pl-12 pr-11 py-3.5 rounded-full bg-white text-gray-800 placeholder-gray-400 shadow-lg focus:outline-none focus:ring-4 focus:ring-purple-300/40"
            />
            {query && (
              <button onClick={() => setQuery('')} aria-label="Clear search"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Region filter ──────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 -mt-6 relative z-10">
        <div className="bg-white rounded-2xl shadow-md p-2 flex flex-wrap justify-center items-center gap-2">
          {REGION_TABS.map((r) => (
            <button
              key={r}
              onClick={() => { setRegion(r); if (userLoc) setUserLoc(null); }}
              className={`px-5 py-2 rounded-full font-poppins text-sm font-medium transition-all
                ${region === r && !userLoc ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              {r}
            </button>
          ))}
          <span className="hidden sm:block w-px h-6 bg-gray-200 mx-1" />
          <button
            onClick={findNearMe}
            disabled={locLoading}
            className={`px-5 py-2 rounded-full font-poppins text-sm font-medium transition-all flex items-center gap-1.5
              ${userLoc ? 'bg-emerald-500 text-white shadow-sm' : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'}`}
          >
            {locLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
            {userLoc ? 'Nearest first' : 'Near me'}
          </button>

          {/* Grid / Map view toggle */}
          <span className="hidden sm:block w-px h-6 bg-gray-200 mx-1" />
          <div className="flex items-center bg-gray-100 rounded-full p-0.5">
            <button onClick={() => setView('grid')} aria-label="Grid view"
              className={`px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 font-poppins text-sm font-medium ${view === 'grid' ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500'}`}>
              <LayoutGrid className="w-4 h-4" /> Grid
            </button>
            <button onClick={() => setView('map')} aria-label="Map view"
              className={`px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 font-poppins text-sm font-medium ${view === 'map' ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500'}`}>
              <MapIcon className="w-4 h-4" /> Map
            </button>
          </div>
        </div>
      </div>

      {/* ── Category chip bar (visual discovery) ───────────────────────────── */}
      {view === 'grid' && (
        <div className="max-w-7xl mx-auto px-5 sm:px-8 mt-5">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button onClick={() => setCategory('all')}
              className={`shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full font-poppins text-sm font-medium transition-all border ${category === 'all' ? 'bg-purple-600 text-white border-purple-600 shadow-sm' : 'bg-white text-gray-700 border-gray-200 hover:border-purple-300'}`}>
              🗺️ All
            </button>
            {placeCategories.map((c) => (
              <button key={c.name} onClick={() => setCategory(category === c.name ? 'all' : c.name)}
                className={`shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full font-poppins text-sm font-medium transition-all border ${category === c.name ? 'bg-purple-600 text-white border-purple-600 shadow-sm' : 'bg-white text-gray-700 border-gray-200 hover:border-purple-300'}`}>
                {catEmoji(c.name)} {c.name}
                <span className={category === c.name ? 'text-white/80' : 'text-gray-400'}>{c.count}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Refine filters (rating / budget / kid-friendly) ────────────────── */}
      {view === 'grid' && (
        <div className="max-w-7xl mx-auto px-5 sm:px-8 mt-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-white border border-gray-200 rounded-full p-0.5" role="group" aria-label="Minimum rating">
              {[0, 3, 4, 4.5].map((r) => (
                <button key={r} onClick={() => setMinRating(r)}
                  className={`px-3 py-1.5 rounded-full font-poppins text-xs font-medium transition ${minRating === r ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                  {r === 0 ? 'Any ★' : `${r}+ ★`}
                </button>
              ))}
            </div>

            <div className="flex items-center bg-white border border-gray-200 rounded-full p-0.5" role="group" aria-label="Budget">
              {([['all', 'Any ₹'], ['$', '₹'], ['$$', '₹₹'], ['$$$', '₹₹₹']] as const).map(([k, l]) => (
                <button key={k} onClick={() => setBudget(k)}
                  className={`px-3 py-1.5 rounded-full font-poppins text-xs font-medium transition ${budget === k ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                  {l}
                </button>
              ))}
            </div>

            <button onClick={() => setKidFriendly((v) => !v)}
              className={`px-4 py-2 rounded-full font-poppins text-sm font-medium transition ${kidFriendly ? 'bg-emerald-500 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'}`}>
              👨‍👩‍👧 Kid-friendly
            </button>

            {filtersActive && (
              <button onClick={clearFilters} className="ml-1 font-poppins text-sm font-medium text-purple-600 hover:text-purple-700 underline-offset-2 hover:underline">
                Clear filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Results: map / filtered places / district grid ─────────────────── */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8">
        {view === 'map' ? (
          /* Split view (Airbnb/Booking standard): scrollable district list left, sticky live map right. */
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_1.25fr] gap-6">
            {/* Left: scrollable district list */}
            <div className="order-2 lg:order-1">
              <div className="flex items-center gap-2 mb-4 text-gray-500 font-poppins text-sm">
                <MapPin className="w-4 h-4 text-purple-600" />
                {filtered.length} district{filtered.length !== 1 ? 's' : ''}{region !== 'All' ? ` in ${region}` : ''}
              </div>
              <div className="space-y-3 lg:max-h-[70vh] lg:overflow-y-auto lg:pr-2 scrollbar-hide">
                {filtered.length === 0 ? (
                  <p className="text-gray-400 font-poppins text-sm py-10 text-center">No districts match your search.</p>
                ) : filtered.map((d) => (
                  <a key={d.slug} href={`/explore/district/${d.slug}`}
                    className="group flex gap-3 bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md hover:border-purple-200 transition-all">
                    <div className="relative w-28 sm:w-32 shrink-0 overflow-hidden">
                      <ImageWithFallback src={d.image || ''} alt={d.name} optimizeWidth={320} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="flex-1 min-w-0 py-3 pr-3">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-poppins text-base font-semibold text-slate-900 leading-tight truncate">{d.name}</h3>
                        {userLoc && d._distance != null && (
                          <span className="shrink-0 text-[11px] font-poppins font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">{Math.round(d._distance)} km</span>
                        )}
                      </div>
                      <p className="font-poppins text-xs text-gray-500 mt-0.5">{d.region}</p>
                      <p className="font-poppins text-xs text-gray-500 mt-1.5 line-clamp-2">{d.blurb}</p>
                      <span className="inline-flex items-center gap-1 mt-2 text-xs font-poppins font-medium text-purple-600">
                        {d.placeCount > 0 ? `${d.placeCount} place${d.placeCount > 1 ? 's' : ''}` : 'Explore'}
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Right: sticky live map */}
            <div className="order-1 lg:order-2">
              <div className="lg:sticky lg:top-24">
                <Suspense fallback={<div className="h-[70vh] min-h-[420px] rounded-3xl bg-gray-100 animate-pulse flex items-center justify-center"><Loader2 className="w-8 h-8 text-purple-400 animate-spin" /></div>}>
                  <DistrictsMap userLoc={userLoc} />
                </Suspense>
              </div>
            </div>
          </div>
        ) : filtersActive ? (
          <>
            <div className="flex items-center gap-2 mb-6 text-gray-500 font-poppins text-sm">
              <Search className="w-4 h-4 text-purple-600" />
              {placeResults.length} place{placeResults.length !== 1 ? 's' : ''} found
            </div>
            {placeResults.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-400 font-poppins mb-4">No places match these filters.</p>
                <button onClick={clearFilters} className="px-5 py-2.5 bg-purple-600 text-white rounded-full font-poppins text-sm font-medium hover:bg-purple-700">Clear filters</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {placeResults.map((p: any) => (
                  <a key={p.slug} href={`/explore/${p.slug}`}
                    className="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">
                    <div className="relative h-44 overflow-hidden">
                      <ImageWithFallback src={p.heroImage?.url || ''} alt={p.title} optimizeWidth={640} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      {p.category && <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-purple-700 text-[11px] font-poppins font-semibold px-2.5 py-1 rounded-full">{p.category}</span>}
                      {Number(p.rating) > 0 && <span className="absolute top-3 right-3 bg-black/55 text-white text-[11px] font-poppins font-semibold px-2 py-0.5 rounded-full">★ {Number(p.rating).toFixed(1)}</span>}
                    </div>
                    <div className="p-4">
                      <h3 className="font-poppins text-base font-semibold text-slate-900 leading-tight truncate">{p.title}</h3>
                      <p className="font-poppins text-xs text-gray-500 mt-1 flex items-center gap-1"><MapPin className="w-3 h-3" />{p.district || p.region}{p.priceFrom ? ` · from ${p.priceFrom}` : ''}</p>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-6 text-gray-500 font-poppins text-sm">
              <MapPin className="w-4 h-4 text-purple-600" />
              {filtered.length} district{filtered.length !== 1 ? 's' : ''}{region !== 'All' ? ` in ${region}` : ''}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((d) => (
                <DistrictCard
                  key={d.slug}
                  district={d}
                  saved={isInWishlist(wishlistSlug(d))}
                  onToggleSave={() => onToggleSave(d)}
                  distanceKm={userLoc ? d._distance : undefined}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ExplorePage;
