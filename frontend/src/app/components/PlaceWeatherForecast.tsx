import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  Sun, Cloud, CloudSun, CloudDrizzle, CloudRain, CloudSnow,
  CloudLightning, CloudFog, Wind, CalendarRange,
} from 'lucide-react';

// Free, no-key Open-Meteo endpoints:
//   • /v1/forecast?daily=weathercode,temperature_2m_max,…  → next-3-day strip
//   • /air-quality?current=european_aqi,pm2_5             → AQI chip
// Both are CORS-friendly and don't require a token.

interface DayCell { date: string; code: number; high: number; low: number }
interface AirQuality { aqi: number; pm25: number }

// WMO weather code → readable label + lucide icon.
function wmo(code: number): { label: string; Icon: typeof Sun } {
  if (code === 0) return { label: 'Clear', Icon: Sun };
  if (code <= 2) return { label: 'Partly cloudy', Icon: CloudSun };
  if (code === 3) return { label: 'Overcast', Icon: Cloud };
  if (code === 45 || code === 48) return { label: 'Fog', Icon: CloudFog };
  if (code >= 51 && code <= 57) return { label: 'Drizzle', Icon: CloudDrizzle };
  if (code >= 61 && code <= 67) return { label: 'Rain', Icon: CloudRain };
  if (code >= 71 && code <= 77) return { label: 'Snow', Icon: CloudSnow };
  if (code >= 80 && code <= 82) return { label: 'Showers', Icon: CloudRain };
  if (code >= 85 && code <= 86) return { label: 'Snow showers', Icon: CloudSnow };
  if (code >= 95) return { label: 'Thunderstorm', Icon: CloudLightning };
  return { label: 'Mixed', Icon: Cloud };
}

// European AQI bands (0-100+ scale, internationally consistent).
function aqiBand(aqi: number) {
  if (aqi <= 20) return { label: 'Good', tone: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' };
  if (aqi <= 40) return { label: 'Fair', tone: 'bg-lime-50 text-lime-700 border-lime-200', dot: 'bg-lime-500' };
  if (aqi <= 60) return { label: 'Moderate', tone: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' };
  if (aqi <= 80) return { label: 'Poor', tone: 'bg-orange-50 text-orange-700 border-orange-200', dot: 'bg-orange-500' };
  if (aqi <= 100) return { label: 'Very poor', tone: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500' };
  return { label: 'Extreme', tone: 'bg-purple-50 text-purple-700 border-purple-200', dot: 'bg-purple-500' };
}

const fmtDay = (iso: string, idx: number) => {
  if (idx === 0) return 'Today';
  if (idx === 1) return 'Tomorrow';
  return new Date(iso).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
};

export function PlaceWeatherForecast({ lat, lng, placeName }: { lat: number; lng: number; placeName: string }) {
  const [days, setDays] = useState<DayCell[] | null>(null);
  const [air, setAir] = useState<AirQuality | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let alive = true;
    setDays(null);
    setAir(null);
    setLoaded(false);

    const forecast = fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=3`,
    )
      .then((r) => (r.ok ? r.json() : null))
      .then((d: any) => {
        const t = d?.daily?.time, c = d?.daily?.weathercode, hi = d?.daily?.temperature_2m_max, lo = d?.daily?.temperature_2m_min;
        if (!Array.isArray(t)) return null;
        return t.slice(0, 3).map((date: string, i: number) => ({
          date, code: c?.[i] ?? 3, high: Math.round(hi?.[i] ?? 0), low: Math.round(lo?.[i] ?? 0),
        })) as DayCell[];
      })
      .catch(() => null);

    const aq = fetch(
      `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lng}&current=european_aqi,pm2_5`,
    )
      .then((r) => (r.ok ? r.json() : null))
      .then((d: any) => {
        const a = d?.current?.european_aqi, p = d?.current?.pm2_5;
        return typeof a === 'number' ? { aqi: Math.round(a), pm25: Math.round((p ?? 0) * 10) / 10 } : null;
      })
      .catch(() => null);

    Promise.all([forecast, aq]).then(([f, a]) => {
      if (!alive) return;
      if (f) setDays(f);
      if (a) setAir(a);
      setLoaded(true);
    });

    return () => { alive = false; };
  }, [lat, lng]);

  if (loaded && !days && !air) return null;

  return (
    <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-7">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-100 to-purple-100 flex items-center justify-center">
            <CalendarRange className="w-4 h-4 text-sky-700" strokeWidth={2} />
          </span>
          <div>
            <h2 className="font-poppins text-lg sm:text-xl font-bold text-slate-900 leading-tight">Next 3 days · Air quality</h2>
            <p className="font-poppins text-xs text-gray-500">Live from Open-Meteo for {placeName}</p>
          </div>
        </div>
        {air && (() => {
          const band = aqiBand(air.aqi);
          return (
            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${band.tone} font-poppins text-xs font-semibold`}>
              <span className={`w-2 h-2 rounded-full ${band.dot} animate-pulse`} />
              AQI {air.aqi} · {band.label}
              {air.pm25 ? <span className="text-[10px] font-normal opacity-80 ml-1">· PM2.5 {air.pm25}</span> : null}
            </span>
          );
        })()}
      </div>

      {!loaded ? (
        <div className="grid grid-cols-3 gap-3 animate-pulse">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100" />
          ))}
        </div>
      ) : days ? (
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {days.map((d, i) => {
            const w = wmo(d.code);
            const Icon = w.Icon;
            return (
              <motion.div
                key={d.date}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.35, ease: 'easeOut' }}
                className="rounded-2xl border border-gray-100 bg-gradient-to-br from-sky-50/60 to-white p-4 hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div className="font-poppins text-[10px] uppercase tracking-[0.08em] text-gray-400 font-semibold">{fmtDay(d.date, i)}</div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center text-sky-600">
                    <Icon className="w-4 h-4" strokeWidth={1.85} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-poppins text-base sm:text-lg font-bold text-slate-900 leading-tight">{d.high}° <span className="text-gray-400 font-medium text-sm">/ {d.low}°</span></div>
                    <div className="font-poppins text-[11px] text-gray-500 truncate">{w.label}</div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-6 text-gray-400 font-poppins text-sm flex items-center justify-center gap-2">
          <Wind className="w-4 h-4" /> Forecast unavailable right now.
        </div>
      )}
    </section>
  );
}

export default PlaceWeatherForecast;
