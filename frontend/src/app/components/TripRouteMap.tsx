import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export interface RouteStop {
  title: string;
  lat: number;
  lng: number;
  day: number;
  order: number; // 1-based stop number across the whole trip
}

// Numbered teardrop pin (HTML divIcon) — keeps Leaflet's default marker PNG paths
// from breaking under the bundler and shows the visiting order on the map.
const numberedPin = (n: number, color: string) =>
  L.divIcon({
    className: 'bt-route-pin',
    html: `<svg width="30" height="38" viewBox="0 0 30 38" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 0C7 0 0 6.4 0 14.5 0 24.5 15 38 15 38s15-13.5 15-23.5C30 6.4 23 0 15 0z" fill="${color}"/>
      <circle cx="15" cy="14.5" r="9.5" fill="#fff"/>
      <text x="15" y="19" font-family="Poppins, sans-serif" font-size="12" font-weight="700" fill="${color}" text-anchor="middle">${n}</text></svg>`,
    iconSize: [30, 38],
    iconAnchor: [15, 38],
    popupAnchor: [0, -34],
  });

const WB_CENTER: [number, number] = [23.8, 87.9];

export default function TripRouteMap({ stops }: { stops: RouteStop[] }) {
  const pts = stops.map((s) => [s.lat, s.lng] as [number, number]);
  const bounds = pts.length >= 2 ? L.latLngBounds(pts) : undefined;

  return (
    <MapContainer
      {...(bounds ? { bounds, boundsOptions: { padding: [30, 30] } } : { center: pts[0] || WB_CENTER, zoom: 8 })}
      scrollWheelZoom={false}
      style={{ height: 320, width: '100%' }}
      className="rounded-2xl shadow-sm border border-gray-100 z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {pts.length >= 2 && (
        <Polyline positions={pts} pathOptions={{ color: '#7c3aed', weight: 3, opacity: 0.7, dashArray: '6 8' }} />
      )}

      {stops.map((s) => (
        <Marker key={`${s.title}-${s.order}`} position={[s.lat, s.lng]} icon={numberedPin(s.order, '#7c3aed')}>
          <Popup>
            <div style={{ fontFamily: 'Poppins, sans-serif', minWidth: 120 }}>
              <strong style={{ fontSize: 13, color: '#0f172a' }}>{s.title}</strong>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Day {s.day} · stop {s.order}</div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
