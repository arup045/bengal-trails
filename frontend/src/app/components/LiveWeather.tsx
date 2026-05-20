/**
 * LiveWeather.tsx — Real-time weather widget for Bengal Trails
 *
 * Fetches live weather from the free Open-Meteo API (no API key required) and
 * renders it in the site's boutique-luxe glass card style. Designed to be drop-in
 * reusable across destination pages.
 *
 * Props:
 *   lat       — destination latitude  (e.g. 27.036  for Darjeeling)
 *   lon       — destination longitude (e.g. 88.2627 for Darjeeling)
 *   cityName  — display name shown in the header
 *   bestTime  — optional best-time-to-visit string from the place data
 *
 * Behaviour:
 *   • Skeleton shimmer on initial load.
 *   • Quietly degrades to a friendly fallback card if the API is unreachable.
 *   • Re-fetches whenever lat/lon change (so navigating between places updates it).
 *   • Caches each lat,lon result in sessionStorage for 10 min so paging through
 *     destinations doesn't hammer the API.
 */

import { useEffect, useState } from 'react';
import {
  Sun, Cloud, CloudSun, CloudDrizzle, CloudRain, CloudSnow, CloudFog,
  CloudLightning, Wind, Droplets, Calendar, Loader2, AlertCircle,
} from 'lucide-react';

interface LiveWeatherProps {
  lat:       number;
  lon:       number;
  cityName:  string;
  bestTime?: string;
}

interface CurrentWeather {
  temperature: number;     // °C
  windspeed:   number;     // km/h
  weathercode: number;     // WMO code
  is_day:      0 | 1;
  time:        string;     // ISO
}

interface OpenMeteoResponse {
  current_weather?: CurrentWeather;
  hourly?: {
    time:                string[];
    relativehumidity_2m: number[];
  };
}

// ── WMO weather code → display data ─────────────────────────────────────────────
// Reference: https://open-meteo.com/en/docs#weathervariables
function getWeatherMeta(code: number, isDay: 0 | 1) {
  // Clear
  if (code === 0)              return { Icon: isDay ? Sun : Cloud, label: isDay ? 'Clear Sky' : 'Clear Night', gradient: 'from-amber-400 via-orange-400 to-rose-400' };
  // Mainly clear, partly cloudy, overcast
  if (code === 1)              return { Icon: CloudSun, label: 'Mostly Clear',      gradient: 'from-sky-400 via-blue-400 to-indigo-400' };
  if (code === 2)              return { Icon: CloudSun, label: 'Partly Cloudy',     gradient: 'from-slate-400 via-sky-400 to-blue-500' };
  if (code === 3)              return { Icon: Cloud,    label: 'Overcast',          gradient: 'from-slate-400 via-slate-500 to-gray-600' };
  // Fog
  if (code === 45 || code === 48) return { Icon: CloudFog, label: 'Foggy',          gradient: 'from-gray-400 via-slate-400 to-gray-500' };
  // Drizzle (51-57)
  if (code >= 51 && code <= 57)   return { Icon: CloudDrizzle, label: 'Light Drizzle', gradient: 'from-cyan-500 via-sky-500 to-blue-600' };
  // Rain (61-67)
  if (code >= 61 && code <= 67)   return { Icon: CloudRain,    label: 'Rainy',         gradient: 'from-blue-500 via-indigo-500 to-slate-600' };
  // Snow (71-77)
  if (code >= 71 && code <= 77)   return { Icon: CloudSnow,    label: 'Snowing',       gradient: 'from-sky-200 via-blue-300 to-indigo-400' };
  // Rain showers (80-82)
  if (code >= 80 && code <= 82)   return { Icon: CloudRain,    label: 'Rain Showers',  gradient: 'from-blue-500 via-indigo-500 to-purple-600' };
  // Snow showers (85-86)
  if (code === 85 || code === 86) return { Icon: CloudSnow,    label: 'Snow Showers',  gradient: 'from-sky-300 via-blue-300 to-slate-400' };
  // Thunderstorm (95, 96, 99)
  if (code >= 95)                 return { Icon: CloudLightning, label: 'Thunderstorm', gradient: 'from-purple-600 via-indigo-700 to-slate-800' };
  // Fallback
  return { Icon: Cloud, label: 'Unknown', gradient: 'from-slate-400 to-slate-600' };
}

// ── Lightweight sessionStorage cache (10 min TTL) ───────────────────────────────
const CACHE_TTL_MS = 10 * 60 * 1000;
function cacheKey(lat: number, lon: number) {
  return `bt_weather_${lat.toFixed(2)}_${lon.toFixed(2)}`;
}
function readCache(lat: number, lon: number): OpenMeteoResponse | null {
  try {
    const raw = sessionStorage.getItem(cacheKey(lat, lon));
    if (!raw) return null;
    const { ts, data } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL_MS) return null;
    return data;
  } catch { return null; }
}
function writeCache(lat: number, lon: number, data: OpenMeteoResponse) {
  try {
    sessionStorage.setItem(cacheKey(lat, lon), JSON.stringify({ ts: Date.now(), data }));
  } catch { /* sessionStorage full or unavailable — non-fatal */ }
}

