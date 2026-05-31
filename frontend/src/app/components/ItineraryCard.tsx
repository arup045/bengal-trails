import { CalendarDays, MapPin, ArrowUpRight } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { type Itinerary, itineraryStops, itineraryCover } from '../data/itineraries';

// A ready-made trip card — real cover photo, day count, region and stop count.
export function ItineraryCard({ itinerary, compact = false }: { itinerary: Itinerary; compact?: boolean }) {
  const { id, title, region, summary, days, icon: Icon } = itinerary;
  const cover = itineraryCover(itinerary);
  const stops = itineraryStops(itinerary);

  return (
    <a
      href={`/itineraries/${id}`}
      className={`group flex flex-col overflow-hidden rounded-3xl bg-white border border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-2xl transition-all font-poppins ${compact ? 'w-80 shrink-0 snap-start' : ''}`}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        {cover ? (
          <ImageWithFallback src={cover} alt={title} optimizeWidth={640}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-300" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm">
          <Icon className="w-3.5 h-3.5 text-purple-600" strokeWidth={2.2} />
          <span className="text-xs font-semibold text-slate-800">{days.length} days</span>
        </div>
        <div className="absolute bottom-3 left-3 text-white text-xs font-medium flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5" /> {region}
        </div>
      </div>

      <div className="flex flex-col flex-1 p-5">
        <h3 className="text-lg font-bold text-slate-900 leading-tight group-hover:text-purple-600 transition-colors">{title}</h3>
        <p className="text-sm text-slate-500 mt-2 leading-relaxed line-clamp-2 flex-1">{summary}</p>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
          <span className="text-xs text-slate-500 inline-flex items-center gap-1.5">
            <CalendarDays className="w-3.5 h-3.5" /> {stops} stops
          </span>
          <span className="text-xs font-semibold text-purple-600 inline-flex items-center gap-1 group-hover:gap-1.5 transition-all">
            View plan <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </a>
  );
}

export default ItineraryCard;
