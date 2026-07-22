import { useEffect, useState } from 'react';
import { useReducedMotion } from 'motion/react';

// Ambient weather layer for the place hero. Reads the CURRENT conditions at the
// place's coordinates (Open-Meteo, same source LiveWeather uses) and paints a
// subtle, on-brand atmosphere over the photo — drifting rain, mist, falling
// snow, or a soft clear-sky glow. Purely decorative (pointer-events-none,
// aria-hidden) and fully disabled under prefers-reduced-motion.

type Cat = 'clear' | 'cloudy' | 'mist' | 'rain' | 'snow';

function mapCode(code: number | undefined): Cat | null {
  if (code == null) return null;
  if (code <= 1) return 'clear';
  if (code <= 3) return 'cloudy';
  if (code === 45 || code === 48) return 'mist';
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 99)) return 'rain';
  if (code >= 71 && code <= 77) return 'snow';
  return 'cloudy';
}

export function HeroAtmosphere({ lat, lng }: { lat?: number; lng?: number }) {
  const [cat, setCat] = useState<Cat | null>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (lat == null || lng == null) return;
    let alive = true;
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (alive) setCat(mapCode(d?.current_weather?.weathercode)); })
      .catch(() => {});
    return () => { alive = false; };
  }, [lat, lng]);

  // No decoration when motion is reduced or conditions are unknown/plain-cloudy.
  if (reduce || !cat || cat === 'cloudy') return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-[1]" aria-hidden="true">
      {cat === 'rain' && (
        <>
          <div className="bt-atmo-rain" />
          <div className="bt-atmo-rain bt-atmo-rain--2" />
        </>
      )}
      {cat === 'mist' && (
        <>
          <div className="bt-atmo-mist" />
          <div className="bt-atmo-mist bt-atmo-mist--2" />
        </>
      )}
      {cat === 'snow' && <div className="bt-atmo-snow" />}
      {cat === 'clear' && <div className="bt-atmo-glow" />}

      <style>{`
        @keyframes bt-rain-fall { from { background-position: 0 0; } to { background-position: 120px 640px; } }
        @keyframes bt-mist-drift { from { transform: translate3d(-8%,0,0); } to { transform: translate3d(8%,0,0); } }
        @keyframes bt-snow-fall { from { background-position: 0 0, 0 0; } to { background-position: 60px 620px, -40px 500px; } }
        @keyframes bt-glow-breathe { 0%,100% { opacity:.35; } 50% { opacity:.6; } }

        .bt-atmo-rain {
          position:absolute; inset:-20% -10% -10% -10%; opacity:.16;
          background-image:repeating-linear-gradient(74deg, rgba(255,255,255,.55) 0 1px, transparent 1px 9px);
          animation:bt-rain-fall 0.6s linear infinite;
        }
        .bt-atmo-rain--2 { opacity:.1; animation-duration:.9s; background-size:auto; transform:translateX(20px); }

        .bt-atmo-mist {
          position:absolute; inset:-10%; opacity:.18; filter:blur(24px);
          background:radial-gradient(60% 50% at 30% 60%, rgba(255,255,255,.7), transparent 70%);
          animation:bt-mist-drift 16s ease-in-out infinite alternate;
        }
        .bt-atmo-mist--2 { opacity:.12; animation-duration:26s; animation-direction:alternate-reverse; }

        .bt-atmo-snow {
          position:absolute; inset:-20% 0 0 0; opacity:.5;
          background-image:radial-gradient(2px 2px at 20px 30px, #fff, transparent), radial-gradient(1.5px 1.5px at 80px 120px, rgba(255,255,255,.85), transparent);
          background-size:120px 160px, 90px 130px;
          animation:bt-snow-fall 8s linear infinite;
        }
        .bt-atmo-glow {
          position:absolute; inset:0;
          background:radial-gradient(40% 40% at 82% 12%, rgba(255,244,214,.55), transparent 70%);
          animation:bt-glow-breathe 7s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .bt-atmo-rain, .bt-atmo-mist, .bt-atmo-snow, .bt-atmo-glow { animation:none !important; }
        }
      `}</style>
    </div>
  );
}

export default HeroAtmosphere;
