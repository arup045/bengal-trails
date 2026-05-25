import { motion } from 'motion/react';
import {
  Sparkles, Cloud, Camera, UtensilsCrossed, ChefHat, BrainCircuit,
  Route, Wallet, GitCompare, Map as MapIcon, Calendar, Book,
} from 'lucide-react';

// Only REAL, working tools — every href is a live route. (We removed the long
// "coming soon" list so the page reflects what actually works.)
const TOOLS = [
  { id: 'advisor',    name: 'Smart Travel Advisor', description: 'Take a quiz and get personalized destination recommendations.', icon: Sparkles,        href: '/advisor',           gradient: 'from-purple-500 to-pink-500' },
  { id: 'itinerary',  name: 'AI Itinerary Builder', description: 'Generate a day-by-day Bengal route tailored to your interests.', icon: BrainCircuit,     href: '/itinerary-builder', gradient: 'from-indigo-500 to-purple-500' },
  { id: 'planner',    name: 'Trip Planner',         description: 'Map your route, lock in dates, and organise your whole trip.',  icon: Route,            href: '/planner',           gradient: 'from-violet-500 to-fuchsia-500' },
  { id: 'budget',     name: 'Budget Estimator',     description: 'Estimate trip costs by days, style and party size.',            icon: Wallet,           href: '/budget',            gradient: 'from-green-500 to-emerald-500' },
  { id: 'compare',    name: 'Compare Destinations', description: 'Put destinations side by side — rating, season, price, more.',   icon: GitCompare,       href: '/compare',           gradient: 'from-cyan-500 to-blue-500' },
  { id: 'weather',    name: 'Weather & Best Time',  description: 'Live weather and the best season to visit each destination.',    icon: Cloud,            href: '/weather',           gradient: 'from-blue-500 to-cyan-500' },
  { id: 'map',        name: 'Interactive Map',      description: 'Explore all 23 districts on an interactive map of West Bengal.', icon: MapIcon,          href: '/map',               gradient: 'from-teal-500 to-green-500' },
  { id: 'festivals',  name: 'Festival Calendar',    description: 'What\'s on and when — 100 Bengal festivals through the year.',   icon: Calendar,         href: '/festivals',         gradient: 'from-rose-500 to-orange-500' },
  { id: 'foodmap',    name: 'Food Map & Street Food', description: 'Interactive map of the best restaurants and street-food spots.', icon: UtensilsCrossed, href: '/food-map',          gradient: 'from-orange-500 to-red-500' },
  { id: 'foodguide',  name: 'Bengal Food Guide',    description: 'Every iconic dish and where to try it, district by district.',   icon: ChefHat,          href: '/food',              gradient: 'from-red-500 to-orange-500' },
  { id: 'instagram',  name: 'Instagram-Worthy Spots', description: 'The most photogenic places with golden-hour timing + tips.',   icon: Camera,           href: '/instagram-spots',   gradient: 'from-pink-500 to-purple-500' },
  { id: 'phrasebook', name: 'Bengali Phrasebook',   description: 'Essential Bengali phrases with pronunciation for travellers.',   icon: Book,             href: '/phrasebook',        gradient: 'from-amber-500 to-orange-500' },
];

export function ToolsHub() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50 pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">All Planning Tools</h1>
          <p className="text-xl text-gray-600">Everything you need to plan the perfect West Bengal adventure</p>
          <div className="mt-6 flex items-center justify-center gap-4 text-sm">
            <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full font-semibold">
              ✓ {TOOLS.length} free tools — no sign-up needed
            </span>
          </div>
        </motion.div>

        {/* Tools grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TOOLS.map((tool, index) => (
            <motion.a
              key={tool.id}
              href={tool.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.05, 0.4) }}
              className="group relative overflow-hidden bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-purple-200"
            >
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 bg-gradient-to-br ${tool.gradient} group-hover:scale-110 transition-transform duration-300`}>
                <tool.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">{tool.name}</h3>
              <p className="text-gray-600 leading-relaxed mb-4">{tool.description}</p>
              <div className="flex items-center text-purple-600 font-semibold group-hover:gap-3 gap-2 transition-all">
                <span>Launch Tool</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${tool.gradient} opacity-0 group-hover:opacity-100 transition-opacity rounded-b-3xl`} />
            </motion.a>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 bg-gradient-to-r from-purple-600 to-orange-600 rounded-3xl p-8 text-white text-center"
        >
          <h3 className="text-2xl font-bold mb-4">✨ All Tools Are 100% Free</h3>
          <p className="text-lg opacity-90 mb-6">No registration required. No hidden costs. Just pure travel planning joy!</p>
          <a href="/explore" className="inline-block px-8 py-4 bg-white text-purple-600 rounded-full font-semibold hover:shadow-lg transition-all">
            Start Exploring Destinations
          </a>
        </motion.div>
      </div>
    </div>
  );
}
