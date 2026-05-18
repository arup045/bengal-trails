import { useState } from 'react';
import { Sparkles, MapPin, Calendar, Wallet, Loader2, Download, Share2, ChevronDown, ChevronUp, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { authFetch } from '../utils/api';
import { toast } from 'sonner';

const INTERESTS = ['Heritage','Wildlife','Beaches','Trekking','Food','Festivals','Photography','Handicrafts','Tea Gardens','Temples'];
const STYLES    = [{ v:'budget', l:'Budget', d:'₹1–3k/day' },{ v:'moderate', l:'Moderate', d:'₹3–7k/day' },{ v:'luxury', l:'Luxury', d:'₹7k+/day' }];

interface DayPlan { day: number; title: string; destinations: {name:string;slug:string;duration:string;tip:string}[]; accommodation:string; estimatedCost:string; highlights:string; }
interface Itinerary { title:string; summary:string; days:DayPlan[]; totalEstimatedCost:string; bestMonths:string[]; packingTips:string[]; }

export function ItineraryBuilder() {
  const [days,       setDays]       = useState(5);
  const [budget,     setBudget]     = useState('moderate');
  const [interests,  setInterests]  = useState<string[]>([]);
  const [startCity,  setStartCity]  = useState('Kolkata');
  const [loading,    setLoading]    = useState(false);
  const [itinerary,  setItinerary]  = useState<Itinerary | null>(null);
  const [expanded,   setExpanded]   = useState<number | null>(0);

  const toggleInterest = (i: string) =>
    setInterests(p => p.includes(i) ? p.filter(x => x !== i) : [...p, i]);

  const generate = async () => {
    setLoading(true); setItinerary(null);
    try {
      const res = await authFetch('/ai/itinerary', {
        method: 'POST',
        body: JSON.stringify({ days, budget, interests, startCity }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Failed to generate'); return; }
      setItinerary(data.itinerary);
      setExpanded(0);
    } catch { toast.error('Network error. Please try again.'); }
    finally { setLoading(false); }
  };

  const share = async () => {
    const text = `Check out my ${days}-day West Bengal itinerary on Bengal Trails!\n${window.location.href}`;
    if (navigator.share) { try { await navigator.share({ title: itinerary?.title, text }); } catch {} }
    else { navigator.clipboard.writeText(text); toast.success('Link copied!'); }
  };

  return (
    <div className="max-w-4xl mx-auto px-5 sm:px-8 py-10">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-purple-50 px-4 py-1.5 rounded-full mb-4">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span className="font-poppins text-sm font-medium text-purple-700">AI-powered by Gemini</span>
        </div>
        <h1 className="font-poppins text-3xl sm:text-4xl font-semibold text-slate-900 mb-3">
          Build your perfect Bengal itinerary
        </h1>
        <p className="font-poppins text-base text-gray-500 max-w-xl mx-auto">
          Tell us your preferences and our AI will create a personalised day-by-day plan using real destinations.
        </p>
      </div>

      {/* Builder form */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 mb-8 shadow-sm">
        <div className="grid sm:grid-cols-3 gap-6 mb-6">
          {/* Duration */}
          <div>
            <label className="block font-poppins text-sm font-medium text-slate-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1.5 text-purple-500" />Duration
            </label>
            <div className="flex items-center gap-3">
              <button onClick={() => setDays(d => Math.max(2, d - 1))}
                className="w-9 h-9 rounded-full border border-gray-200 hover:border-purple-400 flex items-center justify-center text-gray-600 transition-colors">−</button>
              <span className="font-poppins text-xl font-semibold text-slate-900 w-16 text-center">{days} days</span>
              <button onClick={() => setDays(d => Math.min(14, d + 1))}
                className="w-9 h-9 rounded-full border border-gray-200 hover:border-purple-400 flex items-center justify-center text-gray-600 transition-colors">+</button>
            </div>
          </div>
          {/* Budget */}
          <div>
            <label className="block font-poppins text-sm font-medium text-slate-700 mb-2">
              <Wallet className="w-4 h-4 inline mr-1.5 text-purple-500" />Budget
            </label>
            <div className="flex flex-col gap-2">
              {STYLES.map(s => (
                <button key={s.v} onClick={() => setBudget(s.v)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl border text-left transition-all
                    ${budget === s.v ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <span className="font-poppins text-sm font-medium text-slate-900">{s.l}</span>
                  <span className="font-poppins text-xs text-gray-400">{s.d}</span>
                </button>
              ))}
            </div>
          </div>
          {/* Start city */}
          <div>
            <label className="block font-poppins text-sm font-medium text-slate-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1.5 text-purple-500" />Starting from
            </label>
            <select value={startCity} onChange={e => setStartCity(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl font-poppins text-sm focus:outline-none focus:border-purple-400 transition-colors">
              {['Kolkata','Siliguri','Durgapur','Asansol','Haldia'].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Interests */}
        <div className="mb-6">
          <label className="block font-poppins text-sm font-medium text-slate-700 mb-3">Interests <span className="text-gray-400 font-normal">(pick any)</span></label>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map(i => (
              <button key={i} onClick={() => toggleInterest(i)}
                className={`px-3.5 py-1.5 rounded-full font-poppins text-sm transition-all
                  ${interests.includes(i) ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                {i}
              </button>
            ))}
          </div>
        </div>

        <button onClick={generate} disabled={loading}
          className="w-full py-4 bg-purple-600 hover:bg-purple-700 rounded-xl font-poppins text-base font-medium text-white transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
          {loading ? <><Loader2 className="w-5 h-5 animate-spin" />Generating your itinerary…</> : <><Sparkles className="w-5 h-5" />Generate Itinerary</>}
        </button>
      </div>

      {/* Result */}
      <AnimatePresence>
        {itinerary && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            {/* Summary */}
            <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-6 sm:p-8 mb-4 text-white">
              <h2 className="font-poppins text-xl sm:text-2xl font-semibold mb-2">{itinerary.title}</h2>
              <p className="font-poppins text-white/80 text-sm leading-relaxed mb-4">{itinerary.summary}</p>
              <div className="flex flex-wrap gap-4 text-sm">
                <span className="flex items-center gap-1.5 bg-white/15 px-3 py-1.5 rounded-full">
                  <Calendar className="w-3.5 h-3.5" />{days} days
                </span>
                <span className="flex items-center gap-1.5 bg-white/15 px-3 py-1.5 rounded-full">
                  <Wallet className="w-3.5 h-3.5" />{itinerary.totalEstimatedCost}
                </span>
                <span className="flex items-center gap-1.5 bg-white/15 px-3 py-1.5 rounded-full">
                  <Star className="w-3.5 h-3.5" />Best: {itinerary.bestMonths?.join(', ')}
                </span>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={share}
                  className="flex items-center gap-2 px-4 py-2 bg-white/15 hover:bg-white/25 rounded-xl text-sm font-poppins font-medium transition-colors">
                  <Share2 className="w-4 h-4" />Share
                </button>
                <button onClick={() => window.print()}
                  className="flex items-center gap-2 px-4 py-2 bg-white/15 hover:bg-white/25 rounded-xl text-sm font-poppins font-medium transition-colors">
                  <Download className="w-4 h-4" />Save PDF
                </button>
              </div>
            </div>

            {/* Day cards */}
            <div className="space-y-3">
              {itinerary.days?.map((day, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                  <button onClick={() => setExpanded(expanded === i ? null : i)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center font-poppins text-sm font-semibold text-purple-700">
                        {day.day}
                      </div>
                      <div>
                        <p className="font-poppins text-sm font-semibold text-slate-900">{day.title}</p>
                        <p className="font-poppins text-xs text-gray-400">{day.estimatedCost}</p>
                      </div>
                    </div>
                    {expanded === i ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </button>
                  {expanded === i && (
                    <div className="px-5 pb-5 border-t border-gray-100">
                      <p className="font-poppins text-sm text-gray-500 mt-3 mb-4">{day.highlights}</p>
                      <div className="space-y-3 mb-4">
                        {day.destinations?.map((d, j) => (
                          <a key={j} href={`#/explore/${d.slug}`}
                            className="flex items-start gap-3 p-3 rounded-xl hover:bg-purple-50 transition-colors group">
                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0 mt-0.5">
                              <MapPin className="w-4 h-4 text-purple-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-poppins text-sm font-semibold text-slate-900 group-hover:text-purple-700">{d.name}</p>
                              <p className="font-poppins text-xs text-gray-400">{d.duration} · {d.tip}</p>
                            </div>
                          </a>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="font-poppins">Stay: {day.accommodation}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Packing tips */}
            {itinerary.packingTips?.length > 0 && (
              <div className="mt-4 p-5 bg-amber-50 border border-amber-100 rounded-2xl">
                <p className="font-poppins text-sm font-semibold text-amber-800 mb-2">Packing tips</p>
                <ul className="space-y-1">
                  {itinerary.packingTips.map((t, i) => (
                    <li key={i} className="font-poppins text-sm text-amber-700 flex items-start gap-2">
                      <span className="mt-1">•</span>{t}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
