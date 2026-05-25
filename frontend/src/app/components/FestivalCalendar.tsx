import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar as CalendarIcon, MapPin, Clock, Sparkles, ChevronLeft, ChevronRight,
  CalendarPlus, Heart, Share2, Search, X, Filter, Star, Music, Utensils, Flame, Flower2, ExternalLink, LayoutList, LayoutGrid,
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { API_BASE } from '../utils/api';

interface Festival {
  id: string;
  name: string;
  bengaliName?: string;
  description: string;
  months: number[];
  durationDays: number;
  typicalDates?: string;
  significance?: 'highest' | 'high' | 'medium' | string;
  category?: 'religious' | 'cultural' | 'harvest' | 'fair' | 'music' | string;
  locations: string[];
  bestPlaces?: string[];
  vibe?: string;
  musttry?: string[];
  image: string;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function slugToTitle(slug: string) {
  return slug.split('-').map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
}

function getNextOccurrence(festival: Festival, now = new Date()): { start: Date; end: Date } {
  const month = (festival.months && festival.months[0]) || 1;
  const year = now.getFullYear();
  let start = new Date(year, month - 1, 15, 0, 0, 0);
  const days = festival.durationDays || 1;
  const tentativeEnd = new Date(start.getTime() + days * 86400000);
  if (tentativeEnd.getTime() < now.getTime() - 86400000) {
    start = new Date(year + 1, month - 1, 15, 0, 0, 0);
  }
  const end = new Date(start.getTime() + (days - 1) * 86400000);
  return { start, end };
}

function formatGCalDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
}

