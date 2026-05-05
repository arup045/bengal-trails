import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar as CalendarIcon, MapPin, Clock, Filter, CalendarPlus, ExternalLink } from 'lucide-react';

interface Festival {
  id: string;
  name: string;
  description: string;
  date: string;
  endDate?: string;
  month: string;
  location: string;
  region: string;
  category: 'religious' | 'cultural' | 'harvest' | 'fair' | 'music';
  image: string;
  highlights: string[];
}

const festivals: Festival[] = [
  {
    id: '1',
    name: 'Durga Puja',
    description: 'The grandest festival of West Bengal, celebrating Goddess Durga\'s victory over evil',
    date: '2026-10-15',
    endDate: '2026-10-19',
    month: 'October',
    location: 'Kolkata',
    region: 'South Bengal',
    category: 'religious',
    image: 'https://images.unsplash.com/photo-1601842289799-1421935fc0f3?w=800',
    highlights: ['Pandal hopping', 'Traditional rituals', 'Cultural performances', 'Street food'],
  },
  {
    id: '2',
    name: 'Poush Mela',
    description: 'Traditional fair celebrating Bengali culture, music, and arts',
    date: '2026-12-25',
    endDate: '2026-12-27',
    month: 'December',
    location: 'Shantiniketan',
    region: 'Central Bengal',
    category: 'cultural',
    image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800',
    highlights: ['Baul music', 'Handicrafts', 'Folk dances', 'Local cuisine'],
  },
  {
    id: '3',
    name: 'Kali Puja',
    description: 'Night-long celebration honoring Goddess Kali with fireworks',
    date: '2026-11-04',
    month: 'November',
    location: 'Kolkata',
    region: 'South Bengal',
    category: 'religious',
    image: 'https://images.unsplash.com/photo-1604608672516-f1b9b1d26b92?w=800',
    highlights: ['Temple visits', 'Fireworks', 'Night celebrations', 'Sweets'],
  },
  {
    id: '4',
    name: 'Nabanna',
    description: 'Harvest festival celebrating the new rice of the season',
    date: '2026-01-14',
    month: 'January',
    location: 'Rural Bengal',
    region: 'All Regions',
    category: 'harvest',
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800',
    highlights: ['Rice rituals', 'Village fairs', 'Traditional songs', 'Community feasts'],
  },
  {
    id: '5',
    name: 'Dol Jatra (Holi)',
    description: 'Festival of colors celebrating spring with music and dance',
    date: '2026-03-14',
    month: 'March',
    location: 'Shantiniketan',
    region: 'Central Bengal',
    category: 'cultural',
    image: 'https://images.unsplash.com/photo-1583339793403-3d9b001b6008?w=800',
    highlights: ['Color play', 'Baul songs', 'Spring celebration', 'Street parties'],
  },
  {
    id: '6',
    name: 'Rath Yatra',
    description: 'Chariot festival of Lord Jagannath with grand processions',
    date: '2026-07-20',
    month: 'July',
    location: 'Multiple Cities',
    region: 'All Regions',
    category: 'religious',
    image: 'https://images.unsplash.com/photo-1604608672516-f1b9b1d26b92?w=800',
    highlights: ['Chariot procession', 'Street dances', 'Prasad distribution', 'Community gathering'],
  },
  {
    id: '7',
    name: 'Ganga Sagar Mela',
    description: 'Holy pilgrimage at the confluence of Ganga and Bay of Bengal',
    date: '2026-01-15',
    month: 'January',
    location: 'Sagar Island',
    region: 'South Bengal',
    category: 'religious',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
    highlights: ['Holy dip', 'Temple visit', 'Pilgrimage', 'Spiritual gatherings'],
  },
  {
    id: '8',
    name: 'Dover Lane Music Conference',
    description: 'Prestigious Indian classical music festival',
    date: '2026-01-22',
    endDate: '2026-01-26',
    month: 'January',
    location: 'Kolkata',
    region: 'South Bengal',
    category: 'music',
    image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800',
    highlights: ['Classical concerts', 'Legendary artists', 'All-night music', 'Cultural heritage'],
  },
  {
    id: '9',
    name: 'Jamai Sasthi',
    description: 'Day dedicated to son-in-laws with special family celebrations',
    date: '2026-06-10',
    month: 'June',
    location: 'All Bengal',
    region: 'All Regions',
    category: 'cultural',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800',
    highlights: ['Family feast', 'Traditional dishes', 'Blessings', 'Cultural bonding'],
  },
  {
    id: '10',
    name: 'Bhai Phonta',
    description: 'Sisters pray for brothers\' well-being and prosperity',
    date: '2026-11-06',
    month: 'November',
    location: 'All Bengal',
    region: 'All Regions',
    category: 'cultural',
    image: 'https://images.unsplash.com/photo-1517164850305-99a3e65bb47e?w=800',
    highlights: ['Tilak ceremony', 'Sweets exchange', 'Sibling bond', 'Traditional rituals'],
  },
];

