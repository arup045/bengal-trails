import { motion } from 'motion/react';
import { Train, Car, Bus, Plane, Mountain } from 'lucide-react';
import { useDestinationContext } from '../hooks/useBengalContent';

const modeIcons: Record<string, any> = {
  train: Train,
  car: Car,
  bus: Bus,
  flight: Plane,
  flight_cab: Plane,
  shared_jeep: Car,
  toy_train: Mountain,
  guided_tour: Bus,
  self_drive: Car,
  public: Bus,
  train_jeep: Train,
};

interface Props {
  destinationSlug: string;
}

export function TransportGuideSection({ destinationSlug }: Props) {
  const { transport, loading } = useDestinationContext(destinationSlug);

  if (loading) return null;
  if (!transport) return null;

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
          <h2 className="text-3xl font-bold mb-2">How to reach</h2>
          <p className="text-muted-foreground">
            From {transport.fromCity} · {transport.distance} away
            {transport.bestSeason ? ` · Best: ${transport.bestSeason}` : ''}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {transport.options.map((opt, idx) => {
            const Icon = modeIcons[opt.mode] || Car;
            return (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.02 }}
                className="p-5 rounded-2xl bg-card border shadow-sm hover:shadow-lg transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{opt.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{opt.details}</p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="px-2 py-1 rounded-full bg-blue-500/10 text-blue-600">
                        ⏱ {opt.duration}
                      </span>
                      <span className="px-2 py-1 rounded-full bg-green-500/10 text-green-600">
                        ₹ {opt.cost}
                      </span>
                    </div>
                    {opt.tip && (
                      <div className="mt-3 p-2 rounded-lg bg-amber-500/10 text-xs text-amber-700 dark:text-amber-400">
                        💡 {opt.tip}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {transport.avoidSeason && (
          <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-sm">
            ⚠️ <strong>Avoid:</strong> {transport.avoidSeason}
          </div>
        )}
      </div>
    </motion.section>
  );
}

export default TransportGuideSection;
