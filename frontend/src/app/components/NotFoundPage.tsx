import { motion } from 'motion/react';
import { Compass, Home, Search } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gradient-to-b from-orange-50 to-white px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center max-w-lg"
      >
        <motion.div
          initial={{ rotate: -10, scale: 0.9 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ type: 'spring', damping: 12, delay: 0.1 }}
          className="w-24 h-24 mx-auto rounded-full bg-[#7d1f2e] flex items-center justify-center mb-6"
        >
          <Compass className="w-12 h-12 text-white" />
        </motion.div>

        <h1
          className="text-6xl mb-2 text-[#7d1f2e]"
          style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800 }}
        >
          404
        </h1>
        <h2 className="text-2xl mb-3 text-gray-900" style={{ fontWeight: 600 }}>
          Looks like you wandered off the trail
        </h2>
        <p className="text-gray-600 mb-8 leading-relaxed">
          The page you're looking for doesn't exist or has moved. Let's get you back on the road to discovering Bengal.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#7d1f2e] text-white hover:bg-[#5a1621] transition-colors"
          >
            <Home className="w-4 h-4" />
            Go home
          </a>
          <a
            href="/explore"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 transition-colors"
          >
            <Search className="w-4 h-4" />
            Explore destinations
          </a>
        </div>
      </motion.div>
    </div>
  );
}
