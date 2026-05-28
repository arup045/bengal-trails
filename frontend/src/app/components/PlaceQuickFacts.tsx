import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Car, Mountain, Sunrise, Sunset, Sparkles } from 'lucide-react';

// Free, no-key public APIs. Each call is independent — the card renders whatever
// loaded by the soft timeout, so one slow service can't break the whole module.
// Sources: OSRM (drive time), Open-Elevation (altitude), Sunrise-Sunset.org.

// Howrah / Kolkata is the canonical "starting point" travellers measure from.
const KOLKATA = { lat: 22.5851, lng: 88.3468 } as const;
const SOFT_TIMEOUT = 9000;

interface Facts {
  driveTime?: number;   // seconds
  driveKm?: number;
  altitude?: number;    // metres above sea level
  sunrise?: string;     // ISO
  sunset?: string;      // ISO
}

const formatDuration = (sec: number) => {
  const h = Math.floor(sec / 3600);
  const m = Math.round((sec % 3600) / 60);
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} hr`;
  return `${h}h ${m}m`;
};
const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });

// Wraps a fetch with a soft timeout so a hung public API can't block the card.
const withTimeout = <T,>(p: Promise<T | null>): Promise<T | null> =>
  Promise.race([p, new Promise<null>((res) => setTimeout(() => res(null), SOFT_TIMEOUT))]);

export function PlaceQuickFacts({ lat, lng }: { lat: number; lng: number }) {
  const [facts, setFacts] = useState<Facts>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setFacts({});
    setLoading(true);

    const drive = withTimeout(
      fetch(`https://router.project-osrm.org/route/v1/driving/${KOLKATA.lng},${KOLKATA.lat};${lng},${lat}?overview=false`)
        .then((r) => (r.ok ? r.json() : null))
        .then((d: any) => d?.routes?.[0]
          ? { driveTime: d.routes[0].duration, driveKm: Math.round(d.routes[0].distance / 1000) }
          : null)
        .catch(() => null),
    );

    const elev = withTimeout(
      fetch(`https://api.open-elevation.com/api/v1/lookup?locations=${lat},${lng}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((d: any) => (d?.results?.[0]?.elevation != null ? { altitude: Math.round(d.results[0].elevation) } : null))
        .catch(() => null),
    );

    const sun = withTimeout(
      fetch(`https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&formatted=0`)
        .then((r) => (r.ok ? r.json() : null))
        .then((d: any) => (d?.results ? { sunrise: d.results.sunrise, sunset: d.results.sunset } : null))
        .catch(() => null),
    );

    Promise.all([drive, elev, sun]).then((parts) => {
      if (!alive) return;
      const merged: Facts = {};
      for (const p of parts) if (p) Object.assign(merged, p);
      setFacts(merged);
      setLoading(false);
    });

    return () => { alive = false; };
  }, [lat, lng]);

  // Build the cards from whatever loaded — gracefully skip a stat if its source failed.
  const items: { key: string; icon: typeof Car; label: string; value: string; sub: string; tone: string }[] = [];
  if (facts.driveTime != null && facts.driveKm != null) {
    items.push({
      key: 'drive', icon: Car, label: 'From Kolkata',
      value: formatDuration(facts.driveTime),
      sub: `${facts.driveKm.toLocaleString()} km by road`,
      tone: 'from-purple-50 to-purple-50/40 text-purple-600',
    });
  }
  if (facts.altitude != null) {
    items.push({
      key: 'alt', icon: Mountain, label: 'Altitude',
      value: `${facts.altitude.toLocaleString()} m`,
      sub: facts.altitude >= 1500 ? 'High altitude — pack warm'
         : facts.altitude >= 500  ? 'Low hills'
         : facts.altitude >= 50   ? 'Plains'
         : 'Near sea level',
      tone: 'from-emerald-50 to-emerald-50/40 text-emerald-600',
    });
  }
  if (facts.sunrise) {
    items.push({
      key: 'rise', icon: Sunrise, label: 'Sunrise',
      value: formatTime(facts.sunrise),
      sub: 'Golden hour at first light',
      tone: 'from-amber-50 to-amber-50/40 text-amber-600',
    });
  }
  if (facts.sunset) {
    items.push({
      key: 'set', icon: Sunset, label: 'Sunset',
      value: formatTime(facts.sunset),
      sub: 'Plan viewpoints before',
      tone: 'from-rose-50 to-rose-50/40 text-rose-600',
    });
  }

  if (!loading && items.length === 0) return null;

  return (
    <section id="plan-visit" className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-7 scroll-mt-32">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-100 to-orange-100 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-purple-600" strokeWidth={2} />
          </span>
          <h2 className="font-poppins text-lg sm:text-xl font-bold text-slate-900">Plan your visit</h2>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-poppins font-medium text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {loading
          ? [0, 1, 2, 3].map((i) => (
              <div key={i} className="h-[112px] rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 overflow-hidden relative">
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
              </div>
            ))
          : items.map((it, i) => (
              <motion.div
                key={it.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.35, ease: 'easeOut' }}
                className={`rounded-2xl border border-gray-100 bg-gradient-to-br ${it.tone.replace(/text-[a-z]+-\d+/, '')} p-4 hover:shadow-md hover:-translate-y-0.5 transition-all`}
              >
                <span className={`inline-flex items-center justify-center w-9 h-9 rounded-xl bg-white shadow-sm mb-3 ${it.tone.split(' ').pop()}`}>
                  <it.icon className="w-4 h-4" strokeWidth={1.85} />
                </span>
                <div className="font-poppins text-[10px] uppercase tracking-[0.08em] text-gray-400 font-semibold">{it.label}</div>
                <div className="font-poppins text-lg sm:text-xl font-bold text-slate-900 leading-tight mt-0.5">{it.value}</div>
                <div className="font-poppins text-[11px] text-gray-500 mt-1 leading-snug line-clamp-2">{it.sub}</div>
              </motion.div>
            ))}
      </div>
    </section>
  );
}

export default PlaceQuickFacts;
