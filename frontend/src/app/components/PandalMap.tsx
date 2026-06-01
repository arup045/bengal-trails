import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { PUJA_PANDALS, type PandalArea } from '../data/pujaPandals';

// One pin colour per area so the pandal clusters read at a glance.
const AREA_COLOR: Record<PandalArea, string> = {
  'North Kolkata': '#7c3aed',
  'Central Kolkata': '#db2777',
  'South Kolkata': '#ea580c',
  'Salt Lake & North Fringe': '#0891b2',
  'Behala & South-West': '#16a34a',
};

const iconFor = (color: string) => L.divIcon({
  className: 'bt-pandal-pin',
  html: `<svg width="24" height="32" viewBox="0 0 26 34" xmlns="http://www.w3.org/2000/svg">
    <path d="M13 0C5.8 0 0 5.8 0 13c0 9 13 21 13 21s13-12 13-21C26 5.8 20.2 0 13 0z" fill="${color}"/>
    <circle cx="13" cy="13" r="5" fill="#fff"/></svg>`,
  iconSize: [24, 32], iconAnchor: [12, 32], popupAnchor: [0, -28],
});

// Full Kolkata Durga Puja pandal map. Lazy-loaded (carries Leaflet) from the
// Durga Puja page. Pins are coloured by area and link out to Google Maps.
export default function PandalMap() {
  return (
    <MapContainer
      center={[22.5640, 88.3690]}
      zoom={12}
      scrollWheelZoom={false}
      style={{ height: 480, width: '100%' }}
      className="rounded-3xl border border-gray-100 z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {PUJA_PANDALS.map((p) => (
        <Marker key={p.name} position={[p.lat, p.lng]} icon={iconFor(AREA_COLOR[p.area])}>
          <Popup>
            <div style={{ fontFamily: 'Poppins, sans-serif', minWidth: 170 }}>
              <strong style={{ fontSize: 13, color: '#0f172a' }}>{p.name}</strong>
              <div style={{ fontSize: 11, color: '#64748b', margin: '2px 0 6px' }}>{p.area} · {p.kind}</div>
              <div style={{ fontSize: 12, color: '#334155', lineHeight: 1.4 }}>{p.knownFor}</div>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.name + ', Kolkata')}`}
                target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-block', marginTop: 8, color: '#7c3aed', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}
              >Directions →</a>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
