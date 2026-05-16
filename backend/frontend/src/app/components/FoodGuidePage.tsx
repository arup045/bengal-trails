import { useState } from 'react';
import { motion } from 'motion/react';
import { UtensilsCrossed, MapPin, Star, Filter, Search, Heart, ChefHat, Coffee, Cake } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface FoodItem {
  name: string;
  description: string;
  region: string;
  type: 'veg' | 'non-veg' | 'sweet' | 'street';
  image: string;
  price: string;
  rating: number;
  specialty: string;
}

interface Restaurant {
  name: string;
  cuisine: string;
  location: string;
  region: string;
  rating: number;
  image: string;
  priceRange: string;
  speciality: string;
  mustTry: string[];
}

export function FoodGuidePage() {
  const [selectedRegion, setSelectedRegion] = useState('All Regions');
  const [selectedType, setSelectedType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const regions = [
    'All Regions',
    'Kolkata',
    'North Bengal',
    'South Bengal',
    'Coastal Bengal'
  ];

  const foodTypes = [
    { value: 'all', label: 'All Food', icon: UtensilsCrossed },
    { value: 'veg', label: 'Vegetarian', icon: Coffee },
    { value: 'non-veg', label: 'Non-Veg', icon: ChefHat },
    { value: 'sweet', label: 'Sweets', icon: Cake },
    { value: 'street', label: 'Street Food', icon: Coffee }
  ];

  const famousDishes: FoodItem[] = [
    {
      name: 'Rosogolla',
      description: 'Soft, spongy cheese balls soaked in sugar syrup - the iconic Bengali sweet',
      region: 'Kolkata',
      type: 'sweet',
      image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800',
      price: '₹20-50 per piece',
      rating: 4.9,
      specialty: 'Must-try Bengali dessert'
    },
    {
      name: 'Macher Jhol',
      description: 'Traditional Bengali fish curry cooked with potatoes and aromatic spices',
      region: 'All Regions',
      type: 'non-veg',
      image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800',
      price: '₹150-300',
      rating: 4.8,
      specialty: 'Authentic Bengali cuisine'
    },
    {
      name: 'Kathi Roll',
      description: 'Crispy paratha wrap filled with spiced chicken, egg, or paneer',
      region: 'Kolkata',
      type: 'street',
      image: 'https://images.unsplash.com/photo-1626074353765-517a0ae74e5e?w=800',
      price: '₹50-150',
      rating: 4.7,
      specialty: 'Street food icon'
    },
    {
      name: 'Sandesh',
      description: 'Delicate sweet made from fresh cottage cheese with various flavors',
      region: 'Kolkata',
      type: 'sweet',
      image: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=800',
      price: '₹30-100 per piece',
      rating: 4.8,
      specialty: 'Premium Bengali sweet'
    },
    {
      name: 'Ilish Mach',
      description: 'Hilsa fish cooked in mustard gravy - the pride of Bengali cuisine',
      region: 'All Regions',
      type: 'non-veg',
      image: 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=800',
      price: '₹400-800',
      rating: 4.9,
      specialty: 'King of Bengali fish'
    },
    {
      name: 'Puchka (Pani Puri)',
      description: 'Crispy hollow puris filled with spicy tamarind water',
      region: 'All Regions',
      type: 'street',
      image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800',
      price: '₹20-40 for 6 pieces',
      rating: 4.7,
      specialty: 'Popular street snack'
    },
    {
      name: 'Mishti Doi',
      description: 'Sweet yogurt with caramelized flavor - a Bengali favorite dessert',
      region: 'All Regions',
      type: 'sweet',
      image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800',
      price: '₹30-80',
      rating: 4.6,
      specialty: 'Traditional dessert'
    },
    {
      name: 'Kosha Mangsho',
      description: 'Slow-cooked mutton curry with rich, thick gravy and aromatic spices',
      region: 'All Regions',
      type: 'non-veg',
      image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800',
      price: '₹250-500',
      rating: 4.8,
      specialty: 'Special occasion dish'
    },
    {
      name: 'Shukto',
      description: 'Mixed vegetable dish with a unique bitter-sweet taste',
      region: 'All Regions',
      type: 'veg',
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800',
      price: '₹80-150',
      rating: 4.5,
      specialty: 'Traditional Bengali vegetarian'
    },
    {
      name: 'Luchi & Alur Dom',
      description: 'Fluffy fried bread served with spicy potato curry',
      region: 'All Regions',
      type: 'veg',
      image: 'https://images.unsplash.com/photo-1589301773859-34462fc0190c?w=800',
      price: '₹60-120',
      rating: 4.7,
      specialty: 'Breakfast favorite'
    },
    {
      name: 'Chingri Malai Curry',
      description: 'Prawns cooked in rich coconut milk gravy',
      region: 'Coastal Bengal',
      type: 'non-veg',
      image: 'https://images.unsplash.com/photo-1633504581786-316c8002b1b2?w=800',
      price: '₹300-600',
      rating: 4.9,
      specialty: 'Coastal delicacy'
    },
    {
      name: 'Jhal Muri',
      description: 'Spicy puffed rice snack with vegetables and mustard oil',
      region: 'All Regions',
      type: 'street',
      image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=800',
      price: '₹20-40',
      rating: 4.6,
      specialty: 'Evening snack'
    }
  ];

  const topRestaurants: Restaurant[] = [
    {
      name: 'Oh! Calcutta',
      cuisine: 'Bengali Fine Dining',
      location: 'Elgin Road, Kolkata',
      region: 'Kolkata',
      rating: 4.5,
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
      priceRange: '₹800-1,500 for two',
      speciality: 'Authentic Bengali cuisine with modern presentation',
      mustTry: ['Ilish Paturi', 'Kosha Mangsho', 'Bhetki Paturi']
    },
    {
      name: 'Peter Cat',
      cuisine: 'Continental & Indian',
      location: 'Park Street, Kolkata',
      region: 'Kolkata',
      rating: 4.6,
      image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800',
      priceRange: '₹600-1,200 for two',
      speciality: 'Famous for Chelo Kebab since 1975',
      mustTry: ['Chelo Kebab', 'Prawn Cocktail', 'Fish Fry']
    },
    {
      name: 'Kewpies Kitchen',
      cuisine: 'Home-style Bengali',
      location: 'Elgin Lane, Kolkata',
      region: 'Kolkata',
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
      priceRange: '₹500-900 for two',
      speciality: 'Authentic home-cooked Bengali meals',
      mustTry: ['Shorshe Ilish', 'Chingri Malai', 'Mishti Doi']
    },
    {
      name: 'Bhojohori Manna',
      cuisine: 'Traditional Bengali',
      location: 'Multiple locations',
      region: 'Kolkata',
      rating: 4.4,
      image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800',
      priceRange: '₹400-700 for two',
      speciality: 'Village-style Bengali cuisine',
      mustTry: ['Macher Jhol', 'Dhokar Dalna', 'Posto Bata']
    },
    {
      name: 'Glenary\'s',
      cuisine: 'Bakery & Continental',
      location: 'Darjeeling',
      region: 'North Bengal',
      rating: 4.5,
      image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800',
      priceRange: '₹500-1,000 for two',
      speciality: 'Colonial-era bakery and restaurant',
      mustTry: ['English Breakfast', 'Pastries', 'Hot Chocolate']
    },
    {
      name: 'Arsalan',
      cuisine: 'Mughlai & Biryani',
      location: 'Park Circus, Kolkata',
      region: 'Kolkata',
      rating: 4.6,
      image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800',
      priceRange: '₹400-800 for two',
      speciality: 'Legendary Kolkata Biryani',
      mustTry: ['Mutton Biryani', 'Rezala', 'Chaap']
    }
  ];

  const filteredDishes = famousDishes.filter(dish => {
    const matchesRegion = selectedRegion === 'All Regions' || dish.region === selectedRegion || dish.region === 'All Regions';
    const matchesType = selectedType === 'all' || dish.type === selectedType;
    const matchesSearch = dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          dish.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRegion && matchesType && matchesSearch;
  });

  const filteredRestaurants = topRestaurants.filter(restaurant => {
    const matchesRegion = selectedRegion === 'All Regions' || restaurant.region === selectedRegion;
    const matchesSearch = restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRegion && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-purple-50 pt-32 pb-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-100 to-purple-100 rounded-full px-6 py-3 mb-4">
            <UtensilsCrossed className="w-5 h-5 text-purple-600" />
            <span className="text-purple-600 font-semibold">Culinary Journey</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            West Bengal Food Guide
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover the rich culinary heritage of Bengal - from iconic sweets to aromatic fish curries, 
            street food delights to fine dining experiences
          </p>
        </motion.div>

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-12"
        >
          <div className="grid md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search dishes or restaurants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Region Filter */}
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
              >
                {regions.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>

            {/* Food Type Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
              >
                {foodTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Food Type Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex gap-3 mb-12 overflow-x-auto pb-2 scrollbar-hide"
        >
          {foodTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.value}
                onClick={() => setSelectedType(type.value)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full whitespace-nowrap transition-all ${
                  selectedType === type.value
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50 shadow'
                }`}
              >
                <Icon className="w-5 h-5" />
                {type.label}
              </button>
            );
          })}
        </motion.div>

        {/* Famous Dishes Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <ChefHat className="w-8 h-8 text-purple-600" />
            Famous Bengali Dishes
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredDishes.map((dish, index) => (
              <motion.div
                key={dish.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all group"
              >
                <div className="relative h-64 overflow-hidden">
                  <ImageWithFallback
                    src={dish.image}
                    alt={dish.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  
                  {/* Type Badge */}
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      dish.type === 'veg' ? 'bg-green-100 text-green-700' :
                      dish.type === 'non-veg' ? 'bg-red-100 text-red-700' :
                      dish.type === 'sweet' ? 'bg-pink-100 text-pink-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {dish.type === 'veg' ? '🥬 Veg' :
                       dish.type === 'non-veg' ? '🍗 Non-Veg' :
                       dish.type === 'sweet' ? '🍰 Sweet' :
                       '🍜 Street Food'}
                    </span>
                  </div>

                  {/* Rating */}
                  <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-semibold">{dish.rating}</span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{dish.name}</h3>
                  
                  <p className="text-gray-600 mb-3 line-clamp-2">{dish.description}</p>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                    <MapPin className="w-4 h-4" />
                    <span>{dish.region}</span>
                  </div>

                  <div className="bg-purple-50 rounded-xl p-3 mb-3">
                    <p className="text-sm text-purple-600 font-semibold">{dish.specialty}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-purple-600">{dish.price}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Top Restaurants Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <Coffee className="w-8 h-8 text-purple-600" />
            Top Restaurants
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {filteredRestaurants.map((restaurant, index) => (
              <motion.div
                key={restaurant.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all"
              >
                <div className="flex gap-6 p-6">
                  <div className="w-48 h-48 flex-shrink-0 rounded-xl overflow-hidden">
                    <ImageWithFallback
                      src={restaurant.image}
                      alt={restaurant.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-2xl font-bold text-gray-900">{restaurant.name}</h3>
                      <div className="flex items-center gap-1 bg-green-50 px-3 py-1 rounded-full">
                        <Star className="w-4 h-4 text-green-600 fill-green-600" />
                        <span className="text-sm font-semibold text-green-600">{restaurant.rating}</span>
                      </div>
                    </div>

                    <p className="text-purple-600 font-semibold mb-2">{restaurant.cuisine}</p>
                    
                    <div className="flex items-center gap-2 text-gray-500 mb-3">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{restaurant.location}</span>
                    </div>

                    <p className="text-gray-600 mb-4">{restaurant.speciality}</p>

                    <div className="mb-4">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Must Try:</p>
                      <div className="flex flex-wrap gap-2">
                        {restaurant.mustTry.map(item => (
                          <span key={item} className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-xs">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <span className="text-lg font-bold text-purple-600">{restaurant.priceRange}</span>
                      <button className="px-4 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors text-sm">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Fun Facts Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-16 bg-gradient-to-r from-orange-100 via-purple-100 to-pink-100 rounded-2xl p-8"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">🍴 Bengali Food Facts</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center">
              <div className="text-4xl mb-3">🍬</div>
              <h4 className="font-bold text-gray-900 mb-2">Rosogolla Origin</h4>
              <p className="text-sm text-gray-600">Invented in 1868 by Nobin Chandra Das in Kolkata</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center">
              <div className="text-4xl mb-3">🐟</div>
              <h4 className="font-bold text-gray-900 mb-2">Fish Love</h4>
              <p className="text-sm text-gray-600">Bengalis consume the highest amount of fish per capita in India</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center">
              <div className="text-4xl mb-3">🌶️</div>
              <h4 className="font-bold text-gray-900 mb-2">Panch Phoron</h4>
              <p className="text-sm text-gray-600">The unique five-spice blend is the soul of Bengali cooking</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
