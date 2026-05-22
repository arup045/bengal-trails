import { useMemo, useState } from 'react';
import { Search, MapPin, Compass } from 'lucide-react';
import { motion } from 'motion/react';
import { getDistrictsWithMeta, type BengalRegion, type DistrictWithMeta } from '../data/districts';
import { DistrictCard } from './explore/DistrictCard';
import { useWishlistSync } from '../utils/useWishlistSync';

const REGION_TABS: Array<'All' | BengalRegion> = ['All', 'North Bengal', 'Central Bengal', 'South Bengal'];

export function ExplorePage() {
  const districts = useMemo(() => getDistrictsWithMeta(), []);
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState<'All' | BengalRegion>('All');

  // One wishlist instance for the whole page (cards receive saved + toggle props).
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistSync();

  const wishlistSlug = (d: DistrictWithMeta) => `district-${d.slug}`;
  const onToggleSave = (d: DistrictWithMeta) => {
    const slug = wishlistSlug(d);
    if (isInWishlist(slug)) removeFromWishlist(slug);
    else addToWishlist({ slug, title: d.name, category: 'District', region: d.region, image: d.image, description: d.blurb });
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return districts.filter((d) =>
      (region === 'All' || d.region === region) &&
      (!q || d.name.toLowerCase().includes(q) || d.region.toLowerCase().includes(q) || d.blurb.toLowerCase().includes(q)),
    );
  }, [districts, query, region]);

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
              placeholder="Search a district…"
              className="w-full h-13 pl-12 pr-4 py-3.5 rounded-full bg-white text-gray-800 placeholder-gray-400 shadow-lg focus:outline-none focus:ring-4 focus:ring-purple-300/40"
            />
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
