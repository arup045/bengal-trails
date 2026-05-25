import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Clock, ArrowRight } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

import { OptimizedImage } from './OptimizedImage';
export function RecentlyViewed() {
  const [recentPlaces, setRecentPlaces] = useState<any[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('recentlyViewed');
    if (stored) {
      const places = JSON.parse(stored);
      setRecentPlaces(places.slice(0, 4)); // Show only 4
    }
  }, []);

  if (recentPlaces.length === 0) {
    return null;
  }

  return (
    <div className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-purple-600" />
            <h2 className="text-3xl">Recently Viewed</h2>
          </div>
          <button 
            onClick={() => {
              localStorage.removeItem('recentlyViewed');
              setRecentPlaces([]);
            }}
            className="text-sm text-gray-600 hover:text-purple-600 transition-colors"
          >
            Clear History
          </button>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {recentPlaces.map((place, index) => (
            <motion.a
              key={place.slug}
              href={`/explore/${place.slug}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative h-72 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              <ImageWithFallback
                src={place.image}
                alt={place.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-xl text-white mb-2">{place.title}</h3>
                <p className="text-purple-200 text-sm">{place.region}</p>
              </div>
              <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all">
                <ArrowRight className="w-5 h-5 text-white" />
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </div>
  );
}
