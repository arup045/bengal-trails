import { useState } from 'react';
import { Clock, Users, MapPin, Star, ChevronRight, CheckCircle, X, Calendar, DollarSign } from 'lucide-react';

interface Tour {
  id: string;
  title: string;
  duration: string;
  days: number;
  price: number;
  originalPrice: number;
  rating: number;
  reviews: number;
  image: string;
  category: string;
  difficulty: string;
  groupSize: string;
  destinations: string[];
  highlights: string[];
  includes: string[];
  excludes: string[];
  itinerary: { day: number; title: string; description: string }[];
  badge?: string;
}

const TOURS: Tour[] = [
  {
    id: '1',
    title: 'Darjeeling & Sikkim Highlights',
    duration: '5 Days / 4 Nights',
    days: 5,
    price: 12999,
    originalPrice: 16999,
    rating: 4.8,
    reviews: 234,
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800',
    category: 'Hill Station',
    difficulty: 'Easy',
    groupSize: '2-12 people',
    destinations: ['Darjeeling', 'Tiger Hill', 'Gangtok'],
    highlights: ['Tiger Hill sunrise', 'Darjeeling tea estate visit', 'Toy Train ride', 'Rumtek Monastery'],
    includes: ['Hotel accommodation', 'Daily breakfast', 'All transfers', 'Experienced guide', 'Entry tickets'],
    excludes: ['Flight tickets', 'Lunch & dinner', 'Personal expenses', 'Travel insurance'],
    badge: 'Best Seller',
    itinerary: [
      { day: 1, title: 'Arrival in Darjeeling', description: 'Arrive at NJP station, transfer to Darjeeling hotel. Evening walk on Mall Road.' },
      { day: 2, title: 'Tiger Hill & Tea Estate', description: 'Early morning Tiger Hill sunrise. Visit Batasia Loop, tea estate and Happy Valley.' },
      { day: 3, title: 'Darjeeling to Gangtok', description: 'Morning Toy Train ride. Transfer to Gangtok. Evening MG Marg walk.' },
      { day: 4, title: 'Gangtok Sightseeing', description: 'Rumtek Monastery, Enchey Monastery, Tashi Viewpoint and local markets.' },
      { day: 5, title: 'Departure', description: 'Breakfast and transfer to NJP/Bagdogra for onward journey.' },
    ]
  },
  {
    id: '2',
    title: 'Sundarbans Wildlife Safari',
    duration: '3 Days / 2 Nights',
    days: 3,
    price: 7999,
    originalPrice: 9999,
    rating: 4.7,
    reviews: 189,
    image: 'https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=800',
    category: 'Wildlife',
    difficulty: 'Moderate',
    groupSize: '4-16 people',
    destinations: ['Sundarbans', 'Sajnekhali', 'Gosaba'],
    highlights: ['Royal Bengal Tiger spotting', 'Mangrove boat safari', 'Bird watching', 'Village walk'],
    includes: ['Boat accommodation', 'All meals', 'Forest entry permit', 'Guide & naturalist', 'All safaris'],
    excludes: ['Transport to Godkhali', 'Personal expenses', 'Tips', 'Travel insurance'],
    badge: 'Adventure Pick',
    itinerary: [
      { day: 1, title: 'Kolkata to Sundarbans', description: 'Morning drive to Godkhali. Board houseboat. Afternoon safari to Sajnekhali.' },
      { day: 2, title: 'Deep Forest Safari', description: 'Full day boat safari through core forest zones. Bird watching & crocodile spotting.' },
      { day: 3, title: 'Village & Departure', description: 'Morning village walk, honey collection demo. Return to Kolkata.' },
    ]
  },
  {
    id: '3',
    title: 'Kolkata Heritage & Culture Tour',
    duration: '3 Days / 2 Nights',
    days: 3,
    price: 5999,
    originalPrice: 7499,
    rating: 4.6,
    reviews: 312,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    category: 'Cultural',
    difficulty: 'Easy',
    groupSize: '2-20 people',
    destinations: ['Kolkata', 'Howrah', 'Dakshineswar'],
    highlights: ['Victoria Memorial', 'Howrah Bridge walk', 'Street food tour', 'Durga Puja pandal visit'],
    includes: ['Hotel stay', 'Breakfast daily', 'AC transport', 'Expert guide', 'Food tasting'],
    excludes: ['Airfare', 'Lunch & dinner', 'Shopping', 'Personal expenses'],
    badge: 'Most Popular',
    itinerary: [
      { day: 1, title: 'Colonial Kolkata', description: 'Victoria Memorial, St Paul Cathedral, Maidan, Park Street food tour.' },
      { day: 2, title: 'North Kolkata Heritage', description: 'Howrah Bridge, flower market, Marble Palace, Kumartuli artisan district.' },
      { day: 3, title: 'Temples & Departure', description: 'Dakshineswar temple, Belur Math, Birla Planetarium. Evening departure.' },
    ]
  },
  {
    id: '4',
    title: 'Complete West Bengal Explorer',
    duration: '8 Days / 7 Nights',
    days: 8,
    price: 24999,
    originalPrice: 31999,
    rating: 4.9,
    reviews: 87,
    image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800',
    category: 'Complete Tour',
    difficulty: 'Moderate',
    groupSize: '2-10 people',
    destinations: ['Kolkata', 'Darjeeling', 'Sundarbans', 'Bishnupur'],
    highlights: ['4 regions of Bengal', 'Wildlife safari', 'Hill station', 'Temple town', 'City heritage'],
    includes: ['All accommodation', 'Breakfast & dinner', 'All transfers', 'All entry fees', 'Expert guides'],
    excludes: ['Flights', 'Lunch', 'Personal expenses', 'Travel insurance'],
    badge: '🏆 Premium',
    itinerary: [
      { day: 1, title: 'Arrive Kolkata', description: 'City orientation, Park Street dinner.' },
      { day: 2, title: 'Kolkata Sightseeing', description: 'Victoria Memorial, Howrah Bridge, North Kolkata.' },
      { day: 3, title: 'Bishnupur Terracotta', description: 'Drive to Bishnupur, terracotta temples, Baluchari silk.' },
      { day: 4, title: 'Sundarbans Day 1', description: 'Transfer to Sundarbans, houseboat, evening safari.' },
      { day: 5, title: 'Sundarbans Day 2', description: 'Full day forest safari, bird watching.' },
      { day: 6, title: 'Fly to Darjeeling', description: 'Morning flight to Bagdogra, drive to Darjeeling.' },
      { day: 7, title: 'Tiger Hill & Tea', description: 'Sunrise, tea estate, Toy Train, Mall Road.' },
      { day: 8, title: 'Departure', description: 'Morning views, transfer to Bagdogra.' },
    ]
  },
  {
    id: '5',
    title: 'Digha & Mandarmani Beach Escape',
    duration: '3 Days / 2 Nights',
    days: 3,
    price: 4999,
    originalPrice: 6499,
    rating: 4.5,
    reviews: 156,
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
    category: 'Beach',
    difficulty: 'Easy',
    groupSize: '2-20 people',
    destinations: ['Digha', 'Mandarmani', 'Tajpur'],
    highlights: ['Bay of Bengal sunrise', 'Beach bonfire', 'Seafood feast', 'Water sports'],
    includes: ['Beach resort stay', 'Breakfast', 'AC transport', 'Beach activities'],
    excludes: ['Train tickets', 'Lunch & dinner', 'Water sports extra', 'Personal expenses'],
    itinerary: [
      { day: 1, title: 'Arrive Digha', description: 'Check-in beach resort, evening at Old Digha beach, seafood dinner.' },
      { day: 2, title: 'Mandarmani Drive', description: 'Morning sunrise, drive to Mandarmani, beach walk, bonfire evening.' },
      { day: 3, title: 'Departure', description: 'Sunrise on beach, breakfast and return journey.' },
    ]
  },
  {
    id: '6',
    title: 'Dooars Jungle & Tea Garden Trail',
    duration: '4 Days / 3 Nights',
    days: 4,
    price: 9999,
    originalPrice: 12999,
    rating: 4.7,
    reviews: 98,
    image: 'https://images.unsplash.com/photo-1440778303588-435521a46e49?w=800',
    category: 'Nature',
    difficulty: 'Moderate',
    groupSize: '2-12 people',
    destinations: ['Dooars', 'Gorumara', 'Jaldapara', 'Chalsa'],
    highlights: ['Elephant safari', 'One-horned rhino spotting', 'Tea garden walk', 'River camp'],
    includes: ['Forest lodge stay', 'All meals', 'Jeep safari', 'Elephant safari', 'Guide'],
    excludes: ['Train to NJP', 'Personal expenses', 'Camera fees', 'Travel insurance'],
    badge: 'Nature Lover',
    itinerary: [
      { day: 1, title: 'Arrive Dooars', description: 'Pick up from NJP, transfer to forest lodge, evening nature walk.' },
      { day: 2, title: 'Gorumara Safari', description: 'Morning elephant safari, afternoon jeep safari, bird watching.' },
      { day: 3, title: 'Jaldapara & Tea', description: 'Jaldapara rhino safari, afternoon tea garden visit and tasting.' },
      { day: 4, title: 'Departure', description: 'Morning river walk, breakfast, transfer to NJP.' },
    ]
  },
];

