import { useEffect, useState } from 'react';
import { Plane, Train, Car, ArrowRight, Loader2 } from 'lucide-react';

// Three-card "how to reach" grid — the spec's Logistics & Practicalities block.
// Airport / train station are mapped from Bengal-specific knowledge so the
// nearest real gateway shows for every district. Drive time is live OSRM.

const KOLKATA = { lat: 22.5851, lng: 88.3468 } as const;

interface Gateway { code: string; name: string; city: string; note: string }

function airportFor(region?: string, district?: string): Gateway {
  const d = (district || '').toLowerCase();
  // Andal (Durgapur) is the closest commercial airport for the Asansol-Durgapur belt
  if (/asansol|paschim bardhaman|durgapur/.test(d)) {
    return { code: 'RDP', name: 'Kazi Nazrul Islam Airport, Andal', city: 'Durgapur', note: 'Closest commercial gateway' };
  }
  if (/darjeeling|kalimpong|kurseong|mirik|jalpaiguri|alipurduar|cooch behar/.test(d) || /north/.test((region || '').toLowerCase())) {
    return { code: 'IXB', name: 'Bagdogra International Airport', city: 'Siliguri', note: 'Gateway to the hills & Dooars' };
  }
  return { code: 'CCU', name: 'Netaji Subhas Chandra Bose International', city: 'Kolkata', note: 'Main air hub for South & Central Bengal' };
}

function trainFor(region?: string, district?: string): Gateway {
  const d = (district || '').toLowerCase();
  if (/darjeeling|kalimpong|kurseong|mirik/.test(d)) {
    return { code: 'NJP', name: 'New Jalpaiguri Junction', city: 'Siliguri', note: 'Then jeep / car up the hill road' };
  }
  if (/jalpaiguri|alipurduar|cooch behar|north/.test(d) || /north/.test((region || '').toLowerCase())) {
    return { code: 'NJP', name: 'New Jalpaiguri Junction', city: 'Siliguri', note: 'Major broad-gauge junction for North Bengal' };
  }
  if (/asansol|paschim bardhaman/.test(d)) {
    return { code: 'ASN', name: 'Asansol Junction', city: 'Asansol', note: 'Eastern Railway main line stop' };
  }
  if (/purba bardhaman|bardhaman/.test(d)) {
    return { code: 'BWN', name: 'Bardhaman Junction', city: 'Bardhaman', note: 'Eastern Railway grand chord junction' };
  }
  if (/murshidabad/.test(d)) {
    return { code: 'BHP', name: 'Berhampore Court', city: 'Berhampore', note: 'Express trains from Sealdah' };
  }
  if (/midnapore|paschim medinipur|jhargram/.test(d)) {
    return { code: 'KGP', name: 'Kharagpur Junction', city: 'Kharagpur', note: 'One of India’s longest platforms' };
  }
  return { code: 'HWH', name: 'Howrah Junction', city: 'Kolkata', note: 'Eastern Railway terminus' };
}

function formatDuration(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.round((sec % 3600) / 60);
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} hr`;
  return `${h}h ${m}m`;
}

interface PlaceLogisticsProps { lat: number; lng: number; region?: string; district?: string; placeName: string }

export function PlaceLogistics({ lat, lng, region, district, placeName }: PlaceLogisticsProps) {
  const [drive, setDrive] = useState<{ time?: number; km?: number; loading: boolean }>({ loading: true });

  useEffect(() => {
    let alive = true;
    setDrive({ loading: true });
    const mirrors = [
      `https://router.project-osrm.org/route/v1/driving/${KOLKATA.lng},${KOLKATA.lat};${lng},${lat}?overview=false`,
      `https://routing.openstreetmap.de/routed-car/route/v1/driving/${KOLKATA.lng},${KOLKATA.lat};${lng},${lat}?overview=false`,
    ];
    (async () => {
      for (const u of mirrors) {
        try {
          const r = await fetch(u);
          if (r.ok) {
            const d = await r.json();
            if (d?.routes?.[0] && alive) {
              setDrive({ time: d.routes[0].duration, km: Math.round(d.routes[0].distance / 1000), loading: false });
              return;
            }
          }
        } catch { /* try next mirror */ }
      }
      if (alive) setDrive({ loading: false });
    })();
    return () => { alive = false; };
  }, [lat, lng]);

  const airport = airportFor(region, district);
  const train = trainFor(region, district);

  const cards = [
    {
      key: 'flight',
      icon: Plane,
      tag: 'Fly via',
      title: airport.code,
      subtitle: airport.name,
      meta: [airport.city, airport.note],
      cta: { label: 'Search flights', href: `https://www.google.com/travel/flights?q=Flights%20to%20${encodeURIComponent(airport.code)}` },
    },
    {
      key: 'train',
      icon: Train,
      tag: 'Rail in via',
      title: train.code,
      subtitle: train.name,
      meta: [train.city, train.note],
      cta: { label: 'Check trains', href: `https://www.google.com/search?q=${encodeURIComponent('Trains to ' + train.name)}` },
    },
    {
      key: 'road',
      icon: Car,
      tag: 'Drive from Kolkata',
      title: drive.loading
        ? <span className="inline-flex items-center gap-1.5 text-slate-400 text-base font-medium"><Loader2 className="w-4 h-4 animate-spin" /> Live route…</span>
        : drive.time != null
          ? formatDuration(drive.time)
          : '—',
      subtitle: drive.km != null ? `${drive.km.toLocaleString()} km via NH/SH highways` : 'Live OSRM route',
      meta: ['Shared cabs from Esplanade', 'Self-drive & rentals available'],
      cta: { label: 'Open in Maps', href: `https://www.google.com/maps/dir/?api=1&origin=Kolkata&destination=${encodeURIComponent(placeName)}` },
    },
  ];

  return (
    <div className="grid md:grid-cols-3 gap-4 font-poppins">
      {cards.map((c) => (
        <div
          key={c.key}
          className="group relative rounded-2xl border border-slate-100 bg-white p-5 hover:shadow-lg hover:border-slate-200 hover:-translate-y-0.5 transition-all"
        >
          <div className="flex items-start justify-between mb-4">
            <span className="inline-flex w-11 h-11 rounded-xl bg-purple-50 text-purple-600 items-center justify-center">
              <c.icon className="w-5 h-5" strokeWidth={1.85} />
            </span>
            <span className="text-[10px] uppercase tracking-[0.12em] text-slate-400 font-semibold pt-1">
              {c.tag}
            </span>
          </div>

          <div className="text-2xl font-bold text-slate-900 leading-tight">{c.title}</div>
          <div className="text-sm text-slate-600 mt-1 line-clamp-2">{c.subtitle}</div>

          <ul className="mt-4 space-y-1.5">
            {c.meta.map((m, i) => (
              <li key={i} className="text-[12px] text-slate-500 flex items-center gap-1.5 leading-snug">
                <span className="w-1 h-1 rounded-full bg-slate-300 shrink-0" /> {m}
              </li>
            ))}
          </ul>

          <a
            href={c.cta.href}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors"
          >
            {c.cta.label} <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>
      ))}
    </div>
  );
}

export default PlaceLogistics;
