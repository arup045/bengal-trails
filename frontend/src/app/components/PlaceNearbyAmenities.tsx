import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Landmark, Stethoscope, Shield, Fuel, ExternalLink, Loader2, MapPin } from 'lucide-react';

// Free, no-key Overpass API (OpenStreetMap) — pulls real-world amenities around
// a coordinate. We query ATMs, hospitals, police, fuel; render distances and a
// Google-Maps deep link for each. No fabricated data: if OSM has nothing, we
// honestly say so.

interface Amenity { name: string; lat: number; lon: number; tags?: Record<string, string> }
interface AmenityGroup { items: Amenity[]; loaded: boolean }

// Static class strings so Tailwind's JIT picks them up at build (dynamic
// template-literal class names get tree-shaken away).
const COLOR_CLASSES = {
  emerald: { activeTab: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: 'text-emerald-600' },
  rose:    { activeTab: 'bg-rose-50 text-rose-700 border-rose-200',          icon: 'text-rose-600' },
  sky:     { activeTab: 'bg-sky-50 text-sky-700 border-sky-200',             icon: 'text-sky-600' },
  amber:   { activeTab: 'bg-amber-50 text-amber-700 border-amber-200',       icon: 'text-amber-600' },
} as const;

const CATEGORIES = [
  { key: 'atm',      label: 'ATMs',       icon: Landmark,    color: 'emerald' as const, query: 'amenity=atm', emptyHint: 'No ATMs mapped — withdraw before arrival.' },
  { key: 'hospital', label: 'Hospitals',  icon: Stethoscope, color: 'rose' as const,    query: 'amenity~"hospital|clinic|doctors"', emptyHint: 'No clinics mapped — keep emergency numbers handy.' },
  { key: 'police',   label: 'Police',     icon: Shield,      color: 'sky' as const,     query: 'amenity=police',                      emptyHint: 'No police station mapped here.' },
  { key: 'fuel',     label: 'Fuel',       icon: Fuel,        color: 'amber' as const,   query: 'amenity=fuel',                        emptyHint: 'No fuel stations mapped — fill up before the last town.' },
] as const;

type CatKey = typeof CATEGORIES[number]['key'];

