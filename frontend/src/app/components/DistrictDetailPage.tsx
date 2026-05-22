import { useMemo } from 'react';
import { ArrowLeft, MapPin, Navigation, Compass } from 'lucide-react';
import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { getDistrict, placesForDistrict } from '../data/districts';
import type { Place } from '../data/places-full';
import { PlaceCard } from './explore/PlaceCard';
import { useWishlistSync } from '../utils/useWishlistSync';

export function DistrictDetailPage({ slug }: { slug: string }) {
  const district = useMemo(() => getDistrict(slug), [slug]);
  const places = useMemo(() => placesForDistrict(slug), [slug]);
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistSync();

  const onToggleSave = (p: Place) => {
    if (isInWishlist(p.slug)) removeFromWishlist(p.slug);
    else addToWishlist({
      slug: p.slug, title: p.title, category: (p as any).category || '',
      region: p.region, image: p.heroImage?.url || '', description: p.excerpt || '',
    });
  };

  if (!district) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Compass className="w-14 h-14 text-purple-300 mx-auto mb-4" />
          <h1 className="font-poppins text-2xl font-semibold text-slate-900 mb-2">District not found</h1>
          <a href="#/explore" className="inline-flex items-center gap-2 mt-2 text-purple-600 font-poppins font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to all districts
          </a>
        </div>
      </div>
    );
  }

  const openDirections = () => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${district.lat},${district.lng}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <div className="relative h-[42vh] min-h-[320px] overflow-hidden">
        <ImageWithFallback src={district.image} alt={district.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />

        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="max-w-7xl mx-auto w-full px-5 sm:px-8 pb-8">
            <a href="#/explore" className="inline-flex items-center gap-2 text-white/85 hover:text-white font-poppins text-sm mb-4">
              <ArrowLeft className="w-4 h-4" /> All districts
            </a>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <span className="inline-block bg-white/15 backdrop-blur-sm text-white text-xs font-poppins font-medium px-3 py-1 rounded-full mb-3">
                {district.region}
              </span>
              <h1 className="font-poppins text-4xl sm:text-5xl font-bold text-white mb-2">{district.name}</h1>
              <p className="font-poppins text-white/85 max-w-2xl mb-4">{district.blurb}</p>
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 text-white/90 font-poppins text-sm">
                  <MapPin className="w-4 h-4" /> {district.placeCount} place{district.placeCount !== 1 ? 's' : ''}
                </span>
                <button
                  onClick={openDirections}
                  className="inline-flex items-center gap-2 bg-white/90 hover:bg-white text-purple-700 font-poppins text-sm font-medium px-4 py-2 rounded-full transition-colors"
                >
                  <Navigation className="w-4 h-4" /> Directions
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── Places ─────────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10">
        <h2 className="font-poppins text-2xl font-bold text-slate-900 mb-1">Places to explore in {district.name}</h2>
        <p className="font-poppins text-gray-500 text-sm mb-8">
          {places.length > 0 ? `${places.length} handpicked destination${places.length > 1 ? 's' : ''}` : 'Curated destinations are on the way.'}
        </p>

        {places.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 text-center">
            <Compass className="w-14 h-14 text-purple-200 mx-auto mb-4" />
            <h3 className="font-poppins text-lg font-semibold text-slate-900 mb-1">No destinations added yet</h3>
            <p className="font-poppins text-gray-500 text-sm max-w-md mx-auto">
              We're still curating the best of {district.name}. Check back soon — or explore a nearby district meanwhile.
            </p>
            <a href="#/explore" className="inline-flex items-center gap-2 mt-5 bg-purple-600 hover:bg-purple-700 text-white font-poppins text-sm font-medium px-5 py-2.5 rounded-full transition-colors">
              <ArrowLeft className="w-4 h-4" /> Browse other districts
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {places.map((p) => (
              <PlaceCard
                key={p.slug}
                place={p}
                saved={isInWishlist(p.slug)}
                onToggleSave={() => onToggleSave(p)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default DistrictDetailPage;
