import { useEffect } from 'react';
import { ChevronRight, Compass, ArrowLeft } from 'lucide-react';
import { experiences, getExperience, placesForExperience, experienceCover } from '../data/experiences';
import { ExperienceCard } from './ExperienceCard';
import { PremiumPlaceCard } from './PremiumPlaceCard';
import { ImageWithFallback } from './figma/ImageWithFallback';

// /experiences        → the 8 "ways to explore Bengal" themes
// /experiences/:theme → real places that fit that theme (sorted by rating)
export function ExperiencesPage({ theme }: { theme?: string }) {
  const exp = theme ? getExperience(theme) : undefined;

  useEffect(() => { window.scrollTo({ top: 0 }); }, [theme]);

  // ── Theme detail view ─────────────────────────────────────────────────────
  if (theme && exp) {
    const places = placesForExperience(exp.id);
    const cover = experienceCover(exp.id);
    const Icon = exp.icon;
    return (
      <div className="min-h-screen bg-white font-poppins">
        {/* Hero */}
        <div className="relative h-[44vh] min-h-[320px] w-full overflow-hidden">
          {cover && (
            <ImageWithFallback src={cover} alt={exp.title} optimizeWidth={1600}
              className="absolute inset-0 w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/30" />
          <div className="absolute inset-0 flex items-end">
            <div className="max-w-7xl mx-auto w-full px-4 sm:px-8 pb-10">
              <nav className="flex items-center gap-1.5 text-sm text-white/80 mb-4">
                <a href="/experiences" className="hover:text-white">Experiences</a>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-white">{exp.title}</span>
              </nav>
              <span className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center mb-4">
                <Icon className="w-6 h-6 text-white" strokeWidth={2} />
              </span>
              <h1 className="text-white text-4xl sm:text-5xl font-bold leading-tight">{exp.title}</h1>
              <p className="text-white/90 text-base sm:text-lg mt-3 max-w-2xl leading-relaxed">{exp.description}</p>
              <p className="text-white/80 text-sm mt-3">{places.length} places to explore</p>
            </div>
          </div>
        </div>

        {/* Places grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6 justify-items-center">
            {places.map((p) => (
              <PremiumPlaceCard
                key={p.slug}
                title={p.title}
                image={p.heroImage?.url}
                href={`/explore/${p.slug}`}
                location={`${p.district}${p.region ? ', ' + p.region : ''}`}
                rating={p.rating}
                fallbackKind="place"
              />
            ))}
          </div>

          <div className="mt-12">
            <a href="/experiences" className="inline-flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-700">
              <ArrowLeft className="w-4 h-4" /> All experiences
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ── Hub view ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white font-poppins">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
        <div className="flex items-center gap-2.5 mb-3">
          <span className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
            <Compass className="w-5 h-5 text-purple-600" strokeWidth={2} />
          </span>
          <span className="text-sm font-semibold tracking-wide text-purple-600 uppercase">Ways to explore</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 leading-tight">From mountains to mangroves</h1>
        <p className="text-slate-500 text-base sm:text-lg mt-3 max-w-2xl leading-relaxed">
          West Bengal runs from the Himalayan tea hills to the world’s largest mangrove delta. Pick the kind of
          journey you’re dreaming of — we’ll show you the real places that fit.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 mt-10">
          {experiences.map((e) => (
            <ExperienceCard key={e.id} experience={e} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default ExperiencesPage;
