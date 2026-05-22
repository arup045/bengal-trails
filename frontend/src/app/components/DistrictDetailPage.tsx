import { useMemo, useState } from 'react';
import { ArrowLeft, MapPin, Navigation, Compass, Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { getDistrict, placesForDistrict } from '../data/districts';
import { getDistrictContent } from '../data/districtContent';
import type { Place } from '../data/places-full';
import { PlaceCard } from './explore/PlaceCard';
import { ContentCard, SECTION_META, type SectionKey } from './explore/ContentCard';
import { useWishlistSync } from '../utils/useWishlistSync';

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const SECTION_ORDER: SectionKey[] = ['landmarks', 'parks', 'activities', 'foods', 'foodZones', 'stays'];

export function DistrictDetailPage({ slug }: { slug: string }) {
  const district = useMemo(() => getDistrict(slug), [slug]);
  const places = useMemo(() => placesForDistrict(slug), [slug]);
  const content = useMemo(() => getDistrictContent(slug), [slug]);
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistSync();
  const [aiQuery, setAiQuery] = useState('');

  const onTogglePlace = (p: Place) => {
    if (isInWishlist(p.slug)) removeFromWishlist(p.slug);
    else addToWishlist({ slug: p.slug, title: p.title, category: (p as any).category || '', region: p.region, image: p.heroImage?.url || '', description: p.excerpt || '' });
  };

  const contentSlug = (name: string) => `${slug}-${slugify(name)}`;
  const onToggleContent = (name: string, section: SectionKey) => {
    const s = contentSlug(name);
    if (isInWishlist(s)) removeFromWishlist(s);
    else addToWishlist({ slug: s, title: name, category: SECTION_META[section].label, region: district?.region || '', image: '', description: '' });
  };

  const askAI = (q?: string) => {
    const message = (q ?? aiQuery).trim();
    if (!message) return;
    // The floating AI assistant listens for this event (opens + sends).
    window.dispatchEvent(new CustomEvent('bt:ask-ai', { detail: { message } }));
    setAiQuery('');
  };

  if (!district) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Compass className="w-14 h-14 text-purple-300 mx-auto mb-4" />
          <h1 className="font-poppins text-2xl font-semibold text-slate-900 mb-2">District not found</h1>
          <a href="#/explore" className="inline-flex items-center gap-2 mt-2 text-purple-600 font-poppins font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to all districts
          </a>
        </div>
      </div>
    );
  }

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Build the nav + sections list (only those with content).
  const navItems: Array<{ id: string; label: string }> = [];
  if (places.length) navItems.push({ id: 'sec-places', label: 'Top Places' });
  SECTION_ORDER.forEach((k) => { if (content?.[k]?.length) navItems.push({ id: `sec-${k}`, label: SECTION_META[k].label.split(' ')[0] === 'Things' ? 'Landmarks' : SECTION_META[k].label.split(' &')[0] }); });

  const aiChips = [
    `Best 2-day plan for ${district.name}`,
    `Where to eat in ${district.name}`,
    `Top things to do in ${district.name}`,
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Banner ─────────────────────────────────────────────────────────── */}
      <div className="relative h-[46vh] min-h-[340px] overflow-hidden">
        <ImageWithFallback src={district.image} alt={district.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />
        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="max-w-7xl mx-auto w-full px-5 sm:px-8 pb-8">
            <a href="#/explore" className="inline-flex items-center gap-2 text-white/85 hover:text-white font-poppins text-sm mb-4">
              <ArrowLeft className="w-4 h-4" /> All districts
            </a>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <span className="inline-block bg-white/15 backdrop-blur-sm text-white text-xs font-poppins font-medium px-3 py-1 rounded-full mb-3">{district.region}</span>
              <h1 className="font-poppins text-4xl sm:text-6xl font-bold text-white mb-2">{district.name}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <span className="inline-flex items-center gap-1.5 text-white/90 font-poppins text-sm"><MapPin className="w-4 h-4" /> {district.placeCount} featured place{district.placeCount !== 1 ? 's' : ''}</span>
                <button onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${district.lat},${district.lng}`, '_blank', 'noopener,noreferrer')}
                  className="inline-flex items-center gap-2 bg-white/90 hover:bg-white text-purple-700 font-poppins text-sm font-medium px-4 py-2 rounded-full transition-colors">
                  <Navigation className="w-4 h-4" /> Directions
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        {/* ── About ────────────────────────────────────────────────────────── */}
        {content?.about && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8 -mt-10 relative z-10">
            <h2 className="font-poppins text-xl font-bold text-slate-900 mb-2">About {district.name}</h2>
            <p className="font-poppins text-gray-600 leading-relaxed">{content.about}</p>
          </div>
        )}

        {/* ── Ask AI ───────────────────────────────────────────────────────── */}
        <div className="bg-gradient-to-br from-purple-50 to-orange-50 border border-purple-100 rounded-3xl p-6 mt-6">
          <p className="font-poppins font-semibold text-slate-900 flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-purple-600" /> Plan {district.name} with AI
          </p>
          <p className="font-poppins text-sm text-gray-500 mb-4">Ask anything — itineraries, food, stays, how to get around.</p>
          <div className="flex gap-2 mb-3">
            <input
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') askAI(); }}
              placeholder={`e.g. Best 2-day itinerary for ${district.name}`}
              className="flex-1 px-4 py-3 rounded-full border border-gray-200 bg-white font-poppins text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
            <button onClick={() => askAI()} className="shrink-0 inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-poppins text-sm font-medium px-5 py-3 rounded-full transition-colors">
              Ask <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {aiChips.map((c) => (
              <button key={c} onClick={() => askAI(c)} className="px-3 py-1.5 rounded-full bg-white border border-purple-200 text-purple-700 font-poppins text-xs hover:bg-purple-50 transition-colors">{c}</button>
            ))}
          </div>
        </div>

        {/* ── Sticky category nav ──────────────────────────────────────────── */}
        {navItems.length > 0 && (
          <div className="sticky top-16 z-20 -mx-5 sm:mx-0 mt-6 bg-gray-50/95 backdrop-blur py-3">
            <div className="flex gap-2 overflow-x-auto px-5 sm:px-0 no-scrollbar">
              {navItems.map((n) => (
                <button key={n.id} onClick={() => scrollTo(n.id)}
                  className="shrink-0 px-4 py-2 rounded-full bg-white border border-gray-200 text-gray-700 font-poppins text-sm font-medium hover:border-purple-300 hover:text-purple-600 transition-colors">
                  {n.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Sections ───────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8 space-y-12">
        {/* Top Places (photo cards with detail links) */}
        {places.length > 0 && (
          <section id="sec-places">
            <div className="flex items-end justify-between mb-5">
              <div>
                <h2 className="font-poppins text-2xl font-bold text-slate-900">Top places to visit</h2>
                <p className="font-poppins text-gray-500 text-sm">{places.length} handpicked destination{places.length > 1 ? 's' : ''} with full guides</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {places.map((p) => (
                <PlaceCard key={p.slug} place={p} saved={isInWishlist(p.slug)} onToggleSave={() => onTogglePlace(p)} />
              ))}
            </div>
          </section>
        )}

        {/* Content sections */}
        {content && SECTION_ORDER.map((key) => {
          const items = content[key];
          if (!items || items.length === 0) return null;
          const meta = SECTION_META[key];
          return (
            <section key={key} id={`sec-${key}`}>
              <div className="flex items-center gap-2 mb-5">
                <span className="text-2xl">{meta.emoji}</span>
                <h2 className="font-poppins text-2xl font-bold text-slate-900">{meta.label}</h2>
                <span className="font-poppins text-sm text-gray-400">({items.length})</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {items.map((name) => (
                  <ContentCard
                    key={name}
                    name={name}
                    section={key}
                    districtName={district.name}
                    saved={isInWishlist(contentSlug(name))}
                    onToggleSave={() => onToggleContent(name, key)}
                  />
                ))}
              </div>
            </section>
          );
        })}

        {!content && places.length === 0 && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 text-center">
            <Compass className="w-14 h-14 text-purple-200 mx-auto mb-4" />
            <h3 className="font-poppins text-lg font-semibold text-slate-900 mb-1">Content coming soon</h3>
            <p className="font-poppins text-gray-500 text-sm">We're curating the best of {district.name}. Check back shortly.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default DistrictDetailPage;
