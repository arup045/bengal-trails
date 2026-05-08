import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar as CalendarIcon, MapPin, Clock, Filter, CalendarPlus } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:3000/api';

interface Festival {
  id: string;
  name: string;
  bengaliName?: string;
  description: string;
  date: string;
  endDate?: string;
  month: string;
  location: string;
  region: string;
  category: 'religious' | 'cultural' | 'harvest' | 'fair' | 'music';
  image: string;
  highlights: string[];
  vibe?: string;
  musttry?: string[];
}

// Fallback data — used if API is unreachable. Real Bengali festivals with verified info.
const fallbackFestivals: Festival[] = [
  {
    id: '1', name: 'Durga Puja', bengaliName: 'দুর্গা পূজা',
    description: "Bengal's grandest festival - 5 days of pandal-hopping, dhak beats, and cultural celebration of Goddess Durga.",
    date: '2026-09-26', endDate: '2026-09-30', month: 'September',
    location: 'Kolkata, all Bengal', region: 'South Bengal', category: 'religious',
    image: 'https://images.unsplash.com/photo-1605369572399-05d7d96f8a76?w=800&q=80',
    highlights: ['Pandal hopping', 'Dhunuchi naach', 'Bhog prasad', 'Sindoor khela'],
    vibe: 'Grand, spiritual, joyous',
    musttry: ['Khichuri bhog', 'Egg roll', 'Phuchka'],
  },
  {
    id: '2', name: 'Poila Boishakh', bengaliName: 'পয়লা বৈশাখ',
    description: 'Bengali New Year — new beginnings, sweet shops opening hal-khata books, family feasts.',
    date: '2026-04-15', month: 'April',
    location: 'All Bengal', region: 'All Regions', category: 'cultural',
    image: 'https://images.unsplash.com/photo-1604423043492-41303f00fd6d?w=800&q=80',
    highlights: ['Hal-khata', 'Probhat Pheri', 'New clothes', 'Family lunch'],
    vibe: 'Fresh, traditional, celebratory',
    musttry: ['Mishti doi', 'Aam pora shorbot', 'Shukto'],
  },
  {
    id: '3', name: 'Poush Mela', bengaliName: 'পৌষ মেলা',
    description: "Shantiniketan's iconic winter fair — Baul music, handicrafts, and Tagore's cultural heritage.",
    date: '2026-12-23', endDate: '2026-12-25', month: 'December',
    location: 'Shantiniketan', region: 'Central Bengal', category: 'fair',
    image: 'https://images.unsplash.com/photo-1567361808960-dec9cb578182?w=800&q=80',
    highlights: ['Baul music', 'Tribal crafts', 'Folk dance', 'Bonfires'],
    vibe: 'Rustic, soulful, artistic',
    musttry: ['Pithe puli', 'Khejur gur', 'Notun gur er sandesh'],
  },
  {
    id: '4', name: 'Kali Puja', bengaliName: 'কালী পূজা',
    description: 'Night festival of Goddess Kali — fireworks, Tarapith pilgrimage, and Bengali Diwali.',
    date: '2026-11-09', month: 'November',
    location: 'Kolkata, Tarapith, Dakshineswar', region: 'South Bengal', category: 'religious',
    image: 'https://images.unsplash.com/photo-1572468734-12bea50fa78f?w=800&q=80',
    highlights: ['Midnight puja', 'Fireworks', 'Tarapith yatra', 'Bhoger khichuri'],
    vibe: 'Mystical, intense, spiritual',
    musttry: ['Khichuri bhog', 'Labra', 'Payesh'],
  },
  {
    id: '5', name: 'Saraswati Puja', bengaliName: 'সরস্বতী পূজা',
    description: 'Bengali Valentine\'s Day — yellow saris, books for blessings, and college campus magic.',
    date: '2027-01-22', month: 'January',
    location: 'All Bengal', region: 'All Regions', category: 'religious',
    image: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=800&q=80',
    highlights: ['Yellow attire', 'Anjali', 'Hatekhori', 'School & college pujas'],
    vibe: 'Romantic, youthful, pure',
    musttry: ['Khichuri', 'Boroi (Indian jujube)', 'Gota seddho'],
  },
  {
    id: '6', name: 'Rath Yatra', bengaliName: 'রথ যাত্রা',
    description: 'Lord Jagannath\'s chariot festival in Mahesh, Serampore — second-oldest Rath in India.',
    date: '2026-07-07', month: 'July',
    location: 'Mahesh (Serampore), Mayapur', region: 'South Bengal', category: 'religious',
    image: 'https://images.unsplash.com/photo-1593115057322-e94b77572f20?w=800&q=80',
    highlights: ['Chariot pulling', 'Mela (fair)', 'ISKCON Mayapur', 'Pat chitra art'],
    vibe: 'Devotional, communal, vibrant',
    musttry: ['Jilipi (jalebi)', 'Papor bhaja', 'Ghugni'],
  },
  {
    id: '7', name: 'Charak Puja', bengaliName: 'চড়ক পূজা',
    description: 'Last day of Bengali year — devotees suspended on hooks, fire walking, ancient Shiva ritual.',
    date: '2026-04-14', month: 'April',
    location: 'Rural Bengal, Bardhaman, Birbhum', region: 'Central Bengal', category: 'religious',
    image: 'https://images.unsplash.com/photo-1581009137042-c552e485697a?w=800&q=80',
    highlights: ['Hook swinging', 'Fire walking', 'Sanyasi dance', 'Folk performance'],
    vibe: 'Intense, rural, ancient',
    musttry: ['Bhaat torkari', 'Rural Bengali sweets'],
  },
  {
    id: '8', name: 'Jagaddhatri Puja', bengaliName: 'জগদ্ধাত্রী পূজা',
    description: 'Krishnanagar\'s grand festival — bigger than Durga Puja in this town, all-night celebration.',
    date: '2026-11-17', month: 'November',
    location: 'Krishnanagar, Chandannagar', region: 'South Bengal', category: 'religious',
    image: 'https://images.unsplash.com/photo-1542810205-0eb6f3a87edf?w=800&q=80',
    highlights: ['Nadia mahabhoj', 'Light decorations (Chandannagar)', 'Sangeet', 'Bhasan rally'],
    vibe: 'Grand, local pride, festive',
    musttry: ['Sarbhaja', 'Sarpuria', 'Misti'],
  },
  {
    id: '9', name: 'Gangasagar Mela', bengaliName: 'গঙ্গাসাগর মেলা',
    description: 'India\'s second-largest pilgrimage at the Ganga\'s mouth — Makar Sankranti holy bath.',
    date: '2027-01-14', month: 'January',
    location: 'Sagar Island', region: 'South Bengal', category: 'fair',
    image: 'https://images.unsplash.com/photo-1567879128055-c5b2e5e6d2c2?w=800&q=80',
    highlights: ['Holy bath', 'Kapil Muni temple', 'Sadhu congregation', 'Sea & rituals'],
    vibe: 'Sacred, vast, devotional',
    musttry: ['Til-gur', 'Pithe', 'Khichuri'],
  },
  {
    id: '10', name: 'Christmas in Park Street', bengaliName: 'বড়দিন',
    description: "Kolkata's most international celebration — Park Street lights up, Allen Park stalls, midnight mass.",
    date: '2026-12-25', month: 'December',
    location: 'Kolkata (Park Street, Bow Barracks)', region: 'South Bengal', category: 'cultural',
    image: 'https://images.unsplash.com/photo-1481450206018-2d2503e5b3ec?w=800&q=80',
    highlights: ['Park Street illumination', 'Carnival at Allen Park', 'Bow Barracks community', 'St Paul\'s Cathedral'],
    vibe: 'Festive, multicultural, twinkling',
    musttry: ['Plum cake (Nahoum\'s)', 'Roast turkey', 'Mulled wine'],
  },
  {
    id: '11', name: 'Eid-ul-Fitr', bengaliName: 'ঈদ-উল-ফিতর',
    description: 'Joyous end of Ramadan — Nakhoda Mosque prayers, Zakaria Street feast, biryani everywhere.',
    date: '2027-03-21', month: 'March',
    location: 'Kolkata (Nakhoda, Zakaria St)', region: 'South Bengal', category: 'religious',
    image: 'https://images.unsplash.com/photo-1604609072207-d5fd5e3ef8b9?w=800&q=80',
    highlights: ['Eid prayers', 'Zakaria St food walk', 'Sheer korma', 'Family visits'],
    vibe: 'Joyful, communal, delicious',
    musttry: ['Mutton biryani', 'Sheer korma', 'Haleem', 'Phirni'],
  },
  {
    id: '12', name: 'Rabindra Jayanti', bengaliName: 'রবীন্দ্র জয়ন্তী',
    description: "Tagore\'s birthday — Rabindra Sangeet, dance dramas, all of Bengal honors its poet.",
    date: '2026-05-09', month: 'May',
    location: 'Shantiniketan, Jorasanko, all Bengal', region: 'All Regions', category: 'cultural',
    image: 'https://images.unsplash.com/photo-1558616629-899031969d5a?w=800&q=80',
    highlights: ['Rabindra Sangeet', 'Dance drama', 'Jorasanko Thakurbari', 'Cultural programs'],
    vibe: 'Soulful, literary, refined',
    musttry: ['Bengali sweets', 'Kabiraji cutlet'],
  },
];

