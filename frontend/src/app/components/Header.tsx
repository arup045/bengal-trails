import { Menu, Heart, User, LogOut, Shield, Users } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { NotificationSystem } from './NotificationSystem';
import { SmartSearchBar } from './SmartSearchBar';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet';

interface HeaderProps {
  /** When true, the search bar slides into the header. Controlled by scroll position. */
  showSearchBar?: boolean;
}

export function Header({ showSearchBar = false }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, signOut, isAdmin } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
    window.location.hash = '#/';
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-3 lg:gap-6">
          {/* Logo */}
          <motion.a
            href="#/"
            className="flex items-center gap-2 group cursor-pointer shrink-0"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              whileHover={{ rotate: 5, scale: 1.1 }}
              transition={{ duration: 0.3 }}
            >
              <svg width="40" height="40" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="32" cy="16" r="10" stroke="#22D3EE" strokeWidth="0.8" opacity="0.4" fill="none"/>
                <circle cx="32" cy="16" r="12" stroke="#22D3EE" strokeWidth="0.6" opacity="0.3" fill="none"/>
                <circle cx="16" cy="32" r="10" stroke="#22D3EE" strokeWidth="0.8" opacity="0.4" fill="none"/>
                <circle cx="16" cy="32" r="12" stroke="#22D3EE" strokeWidth="0.6" opacity="0.3" fill="none"/>
                <path d="M 32 11 C 28 11 25 14 25 18 C 25 22 28 25 32 25 C 36 25 39 22 39 18 C 39 14 36 11 32 11 Z M 32 14 C 34 14 36 16 36 18 C 36 20 34 22 32 22 C 30 22 28 20 28 18 C 28 16 30 14 32 14 Z" fill="#1E293B"/>
                <path d="M 22 20 C 20 22 18 24 16 26 C 14 28 12 30 11 32 C 10 34 10 36 11 37 C 12 39 14 40 17 40 C 20 40 22 39 24 37 L 26 35 C 26 35 25 34 24 33 C 23 32 22 31 22 30 C 22 29 23 28 24 27 L 28 23 C 29 22 30 21 30 20 C 30 19 29 18 28 18 C 27 17 26 17 25 18 L 22 20 Z M 16 30 C 18 30 20 32 20 34 C 20 36 18 38 16 38 C 14 38 12 36 12 34 C 12 32 14 30 16 30 Z" fill="#1E293B"/>
              </svg>
            </motion.div>
            <span className="text-xl sm:text-2xl tracking-tight text-gray-900" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800 }}>
              Bengal Trails
            </span>
          </motion.a>

          {/* Sticky search slot — slides in/out as user scrolls past the page-level search */}
          <div className="flex-1 max-w-xl hidden md:block">
            <AnimatePresence mode="wait">
              {showSearchBar && (
                <motion.div
                  key="header-search"
                  initial={{ opacity: 0, y: -16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                >
                  <SmartSearchBar size="sm" placeholder="Search destinations, festivals, food…" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Desktop Navigation — Map/Food/Rewards removed per request */}
          <nav className="hidden lg:flex items-center gap-6 shrink-0">
            <a href="#/" className="text-gray-700 hover:text-purple-600 transition-colors text-sm font-medium">Home</a>
            <a href="#/explore" className="text-gray-700 hover:text-purple-600 transition-colors text-sm font-medium">Explore</a>
            <a href="#/festivals" className="text-gray-700 hover:text-purple-600 transition-colors text-sm font-medium">Festivals</a>
            <a href="#/community" className="flex items-center gap-1 text-gray-700 hover:text-purple-600 transition-colors text-sm font-medium">
              <Users className="w-4 h-4" /> Community
            </a>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="hidden md:flex items-center gap-2">
              <LanguageSwitcher />
              <NotificationSystem />
            </div>

            {user ? (
              <div className="relative hidden md:block">
                <button
                  className="flex items-center gap-2 text-gray-700 px-3 py-1.5 hover:text-purple-600 transition-colors"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <User className="w-5 h-5" />
                  <span className="text-sm font-medium hidden lg:inline max-w-[100px] truncate">{user.name}</span>
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 shadow-xl rounded-xl z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100 bg-purple-50">
                      <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-600 truncate">{user.email}</p>
                    </div>
                    <a href="#/profile" className="flex items-center gap-2 px-4 py-3 text-gray-700 hover:bg-purple-50" onClick={() => setShowUserMenu(false)}>
                      <User className="w-4 h-4" /> My Profile
                    </a>
                    <a href="#/wishlist" className="flex items-center gap-2 px-4 py-3 text-gray-700 hover:bg-purple-50" onClick={() => setShowUserMenu(false)}>
                      <Heart className="w-4 h-4" /> Wishlist
                    </a>
                    <a href="#/community" className="flex items-center gap-2 px-4 py-3 text-gray-700 hover:bg-purple-50" onClick={() => setShowUserMenu(false)}>
                      <Users className="w-4 h-4" /> Community
                    </a>
                    {isAdmin && (
                      <a href="#/admin" className="flex items-center gap-2 px-4 py-3 text-purple-700 bg-purple-50 hover:bg-purple-100 font-semibold" onClick={() => setShowUserMenu(false)}>
                        <Shield className="w-4 h-4" /> Admin Dashboard
                      </a>
                    )}
                    <button onClick={handleSignOut} className="flex items-center gap-2 px-4 py-3 text-gray-700 hover:bg-red-50 w-full text-left border-t border-gray-100">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <a href="#/signin" className="hidden md:inline text-gray-700 px-3 py-1.5 hover:text-purple-600 transition-colors text-sm">
                Sign In
              </a>
            )}

            <a href="#/planner" className="hidden sm:inline-block bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-full hover:shadow-lg hover:shadow-purple-500/50 transition-all text-sm font-medium">
              Plan Trip
            </a>

            {/* Mobile menu */}
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <button className="lg:hidden p-2 -mr-2" aria-label="Open menu">
                  <Menu className="w-6 h-6 text-gray-800" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-white border-gray-200 w-[85vw] sm:w-96 overflow-y-auto">
                <SheetTitle className="text-gray-800">Menu</SheetTitle>
                <SheetDescription className="text-gray-600 text-sm">Navigate</SheetDescription>

                <div className="mt-4 mb-2">
                  <SmartSearchBar size="md" />
                </div>

                {user && (
                  <div className="mt-4 pb-4 mb-4 border-b border-gray-200">
                    <div className="px-3 py-2.5 bg-purple-50 rounded-xl mb-2">
                      <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-600 truncate">{user.email}</p>
                    </div>
                    <a href="#/profile" className="flex items-center gap-2 text-gray-700 hover:text-purple-600 px-2 py-2" onClick={() => setIsMenuOpen(false)}>
                      <User className="w-4 h-4" /> My Profile
                    </a>
                    {isAdmin && (
                      <a href="#/admin" className="flex items-center gap-2 text-purple-700 bg-purple-50 hover:bg-purple-100 px-2 py-2 rounded-lg mt-1 font-semibold" onClick={() => setIsMenuOpen(false)}>
                        <Shield className="w-4 h-4" /> Admin Dashboard
                      </a>
                    )}
                  </div>
                )}

                <nav className="flex flex-col gap-1 mt-4">
                  <a href="#/" className="text-gray-700 hover:text-purple-600 px-2 py-2 font-medium" onClick={() => setIsMenuOpen(false)}>Home</a>
                  <a href="#/explore" className="text-gray-700 hover:text-purple-600 px-2 py-2 font-medium" onClick={() => setIsMenuOpen(false)}>Explore Destinations</a>
                  <a href="#/festivals" className="text-gray-700 hover:text-purple-600 px-2 py-2 font-medium" onClick={() => setIsMenuOpen(false)}>Festival Calendar</a>
                  <a href="#/community" className="flex items-center gap-2 text-gray-700 hover:text-purple-600 px-2 py-2 font-medium" onClick={() => setIsMenuOpen(false)}>
                    <Users className="w-4 h-4" /> Community
                  </a>

                  <div className="mt-3 mb-1 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">My account</div>
                  <a href="#/wishlist" className="flex items-center gap-2 text-gray-700 hover:text-purple-600 px-2 py-2 text-sm" onClick={() => setIsMenuOpen(false)}>
                    <Heart className="w-4 h-4" /> Wishlist
                  </a>
                  <a href="#/planner" className="text-gray-700 hover:text-purple-600 px-2 py-2 text-sm" onClick={() => setIsMenuOpen(false)}>
                    Plan a Trip
                  </a>

                  <div className="mt-6 pt-4 border-t border-gray-200">
                    {!user ? (
                      <a href="#/signin" className="block w-full text-center bg-purple-600 text-white px-4 py-3 rounded-xl font-medium" onClick={() => setIsMenuOpen(false)}>
                        Sign In
                      </a>
                    ) : (
                      <button onClick={() => { handleSignOut(); setIsMenuOpen(false); }} className="flex items-center gap-2 text-gray-700 hover:text-purple-600 px-2 py-2 w-full text-left text-sm">
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
