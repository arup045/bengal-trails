import { API_BASE, getToken } from '../utils/api';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Send, Sparkles, MapPin, Calendar, DollarSign, X,
  Minimize2, Mic, RefreshCw, Maximize2, Minimize,
  Utensils, Camera, Waves, Mountain, Heart, Copy, Check,
  ThumbsUp, ThumbsDown, IndianRupee, ArrowRight, Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { sanitizeInline } from '../utils/sanitize';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useWishlistSync } from '../utils/useWishlistSync';

interface Destination { name: string; slug: string; image?: string; price?: number | string }
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  destinations?: Destination[];
  feedback?: 'up' | 'down';
}

const THREAD_KEY = 'bt-ai-thread-v1';
const MAX_SAVED = 40;

// ── Page context (PATH-based — the app uses real routes, not hashes) ───────────
function titleCase(slug: string) {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
function getPageContext(): { page: string; slug: string; label: string } {
  try {
    const path = window.location.pathname.replace(/\/+$/, '') || '/';
    const parts = path.split('/').filter(Boolean);
    if (parts[0] === 'explore' && parts[1] === 'district' && parts[2]) {
      return { page: 'district', slug: parts[2], label: titleCase(parts[2]) };
    }
    if (parts[0] === 'explore' && parts[1]) {
      return { page: 'place', slug: parts[1], label: titleCase(parts[1]) };
    }
    if (parts.length === 0) return { page: 'home', slug: '', label: '' };
    return { page: parts[0], slug: parts[1] || '', label: parts[1] ? titleCase(parts[1]) : '' };
  } catch {
    return { page: 'home', slug: '', label: '' };
  }
}

const GENERIC_PROMPTS = [
  { icon: <Mountain className="w-3.5 h-3.5" />, label: 'Hill stations', prompt: 'Best hill stations in West Bengal' },
  { icon: <Waves className="w-3.5 h-3.5" />, label: 'Beaches', prompt: 'Beach destinations in West Bengal' },
  { icon: <Calendar className="w-3.5 h-3.5" />, label: 'Festivals', prompt: 'Upcoming festivals in West Bengal' },
  { icon: <Utensils className="w-3.5 h-3.5" />, label: 'Food spots', prompt: 'Must-try Bengali food and restaurants' },
  { icon: <DollarSign className="w-3.5 h-3.5" />, label: 'Budget trip', prompt: 'Plan a budget-friendly trip to West Bengal under ₹5000' },
  { icon: <Camera className="w-3.5 h-3.5" />, label: 'Photo spots', prompt: 'Best photography spots in West Bengal' },
];

function contextualPrompts(ctx: ReturnType<typeof getPageContext>) {
  const L = ctx.label;
  if ((ctx.page === 'place' || ctx.page === 'district') && L) {
    return [
      { icon: <Calendar className="w-3.5 h-3.5" />, label: `Plan ${L}`, prompt: `Plan a 2-day trip to ${L}` },
      { icon: <Mountain className="w-3.5 h-3.5" />, label: 'Best time', prompt: `Best time to visit ${L} and current weather` },
      { icon: <MapPin className="w-3.5 h-3.5" />, label: 'How to reach', prompt: `How do I reach ${L}?` },
      { icon: <Utensils className="w-3.5 h-3.5" />, label: 'Where to stay', prompt: `Where should I stay in ${L}?` },
    ];
  }
  return GENERIC_PROMPTS;
}

function buildWelcome(ctx: ReturnType<typeof getPageContext>): Message {
  const base = {
    id: 'welcome',
    role: 'assistant' as const,
    timestamp: new Date(),
  };
  if ((ctx.page === 'place' || ctx.page === 'district') && ctx.label) {
    return {
      ...base,
      content: `Planning a trip to **${ctx.label}**? 🌿\n\nI can build an itinerary, check the live weather, find stays, estimate your budget, or tell you how to get there — all from real Bengal Trails data. What would you like?`,
      suggestions: [`Plan 2 days in ${ctx.label}`, `Best time to visit ${ctx.label}`, `Where to stay in ${ctx.label}`, `How to reach ${ctx.label}`],
    };
  }
  return {
    ...base,
    content: "Hi! I'm your **Bengal Trails Concierge** 🌿\n\nI can plan itineraries, check live weather, find stays, estimate budgets and surface real destinations — grounded in actual data, never made up.\n\nWhat kind of trip are you dreaming of?",
    suggestions: ['Weekend getaway from Kolkata', 'Best time to visit Darjeeling', 'Family trip under ₹10,000', '3-day Sundarbans tour'],
  };
}

function loadThread(): Message[] | null {
  try {
    const raw = localStorage.getItem(THREAD_KEY);
    if (!raw) return null;
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr) || arr.length === 0) return null;
    return arr.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }));
  } catch { return null; }
}
function saveThread(msgs: Message[]) {
  try { localStorage.setItem(THREAD_KEY, JSON.stringify(msgs.slice(-MAX_SAVED))); } catch { /* quota */ }
}

