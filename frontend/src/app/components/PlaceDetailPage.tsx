import { API_BASE } from '../utils/api';
import { useState, useEffect, lazy, Suspense } from 'react';
import { motion } from 'motion/react';
import { MapPin, Star, Calendar, ChevronRight, Navigation, Share2, Facebook, Twitter, MessageCircle, Copy, Camera, Heart, Clock, Tag, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { placesData } from '../data/places-full';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { buildSrcSet } from '../utils/responsiveImage';
import { LiveWeather } from './LiveWeather';
import { TransportGuideSection } from './TransportGuideSection';
import { HotelsSection } from './HotelsSection';
import { NearbyPlacesSection } from './NearbyPlacesSection';
import { ShareButton } from './ShareButton';
import { PhotoGalleryLightbox } from './PhotoGalleryLightbox';
import { ReviewsSystem } from './ReviewsSystem';
import { BookingSystem } from './BookingSystem';
import { ReportIssueButton } from './ReportIssueButton';
import { useWishlistSync } from '../utils/useWishlistSync';
import { districtSlugForPlace } from '../data/districts';
import { AiFaq } from './AiFaq';
import { PlaceQuickFacts } from './PlaceQuickFacts';
import { PlaceNearbyAmenities } from './PlaceNearbyAmenities';
import { PlaceHistory } from './PlaceHistory';
import { usePlaceWikiPhotos } from '../utils/wikiPhotos';
import { PlaceWeatherForecast } from './PlaceWeatherForecast';
import { TravelSectionRow } from './TravelSectionRow';
import { PremiumPlaceCard } from './PremiumPlaceCard';
import { PlaceQuickInsights } from './PlaceQuickInsights';
import { PlaceLogistics } from './PlaceLogistics';
// Heavy (Leaflet + Overpass) — load only when this page renders.
const PlaceInteractiveMap = lazy(() => import('./PlaceInteractiveMap').then(m => ({ default: m.PlaceInteractiveMap })));
import { InternationalVisitorChip } from './InternationalVisitorChip';

interface PlaceDetailPageProps { slug: string; }

// Keep the "About" concise — show at most `max` sentences (the rest via Read more).
function splitSentences(text: string): string[] {
  if (!text) return [];
  return (text.match(/[^.!?]+[.!?]+(\s|$)/g) || [text]).map(s => s.trim()).filter(Boolean);
}

export function PlaceDetailPage({ slug }: PlaceDetailPageProps) {
  // ── Hooks (all unconditional, before any early return) ──────────────────────
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistSync();
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [aboutExpanded, setAboutExpanded] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [apiPlace, setApiPlace] = useState<any | null>(null);

  const fetchPlace = () => {
    if (!slug) return;
    fetch(`${API_BASE}/destinations/${slug}`)
      .then(r => (r.ok ? r.json() : null))
      .then(d => {
        const dest = d?.destination;
        if (dest) {
          setApiPlace({
            ...dest,
            title: dest.name, slug: dest.slug,
            image: dest.imageUrl || dest.image_url,
            heroImage: { url: (dest.imageUrl || dest.image_url) || 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1200', alt: dest.name || 'Destination photo' },
            gallery: Array.isArray(dest.galleryImages || dest.gallery_images) ? (dest.galleryImages || dest.gallery_images) : [],
            excerpt: (dest.shortDescription || dest.short_description) || dest.description?.slice(0, 160) || '',
            description: dest.description || '',
            region: dest.region || 'Bengal',
            district: dest.district || dest.region || 'West Bengal',
            coordinates: (dest.latitude && dest.longitude) ? { lat: parseFloat(dest.latitude), lng: parseFloat(dest.longitude) } : { lat: 22.5726, lng: 88.3639 },
            tags: Array.isArray(dest.highlights) && dest.highlights.length ? dest.highlights : Array.isArray(dest.activities) ? dest.activities : (dest.category ? [dest.category] : []),
            priceFrom: (dest.priceRange || dest.price_range) || ((dest.priceFrom || dest.price_from) ? `₹${(dest.priceFrom || dest.price_from).toLocaleString('en-IN')}` : 'Free'),
            rating: parseFloat(dest.rating) || 0,
            reviewsCount: (dest.reviewCount || dest.review_count) || 0,
            bestTime: (dest.bestTimeToVisit || dest.best_time_to_visit) || 'Oct–Mar',
            category: dest.category || '',
            nearbyRestaurants: Array.isArray(dest.nearbyRestaurants) ? dest.nearbyRestaurants : [],
          });
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { setIsLoading(true); fetchPlace(); /* eslint-disable-next-line */ }, [slug]);

  // Refresh rating/review count when a review changes for this place
  useEffect(() => {
    const handler = (e: any) => { if (!e?.detail?.slug || e.detail.slug === slug) fetchPlace(); };
    window.addEventListener('bt:review-changed', handler);
    return () => window.removeEventListener('bt:review-changed', handler);
    // eslint-disable-next-line
  }, [slug]);

  const staticPlace = placesData.find(p => p.slug === slug);
  const place = apiPlace || staticPlace;

  // Recently viewed (hook stays unconditional; guards on `place`)
  useEffect(() => {
    if (!place) return;
    try {
      const rv = JSON.parse(localStorage.getItem('recentlyViewed') || '[]').filter((i: any) => i.slug !== slug);
      const updated = [{ slug, title: place.title, image: place.heroImage?.url, region: place.region }, ...rv].slice(0, 10);
      localStorage.setItem('recentlyViewed', JSON.stringify(updated));
    } catch { /* ignore */ }
  }, [slug, place]);

  // ── Early states ────────────────────────────────────────────────────────────
  if (isLoading && !place) {
    return (
      <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-24 pb-16 animate-pulse">
        <div className="h-72 sm:h-[440px] bg-gray-200 rounded-3xl mb-8" />
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-3">
            <div className="h-8 bg-gray-200 rounded-xl w-2/3" />
            <div className="h-4 bg-gray-200 rounded-xl w-1/3" />
            <div className="h-4 bg-gray-200 rounded-xl w-full mt-4" />
            <div className="h-4 bg-gray-200 rounded-xl w-5/6" />
          </div>
          <div className="h-56 bg-gray-200 rounded-2xl" />
        </div>
      </div>
    );
  }
  if (!place) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl mb-4 font-poppins">Place not found</h2>
          <p className="text-gray-600 mb-4">Sorry, we couldn't find that destination.</p>
          <a href="/explore" className="text-purple-600 hover:underline text-lg">← Back to Explore</a>
        </div>
      </div>
    );
  }

  // ── Derived (non-hook) ──────────────────────────────────────────────────────
  const districtSlug = districtSlugForPlace(place as any);
  const saved = isInWishlist(place.slug);
  const toggleSave = () => {
    if (saved) removeFromWishlist(place.slug);
    else addToWishlist({ slug: place.slug, title: place.title, category: place.category || '', region: place.region, image: place.heroImage?.url || '', description: place.excerpt || '' });
  };

  const openGoogleMaps = () => {
    const { lat, lng } = place.coordinates;
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank', 'noopener,noreferrer');
  };
  const url = typeof window !== 'undefined' ? window.location.href : '';
  const shareOnFacebook = () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  const shareOnTwitter = () => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(`Check out ${place.title} on Bengal Trails`)}`, '_blank');
  const shareOnWhatsApp = () => window.open(`https://wa.me/?text=${encodeURIComponent(`Check out ${place.title} on Bengal Trails: ${url}`)}`, '_blank');
  const copyLink = () => { navigator.clipboard.writeText(url); toast.success('Link copied!'); setShowShareMenu(false); };

  const nearbyPlaces = placesData.filter(p => p.slug !== slug && p.region === place.region).slice(0, 4);

  // Real gallery — hero + admin-uploaded gallery + (for places whose admin
  // gallery is empty) actual Wikimedia Commons photos of the place itself.
  // Wikimedia is free, no-key, and only returns photos that genuinely exist
  // for that page — so no fabricated/stock fillers.
  const { photos: wikiPhotos } = usePlaceWikiPhotos(place.title, place.district);
  const galleryImages: Array<{ src: string; alt: string }> = [
    { src: place.heroImage.url, alt: place.heroImage.alt || place.title },
    ...((place.gallery || []) as string[]).filter(Boolean).map((u: string) => ({ src: u, alt: place.title })),
    ...wikiPhotos.map((u) => ({ src: u, alt: `${place.title} — photo via Wikimedia Commons` })),
  ]
    .filter((img, i, arr) => arr.findIndex((x) => x.src === img.src) === i)
    .slice(0, 16);
  const showGallery = galleryImages.length >= 2;

  const restaurants = (place.nearbyRestaurants || []).map((name: string) => ({ name }));

  // Spec taxonomy where the data supports it: Overview → Plan visit → Photos
  // → Around here → Logistics (transport) → Where to stay → Reviews → Nearby.
  const navSections = [
    { id: 'about', label: 'Overview' },
    ...(place.coordinates ? [{ id: 'plan-visit', label: 'Plan visit' }] : []),
    ...(showGallery ? [{ id: 'photos', label: 'Photos' }] : []),
    ...(place.coordinates ? [{ id: 'around-here', label: 'Around here' }] : []),
    { id: 'getting-there', label: 'Logistics' },
    { id: 'stay', label: 'Where to stay' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'nearby', label: 'Nearby' },
  ];

  // Scroll-spy — keeps the sliding purple pointer underneath whichever section
  // is currently inside the viewport's reading zone.
  const [activeNavId, setActiveNavId] = useState<string>('about');
  useEffect(() => {
    const ids = navSections.map((s) => s.id);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) setActiveNavId(visible[0].target.id);
      },
      { rootMargin: '-25% 0px -65% 0px', threshold: 0 },
    );
    ids.forEach((id) => { const el = document.getElementById(id); if (el) observer.observe(el); });
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [place.slug, showGallery]);
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Immersive hero ───────────────────────────────────────────────────── */}
      <div className="relative h-[72vh] min-h-[440px] overflow-hidden">
        <ImageWithFallback src={place.heroImage.url} alt={place.heroImage.alt} className="w-full h-full object-cover" loading="eager" decoding="async" srcSet={buildSrcSet(place.heroImage.url)} sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-7xl mx-auto w-full px-5 sm:px-8 pb-12">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-white/80 text-sm font-poppins mb-4 flex-wrap">
                <a href="/explore" className="hover:text-white">Explore</a>
                <ChevronRight className="w-4 h-4" />
                <a href={`/explore/district/${districtSlug}`} className="hover:text-white">{place.district}</a>
                <ChevronRight className="w-4 h-4" />
                <span className="text-white">{place.title}</span>
              </div>

              <h1 className="font-poppins text-4xl md:text-6xl font-bold text-white mb-4">{place.title}</h1>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-white/90 font-poppins mb-6">
                <span className="flex items-center gap-2"><MapPin className="w-5 h-5" />{place.district}, {place.region}</span>
                {place.rating > 0 && (
                  <span className="flex items-center gap-2"><Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />{place.rating} {place.reviewsCount ? `(${place.reviewsCount.toLocaleString()} reviews)` : ''}</span>
                )}
                <span className="flex items-center gap-2"><Calendar className="w-5 h-5" />Best: {place.bestTime}</span>
              </div>

              <div className="flex flex-wrap gap-3">
                <button onClick={toggleSave}
                  className={`px-6 py-3 rounded-full backdrop-blur-md transition-all font-poppins font-medium ${saved ? 'bg-rose-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'}`}>
                  <Heart className={`w-5 h-5 inline mr-2 ${saved ? 'fill-white' : ''}`} />{saved ? 'Saved' : 'Save'}
                </button>
                <div className="relative">
                  <button onClick={() => setShowShareMenu(!showShareMenu)} className="px-6 py-3 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition-all font-poppins font-medium">
                    <Share2 className="w-5 h-5 inline mr-2" />Share
                  </button>
                  {showShareMenu && (
                    <div className="absolute top-full mt-2 left-0 bg-white rounded-2xl shadow-2xl p-3 z-50 min-w-[200px]">
                      <button onClick={shareOnFacebook} className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-50 rounded-xl text-gray-700"><Facebook className="w-5 h-5 text-blue-600" />Facebook</button>
                      <button onClick={shareOnTwitter} className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-50 rounded-xl text-gray-700"><Twitter className="w-5 h-5 text-sky-500" />Twitter</button>
                      <button onClick={shareOnWhatsApp} className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-50 rounded-xl text-gray-700"><MessageCircle className="w-5 h-5 text-green-600" />WhatsApp</button>
                      <button onClick={copyLink} className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-50 rounded-xl text-gray-700"><Copy className="w-5 h-5 text-purple-600" />Copy Link</button>
                    </div>
                  )}
                </div>
                <button onClick={openGoogleMaps} className="px-6 py-3 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition-all font-poppins font-medium">
                  <Navigation className="w-5 h-5 inline mr-2" />Directions
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── Pinned glassmorphic sub-nav with scroll-spy + sliding pointer ────── */}
      <div className="sticky top-16 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 flex gap-1 overflow-x-auto scrollbar-hide py-3">
          {navSections.map((s) => {
            const active = activeNavId === s.id;
            return (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                className={`relative shrink-0 px-4 py-2 font-poppins text-sm font-medium transition-colors ${
                  active ? 'text-purple-700' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {s.label}
                {active && (
                  <motion.span
                    layoutId="place-subnav-pointer"
                    className="absolute left-3 right-3 -bottom-0.5 h-0.5 bg-purple-600 rounded-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main */}
          <div className="lg:col-span-2 space-y-12">
            {/* About */}
            {/* Subtle chip for foreign-locale visitors (hidden for Indian locales) */}
            <InternationalVisitorChip destinationCity={place.title} />

            <section id="about" className="scroll-mt-32">
              <h2 className="font-poppins text-3xl font-bold text-slate-900 mb-5">About {place.title}</h2>

              {/* Asymmetric 2-column: editorial summary (65%) + quick insights (35%) */}
              <div className="grid lg:grid-cols-[1.85fr_1fr] gap-6 lg:gap-8 items-start">
                <div className="min-w-0">
                  {place.description && (() => {
                    const sentences = splitSentences(place.description);
                    const isLong = sentences.length > 5;
                    const shown = aboutExpanded || !isLong ? place.description : sentences.slice(0, 5).join(' ');
                    return (
                      <p className="text-gray-600 text-lg leading-relaxed mb-4">
                        {shown}
                        {isLong && (
                          <button onClick={() => setAboutExpanded(v => !v)}
                            className="ml-1.5 font-poppins text-base font-medium text-purple-600 hover:text-purple-700">
                            {aboutExpanded ? 'Show less' : 'Read more'}
                          </button>
                        )}
                      </p>
                    );
                  })()}

                  {place.tags?.length > 0 && (
                    <div className="mt-6">
                      <h3 className="font-poppins text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2"><Tag className="w-4 h-4 text-purple-600" /> Highlights</h3>
                      <div className="flex flex-wrap gap-2">
                        {place.tags.map((t: string) => <span key={t} className="px-4 py-2 bg-purple-50 text-purple-700 rounded-full font-poppins text-sm">{t}</span>)}
                      </div>
                    </div>
                  )}
                </div>

                {place.coordinates && (
                  <div className="lg:sticky lg:top-32">
                    <PlaceQuickInsights
                      lat={place.coordinates.lat}
                      lng={place.coordinates.lng}
                      bestTime={place.bestTime}
                    />
                  </div>
                )}
              </div>
            </section>

            {/* History & background — Wikipedia summary (renders only if available) */}
            <PlaceHistory title={place.title} district={place.district} />

            {/* Plan your visit — live data from OSRM, Open-Elevation, Sunrise-Sunset */}
            {place.coordinates && (
              <PlaceQuickFacts lat={place.coordinates.lat} lng={place.coordinates.lng} />
            )}

            {/* 3-day weather forecast + live air quality (Open-Meteo, no key) */}
            {place.coordinates && (
              <PlaceWeatherForecast lat={place.coordinates.lat} lng={place.coordinates.lng} placeName={place.title} />
            )}

            {/* Photos (real only) */}
            {showGallery && (
              <section id="photos" className="scroll-mt-32">
                <h2 className="font-poppins text-3xl font-bold text-slate-900 mb-5">Photos</h2>
                <PhotoGalleryLightbox images={galleryImages} open={lightboxOpen} index={lightboxIndex} onClose={() => setLightboxOpen(false)} />
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {galleryImages.map((img, idx) => (
                    <div key={idx} className="relative group cursor-pointer overflow-hidden rounded-2xl" onClick={() => { setLightboxOpen(true); setLightboxIndex(idx); }}>
                      <ImageWithFallback src={img.src} alt={img.alt} className="w-full h-52 object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                        <Camera className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Logistics — Fly / Rail / Drive premium 3-card grid + the
                existing per-place transport guide below it. */}
            <section id="getting-there" className="scroll-mt-32">
              <div className="mb-3">
                <h2 className="font-poppins text-3xl font-bold text-slate-900">How to reach {place.title}</h2>
                <p className="font-poppins text-sm text-slate-500 mt-1">Nearest gateways and a live drive estimate from Kolkata.</p>
              </div>
              {place.coordinates && (
                <PlaceLogistics
                  lat={place.coordinates.lat}
                  lng={place.coordinates.lng}
                  region={place.region}
                  district={place.district}
                  placeName={place.title}
                />
              )}
              <div className="mt-6">
                <TransportGuideSection destinationSlug={place.slug} />
              </div>
            </section>

            {/* Stay */}
            <section id="stay" className="scroll-mt-32">
              <HotelsSection destinationSlug={place.slug} />
            </section>

            {/* Nearby restaurants (names are real; image is a neutral placeholder) */}
            {restaurants.length > 0 && (
              <section className="scroll-mt-32">
                <h2 className="font-poppins text-2xl font-bold text-slate-900 mb-5">Where to eat nearby</h2>
                <div className="flex flex-wrap gap-2">
                  {restaurants.map((r: { name: string }) => (
                    <a key={r.name}
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${r.name}, ${place.district || place.region}, West Bengal`)}`}
                      target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 rounded-full font-poppins text-sm text-gray-700 hover:border-rose-300 hover:text-rose-600 transition-colors">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />{r.name}
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* Reviews */}
            <section id="reviews" className="scroll-mt-32">
              <ReviewsSystem destinationSlug={place.slug} destinationName={place.title} />
            </section>

            {/* Around here — live amenities (ATMs/hospitals/police/fuel) from OpenStreetMap */}
            {place.coordinates && (
              <PlaceNearbyAmenities lat={place.coordinates.lat} lng={place.coordinates.lng} placeName={place.title} />
            )}

            {/* Nearby */}
            <section id="nearby" className="scroll-mt-32">
              <NearbyPlacesSection destinationSlug={place.slug} />
              {nearbyPlaces.length > 0 && (
                <div className="mt-10">
                  <TravelSectionRow
                    title={`More in ${place.region}`}
                    subtitle="Other places worth pairing on the same trip"
                    count={nearbyPlaces.length}
                  >
                    {nearbyPlaces.map((np) => (
                      <PremiumPlaceCard
                        key={np.slug}
                        title={np.title}
                        image={np.heroImage?.url}
                        href={`/explore/${np.slug}`}
                        location={np.district || np.region}
                        rating={np.rating}
                        fallbackKind="place"
                      />
                    ))}
                  </TravelSectionRow>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Premium "Explore the area" — interactive OSM map with togglable
                Food / Stays / Parks / ATMs / Hospitals / Fuel / Police layers
                fetched live from Overpass. Takes the prime sidebar slot. */}
            {place.coordinates && (
              <Suspense fallback={<div className="h-[460px] rounded-3xl bg-gray-100 animate-pulse" />}>
                <PlaceInteractiveMap lat={place.coordinates.lat} lng={place.coordinates.lng} placeName={place.title} />
              </Suspense>
            )}

            {/* Current weather — now BELOW the explore-area map */}
            <LiveWeather lat={place.coordinates.lat} lon={place.coordinates.lng} cityName={place.title} bestTime={place.bestTime} />

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 sticky top-32">
              <h3 className="font-poppins text-lg font-bold text-slate-900 mb-4">Quick info</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3"><MapPin className="w-5 h-5 text-purple-600 mt-0.5" /><div><div className="text-xs text-gray-500 font-poppins">Location</div><div className="font-poppins text-sm text-slate-800">{place.district}, {place.region}</div></div></div>
                <div className="flex items-start gap-3"><Calendar className="w-5 h-5 text-purple-600 mt-0.5" /><div><div className="text-xs text-gray-500 font-poppins">Best time</div><div className="font-poppins text-sm text-slate-800">{place.bestTime}</div></div></div>
                <div className="flex items-start gap-3"><Clock className="w-5 h-5 text-purple-600 mt-0.5" /><div><div className="text-xs text-gray-500 font-poppins">From</div><div className="font-poppins text-sm text-purple-600 font-semibold">{place.priceFrom || 'Free'}</div></div></div>
              </div>
              <button onClick={() => scrollTo('booking-section')} className="w-full mt-5 bg-purple-600 text-white py-3 rounded-full hover:bg-purple-700 transition-colors font-poppins font-medium text-sm">Plan your visit</button>
              <button onClick={openGoogleMaps} className="w-full mt-2 border border-gray-200 text-gray-700 py-3 rounded-full hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 font-poppins text-sm"><Navigation className="w-4 h-4" /> Get directions</button>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('bt:ask-ai', { detail: { message: `Tell me about ${place.title} in ${place.district}, West Bengal — best time to visit, how to reach, what to see nearby, and tips for visiting.` } }))}
                className="w-full mt-2 border border-purple-200 text-purple-700 py-3 rounded-full hover:bg-purple-50 transition-colors flex items-center justify-center gap-2 font-poppins text-sm font-medium">
                <Sparkles className="w-4 h-4" /> Ask AI about this place
              </button>
              <ShareButton title={place.title} description={place.excerpt} className="mt-3 w-full flex justify-center" />
            </div>

            {place.tags?.length > 0 && (
              <div className="bg-gradient-to-br from-purple-50 to-orange-50 rounded-3xl p-6 border border-purple-100">
                <h3 className="font-poppins text-lg font-bold text-slate-900 mb-3">Experience</h3>
                <div className="flex flex-wrap gap-2">
                  {place.tags.slice(0, 6).map((t: string) => <span key={t} className="px-3 py-1 bg-white rounded-full text-sm text-gray-700 shadow-sm font-poppins">{t}</span>)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* AI travel tips */}
        <div className="mt-14">
          <AiFaq slug={place.slug} name={place.title} />
        </div>

        {/* Booking */}
        <div id="booking-section" className="mt-14 scroll-mt-32">
          <BookingSystem destinationSlug={place.slug} destinationName={place.title} destinationImage={place.heroImage.url} basePrice={parseInt(String(place.priceFrom).replace(/[^0-9]/g, '') || '2500')} />
        </div>

        <div className="mt-10 mb-4"><ReportIssueButton slug={place.slug} /></div>
      </div>

      {/* Spacer so content isn't hidden behind the mobile CTA bar */}
      <div className="h-20 lg:hidden" />

      {/* Sticky mobile CTA bar — always-visible Book / Save */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 px-4 py-3 flex items-center gap-3 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
        <div className="shrink-0">
          <p className="text-[11px] text-gray-500 font-poppins leading-none mb-0.5">From</p>
          <p className="text-base font-poppins font-bold text-slate-900 leading-none">{place.priceFrom || 'Contact'}</p>
        </div>
        <button onClick={toggleSave} aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
          className="w-11 h-11 rounded-full border border-gray-200 flex items-center justify-center shrink-0 active:scale-95 transition-transform">
          <Heart className={`w-5 h-5 ${saved ? 'fill-rose-500 text-rose-500' : 'text-gray-600'}`} />
        </button>
        <button
          onClick={() => document.getElementById('booking-section')?.scrollIntoView({ behavior: 'smooth' })}
          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-poppins font-semibold text-sm py-3 rounded-full active:scale-[0.98] transition-transform"
        >
          Book now
        </button>
      </div>
    </div>
  );
}

export default PlaceDetailPage;
