import { MapPin, Calendar, Tag, Search, Car, Mountain, Bike, TrendingUp, Camera, Utensils, X } from 'lucide-react';
import { useState, useRef, useEffect, memo } from 'react';

const TourTypeButton = memo(({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2 px-4 py-2 bg-white/90 rounded-full hover:bg-white transition-colors will-change-transform"
  >
    {icon}
    <span className="text-sm font-medium text-gray-800">{label}</span>
  </button>
));

TourTypeButton.displayName = 'TourTypeButton';

export function Hero() {
  const [searchLocation, setSearchLocation] = useState('');
  const [searchActivity, setSearchActivity] = useState('');
  const [searchTourType, setSearchTourType] = useState('');
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [showActivitySuggestions, setShowActivitySuggestions] = useState(false);
  const [showTourTypeSuggestions, setShowTourTypeSuggestions] = useState(false);
  
  const locationRef = useRef<HTMLDivElement>(null);
  const activityRef = useRef<HTMLDivElement>(null);
  const tourTypeRef = useRef<HTMLDivElement>(null);

  // Popular destinations
  const popularLocations = [
    'Darjeeling', 'Sundarbans', 'Kolkata', 'Digha', 'Mandarmani', 
    'Kalimpong', 'Shantiniketan', 'Murshidabad', 'Siliguri', 'Dooars'
  ];

  // Activity suggestions
  const activitySuggestions = [
    'Tea Garden Tour', 'Tiger Safari', 'Heritage Walk', 'Temple Visit',
    'Beach Activities', 'Trekking', 'Bird Watching', 'Photography',
    'Shopping', 'Food Tour', 'River Cruise', 'Museum Tour'
  ];

  // Tour type suggestions
  const tourTypeSuggestions = [
    'Adventure', 'Cultural', 'Heritage', 'Nature', 'Wildlife',
    'Beach', 'Hill Station', 'Spiritual', 'Food & Culinary'
  ];

  const tourTypes = [
    { icon: <Car className="w-5 h-5" />, label: 'On Wheel' },
    { icon: <Mountain className="w-5 h-5" />, label: 'Hiking' },
    { icon: <Bike className="w-5 h-5" />, label: 'Cycling' },
    { icon: <TrendingUp className="w-5 h-5" />, label: 'Trekking' },
    { icon: <Camera className="w-5 h-5" />, label: 'Photography' },
    { icon: <Utensils className="w-5 h-5" />, label: 'Culinary' },
  ];

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (locationRef.current && !locationRef.current.contains(e.target as Node)) {
        setShowLocationSuggestions(false);
      }
      if (activityRef.current && !activityRef.current.contains(e.target as Node)) {
        setShowActivitySuggestions(false);
      }
      if (tourTypeRef.current && !tourTypeRef.current.contains(e.target as Node)) {
        setShowTourTypeSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter suggestions based on input
  const filteredLocations = searchLocation
    ? popularLocations.filter(loc => loc.toLowerCase().includes(searchLocation.toLowerCase()))
    : popularLocations;

  const filteredActivities = searchActivity
    ? activitySuggestions.filter(act => act.toLowerCase().includes(searchActivity.toLowerCase()))
    : activitySuggestions;

  const filteredTourTypes = searchTourType
    ? tourTypeSuggestions.filter(type => type.toLowerCase().includes(searchTourType.toLowerCase()))
    : tourTypeSuggestions;

  const handleSearch = () => {
    // Build query parameters
    const params = new URLSearchParams();
    if (searchLocation) params.append('location', searchLocation);
    if (searchActivity) params.append('activity', searchActivity);
    if (searchTourType) params.append('tourType', searchTourType);
    
    // Save to recent searches
    const recentSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    const searchData = {
      location: searchLocation,
      activity: searchActivity,
      tourType: searchTourType,
      timestamp: Date.now()
    };
    recentSearches.unshift(searchData);
    localStorage.setItem('recentSearches', JSON.stringify(recentSearches.slice(0, 5)));
    
    // Navigate to explore page with search parameters
    const queryString = params.toString();
    window.location.hash = queryString ? `#/explore?${queryString}` : '#/explore';
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleTourTypeClick = (tourType: string) => {
    setSearchTourType(tourType);
    // Navigate immediately when clicking a tour type chip
    const params = new URLSearchParams();
    params.append('tourType', tourType);
    window.location.hash = `#/explore?${params.toString()}`;
  };

  const selectSuggestion = (field: 'location' | 'activity' | 'tourType', value: string) => {
    if (field === 'location') {
      setSearchLocation(value);
      setShowLocationSuggestions(false);
    } else if (field === 'activity') {
      setSearchActivity(value);
      setShowActivitySuggestions(false);
    } else if (field === 'tourType') {
      setSearchTourType(value);
      setShowTourTypeSuggestions(false);
    }
  };

  return (
    <section className="relative bg-gradient-to-r from-[#8B3A62] via-[#B85C38] to-[#D4A574] text-white overflow-hidden">
      {/* Background Image Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-40"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1742325646212-f917ba1feeaa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3dyYWglMjBicmlkZ2UlMjBrb2xrYXRhJTIwc3Vuc2V0fGVufDF8fHx8MTc2MzQ4MjUyMXww&ixlib=rb-4.1.0&q=80&w=1080')`
        }}
      ></div>

      <div className="max-w-7xl mx-auto px-6 py-24 relative">
        {/* Breadcrumb */}
        <p className="text-center text-white/90 mb-6">🌟 Explore India's Cultural Capital</p>

        {/* Main Heading */}
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-5xl md:text-6xl leading-tight">
            Discover the Heart of
            <br />
            <span className="text-yellow-300">West Bengal</span>
          </h1>
          <p className="text-white/90 text-lg max-w-2xl mx-auto">
            From tea gardens to tidal mangroves — explore stunning places,
            <br />
            stories, festivals & curated tours.
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-full p-2 flex flex-col md:flex-row gap-2 shadow-2xl max-w-4xl mx-auto mb-8 relative">
          {/* Location Field */}
          <div ref={locationRef} className="flex-1 relative">
            <div className="flex items-center gap-3 px-4 py-3 rounded-full hover:bg-gray-50 transition-colors cursor-pointer">
              <MapPin className="w-5 h-5 text-orange-600" />
              <div className="flex-1 flex items-center gap-2">
                <input 
                  type="text" 
                  placeholder="Location" 
                  className="w-full outline-none text-gray-800 placeholder:text-gray-500"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  onFocus={() => setShowLocationSuggestions(true)}
                  onKeyPress={handleKeyPress}
                />
                {searchLocation && (
                  <button
                    onClick={() => setSearchLocation('')}
                    className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    <X className="w-3.5 h-3.5 text-gray-500" />
                  </button>
                )}
              </div>
            </div>
            
            {/* Location Suggestions Dropdown */}
            {showLocationSuggestions && filteredLocations.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 max-h-64 overflow-y-auto">
                <div className="p-2">
                  <div className="text-xs text-gray-500 px-3 py-2 font-medium">
                    {searchLocation ? 'SUGGESTIONS' : 'POPULAR LOCATIONS'}
                  </div>
                  {filteredLocations.map((location) => (
                    <button
                      key={location}
                      onClick={() => selectSuggestion('location', location)}
                      className="w-full text-left px-3 py-2 hover:bg-purple-50 rounded-lg transition-colors text-gray-800 text-sm"
                    >
                      {location}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="hidden md:block w-px bg-gray-200"></div>

          {/* Activity Field */}
          <div ref={activityRef} className="flex-1 relative">
            <div className="flex items-center gap-3 px-4 py-3 rounded-full hover:bg-gray-50 transition-colors cursor-pointer">
              <Calendar className="w-5 h-5 text-orange-600" />
              <div className="flex-1 flex items-center gap-2">
                <input 
                  type="text" 
                  placeholder="Activity" 
                  className="w-full outline-none text-gray-800 placeholder:text-gray-500"
                  value={searchActivity}
                  onChange={(e) => setSearchActivity(e.target.value)}
                  onFocus={() => setShowActivitySuggestions(true)}
                  onKeyPress={handleKeyPress}
                />
                {searchActivity && (
                  <button
                    onClick={() => setSearchActivity('')}
                    className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    <X className="w-3.5 h-3.5 text-gray-500" />
                  </button>
                )}
              </div>
            </div>

            {/* Activity Suggestions Dropdown */}
            {showActivitySuggestions && filteredActivities.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 max-h-64 overflow-y-auto">
                <div className="p-2">
                  <div className="text-xs text-gray-500 px-3 py-2 font-medium">
                    {searchActivity ? 'SUGGESTIONS' : 'POPULAR ACTIVITIES'}
                  </div>
                  {filteredActivities.map((activity) => (
                    <button
                      key={activity}
                      onClick={() => selectSuggestion('activity', activity)}
                      className="w-full text-left px-3 py-2 hover:bg-purple-50 rounded-lg transition-colors text-gray-800 text-sm"
                    >
                      {activity}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="hidden md:block w-px bg-gray-200"></div>

          {/* Tour Type Field */}
          <div ref={tourTypeRef} className="flex-1 relative">
            <div className="flex items-center gap-3 px-4 py-3 rounded-full hover:bg-gray-50 transition-colors cursor-pointer">
              <Tag className="w-5 h-5 text-orange-600" />
              <div className="flex-1 flex items-center gap-2">
                <input 
                  type="text" 
                  placeholder="Tour Type" 
                  className="w-full outline-none text-gray-800 placeholder:text-gray-500"
                  value={searchTourType}
                  onChange={(e) => setSearchTourType(e.target.value)}
                  onFocus={() => setShowTourTypeSuggestions(true)}
                  onKeyPress={handleKeyPress}
                />
                {searchTourType && (
                  <button
                    onClick={() => setSearchTourType('')}
                    className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    <X className="w-3.5 h-3.5 text-gray-500" />
                  </button>
                )}
              </div>
            </div>

            {/* Tour Type Suggestions Dropdown */}
            {showTourTypeSuggestions && filteredTourTypes.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 max-h-64 overflow-y-auto">
                <div className="p-2">
                  <div className="text-xs text-gray-500 px-3 py-2 font-medium">
                    {searchTourType ? 'SUGGESTIONS' : 'TOUR TYPES'}
                  </div>
                  {filteredTourTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => selectSuggestion('tourType', type)}
                      className="w-full text-left px-3 py-2 hover:bg-purple-50 rounded-lg transition-colors text-gray-800 text-sm"
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button 
            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-8 py-3 rounded-full hover:shadow-lg hover:shadow-purple-500/50 transition-all flex items-center gap-2" 
            onClick={handleSearch}
          >
            <Search className="w-5 h-5" />
            <span>Search</span>
          </button>
        </div>

        {/* Tour Type Icons */}
        <div className="flex flex-wrap justify-center gap-4 max-w-3xl mx-auto">
          {tourTypes.map((type, index) => (
            <TourTypeButton
              key={index}
              icon={type.icon}
              label={type.label}
              onClick={() => handleTourTypeClick(type.label)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}