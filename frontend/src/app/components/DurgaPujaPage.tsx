import { lazy, Suspense, useMemo, useState } from 'react';
import { MapPin, Navigation, Sparkles, Clock, Route, Calendar } from 'lucide-react';
import { PUJA_PANDALS, PANDAL_AREAS, PANDAL_TRAILS, type PandalArea } from '../data/pujaPandals';

const PandalMap = lazy(() => import('./PandalMap'));

const AREA_DOT: Record<PandalArea, string> = {
  'North Kolkata': 'bg-purple-600',
  'Central Kolkata': 'bg-pink-600',
  'South Kolkata': 'bg-orange-600',
  'Salt Lake & North Fringe': 'bg-cyan-600',
  'Behala & South-West': 'bg-green-600',
};

const mapsHref = (name: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + ', Kolkata')}`;

export function DurgaPujaPage() {
  const [area, setArea] = useState<'All' | PandalArea>('All');
  const list = useMemo(
    () => (area === 'All' ? PUJA_PANDALS : PUJA_PANDALS.filter((p) => p.area === area)),
    [area],
  );

  return (
    <div className="min-h-screen bg-white font-poppins">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-purple-700 via-purple-600 to-orange-500 text-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-14 sm:py-20">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white/15 backdrop-blur-sm border border-white/25 rounded-full px-3 py-1 mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Kolkata · September–October
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight">Durga Puja Pandal Hopping</h1>
          <p className="text-white/90 text-base sm:text-lg mt-3 max-w-2xl leading-relaxed">
            Kolkata’s Durga Puja is a UNESCO Intangible Cultural Heritage — the city becomes one giant open-air
            art gallery. Here’s a map of the most iconic pandals, grouped into walkable trails.
          </p>
          <div className="flex flex-wrap gap-4 mt-6 text-sm">
            <span className="inline-flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {PUJA_PANDALS.length} landmark pandals</span>
            <span className="inline-flex items-center gap-1.5"><Route className="w-4 h-4" /> {PANDAL_TRAILS.length} curated trails</span>
            <span className="inline-flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Best on Saptami–Navami</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10 space-y-12">
        {/* Map */}
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">Pandal map</h2>
          <p className="text-sm text-slate-500 mb-5">Pins are coloured by area. Tap a pin for what it’s known for + directions.</p>
          <Suspense fallback={<div className="h-[480px] rounded-3xl bg-slate-100 animate-pulse" />}>
            <PandalMap />
          </Suspense>
          {/* Legend */}
          <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4">
            {PANDAL_AREAS.map((a) => (
              <span key={a} className="inline-flex items-center gap-2 text-xs text-slate-600">
                <span className={`w-3 h-3 rounded-full ${AREA_DOT[a]}`} /> {a}
              </span>
            ))}
          </div>
        </section>

        {/* Curated trails */}
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-5">Curated pandal trails</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {PANDAL_TRAILS.map((t) => (
              <div key={t.name} className="rounded-3xl border border-slate-100 bg-white shadow-sm p-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center">
                    <Route className="w-4 h-4 text-purple-600" />
                  </span>
                  <h3 className="font-bold text-slate-900 leading-tight">{t.name}</h3>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed mb-3">{t.blurb}</p>
                <ol className="space-y-1.5">
                  {t.stops.map((s, i) => (
                    <li key={s} className="text-sm text-slate-700 flex items-start gap-2">
                      <span className="text-purple-600 font-semibold">{i + 1}.</span>
                      <a href={mapsHref(s)} target="_blank" rel="noopener noreferrer" className="hover:text-purple-600 transition-colors">{s}</a>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </section>

        {/* All pandals, filterable by area */}
        <section>
          <div className="flex items-end justify-between gap-4 flex-wrap mb-5">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">All pandals</h2>
          </div>
          <div className="flex flex-wrap gap-2 mb-6">
            {(['All', ...PANDAL_AREAS] as const).map((a) => (
              <button
                key={a}
                onClick={() => setArea(a)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  area === a ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {a}
              </button>
            ))}
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {list.map((p) => (
              <div key={p.name} className="rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-lg transition-all p-5">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-2.5 h-2.5 rounded-full ${AREA_DOT[p.area]}`} />
                  <span className="text-xs text-slate-500">{p.area} · {p.kind}{p.since ? ` · est. ${p.since}` : ''}</span>
                </div>
                <h3 className="font-semibold text-slate-900 leading-snug">{p.name}</h3>
                <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">{p.knownFor}</p>
                <a href={mapsHref(p.name)} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-purple-600 hover:text-purple-700 mt-3">
                  Directions <Navigation className="w-3 h-3" />
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* Tips */}
        <section className="rounded-3xl bg-slate-50 border border-slate-100 p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-bold text-slate-900">Pandal-hopping tips</h2>
          </div>
          <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-2.5 text-sm text-slate-700 leading-relaxed">
            <li>• Crowds peak on <strong>Saptami to Navami</strong> nights — for calmer viewing, go on <strong>Tritiya–Panchami</strong> or before noon.</li>
            <li>• Use the <strong>Metro</strong> and walk between nearby pandals — roads are largely closed/jammed to cars.</li>
            <li>• North Kolkata is for <strong>tradition &amp; bonedi baris</strong>; South for <strong>award-winning themes</strong>.</li>
            <li>• Carry water, wear comfortable shoes, and keep valuables secure in the crush.</li>
            <li>• Sreebhumi &amp; Deshapriya Park draw enormous crowds — visit very late night or skip on peak days.</li>
            <li>• Respect rituals; ask before photographing inside the sanctum during aarti.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

export default DurgaPujaPage;
