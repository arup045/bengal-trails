import { Menu, Heart, User, LogOut, Shield, Users, Search, X, MapPin, ChevronDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { NotificationSystem } from './NotificationSystem';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet';

// ─── Purple Bengal Trails Logo ─────────────────────────────────────────────────
function BengalTrailsLogo({ scrolled }: { scrolled: boolean }) {
  return (
    <a href="#/" className="flex items-center gap-2.5 group cursor-pointer shrink-0">
      <div className="relative w-10 h-10">
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
          <circle cx="20" cy="20" r="19" fill="#7C3AED" opacity="0.12" />
          <path d="M13 10 C13 10 13 30 13 30" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round"/>
          <path d="M13 10 C13 10 23 10 23 15 C23 20 13 20 13 20" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          <path d="M13 20 C13 20 25 20 25 25 C25 30 13 30 13 30" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          <path d="M22 8 C22 8 28 6 29 12 C29 12 23 13 22 8 Z" fill="#7C3AED" opacity="0.8"/>
          <path d="M22 8 L26.5 11" stroke="#7C3AED" strokeWidth="1" strokeLinecap="round" opacity="0.6"/>
        </svg>
      </div>
      <span className={`text-xl sm:text-2xl tracking-tight font-extrabold transition-colors duration-300 ${scrolled ? 'text-gray-900' : 'text-white'}`} style={{ fontFamily: 'Poppins, sans-serif' }}>
        Bengal <span className="text-purple-400">Trails</span>
      </span>
    </a>
  );
}

// ─── Compact Header Search ─────────────────────────────────────────────────────
function HeaderSearchBar() {
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) window.location.hash = `#/explore?q=${encodeURIComponent(query.trim())}`;
  };

  return (
    <form onSubmit={handleSearch} className="flex items-center bg-white border border-gray-200 rounded-full shadow-md hover:shadow-lg transition-shadow duration-200 px-4 py-2 gap-2 w-full">
      <Search className="w-4 h-4 text-purple-500 shrink-0" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search destinations, festivals, food…"
        className="flex-1 text-sm text-gray-800 placeholder-gray-400 bg-transparent outline-none min-w-0"
      />
      {query && (
        <button type="button" onClick={() => setQuery('')}>
          <X className="w-3.5 h-3.5 text-gray-400 hover:text-gray-700" />
        </button>
      )}
      <button type="submit" className="shrink-0 bg-purple-600 text-white rounded-full px-3 py-1 text-xs font-bold hover:bg-purple-700 transition-colors">
        Search
      </button>
    </form>
  );
}

