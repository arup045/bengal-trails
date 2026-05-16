import { motion } from 'motion/react';
import { Star, MapPin, Wallet } from 'lucide-react';
import { useDestinationContext } from '../hooks/useBengalContent';

const priceColors = {
  budget: 'bg-green-500/10 text-green-700 border-green-500/30',
  mid: 'bg-blue-500/10 text-blue-700 border-blue-500/30',
  premium: 'bg-purple-500/10 text-purple-700 border-purple-500/30',
};

export function HotelsSection({ destinationSlug }: { destinationSlug: string }) {
  const { hotels, loading } = useDestinationContext(destinationSlug);

  if (loading || hotels.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="py-12 px-4 bg-secondary/30"
    >
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Where to stay</h2>
          <p className="text-muted-foreground">
            {hotels.length} curated stays — budget to premium
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {hotels.map((h, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -4 }}
              className="rounded-2xl bg-card border shadow-sm overflow-hidden hover:shadow-lg transition-all"
            >
              {h.image && (
                <div className="h-48 bg-secondary overflow-hidden">
                  <img
                    src={h.image}
                    alt={h.name}
                    loading="lazy"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold leading-tight">{h.name}</h3>
                  <div className="flex items-center gap-1 text-xs shrink-0">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                    {h.rating}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {h.address}
                </p>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full border ${priceColors[h.priceCategory]}`}
                >
                  {h.type}
                </span>
                <div className="mt-3 flex items-center gap-1 text-sm font-medium">
                  <Wallet className="w-4 h-4 text-primary" />
                  {h.priceRange}
                </div>
                <div className="mt-3 flex flex-wrap gap-1">
                  {h.highlights.slice(0, 3).map((tag, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-secondary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                {h.bookingNote && (
                  <p className="mt-3 text-xs italic text-muted-foreground">
                    💡 {h.bookingNote}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

export default HotelsSection;
