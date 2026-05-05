'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Star, Clock, MapPin, Heart, Share2 } from 'lucide-react';
import { motion } from 'motion/react';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';

const tours = [
  {
    id: 'darjeeling-tea',
    title: 'Darjeeling Tea Garden Experience',
    location: 'Darjeeling, North Bengal',
    image: 'https://images.unsplash.com/photo-1679418536818-7a7fb2db49bc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXJqZWVsaW5nJTIwdGVhJTIwZ2FyZGVuc3xlbnwxfHx8fDE3NjM0NDc5MDd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.8,
    reviews: 234,
    duration: '3 days',
    priceFrom: 12500,
    tags: ['Popular', 'Family'],
    badge: 'Best Seller',
  },
  {
    id: 'sundarbans-safari',
    title: 'Sundarbans Wildlife Safari',
    location: 'Sundarbans, South Bengal',
    image: 'https://images.unsplash.com/photo-1611824376845-4edd38195937?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdW5kYXJiYW5zJTIwbWFuZ3JvdmV8ZW58MXx8fHwxNzYzNDQ3OTA3fDA&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.9,
    reviews: 189,
    duration: '2 days',
    priceFrom: 9800,
    tags: ['Adventure', 'Wildlife'],
    badge: 'New',
  },
  {
    id: 'kolkata-heritage',
    title: 'Kolkata Heritage Walk',
    location: 'Kolkata',
    image: 'https://images.unsplash.com/photo-1721818218431-0968074eabd4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrb2xrYXRhJTIwdmljdG9yaWElMjBtZW1vcmlhbHxlbnwxfHx8fDE3NjM0NDc5MDh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.7,
    reviews: 312,
    duration: '1 day',
    priceFrom: 3500,
    tags: ['Heritage', 'Cultural'],
    badge: null,
  },
  {
    id: 'mountain-trek',
    title: 'Himalayan Mountain Trek',
    location: 'Kalimpong, North Bengal',
    image: 'https://images.unsplash.com/photo-1604223190546-a43e4c7f29d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3VudGFpbiUyMGxhbmRzY2FwZXxlbnwxfHx8fDE3NjM0MTU4NzF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.9,
    reviews: 156,
    duration: '5 days',
    priceFrom: 18900,
    tags: ['Adventure', 'Trekking'],
    badge: 'Popular',
  },
  {
    id: 'temple-tour',
    title: 'Ancient Temple Circuit',
    location: 'Bankura & Birbhum',
    image: 'https://images.unsplash.com/photo-1688024099219-fd598f8f0b19?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBoZXJpdGFnZSUyMHRlbXBsZXxlbnwxfHx8fDE3NjM0NDc5Njd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.6,
    reviews: 98,
    duration: '2 days',
    priceFrom: 7500,
    tags: ['Heritage', 'Spiritual'],
    badge: null,
  },
  {
    id: 'beach-retreat',
    title: 'Coastal Beach Retreat',
    location: 'Digha & Mandarmani',
    image: 'https://images.unsplash.com/photo-1760781284910-8d4200cf26cb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmF2ZWxlciUyMGx1Z2dhZ2UlMjBhZHZlbnR1cmV8ZW58MXx8fHwxNzYzNDQ3OTY1fDA&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.5,
    reviews: 201,
    duration: '3 days',
    priceFrom: 8500,
    tags: ['Beach', 'Relaxation'],
    badge: 'Budget',
  },
];

const filters = ['All', 'Popular', 'New', 'Budget', 'Luxury'];

export function DestinationGrid() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [savedTours, setSavedTours] = useState<string[]>([]);

  const handleSave = (tourId: string) => {
    setSavedTours((prev) =>
      prev.includes(tourId) ? prev.filter((id) => id !== tourId) : [...prev, tourId]
    );
  };

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-[1440px] mx-auto px-6 md:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="mb-4">Explore The World</h2>
          <p className="text-[#6B7280] text-lg max-w-2xl mx-auto">
            Browse through our curated collection of unforgettable experiences
          </p>
        </motion.div>

        {/* Filters */}
        <Tabs value={activeFilter} onValueChange={setActiveFilter} className="mb-12">
          <TabsList className="flex justify-center bg-transparent gap-2 flex-wrap">
            {filters.map((filter) => (
              <TabsTrigger
                key={filter}
                value={filter}
                className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white rounded-full px-6"
              >
                {filter}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {tours.map((tour, index) => (
            <motion.div
              key={tour.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <Card className="group overflow-hidden border-0 shadow-[0_4px_12px_rgba(12,18,30,0.06)] hover:shadow-[0_12px_32px_rgba(12,18,30,0.12)] transition-all cursor-pointer">
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={tour.image}
                    alt={tour.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />

                  {/* Tags & Badge */}
                  <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                    {tour.tags.map((tag) => (
                      <Badge
                        key={tag}
                        className="bg-white/90 backdrop-blur-sm text-[#111827]"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {tour.badge && (
                    <Badge className="absolute top-4 right-4 bg-gradient-primary text-white">
                      {tour.badge}
                    </Badge>
                  )}

                  {/* Quick Actions */}
                  <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSave(tour.id);
                      }}
                      aria-label="Save to favorites"
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          savedTours.includes(tour.id) ? 'fill-red-500 text-red-500' : 'text-[#111827]'
                        }`}
                      />
                    </button>
                    <button
                      className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                      aria-label="Share"
                    >
                      <Share2 className="w-5 h-5 text-[#111827]" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center gap-1 mb-2">
                    <MapPin className="w-4 h-4 text-[#6B7280]" />
                    <span className="text-sm text-[#6B7280]">{tour.location}</span>
                  </div>

                  <h3 className="mb-3">{tour.title}</h3>

                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-[#FDBB04] text-[#FDBB04]" />
                      <span className="font-semibold">{tour.rating}</span>
                      <span className="text-sm text-[#6B7280]">({tour.reviews})</span>
                    </div>
                    <div className="flex items-center gap-1 text-[#6B7280]">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{tour.duration}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm text-[#6B7280]">From</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-bold text-[#111827]">
                          ₹{tour.priceFrom.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <Button
                      className="bg-gradient-primary text-white rounded-full hover:opacity-90"
                      onClick={() => {
                        if (typeof window !== 'undefined' && (window as any).gtag) {
                          (window as any).gtag('event', 'card_cta_click', {
                            tour_id: tour.id,
                            price: tour.priceFrom,
                          });
                        }
                      }}
                    >
                      Explore
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button variant="outline" size="lg" className="rounded-full px-8">
            View All Tours
          </Button>
        </div>
      </div>
    </section>
  );
}
