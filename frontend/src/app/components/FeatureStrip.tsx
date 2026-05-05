import { CheckCircle2, Users, Shield } from 'lucide-react';
import { motion } from 'motion/react';

const features = [
  {
    icon: CheckCircle2,
    title: 'Easy & Quick Booking',
    description: 'Book tours in 3 steps.',
    color: '#10B981',
  },
  {
    icon: Users,
    title: 'Local Guides',
    description: 'Certified local hosts.',
    color: '#6A00FF',
  },
  {
    icon: Shield,
    title: 'Flexible Cancellation',
    description: 'Hassle-free refunds.',
    color: '#00D0FF',
  },
];

export function FeatureStrip() {
  return (
    <section className="py-12 md:py-16 bg-[#FFF9F2]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-8 lg:px-12">
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -6 }}
                className="bg-white rounded-2xl p-6 lg:p-8 shadow-[0_4px_12px_rgba(12,18,30,0.06)] cursor-pointer transition-all"
                onClick={() => {
                  if (typeof window !== 'undefined' && (window as any).gtag) {
                    (window as any).gtag('event', 'feature_click', {
                      feature: feature.title,
                    });
                  }
                }}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${feature.color}20` }}
                >
                  <Icon className="w-6 h-6" style={{ color: feature.color }} />
                </div>
                <h3 className="mb-2">{feature.title}</h3>
                <p className="text-[#6B7280]">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