function buildGoogleCalendarUrl(festival: Festival): string {
  const { start, end } = getNextOccurrence(festival);
  const endPlus = new Date(end.getTime() + 86400000);
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: festival.bengaliName ? `${festival.name} (${festival.bengaliName})` : festival.name,
    dates: `${formatGCalDate(start)}/${formatGCalDate(endPlus)}`,
    details: `${festival.description}\n\nWhere to celebrate: ${(festival.bestPlaces || festival.locations.map(slugToTitle)).slice(0, 5).join(', ')}\n\nVibe: ${festival.vibe || ''}\n\nMust try: ${(festival.musttry || []).join(', ')}\n\nLearn more on Bengal Trails — West Bengal travel guide.`,
    location: festival.locations.map(slugToTitle).slice(0, 3).join(', '),
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function significanceColor(sig?: string) {
  if (sig === 'highest') return 'bg-rose-100 text-rose-800 border-rose-200';
  if (sig === 'high') return 'bg-amber-100 text-amber-800 border-amber-200';
  return 'bg-slate-100 text-slate-700 border-slate-200';
}

function categoryIcon(cat?: string) {
  switch (cat) {
    case 'religious': return <Flame className="w-3.5 h-3.5" />;
    case 'harvest': return <Sparkles className="w-3.5 h-3.5" />;
    case 'music': return <Music className="w-3.5 h-3.5" />;
    case 'fair': return <Flower2 className="w-3.5 h-3.5" />;
    default: return <Star className="w-3.5 h-3.5" />;
  }
}

function categoryColor(cat?: string) {
  switch (cat) {
    case 'religious': return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'cultural': return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'harvest': return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'fair': return 'bg-pink-50 text-pink-700 border-pink-200';
    case 'music': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    default: return 'bg-slate-50 text-slate-700 border-slate-200';
  }
}

function cardAccent(monthIdx: number): string {
  const palette = [
    'from-rose-50 to-amber-50',
    'from-purple-50 to-pink-50',
    'from-indigo-50 to-sky-50',
    'from-emerald-50 to-teal-50',
    'from-amber-50 to-orange-50',
    'from-fuchsia-50 to-purple-50',
  ];
  return palette[monthIdx % palette.length];
}

function MiniCalendar({
  currentMonth, currentYear, festivalMonthMap, selectedMonth, onSelectMonth, onPrev, onNext,
}: {
  currentMonth: number; currentYear: number;
  festivalMonthMap: Record<number, Festival[]>;
  selectedMonth: number | null;
  onSelectMonth: (m: number | null) => void;
  onPrev: () => void; onNext: () => void;
}) {
  const today = new Date();
  const isCurrentMonthRealMonth = currentMonth === today.getMonth() && currentYear === today.getFullYear();
  const firstDay = new Date(currentYear, currentMonth, 1);
  const startWeekday = firstDay.getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const cells: { day: number | null; isToday?: boolean; hasFest?: boolean }[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push({ day: null });
  const monthFestivals = festivalMonthMap[currentMonth + 1] || [];
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = isCurrentMonthRealMonth && d === today.getDate();
    const hasFest = (d >= 10 && d <= 22) && monthFestivals.length > 0;
    cells.push({ day: d, isToday, hasFest });
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-slate-900">{MONTH_NAMES[currentMonth]} {currentYear}</h3>
        <div className="flex items-center gap-1">
          <button onClick={onPrev} className="w-7 h-7 grid place-items-center rounded-lg hover:bg-slate-100 text-slate-600" aria-label="Previous month">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={onNext} className="w-7 h-7 grid place-items-center rounded-lg hover:bg-slate-100 text-slate-600" aria-label="Next month">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-[10px] font-medium text-slate-400 mb-1">
        {['S','M','T','W','T','F','S'].map((d,i) => <div key={i} className="text-center py-1">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((c, idx) => {
          if (c.day === null) return <div key={idx} />;
          return (
            <button
              key={idx}
              onClick={() => onSelectMonth(currentMonth + 1)}
              className={`relative aspect-square text-xs rounded-lg transition
                ${c.isToday ? 'bg-purple-600 text-white font-semibold' :
                  c.hasFest ? 'bg-purple-50 text-purple-900 hover:bg-purple-100' :
                  'text-slate-700 hover:bg-slate-100'}`}
            >
              {c.day}
              {c.hasFest && !c.isToday && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-purple-500" />
              )}
            </button>
          );
        })}
      </div>
      <button
        onClick={() => onSelectMonth(selectedMonth === currentMonth + 1 ? null : currentMonth + 1)}
        className={`mt-3 w-full text-sm py-2 rounded-lg border transition
          ${selectedMonth === currentMonth + 1
            ? 'bg-purple-600 text-white border-purple-600'
            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
      >
        {selectedMonth === currentMonth + 1
          ? `Showing ${MONTH_NAMES[currentMonth]} — clear`
          : `Filter to ${MONTH_NAMES[currentMonth]}`}
      </button>
    </div>
  );
}

function FestivalCard({
  festival, index, onLocationClick, onSave, isSaved,
}: {
  festival: Festival; index: number;
  onLocationClick: (slug: string) => void;
  onSave: (f: Festival) => void; isSaved: boolean;
}) {
  const monthIdx = (festival.months && festival.months[0]) || 1;
  const { start, end } = getNextOccurrence(festival);
  const now = new Date();
  const daysUntil = Math.ceil((start.getTime() - now.getTime()) / 86400000);
  const isLive = now.getTime() >= start.getTime() && now.getTime() <= end.getTime() + 86400000;
  const isUpcomingSoon = !isLive && daysUntil > 0 && daysUntil <= 30;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
      className={`relative bg-gradient-to-br ${cardAccent(monthIdx)} rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition`}
    >
      <div className="grid md:grid-cols-[300px_1fr] gap-0">
        <div className="relative h-56 md:h-auto overflow-hidden">
          <ImageWithFallback
            src={festival.image}
            alt={festival.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            {festival.significance && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wide font-semibold border ${significanceColor(festival.significance)}`}>
                {festival.significance === 'highest' ? '★ Grandest' : festival.significance}
              </span>
            )}
            {festival.category && (
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] capitalize font-medium border ${categoryColor(festival.category)}`}>
                {categoryIcon(festival.category)} {festival.category}
              </span>
            )}
          </div>
          {(isLive || isUpcomingSoon) && (
            <div className="absolute bottom-3 left-3">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
                ${isLive ? 'bg-emerald-500 text-white' : 'bg-amber-400 text-amber-950'}`}>
                {isLive ? (<><span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Happening now</>)
                       : (<><Clock className="w-3 h-3" /> In {daysUntil} days</>)}
              </span>
            </div>
          )}
        </div>

        <div className="p-5 md:p-6 flex flex-col">
          <header className="mb-3">
            <div className="flex items-baseline gap-3 flex-wrap">
              <h2 className="text-2xl font-bold text-slate-900">{festival.name}</h2>
              {festival.bengaliName && (
                <span className="text-lg text-slate-500 font-medium">{festival.bengaliName}</span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1.5 text-sm text-slate-600">
              <span className="inline-flex items-center gap-1">
                <CalendarIcon className="w-3.5 h-3.5" />
                {festival.typicalDates || `${MONTH_SHORT[(festival.months[0] || 1) - 1]}${festival.months.length > 1 ? '–' + MONTH_SHORT[(festival.months[festival.months.length - 1] || 1) - 1] : ''}`}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {festival.durationDays || 1} day{(festival.durationDays || 1) > 1 ? 's' : ''}
              </span>
            </div>
          </header>

          <p className="text-sm text-slate-700 leading-relaxed mb-4">{festival.description}</p>

          {festival.locations && festival.locations.length > 0 && (
            <div className="mb-3">
              <h3 className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-1.5 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Where to celebrate
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {festival.locations.map((slug) => (
                  <button
                    key={slug}
                    onClick={() => onLocationClick(slug)}
                    className="px-2.5 py-1 bg-white border border-slate-200 rounded-full text-xs text-slate-700 hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700 transition"
                  >
                    {slugToTitle(slug)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {festival.bestPlaces && festival.bestPlaces.length > 0 && (
            <div className="mb-3">
              <h3 className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-1.5">Best spots</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{festival.bestPlaces.join(' • ')}</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {festival.vibe && (
              <div>
                <h3 className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Vibe
                </h3>
                <p className="text-xs text-slate-600 italic">{festival.vibe}</p>
              </div>
            )}
            {festival.musttry && festival.musttry.length > 0 && (
              <div>
                <h3 className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-1 flex items-center gap-1">
                  <Utensils className="w-3 h-3" /> Must try
                </h3>
                <div className="flex flex-wrap gap-1">
                  {festival.musttry.slice(0, 4).map((item, i) => (
                    <span key={i} className="px-1.5 py-0.5 bg-white/70 border border-slate-200 rounded text-[11px] text-slate-700">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-auto flex flex-wrap gap-2 pt-3 border-t border-slate-200/60">
            <a
              href={buildGoogleCalendarUrl(festival)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-medium hover:bg-purple-700 transition"
            >
              <CalendarPlus className="w-3.5 h-3.5" /> Add to Google Calendar
            </a>
            {festival.locations[0] && (
              <button
                onClick={() => onLocationClick(festival.locations[0])}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-medium hover:border-purple-400 hover:text-purple-700 transition"
              >
                <MapPin className="w-3.5 h-3.5" /> View place
              </button>
            )}
            <button
              onClick={() => onSave(festival)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition
                ${isSaved
                  ? 'bg-rose-50 border border-rose-300 text-rose-700'
                  : 'bg-white border border-slate-300 text-slate-700 hover:border-rose-400 hover:text-rose-600'}`}
            >
              <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
              {isSaved ? 'Saved' : 'Save'}
            </button>
            <a
              href={`https://www.google.com/search?q=${encodeURIComponent(festival.name + ' Bengal festival ' + (festival.bengaliName || ''))}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-medium hover:border-blue-400 hover:text-blue-700 transition"
              title="Learn more about this festival on Google"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Learn on Google
            </a>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: festival.name, text: festival.description, url: window.location.href }).catch(() => {});
                } else {
                  navigator.clipboard.writeText(`${festival.name} — ${window.location.href}`);
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-medium hover:border-slate-400 transition"
            >
              <Share2 className="w-3.5 h-3.5" /> Share
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export function FestivalCalendar() {
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [groupByMonth, setGroupByMonth] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem('saved_festivals');
      return new Set(stored ? JSON.parse(stored) : []);
    } catch { return new Set(); }
  });

  const now = new Date();
  const [calMonth, setCalMonth] = useState(now.getMonth());
  const [calYear, setCalYear] = useState(now.getFullYear());

  useEffect(() => {
    fetch(`${API_BASE}/bengal/festivals`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('Failed to load'))))
      .then((data) => {
        const list: Festival[] = (data?.festivals || []).map((f: any) => ({
          id: f.id,
          name: f.name,
          bengaliName: f.bengaliName,
          description: f.description,
          months: f.months || [],
          durationDays: f.durationDays || f.duration || 1,
          typicalDates: f.typicalDates,
          significance: f.significance,
          category: f.category,
          locations: f.locations || [],
          bestPlaces: f.bestPlaces,
          vibe: f.vibe,
          musttry: f.musttry,
          image: f.image,
        }));
        setFestivals(list);
      })
      .catch((e) => setError(e.message || 'Could not load festivals'))
      .finally(() => setLoading(false));
  }, []);

  const festivalMonthMap = useMemo(() => {
    const map: Record<number, Festival[]> = {};
    festivals.forEach((f) => (f.months || []).forEach((m) => {
      if (!map[m]) map[m] = [];
      map[m].push(f);
    }));
    return map;
  }, [festivals]);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(festivals.map((f) => f.category).filter(Boolean))) as string[];
    return cats;
  }, [festivals]);

  const filtered = useMemo(() => {
    let list = [...festivals];
    if (selectedMonth) list = list.filter((f) => (f.months || []).includes(selectedMonth));
    if (selectedCategory) list = list.filter((f) => f.category === selectedCategory);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((f) =>
        f.name.toLowerCase().includes(q) ||
        (f.bengaliName || '').toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q) ||
        (f.locations || []).some((l) => l.toLowerCase().includes(q)) ||
        (f.bestPlaces || []).some((p) => p.toLowerCase().includes(q))
      );
    }
    list.sort((a, b) => getNextOccurrence(a).start.getTime() - getNextOccurrence(b).start.getTime());
    return list;
  }, [festivals, selectedMonth, selectedCategory, search]);

  const thisMonth = now.getMonth() + 1;
  const thisMonthFestivals = festivalMonthMap[thisMonth] || [];

  const handleLocationClick = (slug: string) => {
    window.location.hash = `#/explore/${slug}`;
  };

  const handleSave = (f: Festival) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(f.id)) next.delete(f.id); else next.add(f.id);
      try { localStorage.setItem('saved_festivals', JSON.stringify(Array.from(next))); } catch {}
      return next;
    });
  };

  const clearFilters = () => { setSearch(''); setSelectedMonth(null); setSelectedCategory(null); };

  return (
    <section className="min-h-screen bg-slate-50 pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-purple-600 mb-1">Bengal Festivals {calYear}</p>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
                Festival calendar of West Bengal
              </h1>
              <p className="text-slate-600 mt-2 max-w-2xl">
                {festivals.length} pujas, melas, and celebrations across the year — with dates, places to go, must-try foods, and one-click Google Calendar reminders.
              </p>
            </div>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search festival, place, or food..."
                className="w-full pl-9 pr-9 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" aria-label="Clear search">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Happening this month — uses real festival dates */}
        {!loading && !error && thisMonthFestivals.length > 0 && (
          <div className="mb-6 rounded-2xl bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white p-5 sm:p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-300" />
                <h2 className="font-bold text-lg">Happening in {MONTH_NAMES[thisMonth - 1]}</h2>
                <span className="text-white/80 text-sm">· {thisMonthFestivals.length} festival{thisMonthFestivals.length > 1 ? 's' : ''}</span>
              </div>
              <button
                onClick={() => setSelectedMonth(selectedMonth === thisMonth ? null : thisMonth)}
                className="text-sm font-medium bg-white/15 hover:bg-white/25 px-4 py-1.5 rounded-full transition-colors"
              >
                {selectedMonth === thisMonth ? 'Showing this month — clear' : `Show only ${MONTH_NAMES[thisMonth - 1]}`}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {thisMonthFestivals.slice(0, 8).map((f) => (
                <span key={f.id} className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1 text-sm">
                  {f.name}
                  {f.typicalDates && <span className="text-white/70 text-xs">· {f.typicalDates}</span>}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* View mode toggle */}
        <div className="flex items-center justify-end gap-2 mb-4">
          <span className="text-xs text-slate-500">View:</span>
          <div className="inline-flex items-center bg-white border border-slate-200 rounded-lg p-0.5">
            <button
              onClick={() => setGroupByMonth(false)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition
                ${!groupByMonth ? 'bg-purple-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <LayoutList className="w-3.5 h-3.5" /> List
            </button>
            <button
              onClick={() => setGroupByMonth(true)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition
                ${groupByMonth ? 'bg-purple-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> By month
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-[320px_1fr] gap-6">
          <aside className="lg:sticky lg:top-24 lg:self-start space-y-4">
            <MiniCalendar
              currentMonth={calMonth}
              currentYear={calYear}
              festivalMonthMap={festivalMonthMap}
              selectedMonth={selectedMonth}
              onSelectMonth={setSelectedMonth}
              onPrev={() => {
                if (calMonth === 0) { setCalMonth(11); setCalYear((y) => y - 1); }
                else setCalMonth((m) => m - 1);
              }}
              onNext={() => {
                if (calMonth === 11) { setCalMonth(0); setCalYear((y) => y + 1); }
                else setCalMonth((m) => m + 1);
              }}
            />

            {categories.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-4">
                <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2 text-sm">
                  <Filter className="w-4 h-4" /> Type
                </h3>
                <div className="space-y-1.5">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                      className={`w-full inline-flex items-center justify-between px-3 py-2 rounded-lg text-sm transition
                        ${selectedCategory === cat
                          ? 'bg-purple-600 text-white'
                          : 'hover:bg-slate-100 text-slate-700'}`}
                    >
                      <span className="inline-flex items-center gap-2 capitalize">
                        {categoryIcon(cat)} {cat}
                      </span>
                      <span className={`text-xs ${selectedCategory === cat ? 'text-purple-200' : 'text-slate-400'}`}>
                        {festivals.filter((f) => f.category === cat).length}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {thisMonthFestivals.length > 0 && (
              <div className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white rounded-2xl p-4">
                <h3 className="font-semibold mb-2 flex items-center gap-2 text-sm">
                  <Sparkles className="w-4 h-4" /> Happening in {MONTH_NAMES[now.getMonth()]}
                </h3>
                <div className="space-y-2">
                  {thisMonthFestivals.slice(0, 4).map((f) => (
                    <div key={f.id} className="text-sm">
                      <p className="font-medium">{f.name}</p>
                      <p className="text-xs text-purple-200">{f.bengaliName} • {f.typicalDates}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(selectedMonth || selectedCategory || search) && (
              <button
                onClick={clearFilters}
                className="w-full py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 hover:bg-slate-50 transition inline-flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" /> Clear all filters
              </button>
            )}
          </aside>

          <main className="space-y-5">
            {(selectedMonth || selectedCategory) && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-slate-500">Filtering by:</span>
                {selectedMonth && (
                  <button
                    onClick={() => setSelectedMonth(null)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium"
                  >
                    {MONTH_NAMES[selectedMonth - 1]} <X className="w-3 h-3" />
                  </button>
                )}
                {selectedCategory && (
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium capitalize"
                  >
                    {selectedCategory} <X className="w-3 h-3" />
                  </button>
                )}
                <span className="text-xs text-slate-500 ml-auto">{filtered.length} of {festivals.length}</span>
              </div>
            )}

            {loading ? (
              <div className="space-y-4">
                {[1,2,3].map((i) => (
                  <div key={i} className="bg-white rounded-2xl border border-slate-200 h-64 animate-pulse" />
                ))}
              </div>
            ) : error ? (
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center">
                <p className="text-rose-700 font-medium">Could not load festivals</p>
                <p className="text-rose-600 text-sm mt-1">{error}</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <CalendarIcon className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-700 font-medium">No festivals match your filters</p>
                <p className="text-slate-500 text-sm mt-1">Try clearing filters or searching for something else.</p>
                <button onClick={clearFilters} className="mt-4 px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition">
                  Clear all
                </button>
              </div>
            ) : groupByMonth ? (
              // Grouped by month
              <div className="space-y-8">
                {(() => {
                  // Group filtered festivals by their first month
                  const byMonth: Record<number, Festival[]> = {};
                  filtered.forEach((f) => {
                    const m = (f.months && f.months[0]) || 1;
                    if (!byMonth[m]) byMonth[m] = [];
                    byMonth[m].push(f);
                  });
                  const monthsInUse = Object.keys(byMonth).map(Number).sort((a, b) => a - b);
                  return monthsInUse.map((m) => (
                    <div key={m}>
                      <div className="sticky top-20 z-10 -mx-1 px-1 mb-4 backdrop-blur-md bg-slate-50/85 pt-2 pb-2 border-b border-slate-200">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                          <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-purple-100 text-purple-700 text-sm font-bold">
                            {String(m).padStart(2, '0')}
                          </span>
                          {MONTH_NAMES[m - 1]}
                          <span className="text-xs font-normal text-slate-500">
                            ({byMonth[m].length} festival{byMonth[m].length > 1 ? 's' : ''})
                          </span>
                        </h2>
                      </div>
                      <div className="space-y-4">
                        <AnimatePresence mode="popLayout">
                          {byMonth[m].map((f, idx) => (
                            <FestivalCard
                              key={f.id}
                              festival={f}
                              index={idx}
                              onLocationClick={handleLocationClick}
                              onSave={handleSave}
                              isSaved={savedIds.has(f.id)}
                            />
                          ))}
                        </AnimatePresence>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            ) : (
              // Flat list (sorted by next occurrence)
              <AnimatePresence mode="popLayout">
                {filtered.map((f, idx) => (
                  <FestivalCard
                    key={f.id}
                    festival={f}
                    index={idx}
                    onLocationClick={handleLocationClick}
                    onSave={handleSave}
                    isSaved={savedIds.has(f.id)}
                  />
                ))}
              </AnimatePresence>
            )}
          </main>
        </div>
      </div>
    </section>
  );
}

export default FestivalCalendar;
