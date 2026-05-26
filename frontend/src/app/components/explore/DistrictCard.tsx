import { Heart, Navigation, ArrowRight, MapPin } from 'lucide-react';
import { motion } from 'motion/react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import type { DistrictWithMeta } from '../../data/districts';
import { queryClient } from '../../lib/queryClient';
import { API_BASE } from '../../utils/api';

interface Props {
  district: DistrictWithMeta;
  saved: boolean;
  onToggleSave: () => void;
  distanceKm?: number;   // set when "Near me" is active
}

export function DistrictCard({ district, saved, onToggleSave, distanceKm }: Props) {
  const go = () => { window.location.hash = `#/explore/district/${district.slug}`; };

  // Prefetch the district's place-images on hover so its detail page opens instantly.
  const prefetch = () => {
    queryClient.prefetchQuery({
      queryKey: ['place-images', district.slug],
      queryFn: async () => {
        const r = await fetch(`${API_BASE}/place-images/${district.slug}`);
        return r.ok ? r.json() : { items: {}, images: {} };
      },
      staleTime: 5 * 60 * 1000,
    }).catch(() => {});
  };

  const openDirections = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    // Opens Google Maps with directions to the district HQ.
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${district.lat},${district.lng}`,
      '_blank', 'noopener,noreferrer',
    );
  };

  const toggleSave = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); onToggleSave(); };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      onClick={go}
      onMouseEnter={prefetch}
      onFocus={prefetch}
      className="group relative bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col"
    >
      {/* Image */}
      <div className="relative h-52 overflow-hidden">
        <ImageWithFallback
          src={district.image}
          alt={district.name}
          optimizeWidth={640}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

        {/* Region pill */}
        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-purple-700 text-[11px] font-poppins font-semibold px-2.5 py-1 rounded-full shadow-sm">
          {district.region}
        </span>

        {/* Distance pill (when "Near me" is active) */}
        {distanceKm != null && (
          <span className="absolute top-11 left-3 bg-emerald-500/90 backdrop-blur-sm text-white text-[11px] font-poppins font-semibold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
            <Navigation className="w-3 h-3" />
            {distanceKm < 100 ? `${distanceKm.toFixed(0)} km` : `${Math.round(distanceKm)} km`} away
          </span>
        )}

        {/* Actions */}
        <div className="absolute top-3 right-3 flex gap-2">
          <button
            onClick={toggleSave}
            aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
            className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
          >
            <Heart className={`w-4 h-4 ${saved ? 'fill-rose-500 text-rose-500' : 'text-gray-600'}`} />
          </button>
          <button
            onClick={openDirections}
            aria-label="Get directions"
            title="Directions on Google Maps"
            className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
          >
            <Navigation className="w-4 h-4 text-purple-600" />
          </button>
        </div>

        {/* Title overlaid */}
        <div className="absolute bottom-3 left-4 right-4">
          <h3 className="text-white text-2xl font-poppins font-bold leading-tight drop-shadow">{district.name}</h3>
          <p className="text-white/85 text-xs font-poppins flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3" />
            {district.placeCount > 0 ? `${district.placeCount} place${district.placeCount > 1 ? 's' : ''} to explore` : 'New — coming soon'}
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-gray-600 text-sm font-poppins line-clamp-2 mb-4 min-h-[2.5rem]">{district.blurb}</p>
        <button
          onClick={(e) => { e.stopPropagation(); go(); }}
          className="mt-auto w-full inline-flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-poppins text-sm font-medium px-4 py-2.5 rounded-full transition-colors group/btn"
        >
          Explore {district.name}
          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
}
