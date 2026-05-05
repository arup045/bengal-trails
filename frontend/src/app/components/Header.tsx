import { Menu, X, Globe, Heart, UtensilsCrossed, Map, Calendar, User, LogOut, Shield, Award, Users, Camera } from 'lucide-react';
import { useState } from 'react';
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

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [language, setLanguage] = useState('EN');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, signOut, isAdmin } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
    window.location.hash = '#/';
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.a
            href="#/"
            className="flex items-center gap-3 group cursor-pointer"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div 
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              whileHover={{ rotate: 5, scale: 1.1 }}
              transition={{ duration: 0.3 }}
            >
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Ripple circles */}
                <circle cx="32" cy="16" r="10" stroke="#22D3EE" strokeWidth="0.8" opacity="0.4" fill="none"/>
                <circle cx="32" cy="16" r="12" stroke="#22D3EE" strokeWidth="0.6" opacity="0.3" fill="none"/>
                <circle cx="32" cy="16" r="14" stroke="#22D3EE" strokeWidth="0.4" opacity="0.2" fill="none"/>
                
                <circle cx="16" cy="32" r="10" stroke="#22D3EE" strokeWidth="0.8" opacity="0.4" fill="none"/>
                <circle cx="16" cy="32" r="12" stroke="#22D3EE" strokeWidth="0.6" opacity="0.3" fill="none"/>
                <circle cx="16" cy="32" r="14" stroke="#22D3EE" strokeWidth="0.4" opacity="0.2" fill="none"/>
                
                {/* Main abstract GO/GOBRO shape */}
                <path 
                  d="M 32 11 C 28 11 25 14 25 18 C 25 22 28 25 32 25 C 36 25 39 22 39 18 C 39 14 36 11 32 11 Z M 32 14 C 34 14 36 16 36 18 C 36 20 34 22 32 22 C 30 22 28 20 28 18 C 28 16 30 14 32 14 Z"
                  fill="#1E293B"
                />
                
                <path 
                  d="M 22 20 C 20 22 18 24 16 26 C 14 28 12 30 11 32 C 10 34 10 36 11 37 C 12 39 14 40 17 40 C 20 40 22 39 24 37 L 26 35 C 26 35 25 34 24 33 C 23 32 22 31 22 30 C 22 29 23 28 24 27 L 28 23 C 29 22 30 21 30 20 C 30 19 29 18 28 18 C 27 17 26 17 25 18 L 22 20 Z M 16 30 C 18 30 20 32 20 34 C 20 36 18 38 16 38 C 14 38 12 36 12 34 C 12 32 14 30 16 30 Z"
                  fill="#1E293B"
                />
              </svg>
            </motion.div>
            <span className="text-2xl tracking-tight text-gray-900" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800 }}>
              GOBRO
            </span>
          </motion.a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            <a
              href="#/"
              className="text-gray-700 hover:text-purple-600 transition-colors"
            >
              Home
            </a>
            <a
              href="#/explore"
              className="text-gray-700 hover:text-purple-600 transition-colors"
            >
              Explore
            </a>
            <a
              href="#/map"
              className="flex items-center gap-2 text-gray-700 hover:text-purple-600 transition-colors"
            >
              <Map className="w-4 h-4" />
              Map
            </a>
            <a
              href="#/wishlist"
              className="flex items-center gap-2 text-gray-700 hover:text-purple-600 transition-colors"
            >
              <Heart className="w-4 h-4" />
              Wishlist
            </a>
            <a
              href="#/food"
              className="flex items-center gap-2 text-gray-700 hover:text-purple-600 transition-colors"
            >
              <UtensilsCrossed className="w-4 h-4" />
              Food
            </a>
            <a
              href="#/social"
              className="flex items-center gap-2 text-gray-700 hover:text-purple-600 transition-colors"
            >
              <Users className="w-4 h-4" />
              Community
            </a>
            <a
              href="#/gamification"
              className="flex items-center gap-2 text-gray-700 hover:text-purple-600 transition-colors"
            >
              <Award className="w-4 h-4" />
              Rewards
            </a>
          </nav>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-4">
            <LanguageSwitcher />
            <NotificationSystem />
            {user ? (
              <div className="relative">
                <button
                  className="flex items-center gap-2 text-gray-700 px-4 py-2 hover:text-purple-600 transition-colors"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <User className="w-5 h-5" />
                  <span className="text-sm font-medium">{user.name}</span>
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 shadow-xl rounded-xl z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100 bg-purple-50">
                      <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-600 truncate">{user.email}</p>
                    </div>
                    <a
                      href="#/profile"
                      className="flex items-center gap-2 px-4 py-3 text-gray-700 hover:bg-purple-50 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <User className="w-4 h-4" />
                      My Profile
                    </a>
                    <a
                      href="#/wishlist"
                      className="flex items-center gap-2 px-4 py-3 text-gray-700 hover:bg-purple-50 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Heart className="w-4 h-4" />
                      Wishlist
                    </a>
                    <a
                      href="#/gamification"
                      className="flex items-center gap-2 px-4 py-3 text-gray-700 hover:bg-purple-50 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Award className="w-4 h-4" />
                      My Rewards
                    </a>
                    <a
                      href="#/social"
                      className="flex items-center gap-2 px-4 py-3 text-gray-700 hover:bg-purple-50 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Users className="w-4 h-4" />
                      Community
                    </a>
                    <a
                      href="#/community"
                      className="flex items-center gap-2 px-4 py-3 text-gray-700 hover:bg-purple-50 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Camera className="w-4 h-4" />
                      Gallery
                    </a>
                    {isAdmin && (
                      <a
                        href="#/admin"
                        className="flex items-center gap-2 px-4 py-3 text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors border-t border-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Shield className="w-4 h-4" />
                        <span className="font-semibold">Admin Dashboard</span>
                      </a>
                    )}
                    <button
                      className="flex items-center gap-2 px-4 py-3 text-gray-700 hover:bg-purple-50 w-full text-left border-t border-gray-100 transition-colors"
                      onClick={handleSignOut}
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <a
                href="#/signin"
                className="text-gray-700 px-4 py-2 hover:text-purple-600 transition-colors"
              >
                Sign In
              </a>
            )}
            <a
              href="#/planner"
              className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-2 rounded-full hover:shadow-lg hover:shadow-purple-500/50 transition-all inline-block"
            >
              Plan Trip
            </a>
          </div>

          {/* Mobile Menu */}
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <button className="md:hidden p-2" aria-label="Open menu">
                <Menu className="w-6 h-6 text-gray-800" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-white border-gray-200">
              <SheetTitle className="text-gray-800">Menu</SheetTitle>
              <SheetDescription className="text-gray-600">Navigate through the site</SheetDescription>
              <nav className="flex flex-col gap-6 mt-8">
                {user && (
                  <div className="pb-4 mb-4 border-b border-gray-200">
                    <div className="px-4 py-3 bg-purple-50 rounded-xl mb-3">
                      <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-600 truncate">{user.email}</p>
                    </div>
                    <a
                      href="#/profile"
                      className="flex items-center gap-2 text-gray-700 hover:text-purple-600 transition-colors px-2 py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      My Profile
                    </a>
                    {isAdmin && (
                      <a
                        href="#/admin"
                        className="flex items-center gap-2 text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors px-2 py-2 rounded-lg mt-2"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Shield className="w-4 h-4" />
                        <span className="font-semibold">Admin Dashboard</span>
                      </a>
                    )}
                  </div>
                )}
                <a
                  href="#/"
                  className="text-gray-700 hover:text-purple-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </a>
                <a
                  href="#/explore"
                  className="text-gray-700 hover:text-purple-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Explore
                </a>
                <a
                  href="#/map"
                  className="flex items-center gap-2 text-gray-700 hover:text-purple-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Map className="w-4 h-4" />
                  Map
                </a>
                <a
                  href="#/wishlist"
                  className="flex items-center gap-2 text-gray-700 hover:text-purple-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Heart className="w-4 h-4" />
                  Wishlist
                </a>
                <a
                  href="#/food"
                  className="flex items-center gap-2 text-gray-700 hover:text-purple-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <UtensilsCrossed className="w-4 h-4" />
                  Food
                </a>
                {!user ? (
                  <a
                    href="#/signin"
                    className="text-gray-700 hover:text-purple-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </a>
                ) : (
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center gap-2 text-gray-700 hover:text-purple-600 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                )}
                <a
                  href="#/planner"
                  className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-2 rounded-full w-full text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Plan Trip
                </a>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}