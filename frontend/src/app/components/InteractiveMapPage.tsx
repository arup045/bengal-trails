import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Navigation, X, Star, ChevronRight, Loader2 } from 'lucide-react';
import { authFetch } from '../utils/api';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { getCurrentLocation, LocationCoords, formatDistance, calculateDistance } from '../utils/location';

interface Region {
  name: string;
  color: string;
  hoverColor: string;
  description: string;
  highlights: string[];
}

export function InteractiveMapPage() {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [places, setPlaces] = useState<any[]>([]);

  useEffect(() => {
    authFetch(`/destinations?limit=100`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.destinations?.length) setPlaces(d.destinations); })
      .catch(() => {});
  }, []);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<LocationCoords | null>(null);
  const [loadingLocation, setLoadingLocation] = useState<boolean>(true);

  const regions: Record<string, Region> = {
    'North Bengal': {
      name: 'North Bengal',
      color: '#9333ea',
      hoverColor: '#a855f7',
      description: 'Home to the majestic Himalayas, tea gardens, and hill stations',
      highlights: ['Darjeeling', 'Kalimpong', 'Dooars', 'Tea Estates']
    },
    'South Bengal': {
      name: 'South Bengal',
      color: '#ea580c',
      hoverColor: '#f97316',
      description: 'Rich in heritage, mangroves, and cultural landmarks',
      highlights: ['Kolkata', 'Sundarbans', 'Digha', 'Santiniketan']
    },
    'Central Bengal': {
      name: 'Central Bengal',
      color: '#dc2626',
      hoverColor: '#ef4444',
      description: 'Historical sites, temples, and traditional Bengali culture',
      highlights: ['Murshidabad', 'Nabadwip', 'Krishnanagar', 'Plassey']
    },
    'Coastal Bengal': {
      name: 'Coastal Bengal',
      color: '#0891b2',
      hoverColor: '#06b6d4',
      description: 'Beautiful beaches, fishing villages, and seaside resorts',
      highlights: ['Digha', 'Mandarmani', 'Tajpur', 'Bakkhali']
    }
  };

  const getRegionDestinations = (regionName: string) => {
    return places.filter((p:any) => p.region === regionName).map((p:any) => ({ ...p, title: p.name })).slice(0, 6);
  };

  const allDestinations = Object.keys(regions).reduce((acc, regionName) => {
    acc[regionName] = getRegionDestinations(regionName);
    return acc;
  }, {} as Record<string, any[]>);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const location = await getCurrentLocation();
        setUserLocation(location);
      } catch (error) {
        // Silently fail - geolocation is optional
        // User can still use the map without their location
      } finally {
        setLoadingLocation(false);
      }
    };

    fetchLocation();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50 pt-32 pb-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-orange-100 rounded-full px-6 py-3 mb-4">
            <MapPin className="w-5 h-5 text-purple-600" />
            <span className="text-purple-600 font-semibold">Explore by Region</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            Interactive Map of West Bengal
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Click on any region to discover amazing destinations, rich heritage, and unforgettable experiences
          </p>
        </motion.div>

        {/* Region Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {Object.entries(regions).map(([key, region]) => {
            const destinations = allDestinations[key];
            const isSelected = selectedRegion === key;
            const isHovered = hoveredRegion === key;
            
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                onClick={() => setSelectedRegion(isSelected ? null : key)}
                onMouseEnter={() => setHoveredRegion(key)}
                onMouseLeave={() => setHoveredRegion(null)}
                className={`cursor-pointer rounded-2xl p-6 shadow-lg transition-all ${
                  isSelected 
                    ? 'ring-4 ring-purple-600' 
                    : 'hover:shadow-2xl'
                }`}
                style={{
                  backgroundColor: isHovered ? region.hoverColor : region.color,
                  color: 'white'
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">{region.name}</h3>
                    <p className="text-sm opacity-90">{destinations.length} destinations</p>
                  </div>
                  <MapPin className="w-8 h-8" />
                </div>
                
                <p className="text-sm opacity-90 mb-4">{region.description}</p>
                
                <div className="flex flex-wrap gap-2">
                  {region.highlights.slice(0, 3).map((highlight) => (
                    <span 
                      key={highlight} 
                      className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs"
                    >
                      {highlight}
                    </span>
                  ))}
                </div>

                {isSelected && (
                  <div className="mt-4 pt-4 border-t border-white/30">
                    <div className="flex items-center gap-2 text-sm">
                      <ChevronRight className="w-4 h-4" />
                      <span>Click below to explore destinations</span>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Selected Region Destinations */}
        <AnimatePresence>
          {selectedRegion && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-2xl shadow-2xl p-8 mb-12"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Destinations in {selectedRegion}
                  </h2>
                  <p className="text-gray-600">{regions[selectedRegion].description}</p>
                </div>
                <button
                  onClick={() => setSelectedRegion(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allDestinations[selectedRegion]?.map((place) => (
                  <a
                    key={place.slug}
                    href={`/explore/${place.slug}`}
                    className="group bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <ImageWithFallback
                        src={place.heroImage.url}
                        alt={place.heroImage.alt}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                      
                      {place.rating && (
                        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm font-semibold">{place.rating}</span>
                        </div>
                      )}

                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-white text-xl font-bold mb-1">{place.title}</h3>
                        <div className="flex items-center gap-2 text-white/90 text-sm">
                          <MapPin className="w-4 h-4" />
                          <span>{place.district}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4">
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{place.excerpt}</p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-purple-600 font-semibold">{place.priceFrom || 'Free'}</span>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Navigation className="w-4 h-4" />
                          <span>Get Directions</span>
                        </div>
                      </div>
                    </div>
                  </a>
                ))}
              </div>

              {allDestinations[selectedRegion]?.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <MapPin className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No destinations found in this region yet. Check back soon!</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* All Regions Overview */}
        {!selectedRegion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">All Destinations</h2>
            
            {Object.entries(regions).map(([key, region]) => {
              const destinations = allDestinations[key];
              if (destinations.length === 0) return null;

              return (
                <div key={key} className="mb-12 last:mb-0">
                  <div 
                    className="flex items-center gap-3 mb-6 cursor-pointer group"
                    onClick={() => setSelectedRegion(key)}
                  >
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: region.color }}
                    ></div>
                    <h3 className="text-2xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                      {region.name}
                    </h3>
                    <span className="text-gray-500">({destinations.length})</span>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
                  </div>

                  <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {destinations.slice(0, 4).map((place) => (
                      <a
                        key={place.slug}
                        href={`/explore/${place.slug}`}
                        className="group"
                      >
                        <div className="relative h-32 rounded-xl overflow-hidden mb-2">
                          <ImageWithFallback
                            src={place.heroImage.url}
                            alt={place.heroImage.alt}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                          {place.rating && (
                            <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                              <span className="text-xs font-semibold">{place.rating}</span>
                            </div>
                          )}
                        </div>
                        <h4 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                          {place.title}
                        </h4>
                        <p className="text-sm text-gray-500">{place.district}</p>
                      </a>
                    ))}
                  </div>

                  {destinations.length > 4 && (
                    <button
                      onClick={() => setSelectedRegion(key)}
                      className="mt-4 text-purple-600 hover:text-purple-700 font-semibold flex items-center gap-2"
                    >
                      View all {destinations.length} destinations
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </motion.div>
        )}

        {/* Map Legend / Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-12 bg-gradient-to-r from-purple-100 via-orange-100 to-pink-100 rounded-2xl p-8"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">West Bengal at a Glance</h3>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">{places.length || '232+'}</div>
              <div className="text-gray-700">Total Destinations</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">4</div>
              <div className="text-gray-700">Major Regions</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center">
              <div className="text-4xl font-bold text-red-600 mb-2">23</div>
              <div className="text-gray-700">Districts</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center">
              <div className="text-4xl font-bold text-cyan-600 mb-2">100%</div>
              <div className="text-gray-700">Free to Explore</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}