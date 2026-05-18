import { TrendingUp, Camera, Utensils, Car, Mountain, Star, ArrowRight } from 'lucide-react';
import { memo, useState } from 'react';
import { SmartSearchBar } from './SmartSearchBar';

// ─── Trending chip ─────────────────────────────────────────────────────────────
const TrendingChip = memo(({ icon, label, href }: { icon: React.ReactNode; label: string; href: string }) => (
  <a href={href}
    className="group flex items-center gap-2 px-4 py-2
               bg-white/10 hover:bg-white/20
               border border-white/20 hover:border-white/40
               rounded-full backdrop-blur-sm
               transition-all duration-200">
    {icon}
    <span className="font-poppins text-sm font-medium text-white/90 group-hover:text-white">
      {label}
    </span>
    <ArrowRight className="w-3 h-3 text-white/40 group-hover:text-white/70 group-hover:translate-x-0.5 transition-all" />
  </a>
));
TrendingChip.displayName = 'TrendingChip';

// ─── Hero ─────────────────────────────────────────────────────────────────────
export function Hero() {
  const [tab, setTab] = useState<'destinations' | 'festivals' | 'food'>('destinations');

  const tabHints: Record<typeof tab, string> = {
    destinations: 'Darjeeling, Sundarbans, Bishnupur...',
    festivals:    'Durga Puja, Poush Mela, Gangasagar...',
    food:         'Macher Jhol, Mishti Doi, Roshogolla...',
  };

  return (
    <section className="relative min-h-[92vh] sm:min-h-[88vh] flex flex-col overflow-hidden">

      {/* Background layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-950 via-purple-900 to-indigo-900" />
      <div className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1742325646212-f917ba1feeaa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080')` }} />
      {/* Subtle grain overlay */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'1\'/%3E%3C/svg%3E")' }} />
      {/* Bottom fade to white */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-white via-white/20 to-transparent" />

      {/* Content */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-5 sm:px-8 pt-28 pb-20">

        {/* Eyebrow label */}
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-8 h-px bg-white/40" />
          <span className="font-poppins text-xs font-medium text-white/60 uppercase tracking-[0.2em]">
            West Bengal, India
          </span>
          <div className="w-8 h-px bg-white/40" />
        </div>

        {/* HERO HEADLINE
            Spec:
              - font-medium (500) — editorial, not heavy
              - text-5xl / text-6xl on desktop
              - leading-[1.1] — tight but connected, not disconnected
              - font-poppins
        */}
        <h1 className="font-poppins font-medium text-white text-center
                       text-5xl sm:text-6xl lg:text-[64px]
                       leading-[1.1] sm:leading-[1.1]
                       max-w-3xl mb-5">
          Discover the Heart<br />
          <span className="relative inline-block">
            of{' '}
            <span className="relative">
              West Bengal
              {/* Elegant underline accent */}
              <span className="absolute -bottom-1 left-0 right-0 h-[3px] rounded-full
                               bg-gradient-to-r from-amber-400 to-orange-400 opacity-80" />
            </span>
          </span>
        </h1>

        {/* Subheading */}
        <p className="font-poppins text-base sm:text-lg font-normal text-white/60
                      max-w-lg text-center leading-relaxed mb-10">
          232+ destinations, 100 festivals, authentic Bengali food and curated journeys —
          all in one place, always free.
        </p>

        {/* Search tabs + bar */}
        <div className="w-full max-w-xl mb-8">
          {/* Tabs */}
          <div className="flex justify-center mb-3.5">
            <div className="flex bg-white/10 backdrop-blur-sm border border-white/15 rounded-full p-1 gap-1">
              {(['destinations', 'festivals', 'food'] as const).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`font-poppins text-xs sm:text-sm font-medium capitalize px-4 py-1.5 rounded-full transition-all duration-200
                    ${tab === t
                      ? 'bg-white text-purple-700 shadow-sm'
                      : 'text-white/60 hover:text-white hover:bg-white/10'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          {/* Search bar */}
          <SmartSearchBar
            key={tab}
            size="lg"
            showButton={true}
            placeholder={`Search ${tabHints[tab]}`}
          />
        </div>

        {/* Trending chips */}
        <div className="flex flex-wrap gap-2 justify-center max-w-2xl mb-12">
          <span className="font-poppins text-xs font-medium text-white/40 uppercase tracking-widest self-center mr-1">
            Trending
          </span>
          <TrendingChip icon={<Mountain className="w-3.5 h-3.5 text-amber-300/80" />}  label="Darjeeling"        href="#/explore/darjeeling" />
          <TrendingChip icon={<TrendingUp className="w-3.5 h-3.5 text-amber-300/80" />} label="Sundarbans"       href="#/explore/sundarbans-national-park" />
          <TrendingChip icon={<Camera className="w-3.5 h-3.5 text-amber-300/80" />}     label="Victoria Memorial" href="#/explore/victoria-memorial-kolkata" />
          <TrendingChip icon={<Utensils className="w-3.5 h-3.5 text-amber-300/80" />}   label="Bengali Food"     href="#/food" />
          <TrendingChip icon={<Star className="w-3.5 h-3.5 text-amber-300/80" />}       label="Durga Puja"       href="#/festivals" />
          <TrendingChip icon={<Car className="w-3.5 h-3.5 text-amber-300/80" />}        label="Plan My Trip"     href="#/planner" />
        </div>
      </div>
    </section>
  );
}
