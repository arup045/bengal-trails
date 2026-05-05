import { Sparkles, CheckCircle2, MapPinned } from 'lucide-react';

export function Features() {
  const features = [
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: 'Authentic Bengal Experiences',
      description: 'Curated tours showcasing the rich cultural heritage, traditions, and hidden gems of West Bengal.',
    },
    {
      icon: <CheckCircle2 className="w-8 h-8" />,
      title: 'Easy & Quick Booking',
      description: 'Book your perfect Bengal adventure in minutes with our simple and secure booking process.',
    },
    {
      icon: <MapPinned className="w-8 h-8" />,
      title: 'Expert Local Guides',
      description: 'Experience Bengal through the eyes of locals who know every hidden gem and story.',
    },
  ];

  return (
    <section className="py-16 px-6 bg-white">
      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <div
            key={index}
            className="flex flex-col items-center text-center p-6 rounded-2xl hover:shadow-lg transition-shadow"
          >
            <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mb-4">
              {feature.icon}
            </div>
            <h3 className="mb-2">{feature.title}</h3>
            <p className="text-gray-600">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}