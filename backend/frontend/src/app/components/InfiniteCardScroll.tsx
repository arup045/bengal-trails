import { motion } from 'motion/react';

interface Card {
  title: string;
  category: string;
  color: string;
}

export function InfiniteCardScroll() {
  const cardRows = [
    // Row 1 - Cultural Tours
    [
      { title: 'Museum Trail', category: 'Cultural Tour', color: 'from-purple-500 to-purple-700' },
      { title: 'Architecture', category: 'Cultural Tour', color: 'from-blue-500 to-blue-700' },
      { title: 'Historical Places', category: 'Cultural Tour', color: 'from-orange-500 to-orange-700' },
      { title: 'Temple Tour', category: 'Cultural Tour', color: 'from-red-500 to-red-700' },
      { title: 'UNESCO Sites', category: 'Cultural Tour', color: 'from-green-500 to-green-700' },
      { title: 'Art & Craft', category: 'Cultural Tour', color: 'from-pink-500 to-pink-700' },
      { title: 'Tribal Culture', category: 'Cultural Tour', color: 'from-indigo-500 to-indigo-700' },
      { title: 'Rural Experience', category: 'Cultural Tour', color: 'from-yellow-500 to-yellow-700' },
      { title: 'Heritage Homestay', category: 'Cultural Tour', color: 'from-teal-500 to-teal-700' },
    ],
    // Row 2 - Festivals
    [
      { title: 'Durga Puja', category: 'Festival Special', color: 'from-red-500 to-orange-600' },
      { title: 'Kali Puja', category: 'Festival Special', color: 'from-purple-600 to-pink-600' },
      { title: 'Poush Mela', category: 'Festival Special', color: 'from-yellow-500 to-orange-500' },
      { title: 'Rath Yatra', category: 'Festival Special', color: 'from-blue-500 to-cyan-600' },
      { title: 'Basanta Utsav', category: 'Festival Special', color: 'from-pink-500 to-rose-600' },
      { title: 'Chhau Festival', category: 'Festival Special', color: 'from-orange-600 to-red-600' },
      { title: 'Nabanna Utsav', category: 'Festival Special', color: 'from-green-500 to-emerald-600' },
      { title: 'Winter Carnival', category: 'Festival Special', color: 'from-blue-600 to-indigo-600' },
      { title: 'Music Festival', category: 'Festival Special', color: 'from-purple-500 to-violet-600' },
    ],
    // Row 3 - Destinations
    [
      { title: 'Hill Station', category: 'Destination', color: 'from-green-600 to-teal-700' },
      { title: 'Coastal Area', category: 'Destination', color: 'from-cyan-500 to-blue-600' },
      { title: 'Metropolitan', category: 'Destination', color: 'from-gray-600 to-slate-700' },
      { title: 'Rural Village', category: 'Destination', color: 'from-amber-500 to-orange-600' },
      { title: 'Island', category: 'Destination', color: 'from-teal-500 to-cyan-600' },
      { title: 'Forest', category: 'Destination', color: 'from-emerald-600 to-green-700' },
      { title: 'Heritage Town', category: 'Destination', color: 'from-rose-500 to-pink-600' },
      { title: 'City Walk', category: 'Destination', color: 'from-indigo-500 to-purple-600' },
    ],
    // Row 4 - Travel Modes
    [
      { title: 'Train Journey', category: 'Travel Mode', color: 'from-blue-600 to-indigo-700' },
      { title: 'Road Trip', category: 'Travel Mode', color: 'from-orange-500 to-red-600' },
      { title: 'Boat Ride', category: 'Travel Mode', color: 'from-cyan-500 to-blue-600' },
      { title: 'Jeep Safari', category: 'Travel Mode', color: 'from-green-600 to-emerald-700' },
      { title: 'Cable Car', category: 'Travel Mode', color: 'from-purple-500 to-violet-600' },
      { title: 'Bike Tour', category: 'Travel Mode', color: 'from-yellow-500 to-orange-600' },
      { title: 'Walking Tour', category: 'Travel Mode', color: 'from-teal-500 to-cyan-600' },
      { title: 'River Cruise', category: 'Travel Mode', color: 'from-blue-500 to-cyan-600' },
    ],
    // Row 5 - Featured Experiences
    [
      { title: 'Darjeeling Tea Trails', category: 'Featured Experience', color: 'from-green-500 to-teal-600' },
      { title: 'Sundarbans Safari', category: 'Featured Experience', color: 'from-emerald-600 to-green-700' },
      { title: 'Kolkata Heritage', category: 'Featured Experience', color: 'from-orange-500 to-amber-600' },
      { title: 'Shantiniketan Art', category: 'Featured Experience', color: 'from-pink-500 to-rose-600' },
      { title: 'Bishnupur Terracotta', category: 'Featured Experience', color: 'from-red-500 to-orange-600' },
      { title: 'Dooars Wildlife', category: 'Featured Experience', color: 'from-green-600 to-emerald-700' },
      { title: 'Mandarmani Beach', category: 'Featured Experience', color: 'from-cyan-500 to-blue-600' },
      { title: 'Murshidabad History', category: 'Featured Experience', color: 'from-amber-600 to-orange-700' },
      { title: 'Cooch Behar Palace', category: 'Featured Experience', color: 'from-purple-500 to-indigo-600' },
    ],
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-white to-orange-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-16">
        <div className="text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-orange-600 uppercase tracking-wide mb-4"
          >
            Experience the Extraordinary
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl mb-6"
          >
            Discover Bengal's Soul
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-600 text-lg max-w-3xl mx-auto"
          >
            From vibrant festivals to serene hill stations, UNESCO heritage sites to pristine beaches — 
            explore the rich tapestry of culture, heritage, nature, and culinary delights
          </motion.p>
        </div>
      </div>

      <div className="space-y-6">
        {cardRows.map((cards, rowIndex) => (
          <InfiniteRow key={rowIndex} cards={cards} direction={rowIndex % 2 === 0 ? 'left' : 'right'} speed={30 + rowIndex * 5} />
        ))}
      </div>
    </section>
  );
}

interface InfiniteRowProps {
  cards: Card[];
  direction: 'left' | 'right';
  speed: number;
}

function InfiniteRow({ cards, direction, speed }: InfiniteRowProps) {
  // Duplicate cards for seamless loop
  const duplicatedCards = [...cards, ...cards, ...cards];

  return (
    <div className="relative flex overflow-hidden">
      <motion.div
        className="flex gap-4"
        animate={{
          x: direction === 'left' ? ['0%', '-33.33%'] : ['-33.33%', '0%'],
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: 'loop',
            duration: speed,
            ease: 'linear',
          },
        }}
      >
        {duplicatedCards.map((card, index) => (
          <motion.div
            key={index}
            className={`flex-shrink-0 w-64 h-40 rounded-2xl bg-gradient-to-br ${card.color} p-6 flex flex-col justify-between text-white shadow-lg`}
            whileHover={{ scale: 1.05, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            <div>
              <p className="text-xs uppercase tracking-wider opacity-90 mb-2">{card.category}</p>
              <h3 className="text-xl">{card.title}</h3>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M6 12L10 8L6 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-sm opacity-90">Explore</span>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
