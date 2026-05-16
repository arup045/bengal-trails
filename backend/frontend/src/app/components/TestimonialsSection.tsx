import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Star } from 'lucide-react';

export function TestimonialsSection() {
  const floatingCards = [
    // TOP LEFT CORNER - 2 cards
    {
      src: 'https://images.unsplash.com/photo-1746175832129-fddb132c075c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXJqZWVsaW5nJTIwdGVhJTIwZ2FyZGVufGVufDF8fHx8MTc2MzQ2NzIwOXww&ixlib=rb-4.1.0&q=80&w=1080',
      position: 'top-[3%] left-[1%]',
      size: 'w-24 h-28',
      rotation: -7,
      delay: 0,
    },
    {
      src: 'https://images.unsplash.com/photo-1705521680496-d5d7b22c14f7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdW5kYXJiYW5zJTIwbWFuZ3JvdmUlMjBmb3Jlc3R8ZW58MXx8fHwxNzYzNTMwNjU1fDA&ixlib=rb-4.1.0&q=80&w=1080',
      position: 'top-[0%] left-[9%]',
      size: 'w-32 h-40',
      rotation: 5,
      delay: 0.05,
    },

    // LEFT UPPER - 3 cards
    {
      src: 'https://images.unsplash.com/photo-1697817665440-f988c6d5080f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aWN0b3JpYSUyMG1lbW9yaWFsJTIwa29sa2F0YXxlbnwxfHx8fDE3NjM0NzU2MTB8MA&ixlib=rb-4.1.0&q=80&w=1080',
      position: 'top-[4%] left-[18%]',
      size: 'w-24 h-24',
      rotation: -5,
      delay: 0.1,
    },
    {
      src: 'https://images.unsplash.com/photo-1704788564069-d54cab4169aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB0ZW1wbGUlMjBhcmNoaXRlY3R1cmV8ZW58MXx8fHwxNzYzNDc5NzAyfDA&ixlib=rb-4.1.0&q=80&w=1080',
      position: 'top-[15%] left-[1%]',
      size: 'w-28 h-36',
      rotation: 8,
      delay: 0.15,
    },
    {
      src: 'https://images.unsplash.com/photo-1728364282744-61ccb6cfe2f9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkdXJnYSUyMHB1amElMjBmZXN0aXZhbHxlbnwxfHx8fDE3NjM1NTU2MTZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
      position: 'top-[22%] left-[12%]',
      size: 'w-24 h-32',
      rotation: -4,
      delay: 0.2,
    },

    // LEFT MIDDLE - 3 cards
    {
      src: 'https://images.unsplash.com/photo-1721070025492-26368db1706f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaW1hbGF5YW4lMjBtb3VudGFpbnMlMjBkYXJqZWVsaW5nfGVufDF8fHx8MTc2MzU1NTYxNnww&ixlib=rb-4.1.0&q=80&w=1080',
      position: 'top-[38%] left-[18%]',
      size: 'w-20 h-28',
      rotation: 6,
      delay: 0.25,
    },
    {
      src: 'https://images.unsplash.com/photo-1728364283053-b1e2abe71611?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrb2xrYXRhJTIwc3RyZWV0JTIwZm9vZHxlbnwxfHx8fDE3NjM1NTU2MTZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
      position: 'top-[42%] left-[2%]',
      size: 'w-32 h-32',
      rotation: -6,
      delay: 0.3,
    },
    {
      src: 'https://images.unsplash.com/photo-1763450156356-80f76a70f005?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZW5nYWwlMjBoZXJpdGFnZSUyMGJ1aWxkaW5nfGVufDF8fHx8MTc2MzU1NTYxN3ww&ixlib=rb-4.1.0&q=80&w=1080',
      position: 'top-[48%] left-[11%]',
      size: 'w-24 h-28',
      rotation: 5,
      delay: 0.35,
    },

    // BOTTOM LEFT - 2 cards
    {
      src: 'https://images.unsplash.com/photo-1706602870305-8bf0161bcc3b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB0b3VyaXN0JTIwZGVzdGluYXRpb258ZW58MXx8fHwxNjYzNTU1NjE3fDA&ixlib=rb-4.1.0&q=80&w=1080',
      position: 'bottom-[5%] left-[16%]',
      size: 'w-28 h-32',
      rotation: -5,
      delay: 0.4,
    },
    {
      src: 'https://images.unsplash.com/photo-1577500729553-2bc7b3576db2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidWRkaGlzdCUyMG1vbmFzdGVyeSUyMGhpbWFsYXlhfGVufDF8fHx8MTc2MzU1NTYyMnww&ixlib=rb-4.1.0&q=80&w=1080',
      position: 'bottom-[0%] left-[1%]',
      size: 'w-24 h-28',
      rotation: 7,
      delay: 0.45,
    },

    // TOP RIGHT CORNER - 2 cards
    {
      src: 'https://images.unsplash.com/photo-1666891717987-7509e81db05a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWElMjBwbGFudGF0aW9uJTIwaW5kaWF8ZW58MXx8fHwxNzYzNDYxODAzfDA&ixlib=rb-4.1.0&q=80&w=1080',
      position: 'top-[5%] right-[18%]',
      size: 'w-24 h-24',
      rotation: 5,
      delay: 0.1,
    },
    {
      src: 'https://images.unsplash.com/photo-1646983418757-207420381a5b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrb2xrYXRhJTIwdHJhbSUyMHZpbnRhZ2V8ZW58MXx8fHwxNzYzNTU1NjE4fDA&ixlib=rb-4.1.0&q=80&w=1080',
      position: 'top-[0%] right-[9%]',
      size: 'w-32 h-40',
      rotation: -5,
      delay: 0.05,
    },

    // RIGHT UPPER - 3 cards
    {
      src: 'https://images.unsplash.com/photo-1602320763174-e34d84feae55?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZW5nYWwlMjB0aWdlciUyMHdpbGRsaWZlfGVufDF8fHx8MTc2MzQ5OTIyMXww&ixlib=rb-4.1.0&q=80&w=1080',
      position: 'top-[4%] right-[1%]',
      size: 'w-24 h-28',
      rotation: 6,
      delay: 0,
    },
    {
      src: 'https://images.unsplash.com/photo-1677431647033-5dc05838ba54?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBtYXJrZXQlMjBjb2xvcmZ1bHxlbnwxfHx8fDE3NjM1NTU2MTl8MA&ixlib=rb-4.1.0&q=80&w=1080',
      position: 'top-[24%] right-[12%]',
      size: 'w-24 h-32',
      rotation: 4,
      delay: 0.2,
    },
    {
      src: 'https://images.unsplash.com/photo-1753123291266-321b1bade3a1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYWxhY2UlMjBhcmNoaXRlY3R1cmUlMjBpbmRpYXxlbnwxfHx8fDE3NjM1NTU2MTl8MA&ixlib=rb-4.1.0&q=80&w=1080',
      position: 'top-[16%] right-[1%]',
      size: 'w-28 h-36',
      rotation: -8,
      delay: 0.15,
    },

    // RIGHT MIDDLE - 3 cards
    {
      src: 'https://images.unsplash.com/photo-1629184950099-3eb7993b5f48?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3VudGFpbiUyMGxhbmRzY2FwZSUyMGhpbWFsYXlhfGVufDF8fHx8MTc2MzU1NTYyMHww&ixlib=rb-4.1.0&q=80&w=1080',
      position: 'top-[40%] right-[18%]',
      size: 'w-20 h-28',
      rotation: -6,
      delay: 0.25,
    },
    {
      src: 'https://images.unsplash.com/photo-1603646315726-5aad1908e00d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBjdWx0dXJhbCUyMGZlc3RpdmFsfGVufDF8fHx8MTc2MzU1MzEyMHww&ixlib=rb-4.1.0&q=80&w=1080',
      position: 'top-[50%] right-[11%]',
      size: 'w-24 h-28',
      rotation: 5,
      delay: 0.35,
    },
    {
      src: 'https://images.unsplash.com/photo-1706963336286-029a26cd7810?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyaXZlciUyMGxhbmRzY2FwZSUyMGluZGlhfGVufDF8fHx8MTc2MzU1NTYyMXww&ixlib=rb-4.1.0&q=80&w=1080',
      position: 'top-[44%] right-[2%]',
      size: 'w-32 h-32',
      rotation: 6,
      delay: 0.3,
    },

    // BOTTOM RIGHT - 2 cards
    {
      src: 'https://images.unsplash.com/photo-1720070143795-52e5f5ed7eaf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZXJpdGFnZSUyMGhvdGVsJTIwaW5kaWF8ZW58MXx8fHwxNzYzNTU1NjIxfDA&ixlib=rb-4.1.0&q=80&w=1080',
      position: 'bottom-[6%] right-[16%]',
      size: 'w-28 h-32',
      rotation: 5,
      delay: 0.4,
    },
    {
      src: 'https://images.unsplash.com/photo-1655484575595-72a93243f104?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBiZWFjaCUyMHN1bnNldHxlbnwxfHx8fDE3NjM1NTU2MjJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
      position: 'bottom-[0%] right-[1%]',
      size: 'w-24 h-28',
      rotation: -7,
      delay: 0.45,
    },
  ];

  return (
    <section className="relative py-32 bg-gradient-to-b from-white to-orange-50/30 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative">
        {/* Desktop Layout with Floating Cards */}
        <div className="hidden lg:block">
          <div className="relative h-[600px] max-w-6xl mx-auto">
            {/* Floating Destination Cards */}
            {floatingCards.map((card, index) => (
              <motion.div
                key={index}
                className={`absolute ${card.position} ${card.size}`}
                initial={{ opacity: 0, scale: 0.8, y: 30 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  delay: card.delay,
                  duration: 0.6,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
              >
                <motion.div
                  animate={{
                    y: [0, -15, 0],
                  }}
                  transition={{
                    duration: 6 + index * 0.2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: card.delay,
                  }}
                  className="relative group cursor-pointer h-full"
                  whileHover={{ 
                    scale: 1.12, 
                    rotate: card.rotation + 8, 
                    y: -12,
                    transition: { duration: 0.3 }
                  }}
                  style={{ rotate: `${card.rotation}deg` }}
                >
                  {/* Card with white border and shadow */}
                  <div className="h-full bg-white rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] group-hover:shadow-[0_15px_60px_rgba(180,83,9,0.15)] transition-all duration-300 p-3 border border-orange-100/50">
                    <ImageWithFallback
                      src={card.src}
                      alt="Bengal destination"
                      className="w-full h-full object-cover rounded-2xl"
                    />
                  </div>
                </motion.div>
              </motion.div>
            ))}

            {/* Center Content */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-20 w-full max-w-3xl px-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-800 px-6 py-2.5 rounded-full text-sm mb-8 shadow-sm"
              >
                <Star className="w-4 h-4 fill-orange-600 text-orange-600" />
                <span>Rated 4.9/5 by 12,000+ travelers</span>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.7, duration: 0.6 }}
                className="text-6xl md:text-7xl leading-[1.1] mb-6"
              >
                Unforgettable Bengal
                <br />
                <span className="text-gray-400">experiences await</span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8 }}
                className="text-gray-600 text-xl mb-10 leading-relaxed max-w-2xl mx-auto"
              >
                Join thousands of explorers discovering the rich heritage, stunning landscapes,
                and vibrant culture of West Bengal.
              </motion.p>

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.9 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-10 py-5 rounded-full hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg hover:shadow-xl group"
              >
                <span className="text-lg">Explore Traveler Stories</span>
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  →
                </motion.span>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile & Tablet Layout */}
        <div className="lg:hidden text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-800 px-5 py-2 rounded-full text-sm mb-6 shadow-sm"
          >
            <Star className="w-4 h-4 fill-orange-600 text-orange-600" />
            <span>Rated 4.9/5 by 12,000+ travelers</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl leading-tight mb-4"
          >
            Unforgettable Bengal
            <br />
            <span className="text-gray-400">experiences await</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-600 mb-8 px-4"
          >
            Join thousands of explorers discovering the rich heritage, stunning landscapes,
            and vibrant culture of West Bengal.
          </motion.p>

          {/* Mobile Grid */}
          <div className="grid grid-cols-3 gap-3 mb-10 max-w-md mx-auto px-4">
            {floatingCards.slice(0, 6).map((card, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="aspect-[3/4]"
              >
                <div className="h-full bg-white rounded-2xl shadow-md overflow-hidden p-2 border border-orange-100/50">
                  <ImageWithFallback
                    src={card.src}
                    alt="Bengal destination"
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
              </motion.div>
            ))}
          </div>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-8 py-4 rounded-full hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg"
          >
            <span>Explore Traveler Stories</span>
            <span>→</span>
          </motion.button>
        </div>
      </div>
    </section>
  );
}