const CATEGORIES = ['All', 'Hill Station', 'Wildlife', 'Cultural', 'Beach', 'Nature', 'Complete Tour'];

function TourModal({ tour, onClose }: { tour: Tour; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="relative h-56 overflow-hidden rounded-t-3xl">
          <img src={tour.image} alt={tour.title} className="w-full h-full object-cover" />
          <button onClick={onClose} className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors">
            <X className="w-5 h-5 text-gray-700" />
          </button>
          {tour.badge && <span className="absolute top-4 left-4 bg-purple-600 text-white text-xs font-bold px-3 py-1.5 rounded-full">{tour.badge}</span>}
        </div>
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-black text-gray-900 mb-1">{tour.title}</h2>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{tour.duration}</span>
                <span className="flex items-center gap-1"><Users className="w-4 h-4" />{tour.groupSize}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-purple-600">₹{tour.price.toLocaleString()}</div>
              <div className="text-sm text-gray-400 line-through">₹{tour.originalPrice.toLocaleString()}</div>
              <div className="text-xs text-green-600 font-bold">{Math.round((1 - tour.price/tour.originalPrice)*100)}% OFF</div>
            </div>
          </div>

          <div className="flex items-center gap-1 mb-4">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="font-bold text-gray-800">{tour.rating}</span>
            <span className="text-gray-500 text-sm">({tour.reviews} reviews)</span>
          </div>

          <div className="flex flex-wrap gap-2 mb-5">
            {tour.destinations.map(d => (
              <span key={d} className="flex items-center gap-1 bg-purple-50 text-purple-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                <MapPin className="w-3 h-3" />{d}
              </span>
            ))}
          </div>

          <div className="mb-5">
            <h3 className="font-bold text-gray-900 mb-2">Highlights</h3>
            <div className="grid grid-cols-2 gap-1.5">
              {tour.highlights.map(h => (
                <div key={h} className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />{h}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <h3 className="font-bold text-gray-900 mb-2 text-sm">✅ Includes</h3>
              {tour.includes.map(i => <p key={i} className="text-xs text-gray-600 mb-1">• {i}</p>)}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2 text-sm">❌ Excludes</h3>
              {tour.excludes.map(e => <p key={e} className="text-xs text-gray-500 mb-1">• {e}</p>)}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-bold text-gray-900 mb-3">Day-by-Day Itinerary</h3>
            <div className="space-y-3">
              {tour.itinerary.map(day => (
                <div key={day.day} className="flex gap-3">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">{day.day}</div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{day.title}</p>
                    <p className="text-xs text-gray-500">{day.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <a href="#/planner"
            className="block w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white text-center py-3.5 rounded-2xl font-bold hover:shadow-lg hover:shadow-purple-300/50 transition-all">
            Book This Tour — ₹{tour.price.toLocaleString()}/person
          </a>
        </div>
      </div>
    </div>
  );
}

export function TourPackagesPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeDuration, setActiveDuration] = useState('All');
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);

  const filtered = TOURS.filter(t => {
    const matchCat = activeCategory === 'All' || t.category === activeCategory;
    const matchDur = activeDuration === 'All' ||
      (activeDuration === 'Short' && t.days <= 3) ||
      (activeDuration === 'Medium' && t.days >= 4 && t.days <= 5) ||
      (activeDuration === 'Long' && t.days >= 6);
    return matchCat && matchDur;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {selectedTour && <TourModal tour={selectedTour} onClose={() => setSelectedTour(null)} />}

      {/* Hero */}
      <div className="bg-gradient-to-br from-purple-700 via-purple-600 to-pink-600 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-bold mb-4">
            <Calendar className="w-4 h-4" /> Curated Tour Packages
          </div>
          <h1 className="text-3xl sm:text-5xl font-black mb-4">Explore West Bengal</h1>
          <p className="text-purple-200 text-lg mb-2">Handcrafted tours by local experts — all-inclusive packages</p>
          <div className="flex items-center justify-center gap-6 mt-6 text-sm">
            <div className="text-center"><div className="text-2xl font-black">6+</div><div className="text-purple-300">Tour Packages</div></div>
            <div className="w-px h-10 bg-white/20" />
            <div className="text-center"><div className="text-2xl font-black">1000+</div><div className="text-purple-300">Happy Travellers</div></div>
            <div className="w-px h-10 bg-white/20" />
            <div className="text-center"><div className="text-2xl font-black">4.7★</div><div className="text-purple-300">Average Rating</div></div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-4">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${activeCategory === cat ? 'bg-purple-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300 hover:text-purple-600'}`}>
              {cat}
            </button>
          ))}
        </div>
        <div className="flex gap-2 mb-8">
          {['All', 'Short (1-3 days)', 'Medium (4-5 days)', 'Long (6+ days)'].map((d, i) => {
            const val = ['All', 'Short', 'Medium', 'Long'][i];
            return (
              <button key={d} onClick={() => setActiveDuration(val)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${activeDuration === val ? 'bg-gray-800 text-white' : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-400'}`}>
                {d}
              </button>
            );
          })}
        </div>

        {/* Tour Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(tour => (
            <div key={tour.id} onClick={() => setSelectedTour(tour)}
              className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer group">
              <div className="relative h-48 overflow-hidden bg-gray-100">
                <img src={tour.image} alt={tour.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800'; }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                {tour.badge && <span className="absolute top-3 left-3 bg-purple-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">{tour.badge}</span>}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-2 py-1 rounded-full">{tour.category}</span>
                  <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-2 py-1 rounded-full">{tour.difficulty}</span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-black text-gray-900 text-base mb-1 group-hover:text-purple-600 transition-colors">{tour.title}</h3>
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{tour.duration}</span>
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{tour.groupSize}</span>
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {tour.destinations.slice(0,3).map(d => (
                    <span key={d} className="flex items-center gap-0.5 text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full font-medium">
                      <MapPin className="w-2.5 h-2.5" />{d}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div>
                    <div className="flex items-center gap-1 mb-0.5">
                      <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                      <span className="text-sm font-bold text-gray-800">{tour.rating}</span>
                      <span className="text-xs text-gray-400">({tour.reviews})</span>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-lg font-black text-purple-600">₹{tour.price.toLocaleString()}</span>
                      <span className="text-xs text-gray-400 line-through">₹{tour.originalPrice.toLocaleString()}</span>
                    </div>
                    <div className="text-xs text-gray-400">per person</div>
                  </div>
                  <button className="flex items-center gap-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors">
                    View <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">No tours found for this filter</p>
            <button onClick={() => { setActiveCategory('All'); setActiveDuration('All'); }} className="mt-3 text-purple-600 font-semibold text-sm">Clear filters</button>
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 bg-gradient-to-r from-purple-600 to-purple-800 rounded-3xl p-8 text-white text-center">
          <h2 className="text-2xl font-black mb-2">Can't find your perfect tour?</h2>
          <p className="text-purple-200 mb-6">We create custom itineraries tailored just for you</p>
          <a href="#/planner" className="inline-flex items-center gap-2 bg-white text-purple-700 font-black px-6 py-3 rounded-full hover:shadow-lg transition-all">
            <DollarSign className="w-4 h-4" /> Plan Custom Trip
          </a>
        </div>
      </div>
    </div>
  );
}