function TypingIndicator({ status }: { status?: string }) {
  return (
    <div className="flex items-center gap-2 px-4 py-3">
      <div className="flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div key={i} className="w-2 h-2 bg-purple-400 rounded-full"
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15, ease: 'easeInOut' }} />
        ))}
      </div>
      {status && <span className="text-xs text-purple-500 font-medium">{status}</span>}
    </div>
  );
}

function MarkdownText({ text }: { text: string }) {
  // SECURITY: AI output → escape, transform markdown-lite, then DOMPurify.
  const escapeHtml = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const escaped = escapeHtml(text);
  const formatted = escaped
    .replace(/^### (.+)$/gm, '<h4 class="font-semibold text-slate-900 mt-2">$1</h4>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^[•\-] (.+)$/gm, '<li>$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>')
    .split('\n')
    .map((line) => (line.startsWith('<li>') || line.startsWith('<h4')) ? line : (line.trim() ? `<p>${line}</p>` : ''))
    .join('');
  return <div className="prose-sm text-sm leading-relaxed space-y-1 [&_li]:ml-4 [&_li]:list-disc" dangerouslySetInnerHTML={{ __html: sanitizeInline(formatted) }} />;
}

// ── Rich destination card (generative UI) ──────────────────────────────────────
function DestinationCard({ dest, saved, onSave }: { dest: Destination; saved: boolean; onSave: () => void }) {
  const price = dest.price != null && dest.price !== ''
    ? (typeof dest.price === 'number' ? `₹${dest.price.toLocaleString()}` : String(dest.price))
    : null;
  return (
    <div className="group relative w-44 shrink-0 rounded-2xl overflow-hidden border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all">
      <a href={`/explore/${dest.slug}`} className="block">
        <div className="relative h-24 overflow-hidden bg-gray-100">
          {dest.image
            ? <ImageWithFallback src={dest.image} alt={dest.name} optimizeWidth={360} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            : <div className="w-full h-full flex items-center justify-center text-purple-200"><MapPin className="w-6 h-6" /></div>}
          {price && (
            <span className="absolute bottom-1.5 left-1.5 bg-black/55 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
              <IndianRupee className="w-2.5 h-2.5" />{price.replace('₹', '')}
            </span>
          )}
        </div>
        <div className="px-2.5 py-2">
          <p className="font-poppins text-xs font-semibold text-slate-900 truncate">{dest.name}</p>
          <span className="font-poppins text-[10px] text-purple-600 flex items-center gap-0.5 mt-0.5">View <ArrowRight className="w-2.5 h-2.5" /></span>
        </div>
      </a>
      <button onClick={onSave} aria-label={saved ? 'Saved' : 'Save to wishlist'}
        className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:scale-110 transition-transform">
        <Heart className={`w-3.5 h-3.5 ${saved ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
      </button>
    </div>
  );
}

export const AITravelAssistant: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistSync();

  const [messages, setMessages] = useState<Message[]>(() => loadThread() || [buildWelcome(getPageContext())]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [toolStatus, setToolStatus] = useState('');
  const [waking, setWaking] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [listening, setListening] = useState(false);
  const [copiedId, setCopiedId] = useState('');
  const [removedSlugs, setRemovedSlugs] = useState<Set<string>>(new Set());
  const [savingTrip, setSavingTrip] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const warmedRef = useRef(false);

  // Warm the backend once (free) the moment the user shows intent to chat — pings
  // /healthz only (NOT the model), so the first real message doesn't wait on a
  // cold free-tier server. No-ops after the first call.
  const warm = () => {
    if (warmedRef.current) return;
    warmedRef.current = true;
    try {
      const origin = API_BASE.replace(/\/api\/?$/, '');
      fetch(`${origin}/healthz`, { method: 'GET', cache: 'no-store' }).catch(() => {});
    } catch { /* ignore */ }
  };

  const quickPrompts = useMemo(() => contextualPrompts(getPageContext()), [isOpen]);

  // Every unique destination the AI has surfaced this conversation → "trip in progress".
  const tripDests = useMemo(() => {
    const seen = new Map<string, Destination>();
    messages.forEach((m) => (m.destinations || []).forEach((d) => {
      if (d.slug && !removedSlugs.has(d.slug) && !seen.has(d.slug)) seen.set(d.slug, d);
    }));
    return Array.from(seen.values());
  }, [messages, removedSlugs]);

  const saveTripFromAI = async () => {
    if (!tripDests.length || savingTrip) return;
    const token = getToken();
    if (!user || !token) { toast.error('Please sign in to save your trip'); window.location.href = '/signin'; return; }
    setSavingTrip(true);
    try {
      const res = await fetch(`${API_BASE}/trip-plans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: `AI trip · ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`,
          destinations: tripDests.map((d) => ({ name: d.name, slug: d.slug, image: d.image })),
          status: 'planning',
        }),
      });
      if (res.ok) toast.success('Saved to My Trips!');
      else { const e = await res.json().catch(() => ({})); toast.error(e.error || 'Could not save trip'); }
    } catch { toast.error('Network error — please try again'); }
    finally { setSavingTrip(false); }
  };
  const voiceSupported = typeof window !== 'undefined' && (('webkitSpeechRecognition' in window) || ('SpeechRecognition' in window));

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading, toolStatus]);
  useEffect(() => { saveThread(messages); }, [messages]);

  const wishlistAdd = (d: Destination) => {
    if (isInWishlist(d.slug)) removeFromWishlist(d.slug);
    else addToWishlist({ slug: d.slug, title: d.name, category: 'Destination', region: '', image: d.image || '', description: '' } as any);
  };

  const sendMessage = async (content?: string) => {
    const text = (content || input).trim();
    if (!text || loading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setToolStatus('');

    const ctx = getPageContext();
    const token = getToken();
    const reqBody = JSON.stringify({
      message: text,
      language,
      page: ctx.slug ? `${ctx.page}:${ctx.slug}` : ctx.page,
      conversationHistory: messages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
    });
    const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
    const assistantId = (Date.now() + 1).toString();

    // Cold-start hint: if nothing arrives within 3.5s, show "waking up".
    const wakeTimer = setTimeout(() => setWaking(true), 3500);
    const clearWake = () => { clearTimeout(wakeTimer); setWaking(false); };

    // ── Attempt 1: SSE streaming ──────────────────────────────────────────────
    try {
      const res = await fetch(`${API_BASE}/ai-assistant/chat/stream`, { method: 'POST', headers, credentials: 'include', body: reqBody });
      if (!res.ok || !res.body) throw new Error('no stream');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '', acc = '', placed = false, doneData: any = null, errored = false;

      const ensurePlaceholder = () => {
        if (placed) return;
        placed = true; clearWake(); setLoading(false); setToolStatus('');
        setMessages((prev) => [...prev, { id: assistantId, role: 'assistant', content: '', timestamp: new Date() }]);
      };

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let sep;
        while ((sep = buffer.indexOf('\n\n')) !== -1) {
          const rawEvent = buffer.slice(0, sep);
          buffer = buffer.slice(sep + 2);
          let evt = 'message', dataStr = '';
          for (const line of rawEvent.split('\n')) {
            if (line.startsWith('event:')) evt = line.slice(6).trim();
            else if (line.startsWith('data:')) dataStr += line.slice(5).trim();
          }
          if (!dataStr) continue;
          let payload: any; try { payload = JSON.parse(dataStr); } catch { continue; }
          if (evt === 'token') { ensurePlaceholder(); acc += payload.t || ''; setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, content: acc } : m))); }
          else if (evt === 'tool') { clearWake(); setToolStatus(payload.label || 'Looking that up…'); }
          else if (evt === 'done') doneData = payload;
          else if (evt === 'error') errored = true;
        }
      }
      clearWake();
      if (errored || (!placed && !doneData)) throw new Error('stream failed');
      ensurePlaceholder();
      const finalText = (doneData?.full || acc || '').trim();
      if (!finalText) throw new Error('empty stream');
      setMessages((prev) => prev.map((m) => (m.id === assistantId
        ? { ...m, content: finalText, suggestions: doneData?.suggestions || [], destinations: doneData?.destinations || [] } : m)));
      if (!isOpen) setUnreadCount((c) => c + 1);
      return;
    } catch {
      clearWake();
      setMessages((prev) => prev.filter((m) => !(m.id === assistantId && !m.content)));
    }

    // ── Attempt 2: non-streaming JSON ─────────────────────────────────────────
    try {
      const res = await fetch(`${API_BASE}/ai-assistant/chat`, { method: 'POST', headers, credentials: 'include', body: reqBody });
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      setMessages((prev) => [...prev, {
        id: assistantId, role: 'assistant',
        content: data.message || data.response || "I'm here to help you explore West Bengal! Could you tell me more about what you're looking for?",
        timestamp: new Date(), suggestions: data.suggestions || [], destinations: data.destinations || [],
      }]);
      if (!isOpen) setUnreadCount((c) => c + 1);
    } catch {
      // ── Attempt 3: local fallback ───────────────────────────────────────────
      setMessages((prev) => [...prev, {
        id: assistantId, role: 'assistant', content: getFallbackResponse(text), timestamp: new Date(),
        suggestions: ['Tell me about Darjeeling', 'Best beaches in Bengal', 'Plan a weekend trip'],
      }]);
      if (!isOpen) setUnreadCount((c) => c + 1);
    } finally {
      clearWake(); setLoading(false); setToolStatus('');
    }
  };

  const getFallbackResponse = (query: string): string => {
    const q = query.toLowerCase();
    if (q.includes('darjeeling')) return "**Darjeeling** is a gem! 🏔️\n\n• Best time: March–May & October–November\n• Must-see: Tiger Hill sunrise, Batasia Loop, Happy Valley Tea Estate\n• Stay: 2–3 nights\n• Budget: ₹3,000–₹8,000/person/day\n\nWant a detailed itinerary?";
    if (q.includes('sundarbans')) return "**Sundarbans** — home of the Royal Bengal Tiger! 🐯\n\n• Best time: November–March\n• Must-do: Boat safari, mangrove walk\n• Budget: ₹2,500–₹6,000 for 2 days\n\nShould I plan a tour for you?";
    if (q.includes('festival') || q.includes('durga')) return "**Top Bengal Festivals** 🎉\n\n• **Durga Puja** — October (massive!)\n• **Kali Puja** — October/November\n• **Poush Mela** — December, Shantiniketan\n\nWhich festival interests you?";
    if (q.includes('budget') || q.includes('cheap')) return "**Budget West Bengal Trip** 💰\n\n• Kolkata→Darjeeling: ₹400 train\n• Budget hotels: ₹500–₹1,500/night\n• Meals: ₹100–₹300\n• ~₹8,000–₹12,000 for 5 days\n\nWant a detailed plan?";
    if (q.includes('food') || q.includes('eat')) return "**Must-try Bengali Food** 🍛\n\n• Ilish Maach (Hilsa)\n• Mishti Doi\n• Kathi Rolls\n• Sandesh & Rasgulla\n\nShall I find restaurants near you?";
    return "I'd love to help you explore West Bengal! 🌿 Could you share more details?\n\n• What type of trip?\n• How many days?\n• Budget range?";
  };

  // Global "ask AI" event from other parts of the site.
  const sendMessageRef = useRef(sendMessage);
  sendMessageRef.current = sendMessage;
  useEffect(() => {
    const handler = (e: Event) => {
      const msg = (e as CustomEvent)?.detail?.message;
      setIsOpen(true); setIsMinimized(false); setUnreadCount(0);
      if (msg) setTimeout(() => sendMessageRef.current(String(msg)), 350);
    };
    window.addEventListener('bt:ask-ai', handler as EventListener);
    return () => window.removeEventListener('bt:ask-ai', handler as EventListener);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const resetChat = () => {
    const fresh = [buildWelcome(getPageContext())];
    setMessages(fresh); setInput('');
    try { localStorage.removeItem(THREAD_KEY); } catch { /* ignore */ }
  };

  const copyMessage = (m: Message) => {
    navigator.clipboard?.writeText(m.content).then(() => { setCopiedId(m.id); setTimeout(() => setCopiedId(''), 1500); }).catch(() => {});
  };

  const regenerate = () => {
    // Find the last user message and re-ask it (drop the trailing assistant reply).
    const lastUser = [...messages].reverse().find((m) => m.role === 'user');
    if (!lastUser || loading) return;
    setMessages((prev) => {
      const idx = prev.map((m) => m.id).lastIndexOf(lastUser.id);
      return idx >= 0 ? prev.slice(0, idx) : prev; // remove the user msg + everything after; sendMessage re-adds it
    });
    setTimeout(() => sendMessage(lastUser.content), 60);
  };

  const setFeedback = (id: string, fb: 'up' | 'down') =>
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, feedback: m.feedback === fb ? undefined : fb } : m)));

  // ── Voice input (Web Speech API — free, no key) ────────────────────────────
  const toggleVoice = () => {
    if (!voiceSupported) return;
    if (listening) { recognitionRef.current?.stop(); setListening(false); return; }
    const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = language === 'bn' ? 'bn-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';
    rec.interimResults = false; rec.maxAlternatives = 1;
    rec.onresult = (e: any) => { const t = e.results?.[0]?.[0]?.transcript || ''; if (t) setInput((p) => (p ? p + ' ' : '') + t); };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recognitionRef.current = rec; setListening(true); rec.start();
  };

  const panelClass = expanded
    ? 'fixed inset-3 sm:inset-6 z-50 max-w-3xl mx-auto'
    : `fixed bottom-6 right-6 z-50 ${isMinimized ? 'w-72 h-auto' : 'w-[380px] sm:w-[440px] h-[640px] max-h-[88vh]'}`;

  return (
    <>
      {/* Floating Trigger */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
            onClick={() => { setIsOpen(true); setUnreadCount(0); warm(); }}
            onMouseEnter={warm}
            aria-label="Open AI travel assistant"
            className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-purple-600 to-purple-800 text-white rounded-full shadow-2xl flex items-center justify-center group"
            style={{ boxShadow: '0 8px 32px rgba(124, 58, 237, 0.45)' }}>
            <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}>
              <Sparkles className="w-6 h-6" />
            </motion.div>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">{unreadCount}</span>
            )}
            <span className="absolute inset-0 rounded-full bg-purple-400 animate-ping opacity-20" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Backdrop in expanded mode */}
      <AnimatePresence>
        {isOpen && expanded && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setExpanded(false)} className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" />
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className={`${panelClass} flex flex-col bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden`}
            style={{ boxShadow: '0 25px 50px rgba(0,0,0,0.18), 0 0 0 1px rgba(124,58,237,0.08)' }}>
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-800 px-4 py-3 flex items-center gap-3 shrink-0">
              <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center"><Sparkles className="w-5 h-5 text-white" /></div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-bold text-sm">Bengal Trails Concierge</h3>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-purple-200 text-xs">Online — ask me anything</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={resetChat} title="New chat" className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"><RefreshCw className="w-4 h-4" /></button>
                <button onClick={() => { setExpanded((v) => !v); setIsMinimized(false); }} title={expanded ? 'Exit full screen' : 'Full screen'} className="hidden sm:block p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors">{expanded ? <Minimize className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}</button>
                {!expanded && <button onClick={() => setIsMinimized(!isMinimized)} title="Minimize" className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"><Minimize2 className="w-4 h-4" /></button>}
                <button onClick={() => { setIsOpen(false); setExpanded(false); }} title="Close" className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"><X className="w-4 h-4" /></button>
              </div>
            </div>

            {!isMinimized && (
              <div className="flex-1 flex min-h-0">
               <div className="flex-1 flex flex-col min-h-0">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${msg.role === 'assistant' ? 'bg-purple-600' : 'bg-gray-300'}`}>
                        {msg.role === 'assistant' ? <Sparkles className="w-3.5 h-3.5 text-white" /> : <span className="text-xs font-bold text-gray-600">{user?.name?.[0]?.toUpperCase() || 'U'}</span>}
                      </div>
                      <div className={`flex-1 ${expanded ? 'max-w-[75%]' : 'max-w-[85%]'} ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-2`}>
                        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-purple-600 text-white rounded-tr-sm' : 'bg-white text-gray-800 border border-gray-100 shadow-sm rounded-tl-sm'}`}>
                          {msg.role === 'assistant' ? <MarkdownText text={msg.content} /> : msg.content}
                        </div>

                        {/* Rich destination cards */}
                        {msg.destinations && msg.destinations.length > 0 && (
                          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide w-full">
                            {msg.destinations.map((dest) => (
                              <DestinationCard key={dest.slug} dest={dest} saved={isInWishlist(dest.slug)} onSave={() => wishlistAdd(dest)} />
                            ))}
                          </div>
                        )}

                        {/* Suggestion chips */}
                        {msg.suggestions && msg.suggestions.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {msg.suggestions.map((s) => (
                              <button key={s} onClick={() => sendMessage(s)} className="text-xs bg-white text-gray-600 border border-gray-200 rounded-full px-2.5 py-1 hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50 transition-colors font-medium">{s}</button>
                            ))}
                          </div>
                        )}

                        {/* Message actions (assistant, real replies only) */}
                        {msg.role === 'assistant' && msg.id !== 'welcome' && msg.content && (
                          <div className="flex items-center gap-1 text-gray-400">
                            <button onClick={() => copyMessage(msg)} title="Copy" className="p-1 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors">{copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}</button>
                            <button onClick={regenerate} title="Regenerate" className="p-1 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors"><RefreshCw className="w-3.5 h-3.5" /></button>
                            <button onClick={() => setFeedback(msg.id, 'up')} title="Helpful" className={`p-1 rounded-md transition-colors hover:bg-purple-50 ${msg.feedback === 'up' ? 'text-green-500' : 'hover:text-purple-600'}`}><ThumbsUp className="w-3.5 h-3.5" /></button>
                            <button onClick={() => setFeedback(msg.id, 'down')} title="Not helpful" className={`p-1 rounded-md transition-colors hover:bg-purple-50 ${msg.feedback === 'down' ? 'text-red-500' : 'hover:text-purple-600'}`}><ThumbsDown className="w-3.5 h-3.5" /></button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {loading && (
                    <div className="flex gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center shrink-0 mt-0.5"><Sparkles className="w-3.5 h-3.5 text-white" /></div>
                      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-tl-sm px-1">
                        {waking
                          ? <div className="flex items-center gap-2 px-3 py-2.5 text-xs text-amber-600 font-medium"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Waking up the assistant…</div>
                          : <TypingIndicator status={toolStatus} />}
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick prompts (fresh thread only) */}
                {messages.length <= 1 && (
                  <div className="px-4 pb-2 shrink-0">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Quick explore</p>
                    <div className={`grid gap-1.5 ${expanded ? 'grid-cols-4' : 'grid-cols-2'}`}>
                      {quickPrompts.map((p) => (
                        <button key={p.label} onClick={() => sendMessage(p.prompt)} className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 hover:bg-purple-50 hover:text-purple-700 border border-gray-200 hover:border-purple-200 rounded-xl px-2.5 py-2 transition-all font-medium text-left">
                          <span className="text-purple-500 shrink-0">{p.icon}</span>{p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input */}
                <div className="border-t border-gray-100 px-4 py-3 bg-white shrink-0">
                  <div className="flex items-end gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-3 py-2 focus-within:border-purple-300 focus-within:ring-2 focus-within:ring-purple-100 transition-all">
                    {voiceSupported && (
                      <button onClick={toggleVoice} aria-label="Voice input" className={`shrink-0 w-8 h-8 flex items-center justify-center rounded-xl transition-all ${listening ? 'bg-red-500 text-white animate-pulse' : 'text-gray-400 hover:text-purple-600 hover:bg-purple-50'}`}>
                        <Mic className="w-4 h-4" />
                      </button>
                    )}
                    <textarea ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} onFocus={warm}
                      placeholder={listening ? 'Listening…' : 'Ask about destinations, food, festivals…'} rows={1}
                      className="flex-1 text-sm text-gray-800 placeholder-gray-400 bg-transparent outline-none resize-none leading-relaxed" style={{ maxHeight: '80px' }} />
                    <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
                      className="shrink-0 w-8 h-8 flex items-center justify-center bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"><Send className="w-4 h-4" /></button>
                  </div>
                  <p className="text-xs text-gray-400 text-center mt-1.5">Grounded in real Bengal Trails data · never invented</p>
                </div>
               </div>

               {/* Trip-in-progress rail (full-screen only) */}
               {expanded && tripDests.length > 0 && (
                 <aside className="hidden lg:flex w-64 flex-col border-l border-gray-100 bg-gray-50/60 shrink-0">
                   <div className="px-4 py-3 border-b border-gray-100">
                     <h4 className="font-poppins text-sm font-semibold text-slate-900 flex items-center gap-1.5"><MapPin className="w-4 h-4 text-purple-600" /> Trip in progress</h4>
                     <p className="text-xs text-gray-400 mt-0.5">{tripDests.length} place{tripDests.length !== 1 ? 's' : ''} the AI suggested</p>
                   </div>
                   <div className="flex-1 overflow-y-auto p-3 space-y-2">
                     {tripDests.map((d) => (
                       <div key={d.slug} className="group flex items-center gap-2 bg-white border border-gray-100 rounded-xl p-1.5 pr-2">
                         <a href={`/explore/${d.slug}`} className="flex items-center gap-2 flex-1 min-w-0">
                           <div className="w-9 h-9 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                             {d.image ? <ImageWithFallback src={d.image} alt={d.name} optimizeWidth={120} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-purple-200"><MapPin className="w-4 h-4" /></div>}
                           </div>
                           <span className="font-poppins text-xs font-medium text-slate-800 truncate">{d.name}</span>
                         </a>
                         <button onClick={() => setRemovedSlugs((prev) => new Set(prev).add(d.slug))} aria-label={`Remove ${d.name}`}
                           className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all shrink-0"><X className="w-3.5 h-3.5" /></button>
                       </div>
                     ))}
                   </div>
                   <div className="p-3 border-t border-gray-100">
                     <button onClick={saveTripFromAI} disabled={savingTrip}
                       className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white py-2.5 rounded-xl font-poppins text-sm font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors">
                       {savingTrip ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
                       {savingTrip ? 'Saving…' : 'Save to My Trips'}
                     </button>
                   </div>
                 </aside>
               )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
