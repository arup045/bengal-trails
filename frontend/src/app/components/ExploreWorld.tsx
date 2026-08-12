import { Star, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { OptimizedImage } from './OptimizedImage';
import { authFetch } from '../utils/api';

interface ApiDestination {
  slug: string;
  name: string;
  region?: string;
  category?: string;
  rating?: number | string;
  review_count?: number;
  reviewCount?: number;
  image_url?: string;
  imageUrl?: string;
  price_range?: string;
  priceRange?: string;
  price_from?: number;
  priceFrom?: number;
  featured?: boolean;
}

interface Place {
  name:     string;
  slug:     string;
  category: string;
  image:    string;
  rating:   number;
  reviews:  number;
  price:    string;
}

const CATEGORIES = ['All', 'Hills', 'Beaches', 'Heritage', 'Wildlife', 'Culture'];

// Map an arbitrary destination category → our 5 display categories
function normaliseCategory(c?: string): string {
  if (!c) return 'Heritage';
  const lower = c.toLowerCase();
  if (lower.includes('hill') || lower.includes('tea'))      return 'Hills';
  if (lower.includes('beach') || lower.includes('coast'))   return 'Beaches';
  if (lower.includes('wild') || lower.includes('safari'))   return 'Wildlife';
  if (lower.includes('cultur') || lower.includes('festival')|| lower.includes('art'))
                                                            return 'Culture';
  return 'Heritage';
}

function formatPrice(d: ApiDestination): string {
  if (d.price_range || d.priceRange) return (d.price_range || d.priceRange) as string;
  const n = d.price_from || d.priceFrom;
  if (n && n > 0) return `₹${Number(n).toLocaleString('en-IN')}`;
  return 'Free';
}

export function ExploreWorld() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [destinations,   setDestinations]   = useState<Place[]>([]);
  const [loading,        setLoading]        = useState(true);

  useEffect(() => {
    let alive = true;
    // Prefer the non-featured catalog (BentoGrid already shows the featured set
    // near the top, so this avoids repeating the same places). But many databases
    // have most/all destinations flagged featured — so we ALWAYS fall back to the
    // full list whenever non-featured returns too few, guaranteeing this section
    // is never empty.
    const MIN = 6;
    (async () => {
      try {
        let list: ApiDestination[] = [];
        const r1 = await authFetch(`/destinations?limit=25&featured=false`).then(r => r.ok ? r.json() : null).catch(() => null);
        list = r1?.destinations || [];
        if (list.length < MIN) {
          // Not enough non-featured rows — show the general list instead.
          const r2 = await authFetch(`/destinations?limit=25`).then(r => r.ok ? r.json() : null).catch(() => null);
          if ((r2?.destinations || []).length > list.length) list = r2.destinations;
        }
        if (!alive) return;
        const mapped: Place[] = list.map((p: ApiDestination) => ({
          name:    p.name,
          slug:    p.slug,
          category: normaliseCategory(p.category || p.region),
          image:   p.image_url || p.imageUrl || '',
          rating:  Number(p.rating) || 0,
          reviews: p.review_count || p.reviewCount || 0,
          price:   formatPrice(p),
        }));
        setDestinations(mapped);
      } catch {
        /* silent — section just stays on its skeleton/empty state */
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const filtered = destinations.filter(
    (d) => activeCategory === 'All' || d.category === activeCategory
  );

  if (loading) {
    return (
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <div className="h-3 w-32 bg-gray-200 rounded-full mx-auto mb-3 animate-pulse" />
            <div className="h-8 w-64 bg-gray-200 rounded-lg mx-auto animate-pulse" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-72 bg-gray-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <p className="font-poppins text-purple-600 uppercase tracking-widest text-xs font-semibold mb-2">More to Explore</p>
          <h2 className="font-poppins text-3xl md:text-4xl font-bold text-slate-900 mb-6">Explore West Bengal</h2>
          {/* Category filters */}
          <div className="flex flex-wrap justify-center gap-2">
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setActiveCategory(c)}
                className={`px-5 py-2 rounded-full font-poppins text-sm font-medium transition-all
                  ${activeCategory === c
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-200'
                    : 'bg-white text-slate-600 border border-gray-200 hover:border-purple-300 hover:text-purple-600'}`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="font-poppins text-gray-500">No destinations in this category yet.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.slice(0, 24).map((d) => {
              const hasReviews = d.rating > 0 && d.reviews > 0;
              return (
                <a key={d.slug} href={`/explore/${d.slug}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  {/* Image */}
                  <div className="relative h-44 overflow-hidden bg-gray-100">
                    <ImageWithFallback
                      src={d.image}
                      alt={d.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Category pill (top-left) */}
                    <div className="absolute top-3 left-3">
                      <span className="bg-purple-600 text-white px-2.5 py-1 rounded-full font-poppins text-[11px] font-semibold shadow-sm">
                        {d.category}
                      </span>
                    </div>
                    {/* Rating badge (top-right) — only when backed by real reviews */}
                    {hasReviews && (
                      <div className="absolute top-3 right-3">
                        <span className="bg-white/95 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1 font-poppins shadow-sm">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                          <span className="text-xs font-semibold text-slate-800">{d.rating.toFixed(1)}</span>
                        </span>
                      </div>
                    )}
                  </div>
                  {/* Body */}
                  <div className="p-4">
                    <div className="flex items-center gap-1 mb-2">
                      <MapPin className="w-3 h-3 text-purple-600" />
                      <h3 className="font-poppins text-base font-semibold text-slate-900 leading-tight">{d.name}</h3>
                    </div>
                    <div className="flex items-end justify-between mt-3 pt-3 border-t border-gray-100">
                      <div>
                        <p className="font-poppins text-[10px] text-gray-400 uppercase tracking-wider">Starting from</p>
                        <p className="font-poppins text-base font-semibold text-purple-600">{d.price}</p>
                      </div>
                      <span className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 rounded-full font-poppins text-xs font-medium transition-colors">
                        Explore Now
                      </span>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
