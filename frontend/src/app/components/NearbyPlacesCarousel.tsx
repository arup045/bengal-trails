import { useEffect, useState } from 'react';
import { Hotel, Utensils, Camera, Navigation, MapPin } from 'lucide-react';
import { API_BASE } from '../utils/api';
import { TravelSectionRow } from './TravelSectionRow';
import { useInView } from '../utils/useInView';

type Kind = 'hotel' | 'food' | 'attraction';

interface OsmItem { name: string; lat: number; lon: number; type: string }

const ICON: Record<Kind, typeof Hotel> = { hotel: Hotel, food: Utensils, attraction: Camera };
const TINT: Record<Kind, string> = {
  hotel: 'from-sky-50 to-blue-100 text-sky-500',
  food: 'from-orange-50 to-rose-100 text-orange-500',
  attraction: 'from-purple-50 to-fuchsia-100 text-purple-500',
};

// Generic OSM names that carry no real info — drop these so cards stay useful.
const GENERIC = new Set([
  'place', 'hotel', 'hostel', 'motel', 'apartment', 'guest_house', 'guesthouse',
  'restaurant', 'cafe', 'fast_food', 'food_court', 'park', 'garden', 'attraction',
  'viewpoint', 'museum', 'house', 'my house', 'untitled',
]);

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371, toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(bLat - aLat), dLng = toRad(bLng - aLng);
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

const prettyType = (t: string) =>
  ({ guest_house: 'Guest house', fast_food: 'Fast food', food_court: 'Food court' } as Record<string, string>)[t]
  || t.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

// Pulls REAL nearby places (hotels / restaurants / attractions) from OpenStreetMap
// via our cached geo proxy, sorted by distance from this spot. Honest local data:
// real names, real distances, a directions link — no invented photos or ratings.
export function NearbyPlacesCarousel({
  id, lat, lng, kind, title, subtitle, exclude, locationLabel, radius = 6000, limit = 18,
}: {
  id?: string; lat?: number; lng?: number; kind: Kind; title: string; subtitle?: string;
  exclude?: string[]; locationLabel: string; radius?: number; limit?: number;
}) {
  const [items, setItems] = useState<(OsmItem & { km: number })[]>([]);
  // Defer the OSM fetch until the user scrolls near this section, so a place
  // page doesn't fire every "nearby" request on initial load.
  const [sentinelRef, inView] = useInView<HTMLDivElement>();

  useEffect(() => {
    if (!inView || lat == null || lng == null) return;
    let alive = true;
    const skip = new Set((exclude || []).map(norm));
    fetch(`${API_BASE}/geo/amenities?lat=${lat}&lng=${lng}&type=${kind}&radius=${radius}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!alive || !d?.items) return;
        const seen = new Set<string>();
        const list = (d.items as OsmItem[])
          .filter((it) => it.name && !GENERIC.has(it.name.trim().toLowerCase()) && it.name.trim().length > 2)
          .filter((it) => { const n = norm(it.name); if (skip.has(n) || seen.has(n)) return false; seen.add(n); return true; })
          .map((it) => ({ ...it, km: haversineKm(lat, lng, it.lat, it.lon) }))
          .sort((a, b) => a.km - b.km)
          .slice(0, limit);
        setItems(list);
      })
      .catch(() => {});
    return () => { alive = false; };
  }, [inView, lat, lng, kind, radius, limit, exclude]);

  // Until the section scrolls into view, render a tiny sentinel the observer can
  // watch (so we know when to fetch). After that: the carousel, or nothing.
  if (!inView) return <div ref={sentinelRef} aria-hidden className="h-px" />;
  if (items.length === 0) return null;
  const Icon = ICON[kind];

  return (
    <TravelSectionRow id={id} title={title} subtitle={subtitle} count={items.length}>
      {items.map((it, i) => {
        const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${it.name}, ${locationLabel}`)}`;
        return (
          <a key={`${norm(it.name)}-${i}`} href={maps} target="_blank" rel="noopener noreferrer"
            className="group w-60 shrink-0 snap-start rounded-2xl bg-white border border-slate-100 hover:border-purple-200 hover:shadow-lg transition-all p-4 font-poppins">
            <div className="flex items-start gap-3">
              <span className={`w-11 h-11 shrink-0 rounded-xl bg-gradient-to-br ${TINT[kind]} flex items-center justify-center`}>
                <Icon className="w-5 h-5" strokeWidth={1.9} />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2 group-hover:text-purple-600 transition-colors">{it.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{prettyType(it.type)}</p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
              <span className="text-xs text-slate-500 inline-flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {it.km < 1 ? `${Math.round(it.km * 1000)} m` : `${it.km.toFixed(1)} km`}
              </span>
              <span className="text-xs font-medium text-slate-500 group-hover:text-purple-600 inline-flex items-center gap-1 transition-colors">
                Directions <Navigation className="w-3 h-3" />
              </span>
            </div>
          </a>
        );
      })}
    </TravelSectionRow>
  );
}

export default NearbyPlacesCarousel;
