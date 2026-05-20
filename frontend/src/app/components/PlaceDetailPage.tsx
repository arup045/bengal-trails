import { API_BASE } from '../utils/api';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MapPin, Star, Users, Calendar, ChevronRight, Navigation, Share2, Facebook, Twitter, MessageCircle, Copy, Camera, Heart, Clock, ExternalLink } from 'lucide-react';
import { placesData } from '../data/places-full';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { buildSrcSet, DEFAULT_SIZES } from '../utils/responsiveImage';
import { LiveWeather } from './LiveWeather';
import { TransportGuideSection } from './TransportGuideSection';
import { HotelsSection } from './HotelsSection';
import { NearbyPlacesSection } from './NearbyPlacesSection';
import { ShareButton } from './ShareButton';
import { PhotoGalleryLightbox } from './PhotoGalleryLightbox';
import { ReviewsSystem } from './ReviewsSystem';
import { BookingSystem } from './BookingSystem';
import { BookingModal } from './BookingModal';
import { ReportIssueButton } from './ReportIssueButton';

interface PlaceDetailPageProps {
  slug: string;
}

export function PlaceDetailPage({ slug }: PlaceDetailPageProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [apiPlace, setApiPlace] = useState<any | null>(null);

  const fetchPlace = () => {
    if (!slug) return;
    fetch(`${API_BASE}/destinations/${slug}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d?.destination) return;
        const dest = d.destination;
        setApiPlace({
          ...dest,
          title: dest.name,
          slug: dest.slug,
          image: (dest.imageUrl || dest.image_url),
          heroImage: {
            url: (dest.imageUrl || dest.image_url) || 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1200',
            alt: dest.name || 'Destination photo',
          },
          gallery: Array.isArray((dest.galleryImages || dest.gallery_images)) ? (dest.galleryImages || dest.gallery_images) : [],
          excerpt: (dest.shortDescription || dest.short_description) || dest.description?.slice(0, 160) || '',
          description: dest.description || '',
          region: dest.region || 'Bengal',
          district: dest.district || dest.region || 'West Bengal',
          coordinates: (dest.latitude && dest.longitude)
            ? { lat: parseFloat(dest.latitude), lng: parseFloat(dest.longitude) }
            : { lat: 22.5726, lng: 88.3639 },
          tags: Array.isArray(dest.highlights) && dest.highlights.length ? dest.highlights
                : Array.isArray(dest.activities) ? dest.activities
                : (dest.category ? [dest.category] : []),
          priceFrom: (dest.priceRange || dest.price_range) || ((dest.priceFrom || dest.price_from) ? `₹${(dest.priceFrom || dest.price_from).toLocaleString('en-IN')}` : 'Free'),
          rating: parseFloat(dest.rating) || 0,
          reviewsCount: (dest.reviewCount || dest.review_count) || 0,
          bestTime: (dest.bestTimeToVisit || dest.best_time_to_visit) || 'Oct–Mar',
          nearbyRestaurants: Array.isArray(dest.nearbyRestaurants) ? dest.nearbyRestaurants : [],
        });
      })
      .catch(() => { setIsLoading(false); });
  };

  useEffect(() => { fetchPlace(); }, [slug]);

  // Refresh rating + review count when ANY review changes on this page
  useEffect(() => {
    const handler = (e: any) => {
      // Only refresh if the change relates to this destination (or no slug = unknown source)
      if (!e?.detail?.slug || e.detail.slug === slug) fetchPlace();
    };
    window.addEventListener('bt:review-changed', handler);
    return () => window.removeEventListener('bt:review-changed', handler);
  }, [slug]);
  const staticPlace = placesData.find(p => p.slug === slug);
  // Clear loading once we have either API or static data
  if ((apiPlace || staticPlace) && isLoading) setIsLoading(false);
  const place = apiPlace || staticPlace;

  // Skeleton while fetching
  if (isLoading && !place) {
    return (
      <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-24 pb-16 animate-pulse">
        <div className="h-72 sm:h-[440px] bg-gray-200 rounded-3xl mb-8" />
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-3">
            <div className="h-8  bg-gray-200 rounded-xl w-2/3" />
            <div className="h-4  bg-gray-200 rounded-xl w-1/3" />
            <div className="h-4  bg-gray-200 rounded-xl w-full mt-4" />
            <div className="h-4  bg-gray-200 rounded-xl w-5/6" />
            <div className="h-4  bg-gray-200 rounded-xl w-4/6" />
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
          <h2 className="text-3xl mb-4">Place not found</h2>
          <p className="text-gray-600 mb-4">Sorry, we couldn't find the destination you're looking for.</p>
          <a href="#/explore" className="text-purple-600 hover:underline text-lg">
            ← Back to Explore
          </a>
        </div>
      </div>
    );
  }

  // Track recently viewed
  useEffect(() => {
    const recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    const filtered = recentlyViewed.filter((item: any) => item.slug !== slug);
    const updated = [{ slug, title: place.title, image: place.heroImage.url, region: place.region }, ...filtered].slice(0, 10);
    localStorage.setItem('recentlyViewed', JSON.stringify(updated));
  }, [slug, place]);

  // Google Maps deep link function
  const openGoogleMaps = () => {
    const { lat, lng } = place.coordinates;
    // Using coordinates for precise location
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodeURIComponent(place.title)}`;
    window.open(mapsUrl, '_blank');
  };

  // Social Share Functions
  const shareOnFacebook = () => {
    const url = window.location.href;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  };

  const shareOnTwitter = () => {
    const url = window.location.href;
    const text = `Check out ${place.title} - ${place.excerpt}`;
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareOnWhatsApp = () => {
    const url = window.location.href;
    const text = `Check out ${place.title} on Bengal Trails: ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
    setShowShareMenu(false);
  };

  // Find nearby places (same region)
  const nearbyPlaces = placesData
    .filter(p => p.slug !== slug && p.region === place.region)
    .slice(0, 4);

  // Generate gallery images from place data
  const galleryImages = [
    { src: place.heroImage.url, alt: place.heroImage.alt },
    { src: `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800`, alt: `${place.title} landscape view` },
    { src: `https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800`, alt: `${place.title} scenic beauty` },
    { src: `https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800`, alt: `${place.title} nature` },
    { src: `https://images.unsplash.com/photo-1605640840605-14ac1855827b?w=800`, alt: `${place.title} attractions` },
    { src: `https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800`, alt: `${place.title} local culture` },
    { src: `https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?w=800`, alt: `${place.title} heritage` },
    { src: `https://images.unsplash.com/photo-1590906424086-3dbc808fd54b?w=800`, alt: `${place.title} festivals` },
    { src: `https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800`, alt: `${place.title} architecture` }
  ];

  // Mock restaurants data
  const restaurants = place.nearbyRestaurants.map((name, idx) => ({
    name,
    rating: 4.2 + Math.random() * 0.8,
    cuisine: ['Bengali', 'North Indian', 'Chinese', 'Continental'][idx % 4],
    price: Math.floor(300 + Math.random() * 700),
    image: 'https://images.unsplash.com/photo-1588644525273-f37b60d78512?w=800',
    distance: (Math.random() * 3).toFixed(1)
  }));

  // Mock current festivals (if tags include festival-related)
  const hasFestival = place.tags.some(tag => 
    tag.toLowerCase().includes('festival') || 
    tag.toLowerCase().includes('puja') || 
    tag.toLowerCase().includes('mela')
  );

  const festivals = hasFestival ? [
    {
      name: 'Durga Puja',
      date: 'October 2024',
      description: 'Grand celebration with elaborate pandals and cultural performances',
      image: 'https://images.unsplash.com/photo-1590906424086-3dbc808fd54b?w=800'
    }
  ] : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-[70vh] overflow-hidden">
        <ImageWithFallback
          src={place.heroImage.url}
          alt={place.heroImage.alt}
          className="w-full h-full object-cover"
          loading="eager"
          decoding="async"
          srcSet={buildSrcSet(place.heroImage.url)}
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        
        {/* Hero Content */}
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-7xl mx-auto w-full px-6 pb-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-white/80 mb-4">
                <a href="#/" className="hover:text-white">Home</a>
                <ChevronRight className="w-4 h-4" />
                <a href="#/explore" className="hover:text-white">Explore</a>
                <ChevronRight className="w-4 h-4" />
                <span className="text-white">{place.title}</span>
              </div>

              {/* Title */}
              <h1 className="text-5xl md:text-6xl text-white mb-4">{place.title}</h1>
              
              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-6 text-white/90 mb-6">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span>{place.district}, {place.region}</span>
                </div>
                {place.rating && (
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <span>{place.rating} ({place.reviewsCount?.toLocaleString()} reviews)</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span>Best: {place.bestTime}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`px-6 py-3 rounded-full backdrop-blur-md transition-all ${
                    isFavorite 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  <Heart className={`w-5 h-5 inline mr-2 ${isFavorite ? 'fill-white' : ''}`} />
                  {isFavorite ? 'Saved' : 'Save'}
                </button>
                <div className="relative">
                  <button 
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className="px-6 py-3 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition-all"
                  >
                    <Share2 className="w-5 h-5 inline mr-2" />
                    Share
                  </button>
                  {showShareMenu && (
                    <div className="absolute top-full mt-2 right-0 bg-white rounded-2xl shadow-2xl p-3 z-50 min-w-[200px]">
                      <button onClick={shareOnFacebook} className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-50 rounded-xl transition-colors text-gray-700">
                        <Facebook className="w-5 h-5 text-blue-600" />
                        <span>Facebook</span>
                      </button>
                      <button onClick={shareOnTwitter} className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-50 rounded-xl transition-colors text-gray-700">
                        <Twitter className="w-5 h-5 text-sky-500" />
                        <span>Twitter</span>
                      </button>
                      <button onClick={shareOnWhatsApp} className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-50 rounded-xl transition-colors text-gray-700">
                        <MessageCircle className="w-5 h-5 text-green-600" />
                        <span>WhatsApp</span>
                      </button>
                      <button onClick={copyLink} className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-50 rounded-xl transition-colors text-gray-700">
                        <Copy className="w-5 h-5 text-purple-600" />
                        <span>Copy Link</span>
                      </button>
                    </div>
                  )}
                </div>
                <button className="px-6 py-3 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition-all" onClick={openGoogleMaps}>
                  <Navigation className="w-5 h-5 inline mr-2" />
                  Directions
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="flex gap-4 mb-8 border-b border-gray-200 overflow-x-auto">
              {['overview', 'photos', 'reviews', 'transport', 'nearby', 'hotels', 'restaurants'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 px-2 capitalize transition-colors whitespace-nowrap ${
                    activeTab === tab
                      ? 'border-b-2 border-purple-600 text-purple-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                {/* Description */}
                <div>
                  <h2 className="text-3xl mb-4">About {place.title}</h2>
                  <p className="text-gray-600 text-lg leading-relaxed mb-4">{place.description}</p>
                  <p className="text-gray-600 leading-relaxed">{place.excerpt}</p>
                </div>

                {/* Tags */}
                <div>
                  <h3 className="text-xl mb-3">Highlights</h3>
                  <div className="flex flex-wrap gap-3">
                    {place.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-4 py-2 bg-purple-50 text-purple-600 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Current Festivals */}
                {festivals.length > 0 && (
                  <div>
                    <h3 className="text-xl mb-4">🎉 Upcoming Festivals</h3>
                    {festivals.map((festival) => (
                      <div key={festival.name} className="bg-white rounded-2xl p-6 shadow-lg">
                        <div className="flex gap-6">
                          <ImageWithFallback
                            src={festival.image}
                            alt={festival.name}
                            className="w-32 h-32 rounded-xl object-cover"
                          />
                          <div className="flex-1">
                            <h4 className="text-2xl mb-2">{festival.name}</h4>
                            <p className="text-purple-600 mb-2">{festival.date}</p>
                            <p className="text-gray-600">{festival.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Photos Tab */}
            {activeTab === 'photos' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-3xl mb-6">Photo Gallery</h2>
                  <p className="text-gray-600 mb-6">Explore beautiful views and moments from {place.title}</p>
                </div>

                <PhotoGalleryLightbox
                  images={galleryImages}
                  open={lightboxOpen}
                  index={lightboxIndex}
                  onClose={() => setLightboxOpen(false)}
                />
                
                <div className="grid md:grid-cols-3 gap-4">
                  {galleryImages.map((img, idx) => (
                    <div 
                      key={idx} 
                      className="relative group cursor-pointer overflow-hidden rounded-xl"
                      onClick={() => {
                        setLightboxOpen(true);
                        setLightboxIndex(idx);
                      }}
                    >
                      <ImageWithFallback
                        src={img.src}
                        alt={img.alt}
                        className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="w-12 h-12 text-white" />
                      </div>
                      <div className="absolute bottom-3 left-3 right-3 text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                        {img.alt}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                
              </motion.div>
            )}

            {/* Transportation Tab */}
            {activeTab === 'transport' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
             <TransportGuideSection destinationSlug={place.slug} />
              </motion.div>
            )}

            {/* Nearby Places Tab */}
            {activeTab === 'nearby' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <NearbyPlacesSection destinationSlug={place.slug} />
                <h2 className="text-3xl mb-4 mt-8">More in this region</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {nearbyPlaces.map((nearbyPlace) => (
                    <a
                      key={nearbyPlace.slug}
                      href={`#/explore/${nearbyPlace.slug}`}
                      className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
                    >
                      <ImageWithFallback
                        src={nearbyPlace.heroImage.url}
                        alt={nearbyPlace.heroImage.alt}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <h3 className="text-xl mb-2">{nearbyPlace.title}</h3>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{nearbyPlace.excerpt}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-purple-600">{nearbyPlace.priceFrom || 'Free'}</span>
                          {nearbyPlace.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                              <span className="text-sm">{nearbyPlace.rating}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Hotels Tab */}
            {activeTab === 'hotels' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <HotelsSection destinationSlug={place.slug} />
              </motion.div>
            )}

            {/* Restaurants Tab */}
            {activeTab === 'restaurants' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h2 className="text-3xl mb-4">Nearby Restaurants</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {restaurants.map((restaurant) => (
                    <div key={restaurant.name} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all">
                      <ImageWithFallback
                        src={restaurant.image}
                        alt={restaurant.name}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-xl">{restaurant.name}</h3>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span className="text-sm">{restaurant.rating.toFixed(1)}</span>
                          </div>
                        </div>
                        <p className="text-purple-600 mb-2">{restaurant.cuisine}</p>
                        <p className="text-gray-600 text-sm mb-4">{restaurant.distance} km away</p>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700">₹{restaurant.price} for two</span>
                          <button className="text-purple-600 hover:text-purple-700 flex items-center gap-1">
                            View Menu
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Live Weather Widget — real data from Open-Meteo */}
            <LiveWeather
              lat={place.coordinates.lat}
              lon={place.coordinates.lng}
              cityName={place.title}
              bestTime={place.bestTime}
            />

            {/* Quick Info Card */}
            <div className="bg-white rounded-2xl p-6 shadow-lg sticky top-24">
              <h3 className="text-xl mb-4">Quick Info</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-purple-600 mt-1" />
                  <div>
                    <div className="text-sm text-gray-500">Location</div>
                    <div>{place.district}, {place.region}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-purple-600 mt-1" />
                  <div>
                    <div className="text-sm text-gray-500">Best Time</div>
                    <div>{place.bestTime}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-purple-600 mt-1" />
                  <div>
                    <div className="text-sm text-gray-500">Entry Fee</div>
                    <div className="text-purple-600">{place.priceFrom || 'Free'}</div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => document.getElementById('booking-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full mt-5 bg-purple-600 text-white py-3 rounded-full hover:bg-purple-700 transition-colors font-poppins font-medium text-sm"
              >
                Plan Your Visit
              </button>
              <button 
                onClick={openGoogleMaps}
                className="w-full mt-2 border border-gray-200 text-gray-700 py-3 rounded-full hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 font-poppins text-sm"
              >
                <Navigation className="w-5 h-5" />
                Get Directions
              </button>
              <ShareButton
                title={place.title}
                description={place.excerpt}
                className="mt-3 w-full flex justify-center"
              />
            </div>

            {/* Popular Tags */}
            <div className="bg-gradient-to-br from-purple-50 to-orange-50 rounded-2xl p-6">
              <h3 className="text-xl mb-4">Experience</h3>
              <div className="flex flex-wrap gap-2">
                {place.tags.slice(0, 6).map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-white rounded-full text-sm text-gray-700 shadow-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Reviews & Ratings Section */}
        <div className="max-w-7xl mx-auto px-6 mt-12">
          <ReviewsSystem
            destinationSlug={place.slug}
            destinationName={place.title}
          />
        </div>

        {/* Booking Section */}
        <div id="booking-section" className="max-w-7xl mx-auto px-6 mt-12 scroll-mt-20">
          <BookingSystem
            destinationSlug={place.slug}
            destinationName={place.title}
            destinationImage={place.heroImage.url}
            basePrice={parseInt(place.priceFrom?.replace(/[^0-9]/g, '') || '2500')}
          />
        </div>

        <div className="max-w-7xl mx-auto px-6 mt-10 mb-4">
          <ReportIssueButton slug={place.slug} />
        </div>
      </div>

      {/* Similar Destinations */}
      {nearbyPlaces.length > 0 && (
        <div className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl mb-8">More in {place.region}</h2>
            <div className="grid md:grid-cols-4 gap-6">
              {nearbyPlaces.map((nearbyPlace) => (
                <a
                  key={nearbyPlace.slug}
                  href={`#/explore/${nearbyPlace.slug}`}
                  className="group"
                >
                  <div className="relative h-48 rounded-xl overflow-hidden mb-3">
                    <ImageWithFallback
                      src={nearbyPlace.heroImage.url}
                      alt={nearbyPlace.heroImage.alt}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <h3 className="absolute bottom-3 left-3 text-white text-lg">{nearbyPlace.title}</h3>
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-2">{nearbyPlace.excerpt}</p>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}