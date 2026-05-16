import { TrendingUp, Camera, Utensils, Car, Mountain, Bike } from 'lucide-react';
import { memo } from 'react';
import { SmartSearchBar } from './SmartSearchBar';

const TourTypeButton = memo(({ icon, label, href }: { icon: React.ReactNode; label: string; href: string }) => (
  <a
    href={href}
    className="flex items-center gap-2 px-4 py-2 bg-white/90 rounded-full hover:bg-white transition-colors will-change-transform"
  >
    {icon}
    <span className="text-sm font-medium text-gray-800">{label}</span>
  </a>
));
TourTypeButton.displayName = 'TourTypeButton';

export function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-purple-700 via-purple-600 to-orange-500 overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-40"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1742325646212-f917ba1feeaa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3dyYWglMjBicmlkZ2UlMjBrb2xrYXRhJTIwc3Vuc2V0fGVufDF8fHx8MTc2MzQ4MjUyMXww&ixlib=rb-4.1.0&q=80&w=1080')`
        }}
      />

      <div className="max-w-7xl mx-auto px-6 py-20 sm:py-24 relative">
        <p className="text-center text-white/90 mb-6">🌟 Explore India's Cultural Capital</p>

        <div className="text-center space-y-4 mb-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl leading-tight text-white">
            Discover the Heart of
            <br />
            <span className="text-yellow-300">West Bengal</span>
          </h1>
          <p className="text-white/90 text-base sm:text-lg max-w-2xl mx-auto">
            From tea gardens to tidal mangroves — explore stunning places,
            <br className="hidden sm:inline" />
            stories, festivals & curated tours.
          </p>
        </div>

        {/* The unified smart search bar — same component used everywhere */}
        <div className="max-w-2xl mx-auto mb-8 relative">
          <SmartSearchBar
            size="lg"
            placeholder="Search destinations, festivals, food…"
          />
        </div>

        {/* Trending quick-pick chips */}
        <div className="flex flex-wrap gap-3 justify-center max-w-4xl mx-auto mb-8">
          <span className="text-white/70 text-sm self-center mr-2">Trending:</span>
          <TourTypeButton icon={<Mountain className="w-4 h-4 text-orange-600" />} label="Darjeeling" href="#/explore/darjeeling" />
          <TourTypeButton icon={<TrendingUp className="w-4 h-4 text-orange-600" />} label="Sundarbans" href="#/explore/sundarbans-national-park" />
          <TourTypeButton icon={<Camera className="w-4 h-4 text-orange-600" />} label="Victoria Memorial" href="#/explore/victoria-memorial-kolkata" />
          <TourTypeButton icon={<Utensils className="w-4 h-4 text-orange-600" />} label="Bengali Food" href="#/food" />
          <TourTypeButton icon={<Car className="w-4 h-4 text-orange-600" />} label="Plan Trip" href="#/itinerary" />
          <TourTypeButton icon={<Bike className="w-4 h-4 text-orange-600" />} label="Festivals" href="#/festivals" />
        </div>
      </div>
    </section>
  );
}
