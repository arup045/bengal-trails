import { Heart, Navigation } from 'lucide-react';
import { motion } from 'motion/react';

export type SectionKey = 'landmarks' | 'parks' | 'activities' | 'foods' | 'foodZones' | 'stays';

export const SECTION_META: Record<SectionKey, { label: string; emoji: string; gradient: string }> = {
  landmarks: { label: 'Things to Do & Landmarks', emoji: '🏛️', gradient: 'from-purple-500 to-indigo-600' },
  parks:     { label: 'Parks, Stadiums & Arenas', emoji: '🌳', gradient: 'from-emerald-500 to-green-600' },
  activities:{ label: 'Activities & Experiences',  emoji: '🎯', gradient: 'from-orange-500 to-amber-600' },
  foods:     { label: 'Iconic Local & Street Food', emoji: '🍲', gradient: 'from-rose-500 to-red-600' },
  foodZones: { label: 'Street Food Zones & Hubs',  emoji: '🍢', gradient: 'from-yellow-500 to-orange-500' },
  stays:     { label: 'Hotels & Restaurants',      emoji: '🏨', gradient: 'from-sky-500 to-blue-600' },
};

interface Props {
  name: string;
  section: SectionKey;
  districtName: string;
  saved: boolean;
  onToggleSave: () => void;
}

export function ContentCard({ name, section, districtName, saved, onToggleSave }: Props) {
  const meta = SECTION_META[section];

  const openDirections = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    const q = encodeURIComponent(`${name}, ${districtName}, West Bengal, India`);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${q}`, '_blank', 'noopener,noreferrer');
  };

  const toggle = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); onToggleSave(); };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      onClick={openDirections}
      title={`Directions to ${name}`}
      className={`group relative rounded-2xl p-4 pr-4 min-h-[128px] bg-gradient-to-br ${meta.gradient} text-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer flex flex-col`}
    >
      <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/10 rounded-full blur-2xl pointer-events-none" />

      {/* Actions */}
      <div className="absolute top-2.5 right-2.5 flex gap-1.5 z-10">
        <button
          onClick={toggle}
          aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
          className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
        >
          <Heart className={`w-4 h-4 ${saved ? 'fill-white text-white' : 'text-white'}`} />
        </button>
        <button
          onClick={openDirections}
          aria-label="Get directions"
          className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
        >
          <Navigation className="w-4 h-4 text-white" />
        </button>
      </div>

      <span className="text-2xl mb-2">{meta.emoji}</span>
      <h4 className="font-poppins font-semibold leading-snug pr-10 text-[15px]">{name}</h4>
      <span className="mt-auto pt-2 text-white/70 text-[11px] font-poppins flex items-center gap-1">
        <Navigation className="w-3 h-3" /> Tap for directions
      </span>
    </motion.div>
  );
}
