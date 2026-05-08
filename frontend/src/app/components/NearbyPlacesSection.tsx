import { motion } from 'motion/react';
import { MapPin } from 'lucide-react';
import { useDestinationContext } from '../hooks/useBengalContent';

export function NearbyPlacesSection({ destinationSlug }: { destinationSlug: string }) {
  const { subplaces, loading } = useDestinationContext(destinationSlug);

  if (loading || subplaces.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="py-12 px-4"
    >
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Nearby attractions</h2>
          <p className="text-muted-foreground">
            {subplaces.length} must-see spots in the area
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {subplaces.map((sp, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -4 }}
              className="rounded-2xl bg-card border shadow-sm overflow-hidden hover:shadow-lg transition-all"
            >
              {sp.image && (
                <div className="h-44 bg-secondary overflow-hidden">
                  <img
                    src={sp.image}
                    alt={sp.name}
                    loading="lazy"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-semibold leading-tight">{sp.name}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary shrink-0">
                    {sp.type.replace(/_/g, ' ')}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {sp.distance}
                </p>
                <p className="text-sm text-muted-foreground">{sp.description}</p>
                {sp.bestTime && (
                  <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                    ⏰ Best time: {sp.bestTime}
                  </div>
                )}
                {sp.tip && (
                  <div className="mt-2 text-xs italic text-muted-foreground">
                    💡 {sp.tip}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

export default NearbyPlacesSection;
