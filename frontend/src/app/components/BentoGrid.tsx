import { useState, useEffect } from 'react';
import { optimiseImage } from '../utils/imageOptimise';
import { ArrowRight, MapPin, Star } from 'lucide-react';
import { API_BASE } from '../utils/api';

interface Place { name: string; slug: string; image_url?: string; imageUrl?: string; region?: string; rating?: number; category?: string; }

const FALLBACK: Place[] = [
  { name: 'Darjeeling',        slug: 'darjeeling',               region: 'North Bengal', category: 'Hill Station',
    image_url: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800' },
  { name: 'Sundarbans',        slug: 'sundarbans-national-park', region: 'South Bengal', category: 'Wildlife',
    image_url: 'https://images.unsplash.com/photo-1585136917228-63d6c2a43ffa?w=600' },
  { name: 'Victoria Memorial', slug: 'victoria-memorial-kolkata',region: 'Kolkata',      category: 'Heritage',
    image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600' },
  { name: 'Bishnupur',         slug: 'bishnupur',                region: 'Bankura',      category: 'Heritage',
    image_url: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600' },
  { name: 'Digha',             slug: 'digha',                    region: 'East Midnapore', category: 'Beach',
    image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600' },
];

function PlaceCard({ place, large = false }: { place: Place; large?: boolean }) {
  const img = place.image_url || place.imageUrl || '';
  return (
    <a href={`#/explore/${place.slug}`}
      className={`group relative overflow-hidden rounded-2xl bg-gray-100 block ${large ? 'col-span-2 row-span-2' : ''}`}
      style={{ minHeight: large ? 340 : 160 }}>
      {img && (
        <img src={optimiseImage(img, large ? 900 : 500)} alt={place.name} loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="flex items-center gap-1.5 mb-1">
          <MapPin className="w-3 h-3 text-white/70" />
          <span className="font-poppins text-xs text-white/70">{place.region}</span>
          {place.rating && place.rating > 0 && (
            <span className="ml-auto flex items-center gap-0.5 font-poppins text-xs text-amber-300 font-medium">
              <Star className="w-3 h-3 fill-amber-300" />{Number(place.rating).toFixed(1)}
            </span>
          )}
        </div>
        <h3 className={`font-poppins font-semibold text-white leading-tight ${large ? 'text-2xl sm:text-3xl' : 'text-base'}`}>
          {place.name}
        </h3>
        {large && place.category && (
          <span className="inline-block mt-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full font-poppins text-xs text-white">
            {place.category}
          </span>
        )}
      </div>
      <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm
                      flex items-center justify-center opacity-0 group-hover:opacity-100
                      transition-all duration-200 group-hover:translate-x-0 translate-x-2">
        <ArrowRight className="w-4 h-4 text-white" />
      </div>
    </a>
  );
}

export function BentoGrid() {
  // Plain useState + useEffect — no TanStack Query (it was causing React #321)
  const [places, setPlaces] = useState<Place[]>(FALLBACK);

  useEffect(() => {
    let alive = true;
    fetch(`${API_BASE}/destinations?featured=true&limit=5`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (alive && d?.destinations?.length >= 5) setPlaces(d.destinations.slice(0, 5));
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  const [hero, ...rest] = places;

  return (
    <section className="max-w-7xl mx-auto px-5 sm:px-8 py-12">
      <div className="flex items-end justify-between mb-7">
        <div>
          <p className="font-poppins text-xs font-medium text-purple-600 uppercase tracking-widest mb-1">
            Featured destinations
          </p>
          <h2 className="font-poppins text-2xl sm:text-3xl font-semibold text-slate-900">
            West Bengal awaits
          </h2>
        </div>
        <a href="#/explore"
          className="hidden sm:flex items-center gap-1.5 font-poppins text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors">
          View all <ArrowRight className="w-4 h-4" />
        </a>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 grid-rows-auto gap-3">
        {hero && <PlaceCard place={hero} large />}
        {rest.map(p => <PlaceCard key={p.slug} place={p} />)}
      </div>

      <a href="#/explore"
        className="sm:hidden mt-4 flex items-center justify-center gap-2 w-full py-3
                   border border-purple-200 rounded-xl font-poppins text-sm font-medium
                   text-purple-600 hover:bg-purple-50 transition-colors">
        View all destinations <ArrowRight className="w-4 h-4" />
      </a>
    </section>
  );
}
