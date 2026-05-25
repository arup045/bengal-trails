import { Heart, Navigation, ArrowRight, Star, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { ImageWithFallback } from '../figma/ImageWithFallback';

export type SectionKey = 'places' | 'parks' | 'activities' | 'foods' | 'foodZones' | 'stays';

export const SECTION_META: Record<SectionKey, { label: string; emoji: string; gradient: string; pill: string }> = {
  places:     { label: 'Top Places to Visit',       emoji: '📍', gradient: 'from-purple-500 to-indigo-600', pill: 'Place' },
  parks:      { label: 'Parks, Stadiums & Arenas',  emoji: '🌳', gradient: 'from-emerald-500 to-green-600', pill: 'Park / Arena' },
  activities: { label: 'Activities & Experiences',  emoji: '🎯', gradient: 'from-orange-500 to-amber-600',  pill: 'Activity' },
  foods:      { label: 'Iconic Local & Street Food', emoji: '🍲', gradient: 'from-rose-500 to-red-600',      pill: 'Food' },
  foodZones:  { label: 'Street Food Zones & Hubs',  emoji: '🍢', gradient: 'from-yellow-500 to-orange-500',  pill: 'Food Zone' },
  stays:      { label: 'Hotels & Restaurants',      emoji: '🏨', gradient: 'from-sky-500 to-blue-600',       pill: 'Stay' },
};

interface Props {
  name: string;
  section: SectionKey;
  districtName: string;
  image?: string;     // admin-uploaded photo or a place's hero image
  excerpt?: string;
  href?: string;      // detail-page link (real places only)
  rating?: number;
  type?: string;      // admin-set label, e.g. "Stadium", "Hindu temple"
  hours?: string;     // admin-set, e.g. "Open · Closes 8:30 PM"
  saved: boolean;
  onToggleSave: () => void;
}

export function ItemCard({ name, section, districtName, image, excerpt, href, rating, type, hours, saved, onToggleSave }: Props) {
  const meta = SECTION_META[section];

  const openDirections = (e?: React.MouseEvent) => {
    e?.preventDefault(); e?.stopPropagation();
    const q = encodeURIComponent(`${name}, ${districtName}, West Bengal, India`);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${q}`, '_blank', 'noopener,noreferrer');
  };
  const go = () => { if (href) window.location.hash = href; else openDirections(); };
  const toggle = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); onToggleSave(); };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      onClick={go}
      className="group relative bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col"
    >
      {/* Image / placeholder */}
      <div className="relative h-44 overflow-hidden">
        {image ? (
          <ImageWithFallback src={image} alt={name} optimizeWidth={640} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${meta.gradient} flex items-center justify-center`}>
            <span className="text-5xl opacity-90 drop-shadow">{meta.emoji}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-purple-700 text-[11px] font-poppins font-semibold px-2.5 py-1 rounded-full shadow-sm">
          {type || meta.pill}
        </span>
        <div className="absolute top-3 right-3 flex gap-2">
          <button onClick={toggle} aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
            className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:scale-110 transition-transform">
            <Heart className={`w-4 h-4 ${saved ? 'fill-rose-500 text-rose-500' : 'text-gray-600'}`} />
          </button>
          <button onClick={openDirections} aria-label="Get directions" title="Directions on Google Maps"
            className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:scale-110 transition-transform">
            <Navigation className="w-4 h-4 text-purple-600" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-slate-900 text-base font-poppins font-semibold leading-tight">{name}</h3>
          {rating ? (
            <span className="flex items-center gap-0.5 text-amber-600 text-xs font-poppins font-semibold shrink-0">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />{Number(rating).toFixed(1)}
            </span>
          ) : null}
        </div>
        {hours ? (
          <p className="text-gray-500 text-xs font-poppins flex items-center gap-1.5 mb-2"><Clock className="w-3.5 h-3.5 text-gray-400" />{hours}</p>
        ) : null}
        {excerpt ? <p className="text-gray-600 text-sm font-poppins line-clamp-2 mb-4 min-h-[2.5rem]">{excerpt}</p> : <div className="mb-3" />}
        <button
          onClick={(e) => { e.stopPropagation(); go(); }}
          className="mt-auto w-full inline-flex items-center justify-center gap-2 border border-purple-200 text-purple-700 hover:bg-purple-50 font-poppins text-sm font-medium px-4 py-2.5 rounded-full transition-colors group/btn"
        >
          {href ? 'View details' : 'Get directions'}
          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
}
