import { motion } from 'motion/react';
import { Calendar, DollarSign, ArrowRightLeft, CalendarClock, Star, MessageSquare } from 'lucide-react';

export function ToolsSection() {
  const tools = [
    {
      icon: Calendar,
      title: 'Itinerary Builder',
      description: 'Create your perfect day-by-day trip plan with drag-and-drop ease',
      href: '#/itinerary',
      gradient: 'from-purple-500 to-pink-500',
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      icon: ArrowRightLeft,
      title: 'Compare Destinations',
      description: 'Side-by-side comparison of up to 3 destinations to help you decide',
      href: '#/compare',
      gradient: 'from-blue-500 to-cyan-500',
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: DollarSign,
      title: 'Budget Estimator',
      description: 'Calculate trip costs with detailed breakdown for smart planning',
      href: '#/budget',
      gradient: 'from-green-500 to-emerald-500',
      iconColor: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      icon: CalendarClock,
      title: 'Festival Calendar',
      description: 'Discover festivals and events happening throughout the year',
      href: '#/festivals',
      gradient: 'from-orange-500 to-red-500',
      iconColor: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      icon: Star,
      title: 'Travel Advisor',
      description: 'Take a quiz and get personalized destination recommendations',
      href: '#/advisor',
      gradient: 'from-purple-500 to-indigo-500',
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      icon: MessageSquare,
      title: 'Food Explorer',
      description: 'Discover the best street food and restaurants across West Bengal',
      href: '#/food-map',
      gradient: 'from-orange-500 to-red-500',
      iconColor: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-purple-50 via-white to-orange-50">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 bg-purple-100 text-purple-600 rounded-full text-sm font-semibold mb-4">
            PLAN SMARTER
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Powerful Planning Tools
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to plan the perfect West Bengal adventure, all in one place
          </p>
        </motion.div>

        {/* Tools Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool, index) => (
            <motion.a
              key={index}
              href={tool.href}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-purple-200"
            >
              {/* Icon */}
              <div className={`w-16 h-16 ${tool.bgColor} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <tool.icon className={`w-8 h-8 ${tool.iconColor}`} />
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">
                {tool.title}
              </h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                {tool.description}
              </p>

              {/* CTA */}
              <div className="flex items-center text-purple-600 font-semibold group-hover:gap-3 gap-2 transition-all">
                <span>Explore Tool</span>
                <svg
                  className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>

              {/* Gradient Accent */}
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${tool.gradient} opacity-0 group-hover:opacity-100 transition-opacity rounded-b-3xl`} />
            </motion.a>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center"
        >
          <p className="text-gray-600 mb-4">
            9+ powerful tools available • All 100% free with no registration required
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="#/tools"
              className="inline-block bg-white border-2 border-purple-600 text-purple-600 px-8 py-4 rounded-full font-semibold hover:bg-purple-50 transition-all"
            >
              View All Tools
            </a>
            <a
              href="#/explore"
              className="inline-block bg-gradient-to-r from-purple-600 to-orange-600 text-white px-8 py-4 rounded-full font-semibold hover:shadow-lg transition-all"
            >
              Start Exploring
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}