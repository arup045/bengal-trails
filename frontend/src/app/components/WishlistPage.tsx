import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Heart, Trash2, MapPin, Navigation, Share2, X } from 'lucide-react';
import { useWishlistSync } from '../utils/useWishlistSync';
import { LoadingSkeleton, EmptyState } from './LoadingSkeleton';
import { toast } from 'sonner';

interface WishlistItem {
  slug: string;
  title: string;
  image: string;
  region: string;
  category: string;
  description: string;
  price?: number;
}

export function WishlistPage() {
  const { wishlist, isLoading, removeFromWishlist, clearWishlist } = useWishlistSync();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleRemove = async (slug: string, title: string) => {
    await removeFromWishlist(slug);
    toast.success(`${title} removed from wishlist`);
  };

  const handleClear = async () => {
    await clearWishlist();
    toast.success('Wishlist cleared');
    setShowClearConfirm(false);
  };

  const openGoogleMaps = (slug: string) => {
    // In a real app, you'd get coordinates from the destination data
    const destination = wishlist.find(item => item.slug === slug);
    if (destination) {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination.title + ', West Bengal')}`,
        '_blank'
      );
    }
  };

  const shareWishlist = () => {
    const titles = wishlist.map(item => item.title).join(', ');
    const text = `Check out my West Bengal travel wishlist: ${titles}`;
    const url = window.location.href;
    
    if (navigator.share) {
      navigator.share({ title: 'My Bengal Trails Wishlist', text, url });
    } else {
      navigator.clipboard.writeText(`${text}\n${url}`);
      toast.success('Wishlist copied to clipboard!');
    }
  };

  const addToTripPlanner = (item: WishlistItem) => {
    // Store selected destination for trip planner
    sessionStorage.setItem('addToTrip', JSON.stringify(item));
    window.location.hash = '#/planner';
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-purple-50 pt-32 pb-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto text-center"
          >
            <div className="w-32 h-32 bg-gradient-to-br from-orange-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <Heart className="w-16 h-16 text-purple-600" />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Your Wishlist is Empty
            </h1>
            
            <p className="text-xl text-gray-600 mb-8">
              Start adding destinations to your wishlist by clicking the heart icon on any place you'd like to visit!
            </p>
            
            <a
              href="/explore"
              className="inline-flex items-center gap-2 bg-purple-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-purple-700 transition-all hover:scale-105 shadow-lg"
            >
              Explore Destinations
            </a>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-purple-50 pt-32 pb-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <Heart className="w-10 h-10 text-purple-600 fill-purple-600" />
                My Wishlist
              </h1>
              <p className="text-xl text-gray-600">
                {wishlist.length} {wishlist.length === 1 ? 'destination' : 'destinations'} saved
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={shareWishlist}
                className="flex items-center gap-2 bg-white text-purple-600 px-6 py-3 rounded-full font-semibold hover:bg-purple-50 transition-all border-2 border-purple-600"
              >
                <Share2 className="w-5 h-5" />
                Share Wishlist
              </button>
              
              <button
                onClick={() => setShowClearConfirm(true)}
                className="flex items-center gap-2 bg-white text-red-600 px-6 py-3 rounded-full font-semibold hover:bg-red-50 transition-all border-2 border-red-600"
              >
                <Trash2 className="w-5 h-5" />
                Clear All
              </button>
            </div>
          </div>
        </motion.div>

        {/* Wishlist Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {wishlist.map((item, index) => (
            <motion.div
              key={item.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all group"
            >
              {/* Image */}
              <div className="relative h-64 overflow-hidden">
                <a href={`/explore/${item.slug}`}>
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </a>
                
                {/* Remove from Wishlist */}
                <button
                  onClick={() => handleRemove(item.slug, item.title)}
                  className="absolute top-4 right-4 w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-all shadow-lg hover:scale-110"
                  title="Remove from wishlist"
                >
                  <X className="w-5 h-5" />
                </button>
                
                {/* Category Badge */}
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold text-gray-800">
                  {item.category}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <a href={`/explore/${item.slug}`}>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 hover:text-purple-600 transition-colors">
                    {item.title}
                  </h3>
                </a>
                
                <div className="flex items-center gap-2 text-gray-600 mb-3">
                  <MapPin className="w-4 h-4" />
                  <span>{item.region}</span>
                </div>
                
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {item.description}
                </p>
                
                {item.price && (
                  <div className="text-lg font-bold text-purple-600 mb-4">
                    {item.price.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => addToTripPlanner(item)}
                    className="flex-1 bg-purple-600 text-white px-4 py-3 rounded-xl font-semibold hover:bg-purple-700 transition-all"
                  >
                    Add to Trip
                  </button>
                  
                  <button
                    onClick={() => openGoogleMaps(item.slug)}
                    className="bg-purple-100 text-purple-600 p-3 rounded-xl hover:bg-purple-200 transition-all"
                    title="Get Directions"
                  >
                    <Navigation className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tips Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 bg-gradient-to-r from-orange-100 to-purple-100 rounded-2xl p-8"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-4">💡 Wishlist Tips</h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-purple-600">•</span>
              <span>Click "Add to Trip" to start planning your itinerary</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600">•</span>
              <span>Share your wishlist with travel companions</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600">•</span>
              <span>Use the compass icon to get directions to any destination</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600">•</span>
              <span>Your wishlist is saved locally and persists across sessions</span>
            </li>
          </ul>
        </motion.div>
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowClearConfirm(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Clear Wishlist?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to remove all {wishlist.length} destinations from your wishlist? This action cannot be undone.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleClear}
                className="flex-1 bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 transition-all"
              >
                Clear All
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}