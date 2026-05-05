import { ImageWithFallback } from './figma/ImageWithFallback';

export function PromoSection() {
  return (
    <section className="py-20 px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        {/* Left Image */}
        <div className="relative">
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-purple-200 rounded-full blur-3xl opacity-50"></div>
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1762375212854-3d516e202b9d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmF2ZWxlciUyMGJhY2twYWNrJTIwbW91bnRhaW4lMjB2aWV3fGVufDF8fHx8MTc2MzU2MzUyMnww&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Traveler exploring mountain landscapes"
            className="rounded-full w-full max-w-md mx-auto relative z-10 shadow-2xl"
          />
        </div>

        {/* Right Content */}
        <div className="space-y-6">
          <p className="text-purple-600 uppercase tracking-wide">Discover Your</p>
          <h2 className="text-4xl md:text-5xl leading-tight">
            Life is Short And The
            <br />
            World is <span className="text-purple-600">Wide!</span>
          </h2>
          <p className="text-gray-600 leading-relaxed">
            From the misty peaks of Darjeeling to the mangrove forests of Sundarbans, West Bengal offers diverse experiences waiting to be explored. Immerse yourself in rich heritage, vibrant festivals, and warm hospitality. Let every journey become a cherished memory as you discover the beauty and culture of Bengal.
          </p>
          <button className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-8 py-3 rounded-full hover:shadow-lg hover:shadow-purple-500/50 transition-all">
            Discover
          </button>
        </div>
      </div>
    </section>
  );
}