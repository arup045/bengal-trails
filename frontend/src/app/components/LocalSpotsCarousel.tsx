import { useEffect, useState } from 'react';
import { Hotel, Utensils, MapPin, ArrowUpRight } from 'lucide-react';
import { API_BASE } from '../utils/api';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { TravelSectionRow } from './TravelSectionRow';

type Kind = 'stay' | 'food';

// Renders a place's REAL, place-specific nearby hotels / restaurants (from the
// dataset's nearbyHotels / nearbyRestaurants) as a premium card carousel.
// Each card pulls a representative photo via our backend photo-proxy (cached)
// and links to Google Maps for directions. No fabricated ratings/reviews.
function SpotCard({ name, kind, locationLabel }: { name: string; kind: Kind; locationLabel: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const Icon = kind === 'stay' ? Hotel : Utensils;

  useEffect(() => {
    let alive = true;
    const q = `${name} ${locationLabel} ${kind === 'stay' ? 'hotel' : 'restaurant'} West Bengal`;
    fetch(`${API_BASE}/geo/photo?query=${encodeURIComponent(q)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (alive && d?.url) setUrl(d.url); })
      .catch(() => {});
    return () => { alive = false; };
  }, [name, kind, locationLabel]);

  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name}, ${locationLabel}, West Bengal`)}`;

  return (
    <a
      href={mapsHref}
      target="_blank"
      rel="noopener noreferrer"
      className="group w-64 shrink-0 snap-start rounded-2xl overflow-hidden bg-white border border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-xl transition-all font-poppins"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-50">
        {url ? (
          <ImageWithFallback src={url} alt={name} optimizeWidth={480}
            className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700" />
        ) : (
          <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${kind === 'stay' ? 'from-sky-50 to-blue-100' : 'from-orange-50 to-rose-100'}`}>
            <Icon className={`w-9 h-9 ${kind === 'stay' ? 'text-sky-300' : 'text-orange-300'}`} strokeWidth={1.6} />
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-base font-semibold text-slate-900 leading-snug line-clamp-1 group-hover:text-purple-600 transition-colors">{name}</h3>
        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 line-clamp-1">
          <MapPin className="w-3 h-3 shrink-0" /> {locationLabel}
        </p>
        <span className="text-xs font-medium text-slate-500 group-hover:text-purple-600 inline-flex items-center gap-1 mt-3 pt-3 border-t border-slate-100 w-full transition-colors">
          Find on map <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </span>
      </div>
    </a>
  );
}

export function LocalSpotsCarousel({
  id, title, subtitle, names, kind, locationLabel,
}: {
  id?: string; title: string; subtitle?: string; names?: string[]; kind: Kind; locationLabel: string;
}) {
  const list = (names || []).filter(Boolean);
  if (list.length === 0) return null;
  return (
    <TravelSectionRow id={id} title={title} subtitle={subtitle} count={list.length}>
      {list.map((name) => (
        <SpotCard key={name} name={name} kind={kind} locationLabel={locationLabel} />
      ))}
    </TravelSectionRow>
  );
}

export default LocalSpotsCarousel;