// ─── Main Header ───────────────────────────────────────────────────────────────
export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const { user, signOut, isAdmin } = useAuth();
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 50);
      setSearchVisible(y > 300);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
    window.location.hash = '#/';
  };

  const navLinks = [
    { label: 'Home', href: '#/' },
    { label: 'Explore', href: '#/explore' },
    { label: 'Festivals', href: '#/festivals' },
    { label: 'Food Guide', href: '#/food' },
    { label: 'Community', href: '#/community' },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${scrolled ? 'bg-white/98 backdrop-blur-md shadow-md py-2' : 'bg-transparent py-4'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between gap-3 lg:gap-6">

          <BengalTrailsLogo scrolled={scrolled} />

          {/* Animated search (center) */}
          <div className="flex-1 max-w-xl hidden md:block">
            <AnimatePresence>
              {searchVisible && (
                <motion.div
                  key="header-search"
                  initial={{ opacity: 0, y: -12, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -12, scale: 0.96 }}
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                >
                  <HeaderSearchBar />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-0.5 shrink-0">
            {navLinks.map((link) => (
              <a key={link.label} href={link.href}
                className={`px-3 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${scrolled ? 'text-gray-700 hover:text-purple-600 hover:bg-purple-50' : 'text-white/90 hover:text-white hover:bg-white/10'}`}>
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="hidden md:flex items-center gap-2">
              <LanguageSwitcher />
              <NotificationSystem />
            </div>

            {user ? (
              <div className="relative hidden md:block" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-200 ${scrolled ? 'border-gray-200 text-gray-700 hover:border-purple-300 bg-white' : 'border-white/30 text-white hover:bg-white/10'}`}
                >
                  <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {user.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm font-semibold hidden lg:inline max-w-[80px] truncate">{user.name?.split(' ')[0]}</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-60 bg-white border border-gray-100 shadow-2xl rounded-2xl z-50 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50">
                        <p className="text-sm font-bold text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      {[
                        { href: '#/profile', icon: <User className="w-4 h-4" />, label: 'My Profile' },
                        { href: '#/wishlist', icon: <Heart className="w-4 h-4" />, label: 'Wishlist' },
                        { href: '#/community', icon: <Users className="w-4 h-4" />, label: 'Community' },
                      ].map((item) => (
                        <a key={item.label} href={item.href} onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors">
                          <span className="text-purple-400">{item.icon}</span>
                          {item.label}
                        </a>
                      ))}
                      {isAdmin && (
                        <a href="#/admin" onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-purple-700 bg-purple-50 hover:bg-purple-100 font-bold">
                          <Shield className="w-4 h-4" /> Admin Dashboard
                        </a>
                      )}
                      <button onClick={handleSignOut}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 w-full text-left border-t border-gray-100 transition-colors">
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <a href="#/signin"
                className={`hidden md:inline text-sm font-bold px-3 py-1.5 rounded-full transition-all duration-200 ${scrolled ? 'text-gray-700 hover:text-purple-600' : 'text-white/90 hover:text-white'}`}>
                Sign In
              </a>
            )}

            <a href="#/planner"
              className={`hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 ${scrolled ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-md' : 'bg-white text-purple-700 hover:bg-white/90 shadow-lg'}`}>
              <MapPin className="w-3.5 h-3.5" />
              Plan Trip
            </a>

            {/* Mobile menu */}
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <button
                  className={`lg:hidden p-2 -mr-2 rounded-full transition-colors ${scrolled ? 'text-gray-800 hover:bg-gray-100' : 'text-white hover:bg-white/10'}`}
                  aria-label="Open menu"
                >
                  <Menu className="w-6 h-6" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-white w-[85vw] sm:w-96 overflow-y-auto border-gray-100">
                <SheetTitle className="text-gray-900 font-bold">Menu</SheetTitle>
                <SheetDescription className="sr-only">Navigate</SheetDescription>
                <div className="mt-4 mb-4"><HeaderSearchBar /></div>

                {user && (
                  <div className="pb-4 mb-4 border-b border-gray-100">
                    <div className="flex items-center gap-3 px-3 py-3 bg-purple-50 rounded-xl mb-2">
                      <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                        {user.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                    </div>
                    {isAdmin && (
                      <a href="#/admin" onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-2 text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-2 rounded-lg font-bold text-sm">
                        <Shield className="w-4 h-4" /> Admin Dashboard
                      </a>
                    )}
                  </div>
                )}

                <nav className="flex flex-col gap-0.5">
                  {navLinks.map((link) => (
                    <a key={link.label} href={link.href} onClick={() => setIsMenuOpen(false)}
                      className="text-gray-700 hover:text-purple-600 hover:bg-purple-50 px-3 py-2.5 rounded-lg font-semibold text-sm transition-colors">
                      {link.label}
                    </a>
                  ))}
                  <div className="mt-3 mb-1 px-3 text-xs font-bold text-gray-400 uppercase tracking-widest">My Account</div>
                  <a href="#/profile" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 text-gray-700 hover:text-purple-600 hover:bg-purple-50 px-3 py-2.5 rounded-lg text-sm"><User className="w-4 h-4" /> My Profile</a>
                  <a href="#/wishlist" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 text-gray-700 hover:text-purple-600 hover:bg-purple-50 px-3 py-2.5 rounded-lg text-sm"><Heart className="w-4 h-4" /> Wishlist</a>
                  <a href="#/planner" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 text-gray-700 hover:text-purple-600 hover:bg-purple-50 px-3 py-2.5 rounded-lg text-sm"><MapPin className="w-4 h-4" /> Plan a Trip</a>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    {!user ? (
                      <a href="#/signin" onClick={() => setIsMenuOpen(false)}
                        className="block w-full text-center bg-purple-600 text-white px-4 py-3 rounded-xl font-bold text-sm hover:bg-purple-700">
                        Sign In
                      </a>
                    ) : (
                      <button onClick={() => { handleSignOut(); setIsMenuOpen(false); }}
                        className="flex items-center gap-2 text-red-500 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg w-full text-left text-sm font-medium">
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
