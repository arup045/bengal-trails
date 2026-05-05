import { ImageWithFallback } from './figma/ImageWithFallback';

export function CultureFestival() {
  const festivals = [
    {
      name: 'Durga Puja',
      image: 'https://images.unsplash.com/photo-1593847794002-a67998d742fc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkdXJnYSUyMHB1amElMjBrb2xrYXRhfGVufDF8fHx8MTc2MzU1ODgwMHww&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      name: 'Kali Puja',
      image: 'https://images.unsplash.com/photo-1697262015433-f87d71406a5c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrYWxpJTIwcHVqYSUyMGZlc3RpdmFsfGVufDF8fHx8MTc2MzU1ODgwMHww&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      name: 'Poush Mela',
      image: 'https://images.unsplash.com/photo-1734349399293-14a68f80fe29?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aW50ZXIlMjBmYWlyJTIwbWFya2V0fGVufDF8fHx8MTc2MzU1ODgwNnww&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      name: 'Basanta Utsav',
      image: 'https://images.unsplash.com/photo-1672093012219-490848c4c013?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob2xpJTIwZmVzdGl2YWwlMjBjb2xvcnN8ZW58MXx8fHwxNjYzNDY1NjE4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      name: 'Rath Yatra',
      image: 'https://images.unsplash.com/photo-1720545412233-9accb72c20e5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyYXRoJTIweWF0cmElMjBmZXN0aXZhbHxlbnwxfHx8fDE3NjM1NTg4MDF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      name: 'Gajan',
      image: 'https://images.unsplash.com/photo-1759430713214-5f34ec5e9c75?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjByZWxpZ2lvdXMlMjBmZXN0aXZhbHxlbnwxfHx8fDE3NjM1NTg4MDF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      name: 'Gangasagar',
      image: 'https://images.unsplash.com/photo-1702043511698-7c29736a9e9f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaWxncmltYWdlJTIwaW5kaWF8ZW58MXx8fHwxNzYzNTU4ODAxfDA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      name: 'Chhau Dance',
      image: 'https://images.unsplash.com/photo-1569851935333-6ca1448cc299?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBmb2xrJTIwZGFuY2V8ZW58MXx8fHwxNzYzNTU4ODAwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      name: 'Nabanna',
      image: 'https://images.unsplash.com/photo-1673352108948-8931b5bdc2f8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXJ2ZXN0JTIwZmVzdGl2YWwlMjBpbmRpYXxlbnwxfHx8fDE3NjM1NTg4MDJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      name: 'Tusu Parab',
      image: 'https://images.unsplash.com/photo-1609332044056-c7ce04a33ead?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmliYWwlMjBmZXN0aXZhbCUyMGluZGlhfGVufDF8fHx8MTc2MzU1ODgwMnww&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      name: 'Jagaddhatri Puja',
      image: 'https://images.unsplash.com/photo-1603773590496-7bab7cabfa72?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBnb2RkZXNzJTIwd29yc2hpcHxlbnwxfHx8fDE3NjM1NTg4MDN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      name: 'Christmas Park Street',
      image: 'https://images.unsplash.com/photo-1702491209980-f7f1d55c221d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaHJpc3RtYXMlMjBjZWxlYnJhdGlvbiUyMGluZGlhfGVufDF8fHx8MTc2MzU1ODgwM3ww&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      name: 'Kolkata Food Fest',
      image: 'https://images.unsplash.com/photo-1613292443284-8d10ef9383fe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBzdHJlZXQlMjBmb29kfGVufDF8fHx8MTc2MzQ0ODQ5NXww&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      name: 'Dooars Tea Fest',
      image: 'https://images.unsplash.com/photo-1682259535179-cbcb4a888ba2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWElMjBwbGFudGF0aW9uJTIwZmVzdGl2YWx8ZW58MXx8fHwxNzYzNTU4ODA0fDA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      name: 'Jungle Mahal',
      image: 'https://images.unsplash.com/photo-1761998849496-9b2c0822dc07?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb3Jlc3QlMjB0cmliYWwlMjBjdWx0dXJlfGVufDF8fHx8MTc2MzU1ODgwNHww&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      name: 'Heritage Festival',
      image: 'https://images.unsplash.com/photo-1672579738105-227fa89d0527?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZXJpdGFnZSUyMGFyY2hpdGVjdHVyZSUyMGluZGlhfGVufDF8fHx8MTc2MzU1ODgwNXww&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      name: 'Dance Festival',
      image: 'https://images.unsplash.com/photo-1682345914623-508d32fa0998?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmFkaXRpb25hbCUyMGluZGlhbiUyMGRhbmNlfGVufDF8fHx8MTc2MzU1ODgwMnww&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      name: 'Art Fair',
      image: 'https://images.unsplash.com/photo-1719935115623-4857df23f3c6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnQlMjBleGhpYml0aW9uJTIwZ2FsbGVyeXxlbnwxfHx8fDE3NjM1MjE1ODB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      name: 'Light Festival',
      image: 'https://images.unsplash.com/photo-1608865413696-fb1e4220173f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaXdhbGklMjBsaWdodHMlMjBmZXN0aXZhbHxlbnwxfHx8fDE3NjM1NTg4MDZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      name: 'Winter Mela',
      image: 'https://images.unsplash.com/photo-1758529225890-9a32b5d5523b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGFzc2ljYWwlMjBkYW5jZSUyMHBlcmZvcm1hbmNlfGVufDF8fHx8MTc2MzU1ODgwNXww&ixlib=rb-4.1.0&q=80&w=1080',
    },
  ];

  // Duplicate the array to create seamless loop
  const duplicatedFestivals = [...festivals, ...festivals];

  return (
    <section className="py-20 px-6 bg-gradient-to-br from-orange-50 via-amber-50 to-orange-50 overflow-hidden">
      <div className="max-w-7xl mx-auto mb-12">
        {/* Punchy Heading */}
        <div className="text-center">
          <p className="text-orange-600 uppercase tracking-wide mb-2">Cultural Heritage</p>
          <h2 className="text-4xl md:text-6xl mb-4">
            Celebrate Bengal's{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-red-600 to-purple-600">
              Vibrant Spirit
            </span>
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Experience the colors, traditions, and soul of West Bengal through its magnificent festivals
          </p>
        </div>
      </div>

      {/* Infinite Sliding Cards */}
      <div className="relative">
        {/* Gradient Overlays */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-orange-50 to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-orange-50 to-transparent z-10" />

        {/* Scrolling Container */}
        <div className="flex gap-6 animate-scroll">
          {duplicatedFestivals.map((festival, index) => (
            <div
              key={index}
              className="flex-shrink-0 group cursor-pointer"
              style={{ width: '280px' }}
            >
              <div className="relative h-96 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-rotate-1">
                {/* Image */}
                <ImageWithFallback
                  src={festival.image}
                  alt={festival.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                
                {/* Festival Name */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-white text-2xl mb-1 transform group-hover:translate-y-[-4px] transition-transform duration-300">
                    {festival.name}
                  </h3>
                  <div className="h-1 w-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full transform origin-left group-hover:scale-x-150 transition-transform duration-300" />
                </div>

                {/* Decorative Corner */}
                <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-white/40 rounded-tr-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Text */}
      <div className="text-center mt-12">
        <p className="text-gray-500 italic">
          20+ Festivals • 365 Days of Culture • One Beautiful Bengal
        </p>
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-280px * ${festivals.length} - ${festivals.length * 24}px));
          }
        }

        .animate-scroll {
          animation: scroll 60s linear infinite;
        }

        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}