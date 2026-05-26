import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const pin = L.divIcon({
  className: 'bt-pin',
  html: `<svg width="24" height="32" viewBox="0 0 26 34" xmlns="http://www.w3.org/2000/svg">
    <path d="M13 0C5.8 0 0 5.8 0 13c0 9 13 21 13 21s13-12 13-21C26 5.8 20.2 0 13 0z" fill="#7c3aed"/>
    <circle cx="13" cy="13" r="5" fill="#fff"/></svg>`,
  iconSize: [24, 32], iconAnchor: [12, 32], popupAnchor: [0, -28],
});

interface MapPlace { title: string; slug: string; lat: number; lng: number; }

// Mini-map for a district page: plots that district's places as clickable pins.
export default function DistrictPlacesMap({ center, places }: { center: [number, number]; places: MapPlace[] }) {
  return (
    <MapContainer
      center={center}
      zoom={10}
      scrollWheelZoom={false}
      style={{ height: 360, width: '100%' }}
      className="rounded-3xl border border-gray-100 z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {places.map((p) => (
        <Marker key={p.slug} position={[p.lat, p.lng]} icon={pin}>
          <Popup>
            <div style={{ fontFamily: 'Poppins, sans-serif', minWidth: 140 }}>
              <strong style={{ fontSize: 13, color: '#0f172a' }}>{p.title}</strong>
              <div style={{ marginTop: 6 }}>
                <a href={`/explore/${p.slug}`} style={{ color: '#7c3aed', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>View details →</a>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
