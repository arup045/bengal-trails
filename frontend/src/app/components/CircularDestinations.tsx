'use client';

import { motion } from 'motion/react';
import { Badge } from './ui/badge';
import { Star } from 'lucide-react';

const destinations = [
  {
    id: 'darjeeling',
    title: 'Darjeeling',
    region: 'North Bengal',
    image: 'https://images.unsplash.com/photo-1679418536818-7a7fb2db49bc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXJqZWVsaW5nJTIwdGVhJTIwZ2FyZGVuc3xlbnwxfHx8fDE3NjM0NDc5MDd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    tag: 'Most Favorite',
  },
  {
    id: 'sundarbans',
    title: 'Sundarbans',
    region: 'South Bengal',
    image: 'https://images.unsplash.com/photo-1611824376845-4edd38195937?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdW5kYXJiYW5zJTIwbWFuZ3JvdmV8ZW58MXx8fHwxNzYzNDQ3OTA3fDA&ixlib=rb-4.1.0&q=80&w=1080',
    tag: 'Wildlife',
  },
  {
    id: 'kolkata',
    title: 'Kolkata',
    region: 'City of Joy',
    image: 'https://images.unsplash.com/photo-1721818218431-0968074eabd4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrb2xrYXRhJTIwdmljdG9yaWElMjBtZW1vcmlhbHxlbnwxfHx8fDE3NjM0NDc5MDh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    tag: 'Heritage',
  },
  {
    id: 'kalimpong',
    title: 'Kalimpong',
    region: 'North Bengal',
    image: 'https://images.unsplash.com/photo-1604223190546-a43e4c7f29d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3VudGFpbiUyMGxhbmRzY2FwZXxlbnwxfHx8fDE3NjM0MTU4NzF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    tag: 'Hills',
  },
  {
    id: 'shantiniketan',
    title: 'Shantiniketan',
    region: 'Central Bengal',
    image: 'https://images.unsplash.com/photo-1688024099219-fd598f8f0b19?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBoZXJpdGFnZSUyMHRlbXBsZXxlbnwxfHx8fDE3NjM0NDc5Njd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    tag: 'Cultural',
  },
];

export function CircularDestinations() {
  return (
    <section className="py-16 md:py-24 bg-[#FFF9F2]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="mb-4">Most Favorite Tour Place</h2>
          <p className="text-[#6B7280] text-lg max-w-2xl mx-auto">
            Discover the most beloved destinations in West Bengal, curated by travelers like you
          </p>
        </motion.div>

        {/* Scrollable on mobile, grid on desktop */}
        <div className="overflow-x-auto pb-4 -mx-6 px-6 md:mx-0 md:px-0">
          <div className="flex md:grid md:grid-cols-5 gap-6 lg:gap-8 min-w-max md:min-w-0">
            {destinations.map((destination, index) => (
              <motion.div
                key={destination.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.04 }}
                className="flex flex-col items-center cursor-pointer group w-[200px] md:w-auto"
                onClick={() => {
                  if (typeof window !== 'undefined' && (window as any).gtag) {
                    (window as any).gtag('event', 'dest_card_click', {
                      id: destination.id,
                      position: index,
                    });
                  }
                }}
              >
                {/* Circular Image */}
                <div className="relative mb-4">
                  <div className="w-40 h-40 lg:w-48 lg:h-48 rounded-full overflow-hidden border-4 border-white shadow-[0_8px_24px_rgba(12,18,30,0.1)] transition-shadow group-hover:shadow-[0_12px_32px_rgba(12,18,30,0.15)]">
                    <img
                      src={destination.image}
                      alt={destination.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>

                  {/* Favorite Badge */}
                  {destination.tag === 'Most Favorite' && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      whileInView={{ scale: 1, rotate: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.4 + index * 0.1, type: 'spring' }}
                      className="absolute -top-2 -right-2 bg-gradient-primary text-white rounded-full p-2 shadow-lg"
                    >
                      <Star className="w-4 h-4 fill-white" />
                    </motion.div>
                  )}
                </div>

                {/* Title & Region */}
                <h3 className="text-center mb-1">{destination.title}</h3>
                <Badge
                  variant="secondary"
                  className="bg-white text-[#6B7280] text-xs"
                >
                  {destination.region}
                </Badge>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
