import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, MapPin, Navigation, Compass, Sparkles, Star, Clock, Heart, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { API_BASE } from '../utils/api';
import { getDistrict } from '../data/districts';
import { getDistrictContent, type DistrictContent } from '../data/districtContent';
import { ItemCard, SECTION_META, type SectionKey } from './explore/ItemCard';
import { useWishlistSync } from '../utils/useWishlistSync';
import { navigate } from '../utils/navigation';

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// 'landmarks' isn't a card section on the district page (merged into Top Places),
// but it can still have a detail page — give it label/emoji here.
const LABELS: Record<string, { label: string; emoji: string; pill: string }> = {
  landmarks:  { label: 'Landmark',          emoji: '📍', pill: 'Landmark' },
  parks:      { label: SECTION_META.parks.label,      emoji: SECTION_META.parks.emoji,      pill: SECTION_META.parks.pill },
  activities: { label: SECTION_META.activities.label, emoji: SECTION_META.activities.emoji, pill: SECTION_META.activities.pill },
  foods:      { label: SECTION_META.foods.label,      emoji: SECTION_META.foods.emoji,      pill: SECTION_META.foods.pill },
  foodZones:  { label: SECTION_META.foodZones.label,  emoji: SECTION_META.foodZones.emoji,  pill: SECTION_META.foodZones.pill },
  stays:      { label: SECTION_META.stays.label,      emoji: SECTION_META.stays.emoji,      pill: SECTION_META.stays.pill },
};
const GRADIENTS: Record<string, string> = {
  landmarks: 'from-purple-500 to-indigo-600', parks: 'from-emerald-500 to-green-600',
  activities: 'from-orange-500 to-amber-600', foods: 'from-rose-500 to-red-600',
  foodZones: 'from-yellow-500 to-orange-500', stays: 'from-sky-500 to-blue-600',
};

interface ItemMeta { image?: string; type?: string; rating?: number; hours?: string; }

