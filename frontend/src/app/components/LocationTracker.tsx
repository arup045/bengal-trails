import { useState, useEffect } from 'react';
import { MapPin, Navigation, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getCurrentLocation, LocationCoords, LocationError } from '../utils/location';

interface LocationTrackerProps {
  onLocationUpdate?: (coords: LocationCoords) => void;
  showFloatingButton?: boolean;
}

export function LocationTracker({ onLocationUpdate, showFloatingButton = true }: LocationTrackerProps) {
  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleGetLocation = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const coords = await getCurrentLocation();
      setLocation(coords);
      
      // Store in localStorage
      localStorage.setItem('last_known_location', JSON.stringify(coords));
      
      // Notify parent component
      if (onLocationUpdate) {
        onLocationUpdate(coords);
      }
      
      // Show success toast
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      
    } catch (err: any) {
      setError(err.message || 'Failed to get location');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 5000);
    } finally {
      setLoading(false);
    }
  };

  // Auto-request location on mount
  useEffect(() => {
    const lastLocation = localStorage.getItem('last_known_location');
    if (lastLocation) {
      try {
        const coords = JSON.parse(lastLocation);
        setLocation(coords);
        if (onLocationUpdate) {
          onLocationUpdate(coords);
        }
      } catch (e) {
        console.error('Error parsing last location:', e);
      }
    } else {
      // Automatically request location on first visit
      handleGetLocation();
    }
  }, []);

  if (!showFloatingButton) {
    return null;
  }

  return (
    <>
      {/* Floating Location Button */}
      <motion.button
        onClick={handleGetLocation}
        disabled={loading}
        className="fixed bottom-24 right-6 z-40 bg-purple-600 hover:bg-purple-700 text-white rounded-full p-4 shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        title="Get my location"
      >
        {loading ? (
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <Navigation className={`w-6 h-6 ${location ? 'text-white' : ''}`} />
        )}
      </motion.button>

      {/* Toast Notifications */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-40 right-6 z-50 max-w-sm"
          >
            {error ? (
              <div className="bg-red-500 text-white rounded-lg shadow-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold">Location Error</p>
                  <p className="text-sm opacity-90">{error}</p>
                </div>
                <button
                  onClick={() => setShowToast(false)}
                  className="text-white hover:text-red-100 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="bg-green-500 text-white rounded-lg shadow-xl p-4 flex items-start gap-3">
                <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold">Location Found!</p>
                  <p className="text-sm opacity-90">
                    Now showing destinations near you
                  </p>
                </div>
                <button
                  onClick={() => setShowToast(false)}
                  className="text-white hover:text-green-100 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}