import { useState, useEffect, useMemo, useRef, lazy, Suspense } from 'react';
import {
  Save, Loader2, Plus, X, Calendar, MapPin, IndianRupee, Download, Share2,
  Trash2, Map as MapIcon, ArrowUp, ArrowDown, Sparkles, Compass, Route, Search,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { API_BASE } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { placesData } from '../data/places-full';
import { ImageWithFallback } from './figma/ImageWithFallback';
import type { RouteStop } from './TripRouteMap';
import { EmptyState } from './EmptyState';

const TripRouteMap = lazy(() => import('./TripRouteMap'));

interface TripPlace {
  slug: string;
  title: string;
  image: string;
  priceFrom: string;
  region: string;
  district?: string;
  lat?: number;
  lng?: number;
}
interface TripDay { id: string; day: number; places: TripPlace[] }

// Haversine — for "Add nearby" suggestions (no external API needed).
function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s1 = Math.sin(dLat / 2) ** 2;
  const s2 = Math.sin(dLng / 2) ** 2 * Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180);
  return 2 * R * Math.asin(Math.sqrt(s1 + s2));
}

const DEFAULT_COVER = 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1600&q=70&auto=format&fit=crop';
const POPULAR_SEEDS = ['darjeeling', 'sundarbans-national-park', 'victoria-memorial-kolkata', 'shantiniketan', 'kalimpong', 'mandarmani', 'bishnupur', 'sandakphu'];

