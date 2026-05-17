import { TrendingUp, Camera, Utensils, Car, Mountain, Star, Sparkles, ArrowRight } from 'lucide-react';
import { memo, useState } from 'react';
import { SmartSearchBar } from './SmartSearchBar';

const TrendingChip = memo(({ icon, label, href }: { icon: React.ReactNode; label: string; href: string }) => (
  <a
    href={href}
    className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full hover:bg-white/30 transition-all duration-200 group"
  >
    {icon}
    <span className="text-sm font-semibold text-white">{label}</span>
    <ArrowRight className="w-3 h-3 text-white/60 group-hover:translate-x-0.5 transition-transform" />
  </a>
));
TrendingChip.displayName = 'TrendingChip';

const StatBadge = memo(({ value, label }: { value: string; label: string }) => (
  <div className="text-center">
    <div className="text-2xl sm:text-3xl font-black text-white">{value}</div>
    <div className="text-xs text-white/70 font-medium mt-0.5">{label}</div>
  </div>
));
StatBadge.displayName = 'StatBadge';

export function Hero() {
  const [tab, setTab] = useState<'destinations' | 'festivals' | 'food'>('destinations');

  const tabHints: Record<typeof tab, string> = {
    destinations: 'Darjeeling, Sundarbans, Bishnupur…',
    festivals:    'Durga Puja, Poush Mela, Gangasagar…',
    food:         'Macher Jhol, Mishti Doi, Roshogolla…',
  };

  return (
    <section className="relative min-h-[92vh] sm:min-h-[85vh] flex flex-col overflow-hidden">

      {/* ── Multi-layer background ─────────────────────────────────────── */}
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-900 via-purple-800 to-orange-700" />
      {/* Hero photograph */}
      <div
        className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-50"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1742325646212-f917ba1feeaa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080')`
        }}
      />
      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white to-transparent" />

      {/* ── Content ────────────────────────────────────────────────────── */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-4 sm:px-6 pt-24 pb-16">

        {/* Badge */}
        <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/25 rounded-full px-4 py-1.5 mb-7">
          <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
          <span className="text-white/90 text-xs sm:text-sm font-semibold tracking-wide">
            India's Cultural Capital — West Bengal
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-center font-black leading-tight mb-5 text-white"
          style={{ fontFamily: 'Poppins, system-ui, sans-serif', fontSize: 'clamp(2.2rem, 6vw, 4rem)' }}>
          Discover the Heart of<br />
          <span
            className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent"
            style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            West Bengal
          </span>
        </h1>

        <p className="text-white/80 text-sm sm:text-base max-w-xl text-center mb-8 leading-relaxed">
          From Darjeeling's misty peaks to Sundarbans' tiger trails — explore{' '}
          <strong className="text-white">232+ destinations</strong>, 100 festivals, authentic food & curated tours.
        </p>

        {/* ── Search tabs + bar ─────────────────────────────────────────── */}
        <div className="w-full max-w-2xl mb-6">
          {/* Category tabs */}
          <div className="flex bg-white/15 backdrop-blur-sm rounded-full p-1 mb-3 border border-white/25 w-fit mx-auto gap-1">
            {(['destinations', 'festivals', 'food'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold capitalize transition-all duration-200 ${
                  tab === t
                    ? 'bg-white text-purple-700 shadow-sm'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
                style={{ fontFamily: 'Poppins, sans-serif' }}>
                {t}
              </button>
            ))}
          </div>

          {/* Smart search bar */}
          <SmartSearchBar
            key={tab}
            size="lg"
            showButton={true}
            placeholder={`Search ${tabHints[tab]}`}
          />
        </div>

        {/* ── Trending chips ────────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-2 justify-center max-w-3xl mb-10">
          <span className="text-white/60 text-xs self-center font-semibold uppercase tracking-wider mr-1">Trending:</span>
          <TrendingChip icon={<Mountain className="w-3.5 h-3.5 text-yellow-300" />} label="Darjeeling" href="#/explore/darjeeling" />
          <TrendingChip icon={<TrendingUp className="w-3.5 h-3.5 text-yellow-300" />} label="Sundarbans" href="#/explore/sundarbans-national-park" />
          <TrendingChip icon={<Camera className="w-3.5 h-3.5 text-yellow-300" />} label="Victoria Memorial" href="#/explore/victoria-memorial-kolkata" />
          <TrendingChip icon={<Utensils className="w-3.5 h-3.5 text-yellow-300" />} label="Bengali Food" href="#/food" />
          <TrendingChip icon={<Star className="w-3.5 h-3.5 text-yellow-300" />} label="Durga Puja" href="#/festivals" />
          <TrendingChip icon={<Car className="w-3.5 h-3.5 text-yellow-300" />} label="Plan My Trip" href="#/planner" />
        </div>

        {/* ── Stats strip ───────────────────────────────────────────────── */}
        <div className="flex items-center gap-8 sm:gap-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-8 py-4">
          <StatBadge value="232+" label="Destinations" />
          <div className="w-px h-8 bg-white/20" />
          <StatBadge value="100" label="Festivals" />
          <div className="w-px h-8 bg-white/20" />
          <StatBadge value="4.8★" label="Rated" />
          <div className="w-px h-8 bg-white/20 hidden sm:block" />
          <StatBadge value="Free" label="Always" />
        </div>
      </div>
    </section>
  );
}
