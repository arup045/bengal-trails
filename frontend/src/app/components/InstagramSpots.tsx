import { useState } from 'react';
import { motion } from 'motion/react';
import { Camera, Sunrise, Sunset, MapPin, Award, Clock, Aperture } from 'lucide-react';

export function InstagramSpots() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const spots = [
    {
      id: 1,
      name: 'Victoria Memorial at Sunrise',
      location: 'Kolkata',
      category: 'heritage',
      image: 'https://images.unsplash.com/photo-1596161913351-a77a1baa6f3e?w=800',
      bestTime: 'Golden Hour (6:00-7:30 AM)',
      difficulty: 'Easy',
      tips: ['Arrive before 6 AM for best light', 'Shoot from the front lawn', 'Use wide-angle lens'],
      camera: 'f/8, ISO 100, 1/125s',
      likes: '50K+',
    },
    {
      id: 2,
      name: 'Darjeeling Toy Train',
      location: 'Darjeeling',
      category: 'adventure',
      image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800',
      bestTime: 'Morning (8:00-10:00 AM)',
      difficulty: 'Medium',
      tips: ['Book window seat', 'Capture curves and mountain backdrop', 'Motion blur for speed effect'],
      camera: 'f/11, ISO 200, 1/500s',
      likes: '75K+',
    },
    {
      id: 3,
      name: 'Sundarbans Mangroves',
      location: 'Sundarbans',
      category: 'nature',
      image: 'https://images.unsplash.com/photo-1596178060671-7a80dc8059ea?w=800',
      bestTime: 'Afternoon (2:00-4:00 PM)',
      difficulty: 'Hard',
      tips: ['Bring telephoto lens', 'Watch for wildlife', 'Reflections in water'],
      camera: 'f/5.6, ISO 400, 1/1000s',
      likes: '60K+',
    },
    {
      id: 4,
      name: 'Howrah Bridge at Night',
      location: 'Kolkata',
      category: 'urban',
      image: 'https://images.unsplash.com/photo-1605640840605-14ac1855827b?w=800',
      bestTime: 'Blue Hour (7:00-8:00 PM)',
      difficulty: 'Medium',
      tips: ['Use tripod for long exposure', 'Shoot from Mallick Ghat', 'Include river reflections'],
      camera: 'f/16, ISO 100, 30s',
      likes: '100K+',
    },
    {
      id: 5,
      name: 'Digha Beach Sunset',
      location: 'Digha',
      category: 'beach',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
      bestTime: 'Sunset (5:30-6:30 PM)',
      difficulty: 'Easy',
      tips: ['Low angle shots', 'Silhouettes of people', 'Use ND filter'],
      camera: 'f/16, ISO 100, 1/60s',
      likes: '85K+',
    },
    {
      id: 6,
      name: 'Bishnupur Terracotta Temples',
      location: 'Bishnupur',
      category: 'heritage',
      image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800',
      bestTime: 'Afternoon (12:00-2:00 PM)',
      difficulty: 'Easy',
      tips: ['Detail shots of carvings', 'Symmetrical compositions', 'Macro lens for details'],
      camera: 'f/8, ISO 200, 1/250s',
      likes: '40K+',
    },
    {
      id: 7,
      name: 'Tiger Hill Sunrise',
      location: 'Darjeeling',
      category: 'nature',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      bestTime: 'Pre-Dawn (4:30-6:00 AM)',
      difficulty: 'Hard',
      tips: ['Arrive 1 hour early', 'Bring warm clothes', 'Kanchenjunga in background'],
      camera: 'f/11, ISO 100, 1/125s',
      likes: '120K+',
    },
    {
      id: 8,
      name: 'Kumartuli Idol Makers',
      location: 'Kolkata',
      category: 'cultural',
      image: 'https://images.unsplash.com/photo-1582735689630-e8f02cbb9d23?w=800',
      bestTime: 'Morning (9:00-11:00 AM)',
      difficulty: 'Medium',
      tips: ['Ask permission before shooting', 'Capture artisans at work', 'Natural light preferred'],
      camera: 'f/2.8, ISO 800, 1/250s',
      likes: '55K+',
    },
    {
      id: 9,
      name: 'College Street Book Market',
      location: 'Kolkata',
      category: 'urban',
      image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800',
      bestTime: 'Late Afternoon (4:00-6:00 PM)',
      difficulty: 'Easy',
      tips: ['Street photography mode', 'Capture book stacks', 'People reading'],
      camera: 'f/4, ISO 400, 1/250s',
      likes: '45K+',
    },
    {
      id: 10,
      name: 'Tea Gardens Panorama',
      location: 'Darjeeling',
      category: 'nature',
      image: 'https://images.unsplash.com/photo-1563789031959-4c02bcb41319?w=800',
      bestTime: 'Morning (7:00-9:00 AM)',
      difficulty: 'Medium',
      tips: ['Drone shots if allowed', 'Leading lines of tea rows', 'Misty atmosphere'],
      camera: 'f/11, ISO 100, 1/250s',
      likes: '90K+',
    },
    {
      id: 11,
      name: 'Prinsep Ghat at Sunset',
      location: 'Kolkata',
      category: 'heritage',
      image: 'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=800',
      bestTime: 'Sunset (5:00-6:30 PM)',
      difficulty: 'Easy',
      tips: ['Boat silhouettes', 'Monument framing', 'River reflections'],
      camera: 'f/8, ISO 200, 1/250s',
      likes: '70K+',
    },
    {
      id: 12,
      name: 'Shantiniketan Red Soil',
      location: 'Shantiniketan',
      category: 'cultural',
      image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800',
      bestTime: 'Afternoon (3:00-5:00 PM)',
      difficulty: 'Easy',
      tips: ['Contrast red earth and green', 'Local life candids', 'Cultural festivals'],
      camera: 'f/5.6, ISO 200, 1/500s',
      likes: '50K+',
    },
  ];

  const categories = [
    { id: 'all', name: 'All Spots', icon: '📸' },
    { id: 'heritage', name: 'Heritage', icon: '🏛️' },
    { id: 'nature', name: 'Nature', icon: '🌿' },
    { id: 'urban', name: 'Urban', icon: '🏙️' },
    { id: 'beach', name: 'Beach', icon: '🏖️' },
    { id: 'cultural', name: 'Cultural', icon: '🎭' },
    { id: 'adventure', name: 'Adventure', icon: '⛰️' },
  ];

  const filteredSpots = selectedCategory === 'all'
    ? spots
    : spots.filter(s => s.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full mb-6">
            <Camera className="w-5 h-5" />
            <span className="font-semibold">Instagram-Worthy Spots</span>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Most Photogenic Places</h1>
          <p className="text-xl text-gray-600">
            Discover West Bengal's most Instagram-worthy locations with pro photography tips
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-6 py-3 rounded-full font-semibold transition-all ${
                selectedCategory === cat.id
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
              }`}
            >
              <span className="mr-2">{cat.icon}</span>
              {cat.name}
            </button>
          ))}
        </motion.div>

        {/* Spots Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSpots.map((spot, index) => (
            <motion.div
              key={spot.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-all group"
            >
              {/* Image */}
              <div className="relative h-64 overflow-hidden">
                <img
                  src={spot.image}
                  alt={spot.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 px-3 py-1 bg-pink-500 text-white rounded-full text-sm font-semibold flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  {spot.likes}
                </div>
                <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-sm font-semibold">
                  {spot.difficulty}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{spot.name}</h3>
                <div className="flex items-center gap-2 text-gray-600 mb-4">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{spot.location}</span>
                </div>

                {/* Best Time */}
                <div className="flex items-center gap-2 mb-4 p-3 bg-orange-50 rounded-xl">
                  <Clock className="w-4 h-4 text-orange-600" />
                  <div>
                    <div className="text-xs text-gray-600">Best Time</div>
                    <div className="text-sm font-semibold text-gray-900">{spot.bestTime}</div>
                  </div>
                </div>

                {/* Camera Settings */}
                <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 rounded-xl">
                  <Aperture className="w-4 h-4 text-blue-600" />
                  <div>
                    <div className="text-xs text-gray-600">Recommended Settings</div>
                    <div className="text-sm font-semibold text-gray-900">{spot.camera}</div>
                  </div>
                </div>

                {/* Photography Tips */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">📷 Pro Tips:</h4>
                  <ul className="space-y-1">
                    {spot.tips.map((tip, idx) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-pink-500 mt-1">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Photography Guide */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 bg-gradient-to-r from-pink-600 to-purple-600 rounded-3xl p-8 text-white"
        >
          <h3 className="text-2xl font-bold mb-6">📸 Golden Hour Guide</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Sunrise className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">Morning Golden Hour</h4>
                  <p className="text-sm opacity-90">30 min after sunrise</p>
                </div>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Soft, warm light perfect for landscapes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Less crowded, peaceful atmosphere</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Great for heritage monuments</span>
                </li>
              </ul>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Sunset className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">Evening Golden Hour</h4>
                  <p className="text-sm opacity-90">1 hour before sunset</p>
                </div>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Magical orange-pink hues</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Perfect for silhouettes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Ideal for riverside and beach shots</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 p-6 bg-white/10 rounded-2xl">
            <h4 className="font-bold mb-3">Quick Photography Checklist</h4>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>✓ Check golden hour timing</div>
              <div>✓ Clean camera lens</div>
              <div>✓ Extra batteries charged</div>
              <div>✓ Memory cards ready</div>
              <div>✓ Tripod if needed</div>
              <div>✓ Respect local rules</div>
            </div>
          </div>
        </motion.div>

        {/* Instagram Challenge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 bg-white rounded-3xl p-8 shadow-lg text-center"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-4">🏆 #GOBROPhotoChallenge</h3>
          <p className="text-gray-600 mb-6">
            Share your best West Bengal shots with <span className="font-semibold text-purple-600">#GOBROPhotoChallenge</span> 
            <br />Tag us and get featured on our page!
          </p>
          <div className="flex justify-center gap-4">
            <span className="px-4 py-2 bg-pink-100 text-pink-600 rounded-full text-sm font-semibold">
              Best Photo This Month Wins!
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
