import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Mail, 
  Calendar, 
  MapPin, 
  Heart, 
  Briefcase, 
  Phone, 
  Edit2, 
  Save, 
  X, 
  Camera,
  Globe,
  Users,
  Mountain,
  Sparkles,
  CheckCircle2,
  Loader2,
  LogOut
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface ProfileFormData {
  name: string;
  email: string;
  phone?: string;
  location?: string;
  country?: string;
  bio?: string;
  interests?: string[];
  budget?: string;
  tripType?: string;
}

export function UserProfilePage() {
  const { user, updateProfile, signOut, refreshUser, deleteAccount } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'wishlist' | 'itineraries'>('profile');
  
  const [formData, setFormData] = useState<ProfileFormData>({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    location: '',
    country: '',
    bio: '',
    interests: [],
    budget: '',
    tripType: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: (user as any).phone || '',
        location: (user as any).location || '',
        country: (user as any).country || '',
        bio: (user as any).bio || '',
        interests: (user as any).interests || [],
        budget: (user as any).budget || '',
        tripType: (user as any).tripType || ''
      });
    }
  }, [user]);

  const interestOptions = [
    { label: 'Hills & Tea', icon: Mountain },
    { label: 'Heritage & History', icon: Camera },
    { label: 'Festivals & Culture', icon: Sparkles },
    { label: 'Beaches & Seasides', icon: MapPin },
    { label: 'Wildlife & Nature', icon: Heart },
    { label: 'City & Nightlife', icon: Users },
  ];

  const handleSave = async () => {
    setLoading(true);
    setSaveSuccess(false);

    const result = await updateProfile({
      name: formData.name,
      ...(formData.phone && { phone: formData.phone }),
      ...(formData.location && { location: formData.location }),
      ...(formData.country && { country: formData.country }),
      ...(formData.bio && { bio: formData.bio }),
      ...(formData.interests && { interests: formData.interests }),
      ...(formData.budget && { budget: formData.budget }),
      ...(formData.tripType && { tripType: formData.tripType })
    } as any);

    setLoading(false);

    if (result.success) {
      setSaveSuccess(true);
      setIsEditing(false);
      await refreshUser();
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests?.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...(prev.interests || []), interest]
    }));
  };

  const handleSignOut = async () => {
    await signOut();
    window.location.hash = '/';
  };

  const handleDeleteAccount = async () => {
    const confirmText = window.prompt(
      'This will permanently delete your account, wishlist, and itineraries. This cannot be undone.\n\nType DELETE to confirm:'
    );
    if (confirmText !== 'DELETE') return;
    const result = await deleteAccount();
    if (result.success) {
      window.location.hash = '/';
    } else {
      toast.error(result.error || 'Could not delete account. Please contact support.');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please sign in to view your profile</h2>
          <button
            onClick={() => window.location.hash = '/signin'}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:shadow-lg transition-all"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50 pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-6">
        {/* Success Message */}
        <AnimatePresence>
          {saveSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="fixed top-24 right-6 z-50 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Profile updated successfully!</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl shadow-purple-100/50 p-8 mb-6"
        >
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Profile Picture */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-white text-4xl font-bold shadow-xl">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <button className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-purple-600 hover:bg-purple-50 transition-colors" aria-label="Change profile photo">
                <Camera className="w-5 h-5" />
              </button>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{user.name}</h1>
              <p className="text-gray-600 flex items-center gap-2 justify-center md:justify-start mb-1">
                <Mail className="w-4 h-4" />
                {user.email}
              </p>
              <p className="text-gray-500 text-sm flex items-center gap-2 justify-center md:justify-start">
                <Calendar className="w-4 h-4" />
                Member since {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {!isEditing ? (
                <>
                  <motion.button
                    onClick={() => setIsEditing(true)}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Profile
                  </motion.button>
                  <motion.button
                    onClick={handleSignOut}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </motion.button>
                  <motion.button
                    onClick={handleDeleteAccount}
                    className="px-6 py-3 bg-red-50 text-red-700 rounded-xl hover:bg-red-100 transition-all flex items-center gap-2 border border-red-200"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    aria-label="Delete account permanently"
                  >
                    Delete account
                  </motion.button>
                </>
              ) : (
                <>
                  <motion.button
                    onClick={handleSave}
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Save Changes
                  </motion.button>
                  <motion.button
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </motion.button>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white rounded-2xl p-2 shadow-lg shadow-purple-100/50">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-3 px-6 rounded-xl transition-all duration-300 font-medium ${
              activeTab === 'profile'
                ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Profile Details
          </button>
          <button
            onClick={() => setActiveTab('wishlist')}
            className={`flex-1 py-3 px-6 rounded-xl transition-all duration-300 font-medium ${
              activeTab === 'wishlist'
                ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Wishlist ({user.wishlist?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('itineraries')}
            className={`flex-1 py-3 px-6 rounded-xl transition-all duration-300 font-medium ${
              activeTab === 'itineraries'
                ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Itineraries ({user.savedItineraries?.length || 0})
          </button>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-3xl shadow-xl shadow-purple-100/50 p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Personal Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  ) : (
                    <p className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">{formData.name || 'Not set'}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email Address
                  </label>
                  <p className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">{formData.email}</p>
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  ) : (
                    <p className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">{formData.phone || 'Not set'}</p>
                  )}
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    City
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Kolkata"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  ) : (
                    <p className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">{formData.location || 'Not set'}</p>
                  )}
                </div>

                {/* Country */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Globe className="w-4 h-4 inline mr-2" />
                    Country
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      placeholder="India"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  ) : (
                    <p className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">{formData.country || 'Not set'}</p>
                  )}
                </div>

                {/* Trip Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Users className="w-4 h-4 inline mr-2" />
                    Travel Style
                  </label>
                  {isEditing ? (
                    <select
                      value={formData.tripType}
                      onChange={(e) => setFormData({ ...formData, tripType: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    >
                      <option value="">Select...</option>
                      <option value="Solo">Solo Traveler</option>
                      <option value="Family">Family Trips</option>
                      <option value="Friends">With Friends</option>
                      <option value="Couple">Couple Travel</option>
                    </select>
                  ) : (
                    <p className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">{formData.tripType || 'Not set'}</p>
                  )}
                </div>

                {/* Budget */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Briefcase className="w-4 h-4 inline mr-2" />
                    Budget Preference
                  </label>
                  {isEditing ? (
                    <select
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    >
                      <option value="">Select...</option>
                      <option value="Budget">Budget</option>
                      <option value="Mid-range">Mid-range</option>
                      <option value="Premium">Premium</option>
                    </select>
                  ) : (
                    <p className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">{formData.budget || 'Not set'}</p>
                  )}
                </div>
              </div>

              {/* Bio */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  About Me
                </label>
                {isEditing ? (
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell us about yourself and your travel experiences..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                  />
                ) : (
                  <p className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">{formData.bio || 'Not set'}</p>
                )}
              </div>

              {/* Travel Interests */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <Heart className="w-4 h-4 inline mr-2" />
                  Travel Interests
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {interestOptions.map((interest) => {
                    const Icon = interest.icon;
                    const isSelected = formData.interests?.includes(interest.label);
                    return (
                      <button
                        key={interest.label}
                        type="button"
                        onClick={() => isEditing && toggleInterest(interest.label)}
                        disabled={!isEditing}
                        className={`p-4 rounded-xl border transition-all ${
                          isSelected
                            ? 'bg-gradient-to-r from-purple-600 to-purple-700 border-purple-500 text-white shadow-md'
                            : 'bg-gray-50 border-gray-200 text-gray-700'
                        } ${isEditing ? 'cursor-pointer hover:shadow-lg' : 'cursor-default'}`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="w-5 h-5" />
                          <span className="text-sm font-medium">{interest.label}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'wishlist' && (
            <motion.div
              key="wishlist"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-3xl shadow-xl shadow-purple-100/50 p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">My Wishlist</h2>
              {user.wishlist && user.wishlist.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {user.wishlist.map((item: any, index: number) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <p className="text-gray-900">{item}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">Your wishlist is empty</p>
                  <button
                    onClick={() => window.location.hash = '/explore'}
                    className="mt-4 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:shadow-lg transition-all"
                  >
                    Explore Destinations
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'itineraries' && (
            <motion.div
              key="itineraries"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-3xl shadow-xl shadow-purple-100/50 p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Saved Itineraries</h2>
              {user.savedItineraries && user.savedItineraries.length > 0 ? (
                <div className="space-y-4">
                  {user.savedItineraries.map((itinerary: any, index: number) => (
                    <div key={index} className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                      <h3 className="font-semibold text-gray-900 mb-2">{itinerary.name || `Itinerary ${index + 1}`}</h3>
                      <p className="text-gray-600 text-sm">{itinerary.description || 'No description'}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No saved itineraries yet</p>
                  <button
                    onClick={() => window.location.hash = '/trip-planner'}
                    className="mt-4 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:shadow-lg transition-all"
                  >
                    Plan a Trip
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