// Haversine — for sorting/displaying distance in km. (Free, local.)
function distanceKm(aLat: number, aLng: number, bLat: number, bLng: number) {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const s1 = Math.sin(dLat / 2) ** 2;
  const s2 = Math.sin(dLng / 2) ** 2 * Math.cos((aLat * Math.PI) / 180) * Math.cos((bLat * Math.PI) / 180);
  return 2 * R * Math.asin(Math.sqrt(s1 + s2));
}
const fmtKm = (km: number) => (km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(km < 10 ? 1 : 0)} km`);

// Multiple Overpass mirrors — one may be down, rate-limited, or blocked. We try
// them in order with a GET request (?data=) which avoids the CORS preflight that
// a POST + form content-type triggers (and which the main mirror often rejects).
const OVERPASS_MIRRORS = [
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
  'https://overpass-api.de/api/interpreter',
];

async function fetchOverpass(lat: number, lng: number, queryFilter: string, radiusMeters = 7000): Promise<Amenity[]> {
  // Overpass QL: search nodes/ways with the filter inside a radius.
  const q = `[out:json][timeout:18];(node[${queryFilter}](around:${radiusMeters},${lat},${lng});way[${queryFilter}](around:${radiusMeters},${lat},${lng}););out center 30;`;
  let data: any = null;
  for (const base of OVERPASS_MIRRORS) {
    try {
      const res = await fetch(`${base}?data=${encodeURIComponent(q)}`);
      if (res.ok) { data = await res.json(); break; }
    } catch { /* try next mirror */ }
  }
  if (!data) return [];
  const elements: any[] = data?.elements || [];
  return elements
    .map((el) => {
      const elat = el.lat ?? el.center?.lat;
      const elon = el.lon ?? el.center?.lon;
      if (typeof elat !== 'number' || typeof elon !== 'number') return null;
      const name = el.tags?.name || el.tags?.operator || el.tags?.brand || `${el.tags?.amenity || 'Place'}`;
      return { name, lat: elat, lon: elon, tags: el.tags || {} };
    })
    .filter(Boolean) as Amenity[];
}

export function PlaceNearbyAmenities({ lat, lng, placeName }: { lat: number; lng: number; placeName: string }) {
  const [active, setActive] = useState<CatKey>('atm');
  const [groups, setGroups] = useState<Record<CatKey, AmenityGroup>>({
    atm:      { items: [], loaded: false },
    hospital: { items: [], loaded: false },
    police:   { items: [], loaded: false },
    fuel:     { items: [], loaded: false },
  });

  // Lazy-fetch each category only when its tab is first opened (saves Overpass quota).
  useEffect(() => {
    if (groups[active].loaded) return;
    const cat = CATEGORIES.find((c) => c.key === active)!;
    let alive = true;
    fetchOverpass(lat, lng, cat.query)
      .then((items) => {
        if (!alive) return;
        const withDist = items
          .map((it) => ({ ...it, _km: distanceKm(lat, lng, it.lat, it.lon) }))
          .sort((a, b) => (a as any)._km - (b as any)._km)
          .slice(0, 12);
        setGroups((g) => ({ ...g, [active]: { items: withDist, loaded: true } }));
      })
      .catch(() => setGroups((g) => ({ ...g, [active]: { items: [], loaded: true } })));
    return () => { alive = false; };
  }, [active, lat, lng]);

  const current = groups[active];
  const catMeta = useMemo(() => CATEGORIES.find((c) => c.key === active)!, [active]);

  return (
    <section id="around-here" className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-7 scroll-mt-32">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-100 to-sky-100 flex items-center justify-center">
            <MapPin className="w-4 h-4 text-emerald-700" strokeWidth={2} />
          </span>
          <div>
            <h2 className="font-poppins text-lg sm:text-xl font-bold text-slate-900 leading-tight">Around {placeName}</h2>
            <p className="font-poppins text-xs text-gray-500">Live data from OpenStreetMap — within ~7 km</p>
          </div>
        </div>
      </div>

      {/* Tab pills */}
      <div className="flex flex-wrap gap-2 mb-5">
        {CATEGORIES.map((c) => {
          const Icon = c.icon;
          const isActive = c.key === active;
          return (
            <button
              key={c.key}
              onClick={() => setActive(c.key)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-poppins text-sm font-medium border transition-all ${
                isActive
                  ? `${COLOR_CLASSES[c.color].activeTab} shadow-sm`
                  : 'bg-white text-gray-600 border-gray-200 hover:border-purple-200 hover:text-purple-700'
              }`}
            >
              <Icon className="w-4 h-4" strokeWidth={1.85} />
              {c.label}
            </button>
          );
        })}
      </div>

      {/* List */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          {!current.loaded ? (
            <div className="flex items-center justify-center py-10 text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin mr-2" /> <span className="font-poppins text-sm">Finding nearby {catMeta.label.toLowerCase()}…</span>
            </div>
          ) : current.items.length === 0 ? (
            <div className="text-center py-8 px-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <catMeta.icon className="w-7 h-7 text-gray-300 mx-auto mb-2" strokeWidth={1.5} />
              <p className="font-poppins text-sm text-gray-500">{catMeta.emptyHint}</p>
            </div>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {current.items.map((it, i) => {
                const km = distanceKm(lat, lng, it.lat, it.lon);
                const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(it.name + ' ' + placeName)}&query_place_id=${it.lat},${it.lon}`;
                return (
                  <motion.li
                    key={`${it.name}-${i}`}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.025, duration: 0.25 }}
                  >
                    <a
                      href={mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 px-4 py-3 rounded-2xl border border-gray-100 bg-gradient-to-br from-gray-50 to-white hover:from-purple-50 hover:to-orange-50 hover:border-purple-200 transition-all"
                    >
                      <span className={`shrink-0 w-9 h-9 rounded-xl bg-white border border-gray-100 ${COLOR_CLASSES[catMeta.color].icon} flex items-center justify-center shadow-sm`}>
                        <catMeta.icon className="w-4 h-4" strokeWidth={1.85} />
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="font-poppins text-sm font-semibold text-slate-900 block truncate">{it.name}</span>
                        <span className="font-poppins text-[11px] text-gray-500 flex items-center gap-1.5 mt-0.5">
                          <MapPin className="w-3 h-3" /> {fmtKm(km)} away
                        </span>
                      </span>
                      <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-purple-600 transition-colors shrink-0" />
                    </a>
                  </motion.li>
                );
              })}
            </ul>
          )}
        </motion.div>
      </AnimatePresence>

      <p className="font-poppins text-[11px] text-gray-400 mt-5 leading-relaxed">
        Data © OpenStreetMap contributors. Coverage varies — confirm critical services on arrival.
      </p>
    </section>
  );
}

export default PlaceNearbyAmenities;
