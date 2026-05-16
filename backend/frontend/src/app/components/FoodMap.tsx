import { useState } from 'react';
import { motion } from 'motion/react';
import { MapPin, Star, DollarSign, UtensilsCrossed, Leaf, Search, ChevronRight } from 'lucide-react';
import { restaurants } from '../data/restaurants';

export function FoodMap() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRestaurant, setSelectedRestaurant] = useState<typeof restaurants[0] | null>(null);

  // Convert restaurants to food spots format
  const foodSpots = restaurants.map(restaurant => ({
    id: restaurant.id,
    name: restaurant.name,
    type: restaurant.cuisine.join(', '),
    location: `${restaurant.location}, ${restaurant.city}`,
    specialty: restaurant.specialty.join(', '),
    price: restaurant.priceRange,
    rating: restaurant.rating,
    veg: restaurant.categories.includes('Veg'),
    category: restaurant.categories.includes('Street Food') ? 'street' : 
              restaurant.categories.includes('Bakery') || restaurant.categories.includes('Continental') ? 'cafe' : 'restaurant',
    mustTry: restaurant.mustTry,
    timings: restaurant.timings,
    description: restaurant.description,
    address: restaurant.address,
    phone: restaurant.phone,
    averageCost: restaurant.averageCost,
    coordinates: restaurant.coordinates
  }));

  const categories = [
    { id: 'all', name: 'All', icon: '🍽️' },
    { id: 'street', name: 'Street Food', icon: '🍡' },
    { id: 'restaurant', name: 'Restaurants', icon: '🏪' },
    { id: 'cafe', name: 'Cafés', icon: '☕' },
    { id: 'bakery', name: 'Bakeries', icon: '🥐' },
    { id: 'sweets', name: 'Sweet Shops', icon: '🍬' },
  ];

  const filteredSpots = foodSpots
    .filter(spot => selectedCategory === 'all' || spot.category === selectedCategory)
    .filter(spot => 
      spot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      spot.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      spot.location.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full mb-6">
            <UtensilsCrossed className="w-5 h-5" />
            <span className="font-semibold">Food Explorer</span>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">West Bengal Food Map</h1>
          <p className="text-xl text-gray-600">
            Discover the best street food, restaurants, and hidden culinary gems
          </p>
        </motion.div>

        {/* Search & Filter */}
        <div className="mb-12">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, dish, or location..."
                className="w-full pl-14 pr-6 py-4 bg-white border-2 border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-md"
              />
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-6 py-3 rounded-full font-semibold transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
                }`}
              >
                <span className="mr-2">{cat.icon}</span>
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Food Spots Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSpots.map((spot, index) => (
            <motion.div
              key={spot.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-all"
            >
              {/* Image */}
              <div className="relative h-48 bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                <UtensilsCrossed className="w-20 h-20 text-orange-300" />
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{spot.name}</h3>
                    <p className="text-sm text-gray-600">{spot.type}</p>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 rounded-full">
                    <Star className="w-4 h-4 text-yellow-600 fill-yellow-400" />
                    <span className="text-sm font-semibold text-yellow-900">{spot.rating}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-gray-600 mb-4">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{spot.location}</span>
                </div>

                {/* Specialty */}
                <div className="mb-4 p-3 bg-orange-50 rounded-xl">
                  <div className="text-xs text-gray-600 mb-1">Famous For</div>
                  <div className="font-semibold text-gray-900">{spot.specialty}</div>
                </div>

                {/* Must Try */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Must Try:</h4>
                  <div className="flex flex-wrap gap-2">
                    {spot.mustTry.map((dish, idx) => (
                      <span key={idx} className="text-xs px-3 py-1 bg-red-100 text-red-700 rounded-full">
                        {dish}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Timings */}
                <div className="text-xs text-gray-600 flex items-center gap-2">
                  <span className="font-semibold">⏰</span>
                  {spot.timings}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredSpots.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No food spots found. Try different filters!</p>
          </div>
        )}

        {/* Food Trails */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 bg-gradient-to-r from-orange-600 to-red-600 rounded-3xl p-8 text-white"
        >
          <h3 className="text-2xl font-bold mb-6">🍜 Recommended Food Trails</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/10 rounded-2xl p-6">
              <h4 className="font-bold text-lg mb-3">Park Street Food Walk</h4>
              <ul className="space-y-2 text-sm">
                <li>1. Breakfast at Flurys</li>
                <li>2. Lunch at Mocambo</li>
                <li>3. Coffee at Barista</li>
                <li>4. Dinner at Peter Cat</li>
              </ul>
            </div>
            <div className="bg-white/10 rounded-2xl p-6">
              <h4 className="font-bold text-lg mb-3">Street Food Marathon</h4>
              <ul className="space-y-2 text-sm">
                <li>1. Puchka at Dacres Lane</li>
                <li>2. Kathi Roll at Nizam's</li>
                <li>3. Momos at New Alipore</li>
                <li>4. Chaat at Vivekananda Park</li>
              </ul>
            </div>
            <div className="bg-white/10 rounded-2xl p-6">
              <h4 className="font-bold text-lg mb-3">Sweet Tooth Tour</h4>
              <ul className="space-y-2 text-sm">
                <li>1. Rosogolla at KC Das</li>
                <li>2. Sandesh at Balaram Mullick</li>
                <li>3. Mishti Doi at Paramount</li>
                <li>4. Pastries at Nahoum's</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Food Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 bg-white rounded-3xl p-8 shadow-lg"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-4">🍴 Foodie Tips</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💰</span>
              <div>
                <div className="font-semibold mb-1">Budget Guide</div>
                <p className="text-sm text-gray-600">
                  ₹ = Under ₹100 | ₹₹ = ₹100-300 | ₹₹₹ = Above ₹300
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">⏰</span>
              <div>
                <div className="font-semibold mb-1">Best Times</div>
                <p className="text-sm text-gray-600">
                  Visit street food stalls after 5 PM for freshest preparations
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🌿</span>
              <div>
                <div className="font-semibold mb-1">Veg Options</div>
                <p className="text-sm text-gray-600">
                  Look for green leaf symbol for pure vegetarian places
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🍽️</span>
              <div>
                <div className="font-semibold mb-1">Local Etiquette</div>
                <p className="text-sm text-gray-600">
                  Eating with hands is common and accepted for Bengali food
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}