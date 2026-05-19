import { API_BASE } from '../utils/api';
import React, { useState, useEffect, useRef } from 'react';
import {
  Send, Bot, Sparkles, MapPin, Calendar, DollarSign, X,
  Minimize2, Maximize2, ChevronDown, Mic, RefreshCw, Star,
  Utensils, Camera, Waves, Mountain, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { sanitizeInline } from '../utils/sanitize';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  destinations?: { name: string; slug: string; image?: string; price?: number }[];
}

const QUICK_PROMPTS = [
  { icon: <Mountain className="w-3.5 h-3.5" />, label: 'Hill stations', prompt: 'Best hill stations in West Bengal' },
  { icon: <Waves className="w-3.5 h-3.5" />, label: 'Beaches', prompt: 'Beach destinations in West Bengal' },
  { icon: <Calendar className="w-3.5 h-3.5" />, label: 'Festivals', prompt: 'Upcoming festivals in West Bengal' },
  { icon: <Utensils className="w-3.5 h-3.5" />, label: 'Food spots', prompt: 'Must-try Bengali food and restaurants' },
  { icon: <DollarSign className="w-3.5 h-3.5" />, label: 'Budget trip', prompt: 'Plan a budget-friendly trip to West Bengal under ₹5000' },
  { icon: <Camera className="w-3.5 h-3.5" />, label: 'Photography', prompt: 'Best photography spots in West Bengal' },
];

const WELCOME_MESSAGE: Message = {
  id: '1',
  role: 'assistant',
  content: "Hello! I'm your **Bengal Trails AI Assistant** 🌿\n\nI can help you:\n• Discover hidden gems in West Bengal\n• Plan personalised itineraries\n• Find festivals & cultural events\n• Recommend authentic Bengali food\n• Estimate travel budgets\n\nWhat kind of trip are you dreaming of?",
  timestamp: new Date(),
  suggestions: ['Weekend getaway from Kolkata', 'Best time to visit Darjeeling', 'Family trip under ₹10,000', '3-day Sundarbans tour'],
};

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 bg-purple-400 rounded-full"
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

