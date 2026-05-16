import { Button } from './ui/button';
import { motion } from 'motion/react';
import { Smartphone, Star, Users, MapPin } from 'lucide-react';

const stats = [
  { value: '1,200+', label: 'Tours', icon: MapPin },
  { value: '50k+', label: 'Happy Travelers', icon: Users },
  { value: '4.8', label: 'App Rating', icon: Star },
];

export function AppPromo() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-[1440px] mx-auto px-6 md:px-8 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Phone Mockups */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative max-w-md mx-auto">
              {/* Decorative circles */}
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-[#6A00FF]/20 to-[#00D0FF]/20 rounded-full blur-3xl"
              />

              {/* Phone mockup */}
              <div className="relative z-10">
                <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] rounded-[3rem] p-3 shadow-2xl">
                  <div className="bg-white rounded-[2.5rem] overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1629697776809-f37ceac39e77?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2JpbGUlMjBhcHAlMjBtb2NrdXB8ZW58MXx8fHwxNzYzMzI2Mjg5fDA&ixlib=rb-4.1.0&q=80&w=1080"
                      alt="Mobile app mockup"
                      className="w-full h-auto"
                    />
                  </div>
                </div>
              </div>

              {/* Floating icons */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-10 -right-4 bg-white rounded-2xl p-4 shadow-xl"
              >
                <MapPin className="w-6 h-6 text-[#6A00FF]" />
              </motion.div>

              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                className="absolute bottom-20 -left-4 bg-white rounded-2xl p-4 shadow-xl"
              >
                <Smartphone className="w-6 h-6 text-[#00D0FF]" />
              </motion.div>
            </div>
          </motion.div>

          {/* Right: Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="inline-block text-sm font-semibold text-[#6A00FF] mb-4">
              Download Our App
            </div>

            <h2 className="mb-6">
              Your Travel Companion in Your Pocket
            </h2>

            <p className="text-[#6B7280] text-lg mb-8">
              Download our mobile app to access offline maps, exclusive offers, and real-time updates on your bookings. Travel smarter with West Bengal Travel.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="w-4 h-4 text-[#6A00FF]" />
                      <div className="text-2xl font-bold text-[#111827]">{stat.value}</div>
                    </div>
                    <div className="text-sm text-[#6B7280]">{stat.label}</div>
                  </motion.div>
                );
              })}
            </div>

            {/* Download Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-black text-white hover:bg-black/90 rounded-xl px-6"
                onClick={() => {
                  if (typeof window !== 'undefined' && (window as any).gtag) {
                    (window as any).gtag('event', 'app_store_click', { store: 'apple' });
                  }
                }}
              >
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  <div className="text-left">
                    <div className="text-xs">Download on the</div>
                    <div className="font-semibold">App Store</div>
                  </div>
                </div>
              </Button>

              <Button
                size="lg"
                className="bg-black text-white hover:bg-black/90 rounded-xl px-6"
                onClick={() => {
                  if (typeof window !== 'undefined' && (window as any).gtag) {
                    (window as any).gtag('event', 'app_store_click', { store: 'google' });
                  }
                }}
              >
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 20.5v-17c0-.59.34-1.11.84-1.35L13.69 12l-9.85 9.85c-.5-.24-.84-.76-.84-1.35zm10.84-8.5l2.38 2.38-9.17 5.16L13.84 12zm1.28-1.28L17.5 8.34c.45.26.73.76.73 1.31s-.28 1.05-.73 1.31l-2.38 1.38-1.28-1.28zm-8.96-5.38l9.17 5.16-2.38 2.38-6.79-6.79z"/>
                  </svg>
                  <div className="text-left">
                    <div className="text-xs">GET IT ON</div>
                    <div className="font-semibold">Google Play</div>
                  </div>
                </div>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
