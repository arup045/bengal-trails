'use client';

import { Card } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Star, Quote } from 'lucide-react';
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';

const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'Travel Blogger',
    location: 'Mumbai',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
    quote: 'The Darjeeling tour was absolutely magical! The guides were knowledgeable, accommodations were perfect, and every detail was well-planned. Highly recommend West Bengal Travel!',
    rating: 5,
  },
  {
    name: 'Rahul Mehta',
    role: 'Adventure Enthusiast',
    location: 'Delhi',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul',
    quote: 'Sundarbans wildlife safari exceeded all expectations. Saw the Royal Bengal Tiger and experienced the mangroves like never before. Professional team and great value for money!',
    rating: 5,
  },
  {
    name: 'Ananya Das',
    role: 'Family Traveler',
    location: 'Bangalore',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya',
    quote: 'Perfect family vacation! The itinerary was kid-friendly, hotels were comfortable, and our guide was patient with all our questions. We\'ll definitely book again!',
    rating: 5,
  },
];

const trustBadges = [
  { name: 'TripAdvisor', text: 'Certificate of Excellence' },
  { name: 'Google', text: '4.8★ Rating' },
  { name: 'Tourism Board', text: 'Certified Partner' },
];

export function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

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
          <h2 className="mb-4">What Travelers Say About Us</h2>
          <p className="text-[#6B7280] text-lg max-w-2xl mx-auto">
            Real experiences from real travelers who explored West Bengal with us
          </p>
        </motion.div>

        {/* Testimonials Carousel */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-12">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <Card className="p-6 lg:p-8 h-full border-0 shadow-[0_4px_12px_rgba(12,18,30,0.06)] hover:shadow-[0_12px_32px_rgba(12,18,30,0.12)] transition-shadow">
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                    <AvatarFallback>{testimonial.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-[#6B7280]">{testimonial.role}</div>
                  </div>
                  <Quote className="w-8 h-8 text-[#6A00FF]/20" />
                </div>

                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#FDBB04] text-[#FDBB04]" />
                  ))}
                </div>

                <p className="text-[#6B7280] mb-4">{testimonial.quote}</p>

                <Badge variant="secondary" className="bg-white text-[#6B7280]">
                  📍 {testimonial.location}
                </Badge>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="border-t border-[#6B7280]/20 pt-12"
        >
          <div className="text-center mb-8">
            <h3 className="text-[#6B7280]">Trusted by thousands of travelers</h3>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-12">
            {trustBadges.map((badge, index) => (
              <motion.div
                key={badge.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                className="text-center"
              >
                <div className="font-semibold text-[#111827] mb-1">{badge.name}</div>
                <div className="text-sm text-[#6B7280]">{badge.text}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