// Compact place card used inside a day. Now with reorder controls.
function PlaceRow({
  place, idx, isFirst, isLast, onMove, onRemove,
}: {
  place: TripPlace; idx: number; isFirst: boolean; isLast: boolean;
  onMove: (delta: -1 | 1) => void; onRemove: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.22 }}
      className="group relative flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-2xl hover:shadow-md hover:border-purple-200 transition-all"
    >
      <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-poppins text-xs sm:text-sm font-bold shrink-0">
        {idx + 1}
      </span>
      <a href={`/explore/${place.slug}`} className="shrink-0">
        <ImageWithFallback src={place.image} alt={place.title} optimizeWidth={240}
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover hover:scale-105 transition-transform" />
      </a>
      <div className="flex-1 min-w-0">
        <a href={`/explore/${place.slug}`} className="block">
          <h4 className="font-poppins text-sm sm:text-base font-semibold text-slate-900 truncate hover:text-purple-700 transition">{place.title}</h4>
        </a>
        <p className="font-poppins text-[11px] sm:text-xs text-gray-500 flex items-center gap-1 mt-0.5">
          <MapPin className="w-3 h-3" /> {place.region}
        </p>
        {place.priceFrom && place.priceFrom !== 'Free' && (
          <span className="inline-flex items-center gap-0.5 mt-1.5 text-[11px] sm:text-xs font-poppins font-semibold text-purple-700 bg-purple-50 border border-purple-100 px-2 py-0.5 rounded-full">
            <IndianRupee className="w-3 h-3" /> from {place.priceFrom.replace('₹', '')}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1 shrink-0">
        <button onClick={() => onMove(-1)} disabled={isFirst}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-purple-700 hover:bg-purple-50 disabled:opacity-30 disabled:cursor-not-allowed transition" aria-label="Move up">
          <ArrowUp className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => onMove(1)} disabled={isLast}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-purple-700 hover:bg-purple-50 disabled:opacity-30 disabled:cursor-not-allowed transition" aria-label="Move down">
          <ArrowDown className="w-3.5 h-3.5" />
        </button>
      </div>
      <button onClick={onRemove}
        className="opacity-0 group-hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 w-8 h-8 rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 transition-all shrink-0"
        aria-label="Remove from trip">
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

export function TripPlanner() {
  const { user, accessToken } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [tripName, setTripName] = useState('My West Bengal Trip');
  const [tripDays, setTripDays] = useState<TripDay[]>([{ id: '1', day: 1, places: [] }]);
  const [showPlacePicker, setShowPlacePicker] = useState(false);
  const [selectedDayForAdd, setSelectedDayForAdd] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDayId, setActiveDayId] = useState<string>('1');
  // motion.section's ref is HTMLElement (not HTMLDivElement specifically)
  const dayRefs = useRef<Record<string, HTMLElement | null>>({});

  // ── State logic (unchanged from v1, with reorder added) ─────────────────────
  const addDay = () => {
    const newDay: TripDay = { id: Date.now().toString(), day: tripDays.length + 1, places: [] };
    setTripDays((prev) => [...prev, newDay]);
    setTimeout(() => dayRefs.current[newDay.id]?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
  };

  const removeDay = (dayId: string) => {
    if (tripDays.length === 1) return;
    setTripDays((prev) => prev.filter((d) => d.id !== dayId).map((d, idx) => ({ ...d, day: idx + 1 })));
  };

  const addPlaceToDay = (dayNumber: number, place: any) => {
    setTripDays((prev) => prev.map((day) => {
      if (day.day !== dayNumber) return day;
      // De-dupe — don't add the same place twice in the same day.
      if (day.places.find((p) => p.slug === place.slug)) return day;
      return {
        ...day,
        places: [...day.places, {
          slug: place.slug, title: place.title, image: place.heroImage.url,
          priceFrom: place.priceFrom || 'Free', region: place.region, district: place.district,
          lat: place.coordinates?.lat, lng: place.coordinates?.lng,
        }],
      };
    }));
    setShowPlacePicker(false);
  };

  const removePlaceFromDay = (dayNumber: number, placeSlug: string) => {
    setTripDays((prev) => prev.map((day) => day.day === dayNumber
      ? { ...day, places: day.places.filter((p) => p.slug !== placeSlug) }
      : day));
  };

  const movePlaceWithinDay = (dayNumber: number, slug: string, delta: -1 | 1) => {
    setTripDays((prev) => prev.map((day) => {
      if (day.day !== dayNumber) return day;
      const i = day.places.findIndex((p) => p.slug === slug);
      const j = i + delta;
      if (i < 0 || j < 0 || j >= day.places.length) return day;
      const next = [...day.places];
      [next[i], next[j]] = [next[j], next[i]];
      return { ...day, places: next };
    }));
  };

  // ── Derived stats ──────────────────────────────────────────────────────────
  const priceToNumber = (price?: string) => {
    if (!price || price.toLowerCase().includes('free')) return 0;
    const num = parseInt(price.replace(/[^0-9]/g, ''), 10);
    return isNaN(num) ? 0 : num;
  };
  const dayBudget = (day: TripDay) => day.places.reduce((s, p) => s + priceToNumber(p.priceFrom), 0);
  const calculateTotalBudget = () => tripDays.reduce((s, d) => s + dayBudget(d), 0);
  const getTotalPlaces = () => tripDays.reduce((s, d) => s + d.places.length, 0);
  const regionsCovered = useMemo(
    () => new Set(tripDays.flatMap((d) => d.places.map((p) => p.region))).size,
    [tripDays],
  );

  // Cover photo — first place's image, or a default.
  const coverImage = useMemo(() => {
    for (const d of tripDays) for (const p of d.places) if (p.image) return p.image;
    return DEFAULT_COVER;
  }, [tripDays]);

  // Smart "Add nearby" suggestions for a given day — places within 100 km of any
  // place already in that day, excluding anything already in the whole trip.
  const nearbyForDay = (day: TripDay): any[] => {
    if (day.places.length === 0) return [];
    const allUsed = new Set(tripDays.flatMap((d) => d.places.map((p) => p.slug)));
    const anchors = day.places.filter((p) => typeof p.lat === 'number' && typeof p.lng === 'number') as Required<TripPlace>[];
    if (anchors.length === 0) return [];
    const candidates = (placesData as any[])
      .filter((p) => p.coordinates && !allUsed.has(p.slug))
      .map((p) => ({ p, dist: Math.min(...anchors.map((a) => distanceKm({ lat: a.lat, lng: a.lng }, { lat: p.coordinates.lat, lng: p.coordinates.lng }))) }))
      .filter((x) => x.dist <= 100)
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 3);
    return candidates.map(({ p, dist }) => ({ ...p, _dist: dist }));
  };

  // Ordered stops with coordinates → drives the route map.
  const routeStops: RouteStop[] = useMemo(() => {
    const stops: RouteStop[] = [];
    let order = 0;
    tripDays.forEach((day) => day.places.forEach((p) => {
      if (typeof p.lat === 'number' && typeof p.lng === 'number') {
        order += 1;
        stops.push({ title: p.title, lat: p.lat, lng: p.lng, day: day.day, order });
      }
    }));
    return stops;
  }, [tripDays]);

  // ── Share / save / load (unchanged behaviour) ──────────────────────────────
  const buildShareUrl = () => {
    const payload = { n: tripName, d: tripDays.map((day) => day.places.map((p) => p.slug)) };
    const token = encodeURIComponent(btoa(unescape(encodeURIComponent(JSON.stringify(payload)))));
    return `${window.location.origin}/planner?t=${token}`;
  };
  const shareTrip = async () => {
    if (getTotalPlaces() === 0) { toast.error('Add at least one place before sharing'); return; }
    const url = buildShareUrl();
    try {
      if (navigator.share) { await navigator.share({ title: tripName, text: `Check out my West Bengal trip: ${tripName}`, url }); return; }
    } catch { /* user cancelled — fall through to copy */ }
    try { await navigator.clipboard.writeText(url); toast.success('Shareable link copied to clipboard!'); }
    catch { toast.error('Could not copy link'); }
  };

  useEffect(() => {
    let token = '';
    try { token = new URLSearchParams(window.location.search).get('t') || ''; } catch { token = ''; }
    if (!token) return;
    try {
      const decoded = JSON.parse(decodeURIComponent(escape(atob(decodeURIComponent(token)))));
      const slugDays: string[][] = Array.isArray(decoded?.d) ? decoded.d : [];
      if (slugDays.length === 0) return;
      const bySlug = new Map((placesData as any[]).map((p) => [p.slug, p]));
      const rebuilt: TripDay[] = slugDays.map((slugs, idx) => ({
        id: `${idx + 1}`, day: idx + 1,
        places: slugs.map((slug) => bySlug.get(slug)).filter(Boolean).map((place: any) => ({
          slug: place.slug, title: place.title, image: place.heroImage.url,
          priceFrom: place.priceFrom || 'Free', region: place.region, district: place.district,
          lat: place.coordinates?.lat, lng: place.coordinates?.lng,
        })),
      }));
      if (rebuilt.length > 0) {
        setTripDays(rebuilt);
        if (typeof decoded?.n === 'string' && decoded.n.trim()) setTripName(decoded.n);
        toast.success('Shared trip loaded — make it your own!');
      }
    } catch { /* malformed token */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredPlaces = useMemo(
    () => (placesData as any[]).filter((p) => {
      const q = searchQuery.toLowerCase();
      return !q ||
        p.title.toLowerCase().includes(q) ||
        p.region.toLowerCase().includes(q) ||
        p.district.toLowerCase().includes(q);
    }).slice(0, 60),
    [searchQuery],
  );

  const saveTrip = async () => {
    if (!user || !accessToken) { toast.error('Please sign in to save your trip'); window.location.href = '/signin'; return; }
    setIsSaving(true);
    try {
      const res = await fetch(`${API_BASE}/trip-plans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ name: tripName, destinations: tripDays, totalBudget: calculateTotalBudget(), status: 'planning' }),
      });
      const data = await res.json();
      if (res.ok) toast.success('Trip saved to your account!');
      else toast.error(data.error || 'Failed to save trip');
    } catch { toast.error('Network error — please try again'); }
    finally { setIsSaving(false); }
  };

  const downloadItinerary = () => {
    let text = `${tripName}\n${'='.repeat(50)}\n\n`;
    tripDays.forEach((day) => {
      text += `Day ${day.day}:\n`;
      if (day.places.length === 0) text += '  No places added\n';
      else day.places.forEach((place, idx) => { text += `  ${idx + 1}. ${place.title} (${place.region}) - ${place.priceFrom}\n`; });
      text += '\n';
    });
    text += `\nTotal Places: ${getTotalPlaces()}\n`;
    text += `Estimated Budget: ₹${calculateTotalBudget().toLocaleString()}\n`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${tripName.replace(/\s+/g, '-')}-itinerary.txt`; a.click();
  };

  const askAiOptimize = () => {
    if (getTotalPlaces() === 0) { toast.error('Add some places first, then I can optimise the route.'); return; }
    const list = tripDays.flatMap((d) => d.places.map((p) => `${p.title} (${p.region})`)).join(', ');
    window.dispatchEvent(new CustomEvent('bt:ask-ai', {
      detail: { message: `Help me optimise this West Bengal trip for the best day-by-day route. My places: ${list}. Suggest the best order, day grouping, and travel tips.` },
    }));
  };

  const popularPlaces = useMemo(
    () => POPULAR_SEEDS.map((slug) => (placesData as any[]).find((p) => p.slug === slug)).filter(Boolean),
    [],
  );

  const empty = getTotalPlaces() === 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/40 via-white to-orange-50/30 pb-24 sm:pb-12">
      {/* ── Cinematic hero ─────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden">
        <ImageWithFallback src={coverImage} alt="Trip cover" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/85 via-purple-900/70 to-purple-900/55" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-400/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-orange-400/20 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 pt-24 pb-10 sm:pt-28 sm:pb-14 text-white">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-3.5 py-1.5 rounded-full mb-4">
            <Compass className="w-3.5 h-3.5 text-orange-300" />
            <span className="font-poppins text-xs font-medium text-white/90">Trip Planner</span>
          </motion.div>

          <input
            type="text"
            value={tripName}
            onChange={(e) => setTripName(e.target.value)}
            placeholder="Name your trip…"
            className="block w-full max-w-3xl bg-transparent text-3xl sm:text-5xl font-poppins font-bold text-white placeholder-white/50 outline-none border-b-2 border-white/15 focus:border-orange-300/70 transition-colors pb-2 mb-5"
          />

          {/* Stat strip */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-poppins text-sm text-white/85">
            <span className="inline-flex items-center gap-1.5"><Calendar className="w-4 h-4 text-orange-300" /> {tripDays.length} day{tripDays.length !== 1 ? 's' : ''}</span>
            <span className="inline-flex items-center gap-1.5"><MapPin className="w-4 h-4 text-orange-300" /> {getTotalPlaces()} place{getTotalPlaces() !== 1 ? 's' : ''}</span>
            <span className="inline-flex items-center gap-1.5"><IndianRupee className="w-4 h-4 text-orange-300" /> ₹{calculateTotalBudget().toLocaleString()} estimate</span>
            {regionsCovered > 0 && (
              <span className="inline-flex items-center gap-1.5"><Route className="w-4 h-4 text-orange-300" /> {regionsCovered} region{regionsCovered > 1 ? 's' : ''}</span>
            )}
          </div>
        </div>
      </div>

      {/* ── Sticky day navigator ──────────────────────────────────────────── */}
      {tripDays.length > 1 && (
        <div className="sticky top-16 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 py-3 flex items-center gap-2 overflow-x-auto scrollbar-hide">
            {tripDays.map((d) => (
              <button
                key={d.id}
                onClick={() => { setActiveDayId(d.id); dayRefs.current[d.id]?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}
                className={`shrink-0 inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-poppins text-sm font-medium transition-all border ${
                  activeDayId === d.id
                    ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-purple-300'
                }`}
              >
                Day {d.day}
                {d.places.length > 0 && (
                  <span className={`text-[10px] font-poppins font-semibold px-1.5 py-0.5 rounded-full ${
                    activeDayId === d.id ? 'bg-white/20' : 'bg-purple-50 text-purple-700'
                  }`}>{d.places.length}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-5 sm:px-8 mt-8">
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* ── Main column: days ──────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-5">
            {/* Big empty state when nothing's been added yet */}
            {empty && (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
                <EmptyState
                  icon={Sparkles}
                  title="Start dreaming up your trip"
                  description="Add a destination to Day 1 to get going — or pick a popular starting point below."
                  actionLabel="Add a place"
                  onAction={() => { setSelectedDayForAdd(1); setShowPlacePicker(true); }}
                  secondaryLabel="Ask AI to plan it"
                  onSecondary={askAiOptimize}
                />
                {popularPlaces.length > 0 && (
                  <div className="mt-6">
                    <p className="font-poppins text-xs uppercase tracking-wider text-gray-400 font-semibold mb-3 text-center">Or start with a Bengal classic</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {popularPlaces.slice(0, 8).map((p: any) => (
                        <button key={p.slug} onClick={() => addPlaceToDay(1, p)}
                          className="group text-left bg-gradient-to-br from-gray-50 to-white border border-gray-100 hover:border-purple-200 rounded-2xl overflow-hidden hover:shadow-md transition-all">
                          <div className="relative h-20 overflow-hidden">
                            <ImageWithFallback src={p.heroImage.url} alt={p.title} optimizeWidth={320}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                            <span className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-white/95 text-purple-600 flex items-center justify-center shadow-sm group-hover:bg-purple-600 group-hover:text-white transition-all">
                              <Plus className="w-3.5 h-3.5" />
                            </span>
                          </div>
                          <div className="p-2.5">
                            <p className="font-poppins text-xs font-semibold text-slate-900 truncate">{p.title}</p>
                            <p className="font-poppins text-[10px] text-gray-500 truncate">{p.region}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Day cards */}
            <AnimatePresence>
              {tripDays.map((day) => {
                const suggestions = nearbyForDay(day);
                return (
                  <motion.section
                    key={day.id}
                    ref={(el) => { dayRefs.current[day.id] = el; }}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97, height: 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 sm:p-6 scroll-mt-32"
                    onMouseEnter={() => setActiveDayId(day.id)}
                  >
                    {/* Day header */}
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center font-poppins font-bold shadow-sm">
                          {day.day}
                        </div>
                        <div>
                          <h3 className="font-poppins text-lg sm:text-xl font-bold text-slate-900 leading-tight">Day {day.day}</h3>
                          <p className="font-poppins text-xs sm:text-sm text-gray-500 flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                            <span>{day.places.length} place{day.places.length !== 1 ? 's' : ''}</span>
                            {dayBudget(day) > 0 && <span className="text-purple-700 font-medium">· ₹{dayBudget(day).toLocaleString()}</span>}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setSelectedDayForAdd(day.day); setShowPlacePicker(true); }}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full font-poppins text-sm font-medium transition-colors shadow-sm"
                        >
                          <Plus className="w-4 h-4" /> Add place
                        </button>
                        {tripDays.length > 1 && (
                          <button onClick={() => removeDay(day.id)}
                            className="w-9 h-9 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-full transition" aria-label="Remove day">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Place rows / empty */}
                    {day.places.length === 0 ? (
                      <div className="text-center py-10 px-4 bg-gradient-to-br from-purple-50/40 to-orange-50/30 rounded-2xl border border-dashed border-purple-200">
                        <Calendar className="w-9 h-9 text-purple-300 mx-auto mb-2.5" strokeWidth={1.5} />
                        <p className="font-poppins text-sm text-gray-600 mb-3">No places yet for Day {day.day}.</p>
                        <button onClick={() => { setSelectedDayForAdd(day.day); setShowPlacePicker(true); }}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-purple-200 text-purple-700 rounded-full font-poppins text-sm font-medium hover:bg-purple-50 transition">
                          <Plus className="w-4 h-4" /> Add the first stop
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {day.places.map((place, idx) => (
                          <PlaceRow
                            key={place.slug}
                            place={place}
                            idx={idx}
                            isFirst={idx === 0}
                            isLast={idx === day.places.length - 1}
                            onMove={(delta) => movePlaceWithinDay(day.day, place.slug, delta)}
                            onRemove={() => removePlaceFromDay(day.day, place.slug)}
                          />
                        ))}
                      </div>
                    )}

                    {/* Smart "Add nearby" — proximity-based suggestions */}
                    {suggestions.length > 0 && (
                      <div className="mt-5 pt-5 border-t border-dashed border-gray-200">
                        <p className="font-poppins text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-2.5 flex items-center gap-1.5">
                          <Sparkles className="w-3 h-3 text-purple-500" /> Pair nearby
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {suggestions.map((p: any) => (
                            <button key={p.slug} onClick={() => addPlaceToDay(day.day, p)}
                              className="group inline-flex items-center gap-2 bg-white border border-gray-200 hover:border-purple-300 hover:bg-purple-50 rounded-full pl-1 pr-3 py-1 transition-all">
                              <ImageWithFallback src={p.heroImage.url} alt={p.title} optimizeWidth={120}
                                className="w-7 h-7 rounded-full object-cover" />
                              <span className="font-poppins text-xs font-medium text-slate-700 group-hover:text-purple-700">{p.title}</span>
                              <span className="font-poppins text-[10px] text-gray-400">· {Math.round(p._dist)} km</span>
                              <Plus className="w-3 h-3 text-purple-500" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.section>
                );
              })}
            </AnimatePresence>

            {/* Add another day */}
            <button onClick={addDay}
              className="w-full py-4 border-2 border-dashed border-purple-300 rounded-3xl text-purple-700 hover:bg-purple-50 hover:border-purple-400 transition-colors flex items-center justify-center gap-2 font-poppins font-medium text-sm">
              <Plus className="w-5 h-5" /> Add another day
            </button>

            {/* Route map */}
            {routeStops.length >= 1 && (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-100 to-orange-100 flex items-center justify-center">
                      <MapIcon className="w-4 h-4 text-purple-600" strokeWidth={2} />
                    </span>
                    <div>
                      <h3 className="font-poppins text-lg font-bold text-slate-900 leading-tight">Your route</h3>
                      <p className="font-poppins text-xs text-gray-500">{routeStops.length} stop{routeStops.length !== 1 ? 's' : ''} · order numbered on the map</p>
                    </div>
                  </div>
                </div>
                <Suspense fallback={<div className="h-80 rounded-2xl bg-gray-100 animate-pulse flex items-center justify-center"><Loader2 className="w-7 h-7 text-purple-400 animate-spin" /></div>}>
                  <TripRouteMap stops={routeStops} />
                </Suspense>
              </div>
            )}
          </div>

          {/* ── Sidebar ─────────────────────────────────────────────────── */}
          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            {/* Trip summary card */}
            <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 rounded-3xl p-6 text-white shadow-lg">
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-purple-400/30 rounded-full blur-2xl" />
              <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-orange-400/20 rounded-full blur-2xl" />

              <h3 className="relative font-poppins text-lg font-bold mb-5 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-orange-300" /> Trip summary
              </h3>
              <div className="relative space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="font-poppins text-sm text-white/85 flex items-center gap-2"><Calendar className="w-4 h-4" /> Days</span>
                  <span className="font-poppins text-2xl font-bold">{tripDays.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-poppins text-sm text-white/85 flex items-center gap-2"><MapPin className="w-4 h-4" /> Places</span>
                  <span className="font-poppins text-2xl font-bold">{getTotalPlaces()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-poppins text-sm text-white/85 flex items-center gap-2"><Route className="w-4 h-4" /> Regions</span>
                  <span className="font-poppins text-2xl font-bold">{regionsCovered}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-white/15">
                  <span className="font-poppins text-sm text-white/85 flex items-center gap-2"><IndianRupee className="w-4 h-4" /> Estimate</span>
                  <span className="font-poppins text-2xl font-bold">₹{calculateTotalBudget().toLocaleString()}</span>
                </div>
              </div>

              <div className="relative space-y-2.5 mt-6">
                <button onClick={saveTrip} disabled={isSaving}
                  className="w-full bg-white text-purple-700 py-3 rounded-full font-poppins font-semibold text-sm hover:bg-purple-50 disabled:opacity-60 transition flex items-center justify-center gap-2 shadow-sm">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {isSaving ? 'Saving…' : user ? 'Save to my trips' : 'Sign in & save'}
                </button>
                <button onClick={askAiOptimize}
                  className="w-full bg-white/15 hover:bg-white/25 border border-white/20 text-white py-2.5 rounded-full font-poppins font-medium text-sm transition flex items-center justify-center gap-2 backdrop-blur-sm">
                  <Sparkles className="w-4 h-4" /> Optimise with AI
                </button>
                <div className="grid grid-cols-2 gap-2.5">
                  <button onClick={downloadItinerary}
                    className="bg-white/15 hover:bg-white/25 border border-white/20 text-white py-2.5 rounded-full font-poppins font-medium text-xs transition flex items-center justify-center gap-1.5 backdrop-blur-sm">
                    <Download className="w-3.5 h-3.5" /> Download
                  </button>
                  <button onClick={shareTrip}
                    className="bg-white/15 hover:bg-white/25 border border-white/20 text-white py-2.5 rounded-full font-poppins font-medium text-xs transition flex items-center justify-center gap-1.5 backdrop-blur-sm">
                    <Share2 className="w-3.5 h-3.5" /> Share link
                  </button>
                </div>
              </div>
            </div>

            {/* Planning tips */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 sm:p-6">
              <h3 className="font-poppins text-base font-bold text-slate-900 mb-3.5 flex items-center gap-2">
                <Compass className="w-4 h-4 text-purple-600" /> Planning tips
              </h3>
              <ul className="space-y-2.5 font-poppins text-[13px] text-gray-600 leading-relaxed">
                <li className="flex items-start gap-2"><span className="w-1 h-1 rounded-full bg-purple-500 mt-2 shrink-0" /> Pair nearby places on the same day to save travel hours.</li>
                <li className="flex items-start gap-2"><span className="w-1 h-1 rounded-full bg-purple-500 mt-2 shrink-0" /> October–March is the sweet spot across most of Bengal.</li>
                <li className="flex items-start gap-2"><span className="w-1 h-1 rounded-full bg-purple-500 mt-2 shrink-0" /> Book hill stays a few weeks ahead during peak season.</li>
                <li className="flex items-start gap-2"><span className="w-1 h-1 rounded-full bg-purple-500 mt-2 shrink-0" /> Leave a buffer hour between transport and the first activity.</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>

      {/* ── Mobile bottom action bar ─────────────────────────────────────── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-100 px-4 py-3 flex items-center gap-2 shadow-[0_-8px_24px_rgba(0,0,0,0.06)]">
        <button onClick={saveTrip} disabled={isSaving}
          className="flex-1 bg-purple-600 text-white py-2.5 rounded-full font-poppins font-semibold text-sm hover:bg-purple-700 disabled:opacity-60 transition flex items-center justify-center gap-2 shadow-sm">
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isSaving ? 'Saving…' : 'Save'}
        </button>
        <button onClick={shareTrip}
          className="w-12 h-11 bg-white border border-gray-200 rounded-full flex items-center justify-center text-purple-700 hover:bg-purple-50 transition" aria-label="Share trip">
          <Share2 className="w-4 h-4" />
        </button>
        <button onClick={() => { setSelectedDayForAdd(tripDays[0]?.day ?? 1); setShowPlacePicker(true); }}
          className="w-12 h-11 bg-white border border-gray-200 rounded-full flex items-center justify-center text-purple-700 hover:bg-purple-50 transition" aria-label="Add place">
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* ── Place picker modal ───────────────────────────────────────────── */}
      <AnimatePresence>
        {showPlacePicker && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/55 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-6"
            onClick={() => setShowPlacePicker(false)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-3xl max-h-[88vh] overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="px-6 pt-5 pb-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="font-poppins text-xl font-bold text-slate-900">Add to Day {selectedDayForAdd}</h3>
                  <p className="font-poppins text-xs text-gray-500 mt-0.5">Pick from {(placesData as any[]).length}+ real West Bengal destinations</p>
                </div>
                <button onClick={() => setShowPlacePicker(false)}
                  className="w-9 h-9 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 transition">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="px-6 py-4 border-b border-gray-100">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text" autoFocus value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search a place, district or region…"
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl font-poppins text-sm focus:outline-none focus:bg-white focus:border-purple-300 focus:ring-4 focus:ring-purple-100 transition"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-4">
                {filteredPlaces.length === 0 ? (
                  <div className="text-center py-10 font-poppins text-sm text-gray-500">No places match "{searchQuery}".</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filteredPlaces.map((p: any) => {
                      const alreadyAdded = tripDays.some((d) => d.places.some((tp) => tp.slug === p.slug));
                      return (
                        <button
                          key={p.slug}
                          onClick={() => !alreadyAdded && addPlaceToDay(selectedDayForAdd, p)}
                          disabled={alreadyAdded}
                          className={`group text-left flex items-center gap-3 p-3 border rounded-2xl transition-all ${
                            alreadyAdded
                              ? 'border-emerald-200 bg-emerald-50/40 cursor-default'
                              : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/40 hover:shadow-sm'
                          }`}
                        >
                          <ImageWithFallback src={p.heroImage.url} alt={p.heroImage.alt || p.title} optimizeWidth={240}
                            className="w-16 h-16 rounded-xl object-cover shrink-0" />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-poppins text-sm font-semibold text-slate-900 truncate">{p.title}</h4>
                            <p className="font-poppins text-[11px] text-gray-500 truncate">{p.district || p.region}</p>
                            {p.priceFrom && (
                              <p className="font-poppins text-[11px] text-purple-700 mt-0.5">from {p.priceFrom}</p>
                            )}
                          </div>
                          <span className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                            alreadyAdded ? 'bg-emerald-100 text-emerald-700' : 'bg-purple-100 text-purple-700 group-hover:bg-purple-600 group-hover:text-white transition'
                          }`}>
                            {alreadyAdded ? '✓' : <Plus className="w-4 h-4" />}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default TripPlanner;
