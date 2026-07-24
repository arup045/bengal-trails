import { TrendingUp, Camera, Utensils, Car, Mountain, Star, ArrowRight } from 'lucide-react';
import { memo, useState } from 'react';
import { SmartSearchBar } from './SmartSearchBar';
import { useSiteContent } from '../utils/useSiteContent';
import { useLanguage } from '../contexts/LanguageContext';

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
  const { content } = useSiteContent();
  const { t } = useLanguage();
  const hero = content.hero;

  const tabHints: Record<typeof tab, string> = {
    destinations: 'Darjeeling, Sundarbans, Bishnupur...',
    festivals:    'Durga Puja, Poush Mela, Gangasagar...',
    food:         'Macher Jhol, Mishti Doi, Roshogolla...',
  };

  const [titleLine1, titleLine2] = hero.title.includes('\n')
    ? hero.title.split('\n')
    : [hero.title, ''];

  return (
    <section className="relative min-h-[92vh] sm:min-h-[88vh] flex flex-col overflow-hidden">

      {/* Layer 1 — Hero photo from CMS.
          Rendered as an <img> (not a CSS background) with fetchPriority="high" +
          eager loading so it's the LCP element and paints ASAP. It's also
          preloaded in index.html, so the fetch starts before the JS bundle. */}
      <img
        src={hero.backgroundImage}
        alt="Scenic landscape of West Bengal"
        // Set fetchpriority imperatively — passing it as a JSX prop makes React
        // warn on every render (it isn't in React's attribute whitelist).
        ref={(el) => { if (el) el.setAttribute('fetchpriority', 'high'); }}
        loading="eager"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover object-center"
      />
      {/* Layer 2 — Very subtle dark scrim at top only so nav/text stays readable */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-transparent" />
      {/* Layer 3 — Bottom fade to white so page content blends in */}
      <div className="absolute bottom-0 left-0 right-0 h-52 bg-gradient-to-t from-white via-white/30 to-transparent" />

      {/* Content */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-5 sm:px-8 pt-28 pb-20">

        {/* Eyebrow label */}
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-8 h-px bg-white/40" />
          <span className="font-poppins text-xs font-medium text-white/60 uppercase tracking-[0.2em]">
            {hero.badgeText}
          </span>
          <div className="w-8 h-px bg-white/40" />
        </div>

        <h1 className="font-poppins font-medium text-white text-center
                       text-5xl sm:text-6xl lg:text-[64px]
                       leading-[1.1] sm:leading-[1.1]
                       max-w-3xl mb-5">
          {titleLine1}{titleLine2 && <><br />{titleLine2}</>}
        </h1>

        {/* Subheading */}
        <p className="font-poppins text-base sm:text-lg font-normal text-white/60
                      max-w-lg text-center leading-relaxed mb-10">
          {hero.subtitle}
        </p>

        {/* Search tabs + bar */}
        <div className="w-full max-w-xl mb-8">
          {/* Tabs */}
          <div className="flex justify-center mb-3.5">
            <div className="flex bg-white/10 backdrop-blur-sm border border-white/15 rounded-full p-1 gap-1">
              {(['destinations', 'festivals', 'food'] as const).map(tb => (
                <button key={tb} onClick={() => setTab(tb)}
                  className={`font-poppins text-xs sm:text-sm font-medium capitalize px-4 py-1.5 rounded-full transition-all duration-200
                    ${tab === tb
                      ? 'bg-white text-purple-700 shadow-sm'
                      : 'text-white/60 hover:text-white hover:bg-white/10'}`}>
                  {t(`hero.tab.${tb}`)}
                </button>
              ))}
            </div>
          </div>
          {/* Search bar */}
          {/* No `key={tab}` — switching tabs must NOT remount and wipe what the
              user has already typed; only the placeholder hint changes. */}
          <SmartSearchBar
            size="lg"
            showButton={true}
            placeholder={`Search ${tabHints[tab]}`}
          />
        </div>

        {/* Trending chips */}
        <div className="flex flex-wrap gap-2 justify-center max-w-2xl mb-12">
          <span className="font-poppins text-xs font-medium text-white/40 uppercase tracking-widest self-center mr-1">
            {t('hero.trending')}
          </span>
          <TrendingChip icon={<Mountain className="w-3.5 h-3.5 text-amber-300/80" />}  label="Darjeeling"        href="/explore/darjeeling" />
          <TrendingChip icon={<TrendingUp className="w-3.5 h-3.5 text-amber-300/80" />} label="Sundarbans"       href="/explore/sundarbans-national-park" />
          <TrendingChip icon={<Camera className="w-3.5 h-3.5 text-amber-300/80" />}     label="Victoria Memorial" href="/explore/victoria-memorial-kolkata" />
          <TrendingChip icon={<Utensils className="w-3.5 h-3.5 text-amber-300/80" />}   label="Bengali Food"     href="/food" />
          <TrendingChip icon={<Star className="w-3.5 h-3.5 text-amber-300/80" />}       label="Durga Puja"       href="/festivals" />
          <TrendingChip icon={<Car className="w-3.5 h-3.5 text-amber-300/80" />}        label="Plan My Trip"     href="/planner" />
        </div>
      </div>
    </section>
  );
}
