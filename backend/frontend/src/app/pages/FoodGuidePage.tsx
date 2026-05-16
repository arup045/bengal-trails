import { useState, useMemo } from 'react';
import { Search, MapPin, Star, Phone, Clock, DollarSign, Filter, X, ChevronRight, Utensils, Award } from 'lucide-react';
import { restaurants, foodCategories, regions, priceRanges, Restaurant } from '../data/restaurants';

export default function FoodGuidePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filteredRestaurants = useMemo(() => {
    return restaurants.filter(restaurant => {
      const matchesSearch = searchQuery === '' || 
        restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restaurant.cuisine.some(c => c.toLowerCase().includes(searchQuery.toLowerCase())) ||
        restaurant.specialty.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
        restaurant.city.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === 'all' || 
        restaurant.categories.some(cat => cat.toLowerCase().includes(selectedCategory.toLowerCase())) ||
        restaurant.cuisine.some(cui => cui.toLowerCase().includes(selectedCategory.toLowerCase()));

      const matchesRegion = selectedRegion === 'all' || 
        restaurant.region.toLowerCase().includes(selectedRegion.toLowerCase()) ||
        restaurant.city.toLowerCase() === selectedRegion.toLowerCase();

      const matchesPriceRange = selectedPriceRange === 'all' || 
        restaurant.priceRange === selectedPriceRange;

      return matchesSearch && matchesCategory && matchesRegion && matchesPriceRange;
    });
  }, [searchQuery, selectedCategory, selectedRegion, selectedPriceRange]);

  const activeFiltersCount = [selectedCategory, selectedRegion, selectedPriceRange].filter(f => f !== 'all').length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#7C2F3E] to-[#A44A3F] text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 font-['Playfair_Display']">
              🍽️ Bengal Food Guide
            </h1>
            <p className="text-xl text-orange-100">
              Discover the legendary restaurants & street food of West Bengal
            </p>
            <p className="text-orange-200 mt-2">
              From iconic Kolkata biryanis to heritage eateries & hidden gems
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search restaurants, cuisines, or dishes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Food Categories */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all whitespace-nowrap ${
                showFilters || activeFiltersCount > 0
                  ? 'border-purple-600 bg-purple-50 text-purple-700'
                  : 'border-gray-300 hover:border-purple-400'
              }`}
            >
              <Filter size={18} />
              <span className="font-medium">Filters</span>
              {activeFiltersCount > 0 && (
                <span className="bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedRegion('all');
                setSelectedPriceRange('all');
              }}
              className={`px-4 py-2 rounded-full border-2 transition-all whitespace-nowrap ${
                selectedCategory === 'all' && selectedRegion === 'all' && selectedPriceRange === 'all'
                  ? 'border-purple-600 bg-purple-600 text-white'
                  : 'border-gray-300 hover:border-purple-400'
              }`}
            >
              All Restaurants
            </button>

            {foodCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all whitespace-nowrap ${
                  selectedCategory === category.id
                    ? 'border-purple-600 bg-purple-600 text-white'
                    : 'border-gray-300 hover:border-purple-400'
                }`}
              >
                <span>{category.icon}</span>
                <span className="font-medium">{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Filters */}
      {showFilters && (
        <div className="bg-orange-50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Region Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-purple-600 focus:outline-none"
                >
                  {regions.map((region) => (
                    <option key={region.id} value={region.id}>
                      {region.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Budget</label>
                <select
                  value={selectedPriceRange}
                  onChange={(e) => setSelectedPriceRange(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-purple-600 focus:outline-none"
                >
                  {priceRanges.map((range) => (
                    <option key={range.id} value={range.id}>
                      {range.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedRegion('all');
                    setSelectedPriceRange('all');
                    setShowFilters(false);
                  }}
                  className="w-full px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
                >
                  <X size={18} />
                  Clear All Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <p className="text-gray-600">
          Found <span className="font-bold text-purple-600">{filteredRestaurants.length}</span> restaurants
        </p>
      </div>

      {/* Featured Food Categories Section */}
      {searchQuery === '' && selectedCategory === 'all' && selectedRegion === 'all' && selectedPriceRange === 'all' && (
        <div className="max-w-7xl mx-auto px-4 mb-12">
          <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-orange-100">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">🍽️ Food Categories</h2>
            
            {/* Biryani Section */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">🍚</span>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Legendary Biryani</h3>
                  <p className="text-gray-600">Kolkata's most iconic biryani restaurants</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {restaurants.filter(r => r.categories.includes('Biryani')).slice(0, 3).map(r => (
                  <div key={r.id} className="bg-orange-50 rounded-xl p-4 hover:bg-orange-100 transition-colors cursor-pointer" onClick={() => setSelectedRestaurant(r)}>
                    <h4 className="font-bold text-gray-900 mb-1">{r.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">{r.location}</p>
                    <p className="text-xs text-orange-700 font-medium">Famous for: {r.mustTry[0]}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Bengali Sweets Section */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">🍮</span>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Bengali Sweets</h3>
                  <p className="text-gray-600">Heritage sweet shops & mishti makers</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {restaurants.filter(r => r.categories.includes('Sweets')).slice(0, 3).map(r => (
                  <div key={r.id} className="bg-pink-50 rounded-xl p-4 hover:bg-pink-100 transition-colors cursor-pointer" onClick={() => setSelectedRestaurant(r)}>
                    <h4 className="font-bold text-gray-900 mb-1">{r.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">{r.location}</p>
                    <p className="text-xs text-pink-700 font-medium">Famous for: {r.mustTry[0]}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Street Food Section */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">🌮</span>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Street Food Legends</h3>
                  <p className="text-gray-600">Iconic street food spots & cabins</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {restaurants.filter(r => r.categories.includes('Street Food')).slice(0, 3).map(r => (
                  <div key={r.id} className="bg-yellow-50 rounded-xl p-4 hover:bg-yellow-100 transition-colors cursor-pointer" onClick={() => setSelectedRestaurant(r)}>
                    <h4 className="font-bold text-gray-900 mb-1">{r.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">{r.location}</p>
                    <p className="text-xs text-yellow-700 font-medium">Famous for: {r.mustTry[0]}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Fine Dining Section */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">✨</span>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Fine Dining</h3>
                  <p className="text-gray-600">Premium restaurants & heritage eateries</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {restaurants.filter(r => r.categories.includes('Fine Dining')).slice(0, 3).map(r => (
                  <div key={r.id} className="bg-purple-50 rounded-xl p-4 hover:bg-purple-100 transition-colors cursor-pointer" onClick={() => setSelectedRestaurant(r)}>
                    <h4 className="font-bold text-gray-900 mb-1">{r.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">{r.location}</p>
                    <p className="text-xs text-purple-700 font-medium">Famous for: {r.mustTry[0]}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Regional Cuisines */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">🗺️</span>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Regional Specialties</h3>
                  <p className="text-gray-600">Tibetan, Chinese & Bengali cuisine</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-xl p-4">
                  <h4 className="font-bold text-blue-900 mb-2">Tangra Chinese</h4>
                  <p className="text-sm text-blue-700">{restaurants.filter(r => r.categories.includes('Chinese')).length} restaurants</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4">
                  <h4 className="font-bold text-green-900 mb-2">Tibetan/Nepali</h4>
                  <p className="text-sm text-green-700">{restaurants.filter(r => r.categories.includes('Tibetan')).length} restaurants</p>
                </div>
                <div className="bg-orange-50 rounded-xl p-4">
                  <h4 className="font-bold text-orange-900 mb-2">Bengali Cuisine</h4>
                  <p className="text-sm text-orange-700">{restaurants.filter(r => r.categories.includes('Bengali')).length} restaurants</p>
                </div>
                <div className="bg-red-50 rounded-xl p-4">
                  <h4 className="font-bold text-red-900 mb-2">Continental</h4>
                  <p className="text-sm text-red-700">{restaurants.filter(r => r.categories.includes('Continental')).length} restaurants</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Restaurant Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        {filteredRestaurants.length === 0 ? (
          <div className="text-center py-20">
            <Utensils size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-2xl font-bold text-gray-600 mb-2">No restaurants found</h3>
            <p className="text-gray-500">Try adjusting your filters or search query</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                onClick={() => setSelectedRestaurant(restaurant)}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer overflow-hidden border border-gray-200 hover:border-purple-400"
              >
                <div className="relative h-48 bg-gradient-to-br from-orange-100 to-orange-200">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Utensils size={64} className="text-orange-300" />
                  </div>
                  {restaurant.established && (
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-gray-700 flex items-center gap-1">
                      <Award size={14} className="text-orange-500" />
                      Since {restaurant.established}
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
                    <Star size={14} className="text-yellow-500 fill-yellow-500" />
                    <span className="font-medium text-sm">{restaurant.rating}</span>
                    <span className="text-xs text-gray-500">({restaurant.reviews})</span>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 mb-1">{restaurant.name}</h3>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <MapPin size={14} />
                        {restaurant.location}, {restaurant.city}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {restaurant.cuisine.slice(0, 2).map((cuisine, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full"
                      >
                        {cuisine}
                      </span>
                    ))}
                  </div>

                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Must Try:</span>{' '}
                      {restaurant.mustTry.slice(0, 2).join(', ')}
                      {restaurant.mustTry.length > 2 && '...'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign size={16} className="text-green-600" />
                      <span className="font-medium text-gray-700">{restaurant.averageCost}</span>
                    </div>
                    <div className="flex items-center gap-1 text-purple-600 font-medium text-sm">
                      View Details
                      <ChevronRight size={16} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Restaurant Detail Modal */}
      {selectedRestaurant && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedRestaurant(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-64 bg-gradient-to-br from-orange-200 to-orange-300">
              <div className="absolute inset-0 flex items-center justify-center">
                <Utensils size={96} className="text-orange-400" />
              </div>
              <button
                onClick={() => setSelectedRestaurant(null)}
                className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors"
              >
                <X size={24} />
              </button>
              {selectedRestaurant.established && (
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full font-medium flex items-center gap-2">
                  <Award size={18} className="text-orange-500" />
                  Established {selectedRestaurant.established}
                </div>
              )}
              <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
                <Star size={18} className="text-yellow-500 fill-yellow-500" />
                <span className="font-bold text-lg">{selectedRestaurant.rating}</span>
                <span className="text-gray-600">({selectedRestaurant.reviews} reviews)</span>
              </div>
            </div>

            <div className="p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedRestaurant.name}</h2>
              <p className="text-gray-600 mb-6 flex items-center gap-2">
                <MapPin size={18} />
                {selectedRestaurant.location}, {selectedRestaurant.city}
              </p>

              <p className="text-gray-700 mb-6 leading-relaxed">{selectedRestaurant.description}</p>

              {/* Cuisine Tags */}
              <div className="mb-6">
                <h3 className="font-bold text-lg mb-3">Cuisine</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedRestaurant.cuisine.map((cuisine, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full font-medium"
                    >
                      {cuisine}
                    </span>
                  ))}
                </div>
              </div>

              {/* Must Try Dishes */}
              <div className="mb-6">
                <h3 className="font-bold text-lg mb-3">🍽️ Must Try Dishes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {selectedRestaurant.mustTry.map((dish, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-lg">
                      <span className="text-orange-500">✓</span>
                      <span className="font-medium">{dish}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Specialties */}
              {selectedRestaurant.specialty.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-bold text-lg mb-3">⭐ Specialties</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedRestaurant.specialty.map((spec, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-700 mb-2">
                    <Clock size={18} className="text-purple-600" />
                    <span className="font-medium">Timings</span>
                  </div>
                  <p className="text-gray-900">{selectedRestaurant.timings}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-700 mb-2">
                    <DollarSign size={18} className="text-green-600" />
                    <span className="font-medium">Average Cost</span>
                  </div>
                  <p className="text-gray-900 font-bold">{selectedRestaurant.averageCost}</p>
                  <p className="text-sm text-gray-600">Price Range: {selectedRestaurant.priceRange}</p>
                </div>

                {selectedRestaurant.phone && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-700 mb-2">
                      <Phone size={18} className="text-purple-600" />
                      <span className="font-medium">Contact</span>
                    </div>
                    <a
                      href={`tel:${selectedRestaurant.phone}`}
                      className="text-purple-600 hover:underline"
                    >
                      {selectedRestaurant.phone}
                    </a>
                  </div>
                )}

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-700 mb-2">
                    <MapPin size={18} className="text-red-600" />
                    <span className="font-medium">Address</span>
                  </div>
                  <p className="text-sm text-gray-900">{selectedRestaurant.address}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${selectedRestaurant.coordinates.lat},${selectedRestaurant.coordinates.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-purple-700 transition-colors text-center flex items-center justify-center gap-2"
                >
                  <MapPin size={20} />
                  View on Map
                </a>
                {selectedRestaurant.phone && (
                  <a
                    href={`tel:${selectedRestaurant.phone}`}
                    className="flex-1 bg-green-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-700 transition-colors text-center flex items-center justify-center gap-2"
                  >
                    <Phone size={20} />
                    Call Now
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}