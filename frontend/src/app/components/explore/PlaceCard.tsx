import { Heart, Navigation, ArrowRight, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import type { Place } from '../../data/places-full';

interface Props {
  place: Place;
  saved: boolean;
  onToggleSave: () => void;
}

export function PlaceCard({ place, saved, onToggleSave }: Props) {
  const go = () => { window.location.hash = `#/explore/${place.slug}`; };

  const openDirections = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    const c = place.coordinates;
    const dest = c && c.lat != null && c.lng != null
      ? `${c.lat},${c.lng}`
      : encodeURIComponent(`${place.title}, West Bengal, India`);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${dest}`, '_blank', 'noopener,noreferrer');
  };

  const toggleSave = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); onToggleSave(); };

  const rating = (place as any).rating;
  const category = (place as any).category;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      onClick={go}
      className="group relative bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col"
    >
      <div className="relative h-48 overflow-hidden">
        <ImageWithFallback
          src={place.heroImage?.url}
          alt={place.heroImage?.alt || place.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

        {category && (
          <span className="absolute top-3 left-3 bg-purple-600 text-white text-[11px] font-poppins font-semibold px-2.5 py-1 rounded-full shadow-sm">
            {category}
          </span>
        )}

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
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-slate-900 text-base font-poppins font-semibold leading-tight">{place.title}</h3>
          {rating ? (
            <span className="flex items-center gap-0.5 text-amber-600 text-xs font-poppins font-semibold shrink-0">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />{Number(rating).toFixed(1)}
            </span>
          ) : null}
        </div>
        <p className="text-gray-600 text-sm font-poppins line-clamp-2 mb-4 min-h-[2.5rem]">{place.excerpt}</p>
        <button
          onClick={(e) => { e.stopPropagation(); go(); }}
          className="mt-auto w-full inline-flex items-center justify-center gap-2 border border-purple-200 text-purple-700 hover:bg-purple-50 font-poppins text-sm font-medium px-4 py-2.5 rounded-full transition-colors group/btn"
        >
          View details
          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
}
