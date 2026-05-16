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

// ── Mini search bar that slides into the header on scroll ──────────────────────
function HeaderSearchBar() {
  const [query, setQuery] = useState('');
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) window.location.hash = `#/explore?q=${encodeURIComponent(query.trim())}`;
  };
  return (
    <form onSubmit={handleSearch}
      className="flex items-center bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5 gap-2 w-full hover:border-purple-300 focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-100 transition-all">
      <Search className="w-4 h-4 text-purple-500 shrink-0" />
      <input type="text" value={query} onChange={e => setQuery(e.target.value)}
        placeholder="Search destinations, festivals…"
        className="flex-1 text-sm text-gray-800 placeholder-gray-400 bg-transparent outline-none min-w-0" />
      {query && (
        <button type="button" onClick={() => setQuery('')}>
          <X className="w-3.5 h-3.5 text-gray-400 hover:text-gray-700" />
        </button>
      )}
    </form>
  );
}

// ── Logo ───────────────────────────────────────────────────────────────────────
function Logo() {
  return (
    <a href="#/" className="flex items-center gap-2 group cursor-pointer shrink-0">
      <motion.div className="w-9 h-9 rounded-xl flex items-center justify-center"
        whileHover={{ rotate: 5, scale: 1.1 }} transition={{ duration: 0.2 }}>
        <svg width="36" height="36" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="16" r="10" stroke="#7C3AED" strokeWidth="0.8" opacity="0.4" fill="none"/>
          <circle cx="32" cy="16" r="12" stroke="#7C3AED" strokeWidth="0.6" opacity="0.3" fill="none"/>
          <circle cx="16" cy="32" r="10" stroke="#7C3AED" strokeWidth="0.8" opacity="0.4" fill="none"/>
          <circle cx="16" cy="32" r="12" stroke="#7C3AED" strokeWidth="0.6" opacity="0.3" fill="none"/>
          <path d="M 32 11 C 28 11 25 14 25 18 C 25 22 28 25 32 25 C 36 25 39 22 39 18 C 39 14 36 11 32 11 Z M 32 14 C 34 14 36 16 36 18 C 36 20 34 22 32 22 C 30 22 28 20 28 18 C 28 16 30 14 32 14 Z" fill="#7C3AED"/>
          <path d="M 22 20 C 20 22 18 24 16 26 C 14 28 12 30 11 32 C 10 34 10 36 11 37 C 12 39 14 40 17 40 C 20 40 22 39 24 37 L 26 35 C 26 35 25 34 24 33 C 23 32 22 31 22 30 C 22 29 23 28 24 27 L 28 23 C 29 22 30 21 30 20 C 30 19 29 18 28 18 C 27 17 26 17 25 18 L 22 20 Z M 16 30 C 18 30 20 32 20 34 C 20 36 18 38 16 38 C 14 38 12 36 12 34 C 12 32 14 30 16 30 Z" fill="#7C3AED"/>
        </svg>
      </motion.div>
      <span className="text-xl sm:text-2xl tracking-tight text-gray-900" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800 }}>
        Bengal <span className="text-purple-600">Trails</span>
      </span>
    </a>
  );
}

// ── Main Header ────────────────────────────────────────────────────────────────
export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const { user, signOut, isAdmin } = useAuth();
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Show search bar in header after user scrolls 300px
  useEffect(() => {
    const onScroll = () => setShowSearch(window.scrollY > 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close user dropdown on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node))
        setShowUserMenu(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
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
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-3 lg:gap-4">

          {/* Logo */}
          <Logo />

          {/* ── Sticky animated search bar (slides in on scroll) ── */}
          <div className="flex-1 max-w-md hidden md:block">
            <AnimatePresence>
              {showSearch && (
                <motion.div
                  key="hdr-search"
                  initial={{ opacity: 0, y: -10, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.97 }}
                  transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                >
                  <HeaderSearchBar />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Desktop Nav ── */}
          <nav className="hidden lg:flex items-center gap-1 shrink-0">
            {navLinks.map(link => (
              <a key={link.label} href={link.href}
                className="px-3 py-2 text-sm font-semibold text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-150">
                {link.label}
              </a>
            ))}
          </nav>

          {/* ── Right Actions ── */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden md:flex items-center gap-1">
              <LanguageSwitcher />
              <NotificationSystem />
            </div>

            {/* User dropdown */}
            {user ? (
              <div className="relative hidden md:block" ref={userMenuRef}>
                <button onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-2.5 py-1.5 border border-gray-200 rounded-full text-gray-700 hover:border-purple-300 hover:text-purple-600 bg-white transition-all text-sm">
                  <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {user.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="font-medium hidden lg:inline max-w-[80px] truncate">{user.name?.split(' ')[0]}</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 shadow-xl rounded-2xl z-50 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50">
                        <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      {[
                        { href: '#/profile', icon: <User className="w-4 h-4" />, label: 'My Profile' },
                        { href: '#/wishlist', icon: <Heart className="w-4 h-4" />, label: 'Wishlist' },
                        { href: '#/community', icon: <Users className="w-4 h-4" />, label: 'Community' },
                      ].map(item => (
                        <a key={item.label} href={item.href} onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors">
                          <span className="text-purple-400">{item.icon}</span>{item.label}
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
                className="hidden md:inline text-sm font-semibold text-gray-700 px-3 py-1.5 hover:text-purple-600 transition-colors">
                Sign In
              </a>
            )}

            {/* Plan Trip CTA */}
            <a href="#/planner"
              className="hidden sm:inline-flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2 rounded-full text-sm font-bold hover:shadow-lg hover:shadow-purple-300/50 transition-all duration-200">
              <MapPin className="w-3.5 h-3.5" />
              Plan Trip
            </a>

            {/* Mobile menu */}
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <button className="lg:hidden p-2 -mr-1 text-gray-700 hover:bg-gray-100 rounded-full" aria-label="Open menu">
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
                  {navLinks.map(link => (
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
