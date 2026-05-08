import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { motion } from 'motion/react';
import { Check, Download, Clock, Users, Coffee, Shield } from 'lucide-react';

const inclusions = [
  { icon: Users, label: 'Expert Guide' },
  { icon: Coffee, label: 'Meals Included' },
  { icon: Shield, label: 'Travel Insurance' },
  { icon: Clock, label: 'Flexible Timing' },
];

export function FeaturedTour() {
  return (
    <section className="py-16 md:py-24 bg-[#FFF9F2]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-3xl overflow-hidden shadow-[0_12px_40px_rgba(12,18,30,0.09)]"
        >
          <div className="grid lg:grid-cols-2">
            {/* Left: Content */}
            <div className="p-8 lg:p-12 flex flex-col justify-center">
              <Badge className="bg-[#8B1E3F] text-white w-fit mb-4">
                🔥 Best Seller
              </Badge>

              <h2 className="mb-4">Ultimate Darjeeling Experience</h2>

              <p className="text-[#6B7280] text-lg mb-6">
                Experience the magic of Darjeeling with our most popular 5-day tour package. Witness breathtaking sunrises, explore tea estates, and immerse yourself in the local culture.
              </p>

              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl font-bold text-[#111827]">₹15,999</span>
                <span className="text-[#6B7280] line-through">₹19,999</span>
                <Badge className="bg-[#10B981] text-white">20% OFF</Badge>
              </div>

              <div className="mb-6">
                <h4 className="mb-4">What's Included:</h4>
                <div className="grid grid-cols-2 gap-4">
                  {inclusions.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.label} className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#10B981]/10 flex items-center justify-center">
                          <Icon className="w-4 h-4 text-[#10B981]" />
                        </div>
                        <span className="text-sm">{item.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <ul className="space-y-2 mb-8">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-[#10B981] mt-0.5 flex-shrink-0" />
                  <span className="text-[#6B7280]">5 days / 4 nights accommodation in premium hotels</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-[#10B981] mt-0.5 flex-shrink-0" />
                  <span className="text-[#6B7280]">Toy train ride & tiger hill sunrise experience</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-[#10B981] mt-0.5 flex-shrink-0" />
                  <span className="text-[#6B7280]">Tea garden tours with tasting sessions</span>
                </li>
              </ul>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-gradient-primary text-white px-8 rounded-full hover:opacity-90 flex-1"
                  onClick={() => {
                    if (typeof window !== 'undefined' && (window as any).gtag) {
                      (window as any).gtag('event', 'tour_book_click', { tour_id: 'darjeeling-ultimate' });
                    }
                    window.location.hash = '#/explore/darjeeling';
                  }}
                >
                  Book Now
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full px-8 flex-1"
                  onClick={() => {
                    // Build a simple itinerary text and trigger download
                    const itinerary = `GOBRO — DARJEELING 5-DAY ITINERARY\n\n` +
                      `Day 1 — Arrival & Mall Road\n  - Reach Darjeeling, check in\n  - Evening at Mall Road, Chowrasta\n  - Sunset at Observatory Hill\n\n` +
                      `Day 2 — Tiger Hill & Toy Train\n  - Tiger Hill sunrise (4:30 AM)\n  - Batasia Loop, Ghum Monastery\n  - DHR Toy Train ride\n\n` +
                      `Day 3 — Tea Gardens & Wildlife\n  - Happy Valley Tea Estate tour\n  - Padmaja Naidu Zoo (red pandas)\n  - HMI Mountaineering Museum\n\n` +
                      `Day 4 — Day Trip to Mirik\n  - Sumendu Lake boating\n  - Bokar Monastery\n  - Orange orchards\n\n` +
                      `Day 5 — Departure\n  - Tea shopping at Glenary's\n  - Train to NJP\n\nGenerated by Gobro · gobro.app`;
                    const blob = new Blob([itinerary], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'darjeeling-5day-itinerary.txt';
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Itinerary
                </Button>
              </div>
            </div>

            {/* Right: Image */}
            <div className="relative h-64 lg:h-auto">
              <img
                src="https://images.unsplash.com/photo-1679418536818-7a7fb2db49bc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXJqZWVsaW5nJTIwdGVhJTIwZ2FyZGVuc3xlbnwxfHx8fDE3NjM0NDc5MDd8MA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Darjeeling tea gardens"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

              {/* Floating stats */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-sm rounded-2xl p-4"
              >
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-[#111827]">5</div>
                    <div className="text-xs text-[#6B7280]">Days</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[#111827]">4.9</div>
                    <div className="text-xs text-[#6B7280]">Rating</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[#111827]">500+</div>
                    <div className="text-xs text-[#6B7280]">Booked</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
