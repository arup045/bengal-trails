import { useEffect, useMemo, useState, lazy, Suspense } from 'react';
import { ArrowLeft, MapPin, Navigation, Compass, Sparkles, ArrowRight, ChevronDown, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { API_BASE } from '../utils/api';
import { getDistrict, placesForDistrict } from '../data/districts';
import { getDistrictContent } from '../data/districtContent';
import { SECTION_META, type SectionKey } from './explore/ItemCard';
import { useWishlistSync } from '../utils/useWishlistSync';
import { usePlaceImages } from '../lib/queries';
import { ShareButton } from './ShareButton';
import { TravelSectionRow } from './TravelSectionRow';
import { PremiumPlaceCard } from './PremiumPlaceCard';

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// Lazy: Leaflet only loads when a district page with mappable places renders.
const DistrictPlacesMap = lazy(() => import('./explore/DistrictPlacesMap'));

// Content sections rendered after Top Places (Landmarks are merged INTO Top Places).
const CONTENT_SECTIONS: SectionKey[] = ['parks', 'activities', 'foods', 'foodZones', 'stays'];

interface FaqItem { q: string; a: string; }

export function DistrictDetailPage({ slug }: { slug: string }) {
  const district = useMemo(() => getDistrict(slug), [slug]);
  const places = useMemo(() => placesForDistrict(slug), [slug]);
  const content = useMemo(() => getDistrictContent(slug), [slug]);
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistSync();

  const [aiQuery, setAiQuery] = useState('');
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [faqPoweredByAI, setFaqPoweredByAI] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Per-item admin-set details (image, type, rating, hours), keyed by item name.
  // Cached via React Query so district ↔ spot navigation doesn't refetch.
  const { data: placeImageData } = usePlaceImages(slug);
  const items: Record<string, { image?: string; type?: string; rating?: number; hours?: string }> = placeImageData?.items || {};

  const meta = (name: string) => items[name] || {};

  // A simple curated 2-day plan from the district's top places (3 per day).
  // (The "Plan with AI" bar above generates a fully tailored one on demand.)
  const dayPlan = useMemo(() => {
    const top = (placesForDistrict(slug) as any[]).slice(0, 6);
    const days = [top.slice(0, 3), top.slice(3, 6)].filter((d) => d.length > 0);
    return days;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  // Places in this district that have coordinates → plotted on the mini-map.
  const mapPlaces = useMemo(() =>
    places
      .filter((p: any) => p.coordinates?.lat && p.coordinates?.lng)
      .map((p: any) => ({ title: p.title, slug: p.slug, lat: p.coordinates.lat, lng: p.coordinates.lng })),
    [places]);

  // AI travel-tips FAQ.
  useEffect(() => {
    let alive = true;
    if (!district) return;
    fetch(`${API_BASE}/ai-assistant/district-faq?slug=${slug}&name=${encodeURIComponent(district.name)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (alive && d?.faqs) { setFaqs(d.faqs); setFaqPoweredByAI(d.poweredByAI !== false); } })
      .catch(() => {});
    return () => { alive = false; };
  }, [slug, district]);

  const contentSlug = (name: string) => `${slug}-${slugify(name)}`;
  const toggleContent = (name: string, label: string) => {
    const s = contentSlug(name);
    if (isInWishlist(s)) removeFromWishlist(s);
    else addToWishlist({ slug: s, title: name, category: label, region: district?.region || '', image: meta(name).image || '', description: '' });
  };
  const togglePlace = (p: any) => {
    if (isInWishlist(p.slug)) removeFromWishlist(p.slug);
    else addToWishlist({ slug: p.slug, title: p.title, category: p.category || '', region: p.region, image: meta(p.title).image || p.heroImage?.url || '', description: p.excerpt || '' });
  };

  const askAI = (q?: string) => {
    const message = (q ?? aiQuery).trim();
    if (!message) return;
    window.dispatchEvent(new CustomEvent('bt:ask-ai', { detail: { message } }));
    setAiQuery('');
  };

  // ── Merge landmarks into Top Places (dedupe against real places) ────────────
  const topPlaces = useMemo(() => {
    const cards: Array<{ key: string; name: string; image?: string; excerpt?: string; href?: string; rating?: number; type?: string; hours?: string; wishSlug: string }> = [];
    const placeTitlesLower = places.map((p) => p.title.toLowerCase());
    for (const p of places) {
      const m = items[p.title] || {};
      cards.push({
        key: `place-${p.slug}`, name: p.title, image: m.image || p.heroImage?.url,
        excerpt: p.excerpt, href: `/explore/${p.slug}`, rating: m.rating ?? (p as any).rating,
        type: m.type, hours: m.hours, wishSlug: p.slug,
      });
    }
    const landmarks = content?.landmarks || [];
    for (const l of landmarks) {
      const ll = l.toLowerCase();
      const dup = placeTitlesLower.some((t) => ll.includes(t) || t.includes(ll));
      if (dup) continue;
      const m = items[l] || {};
      cards.push({ key: `lm-${slugify(l)}`, name: l, image: m.image, rating: m.rating, type: m.type, hours: m.hours,
        href: `/explore/district/${slug}/landmarks/${slugify(l)}`, wishSlug: contentSlug(l) });
    }
    return cards;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [places, content, items, slug]);

  if (!district) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Compass className="w-14 h-14 text-purple-300 mx-auto mb-4" />
          <h1 className="font-poppins text-2xl font-semibold text-slate-900 mb-2">District not found</h1>
          <a href="/explore" className="inline-flex items-center gap-2 mt-2 text-purple-600 font-poppins font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to all districts
          </a>
        </div>
      </div>
    );
  }

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const navItems: Array<{ id: string; label: string }> = [];
  if (topPlaces.length) navItems.push({ id: 'sec-places', label: 'Top Places' });
  CONTENT_SECTIONS.forEach((k) => { if (content?.[k]?.length) navItems.push({ id: `sec-${k}`, label: SECTION_META[k].pill === 'Park / Arena' ? 'Parks' : SECTION_META[k].label.split(' &')[0].split(' Local')[0] }); });

  const aiChips = [`Best 2-day plan for ${district.name}`, `Where to eat in ${district.name}`, `How to reach ${district.name}`];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Banner ─────────────────────────────────────────────────────────── */}
      <div className="relative h-[46vh] min-h-[340px] overflow-hidden">
        <ImageWithFallback src={district.image} alt={district.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />
        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="max-w-7xl mx-auto w-full px-5 sm:px-8 pb-8">
            <a href="/explore" className="inline-flex items-center gap-2 text-white/85 hover:text-white font-poppins text-sm mb-4">
              <ArrowLeft className="w-4 h-4" /> All districts
            </a>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <span className="inline-block bg-white/15 backdrop-blur-sm text-white text-xs font-poppins font-medium px-3 py-1 rounded-full mb-3">{district.region}</span>
              <h1 className="font-poppins text-4xl sm:text-6xl font-bold text-white mb-2">{district.name}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <span className="inline-flex items-center gap-1.5 text-white/90 font-poppins text-sm"><MapPin className="w-4 h-4" /> {topPlaces.length} places to explore</span>
                <button onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${district.lat},${district.lng}`, '_blank', 'noopener,noreferrer')}
                  className="inline-flex items-center gap-2 bg-white/90 hover:bg-white text-purple-700 font-poppins text-sm font-medium px-4 py-2 rounded-full transition-colors">
                  <Navigation className="w-4 h-4" /> Directions
                </button>
                <ShareButton title={`${district.name}, West Bengal`} description={district.blurb || 'Explore on Bengal Trails'} variant="icon" />
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        {/* About */}
        {content?.about && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8 -mt-10 relative z-10">
            <h2 className="font-poppins text-xl font-bold text-slate-900 mb-2">About {district.name}</h2>
            <p className="font-poppins text-gray-600 leading-relaxed">{content.about}</p>
          </div>
        )}

        {/* Ask AI */}
        <div className="bg-gradient-to-br from-purple-50 to-orange-50 border border-purple-100 rounded-3xl p-6 mt-6">
          <p className="font-poppins font-semibold text-slate-900 flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-purple-600" /> Plan {district.name} with AI
          </p>
          <p className="font-poppins text-sm text-gray-500 mb-4">Ask anything — itineraries, food, stays, how to get around.</p>
          <div className="flex gap-2 mb-3">
            <input value={aiQuery} onChange={(e) => setAiQuery(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') askAI(); }}
              placeholder={`e.g. Best 2-day itinerary for ${district.name}`}
              className="flex-1 px-4 py-3 rounded-full border border-gray-200 bg-white font-poppins text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
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

        {/* Sticky category nav */}
        {navItems.length > 0 && (
          <div className="sticky top-16 z-20 -mx-5 sm:mx-0 mt-6 bg-gray-50/95 backdrop-blur py-3">
            <div className="flex gap-2 overflow-x-auto px-5 sm:px-0">
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
        {topPlaces.length > 0 && (
          <TravelSectionRow
            id="sec-places"
            title="Top places to visit"
            subtitle={`Landmarks and viewpoints in ${district.name}`}
            count={topPlaces.length}
          >
            {topPlaces.map((c) => (
              <PremiumPlaceCard
                key={c.key}
                title={c.name}
                image={c.image}
                href={c.href || `/explore/district/${slug}/landmarks/${slugify(c.name)}`}
                location={`${district.name}, ${district.region}`}
                rating={c.rating}
              />
            ))}
          </TravelSectionRow>
        )}

        {/* Suggested 2-day plan — curated from real places, with an AI option */}
        {dayPlan.length > 0 && dayPlan[0].length >= 2 && (
          <section id="sec-plan">
            <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🗓️</span>
                <h2 className="font-poppins text-2xl font-bold text-slate-900">A perfect 2 days in {district.name}</h2>
              </div>
              <button onClick={() => askAI(`Plan a detailed 2-day itinerary for ${district.name}, West Bengal with timings`)}
                className="inline-flex items-center gap-1.5 text-sm font-poppins font-medium text-purple-600 hover:text-purple-700">
                <Sparkles className="w-4 h-4" /> Get a custom AI plan
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              {dayPlan.map((day, i) => (
                <div key={i} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                  <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 font-poppins text-sm font-semibold px-3 py-1 rounded-full mb-4">Day {i + 1}</div>
                  <ol className="space-y-3">
                    {day.map((p: any, idx: number) => (
                      <li key={p.slug}>
                        <a href={`/explore/${p.slug}`} className="group flex items-center gap-3">
                          <span className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 font-poppins text-xs font-bold flex items-center justify-center shrink-0">{idx + 1}</span>
                          <span className="font-poppins text-sm font-medium text-slate-800 group-hover:text-purple-700 transition-colors">{p.title}</span>
                          <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-purple-600 ml-auto shrink-0" />
                        </a>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* On the map — plots this district's places (Leaflet + free OSM) */}
        {mapPlaces.length > 0 && (
          <section id="sec-map">
            <div className="flex items-center gap-2 mb-5">
              <span className="text-2xl">🗺️</span>
              <h2 className="font-poppins text-2xl font-bold text-slate-900">{district.name} on the map</h2>
            </div>
            <Suspense fallback={<div className="h-[360px] rounded-3xl bg-gray-100 animate-pulse flex items-center justify-center"><Loader2 className="w-7 h-7 text-purple-400 animate-spin" /></div>}>
              <DistrictPlacesMap center={[district.lat, district.lng]} places={mapPlaces} />
            </Suspense>
          </section>
        )}

        {/* Cleaner taxonomy noun per row (drops the '& Arena' tail from the data labels). */}
        {content && CONTENT_SECTIONS.map((key) => {
          const list = content[key];
          if (!list || list.length === 0) return null;
          const ROW_TITLE: Record<string, string> = {
            parks: 'Parks & open spaces',
            activities: 'Activities & experiences',
            foods: 'Local & street food',
            foodZones: 'Street food hubs',
            stays: 'Where to stay',
          };
          const ROW_SUBTITLE: Record<string, string> = {
            parks: 'Gardens, sanctuaries and viewpoints to slow down at',
            activities: 'Tours, trails and immersive experiences',
            foods: 'Signature dishes, sweets and street bites',
            foodZones: 'Bustling lanes and markets for foodies',
            stays: 'Heritage hotels, boutique stays and homestays',
          };
          return (
            <TravelSectionRow
              key={key}
              id={`sec-${key}`}
              title={ROW_TITLE[key] || key}
              subtitle={ROW_SUBTITLE[key]}
              count={list.length}
            >
              {list.map((name) => {
                const m = meta(name);
                const sub = key === 'stays'
                  ? `${m.type || 'Stay'} · ${district.name}`
                  : key === 'foodZones'
                    ? `${district.name} food hub`
                    : key === 'foods'
                      ? `${district.name} signature dish`
                      : `${district.name}, ${district.region}`;
                return (
                  <PremiumPlaceCard
                    key={name}
                    title={name}
                    image={m.image}
                    href={`/explore/district/${slug}/${key}/${slugify(name)}`}
                    location={sub}
                    rating={m.rating}
                  />
                );
              })}
            </TravelSectionRow>
          );
        })}

        {/* ── AI Travel Tips (FAQ) — before footer ───────────────────────────── */}
        {faqs.length > 0 && (
          <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-poppins text-2xl font-bold text-slate-900">{district.name} travel tips</h2>
              {faqPoweredByAI && (
                <span className="inline-flex items-center gap-1.5 text-xs font-poppins text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                  <Sparkles className="w-3.5 h-3.5" /> Powered by AI
                </span>
              )}
            </div>
            <p className="font-poppins text-sm text-gray-500 mb-5">Common questions travellers ask about {district.name}.</p>
            <div className="divide-y divide-gray-100">
              {faqs.map((f, i) => (
                <div key={i} className="py-1">
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between gap-4 py-4 text-left">
                    <span className="font-poppins font-semibold text-slate-900">{f.q}</span>
                    <ChevronDown className={`w-5 h-5 text-gray-400 shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                  </button>
                  {openFaq === i && <p className="font-poppins text-gray-600 leading-relaxed pb-4 pr-8">{f.a}</p>}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default DistrictDetailPage;
