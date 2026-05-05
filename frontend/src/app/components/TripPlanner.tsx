import { useState } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { API_BASE } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, X, Calendar, MapPin, Clock, IndianRupee, Download, Share2, Trash2 } from 'lucide-react';
import { placesData } from '../data/places-full';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface TripDay {
  id: string;
  day: number;
  places: {
    slug: string;
    title: string;
    image: string;
    priceFrom: string;
    region: string;
  }[];
}

export function TripPlanner() {
  const { user, accessToken } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [tripName, setTripName] = useState('My West Bengal Trip');
  const [tripDays, setTripDays] = useState<TripDay[]>([
    { id: '1', day: 1, places: [] }
  ]);
  const [showPlacePicker, setShowPlacePicker] = useState(false);
  const [selectedDayForAdd, setSelectedDayForAdd] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState('');

  const addDay = () => {
    const newDay = {
      id: Date.now().toString(),
      day: tripDays.length + 1,
      places: []
    };
    setTripDays([...tripDays, newDay]);
  };

  const removeDay = (dayId: string) => {
    if (tripDays.length === 1) return;
    const filtered = tripDays.filter(d => d.id !== dayId);
    const reordered = filtered.map((d, idx) => ({ ...d, day: idx + 1 }));
    setTripDays(reordered);
  };

  const addPlaceToDay = (dayNumber: number, place: any) => {
    setTripDays(tripDays.map(day => {
      if (day.day === dayNumber) {
        return {
          ...day,
          places: [...day.places, {
            slug: place.slug,
            title: place.title,
            image: place.heroImage.url,
            priceFrom: place.priceFrom || 'Free',
            region: place.region
          }]
        };
      }
      return day;
    }));
    setShowPlacePicker(false);
  };

  const removePlaceFromDay = (dayNumber: number, placeSlug: string) => {
    setTripDays(tripDays.map(day => {
      if (day.day === dayNumber) {
        return {
          ...day,
          places: day.places.filter(p => p.slug !== placeSlug)
        };
      }
      return day;
    }));
  };

  const calculateTotalBudget = () => {
    let total = 0;
    tripDays.forEach(day => {
      day.places.forEach(place => {
        const price = place.priceFrom;
        if (price && !price.toLowerCase().includes('free')) {
          const num = parseInt(price.replace(/[^0-9]/g, ''));
          if (!isNaN(num)) total += num;
        }
      });
    });
    return total;
  };

  const getTotalPlaces = () => {
    return tripDays.reduce((sum, day) => sum + day.places.length, 0);
  };

  const filteredPlaces = placesData.filter(place =>
    place.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    place.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
    place.district.toLowerCase().includes(searchQuery.toLowerCase())
  );

  
  const saveTrip = async () => {
    if (!user || !accessToken) {
      toast.error('Please sign in to save your trip');
      window.location.hash = '#/signin';
      return;
    }
    setIsSaving(true);
    try {
      const totalBudget = calculateTotalBudget();
      const res = await fetch(`${API_BASE}/trip-plans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          name: tripName,
          destinations: tripDays,
          totalBudget,
          status: 'planning',
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Trip saved to your account!');
      } else {
        toast.error(data.error || 'Failed to save trip');
      }
    } catch {
      toast.error('Network error — please try again');
    } finally {
      setIsSaving(false);
    }
  };

  const downloadItinerary = () => {
    let text = `${tripName}\n${'='.repeat(50)}\n\n`;
    tripDays.forEach(day => {
      text += `Day ${day.day}:\n`;
      if (day.places.length === 0) {
        text += '  No places added\n';
      } else {
        day.places.forEach((place, idx) => {
          text += `  ${idx + 1}. ${place.title} (${place.region}) - ${place.priceFrom}\n`;
        });
      }
      text += '\n';
    });
    text += `\nTotal Places: ${getTotalPlaces()}\n`;
    text += `Estimated Budget: ₹${calculateTotalBudget().toLocaleString()}\n`;
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tripName.replace(/\s+/g, '-')}-itinerary.txt`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl md:text-5xl mb-2">Trip Planner</h1>
              <p className="text-gray-600 text-lg">Plan your perfect West Bengal itinerary</p>
            </div>
            <a
              href="#/"
              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-full transition-colors"
            >
              Back to Home
            </a>
          </div>

          {/* Trip Name Input */}
          <input
            type="text"
            value={tripName}
            onChange={(e) => setTripName(e.target.value)}
            className="text-2xl w-full max-w-md px-4 py-2 border-b-2 border-purple-600 focus:outline-none bg-transparent"
            placeholder="Enter trip name..."
          />
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Planning Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Days */}
            <AnimatePresence>
              {tripDays.map((day) => (
                <motion.div
                  key={day.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-white rounded-2xl p-6 shadow-lg"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center">
                        {day.day}
                      </div>
                      <h3 className="text-xl">Day {day.day}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedDayForAdd(day.day);
                          setShowPlacePicker(true);
                        }}
                        className="px-4 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add Place
                      </button>
                      {tripDays.length > 1 && (
                        <button
                          onClick={() => removeDay(day.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {day.places.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                      <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No places added for this day</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {day.places.map((place, idx) => (
                        <motion.div
                          key={place.slug}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:shadow-md transition-all group"
                        >
                          <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0">
                            {idx + 1}
                          </div>
                          <ImageWithFallback
                            src={place.image}
                            alt={place.title}
                            className="w-20 h-20 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <h4 className="text-lg mb-1">{place.title}</h4>
                            <p className="text-sm text-gray-600 flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              {place.region}
                            </p>
                            <p className="text-purple-600 text-sm mt-1">{place.priceFrom}</p>
                          </div>
                          <button
                            onClick={() => removePlaceFromDay(day.day, place.slug)}
                            className="opacity-0 group-hover:opacity-100 p-2 text-red-600 hover:bg-red-50 rounded-full transition-all"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Add Day Button */}
            <button
              onClick={addDay}
              className="w-full py-4 border-2 border-dashed border-purple-300 rounded-2xl text-purple-600 hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Another Day
            </button>
          </div>

          {/* Sidebar Summary */}
          <div className="space-y-6">
            {/* Trip Summary */}
            <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl p-6 text-white sticky top-24">
              <h3 className="text-xl mb-6">Trip Summary</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    <span>Total Days</span>
                  </div>
                  <span className="text-2xl">{tripDays.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    <span>Places</span>
                  </div>
                  <span className="text-2xl">{getTotalPlaces()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IndianRupee className="w-5 h-5" />
                    <span>Est. Budget</span>
                  </div>
                  <span className="text-2xl">₹{(calculateTotalBudget()).toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={saveTrip}
                disabled={isSaving}
                className="w-full mt-6 bg-purple-600 text-white py-3 rounded-full hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {isSaving ? 'Saving...' : 'Save Trip'}
              </button>
              <button
                onClick={downloadItinerary}
                className="w-full mt-3 bg-white text-purple-600 py-3 rounded-full hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download Itinerary
              </button>
            </div>

            {/* Tips */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg mb-4">Planning Tips</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-purple-600">•</span>
                  <span>Visit nearby places on the same day to save travel time</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600">•</span>
                  <span>Check weather conditions before finalizing</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600">•</span>
                  <span>Book accommodations in advance during peak season</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600">•</span>
                  <span>Add buffer time for travel between locations</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Place Picker Modal */}
      <AnimatePresence>
        {showPlacePicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6"
            onClick={() => setShowPlacePicker(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[80vh] overflow-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl">Add Place to Day {selectedDayForAdd}</h3>
                <button
                  onClick={() => setShowPlacePicker(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Search */}
              <input
                type="text"
                placeholder="Search destinations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl mb-6 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />

              {/* Places Grid */}
              <div className="grid md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {filteredPlaces.map((place) => (
                  <div
                    key={place.slug}
                    onClick={() => addPlaceToDay(selectedDayForAdd, place)}
                    className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-purple-600 hover:bg-purple-50 cursor-pointer transition-all"
                  >
                    <ImageWithFallback
                      src={place.heroImage.url}
                      alt={place.heroImage.alt}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="text-lg mb-1">{place.title}</h4>
                      <p className="text-sm text-gray-600">{place.region}</p>
                      <p className="text-purple-600 text-sm mt-1">{place.priceFrom || 'Free'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
