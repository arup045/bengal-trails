import { Star, MapPin } from 'lucide-react';
import { useState } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';

import { OptimizedImage } from './OptimizedImage';
export function ExploreWorld() {
  const [activeCategory, setActiveCategory] = useState('All');
  
  const categories = ['All', 'Hills', 'Beaches', 'Heritage', 'Wildlife', 'Culture'];

  const destinations = [
    { name: 'Darjeeling', slug: 'darjeeling', location: 'Hills', image: 'https://images.unsplash.com/photo-1679418536818-7a7fb2db49bc?w=1080', rating: 4.9, price: 8999, badge: 'Popular' },
    { name: 'Victoria Memorial', slug: 'victoria-memorial-kolkata', location: 'Heritage', image: 'https://images.unsplash.com/photo-1697817665440-f988c6d5080f?w=1080', rating: 4.8, price: 4999, badge: 'Promo' },
    { name: 'Sundarbans', slug: 'sundarbans-national-park', location: 'Wildlife', image: 'https://images.unsplash.com/photo-1705521680496-d5d7b22c14f7?w=1080', rating: 4.7, price: 12999, badge: 'UNESCO Site' },
    { name: 'Kalimpong', slug: 'kalimpong', location: 'Hills', image: 'https://images.unsplash.com/photo-1637825987997-6e6d117b81b1?w=1080', rating: 4.6, price: 7999, badge: 'Featured' },
    { name: 'Digha Beach', slug: 'digha', location: 'Beaches', image: 'https://images.unsplash.com/photo-1695332599891-7c85956b9f46?w=1080', rating: 4.5, price: 3999, badge: 'Hot Deal' },
    { name: 'Mandarmani', slug: 'mandarmani', location: 'Beaches', image: 'https://images.unsplash.com/photo-1633714972458-5c968de4bb19?w=1080', rating: 4.6, price: 5999, badge: 'Weekend Special' },
    { name: 'Shantiniketan', slug: 'shantiniketan', location: 'Culture', image: 'https://images.unsplash.com/photo-1671525526206-6671a39bdc12?w=1080', rating: 4.8, price: 6499, badge: 'Cultural Hub' },
    { name: 'Howrah Bridge', slug: 'howrah-bridge-viewpoint', location: 'Heritage', image: 'https://images.unsplash.com/photo-1677307816181-1446ab18913e?w=1080', rating: 4.7, price: 2999, badge: 'Iconic' },
    { name: 'Dooars', slug: 'gorumara-national-park', location: 'Hills', image: 'https://images.unsplash.com/photo-1640551724267-9b84c715aa35?w=1080', rating: 4.7, price: 9499, badge: 'Tea Paradise' },
    { name: 'Bishnupur', slug: 'bishnupur', location: 'Heritage', image: 'https://images.unsplash.com/photo-1673370469549-1084b54a3f7c?w=1080', rating: 4.6, price: 5499, badge: 'Terracotta Art' },
    { name: 'Sandakphu Trek', slug: 'darjeeling', location: 'Hills', image: 'https://images.unsplash.com/photo-1676718912572-b3ebcff192e3?w=1080', rating: 4.9, price: 11999, badge: 'Trekker\'s Dream' },
    { name: 'Bakkhali Beach', slug: 'bakkhali-fraserganj', location: 'Beaches', image: 'https://images.unsplash.com/photo-1695332599891-7c85956b9f46?w=1080', rating: 4.4, price: 4499, badge: 'Peaceful' },
    { name: 'Buddhist Monastery', slug: 'kalimpong', location: 'Culture', image: 'https://images.unsplash.com/photo-1633538028057-838fd4e027a4?w=1080', rating: 4.8, price: 7499, badge: 'Spiritual' },
    { name: 'Cooch Behar Palace', slug: 'cooch-behar', location: 'Heritage', image: 'https://images.unsplash.com/photo-1717445952765-93f7a4934f87?w=1080', rating: 4.5, price: 4999, badge: 'Royal Heritage' },
    { name: 'Mirik Lake', slug: 'mirik', location: 'Hills', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1080', rating: 4.6, price: 6999, badge: 'Serene' },
    { name: 'Botanical Gardens', slug: 'botanical-gardens-shibpur', location: 'Culture', image: 'https://images.unsplash.com/photo-1622818171279-fe0b6a336835?w=1080', rating: 4.5, price: 1999, badge: 'Nature Lovers' },
    { name: 'Science City', slug: 'science-city-kolkata', location: 'Heritage', image: 'https://images.unsplash.com/photo-1609485141709-0314813d8822?w=1080', rating: 4.4, price: 2499, badge: 'Educational' },
    { name: 'Gorumara National Park', slug: 'gorumara-national-park', location: 'Wildlife', image: 'https://images.unsplash.com/photo-1690279844829-c5e3cb643d83?w=1080', rating: 4.7, price: 10999, badge: 'Wildlife Safari' },
    { name: 'Lava & Lolegaon', slug: 'darjeeling', location: 'Hills', image: 'https://images.unsplash.com/photo-1600257729950-13a634d32697?w=1080', rating: 4.6, price: 8499, badge: 'Offbeat' },
    { name: 'Marble Palace', slug: 'marble-palace-kolkata', location: 'Heritage', image: 'https://images.unsplash.com/photo-1568801549447-2a065c235410?w=1080', rating: 4.5, price: 1999, badge: 'Historic' },
    { name: 'Jhargram Raj Palace', slug: 'purulia', location: 'Heritage', image: 'https://images.unsplash.com/photo-1759595522650-0619e65d8e7c?w=1080', rating: 4.4, price: 5999, badge: 'Royal' },
    { name: 'Jaldapara Wildlife', slug: 'jaldapara-national-park', location: 'Wildlife', image: 'https://images.unsplash.com/photo-1690279844829-c5e3cb643d83?w=1080', rating: 4.6, price: 9999, badge: 'Rhino Habitat' },
    { name: 'Shankarpur Beach', slug: 'digha', location: 'Beaches', image: 'https://images.unsplash.com/photo-1678799261423-a3d263bc3aa8?w=1080', rating: 4.3, price: 3499, badge: 'Quiet Escape' },
    { name: 'Kurseong', slug: 'kurseong', location: 'Hills', image: 'https://images.unsplash.com/photo-1681928696451-32f98be1cf8e?w=1080', rating: 4.6, price: 7999, badge: 'Land of Orchids' },
    { name: 'Hazarduari Palace', slug: 'hazarduari-palace', location: 'Heritage', image: 'https://images.unsplash.com/photo-1717445952765-93f7a4934f87?w=1080', rating: 4.5, price: 4499, badge: '1000 Doors' },
  ];

  const filteredDestinations = destinations.filter(
    (dest) => activeCategory === 'All' || dest.location === activeCategory
  );

  return (
    <section className="py-20 px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-orange-600 uppercase tracking-wide mb-2">Discover Bengal</p>
          <h2 className="text-4xl md:text-5xl mb-8">Explore West Bengal</h2>

          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-6 py-2 rounded-full transition-all ${
                  activeCategory === category
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Destination Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDestinations.map((destination, index) => (
            <a
              key={index}
              href={`#/explore/${destination.slug}`}
              className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group cursor-pointer block"
            >
              <div className="relative h-64 overflow-hidden">
                <ImageWithFallback
                  src={destination.image}
                  alt={destination.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <span className="absolute top-4 left-4 bg-purple-600 text-white px-4 py-1 rounded-full text-sm">
                  {destination.badge}
                </span>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span className="text-lg">{destination.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{destination.rating}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Starting from</p>
                    <p className="text-orange-600 text-xl">₹ {destination.price.toLocaleString()}</p>
                  </div>
                  <div className="bg-purple-600 text-white px-4 py-2 rounded-lg group-hover:bg-purple-700 transition-colors">
                    Explore Now
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