export function FestivalCalendar() {
  const [festivals, setFestivals] = useState<Festival[]>(fallbackFestivals);
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try API first, fall back to hardcoded
    fetch(`${API_BASE}/bengal/festivals`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.festivals?.length) {
          // Map API shape to component shape
          const mapped: Festival[] = data.festivals.map((f: any) => ({
            id: f.slug || f.id || String(Math.random()),
            name: f.name,
            bengaliName: f.bengaliName,
            description: f.description || '',
            date: f.typicalDates?.[0] || '2026-01-01',
            month: f.months?.[0]
              ? ['January','February','March','April','May','June','July','August','September','October','November','December'][f.months[0] - 1]
              : 'January',
            location: Array.isArray(f.locations) ? f.locations.join(', ') : (f.locations || 'Bengal'),
            region: f.region || 'All Regions',
            category: (f.category || 'cultural').toLowerCase(),
            image: f.image || 'https://images.unsplash.com/photo-1604423043492-41303f00fd6d?w=800',
            highlights: f.highlights || [],
            vibe: f.vibe,
            musttry: f.musttry,
          }));
          setFestivals(mapped);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const categories = ['religious', 'cultural', 'harvest', 'fair', 'music'];

  const filteredFestivals = festivals
    .filter((f) => selectedMonth === 'all' || f.month === selectedMonth)
    .filter((f) => selectedCategory === 'all' || f.category === selectedCategory)
    .filter((f) => selectedRegion === 'all' || f.region === selectedRegion);

  const regions = Array.from(new Set(festivals.map((f) => f.region))).filter(Boolean);

  const getCountdown = (dateStr: string) => {
    const now = new Date();
    const eventDate = new Date(dateStr);
    const diff = eventDate.getTime() - now.getTime();
    if (diff < 0) return 'Past event';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days > 30) return `${Math.floor(days / 30)} months away`;
    if (days > 0) return `${days} days away`;
    return 'Happening now!';
  };

  const addToGoogleCalendar = (festival: Festival) => {
    const startDate = festival.date.replace(/-/g, '');
    const endDate = festival.endDate ? festival.endDate.replace(/-/g, '') : startDate;
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(festival.name)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(festival.description)}&location=${encodeURIComponent(festival.location)}`;
    window.open(url, '_blank');
  };

  const categoryColor: Record<string, string> = {
    religious: 'bg-purple-100 text-purple-800',
    cultural: 'bg-orange-100 text-orange-800',
    harvest: 'bg-green-100 text-green-800',
    fair: 'bg-pink-100 text-pink-800',
    music: 'bg-blue-100 text-blue-800',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50 pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Festival Calendar</h1>
          <p className="text-xl text-gray-600">
            {festivals.length} authentic Bengali festivals — plan around the year's celebrations
          </p>
        </motion.div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter className="inline w-4 h-4 mr-1" />Month
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All months</option>
                {months.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All categories</option>
                {categories.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All regions</option>
                {regions.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Festival cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFestivals.map((festival, idx) => (
            <motion.div
              key={festival.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="relative h-48">
                <ImageWithFallback
                  src={festival.image}
                  alt={festival.name}
                  className="w-full h-full object-cover"
                />
                <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium ${categoryColor[festival.category] || 'bg-gray-100 text-gray-800'}`}>
                  {festival.category}
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{festival.name}</h3>
                    {festival.bengaliName && (
                      <p className="text-sm text-gray-500" style={{ fontFamily: 'serif' }}>{festival.bengaliName}</p>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">{festival.description}</p>
                <div className="space-y-2 mb-4 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-purple-600" />
                    <span>{festival.month}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-orange-600" />
                    <span className="truncate">{festival.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-pink-600" />
                    <span className="font-medium">{getCountdown(festival.date)}</span>
                  </div>
                </div>
                {festival.musttry && festival.musttry.length > 0 && (
                  <div className="mb-3 text-xs text-gray-600">
                    <span className="font-medium">Must try: </span>{festival.musttry.join(', ')}
                  </div>
                )}
                <div className="flex flex-wrap gap-1 mb-4">
                  {festival.highlights.slice(0, 3).map((h, i) => (
                    <span key={i} className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">{h}</span>
                  ))}
                </div>
                <button
                  onClick={() => addToGoogleCalendar(festival)}
                  className="w-full bg-gradient-to-r from-purple-600 to-orange-500 text-white py-2 rounded-lg font-medium hover:from-purple-700 hover:to-orange-600 transition-all flex items-center justify-center gap-2"
                >
                  <CalendarPlus className="w-4 h-4" />Add to calendar
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredFestivals.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            No festivals match your filters. Try clearing them.
          </div>
        )}
      </div>
    </div>
  );
}
