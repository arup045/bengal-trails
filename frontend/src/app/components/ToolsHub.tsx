import { motion } from 'motion/react';
import { 
  Sparkles, Cloud, Camera, UtensilsCrossed, Navigation, Book, 
  ShoppingBag, Package, Users, Scroll, FileText, Heart, 
  Accessibility, ChefHat, TrendingDown, Award, Image, BrainCircuit,
  MessageSquare, UserPlus
} from 'lucide-react';

export function ToolsHub() {
  const allTools = [
    {
      id: 'advisor',
      name: 'Smart Travel Advisor',
      description: 'Take a quiz and get personalized destination recommendations',
      icon: Sparkles,
      href: '/advisor',
      gradient: 'from-purple-500 to-pink-500',
      available: true,
    },
    {
      id: 'weather',
      name: 'Weather Recommendations',
      description: 'Find best destinations based on current weather and seasons',
      icon: Cloud,
      href: '/weather',
      gradient: 'from-blue-500 to-cyan-500',
      available: true,
    },
    {
      id: 'instagram',
      name: 'Instagram-Worthy Spots',
      description: 'Most photogenic places with golden hour timing and camera tips',
      icon: Camera,
      href: '/instagram-spots',
      gradient: 'from-pink-500 to-purple-500',
      available: true,
    },
    {
      id: 'foodmap',
      name: 'Food Map & Street Food',
      description: 'Interactive map of best restaurants and street food spots',
      icon: UtensilsCrossed,
      href: '/food-map',
      gradient: 'from-orange-500 to-red-500',
      available: true,
    },
    {
      id: 'foodguide',
      name: 'Bengal Food Guide',
      description: 'Comprehensive restaurant guide with 50+ famous eateries across WB',
      icon: ChefHat,
      href: '/food',
      gradient: 'from-red-500 to-orange-500',
      available: true,
    },
    {
      id: 'transport',
      name: 'Transportation Planner',
      description: 'Compare routes, costs, and journey times between destinations',
      icon: Navigation,
      href: '/transport',
      gradient: 'from-green-500 to-emerald-500',
      available: false,
    },
    {
      id: 'culture',
      name: 'Bengali Culture Hub',
      description: 'Learn alphabet, music, crafts, and traditional arts',
      icon: Book,
      href: '/culture',
      gradient: 'from-indigo-500 to-purple-500',
      available: false,
    },
    {
      id: 'market',
      name: 'Virtual Market Tour',
      description: 'Explore famous markets with shopping guides and tips',
      icon: ShoppingBag,
      href: '/market',
      gradient: 'from-yellow-500 to-orange-500',
      available: false,
    },
    {
      id: 'packing',
      name: 'Packing Checklist',
      description: 'Smart packing list generator based on your trip details',
      icon: Package,
      href: '/packing',
      gradient: 'from-teal-500 to-cyan-500',
      available: false,
    },
    {
      id: 'group',
      name: 'Group Travel Coordinator',
      description: 'Split bills, vote on destinations, and plan together',
      icon: Users,
      href: '/group',
      gradient: 'from-rose-500 to-pink-500',
      available: false,
    },
    {
      id: 'heritage',
      name: 'Heritage Story Explorer',
      description: 'Audio stories and historical timelines for monuments',
      icon: Scroll,
      href: '/heritage',
      gradient: 'from-amber-500 to-orange-500',
      available: false,
    },
    {
      id: 'visa',
      name: 'Visa & Documents Helper',
      description: 'Checklists and requirements for tourists',
      icon: FileText,
      href: '/visa',
      gradient: 'from-blue-500 to-indigo-500',
      available: false,
    },
    {
      id: 'health',
      name: 'Health & Safety Dashboard',
      description: 'Hospital locations, precautions, and emergency contacts',
      icon: Heart,
      href: '/health',
      gradient: 'from-red-500 to-pink-500',
      available: false,
    },
    {
      id: 'accessibility',
      name: 'Accessibility Guide',
      description: 'Wheelchair-friendly destinations and facilities',
      icon: Accessibility,
      href: '/accessibility',
      gradient: 'from-green-500 to-teal-500',
      available: false,
    },
    {
      id: 'crowd',
      name: 'Crowd Indicator',
      description: 'Real-time crowd estimates and best visit times',
      icon: TrendingDown,
      href: '/crowd',
      gradient: 'from-purple-500 to-blue-500',
      available: false,
    },
    {
      id: 'passport',
      name: 'Bengal Explorer Passport',
      description: 'Collect badges and track your exploration progress',
      icon: Award,
      href: '/passport',
      gradient: 'from-yellow-500 to-orange-500',
      available: false,
    },
    {
      id: 'scavenger',
      name: 'Photo Scavenger Hunt',
      description: 'Complete challenges and win points',
      icon: Image,
      href: '/scavenger',
      gradient: 'from-pink-500 to-purple-500',
      available: false,
    },
    {
      id: 'trivia',
      name: 'Travel Trivia & Quizzes',
      description: 'Test your knowledge about West Bengal',
      icon: BrainCircuit,
      href: '/trivia',
      gradient: 'from-blue-500 to-cyan-500',
      available: false,
    },
    {
      id: 'buddy',
      name: 'Travel Buddy Finder',
      description: 'Connect with other travelers going to same destinations',
      icon: UserPlus,
      href: '/buddy',
      gradient: 'from-green-500 to-emerald-500',
      available: false,
    },
    {
      id: 'forum',
      name: 'Local Expert Q&A',
      description: 'Ask questions and get answers from locals',
      icon: MessageSquare,
      href: '/forum',
      gradient: 'from-indigo-500 to-purple-500',
      available: false,
    },
  ];

  const availableTools = allTools.filter(t => t.available);
  const comingSoon = allTools.filter(t => !t.available);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50 pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-gray-900 mb-4">All Planning Tools</h1>
          <p className="text-xl text-gray-600">
            Everything you need to plan the perfect West Bengal adventure
          </p>
          <div className="mt-6 flex items-center justify-center gap-4 text-sm">
            <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full font-semibold">
              ✓ {availableTools.length} Tools Available
            </span>
            <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full font-semibold">
              🚧 {comingSoon.length} Coming Soon
            </span>
          </div>
        </motion.div>

        {/* Available Tools */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Available Now</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableTools.map((tool, index) => (
              <motion.a
                key={tool.id}
                href={tool.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-purple-200"
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 bg-gradient-to-br ${tool.gradient} group-hover:scale-110 transition-transform duration-300`}>
                  <tool.icon className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">
                  {tool.name}
                </h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  {tool.description}
                </p>

                <div className="flex items-center text-purple-600 font-semibold group-hover:gap-3 gap-2 transition-all">
                  <span>Launch Tool</span>
                  <svg
                    className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>

                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${tool.gradient} opacity-0 group-hover:opacity-100 transition-opacity rounded-b-3xl`} />
              </motion.a>
            ))}
          </div>
        </div>

        {/* Coming Soon */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Coming Soon</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {comingSoon.map((tool, index) => (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl p-6 shadow-md border-2 border-dashed border-gray-200 relative overflow-hidden"
              >
                <div className="absolute top-2 right-2 px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-xs font-semibold">
                  Soon
                </div>
                
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br ${tool.gradient} opacity-60`}>
                  <tool.icon className="w-6 h-6 text-white" />
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {tool.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {tool.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 bg-gradient-to-r from-purple-600 to-orange-600 rounded-3xl p-8 text-white text-center"
        >
          <h3 className="text-2xl font-bold mb-4">✨ All Tools Are 100% Free</h3>
          <p className="text-lg opacity-90 mb-6">
            No registration required. No hidden costs. Just pure travel planning joy!
          </p>
          <a
            href="/explore"
            className="inline-block px-8 py-4 bg-white text-purple-600 rounded-full font-semibold hover:shadow-lg transition-all"
          >
            Start Exploring Destinations
          </a>
        </motion.div>
      </div>
    </div>
  );
}