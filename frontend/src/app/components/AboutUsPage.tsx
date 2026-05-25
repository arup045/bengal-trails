import { MapPin, Heart, Users, Star, Shield, Compass, Camera, Globe, Award, Mail, Phone, ArrowRight } from 'lucide-react';

const STATS = [
  { value: '197+', label: 'Destinations',     icon: MapPin },
  { value: '23',   label: 'Districts',        icon: Globe },
  { value: '100%', label: 'Authentic Content',icon: Shield },
  { value: 'New',  label: 'Just Launched',    icon: Award },
];

const VALUES = [
  {
    icon: Heart,
    title: 'Authentic Experiences',
    desc: 'We go beyond the tourist trail. Every destination on Bengal Trails is handpicked, verified, and described by people who actually live there — not AI-generated filler.',
    color: 'bg-rose-100 text-rose-600',
  },
  {
    icon: Shield,
    title: 'Trust & Safety First',
    desc: 'Every vendor, tour guide, and accommodation partner goes through our manual verification process. Your safety is non-negotiable.',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    icon: Compass,
    title: 'Built for Explorers',
    desc: 'Whether you\'re a solo backpacker heading to the Sundarbans or a family planning Durga Puja in Kolkata — our tools are built around how real travelers think.',
    color: 'bg-purple-100 text-purple-600',
  },
  {
    icon: Camera,
    title: 'Community-Powered',
    desc: 'Real photos from real travelers. Real reviews from people who\'ve been there. No stock photos. No fake five-star ratings.',
    color: 'bg-amber-100 text-amber-600',
  },
];

const TEAM = [
  {
    name: 'Arup',
    role: 'Founder & CEO',
    bio: 'A West Bengal native passionate about sustainable tourism. Built Bengal Trails to give the world a real window into the incredible diversity of this region.',
    avatar: 'A',
    color: 'bg-purple-600',
  },
  {
    name: 'Travel Editorial Team',
    role: 'Content & Curation',
    bio: 'A collective of travel writers, photographers, and local guides spread across every district of West Bengal — from the Himalayan foothills to the Bay of Bengal.',
    avatar: 'T',
    color: 'bg-rose-500',
  },
  {
    name: 'Tech Team',
    role: 'Engineering',
    bio: 'A passionate group of engineers building the platform that powers every search, every recommendation, and every booking you make on Bengal Trails.',
    avatar: 'E',
    color: 'bg-blue-600',
  },
];

const TIMELINE = [
  { year: '2023', event: 'Idea born — frustrated by the lack of quality travel information for West Bengal' },
  { year: '2024', event: 'Platform launched with our first batch of curated destinations' },
  { year: '2025', event: 'Expanded to 197+ destinations across all 23 districts. Launched AI Trip Planner.' },
  { year: '2026', event: 'Vendor marketplace launched. Still growing, every day.' },
];

