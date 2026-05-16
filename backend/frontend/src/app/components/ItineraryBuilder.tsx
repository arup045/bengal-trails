import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Plus, X, MapPin, Clock, DollarSign, Download, Share2, Trash2, GripVertical } from 'lucide-react';
import { placesData } from '../data/places-full';

import { API_BASE } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
interface ItineraryDay {
  id: string;
  day: number;
  date: string;
  activities: Activity[];
}

interface Activity {
  id: string;
  placeSlug: string;
  placeName: string;
  placeImage: string;
  startTime: string;
  duration: string;
  notes: string;
  estimatedCost: number;
}

export function ItineraryBuilder() {
  const { user, accessToken } = useAuth();
  const [itinerary, setItinerary] = useState<ItineraryDay[]>([]);
  const [tripName, setTripName] = useState('My West Bengal Adventure');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAddActivity, setShowAddActivity] = useState<number | null>(null);
  const [selectedPlace, setSelectedPlace] = useState('');

  // Initialize with 3 days
  useEffect(() => {
    const saved = localStorage.getItem('itinerary');
    if (saved) {
      setItinerary(JSON.parse(saved));
    } else {
      const initialDays: ItineraryDay[] = Array.from({ length: 3 }, (_, i) => ({
        id: `day-${i + 1}`,
        day: i + 1,
        date: addDays(startDate, i),
        activities: [],
      }));
      setItinerary(initialDays);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (itinerary.length > 0) {
      localStorage.setItem('itinerary', JSON.stringify(itinerary));
      // Also save to backend if logged in
      if (user && accessToken) {
        const tripName = (itinerary[0]?.tripName) || 'My Trip';
        fetch(`${API_BASE}/trip-plans`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ name: tripName, destinations: itinerary }),
        }).catch(() => { /* fall back to localStorage only */ });
      }
    }
  }, [itinerary]);

  const addDays = (date: string, days: number) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result.toISOString().split('T')[0];
  };

  const addDay = () => {
    const newDay: ItineraryDay = {
      id: `day-${itinerary.length + 1}`,
      day: itinerary.length + 1,
      date: addDays(startDate, itinerary.length),
      activities: [],
    };
    setItinerary([...itinerary, newDay]);
  };

  const removeDay = (dayId: string) => {
    setItinerary(itinerary.filter(d => d.id !== dayId).map((d, i) => ({
      ...d,
      day: i + 1,
      id: `day-${i + 1}`,
    })));
  };

  const addActivity = (dayId: string, placeSlug: string) => {
    const place = placesData.find(p => p.slug === placeSlug);
    if (!place) return;

    const newActivity: Activity = {
      id: `activity-${Date.now()}`,
      placeSlug: place.slug,
      placeName: place.title,
      placeImage: place.heroImage.url,
      startTime: '09:00',
      duration: '2 hours',
      notes: '',
      estimatedCost: parseInt(place.priceFrom?.replace(/[^0-9]/g, '') || '500'),
    };

    setItinerary(itinerary.map(day =>
      day.id === dayId
        ? { ...day, activities: [...day.activities, newActivity] }
        : day
    ));
    setShowAddActivity(null);
    setSelectedPlace('');
  };

  const removeActivity = (dayId: string, activityId: string) => {
    setItinerary(itinerary.map(day =>
      day.id === dayId
        ? { ...day, activities: day.activities.filter(a => a.id !== activityId) }
        : day
    ));
  };

  const updateActivity = (dayId: string, activityId: string, updates: Partial<Activity>) => {
    setItinerary(itinerary.map(day =>
      day.id === dayId
        ? {
            ...day,
            activities: day.activities.map(a =>
              a.id === activityId ? { ...a, ...updates } : a
            ),
          }
        : day
    ));
  };

  const totalCost = itinerary.reduce((sum, day) =>
    sum + day.activities.reduce((daySum, activity) => daySum + activity.estimatedCost, 0), 0
  );

  const exportToPDF = () => {
    // Simple text export (in real app, use jsPDF library)
    let content = `${tripName}\n\n`;
    itinerary.forEach(day => {
      content += `Day ${day.day} - ${day.date}\n`;
      day.activities.forEach(activity => {
        content += `  ${activity.startTime} - ${activity.placeName} (${activity.duration})\n`;
        if (activity.notes) content += `    Notes: ${activity.notes}\n`;
        content += `    Cost: ₹${activity.estimatedCost}\n`;
      });
      content += `\n`;
    });
    content += `\nTotal Estimated Cost: ₹${totalCost.toLocaleString()}`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tripName.replace(/\s+/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const shareItinerary = () => {
    const text = `Check out my ${tripName}! ${itinerary.length} days exploring West Bengal.`;
    if (navigator.share) {
      navigator.share({ title: tripName, text });
    } else {
      toast.error('Sharing not supported on this browser');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50 pt-32 pb-20">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 shadow-lg mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1">
              <input
                type="text"
                value={tripName}
                onChange={(e) => setTripName(e.target.value)}
                className="text-4xl font-bold text-gray-900 bg-transparent border-none focus:outline-none w-full"
              />
              <p className="text-gray-600 mt-2">Plan your perfect West Bengal journey</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={shareItinerary}
                className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
              >
                <Share2 className="w-5 h-5" />
                Share
              </button>
              <button
                onClick={exportToPDF}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-orange-600 text-white rounded-full hover:shadow-lg transition-all"
              >
                <Download className="w-5 h-5" />
                Export
              </button>
            </div>
          </div>

          {/* Trip Summary */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-2xl">
              <Calendar className="w-8 h-8 text-purple-600" />
              <div>
                <div className="text-sm text-gray-600">Duration</div>
                <div className="text-2xl font-bold text-purple-600">{itinerary.length} Days</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-2xl">
              <MapPin className="w-8 h-8 text-orange-600" />
              <div>
                <div className="text-sm text-gray-600">Destinations</div>
                <div className="text-2xl font-bold text-orange-600">
                  {new Set(itinerary.flatMap(d => d.activities.map(a => a.placeName))).size}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-2xl">
              <DollarSign className="w-8 h-8 text-green-600" />
              <div>
                <div className="text-sm text-gray-600">Est. Cost</div>
                <div className="text-2xl font-bold text-green-600">₹{totalCost.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Days Timeline */}
        <div className="space-y-6">
          {itinerary.map((day, dayIndex) => (
            <motion.div
              key={day.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: dayIndex * 0.1 }}
              className="bg-white rounded-3xl p-6 shadow-lg"
            >
              {/* Day Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-orange-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                    {day.day}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Day {day.day}</h3>
                    <p className="text-gray-600">{new Date(day.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</p>
                  </div>
                </div>
                <button
                  onClick={() => removeDay(day.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                  title="Remove day"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              {/* Activities */}
              <div className="space-y-4 mb-4">
                {day.activities.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No activities planned yet</p>
                  </div>
                ) : (
                  day.activities.map((activity, actIndex) => (
                    <div
                      key={activity.id}
                      className="flex gap-4 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors group"
                    >
                      <GripVertical className="w-5 h-5 text-gray-400 flex-shrink-0 mt-2 cursor-move" />
                      
                      <img
                        src={activity.placeImage}
                        alt={activity.placeName}
                        className="w-20 h-20 rounded-xl object-cover"
                      />
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900">{activity.placeName}</h4>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {activity.startTime}
                              </span>
                              <span>• {activity.duration}</span>
                              <span className="text-purple-600">₹{activity.estimatedCost.toLocaleString()}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => removeActivity(day.id, activity.id)}
                            className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-50 rounded-full transition-all"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                        
                        {activity.notes && (
                          <p className="text-sm text-gray-600 mt-2 italic">{activity.notes}</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add Activity Button */}
              {showAddActivity === dayIndex ? (
                <div className="bg-purple-50 rounded-2xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Add Activity</h4>
                  <select
                    value={selectedPlace}
                    onChange={(e) => setSelectedPlace(e.target.value)}
                    className="w-full px-4 py-3 bg-white border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 mb-3"
                  >
                    <option value="">Select a destination...</option>
                    {placesData.slice(0, 50).map(place => (
                      <option key={place.slug} value={place.slug}>
                        {place.title} - {place.district}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <button
                      onClick={() => selectedPlace && addActivity(day.id, selectedPlace)}
                      disabled={!selectedPlace}
                      className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => {
                        setShowAddActivity(null);
                        setSelectedPlace('');
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddActivity(dayIndex)}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 border-2 border-dashed border-purple-300 text-purple-600 rounded-2xl hover:bg-purple-50 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Add Activity
                </button>
              )}
            </motion.div>
          ))}
        </div>

        {/* Add Day Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={addDay}
          className="w-full mt-6 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-100 to-orange-100 text-purple-700 rounded-2xl hover:from-purple-200 hover:to-orange-200 transition-all"
        >
          <Plus className="w-6 h-6" />
          Add Another Day
        </motion.button>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-gradient-to-r from-purple-600 to-orange-600 rounded-3xl p-8 text-white"
        >
          <h3 className="text-2xl font-bold mb-4">✨ Planning Tips</h3>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>Group nearby destinations on the same day to save travel time</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>Check the best season to visit each destination</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>Budget extra for meals, local transport, and shopping</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>Book accommodations in advance during festival seasons</span>
            </li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
