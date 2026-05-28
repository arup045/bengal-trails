import { useState, useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Loader2, Compass } from 'lucide-react';

// Live OpenStreetMap interactive area-explorer. Toggles fetch real POIs from
// the Overpass API (no key) within a small radius and pin them on the map with
// category-coloured pins, popups, distance, and a "Directions" deep-link.

interface POI { id: string; name: string; lat: number; lng: number; type: string }

interface CatConfig {
  key: string; label: string; color: string; emoji: string; query: string;
}

const CATS: CatConfig[] = [
  { key: 'food',     label: 'Food',      color: '#f97316', emoji: '🍽️', query: 'node["amenity"~"^(restaurant|cafe|fast_food|food_court)$"]' },
  { key: 'hotels',   label: 'Stays',     color: '#2563eb', emoji: '🏨', query: 'node["tourism"~"^(hotel|hostel|guest_house|motel|apartment)$"]' },
  { key: 'parks',    label: 'Parks',     color: '#16a34a', emoji: '🌳', query: 'node["leisure"~"^(park|garden)$"]' },
  { key: 'atm',      label: 'ATMs',      color: '#7c3aed', emoji: '🏧', query: 'node["amenity"="atm"]' },
  { key: 'hospital', label: 'Hospitals', color: '#dc2626', emoji: '🏥', query: 'node["amenity"~"^(hospital|clinic|pharmacy)$"]' },
  { key: 'fuel',     label: 'Fuel',      color: '#eab308', emoji: '⛽', query: 'node["amenity"="fuel"]' },
  { key: 'police',   label: 'Police',    color: '#64748b', emoji: '🚓', query: 'node["amenity"="police"]' },
];

const RADIUS_METERS = 3500;

// Centre pin — bigger purple teardrop so the place stands out from POI dots.
const CENTER_ICON = L.divIcon({
  className: 'bt-place-center',
  html: `<svg width="32" height="42" viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 0C7.2 0 0 7 0 15.5C0 27 16 42 16 42s16-15 16-26.5C32 7 24.8 0 16 0z" fill="#7c3aed" stroke="white" stroke-width="2.5"/>
    <circle cx="16" cy="15.5" r="6" fill="white"/>
    <circle cx="16" cy="15.5" r="3" fill="#7c3aed"/>
  </svg>`,
  iconSize: [32, 42], iconAnchor: [16, 42], popupAnchor: [0, -38],
});

const poiIconCache: Record<string, L.DivIcon> = {};
function poiIcon(color: string): L.DivIcon {
  if (poiIconCache[color]) return poiIconCache[color];
  const ic = L.divIcon({
    className: 'bt-poi',
    html: `<div style="width:22px;height:22px;border-radius:50%;background:${color};border:2.5px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.28);display:flex;align-items:center;justify-content:center;">
      <div style="width:6px;height:6px;border-radius:50%;background:white;"></div>
    </div>`,
    iconSize: [22, 22], iconAnchor: [11, 11], popupAnchor: [0, -10],
  });
  poiIconCache[color] = ic;
  return ic;
}

function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s1 = Math.sin(dLat / 2) ** 2;
  const s2 = Math.sin(dLng / 2) ** 2 * Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180);
  return 2 * R * Math.asin(Math.sqrt(s1 + s2));
}