export function AboutUsPage() {
  return (
    <div className="min-h-screen bg-white pt-16">

      {/* ── Hero Banner ─────────────────────────────────────────────── */}
      <section className="relative text-white overflow-hidden">
        {/* Banner image — clear and vivid */}
        <div className="absolute inset-0">
          <img
            src="https://i1-c.pinimg.com/1200x/b5/3e/2b/b53e2b7b4ba5e4efaaf5208513d6b866.jpg"
            alt="West Bengal landscape"
            className="w-full h-full object-cover"
            loading="eager"
          />
          {/* Minimal dark gradient just for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/70" />
        </div>
        <div className="relative max-w-5xl mx-auto px-6 py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <Heart className="w-4 h-4 text-rose-400" />
            Made with love for West Bengal
          </div>
          <h1 className="font-poppins text-5xl sm:text-6xl font-bold mb-6 leading-tight">
            We believe Bengal deserves<br />
            <span className="text-amber-400">a world-class travel platform.</span>
          </h1>
          <p className="text-purple-200 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
            Bengal Trails is the most comprehensive travel guide to West Bengal —
            built by locals, for curious travelers from around the world.
          </p>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────────── */}
      <section className="py-16 bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            {STATS.map(({ value, label, icon: Icon }) => (
              <div key={label} className="text-center">
                <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-6 h-6 text-purple-600" />
                </div>
                <div className="font-poppins text-3xl font-bold text-slate-900 mb-1">{value}</div>
                <div className="font-poppins text-sm text-gray-500">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Our Story ────────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="font-poppins text-sm font-semibold text-purple-600 uppercase tracking-widest">Our Story</span>
              <h2 className="font-poppins text-4xl font-bold text-slate-900 mt-3 mb-6 leading-tight">
                West Bengal has 197+ incredible destinations.<br />
                <span className="text-purple-600">Most people only know 3.</span>
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  We started Bengal Trails because we were tired of seeing the same three places —
                  Darjeeling, Sundarbans, Digha — recommended whenever someone asked "Where should I go in West Bengal?"
                </p>
                <p>
                  West Bengal is one of India's most culturally rich and geographically diverse states.
                  Snow-capped Himalayan peaks in the north. Mangrove delta in the south. Ancient temples, colonial heritage,
                  tribal art, and the most vibrant festival culture in the country — all within a single state.
                </p>
                <p>
                  Our mission is simple: <strong className="text-slate-900">to put West Bengal on the global travel map,
                  one authentic story at a time.</strong>
                </p>
              </div>
            </div>
            {/* Visual timeline */}
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-purple-100" />
              <div className="space-y-8">
                {TIMELINE.map(({ year, event }) => (
                  <div key={year} className="flex gap-6 relative">
                    <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold shrink-0 z-10">
                      {year.slice(2)}
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-4 flex-1">
                      <div className="font-poppins text-xs font-semibold text-purple-600 mb-1">{year}</div>
                      <p className="font-poppins text-sm text-gray-700">{event}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Our Values ────────────────────────────────────────────────── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="font-poppins text-sm font-semibold text-purple-600 uppercase tracking-widest">What Drives Us</span>
            <h2 className="font-poppins text-4xl font-bold text-slate-900 mt-3">Our Values</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {VALUES.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center mb-5`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-poppins text-xl font-semibold text-slate-900 mb-3">{title}</h3>
                <p className="font-poppins text-sm text-gray-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team ─────────────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="font-poppins text-sm font-semibold text-purple-600 uppercase tracking-widest">The People</span>
            <h2 className="font-poppins text-4xl font-bold text-slate-900 mt-3">Behind Bengal Trails</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {TEAM.map(({ name, role, bio, avatar, color }) => (
              <div key={name} className="text-center group">
                <div className={`w-20 h-20 rounded-full ${color} text-white flex items-center justify-center text-2xl font-bold mx-auto mb-5 group-hover:scale-105 transition-transform`}>
                  {avatar}
                </div>
                <h3 className="font-poppins text-lg font-semibold text-slate-900 mb-1">{name}</h3>
                <div className="font-poppins text-xs font-medium text-purple-600 uppercase tracking-widest mb-3">{role}</div>
                <p className="font-poppins text-sm text-gray-500 leading-relaxed">{bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What We Cover ────────────────────────────────────────────── */}
      <section className="py-20 bg-purple-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="font-poppins text-sm font-semibold text-purple-600 uppercase tracking-widest">Coverage</span>
              <h2 className="font-poppins text-4xl font-bold text-slate-900 mt-3 mb-6">
                From the Himalayas<br />to the Bay of Bengal
              </h2>
              <p className="text-gray-600 leading-relaxed mb-8">
                Our editorial team covers all 23 districts of West Bengal — from the tea gardens of Darjeeling
                to the mangrove forests of Sundarbans, from the ruins of Bishnupur to the beaches of Mandarmani.
                No corner of Bengal is too remote for us to explore.
              </p>
              <a href="/explore"
                className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-full font-poppins text-sm font-medium hover:bg-purple-700 transition-colors">
                Explore All Destinations
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { region: 'Darjeeling Hills', count: '28 destinations' },
                { region: 'Sundarbans Delta', count: '14 destinations' },
                { region: 'Kolkata City', count: '35 destinations' },
                { region: 'Bishnupur & Heritage', count: '22 destinations' },
                { region: 'Coastal Bengal', count: '18 destinations' },
                { region: 'North Bengal Plains', count: '31 destinations' },
              ].map(({ region, count }) => (
                <div key={region} className="bg-white rounded-2xl p-5 shadow-sm border border-purple-100">
                  <div className="w-8 h-8 bg-purple-100 rounded-xl flex items-center justify-center mb-3">
                    <MapPin className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="font-poppins text-sm font-semibold text-slate-900">{region}</div>
                  <div className="font-poppins text-xs text-purple-600 mt-0.5">{count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Awards / Press ─────────────────────────────────────────── */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-4 py-1.5 text-sm font-medium text-amber-700 mb-8">
            <Award className="w-4 h-4" />
            Recognition
          </div>
          <h2 className="font-poppins text-3xl font-bold text-slate-900 mb-4">
            Built for travelers exploring West Bengal
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto font-poppins text-sm">
            A complete, free guide to West Bengal — every district, hundreds of destinations,
            authentic local content, and tools to plan your whole trip in one place.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-12 items-center">
            {['197+ Destinations', '23 Districts', 'AI Trip Planner', '100% Free'].map((item) => (
              <div key={item} className="font-poppins text-sm font-semibold text-gray-400 text-center">{item}</div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact CTA ──────────────────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-br from-slate-900 to-purple-950 text-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-poppins text-4xl font-bold mb-4">Get in Touch</h2>
          <p className="text-purple-300 font-poppins mb-10 leading-relaxed">
            Have a destination to suggest? A partnership proposal? Press enquiry?
            We read every message personally.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="mailto:hello@bengaltrails.com"
              className="inline-flex items-center justify-center gap-2 bg-white text-slate-900 px-7 py-3.5 rounded-full font-poppins text-sm font-semibold hover:bg-gray-100 transition-colors">
              <Mail className="w-4 h-4" />
              hello@bengaltrails.com
            </a>
            <a href="/explore"
              className="inline-flex items-center justify-center gap-2 border border-white/30 text-white px-7 py-3.5 rounded-full font-poppins text-sm font-semibold hover:bg-white/10 transition-colors">
              <Compass className="w-4 h-4" />
              Start Exploring
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
