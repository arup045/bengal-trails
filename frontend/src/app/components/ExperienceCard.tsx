import { ArrowUpRight } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { type Experience, experienceCount, experienceCover } from '../data/experiences';

// A themed "way to explore Bengal" card — full-bleed real photo (borrowed from a
// member place), glass icon chip, title, tagline and live place count. Purple
// accent only, no coloured pills — matches the site theme.
export function ExperienceCard({ experience, compact = false }: { experience: Experience; compact?: boolean }) {
  const { id, title, tagline, icon: Icon } = experience;
  const count = experienceCount(id);
  const cover = experienceCover(id);

  return (
    <a
      href={`/experiences/${id}`}
      className={`group relative block overflow-hidden rounded-3xl font-poppins shadow-sm hover:shadow-2xl transition-all ${compact ? 'w-72 shrink-0 snap-start aspect-[4/5]' : 'aspect-[4/5]'}`}
    >
      {cover ? (
        <ImageWithFallback src={cover} alt={title} optimizeWidth={640}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-300" />
      )}
      {/* Readability gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/10" />

      <div className="absolute top-4 left-4">
        <span className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center">
          <Icon className="w-5 h-5 text-white" strokeWidth={2} />
        </span>
      </div>

      <div className="absolute inset-x-0 bottom-0 p-5">
        <h3 className="text-white text-xl font-bold leading-tight">{title}</h3>
        <p className="text-white/85 text-sm mt-1 leading-snug">{tagline}</p>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/20">
          <span className="text-white/90 text-xs font-medium">{count} places</span>
          <span className="text-white text-xs font-semibold inline-flex items-center gap-1 group-hover:gap-1.5 transition-all">
            Explore <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </a>
  );
}

export default ExperienceCard;
