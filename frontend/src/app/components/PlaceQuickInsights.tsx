import { useEffect, useState } from 'react';
import {
  Mountain, Wind, Calendar, Cloud, Sun, CloudRain, CloudSnow, CloudFog,
  CloudDrizzle, CloudLightning, CloudSun, Thermometer,
} from 'lucide-react';

// The "Quick Insights" 4-tile glassmorphic widget for the Overview asymmetric
// 2-column block. Pulls from the same free, no-key endpoints used elsewhere on
// the page, with a fallback chain on each so a single blocked host can't blank
// the whole card.

const MONTHS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
const MONTH_MAP: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

async function tryAll(urls: string[]): Promise<any | null> {
  for (const url of urls) {
    try { const r = await fetch(url); if (r.ok) return await r.json(); } catch { /* next mirror */ }
  }
  return null;
}

function wmo(code: number): { label: string; Icon: typeof Sun } {
  if (code === 0) return { label: 'Clear sky', Icon: Sun };
  if (code <= 2) return { label: 'Partly cloudy', Icon: CloudSun };
  if (code === 3) return { label: 'Overcast', Icon: Cloud };
  if (code === 45 || code === 48) return { label: 'Foggy', Icon: CloudFog };
  if (code >= 51 && code <= 57) return { label: 'Drizzle', Icon: CloudDrizzle };
  if (code >= 61 && code <= 67) return { label: 'Rainy', Icon: CloudRain };
  if (code >= 71 && code <= 77) return { label: 'Snowy', Icon: CloudSnow };
  if (code >= 80 && code <= 82) return { label: 'Showers', Icon: CloudRain };
  if (code >= 95) return { label: 'Thunderstorms', Icon: CloudLightning };
  return { label: 'Mixed', Icon: Cloud };
}

function aqiBand(aqi: number) {
  if (aqi <= 20) return { label: 'Good',      dot: 'bg-emerald-500', text: 'text-emerald-700' };
  if (aqi <= 40) return { label: 'Fair',      dot: 'bg-lime-500',    text: 'text-lime-700' };
  if (aqi <= 60) return { label: 'Moderate',  dot: 'bg-amber-500',   text: 'text-amber-700' };
  if (aqi <= 80) return { label: 'Poor',      dot: 'bg-orange-500',  text: 'text-orange-700' };
  if (aqi <= 100) return { label: 'Very poor', dot: 'bg-rose-500',    text: 'text-rose-700' };
  return { label: 'Extreme', dot: 'bg-purple-500', text: 'text-purple-700' };
}

// Parses "Oct–Feb", "Sep-Mar", "Oct, Nov, Dec" → array of 0-based month indices.
function parseMonths(bestTime?: string): Set<number> {
  const out = new Set<number>();
  if (!bestTime) return out;
  const parts = bestTime.toLowerCase().split(/,|\band\b/).map((s) => s.trim()).filter(Boolean);
  for (const part of parts) {
    const range = part.match(/([a-z]{3,})\s*[-–—to]+\s*([a-z]{3,})/);
    if (range) {
      const a = MONTH_MAP[range[1].slice(0, 3)];
      const b = MONTH_MAP[range[2].slice(0, 3)];
      if (a != null && b != null) {
        let i = a;
        while (true) { out.add(i); if (i === b) break; i = (i + 1) % 12; }
      }
    } else {
      const single = part.match(/([a-z]{3,})/);
      if (single) { const m = MONTH_MAP[single[1].slice(0, 3)]; if (m != null) out.add(m); }
    }
  }
  return out;
}

interface InsightsState { temp?: number; weatherCode?: number; alt?: number; aqi?: number }

