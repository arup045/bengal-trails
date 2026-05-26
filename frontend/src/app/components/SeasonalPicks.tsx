import { motion } from 'motion/react';
import { ArrowRight, Sun, CloudRain, Sparkles, Snowflake } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface Pick { name: string; href: string; image: string; }
interface Season { key: string; label: string; tagline: string; icon: any; gradient: string; picks: Pick[]; }

// Real, curated season-aware recommendations (no fabricated data — just which
// real destinations suit the current season). Chosen by the current month.
function currentSeason(): Season {
  const m = new Date().getMonth() + 1; // 1-12
  if (m >= 3 && m <= 6) return {
    key: 'summer', label: 'Beat the heat in the hills', icon: Sun, gradient: 'from-amber-500 to-orange-600',
    tagline: 'Summer is hill-station season — cool air, tea gardens and mountain views.',
    picks: [
      { name: 'Darjeeling', href: '/explore/darjeeling', image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600' },
      { name: 'Kalimpong',  href: '/explore/kalimpong',  image: 'https://images.unsplash.com/photo-1637825987997-6e6d117b81b1?w=600' },
      { name: 'Mirik',      href: '/explore/mirik',      image: 'https://images.unsplash.com/photo-1591018653367-7c6f6f1e7b3a?w=600' },
    ],
  };
  if (m >= 7 && m <= 9) return {
    key: 'monsoon', label: 'Lush & green in the monsoon', icon: CloudRain, gradient: 'from-emerald-500 to-teal-600',
    tagline: 'Monsoon paints Bengal emerald — perfect for the Sundarbans, waterfalls and tea estates.',
    picks: [
      { name: 'Sundarbans', href: '/explore/sundarbans-national-park', image: 'https://images.unsplash.com/photo-1585136917228-63d6c2a43ffa?w=600' },
      { name: 'Darjeeling', href: '/explore/darjeeling',               image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600' },
      { name: 'Bishnupur',  href: '/explore/bishnupur',                image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600' },
    ],
  };
  if (m >= 10 && m <= 11) return {
    key: 'autumn', label: 'Festival season is here', icon: Sparkles, gradient: 'from-fuchsia-500 to-purple-600',
    tagline: 'Autumn brings Durga Puja and the year’s best weather — ideal for culture and city breaks.',
    picks: [
      { name: 'Kolkata',       href: '/explore/district/kolkata',     image: 'https://images.unsplash.com/photo-1558431382-27e303142255?w=600' },
      { name: 'Shantiniketan', href: '/explore/shantiniketan',        image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=600' },
      { name: 'All festivals', href: '/festivals',                    image: 'https://images.unsplash.com/photo-1728364282744-61ccb6cfe2f9?w=600' },
    ],
  };
  return {
    key: 'winter', label: 'Perfect weather, everywhere', icon: Snowflake, gradient: 'from-sky-500 to-blue-600',
    tagline: 'Winter is Bengal’s prime season — cool, dry and great from the beaches to the hills.',
    picks: [
      { name: 'Digha',      href: '/explore/digha',                   image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600' },
      { name: 'Sundarbans', href: '/explore/sundarbans-national-park', image: 'https://images.unsplash.com/photo-1585136917228-63d6c2a43ffa?w=600' },
      { name: 'Darjeeling', href: '/explore/darjeeling',              image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600' },
    ],
  };
}

export function SeasonalPicks() {
  const s = currentSeason();
  const Icon = s.icon;
  return (
    <section className="max-w-7xl mx-auto px-5 sm:px-8 py-12">
      <div className={`rounded-3xl bg-gradient-to-br ${s.gradient} p-6 sm:p-8 text-white`}>
        <div className="flex items-center gap-2 mb-1">
          <Icon className="w-5 h-5" />
          <span className="font-poppins text-xs font-semibold uppercase tracking-widest text-white/80">Right now in West Bengal</span>
        </div>
        <h2 className="font-poppins text-2xl sm:text-3xl font-bold mb-2">{s.label}</h2>
        <p className="font-poppins text-white/85 max-w-2xl mb-6">{s.tagline}</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {s.picks.map((p, i) => (
            <motion.a key={p.href} href={p.href}
              initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              className="group relative h-40 rounded-2xl overflow-hidden shadow-lg">
              <ImageWithFallback src={p.image} alt={p.name} optimizeWidth={640} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                <span className="font-poppins font-semibold text-white text-lg">{p.name}</span>
                <ArrowRight className="w-5 h-5 text-white/80 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