function MarkdownText({ text }: { text: string }) {
  // SECURITY: `text` is AI-generated output and could contain prompt-injected
  // HTML. We escape first, then apply our markdown-lite transforms, then
  // sanitize through DOMPurify as a final belt-and-braces pass.
  const escapeHtml = (s: string) =>
    s.replace(/&/g, '&amp;')
     .replace(/</g, '&lt;')
     .replace(/>/g, '&gt;')
     .replace(/"/g, '&quot;')
     .replace(/'/g, '&#39;');

  const escaped = escapeHtml(text);
  const formatted = escaped
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^• (.+)$/gm, '<li>$1</li>')
    .split('\n')
    .map((line) => {
      if (line.startsWith('<li>')) return line;
      return `<p>${line}</p>`;
    })
    .join('');

  return (
    <div
      className="prose-sm text-sm leading-relaxed space-y-1"
      dangerouslySetInnerHTML={{ __html: sanitizeInline(formatted) }}
    />
  );
}

export const AITravelAssistant: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (content?: string) => {
    const text = (content || input).trim();
    if (!text || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/ai-assistant/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          language,
          userId: user?.id,
          conversationHistory: messages.slice(-6).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const assistantMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.message || data.response || "I'm here to help you explore West Bengal! Could you tell me more about what you're looking for?",
          timestamp: new Date(),
          suggestions: data.suggestions || [],
          destinations: data.destinations || [],
        };
        setMessages((prev) => [...prev, assistantMsg]);
        if (!isOpen) setUnreadCount((c) => c + 1);
      } else {
        throw new Error('API error');
      }
    } catch {
      // Fallback: intelligent local response
      const fallbackMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: getFallbackResponse(text),
        timestamp: new Date(),
        suggestions: ['Tell me about Darjeeling', 'Best beaches in Bengal', 'Plan a weekend trip'],
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      if (!isOpen) setUnreadCount((c) => c + 1);
    } finally {
      setLoading(false);
    }
  };

  const getFallbackResponse = (query: string): string => {
    const q = query.toLowerCase();
    if (q.includes('darjeeling')) return "**Darjeeling** is a gem! 🏔️\n\n• Best time: March–May & October–November\n• Must-see: Tiger Hill sunrise, Batasia Loop, Happy Valley Tea Estate\n• Stay: 2–3 nights\n• Budget: ₹3,000–₹8,000/person/day\n\nWant a detailed itinerary?";
    if (q.includes('sundarbans')) return "**Sundarbans** — home of the Royal Bengal Tiger! 🐯\n\n• Best time: November–March\n• Must-do: Boat safari, mangrove walk\n• Entry: Via Gosaba/Sajnekhali\n• Budget: ₹2,500–₹6,000 for 2 days\n\nShould I plan a tour for you?";
    if (q.includes('festival') || q.includes('durga')) return "**Top Bengal Festivals** 🎉\n\n• **Durga Puja** — October (massive!)\n• **Diwali (Kali Puja)** — October/November\n• **Poush Mela** — December, Shantiniketan\n• **Rath Yatra** — July, Mahesh\n\nWhich festival interests you?";
    if (q.includes('budget') || q.includes('cheap')) return "**Budget West Bengal Trip** 💰\n\n• Kolkata to Darjeeling: ₹400 train\n• Budget hotels: ₹500–₹1,500/night\n• Meals: ₹100–₹300 per person\n• Suggested: 5 days for ₹8,000–₹12,000\n\nWant a detailed budget plan?";
    if (q.includes('food') || q.includes('eat')) return "**Must-try Bengali Food** 🍛\n\n• Ilish Maach (Hilsa fish curry)\n• Mishti Doi (sweet yogurt)\n• Kathi Rolls (Kolkata special)\n• Sandesh & Rasgolla (sweets)\n• Macher Jhol (fish curry)\n\nShall I find restaurants near you?";
    return "I'd love to help you explore West Bengal! 🌿 Could you share more details?\n\n• What type of trip? (adventure/cultural/relaxation)\n• How many days?\n• Budget range?\n• Travelling with family/friends/solo?";
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const resetChat = () => {
    setMessages([WELCOME_MESSAGE]);
    setInput('');
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => { setIsOpen(true); setUnreadCount(0); }}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-purple-600 to-purple-800 text-white rounded-full shadow-2xl hover:shadow-purple-500/40 flex items-center justify-center group"
            style={{ boxShadow: '0 8px 32px rgba(124, 58, 237, 0.45)' }}
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
            >
              <Sparkles className="w-6 h-6" />
            </motion.div>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
            {/* Pulse ring */}
            <span className="absolute inset-0 rounded-full bg-purple-400 animate-ping opacity-20" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`fixed bottom-6 right-6 z-50 flex flex-col bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden transition-all duration-300 ${
              isMinimized ? 'w-72 h-auto' : 'w-[380px] sm:w-[420px] h-[620px] max-h-[90vh]'
            }`}
            style={{ boxShadow: '0 25px 50px rgba(0,0,0,0.15), 0 0 0 1px rgba(124,58,237,0.08)' }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-800 px-4 py-3 flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-bold text-sm">Bengal Trails AI</h3>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-purple-200 text-xs">Online — ask me anything</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={resetChat} title="New chat" className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button onClick={() => setIsMinimized(!isMinimized)} className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>
                <button onClick={() => setIsOpen(false)} className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      {/* Avatar */}
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${msg.role === 'assistant' ? 'bg-purple-600' : 'bg-gray-300'}`}>
                        {msg.role === 'assistant' ? (
                          <Sparkles className="w-3.5 h-3.5 text-white" />
                        ) : (
                          <span className="text-xs font-bold text-gray-600">{user?.name?.[0]?.toUpperCase() || 'U'}</span>
                        )}
                      </div>

                      <div className={`flex-1 max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-2`}>
                        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-purple-600 text-white rounded-tr-sm'
                            : 'bg-white text-gray-800 border border-gray-100 shadow-sm rounded-tl-sm'
                        }`}>
                          {msg.role === 'assistant' ? <MarkdownText text={msg.content} /> : msg.content}
                        </div>

                        {/* Destination chips */}
                        {msg.destinations && msg.destinations.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {msg.destinations.map((dest) => (
                              <a key={dest.slug} href={`#/explore/${dest.slug}`}
                                className="flex items-center gap-1 text-xs bg-purple-50 text-purple-700 border border-purple-200 rounded-full px-2.5 py-1 hover:bg-purple-100 transition-colors font-medium">
                                <MapPin className="w-3 h-3" /> {dest.name}
                              </a>
                            ))}
                          </div>
                        )}

                        {/* Suggestion chips */}
                        {msg.suggestions && msg.suggestions.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {msg.suggestions.map((s) => (
                              <button key={s} onClick={() => sendMessage(s)}
                                className="text-xs bg-white text-gray-600 border border-gray-200 rounded-full px-2.5 py-1 hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50 transition-colors font-medium">
                                {s}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {loading && (
                    <div className="flex gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Sparkles className="w-3.5 h-3.5 text-white" />
                      </div>
                      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-tl-sm px-1">
                        <TypingIndicator />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick prompts (only if single welcome message) */}
                {messages.length === 1 && (
                  <div className="px-4 pb-2">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Quick explore</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {QUICK_PROMPTS.map((p) => (
                        <button key={p.label} onClick={() => sendMessage(p.prompt)}
                          className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 hover:bg-purple-50 hover:text-purple-700 border border-gray-200 hover:border-purple-200 rounded-xl px-2.5 py-2 transition-all font-medium text-left">
                          <span className="text-purple-500 shrink-0">{p.icon}</span>
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input area */}
                <div className="border-t border-gray-100 px-4 py-3 bg-white">
                  <div className="flex items-end gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-3 py-2 focus-within:border-purple-300 focus-within:ring-2 focus-within:ring-purple-100 transition-all">
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask about destinations, food, festivals…"
                      rows={1}
                      className="flex-1 text-sm text-gray-800 placeholder-gray-400 bg-transparent outline-none resize-none leading-relaxed"
                      style={{ maxHeight: '80px' }}
                    />
                    <button
                      onClick={() => sendMessage()}
                      disabled={!input.trim() || loading}
                      className="shrink-0 w-8 h-8 flex items-center justify-center bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 text-center mt-1.5">Powered by Bengal Trails AI</p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
