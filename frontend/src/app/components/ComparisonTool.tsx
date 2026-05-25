import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Star, Calendar, MapPin, DollarSign, Users, Check, ArrowRight } from 'lucide-react';
import { placesData } from '../data/places-full';

interface SelectedPlace {
  slug: string;
  data: typeof placesData[0];
}

export function ComparisonTool() {
  const [selectedPlaces, setSelectedPlaces] = useState<SelectedPlace[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const maxPlaces = 3;

  const addPlace = (slug: string) => {
    if (selectedPlaces.length >= maxPlaces) return;
    const place = placesData.find(p => p.slug === slug);
    if (place && !selectedPlaces.find(p => p.slug === slug)) {
      setSelectedPlaces([...selectedPlaces, { slug, data: place }]);
      setShowSearch(false);
      setSearchQuery('');
    }
  };

  const removePlace = (slug: string) => {
    setSelectedPlaces(selectedPlaces.filter(p => p.slug !== slug));
  };

  const filteredPlaces = placesData
    .filter(place => 
      place.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      place.district.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(place => !selectedPlaces.find(p => p.slug === place.slug))
    .slice(0, 8);

  const comparisonCategories = [
    {
      title: 'Basic Info',
      items: [
        { label: 'Location', key: (p: typeof placesData[0]) => `${p.district}, ${p.region}` },
        { label: 'Category', key: (p: typeof placesData[0]) => p.category },
        { label: 'Rating', key: (p: typeof placesData[0]) => p.rating ? `${p.rating} ⭐` : 'N/A' },
      ]
    },
    {
      title: 'Visit Details',
      items: [
        { label: 'Best Time', key: (p: typeof placesData[0]) => p.bestTime },
        { label: 'Duration', key: (p: typeof placesData[0]) => p.duration },
        { label: 'Starting Price', key: (p: typeof placesData[0]) => p.priceFrom || 'Contact' },
      ]
    },
    {
      title: 'Activities',
      items: [
        { label: 'Top Activities', key: (p: typeof placesData[0]) => p.activities?.join(', ') || 'N/A' },
        { label: 'Highlights', key: (p: typeof placesData[0]) => p.highlights?.slice(0, 2).join(', ') || 'N/A' },
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50 pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Compare Destinations</h1>
          <p className="text-xl text-gray-600">
            Select up to {maxPlaces} destinations to compare side-by-side
          </p>
        </motion.div>

        {/* Selection Slots */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {Array.from({ length: maxPlaces }).map((_, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-3xl p-6 shadow-lg border-2 border-gray-100"
            >
              {selectedPlaces[index] ? (
                <div className="relative">
                  <button
                    onClick={() => removePlace(selectedPlaces[index].slug)}
                    className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors z-10"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <img
                    src={selectedPlaces[index].data.heroImage.url}
                    alt={selectedPlaces[index].data.title}
                    className="w-full h-48 object-cover rounded-2xl mb-4"
                  />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {selectedPlaces[index].data.title}
                  </h3>
                  <p className="text-gray-600 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {selectedPlaces[index].data.district}
                  </p>
                </div>
              ) : (
                <button
                  onClick={() => setShowSearch(true)}
                  className="w-full h-64 border-2 border-dashed border-purple-300 rounded-2xl flex flex-col items-center justify-center text-purple-600 hover:bg-purple-50 transition-colors group"
                >
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Plus className="w-8 h-8" />
                  </div>
                  <span className="text-lg font-semibold">Add Destination</span>
                  <span className="text-sm text-gray-500 mt-2">Slot {index + 1}</span>
                </button>
              )}
            </motion.div>
          ))}
        </div>

        {/* Comparison Table */}
        {selectedPlaces.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-gray-100"
          >
            <div className="bg-gradient-to-r from-purple-600 to-orange-600 p-6">
              <h2 className="text-3xl font-bold text-white">Detailed Comparison</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="p-4 text-left font-semibold text-gray-700 border-r border-gray-200 sticky left-0 bg-gray-50">
                      Category
                    </th>
                    {selectedPlaces.map((place) => (
                      <th key={place.slug} className="p-4 text-center font-semibold text-gray-700">
                        {place.data.title}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparisonCategories.map((category, catIndex) => (
                    <>
                      <tr key={`cat-${catIndex}`} className="bg-purple-50">
                        <td 
                          colSpan={selectedPlaces.length + 1} 
                          className="p-4 font-bold text-purple-900 text-lg"
                        >
                          {category.title}
                        </td>
                      </tr>
                      {category.items.map((item, itemIndex) => (
                        <tr 
                          key={`item-${catIndex}-${itemIndex}`}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <td className="p-4 font-medium text-gray-700 border-r border-gray-200 sticky left-0 bg-white">
                            {item.label}
                          </td>
                          {selectedPlaces.map((place) => (
                            <td key={place.slug} className="p-4 text-center text-gray-600">
                              {item.key(place.data)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Recommendation */}
            <div className="bg-gradient-to-r from-purple-50 to-orange-50 p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Check className="w-6 h-6 text-green-600" />
                Our Recommendation
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                {selectedPlaces.map((place) => {
                  const score = (place.data.rating || 4) * 20; // Convert to percentage
                  return (
                    <div key={place.slug} className="bg-white rounded-2xl p-6 shadow-md">
                      <h4 className="font-bold text-gray-900 mb-3">{place.data.title}</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Overall Score</span>
                          <span className="text-lg font-bold text-purple-600">{score}%</span>
                        </div>
                        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-purple-500 to-orange-500"
                            style={{ width: `${score}%` }}
                          />
                        </div>
                        <a
                          href={`/place/${place.slug}`}
                          className="mt-4 flex items-center justify-center gap-2 w-full px-4 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors"
                        >
                          View Details
                          <ArrowRight className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {selectedPlaces.length < 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-white rounded-3xl shadow-lg"
          >
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-10 h-10 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Select at least 2 destinations
            </h3>
            <p className="text-gray-600">
              Choose destinations to see a detailed side-by-side comparison
            </p>
          </motion.div>
        )}

        {/* Search Modal */}
        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowSearch(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Select Destination</h3>
                  <button
                    onClick={() => setShowSearch(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search destinations..."
                  className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-6"
                  autoFocus
                />

                <div className="grid md:grid-cols-2 gap-4">
                  {filteredPlaces.map((place) => (
                    <button
                      key={place.slug}
                      onClick={() => addPlace(place.slug)}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl hover:bg-purple-50 hover:border-purple-200 border-2 border-transparent transition-all text-left group"
                    >
                      <img
                        src={place.heroImage.url}
                        alt={place.title}
                        className="w-20 h-20 object-cover rounded-xl"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                          {place.title}
                        </h4>
                        <p className="text-sm text-gray-600">{place.district}</p>
                        {place.rating && (
                          <p className="text-sm text-orange-600 flex items-center gap-1 mt-1">
                            <Star className="w-3 h-3 fill-orange-400" />
                            {place.rating}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {filteredPlaces.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No destinations found
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