// ── Component ──────────────────────────────────────────────────────────────────
export function LiveWeather({ lat, lon, cityName, bestTime }: LiveWeatherProps) {
  const [data,    setData]    = useState<OpenMeteoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setError(null);

    // Try cache first for instant render
    const cached = readCache(lat, lon);
    if (cached) {
      setData(cached);
      setLoading(false);
      return;
    }

    setLoading(true);
    const ctrl = new AbortController();

    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&current_weather=true&hourly=relativehumidity_2m&timezone=auto`,
      { signal: ctrl.signal },
    )
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((json: OpenMeteoResponse) => {
        if (cancelled) return;
        setData(json);
        writeCache(lat, lon, json);
      })
      .catch((e) => {
        if (cancelled || e.name === 'AbortError') return;
        setError('Live weather is temporarily unavailable.');
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; ctrl.abort(); };
  }, [lat, lon]);

  // ── Loading skeleton ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="bg-gradient-to-br from-slate-400 via-slate-500 to-slate-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="h-3 w-16 bg-white/20 rounded animate-pulse mb-2" />
            <div className="h-5 w-28 bg-white/30 rounded animate-pulse" />
          </div>
          <Loader2 className="w-8 h-8 animate-spin text-white/70" />
        </div>
        <div className="h-12 w-24 bg-white/20 rounded animate-pulse mb-2" />
        <div className="h-3 w-32 bg-white/20 rounded animate-pulse" />
        <div className="mt-4 pt-4 border-t border-white/20 grid grid-cols-2 gap-3">
          <div className="h-3 bg-white/20 rounded animate-pulse" />
          <div className="h-3 bg-white/20 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  // ── Error / fallback ─────────────────────────────────────────────────────────
  if (error || !data?.current_weather) {
    return (
      <div className="bg-gradient-to-br from-slate-500 to-slate-700 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <AlertCircle className="w-5 h-5 text-amber-200" />
          </div>
          <div>
            <p className="font-poppins text-xs text-white/70 uppercase tracking-wider">Weather</p>
            <p className="font-poppins text-base font-semibold">{cityName}</p>
          </div>
        </div>
        <p className="font-poppins text-sm text-white/80 leading-relaxed">
          {error || 'Live weather unavailable right now.'}
        </p>
        {bestTime && (
          <div className="mt-4 pt-4 border-t border-white/20">
            <div className="flex items-center gap-2 text-white/80">
              <Calendar className="w-3.5 h-3.5" />
              <span className="font-poppins text-xs">Best time: {bestTime}</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Success ──────────────────────────────────────────────────────────────────
  const cw            = data.current_weather!;
  const tempRounded   = Math.round(cw.temperature);
  const windRounded   = Math.round(cw.windspeed);
  const { Icon, label, gradient } = getWeatherMeta(cw.weathercode, cw.is_day);

  // Pull the humidity reading for the hour closest to "now"
  let humidity: number | null = null;
  if (data.hourly?.time && data.hourly.relativehumidity_2m) {
    const nowHour = cw.time.slice(0, 13); // "YYYY-MM-DDTHH"
    const idx = data.hourly.time.findIndex(t => t.startsWith(nowHour));
    if (idx >= 0) humidity = Math.round(data.hourly.relativehumidity_2m[idx]);
  }

  return (
    <div className={`relative bg-gradient-to-br ${gradient} rounded-2xl p-6 text-white shadow-lg overflow-hidden`}>
      {/* Glass overlay for that boutique-luxe shimmer */}
      <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px] pointer-events-none" />
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="font-poppins text-xs text-white/75 uppercase tracking-wider mb-0.5">Current Weather</p>
            <p className="font-poppins text-base font-semibold leading-tight">{cityName}</p>
          </div>
          <div className="w-12 h-12 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center shrink-0">
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Temperature */}
        <div className="flex items-baseline gap-1 mb-1">
          <span className="font-poppins text-5xl font-bold leading-none">{tempRounded}</span>
          <span className="font-poppins text-xl font-medium text-white/80">°C</span>
        </div>
        <p className="font-poppins text-sm text-white/90">{label}</p>

        {/* Details */}
        <div className="mt-5 pt-5 border-t border-white/20 grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <Wind className="w-3.5 h-3.5 text-white/70 shrink-0" />
            <div>
              <p className="font-poppins text-xs text-white/60">Wind</p>
              <p className="font-poppins text-sm font-medium">{windRounded} km/h</p>
            </div>
          </div>
          {humidity !== null && (
            <div className="flex items-center gap-2">
              <Droplets className="w-3.5 h-3.5 text-white/70 shrink-0" />
              <div>
                <p className="font-poppins text-xs text-white/60">Humidity</p>
                <p className="font-poppins text-sm font-medium">{humidity}%</p>
              </div>
            </div>
          )}
        </div>

        {/* Best time to visit */}
        {bestTime && (
          <div className="mt-4 pt-4 border-t border-white/20">
            <div className="flex items-center gap-2 text-white/85">
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <p className="font-poppins text-xs">
                <span className="text-white/65">Best time:</span> <span className="font-medium">{bestTime}</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LiveWeather;
