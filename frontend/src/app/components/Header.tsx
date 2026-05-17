import { Menu, Heart, User, LogOut, Shield, Users, Search, X, MapPin, ChevronDown, Globe } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { NotificationSystem } from './NotificationSystem';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet';

function HeaderSearch() {
  const [q, setQ] = useState('');
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) window.location.hash = `#/explore?q=${encodeURIComponent(q.trim())}`;
  };
  return (
    <form onSubmit={onSubmit}
      className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-3.5 py-2 w-full focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-100 transition-all">
      <Search className="w-4 h-4 text-gray-400 shrink-0" />
      <input type="text" value={q} onChange={e => setQ(e.target.value)}
        placeholder="Search destinations, festivals, food…"
        className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none min-w-0" />
      {q && <button type="button" onClick={() => setQ('')}><X className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600" /></button>}
    </form>
  );
}

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const { user, signOut, isAdmin } = useAuth();
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = () => {
      setScrolled(window.scrollY > 10);
      setSearchVisible(window.scrollY > 280);
    };
    window.addEventListener('scroll', fn, { passive: true });
    fn();
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const signOutUser = async () => { await signOut(); setUserMenuOpen(false); window.location.hash = '#/'; };

  const nav = [
    { label: 'Home', href: '#/' },
    { label: 'Explore', href: '#/explore' },
    { label: 'Festivals', href: '#/festivals' },
    { label: 'Food Guide', href: '#/food' },
    { label: 'Community', href: '#/community' },
    { label: 'Plan Trip', href: '#/planner' },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 bg-white transition-all duration-200 ${scrolled ? "border-b border-gray-200 shadow-md" : "border-b border-gray-100"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 gap-4">

          {/* ── Logo: text only, no icon ── */}
          <a href="#/" className="shrink-0 flex items-center">
            <span
              className="text-2xl font-black tracking-tight"
              style={{ fontFamily: 'Poppins, system-ui, sans-serif', letterSpacing: '-0.5px' }}
            >
              <span className="text-gray-900">Bengal</span>
              <span className="text-purple-600"> Trails</span>
            </span>
          </a>

          {/* ── Centre: search bar slides in on scroll ── */}
          <div className="flex-1 max-w-sm hidden md:block">
            <AnimatePresence>
              {searchVisible && (
                <motion.div
                  key="hs"
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                >
                  <HeaderSearch />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Desktop nav ── */}
          <nav className="hidden lg:flex items-center gap-0.5 shrink-0">
            {nav.slice(0, 5).map(l => (
              <a key={l.label} href={l.href}
                className="px-3 py-2 text-[13.5px] font-semibold text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all whitespace-nowrap"
                style={{ fontFamily: 'Poppins, system-ui, sans-serif' }}>
                {l.label}
              </a>
            ))}
          </nav>

          {/* ── Right actions ── */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden md:block"><NotificationSystem /></div>

            {user ? (
              <div className="relative hidden md:block" ref={userRef}>
                <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-2.5 py-1.5 border border-gray-200 rounded-full text-sm font-semibold text-gray-700 hover:border-purple-300 hover:bg-purple-50 transition-all"
                  style={{ fontFamily: 'Poppins, system-ui, sans-serif' }}>
                  <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold">
                    {user.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="hidden lg:inline max-w-[72px] truncate">{user.name?.split(' ')[0]}</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-50" />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.97 }}
                      transition={{ duration: 0.14 }}
                      className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden z-50"
                    >
                      <div className="px-4 py-3 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-100">
                        <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      {[
                        { href: '#/profile', icon: <User className="w-4 h-4" />, label: 'My Profile' },
                        { href: '#/wishlist', icon: <Heart className="w-4 h-4" />, label: 'Wishlist' },
                        { href: '#/planner', icon: <MapPin className="w-4 h-4" />, label: 'Plan a Trip' },
                        { href: '#/community', icon: <Users className="w-4 h-4" />, label: 'Community' },
                      ].map(item => (
                        <a key={item.label} href={item.href} onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors">
                          <span className="text-purple-400">{item.icon}</span>{item.label}
                        </a>
                      ))}
                      {isAdmin && (
                        <a href="#/admin" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border-t border-gray-100">
                          <Shield className="w-4 h-4" /> Admin Dashboard
                        </a>
                      )}
                      <button onClick={signOutUser}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 w-full text-left border-t border-gray-100 transition-colors">
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <a href="#/signin"
                className="hidden md:inline text-[13px] font-semibold text-gray-700 hover:text-purple-600 px-3 py-1.5 rounded-full hover:bg-purple-50 transition-all"
                style={{ fontFamily: 'Poppins, system-ui, sans-serif' }}>
                Sign In
              </a>
            )}

            <a href="#/planner"
              className="hidden sm:inline-flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-[13px] font-bold px-4 py-2 rounded-full transition-all hover:shadow-md"
              style={{ fontFamily: 'Poppins, system-ui, sans-serif' }}>
              <MapPin className="w-3.5 h-3.5" />
              Plan Trip
            </a>

            {/* Mobile hamburger */}
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <button className="lg:hidden p-2 rounded-full text-gray-700 hover:bg-gray-100 transition-colors" aria-label="Menu">
                  <Menu className="w-5 h-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[85vw] sm:w-80 bg-white border-gray-100 overflow-y-auto">
                <SheetTitle className="text-gray-900 font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Bengal <span className="text-purple-600">Trails</span>
                </SheetTitle>
                <SheetDescription className="sr-only">Navigation menu</SheetDescription>

                <div className="mt-4 mb-5"><HeaderSearch /></div>

                {user && (
                  <div className="mb-4 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-3 px-3 py-3 bg-purple-50 rounded-xl mb-2">
                      <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-lg">
                        {user.name?.[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                    </div>
                    {isAdmin && (
                      <a href="#/admin" onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-purple-700 bg-purple-50 rounded-lg hover:bg-purple-100">
                        <Shield className="w-4 h-4" /> Admin Dashboard
                      </a>
                    )}
                  </div>
                )}

                <nav className="flex flex-col gap-0.5">
                  {nav.map(l => (
                    <a key={l.label} href={l.href} onClick={() => setMenuOpen(false)}
                      className="px-3 py-2.5 text-sm font-semibold text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {l.label}
                    </a>
                  ))}
                  {user && (
                    <>
                      <div className="mt-3 mb-1 px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Account</div>
                      <a href="#/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg"><User className="w-4 h-4" /> My Profile</a>
                      <a href="#/wishlist" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg"><Heart className="w-4 h-4" /> Wishlist</a>
                    </>
                  )}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    {!user ? (
                      <a href="#/signin" onClick={() => setMenuOpen(false)}
                        className="block w-full text-center bg-purple-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-purple-700"
                        style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Sign In
                      </a>
                    ) : (
                      <button onClick={() => { signOutUser(); setMenuOpen(false); }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg font-medium">
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    )}
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