// `path` is "<districtSlug>/<section>/<itemSlug>" (set by the router).
export function SpotDetailPage({ path }: { path: string }) {
  const [districtSlug, section, itemSlug] = (path || '').split('/');
  const district = useMemo(() => getDistrict(districtSlug), [districtSlug]);
  const content = useMemo(() => getDistrictContent(districtSlug), [districtSlug]);
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistSync();
  const [items, setItems] = useState<Record<string, ItemMeta>>({});

  useEffect(() => {
    let alive = true;
    fetch(`${API_BASE}/place-images/${districtSlug}`)
      .then((r) => (r.ok ? r.json() : { items: {} }))
      .then((d) => { if (alive) setItems(d.items || {}); })
      .catch(() => {});
    return () => { alive = false; };
  }, [districtSlug]);

  // Resolve the real item name from its slug within the section's list.
  const list: string[] = (content && (content as DistrictContent)[section as keyof DistrictContent] as string[]) || [];
  const name = useMemo(() => list.find((n) => slugify(n) === itemSlug), [list, itemSlug]);

  useEffect(() => { window.scrollTo({ top: 0 }); }, [path]);

  if (!district || !content || !name) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Compass className="w-14 h-14 text-purple-300 mx-auto mb-4" />
          <h1 className="font-poppins text-2xl font-semibold text-slate-900 mb-2">Spot not found</h1>
          <a href={districtSlug ? `/explore/district/${districtSlug}` : '/explore'}
            className="inline-flex items-center gap-2 mt-2 text-purple-600 font-poppins font-medium">
            <ArrowLeft className="w-4 h-4" /> Back
          </a>
        </div>
      </div>
    );
  }

  const m: ItemMeta = items[name] || {};
  const meta = LABELS[section] || LABELS.landmarks;
  const gradient = GRADIENTS[section] || GRADIENTS.landmarks;
  const wishSlug = `${districtSlug}-${slugify(name)}`;
  const saved = isInWishlist(wishSlug);
  const mapQuery = encodeURIComponent(`${name}, ${district.name}, West Bengal, India`);

  const toggleSave = () => {
    if (saved) removeFromWishlist(wishSlug);
    else addToWishlist({ slug: wishSlug, title: name, category: meta.label, region: district.region, image: m.image || '', description: '' });
  };
  const directions = () => window.open(`https://www.google.com/maps/dir/?api=1&destination=${mapQuery}`, '_blank', 'noopener,noreferrer');
  const askAI = () => window.dispatchEvent(new CustomEvent('bt:ask-ai', { detail: { message: `Tell me about ${name} in ${district.name}, West Bengal — what makes it special, timings, and tips for visiting.` } }));

  // Siblings in the same section (excluding this one) for a "More like this" row.
  const siblings = list.filter((n) => n !== name).slice(0, 8);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="relative h-[44vh] min-h-[320px] overflow-hidden">
        {m.image ? (
          <ImageWithFallback src={m.image} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
            <span className="text-7xl opacity-90 drop-shadow-lg">{meta.emoji}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/15" />
        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="max-w-5xl mx-auto w-full px-5 sm:px-8 pb-8">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-white/80 font-poppins text-xs sm:text-sm mb-3 flex-wrap">
              <a href="/explore" className="hover:text-white">Explore</a>
              <ChevronRight className="w-3.5 h-3.5" />
              <a href={`/explore/district/${districtSlug}`} className="hover:text-white">{district.name}</a>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-white/95">{meta.label.split(' &')[0]}</span>
            </nav>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <span className="inline-block bg-white/15 backdrop-blur-sm text-white text-xs font-poppins font-medium px-3 py-1 rounded-full mb-3">
                {m.type || meta.pill}
              </span>
              <h1 className="font-poppins text-3xl sm:text-5xl font-bold text-white mb-3 max-w-3xl">{name}</h1>
              <div className="flex flex-wrap items-center gap-4">
                {m.rating ? (
                  <span className="inline-flex items-center gap-1 text-white font-poppins text-sm font-semibold">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" /> {Number(m.rating).toFixed(1)}
                  </span>
                ) : null}
                {m.hours ? (
                  <span className="inline-flex items-center gap-1.5 text-white/90 font-poppins text-sm">
                    <Clock className="w-4 h-4" /> {m.hours}
                  </span>
                ) : null}
                <span className="inline-flex items-center gap-1.5 text-white/90 font-poppins text-sm">
                  <MapPin className="w-4 h-4" /> {district.name}, {district.region}
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-8 space-y-8">
        {/* Action bar */}
        <div className="flex flex-wrap gap-3 -mt-16 relative z-10">
          <button onClick={directions}
            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-poppins text-sm font-medium px-5 py-3 rounded-full shadow-lg transition-colors">
            <Navigation className="w-4 h-4" /> Get directions
          </button>
          <button onClick={toggleSave}
            className={`inline-flex items-center gap-2 font-poppins text-sm font-medium px-5 py-3 rounded-full border transition-colors ${saved ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-white border-gray-200 text-slate-700 hover:border-purple-300'}`}>
            <Heart className={`w-4 h-4 ${saved ? 'fill-rose-500 text-rose-500' : ''}`} /> {saved ? 'Saved' : 'Save'}
          </button>
          <button onClick={askAI}
            className="inline-flex items-center gap-2 bg-white border border-purple-200 text-purple-700 hover:bg-purple-50 font-poppins text-sm font-medium px-5 py-3 rounded-full transition-colors">
            <Sparkles className="w-4 h-4" /> Ask AI about this
          </button>
        </div>

        {/* Quick facts + map */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-poppins text-lg font-bold text-slate-900 mb-4">Good to know</h2>
            <dl className="space-y-3 font-poppins text-sm">
              <div className="flex justify-between gap-4"><dt className="text-gray-500">Category</dt><dd className="text-slate-900 font-medium text-right">{m.type || meta.label}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-gray-500">District</dt><dd className="text-slate-900 font-medium text-right">{district.name}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-gray-500">Region</dt><dd className="text-slate-900 font-medium text-right">{district.region}</dd></div>
              {m.hours ? <div className="flex justify-between gap-4"><dt className="text-gray-500">Hours</dt><dd className="text-slate-900 font-medium text-right">{m.hours}</dd></div> : null}
              {m.rating ? <div className="flex justify-between gap-4"><dt className="text-gray-500">Rating</dt><dd className="text-slate-900 font-medium text-right">{Number(m.rating).toFixed(1)} / 5</dd></div> : null}
            </dl>
            <p className="font-poppins text-xs text-gray-400 mt-5 leading-relaxed">
              Want a personalised plan around {name}? Tap “Ask AI about this” for timings, nearby spots and tips — grounded in live Bengal Trails data.
            </p>
          </div>

          {/* Embedded map (no API key needed) */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden min-h-[260px]">
            <iframe
              title={`Map of ${name}`}
              src={`https://maps.google.com/maps?q=${mapQuery}&z=13&output=embed`}
              className="w-full h-full min-h-[260px] border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        {/* More in this section */}
        {siblings.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-5">
              <span className="text-2xl">{meta.emoji}</span>
              <h2 className="font-poppins text-2xl font-bold text-slate-900">More {meta.label.split(' &')[0].toLowerCase()} in {district.name}</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {siblings.map((n) => {
                const sm = items[n] || {};
                const sSlug = `${districtSlug}-${slugify(n)}`;
                return (
                  <ItemCard key={n} name={n}
                    section={(section === 'landmarks' ? 'places' : section) as SectionKey}
                    districtName={district.name}
                    image={sm.image} type={sm.type} rating={sm.rating} hours={sm.hours}
                    href={`/explore/district/${districtSlug}/${section}/${slugify(n)}`}
                    saved={isInWishlist(sSlug)}
                    onToggleSave={() => (isInWishlist(sSlug)
                      ? removeFromWishlist(sSlug)
                      : addToWishlist({ slug: sSlug, title: n, category: meta.label, region: district.region, image: sm.image || '', description: '' }))}
                  />
                );
              })}
            </div>
          </section>
        )}

        <a href={`/explore/district/${districtSlug}`}
          onClick={(e) => { e.preventDefault(); navigate(`/explore/district/${districtSlug}`); }}
          className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-poppins font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to {district.name}
        </a>
      </div>
    </div>
  );
}

export default SpotDetailPage;
