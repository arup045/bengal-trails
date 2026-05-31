import { useEffect } from 'react';
import { ChevronRight, ArrowLeft, MapPin, CalendarDays, Wand2, Clock } from 'lucide-react';
import {
  itineraries, getItinerary, placesForDay, itineraryStops, itineraryCover,
  plannerUrlForItinerary,
} from '../data/itineraries';
import { ItineraryCard } from './ItineraryCard';
import { ImageWithFallback } from './figma/ImageWithFallback';

// /itineraries        → all curated WB trips
// /itineraries/:id    → day-by-day plan with "Load into Trip Planner"
export function ItinerariesPage({ id }: { id?: string }) {
  const it = id ? getItinerary(id) : undefined;
  useEffect(() => { window.scrollTo({ top: 0 }); }, [id]);

  // ── Detail view ───────────────────────────────────────────────────────────
  if (id && it) {
    const cover = itineraryCover(it);
    const Icon = it.icon;
    return (
      <div className="min-h-screen bg-white font-poppins">
        {/* Hero */}
        <div className="relative h-[42vh] min-h-[300px] w-full overflow-hidden">
          {cover && (
            <ImageWithFallback src={cover} alt={it.title} optimizeWidth={1600}
              className="absolute inset-0 w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/30" />
          <div className="absolute inset-0 flex items-end">
            <div className="max-w-5xl mx-auto w-full px-4 sm:px-8 pb-9">
              <nav className="flex items-center gap-1.5 text-sm text-white/80 mb-4">
                <a href="/itineraries" className="hover:text-white">Itineraries</a>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-white">{it.title}</span>
              </nav>
              <h1 className="text-white text-3xl sm:text-5xl font-bold leading-tight">{it.title}</h1>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4 text-white/90 text-sm">
                <span className="inline-flex items-center gap-1.5"><CalendarDays className="w-4 h-4" /> {it.days.length} days</span>
                <span className="inline-flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {it.region}</span>
                <span className="inline-flex items-center gap-1.5"><Clock className="w-4 h-4" /> Best: {it.bestTime}</span>
                <span className="inline-flex items-center gap-1.5">{itineraryStops(it)} stops</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-10">
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-3xl">{it.summary}</p>

          {/* Load into planner */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a
              href={plannerUrlForItinerary(it)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold shadow-sm hover:shadow-md transition-all"
            >
              <Wand2 className="w-4 h-4" /> Load this trip into the planner
            </a>
            <span className="text-xs text-slate-500">Opens in the Trip Planner — edit days, reorder, add your own stops.</span>
          </div>

          {/* Highlights */}
          {it.highlights?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-7">
              {it.highlights.map((h) => (
                <span key={h} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-purple-50 text-purple-700 text-xs font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500" /> {h}
                </span>
              ))}
            </div>
          )}

          {/* Day-by-day */}
          <div className="mt-10 space-y-8">
            {it.days.map((day, idx) => {
              const places = placesForDay(day);
              return (
                <div key={idx} className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="w-11 h-11 shrink-0 rounded-2xl bg-purple-600 text-white flex flex-col items-center justify-center leading-none">
                      <span className="text-[9px] font-medium opacity-80">DAY</span>
                      <span className="text-base font-bold">{idx + 1}</span>
                    </span>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 leading-tight">{day.title}</h2>
                      {day.note && <p className="text-sm text-slate-500">{day.note}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pl-0 sm:pl-14">
                    {places.map((p) => (
                      <a key={p.slug} href={`/explore/${p.slug}`}
                        className="group flex gap-3 rounded-2xl bg-white border border-slate-100 hover:border-purple-200 hover:shadow-md transition-all overflow-hidden">
                        <div className="w-24 shrink-0 bg-slate-100 overflow-hidden">
                          <ImageWithFallback src={p.heroImage?.url} alt={p.title} optimizeWidth={240}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>
                        <div className="py-3 pr-3 min-w-0">
                          <h3 className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2 group-hover:text-purple-600 transition-colors">{p.title}</h3>
                          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 line-clamp-1">
                            <MapPin className="w-3 h-3 shrink-0" /> {p.district}
                          </p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-12 flex flex-wrap items-center gap-4">
            <a href={plannerUrlForItinerary(it)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold transition-all">
              <Wand2 className="w-4 h-4" /> Load into the planner
            </a>
            <a href="/itineraries" className="inline-flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-700">
              <ArrowLeft className="w-4 h-4" /> All itineraries
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ── Hub view ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white font-poppins">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
        <div className="flex items-center gap-2.5 mb-3">
          <span className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
            <CalendarDays className="w-5 h-5 text-purple-600" strokeWidth={2} />
          </span>
          <span className="text-sm font-semibold tracking-wide text-purple-600 uppercase">Ready-made trips</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 leading-tight">Curated West Bengal itineraries</h1>
        <p className="text-slate-500 text-base sm:text-lg mt-3 max-w-2xl leading-relaxed">
          Hand-built routes for every kind of traveller — load any one into the Trip Planner with a click and make it your own.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
          {itineraries.map((i) => (
            <ItineraryCard key={i.id} itinerary={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default ItinerariesPage;
