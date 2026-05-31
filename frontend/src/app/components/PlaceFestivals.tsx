import { useEffect, useState } from 'react';
import { Calendar, ArrowUpRight, PartyPopper } from 'lucide-react';
import { API_BASE } from '../utils/api';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface Festival {
  id: string;
  name: string;
  bengaliName?: string;
  typicalDates?: string;
  months?: number[];
  category?: string;
  image?: string;
  locations?: string[];
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// "Festivals celebrated here" — connects a place to the real festivals whose
// `locations` list includes this place. Pure cross-link from existing data;
// renders nothing if no festival is tied to this spot.
export function PlaceFestivals({ placeSlug, placeName }: { placeSlug: string; placeName: string }) {
  const [festivals, setFestivals] = useState<Festival[]>([]);

  useEffect(() => {
    let alive = true;
    fetch(`${API_BASE}/bengal/festivals`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!alive) return;
        const all: Festival[] = d?.festivals || [];
        const here = all.filter((f) => Array.isArray(f.locations) && f.locations.includes(placeSlug)).slice(0, 8);
        setFestivals(here);
      })
      .catch(() => {});
    return () => { alive = false; };
  }, [placeSlug]);

  if (festivals.length === 0) return null;

  const when = (f: Festival) =>
    f.typicalDates || (f.months && f.months.length ? f.months.map((m) => MONTHS[m - 1]).filter(Boolean).join(' · ') : '');

  return (
    <section className="scroll-mt-32 font-poppins">
      <div className="flex items-center gap-2.5 mb-5">
        <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-100 to-orange-100 flex items-center justify-center">
          <PartyPopper className="w-4 h-4 text-purple-600" strokeWidth={2} />
        </span>
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">Festivals here</h2>
          <p className="text-sm text-slate-500">Celebrations that light up {placeName}</p>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 px-1 scrollbar-hide snap-x">
        {festivals.map((f) => (
          <a
            key={f.id}
            href="/festivals"
            className="group w-64 shrink-0 snap-start rounded-2xl overflow-hidden bg-white border border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-xl transition-all"
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-slate-50">
              {f.image ? (
                <ImageWithFallback src={f.image} alt={f.name} optimizeWidth={480}
                  className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-purple-200"><PartyPopper className="w-9 h-9" /></div>
              )}
            </div>
            <div className="p-4">
              <h3 className="text-base font-semibold text-slate-900 leading-snug line-clamp-1 group-hover:text-purple-600 transition-colors">{f.name}</h3>
              {when(f) && (
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3 shrink-0" /> {when(f)}
                </p>
              )}
              <span className="text-xs font-medium text-slate-500 group-hover:text-purple-600 inline-flex items-center gap-1 mt-3 pt-3 border-t border-slate-100 w-full transition-colors">
                See festival calendar <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

export default PlaceFestivals;