export function PlaceInteractiveMap({ lat, lng, placeName }: { lat: number; lng: number; placeName: string }) {
  // Default-on layers — Food + Stays are the most useful at first glance.
  const [enabled, setEnabled] = useState<Record<string, boolean>>({ food: true, hotels: true });
  const [pois, setPois] = useState<Record<string, POI[]>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const fetchedRef = useRef<Set<string>>(new Set());

  const toggle = (key: string) => setEnabled((prev) => ({ ...prev, [key]: !prev[key] }));

  // Reset POI cache + fetch flags whenever the place changes (different lat/lng).
  useEffect(() => {
    setPois({});
    setLoading({});
    fetchedRef.current = new Set();
  }, [lat, lng]);

  // For each enabled category not yet fetched, fire an Overpass query.
  useEffect(() => {
    const toFetch = CATS.filter((c) => enabled[c.key] && !fetchedRef.current.has(c.key));
    if (toFetch.length === 0) return;

    const ctrl = new AbortController();
    toFetch.forEach((cat) => {
      fetchedRef.current.add(cat.key);
      setLoading((prev) => ({ ...prev, [cat.key]: true }));
      const body = `[out:json][timeout:20];(${cat.query}(around:${RADIUS_METERS},${lat},${lng}););out body 60;`;
      fetch('https://overpass-api.de/api/interpreter', { method: 'POST', body, signal: ctrl.signal })
        .then((r) => (r.ok ? r.json() : null))
        .then((d: any) => {
          const list: POI[] = !d?.elements ? [] : d.elements
            .filter((e: any) => e.type === 'node' && typeof e.lat === 'number')
            .map((e: any) => ({
              id: `${cat.key}-${e.id}`,
              name: e.tags?.name || e.tags?.brand || cat.label,
              lat: e.lat, lng: e.lon,
              type: String(e.tags?.amenity || e.tags?.tourism || e.tags?.leisure || cat.label).replace(/_/g, ' '),
            }));
          setPois((prev) => ({ ...prev, [cat.key]: list }));
        })
        .catch(() => { setPois((prev) => ({ ...prev, [cat.key]: [] })); })
        .finally(() => { setLoading((prev) => ({ ...prev, [cat.key]: false })); });
    });

    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, lat, lng]);

  const visible = useMemo(
    () => CATS.filter((c) => enabled[c.key] && pois[c.key]).map((c) => ({ cat: c, list: pois[c.key] || [] })),
    [enabled, pois],
  );
  const totalVisible = visible.reduce((s, x) => s + x.list.length, 0);

  return (
    <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-100 to-orange-100 flex items-center justify-center shrink-0">
              <Compass className="w-4 h-4 text-purple-600" strokeWidth={2} />
            </span>
            <div className="min-w-0">
              <h3 className="font-poppins text-base font-bold text-slate-900 leading-tight">Explore the area</h3>
              <p className="font-poppins text-[11px] text-gray-500 truncate">Within {RADIUS_METERS / 1000} km of {placeName}</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] font-poppins font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live OSM
          </span>
        </div>

        {/* Category toggle chips */}
        <div className="flex flex-wrap gap-1.5">
          {CATS.map((c) => {
            const on = !!enabled[c.key];
            const count = pois[c.key]?.length;
            const busy = loading[c.key];
            return (
              <button
                key={c.key}
                onClick={() => toggle(c.key)}
                aria-pressed={on}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-poppins text-[11px] font-medium border transition-all ${
                  on
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-white hover:text-slate-700'
                }`}
                style={on ? { borderColor: c.color } : undefined}
              >
                <span>{c.emoji}</span>
                {c.label}
                {busy ? (
                  <Loader2 className="w-3 h-3 animate-spin opacity-60" />
                ) : on && count != null ? (
                  <span className="text-[10px] font-semibold opacity-70">{count}</span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {/* Map */}
      <div className="relative">
        <MapContainer
          center={[lat, lng]}
          zoom={14}
          scrollWheelZoom={false}
          style={{ height: 360, width: '100%' }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Centre marker — the place itself */}
          <Marker position={[lat, lng]} icon={CENTER_ICON}>
            <Popup>
              <div style={{ fontFamily: 'Poppins, sans-serif', minWidth: 140 }}>
                <strong style={{ fontSize: 13, color: '#0f172a' }}>{placeName}</strong>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>You're exploring here</div>
              </div>
            </Popup>
          </Marker>

          {/* Visible POIs across every enabled category */}
          {visible.map(({ cat, list }) =>
            list.map((p) => {
              const dKm = distanceKm({ lat, lng }, { lat: p.lat, lng: p.lng });
              const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`;
              return (
                <Marker key={p.id} position={[p.lat, p.lng]} icon={poiIcon(cat.color)}>
                  <Popup>
                    <div style={{ fontFamily: 'Poppins, sans-serif', minWidth: 160 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <span>{cat.emoji}</span>
                        <strong style={{ fontSize: 13, color: '#0f172a' }}>{p.name}</strong>
                      </div>
                      <div style={{ fontSize: 11, color: '#64748b', textTransform: 'capitalize' }}>{p.type}</div>
                      <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{dKm.toFixed(1)} km away</div>
                      <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
                        style={{ display: 'inline-block', marginTop: 8, background: '#7c3aed', color: 'white', fontSize: 11, fontWeight: 600, padding: '5px 12px', borderRadius: 9999, textDecoration: 'none' }}>
                        Directions →
                      </a>
                    </div>
                  </Popup>
                </Marker>
              );
            }),
          )}
        </MapContainer>

        {/* Floating count chip */}
        {totalVisible > 0 && (
          <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm border border-gray-100 rounded-full px-3 py-1 shadow-sm font-poppins text-[11px] font-semibold text-slate-700 z-[400]">
            {totalVisible} place{totalVisible !== 1 ? 's' : ''} nearby
          </div>
        )}
      </div>

      {/* Footer hint */}
      <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/40">
        <p className="font-poppins text-[11px] text-gray-500 leading-relaxed">
          Tap any category chip to layer it on the map · click a pin for details & directions
        </p>
      </div>
    </section>
  );
}

export default PlaceInteractiveMap;
