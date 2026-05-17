import { API_BASE } from '../utils/api';
import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MapPin, Star, SlidersHorizontal, X, Sparkles, Navigation, Heart, SearchX } from 'lucide-react';
import { placesData, categories, regions } from '../data/places-full';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { toast } from 'sonner';
import { useDebounce } from '../utils/useDebounce';
import { getCurrentLocation, LocationCoords, sortByDistance, formatDistance, getLastKnownLocation } from '../utils/location';
import { LoadingSkeleton, EmptyState } from './LoadingSkeleton';
import { useWishlistSync } from '../utils/useWishlistSync';

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-lg animate-pulse">
      <div className="relative h-64 bg-gray-200"></div>
      <div className="p-6">
        <div className="h-4 bg-gray-200 rounded mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
        <div className="flex gap-2 mb-4">
          <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
          <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="h-6 w-20 bg-gray-200 rounded"></div>
          <div className="h-4 w-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
}

export function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch destinations from API (merge with static — API wins)
  const [apiPlaces, setApiPlaces] = useState<any[] | null>(null);
  useEffect(() => {
    fetch(`${API_BASE}/destinations?limit=300`)
      .then(r => r.ok ? r.json() : null)
      .then(d => d?.destinations && setApiPlaces(d.destinations))
      .catch(() => { /* fall back to static */ });
  }, []);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedRegion, setSelectedRegion] = useState('All Regions');
  const [sortBy, setSortBy] = useState('popular');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState('all');
  const [selectedDuration, setSelectedDuration] = useState('all');
  const [selectedActivity, setSelectedActivity] = useState('all');
  const [selectedSeason, setSelectedSeason] = useState('all');
  const [userLocation, setUserLocation] = useState<LocationCoords | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const ITEMS_PER_PAGE = 24;

  // Use wishlist hook
  const { wishlist, isLoading: wishlistLoading, addToWishlist, removeFromWishlist, isInWishlist } = useWishlistSync();

  // Simulate initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Read search params from URL hash on mount and on hash change
  // Lets the Hero search bar pass ?location=Darjeeling&activity=Hiking through to here
  useEffect(() => {
    const applyHashParams = () => {
      const hash = window.location.hash || '';
      const queryStart = hash.indexOf('?');
      if (queryStart === -1) return;
      const params = new URLSearchParams(hash.slice(queryStart + 1));
      const location = params.get('location');
    const q = params.get('q');
    if (q) setSearchQuery(q);
    const q = params.get('q');
    if (q) setSearchQuery(q);
      const activity = params.get('activity');
      const tourType = params.get('tourType');
      if (location) setSearchQuery(location);
      if (activity && activity !== 'all') setSelectedActivity(activity.toLowerCase());
      if (tourType && tourType !== 'all') setSelectedCategory(tourType);
    };
    applyHashParams();
    window.addEventListener('hashchange', applyHashParams);
    return () => window.removeEventListener('hashchange', applyHashParams);
  }, []);

  // Load last known location on mount
  useEffect(() => {
    const lastLocation = getLastKnownLocation();
    if (lastLocation) {
      setUserLocation(lastLocation);
    }
  }, []);

  const handleGetLocation = async () => {
    setLoadingLocation(true);
    try {
      const coords = await getCurrentLocation();
      setUserLocation(coords);
      localStorage.setItem('last_known_location', JSON.stringify(coords));
      toast.success('Location enabled! Sorting by distance');
      if (sortBy !== 'distance') {
        setSortBy('distance');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to get location');
    } finally {
      setLoadingLocation(false);
    }
  };

  const toggleWishlist = async (e: React.MouseEvent, place: any) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isInWishlist(place.slug)) {
      await removeFromWishlist(place.slug);
      toast.success(`${place.title} removed from wishlist`);
    } else {
      await addToWishlist({
        slug: place.slug,
        title: place.title,
        image: place.heroImage.url,
        region: place.region,
        category: place.category,
        description: place.description,
        price: place.pricing?.basic
      });
      toast.success(`${place.title} added to wishlist`);
    }
  };

  // Filter and sort logic
  const filteredPlaces = useMemo(() => {
    // Use API data if available, else fall back to static
    let filtered: any[] = apiPlaces && apiPlaces.length > 0
      ? apiPlaces.map((p: any) => ({
          ...p,
          // Map every field PlaceDetailPage / ExplorePage / FavoritePlaces / wishlist may access
          title: p.name,
          slug: p.slug,
          image: (p.imageUrl || p.image_url),
          heroImage: { url: (p.imageUrl || p.image_url) || '', alt: p.name || '' },
          excerpt: (p.shortDescription || p.short_description) || (p.description ? p.description.slice(0, 160) : ''),
          description: p.description || '',
          region: p.region || 'Bengal',
          district: p.district || p.region || 'West Bengal',
          tags: Array.isArray(p.highlights) && p.highlights.length ? p.highlights
                : Array.isArray(p.activities) ? p.activities
                : (p.category ? [p.category] : []),
          priceFrom: (p.priceRange || p.price_range) || ((p.priceFrom || p.price_from) ? `₹${Number((p.priceFrom || p.price_from)).toLocaleString('en-IN')}` : 'Free'),
          rating: parseFloat(p.rating) || 0,
          reviewsCount: (p.reviewCount || p.review_count) || 0,
          bestTime: (p.bestTimeToVisit || p.best_time_to_visit) || 'Oct–Mar',
          coordinates: (p.latitude && p.longitude)
            ? { lat: parseFloat(p.latitude), lng: parseFloat(p.longitude) }
            : { lat: 22.5726, lng: 88.3639 },
        }))
      : placesData;

    if (debouncedSearchQuery) {
      filtered = filtered.filter(place =>
        place.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        place.excerpt.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        place.tags.some(tag => tag.toLowerCase().includes(debouncedSearchQuery.toLowerCase())) ||
        place.district.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(place =>
        place.tags.includes(selectedCategory)
      );
    }

    if (selectedRegion !== 'All Regions') {
      filtered = filtered.filter(place => place.region === selectedRegion);
    }

    if (priceRange !== 'all') {
      filtered = filtered.filter(place => {
        const price = place.priceFrom || '';
        if (priceRange === 'free') return price.toLowerCase().includes('free');
        if (priceRange === 'budget') {
          const num = parseInt(price.replace(/[^0-9]/g, ''));
          return num > 0 && num <= 1500;
        }
        if (priceRange === 'mid') {
          const num = parseInt(price.replace(/[^0-9]/g, ''));
          return num > 1500 && num <= 3000;
        }
        if (priceRange === 'luxury') {
          const num = parseInt(price.replace(/[^0-9]/g, ''));
          return num > 3000;
        }
        return true;
      });
    }

    if (sortBy === 'rating') {
      filtered = [...filtered].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'price-low') {
      filtered = [...filtered].sort((a, b) => {
        const priceA = parseInt((a.priceFrom || '0').replace(/[^0-9]/g, ''));
        const priceB = parseInt((b.priceFrom || '0').replace(/[^0-9]/g, ''));
        return priceA - priceB;
      });
    } else if (sortBy === 'reviews') {
      filtered = [...filtered].sort((a, b) => (b.reviewsCount || 0) - (a.reviewsCount || 0));
    } else if (sortBy === 'distance' && userLocation) {
      filtered = [...filtered].sort((a, b) => {
        const distA = sortByDistance(userLocation, a.coordinates);
        const distB = sortByDistance(userLocation, b.coordinates);
        return distA - distB;
      });
    }

    return filtered;
  }, [debouncedSearchQuery, selectedCategory, selectedRegion, sortBy, priceRange, userLocation]);

  // West Bengal destination images for floating cards (18 total)
  const floatingDestinations = [
    { url: "https://images.unsplash.com/photo-1679418536818-7a7fb2db49bc?w=800", title: "Darjeeling Tea Gardens" },
    { url: "https://images.unsplash.com/photo-1697817665440-f988c6d5080f?w=800", title: "Victoria Memorial" },
    { url: "https://images.unsplash.com/photo-1705521680496-d5d7b22c14f7?w=800", title: "Sundarbans" },
    { url: "https://images.unsplash.com/photo-1761408941664-482ae65fd164?w=800", title: "Howrah Bridge" },
    { url: "https://images.unsplash.com/photo-1704788564069-d54cab4169aa?w=800", title: "Temple Architecture" },
    { url: "https://images.unsplash.com/photo-1664109074701-6c95090e852e?w=800", title: "Mountain Landscapes" },
    { url: "https://images.unsplash.com/photo-1728364282744-61ccb6cfe2f9?w=800", title: "Durga Puja" },
    { url: "https://images.unsplash.com/photo-1602320763174-e34d84feae55?w=800", title: "Bengal Tiger" },
    { url: "https://images.unsplash.com/photo-1642503408722-37456a4d763f?w=800", title: "Heritage Buildings" },
    { url: "https://images.unsplash.com/photo-1553337787-17961c0990db?w=800", title: "Tea Plantations" },
    { url: "https://images.unsplash.com/photo-1552912470-ee2e96439539?w=800", title: "Street Food" },
    { url: "https://images.unsplash.com/photo-1622811895178-6e4377539eb3?w=800", title: "Riverside Ghats" },
    { url: "https://images.unsplash.com/photo-1716469963703-b8b13b5a5804?w=800", title: "Kolkata Tram" },
    { url: "https://images.unsplash.com/photo-1752225678386-b37d94971c19?w=800", title: "Sweet Shop" },
    { url: "https://images.unsplash.com/photo-1664636403936-d4d25230c8c6?w=800", title: "Handloom Saree" },
    { url: "https://images.unsplash.com/photo-1657346259456-0f723e944dd0?w=800", title: "Bookstore" },
    { url: "https://images.unsplash.com/photo-1749759426604-063b5effd7a1?w=800", title: "Terrace Garden" },
    { url: "https://images.unsplash.com/photo-1611312410928-bdcb480e6239?w=800", title: "Chai Tea" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Premium Hero Section with Victoria Memorial Background & Floating Cards */}
      <div className="relative text-white py-20 px-6 overflow-hidden">
        {/* Victoria Memorial Background Image */}
        <div className="absolute inset-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1697817665440-f988c6d5080f?w=1920"
            alt="Victoria Memorial Background"
            className="w-full h-full object-cover"
          />
          {/* Black Glass Effect Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/70 to-black/60 backdrop-blur-sm"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(139,92,246,0.15),transparent_70%)]"></div>
        </div>
        
        {/* Floating West Bengal Destination Cards - 18 CARDS */}
        <div className="absolute inset-0 pointer-events-none">
          {/* LEFT SIDE - 6 cards */}
          <motion.div
            initial={{ opacity: 0, y: -30, rotate: -6 }}
            animate={{ opacity: 1, y: 0, rotate: -6 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="absolute left-6 top-6 w-24 h-36 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/30"
          >
            <ImageWithFallback src={floatingDestinations[0].url} alt={floatingDestinations[0].title} className="w-full h-full object-cover" />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-1.5">
              <p className="text-[10px] text-white">{floatingDestinations[0].title}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -30, rotate: 4 }}
            animate={{ opacity: 1, x: 0, rotate: 4 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="absolute left-4 top-48 w-20 h-28 rounded-xl overflow-hidden shadow-2xl border-2 border-white/30"
          >
            <ImageWithFallback src={floatingDestinations[1].url} alt={floatingDestinations[1].title} className="w-full h-full object-cover" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30, rotate: -8 }}
            animate={{ opacity: 1, y: 0, rotate: -8 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="absolute left-8 bottom-16 w-28 h-32 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/30"
          >
            <ImageWithFallback src={floatingDestinations[2].url} alt={floatingDestinations[2].title} className="w-full h-full object-cover" />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-1.5">
              <p className="text-[10px] text-white">{floatingDestinations[2].title}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -12 }}
            animate={{ opacity: 1, scale: 1, rotate: -12 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="absolute left-40 top-12 w-20 h-32 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/30 hidden md:block"
          >
            <ImageWithFallback src={floatingDestinations[3].url} alt={floatingDestinations[3].title} className="w-full h-full object-cover" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: 6 }}
            animate={{ opacity: 1, scale: 1, rotate: 6 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="absolute left-32 top-56 w-18 h-24 rounded-xl overflow-hidden shadow-2xl border-2 border-white/30 hidden lg:block"
          >
            <ImageWithFallback src={floatingDestinations[4].url} alt={floatingDestinations[4].title} className="w-full h-full object-cover" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, rotate: -10 }}
            animate={{ opacity: 1, rotate: -10 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="absolute left-52 bottom-24 w-16 h-24 rounded-xl overflow-hidden shadow-2xl border-2 border-white/30 hidden xl:block"
          >
            <ImageWithFallback src={floatingDestinations[5].url} alt={floatingDestinations[5].title} className="w-full h-full object-cover" />
          </motion.div>

          {/* RIGHT SIDE - 6 cards */}
          <motion.div
            initial={{ opacity: 0, y: -30, rotate: 6 }}
            animate={{ opacity: 1, y: 0, rotate: 6 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="absolute right-6 top-10 w-32 h-40 rounded-3xl overflow-hidden shadow-2xl border-2 border-white/30"
          >
            <ImageWithFallback src={floatingDestinations[6].url} alt={floatingDestinations[6].title} className="w-full h-full object-cover" />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-2">
              <p className="text-[10px] text-white">{floatingDestinations[6].title}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30, rotate: -8 }}
            animate={{ opacity: 1, x: 0, rotate: -8 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="absolute right-4 top-56 w-24 h-24 rounded-xl overflow-hidden shadow-2xl border-2 border-white/30"
          >
            <ImageWithFallback src={floatingDestinations[7].url} alt={floatingDestinations[7].title} className="w-full h-full object-cover" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30, rotate: 10 }}
            animate={{ opacity: 1, y: 0, rotate: 10 }}
            transition={{ duration: 0.8, delay: 0.35 }}
            className="absolute right-10 bottom-12 w-28 h-44 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/30"
          >
            <ImageWithFallback src={floatingDestinations[8].url} alt={floatingDestinations[8].title} className="w-full h-full object-cover" />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-1.5">
              <p className="text-[10px] text-white">{floatingDestinations[8].title}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: 10 }}
            animate={{ opacity: 1, scale: 1, rotate: 10 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="absolute right-40 top-16 w-24 h-28 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/30 hidden md:block"
          >
            <ImageWithFallback src={floatingDestinations[9].url} alt={floatingDestinations[9].title} className="w-full h-full object-cover" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -6 }}
            animate={{ opacity: 1, scale: 1, rotate: -6 }}
            transition={{ duration: 0.8, delay: 0.55 }}
            className="absolute right-36 top-60 w-20 h-20 rounded-xl overflow-hidden shadow-2xl border-2 border-white/30 hidden lg:block"
          >
            <ImageWithFallback src={floatingDestinations[10].url} alt={floatingDestinations[10].title} className="w-full h-full object-cover" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, rotate: 12 }}
            animate={{ opacity: 1, rotate: 12 }}
            transition={{ duration: 0.8, delay: 0.65 }}
            className="absolute right-52 bottom-32 w-22 h-28 rounded-xl overflow-hidden shadow-2xl border-2 border-white/30 hidden xl:block"
          >
            <ImageWithFallback src={floatingDestinations[11].url} alt={floatingDestinations[11].title} className="w-full h-full object-cover" />
          </motion.div>

          {/* EXTRA CENTER CARDS - 6 more cards */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, rotate: -5 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="absolute left-1/4 top-8 w-20 h-28 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/30 hidden lg:block"
          >
            <ImageWithFallback src={floatingDestinations[12].url} alt={floatingDestinations[12].title} className="w-full h-full object-cover" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: 8 }}
            animate={{ opacity: 1, scale: 1, rotate: 8 }}
            transition={{ duration: 0.8, delay: 0.75 }}
            className="absolute right-1/4 top-12 w-22 h-32 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/30 hidden lg:block"
          >
            <ImageWithFallback src={floatingDestinations[13].url} alt={floatingDestinations[13].title} className="w-full h-full object-cover" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: -10 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="absolute left-1/3 bottom-20 w-18 h-26 rounded-xl overflow-hidden shadow-2xl border-2 border-white/30 hidden xl:block"
          >
            <ImageWithFallback src={floatingDestinations[14].url} alt={floatingDestinations[14].title} className="w-full h-full object-cover" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: 12 }}
            animate={{ opacity: 1, scale: 1, rotate: 12 }}
            transition={{ duration: 0.8, delay: 0.85 }}
            className="absolute right-1/3 bottom-16 w-20 h-28 rounded-xl overflow-hidden shadow-2xl border-2 border-white/30 hidden xl:block"
          >
            <ImageWithFallback src={floatingDestinations[15].url} alt={floatingDestinations[15].title} className="w-full h-full object-cover" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: -7 }}
            animate={{ opacity: 1, scale: 1, rotate: -7 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="absolute left-1/4 top-40 w-16 h-22 rounded-xl overflow-hidden shadow-2xl border-2 border-white/30 hidden 2xl:block"
          >
            <ImageWithFallback src={floatingDestinations[16].url} alt={floatingDestinations[16].title} className="w-full h-full object-cover" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: 9 }}
            animate={{ opacity: 1, scale: 1, rotate: 9 }}
            transition={{ duration: 0.8, delay: 0.95 }}
            className="absolute right-1/4 bottom-40 w-18 h-24 rounded-xl overflow-hidden shadow-2xl border-2 border-white/30 hidden 2xl:block"
          >
            <ImageWithFallback src={floatingDestinations[17].url} alt={floatingDestinations[17].title} className="w-full h-full object-cover" />
          </motion.div>
        </div>

        {/* Content Container */}
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Premium Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-10"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 mb-5"
            >
              <Sparkles className="w-4 h-4 text-purple-300" />
              <span className="text-sm text-white/90">Premium Travel Experience</span>
            </motion.div>
            
            <h1 className="text-5xl md:text-6xl mb-5 bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
              Discover Your
              <br />
              <span className="text-purple-300">Next Destination</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto leading-relaxed">
              Trusted by travelers and explorers from various destinations.
              <br />
              <span className="text-purple-200">Explore the authentic beauty of West Bengal.</span>
            </p>
          </motion.div>

          {/* Premium Glassmorphism Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="max-w-3xl mx-auto mb-12"
          >
            <div className="relative backdrop-blur-md bg-white/10 rounded-full p-3 shadow-2xl border-2 border-white/30">
              <Search className="absolute left-8 top-1/2 -translate-y-1/2 w-6 h-6 text-white/90" />
              <input
                type="text"
                placeholder="Search destinations, experiences, or activities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-16 pr-8 py-4 bg-transparent text-white placeholder-white/60 text-lg focus:outline-none rounded-full"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-8 top-1/2 -translate-y-1/2 text-white/80 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </motion.div>

          {/* Premium Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-wrap justify-center gap-6"
          >
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="backdrop-blur-md bg-white/10 rounded-2xl px-8 py-5 border border-white/20 shadow-xl"
            >
              <div className="text-4xl mb-1 bg-gradient-to-r from-purple-300 to-white bg-clip-text text-transparent">97+</div>
              <div className="text-white/80 text-sm">Destinations</div>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="backdrop-blur-md bg-white/10 rounded-2xl px-8 py-5 border border-white/20 shadow-xl"
            >
              <div className="text-4xl mb-1 bg-gradient-to-r from-blue-300 to-white bg-clip-text text-transparent">6</div>
              <div className="text-white/80 text-sm">Regions</div>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="backdrop-blur-md bg-white/10 rounded-2xl px-8 py-5 border border-white/20 shadow-xl"
            >
              <div className="text-4xl mb-1 bg-gradient-to-r from-pink-300 to-white bg-clip-text text-transparent">50+</div>
              <div className="text-white/80 text-sm">Experiences</div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="sticky top-0 z-40 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                showFilters ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                  selectedCategory === category
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="grid md:grid-cols-3 gap-4 pt-4 border-t mt-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Region</label>
                    <select
                      value={selectedRegion}
                      onChange={(e) => setSelectedRegion(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {regions.map((region) => (
                        <option key={region} value={region}>{region}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Sort By</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="popular">Most Popular</option>
                      <option value="rating">Highest Rated</option>
                      <option value="reviews">Most Reviewed</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="distance">Distance from me</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Price Range</label>
                    <select
                      value={priceRange}
                      onChange={(e) => setPriceRange(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="all">All Prices</option>
                      <option value="free">Free Entry</option>
                      <option value="budget">Budget (₹0-1,500)</option>
                      <option value="mid">Mid-range (₹1,500-3,000)</option>
                      <option value="luxury">Luxury (₹3,000+)</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Results Count */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <p className="text-gray-600">
            Showing <span className="text-purple-600">{filteredPlaces.length}</span> destinations
            {searchQuery && <span> for "{searchQuery}"</span>}
          </p>
          {(searchQuery || selectedCategory !== 'All' || selectedRegion !== 'All Regions' || priceRange !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedRegion('All Regions');
                setPriceRange('all');
              }}
              className="text-purple-600 hover:text-purple-700 flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Places Grid */}
      <div className="max-w-7xl mx-auto px-6 pb-20">
        {filteredPlaces.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl mb-2">No destinations found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your filters or search query</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedRegion('All Regions');
                setPriceRange('all');
              }}
              className="bg-purple-600 text-white px-6 py-3 rounded-full hover:bg-purple-700 transition-colors"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPlaces.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((place, index) => (
              <motion.div
                key={place.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                <a href={`#/explore/${place.slug}`} className="block">
                  <div className="relative h-64 overflow-hidden">
                    <ImageWithFallback
                      src={place.heroImage.url}
                      alt={place.heroImage.alt}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    
                    <div className="absolute top-4 left-4">
                      <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-purple-600" />
                        {place.region}
                      </span>
                    </div>

                    {/* Wishlist Button */}
                    <button
                      onClick={(e) => toggleWishlist(e, place)}
                      className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2.5 rounded-full shadow-lg hover:scale-110 transition-all z-10"
                      title={isInWishlist(place.slug) ? "Remove from Wishlist" : "Add to Wishlist"}
                    >
                      <Heart 
                        className={`w-5 h-5 transition-all ${
                          isInWishlist(place.slug) 
                            ? 'text-red-500 fill-red-500' 
                            : 'text-gray-600 hover:text-red-500'
                        }`} 
                      />
                    </button>

                    {place.rating && (
                      <div className="absolute top-4 right-16 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm">{place.rating}</span>
                      </div>
                    )}

                    {/* Get Directions Button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        const { lat, lng } = place.coordinates;
                        const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodeURIComponent(place.title)}`;
                        window.open(mapsUrl, '_blank');
                      }}
                      className="absolute bottom-20 right-4 bg-purple-600 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-purple-700 hover:scale-110 shadow-xl z-10"
                      title="Get Directions"
                    >
                      <Navigation className="w-5 h-5" />
                    </button>

                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-2xl text-white mb-1">{place.title}</h3>
                      <p className="text-purple-200 text-sm">{place.district}</p>
                    </div>
                  </div>

                  <div className="p-6">
                    <p className="text-gray-600 mb-4 line-clamp-2">{place.excerpt}</p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {place.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div>
                        <div className="text-sm text-gray-500">Starting from</div>
                        <div className="text-lg text-purple-600">{place.priceFrom || 'Free'}</div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {place.reviewsCount && `${place.reviewsCount.toLocaleString()} reviews`}
                      </div>
                    </div>

                    <div className="mt-3 text-sm text-gray-500 flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      Best: {place.bestTime}
                    </div>
                  </div>
                </a>
              </motion.div>
            ))}
          </div>
        )}
        {/* Pagination Controls */}
        {filteredPlaces.length > ITEMS_PER_PAGE && (
          <div className="flex items-center justify-center gap-4 mt-12">
            <button
              onClick={() => {
                setCurrentPage(prev => Math.max(1, prev - 1));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              disabled={currentPage === 1}
              className="px-6 py-3 rounded-full bg-white text-purple-600 border-2 border-purple-600 hover:bg-purple-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Previous
            </button>
            
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.ceil(filteredPlaces.length / ITEMS_PER_PAGE) }, (_, i) => i + 1).map((pageNum) => {
                // Show first page, last page, current page, and pages around current
                const totalPages = Math.ceil(filteredPlaces.length / ITEMS_PER_PAGE);
                if (
                  pageNum === 1 ||
                  pageNum === totalPages ||
                  (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => {
                        setCurrentPage(pageNum);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`w-10 h-10 rounded-full transition-all ${
                        currentPage === pageNum
                          ? 'bg-purple-600 text-white shadow-lg'
                          : 'bg-white text-gray-700 border border-gray-300 hover:border-purple-600 hover:text-purple-600'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                  return <span key={pageNum} className="text-gray-400">...</span>;
                }
                return null;
              })}
            </div>
            
            <button
              onClick={() => {
                setCurrentPage(prev => Math.min(Math.ceil(filteredPlaces.length / ITEMS_PER_PAGE), prev + 1));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              disabled={currentPage === Math.ceil(filteredPlaces.length / ITEMS_PER_PAGE)}
              className="px-6 py-3 rounded-full bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}