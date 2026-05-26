import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getDistrictsWithMeta } from '../../data/districts';
import type { LocationCoords } from '../../utils/location';

// Custom teardrop pin (HTML divIcon) — avoids Leaflet's default marker PNG paths
// breaking under the bundler, and keeps the map on-brand.
const pin = (color: string) =>
  L.divIcon({
    className: 'bt-pin',
    html: `<svg width="26" height="34" viewBox="0 0 26 34" xmlns="http://www.w3.org/2000/svg">
      <path d="M13 0C5.8 0 0 5.8 0 13c0 9 13 21 13 21s13-12 13-21C26 5.8 20.2 0 13 0z" fill="${color}"/>
      <circle cx="13" cy="13" r="5" fill="#fff"/></svg>`,
    iconSize: [26, 34],
    iconAnchor: [13, 34],
    popupAnchor: [0, -30],
  });

const DISTRICT_PIN = pin('#7c3aed');
const HOVER_PIN = pin('#f97316'); // orange — matches the hovered list card
const ME_PIN = pin('#10b981');

// West Bengal bounding center.
const WB_CENTER: [number, number] = [23.8, 87.9];

interface DistrictsMapProps {
  userLoc?: LocationCoords | null;
  hoveredSlug?: string | null;
  onHoverSlug?: (slug: string | null) => void;
}

export default function DistrictsMap({ userLoc, hoveredSlug, onHoverSlug }: DistrictsMapProps) {
  const districts = getDistrictsWithMeta();

  return (
    <MapContainer
      center={userLoc ? [userLoc.latitude, userLoc.longitude] : WB_CENTER}
      zoom={userLoc ? 9 : 7}
      scrollWheelZoom={false}
      style={{ height: '70vh', minHeight: 420, width: '100%' }}
      className="rounded-3xl shadow-sm border border-gray-100 z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {districts.map((d) => (
        <Marker
          key={d.slug}
          position={[d.lat, d.lng]}
          icon={hoveredSlug === d.slug ? HOVER_PIN : DISTRICT_PIN}
          zIndexOffset={hoveredSlug === d.slug ? 1000 : 0}
          eventHandlers={{
            mouseover: () => onHoverSlug?.(d.slug),
            mouseout: () => onHoverSlug?.(null),
          }}
        >
          <Popup>
            <div style={{ minWidth: 160, fontFamily: 'Poppins, sans-serif' }}>
              <strong style={{ fontSize: 14, color: '#0f172a' }}>{d.name}</strong>
              <div style={{ fontSize: 12, color: '#64748b', margin: '2px 0 8px' }}>
                {d.region} · {d.placeCount > 0 ? `${d.placeCount} place${d.placeCount > 1 ? 's' : ''}` : 'New'}
              </div>
              <a href={`/explore/district/${d.slug}`}
                style={{ display: 'inline-block', background: '#7c3aed', color: '#fff', fontSize: 12, fontWeight: 600, padding: '6px 14px', borderRadius: 9999, textDecoration: 'none' }}>
                Explore {d.name}
              </a>
            </div>
          </Popup>
        </Marker>
      ))}

      {userLoc && (
        <>
          <Marker position={[userLoc.latitude, userLoc.longitude]} icon={ME_PIN}>
            <Popup>You are here</Popup>
          </Marker>
          <Circle
            center={[userLoc.latitude, userLoc.longitude]}
            radius={50000}
            pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.08, weight: 1 }}
          />
        </>
      )}
    </MapContainer>
  );
}
