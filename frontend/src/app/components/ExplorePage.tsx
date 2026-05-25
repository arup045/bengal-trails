import { useEffect, useMemo, useState } from 'react';
import { Search, MapPin, Compass, ArrowRight, X } from 'lucide-react';
import { motion } from 'motion/react';
import { getDistrictsWithMeta, type BengalRegion, type DistrictWithMeta } from '../data/districts';
import { placesData } from '../data/places-full';
import { DistrictCard } from './explore/DistrictCard';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useWishlistSync } from '../utils/useWishlistSync';

const REGION_TABS: Array<'All' | BengalRegion> = ['All', 'North Bengal', 'Central Bengal', 'South Bengal'];

const readQueryParam = () => {
  try { return new URLSearchParams(window.location.search).get('q') || ''; } catch { return ''; }
};

export function ExplorePage() {
  const districts = useMemo(() => getDistrictsWithMeta(), []);
  // Seed from ?q= so the global search bar (header/hero) carries its query here.
  const [query, setQuery] = useState(readQueryParam);
  const [region, setRegion] = useState<'All' | BengalRegion>('All');

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

  // Matching individual places (so searching "Victoria Memorial" surfaces the
  // place itself, not just its district). placesData is already loaded via districts.ts.
  const matchingPlaces = useMemo(() => {
    if (q.length < 2) return [];
    return placesData
      .filter((p: any) =>
        p.title?.toLowerCase().includes(q) ||
        p.excerpt?.toLowerCase().includes(q) ||
        p.district?.toLowerCase().includes(q) ||
        p.region?.toLowerCase().includes(q))
      .slice(0, 8);
  }, [q]);

  const filtered = useMemo(() => {
    return districts.filter((d) =>
      (region === 'All' || d.region === region) &&
      (!q || d.name.toLowerCase().includes(q) || d.region.toLowerCase().includes(q) || d.blurb.toLowerCase().includes(q)),
    );
  }, [districts, q, region]);

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
        <div className="bg-white rounded-2xl shadow-md p-2 flex flex-wrap justify-center gap-2">
          {REGION_TABS.map((r) => (
            <button
              key={r}
              onClick={() => setRegion(r)}
              className={`px-5 py-2 rounded-full font-poppins text-sm font-medium transition-all
                ${region === r ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* ── Matching places (when searching) ───────────────────────────────── */}
      {q.length >= 2 && matchingPlaces.length > 0 && (
        <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-10">
          <div className="flex items-center gap-2 mb-4 text-slate-700 font-poppins text-sm font-semibold">
            <Search className="w-4 h-4 text-purple-600" />
            Places matching “{query}”
            <span className="font-normal text-gray-400">({matchingPlaces.length})</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {matchingPlaces.map((p: any) => (
              <a key={p.slug} href={`/explore/${p.slug}`}
                className="group flex items-center gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all p-2.5">
                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                  <ImageWithFallback src={p.heroImage?.url || ''} alt={p.title} optimizeWidth={160} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-poppins text-sm font-semibold text-slate-900 truncate">{p.title}</p>
                  <p className="font-poppins text-xs text-gray-500 truncate flex items-center gap-1"><MapPin className="w-3 h-3" />{p.district || p.region}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all shrink-0" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* ── District grid ──────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10">
        <div className="flex items-center gap-2 mb-6 text-gray-500 font-poppins text-sm">
          <MapPin className="w-4 h-4 text-purple-600" />
          {filtered.length} district{filtered.length !== 1 ? 's' : ''}{region !== 'All' ? ` in ${region}` : ''}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400 font-poppins">No districts match your search.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((d) => (
              <DistrictCard
                key={d.slug}
                district={d}
                saved={isInWishlist(wishlistSlug(d))}
                onToggleSave={() => onToggleSave(d)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ExplorePage;