export function PlaceQuickInsights({ lat, lng, bestTime }: { lat: number; lng: number; bestTime?: string }) {
  const [data, setData] = useState<InsightsState>({});

  useEffect(() => {
    let alive = true;
    setData({});

    const weather = fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weather_code&timezone=auto`,
    )
      .then((r) => (r.ok ? r.json() : null))
      .then((d: any) => d?.current
        ? { temp: Math.round(d.current.temperature_2m), weatherCode: d.current.weather_code }
        : null)
      .catch(() => null);

    const elev = tryAll([
      `https://api.open-elevation.com/api/v1/lookup?locations=${lat},${lng}`,
      `https://api.opentopodata.org/v1/aster30m?locations=${lat},${lng}`,
      `https://api.opentopodata.org/v1/srtm30m?locations=${lat},${lng}`,
    ]).then((d: any) => (d?.results?.[0]?.elevation != null
      ? { alt: Math.round(d.results[0].elevation) }
      : null));

    const aq = fetch(
      `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lng}&current=european_aqi`,
    )
      .then((r) => (r.ok ? r.json() : null))
      .then((d: any) => (d?.current?.european_aqi != null
        ? { aqi: Math.round(d.current.european_aqi) }
        : null))
      .catch(() => null);

    Promise.all([weather, elev, aq]).then((parts) => {
      if (!alive) return;
      const merged: InsightsState = {};
      for (const p of parts) if (p) Object.assign(merged, p);
      setData(merged);
    });

    return () => { alive = false; };
  }, [lat, lng]);

  const w = data.weatherCode != null ? wmo(data.weatherCode) : null;
  const aq = data.aqi != null ? aqiBand(data.aqi) : null;
  const monthsActive = parseMonths(bestTime);

  const Tile = ({
    accent, icon, label, value, sub,
  }: { accent: string; icon: React.ReactNode; label: string; value: React.ReactNode; sub: React.ReactNode }) => (
    <div className="rounded-2xl border border-slate-100 bg-white/85 backdrop-blur-sm p-4 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 font-poppins">
      <span className={`inline-flex w-9 h-9 rounded-xl items-center justify-center ${accent}`}>
        {icon}
      </span>
      <div className="text-[10px] uppercase tracking-[0.12em] text-slate-400 font-semibold mt-3">{label}</div>
      <div className="text-xl font-bold text-slate-900 leading-tight mt-0.5">{value}</div>
      <div className="text-[11px] text-slate-500 mt-1 line-clamp-1">{sub}</div>
    </div>
  );

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Current weather */}
      <Tile
        accent="bg-sky-50 text-sky-600"
        icon={w ? <w.Icon className="w-4 h-4" strokeWidth={1.85} /> : <Thermometer className="w-4 h-4" strokeWidth={1.85} />}
        label="Right now"
        value={data.temp != null ? <>{data.temp}<span className="text-base font-medium ml-0.5">°C</span></> : '—'}
        sub={w?.label || 'Live conditions…'}
      />

      {/* Altitude */}
      <Tile
        accent="bg-emerald-50 text-emerald-600"
        icon={<Mountain className="w-4 h-4" strokeWidth={1.85} />}
        label="Altitude"
        value={data.alt != null ? <>{data.alt.toLocaleString()}<span className="text-base font-medium ml-0.5">m</span></> : '—'}
        sub={data.alt != null
          ? data.alt >= 1500 ? 'High altitude — pack warm'
            : data.alt >= 500 ? 'Low hills'
            : data.alt >= 50  ? 'Plains'
            : 'Near sea level'
          : 'Above sea level'}
      />

      {/* Air quality */}
      <Tile
        accent="bg-purple-50 text-purple-600"
        icon={<Wind className="w-4 h-4" strokeWidth={1.85} />}
        label="Air quality"
        value={data.aqi != null ? (
          <span className="inline-flex items-center gap-1.5">
            {data.aqi}
            {aq && <span className={`w-2 h-2 rounded-full ${aq.dot}`} />}
          </span>
        ) : '—'}
        sub={<span className={aq?.text || 'text-slate-500'}>{aq?.label || 'European AQI'}</span>}
      />

      {/* Best time + month strip */}
      <div className="rounded-2xl border border-slate-100 bg-white/85 backdrop-blur-sm p-4 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 font-poppins">
        <span className="inline-flex w-9 h-9 rounded-xl bg-amber-50 text-amber-600 items-center justify-center">
          <Calendar className="w-4 h-4" strokeWidth={1.85} />
        </span>
        <div className="text-[10px] uppercase tracking-[0.12em] text-slate-400 font-semibold mt-3">Best time</div>
        <div className="text-base font-bold text-slate-900 leading-tight mt-0.5 line-clamp-1">
          {bestTime || 'Year-round'}
        </div>
        {/* 12-month strip — amber bars mark months from bestTime */}
        <div className="flex items-end gap-[3px] mt-2 h-3">
          {MONTHS.map((_, i) => (
            <span
              key={i}
              className={`flex-1 rounded-sm transition-all ${
                monthsActive.has(i) ? 'h-3 bg-amber-400' : 'h-1.5 bg-slate-100 self-end'
              }`}
              title={['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i]}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default PlaceQuickInsights;
