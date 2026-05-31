import { Menu, Heart, User, LogOut, Shield, Users, MapPin, ChevronDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { SmartSearchBar } from './SmartSearchBar';
import { NotificationSystem } from './NotificationSystem';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet';



interface NavItem { label: string; href: string; tKey?: string; }
const NAV_ITEMS: NavItem[] = [
  { label: 'Home',      href: '/',          tKey: 'nav.home'      },
  { label: 'Explore',   href: '/explore',   tKey: 'nav.explore'   },
  { label: 'Festivals', href: '/festivals', tKey: 'nav.festivals' },
  { label: 'Food',      href: '/food',      tKey: 'nav.food'      },
  { label: 'About Us',  href: '/about',     tKey: 'nav.about'     },
];

export function Header() {
  const [menuOpen,      setMenuOpen]      = useState(false);
  const [userMenuOpen,  setUserMenuOpen]  = useState(false);
  const [scrolled,      setScrolled]      = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const { user, signOut, isAdmin } = useAuth();
  const { t } = useLanguage();
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = () => { setScrolled(window.scrollY > 10); setSearchVisible(window.scrollY > 300); };
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

  const handleSignOut = async () => { await signOut(); setUserMenuOpen(false); window.location.hash = '#/'; };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md transition-all duration-300 ${scrolled ? 'border-b border-gray-200/80 shadow-sm' : 'border-b border-gray-100'}`}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex items-center justify-between h-16 gap-6">

          {/* LOGO — Poppins 600 / 32px / tracking-normal */}
          <a href="/" className="shrink-0 flex items-center select-none" aria-label="Bengal Trails home">
            <span className="font-poppins text-[32px] font-semibold tracking-normal leading-none">
              <span className="text-slate-900">Bengal</span>
              <span className="text-purple-600"> Trails</span>
            </span>
          </a>

          {/* Scrolled search */}
          <div className="flex-1 max-w-xs hidden md:block">
            <AnimatePresence>
              {searchVisible && (
                <motion.div key="hs"
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0,  scale: 1    }}
                  exit={{    opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}>
                  <SmartSearchBar
                  size="sm"
                  placeholder="Destinations, festivals, food..."
                  onSelect={(result) => {
                    if (result.type === 'query') {
                      window.location.hash = `/explore?q=${encodeURIComponent((result as any).query)}`;
                    } else {
                      const url = (result as any).url as string;
                      if (url) window.location.hash = url.startsWith('#') ? url.slice(1) : url;
                    }
                  }}
                />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* NAV LINKS — Poppins 500 / 14px / slate-800 / pill hover */}
          <nav className="hidden lg:flex items-center gap-0.5 shrink-0">
            {NAV_ITEMS.map(({ label, href, tKey }) => (
              <a key={label} href={href}
                className="font-poppins text-sm font-medium text-slate-800 px-3.5 py-2 rounded-full hover:bg-gray-100 hover:text-slate-900 transition-colors duration-150 whitespace-nowrap">
                {tKey ? t(tKey) : label}
              </a>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden md:block"><LanguageSwitcher /></div>
            <div className="hidden md:block"><NotificationSystem /></div>

            {/* Sign In (logged out) */}
            {!user && (
              <a href="/signin"
                className="hidden md:inline-block font-poppins text-sm font-medium text-slate-700 px-3.5 py-2 rounded-full hover:bg-gray-100 hover:text-slate-900 transition-colors duration-150">
                Sign In
              </a>
            )}

            {/* User menu (logged in) */}
            {user && (
              <div className="relative hidden md:block" ref={userRef}>
                <button onClick={() => setUserMenuOpen(v => !v)}
                  className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-150"
                  aria-expanded={userMenuOpen}>
                  <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-poppins font-semibold">
                    {user.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="hidden lg:inline font-poppins text-sm font-medium text-slate-800 max-w-[72px] truncate">
                    {user.name?.split(' ')[0]}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1    }}
                      exit={{    opacity: 0, y: 8, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2.5 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl shadow-gray-200/60 overflow-hidden z-50">
                      <div className="px-4 py-3.5 border-b border-gray-100 bg-gray-50/60">
                        <p className="font-poppins text-sm font-semibold text-slate-900 truncate">{user.name}</p>
                        <p className="font-poppins text-xs font-normal text-gray-400 truncate mt-0.5">{user.email}</p>
                      </div>
                      {[
                        { href: '/profile',   icon: <User  className="w-4 h-4" />,  label: 'My Profile' },
                        { href: '/wishlist',  icon: <Heart className="w-4 h-4" />,  label: 'Wishlist'   },
                        { href: '/planner',   icon: <MapPin className="w-4 h-4" />, label: 'Plan a Trip'},
                        { href: '/about',     icon: <Users className="w-4 h-4" />,  label: 'About Us'   },
                      ].map(item => (
                        <a key={item.label} href={item.href} onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 font-poppins text-sm font-medium text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition-colors">
                          <span className="text-purple-400">{item.icon}</span>{item.label}
                        </a>
                      ))}
                      {isAdmin && (
                        <a href="/admin" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 font-poppins text-sm font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border-t border-gray-100 transition-colors">
                          <Shield className="w-4 h-4" /> Admin Dashboard
                        </a>
                      )}
                      <button onClick={handleSignOut}
                        className="flex items-center gap-3 px-4 py-2.5 w-full text-left font-poppins text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 border-t border-gray-100 transition-colors">
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* CTA — Plan Trip — Poppins 500 / rounded-full */}
            <a href="/planner"
              className="hidden sm:inline-flex items-center gap-1.5 font-poppins text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 px-5 py-2.5 rounded-full transition-all duration-150 hover:shadow-md hover:shadow-purple-200 whitespace-nowrap">
              <MapPin className="w-3.5 h-3.5" />
              Plan Trip
            </a>

            {/* Mobile hamburger */}
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <button className="lg:hidden p-2 rounded-full text-slate-700 hover:bg-gray-100 transition-colors duration-150" aria-label="Open menu">
                  <Menu className="w-5 h-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[85vw] sm:w-80 bg-white border-gray-100 overflow-y-auto">
                <SheetTitle className="font-poppins text-[22px] font-semibold tracking-normal text-slate-900">
                  Bengal <span className="text-purple-600">Trails</span>
                </SheetTitle>
                <SheetDescription className="sr-only">Navigation menu</SheetDescription>
                <div className="mt-5 mb-6"><SmartSearchBar
                  size="sm"
                  placeholder="Destinations, festivals, food..."
                  onSelect={(result) => {
                    if (result.type === 'query') {
                      window.location.hash = `/explore?q=${encodeURIComponent((result as any).query)}`;
                    } else {
                      const url = (result as any).url as string;
                      if (url) window.location.hash = url.startsWith('#') ? url.slice(1) : url;
                    }
                  }}
                /></div>
                {user && (
                  <div className="mb-5 pb-5 border-b border-gray-100">
                    <div className="flex items-center gap-3 px-3 py-3 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-poppins font-semibold text-base">
                        {user.name?.[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-poppins text-sm font-semibold text-slate-900 truncate">{user.name}</p>
                        <p className="font-poppins text-xs font-normal text-gray-400 truncate">{user.email}</p>
                      </div>
                    </div>
                    {isAdmin && (
                      <a href="/admin" onClick={() => setMenuOpen(false)}
                        className="mt-2 flex items-center gap-2 px-3 py-2.5 font-poppins text-sm font-semibold text-purple-700 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors">
                        <Shield className="w-4 h-4" /> Admin Dashboard
                      </a>
                    )}
                  </div>
                )}
                <nav className="flex flex-col gap-0.5">
                  {[...NAV_ITEMS, { label: 'Plan Trip', href: '/planner', tKey: 'nav.planner' }].map(({ label, href, tKey }) => (
                    <a key={label} href={href} onClick={() => setMenuOpen(false)}
                      className="font-poppins text-sm font-medium text-slate-800 px-3.5 py-2.5 rounded-xl hover:bg-gray-100 hover:text-slate-900 transition-colors duration-150">
                      {tKey ? t(tKey) : label}
                    </a>
                  ))}
                  <div className="mt-4"><LanguageSwitcher variant="sheet" /></div>
                  {user && (
                    <>
                      <div className="mt-4 mb-1.5 px-3.5 font-poppins text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Account</div>
                      <a href="/profile" onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-3.5 py-2.5 font-poppins text-sm font-medium text-slate-700 hover:bg-gray-100 rounded-xl transition-colors">
                        <User className="w-4 h-4 text-purple-400" /> My Profile
                      </a>
                      <a href="/wishlist" onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-3.5 py-2.5 font-poppins text-sm font-medium text-slate-700 hover:bg-gray-100 rounded-xl transition-colors">
                        <Heart className="w-4 h-4 text-purple-400" /> Wishlist
                      </a>
                    </>
                  )}
                  <div className="mt-5 pt-5 border-t border-gray-100">
                    {!user ? (
                      <a href="/signin" onClick={() => setMenuOpen(false)}
                        className="block w-full text-center font-poppins text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 py-3 rounded-xl transition-colors">
                        Sign In
                      </a>
                    ) : (
                      <button onClick={() => { handleSignOut(); setMenuOpen(false); }}
                        className="flex items-center gap-2 w-full px-3.5 py-2.5 font-poppins text-sm font-medium text-red-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors">
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