export function FestivalCalendar() {
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const categories = ['religious', 'cultural', 'harvest', 'fair', 'music'];
  const regions = ['South Bengal', 'Central Bengal', 'North Bengal', 'All Regions'];

  const filteredFestivals = festivals
    .filter(f => selectedMonth === 'all' || f.month === selectedMonth)
    .filter(f => selectedCategory === 'all' || f.category === selectedCategory)
    .filter(f => selectedRegion === 'all' || f.region === selectedRegion);

  const getCountdown = (dateStr: string) => {
    const now = new Date();
    const eventDate = new Date(dateStr);
    const diff = eventDate.getTime() - now.getTime();
    
    if (diff < 0) return 'Event passed';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 30) return `${Math.floor(days / 30)} months away`;
    if (days > 0) return `${days} days away`;
    if (hours > 0) return `${hours} hours away`;
    return 'Happening now!';
  };

  const addToGoogleCalendar = (festival: Festival) => {
    const startDate = festival.date.replace(/-/g, '');
    const endDate = festival.endDate ? festival.endDate.replace(/-/g, '') : startDate;
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(festival.name)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(festival.description)}&location=${encodeURIComponent(festival.location)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50 pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Festival Calendar</h1>
          <p className="text-xl text-gray-600">
            Discover and plan around West Bengal's vibrant festivals and events
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 shadow-lg mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">Filter Events</h3>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            {/* Month Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Months</option>
                {months.map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                ))}
              </select>
            </div>

            {/* Region Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Regions</option>
                {regions.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredFestivals.length} of {festivals.length} events
          </div>
        </motion.div>

        {/* Festival Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFestivals.map((festival, index) => {
            const countdown = getCountdown(festival.date);
            const isPast = countdown === 'Event passed';
            const isHappening = countdown === 'Happening now!';
            
            return (
              <motion.div
                key={festival.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-all group ${
                  isPast ? 'opacity-60' : ''
                }`}
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={festival.image}
                    alt={festival.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      festival.category === 'religious' ? 'bg-purple-500 text-white' :
                      festival.category === 'cultural' ? 'bg-orange-500 text-white' :
                      festival.category === 'harvest' ? 'bg-green-500 text-white' :
                      festival.category === 'fair' ? 'bg-blue-500 text-white' :
                      'bg-pink-500 text-white'
                    }`}>
                      {festival.category.charAt(0).toUpperCase() + festival.category.slice(1)}
                    </span>
                  </div>
                  {isHappening && (
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 bg-red-500 text-white rounded-full text-xs font-semibold animate-pulse">
                        Live Now!
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{festival.name}</h3>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="w-4 h-4" />
                      {festival.month}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {festival.location}
                    </span>
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-2">{festival.description}</p>

                  {/* Countdown */}
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-xl mb-4 ${
                    isHappening ? 'bg-red-100 text-red-700' :
                    isPast ? 'bg-gray-100 text-gray-600' :
                    'bg-purple-100 text-purple-700'
                  }`}>
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-semibold">{countdown}</span>
                  </div>

                  {/* Highlights */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Highlights:</h4>
                    <div className="flex flex-wrap gap-2">
                      {festival.highlights.slice(0, 3).map((highlight, idx) => (
                        <span key={idx} className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                          {highlight}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => addToGoogleCalendar(festival)}
                    disabled={isPast}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all ${
                      isPast
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-600 to-orange-600 text-white hover:shadow-lg'
                    }`}
                  >
                    <CalendarPlus className="w-4 h-4" />
                    {isPast ? 'Event Passed' : 'Add to Calendar'}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {filteredFestivals.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-white rounded-3xl shadow-lg"
          >
            <CalendarIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No events found</h3>
            <p className="text-gray-600">Try adjusting your filters</p>
          </motion.div>
        )}

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 bg-gradient-to-r from-purple-600 to-orange-600 rounded-3xl p-8 text-white"
        >
          <h3 className="text-2xl font-bold mb-4">📅 Plan Your Visit</h3>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>Book accommodations well in advance during major festivals</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>Check local customs and dress codes for religious events</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>Many festivals have special train and bus services</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>Try local street food but choose clean vendors</span>
            </li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
