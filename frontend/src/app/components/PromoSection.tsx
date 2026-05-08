import { ImageWithFallback } from './figma/ImageWithFallback';
import { useNavigate } from 'react-router-dom';

export function PromoSection() {
  const navigate = useNavigate();

  return (
    <section className="py-20 px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        {/* Left Image */}
        <div className="relative">
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-purple-200 rounded-full blur-3xl opacity-50"></div>
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1080&q=80"
            alt="Traveler exploring Darjeeling tea gardens"
            className="rounded-full w-full max-w-md mx-auto relative z-10 shadow-2xl aspect-square object-cover"
          />
        </div>

        {/* Right Content */}
        <div className="space-y-6">
          <p className="text-purple-600 uppercase tracking-wide">Discover Bengal</p>
          <h2 className="text-4xl md:text-5xl leading-tight">
            Life is Short And The
            <br />
            World is <span className="text-purple-600">Wide!</span>
          </h2>
          <p className="text-gray-600 leading-relaxed">
            From the misty peaks of Darjeeling to the mangrove forests of Sundarbans, West Bengal offers diverse experiences waiting to be explored. Immerse yourself in rich heritage, vibrant festivals, and warm hospitality.
          </p>
          <button
            onClick={() => navigate('/explore')}
            className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-8 py-3 rounded-full hover:shadow-lg hover:shadow-purple-500/50 transition-all"
          >
            Start Exploring
          </button>
        </div>
      </div>
    </section>
  );
}
