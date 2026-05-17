import { API_BASE } from '../utils/api';
import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, DollarSign, Calendar, Users, Sparkles, X, Filter, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';

interface SearchSuggestion {
  id: string;
  name: string;
  type: 'destination' | 'category' | 'activity' | 'food';
  slug: string;
  image?: string;
  popularity: number;
}

interface AdvancedSearchProps {
  onSearch?: (query: string, filters: SearchFilters) => void;
}

export interface SearchFilters {
  query: string;
  category?: string;
  priceRange?: [number, number];
  season?: string;
  duration?: string;
  groupSize?: string;
  tags?: string[];
}

export const AdvancedSearch: React.FC<AdvancedSearchProps> = ({ onSearch }) => {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [trendingSearches, setTrendingSearches] = useState<string[]>([
    'Darjeeling tea gardens',
    'Sundarbans tiger safari',
    'Kolkata street food',
    'Mandarmani beach resort',
    'Shantiniketan art village',
  ]);
  const searchRef = useRef<HTMLDivElement>(null);

  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    category: '',
    priceRange: [0, 10000],
    season: '',
    duration: '',
    groupSize: '',
    tags: [],
  });

  useEffect(() => {
    const saved = localStorage.getItem('bengaltrails-recent-searches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length >= 2) {
      fetchSuggestions(query);
    } else {
      setSuggestions([]);
    }
  }, [query]);

  const fetchSuggestions = async (searchQuery: string) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE}/search/suggestions?q=${encodeURIComponent(searchQuery)}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token') || ''}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (query.trim()) {
      const updatedFilters = { ...filters, query };
      onSearch?.(query, updatedFilters);
      addToRecentSearches(query);
      setShowSuggestions(false);
    }
  };

  const addToRecentSearches = (search: string) => {
    const updated = [search, ...recentSearches.filter((s) => s !== search)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('bengaltrails-recent-searches', JSON.stringify(updated));
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.name);
    setShowSuggestions(false);
    if (suggestion.type === 'destination') {
      window.location.hash = `/explore/${suggestion.slug}`;
    }
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      category: '',
      priceRange: [0, 10000],
      season: '',
      duration: '',
      groupSize: '',
      tags: [],
    });
  };

  const activeFiltersCount = Object.values(filters).filter(
    (v) => v && (Array.isArray(v) ? v.length > 0 && (v[0] !== 0 || v[1] !== 10000) : v !== '')
  ).length - 1; // -1 for query

  return (
    <div ref={searchRef} className="relative w-full max-w-4xl mx-auto">
      {/* Search Bar */}
      <div className="relative">
        <div className="flex items-center bg-white rounded-2xl shadow-xl border-2 border-purple-100 overflow-hidden">
          <div className="flex-1 flex items-center gap-3 px-6 py-4">
            <Search className="w-6 h-6 text-purple-600" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={t('ai.placeholder')}
              className="flex-1 text-lg outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-6 py-4 bg-purple-50 hover:bg-purple-100 transition-colors border-l border-purple-100 flex items-center gap-2"
          >
            <Filter className="w-5 h-5 text-purple-600" />
            {activeFiltersCount > 0 && (
              <span className="bg-purple-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
          <button
            onClick={handleSearch}
            className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold transition-colors"
          >
            {t('common.search')}
          </button>
        </div>

        {/* AI-Powered Badge */}
        <div className="absolute -top-3 left-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
          <Sparkles className="w-3 h-3" />
          AI-Powered Search
        </div>
      </div>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-2xl border border-purple-100 overflow-hidden z-50"
          >
            {loading ? (
              <div className="p-6 text-center text-gray-500">
                <div className="animate-spin w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full mx-auto"></div>
              </div>
            ) : (
              <>
                {/* Trending Searches */}
                {query.length === 0 && trendingSearches.length > 0 && (
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="w-4 h-4 text-purple-600" />
                      <h3 className="text-sm font-semibold text-gray-700">Trending Now</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {trendingSearches.map((trend) => (
                        <button
                          key={trend}
                          onClick={() => {
                            setQuery(trend);
                            handleSearch();
                          }}
                          className="px-3 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-full text-sm font-medium transition-colors"
                        >
                          {trend}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Searches */}
                {query.length === 0 && recentSearches.length > 0 && (
                  <div className="p-4 border-b border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Recent Searches</h3>
                    <div className="space-y-1">
                      {recentSearches.map((recent) => (
                        <button
                          key={recent}
                          onClick={() => {
                            setQuery(recent);
                            handleSearch();
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-purple-50 rounded-lg text-gray-700 transition-colors flex items-center gap-2"
                        >
                          <Search className="w-4 h-4 text-gray-400" />
                          {recent}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Search Suggestions */}
                {suggestions.length > 0 && (
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Suggestions</h3>
                    <div className="space-y-2">
                      {suggestions.map((suggestion) => (
                        <button
                          key={suggestion.id}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="w-full flex items-center gap-3 p-3 hover:bg-purple-50 rounded-xl transition-colors"
                        >
                          {suggestion.image ? (
                            <img
                              src={suggestion.image}
                              alt={suggestion.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                              <MapPin className="w-6 h-6 text-purple-600" />
                            </div>
                          )}
                          <div className="flex-1 text-left">
                            <p className="font-medium text-gray-900">{suggestion.name}</p>
                            <p className="text-sm text-gray-500 capitalize">{suggestion.type}</p>
                          </div>
                          <Sparkles className="w-4 h-4 text-purple-400" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Advanced Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 bg-white rounded-2xl shadow-xl border border-purple-100 overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Advanced Filters</h3>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-purple-600 hover:underline"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">All Categories</option>
                    <option value="heritage">Heritage Sites</option>
                    <option value="nature">Nature & Wildlife</option>
                    <option value="beach">Beaches</option>
                    <option value="temple">Temples</option>
                    <option value="hill-station">Hill Stations</option>
                    <option value="food">Food & Cuisine</option>
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Budget (₹)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      value={filters.priceRange?.[0]}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          priceRange: [Number(e.target.value), filters.priceRange?.[1] || 10000],
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="Min"
                    />
                    <span className="text-gray-500">-</span>
                    <input
                      type="number"
                      value={filters.priceRange?.[1]}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          priceRange: [filters.priceRange?.[0] || 0, Number(e.target.value)],
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="Max"
                    />
                  </div>
                </div>

                {/* Season */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Best Season
                  </label>
                  <select
                    value={filters.season}
                    onChange={(e) => setFilters({ ...filters, season: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Any Season</option>
                    <option value="winter">Winter (Oct-Feb)</option>
                    <option value="summer">Summer (Mar-May)</option>
                    <option value="monsoon">Monsoon (Jun-Sep)</option>
                  </select>
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Trip Duration
                  </label>
                  <select
                    value={filters.duration}
                    onChange={(e) => setFilters({ ...filters, duration: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Any Duration</option>
                    <option value="day">Day Trip</option>
                    <option value="weekend">Weekend (2-3 days)</option>
                    <option value="week">Week (4-7 days)</option>
                    <option value="long">Extended (7+ days)</option>
                  </select>
                </div>

                {/* Group Size */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Travel Style
                  </label>
                  <select
                    value={filters.groupSize}
                    onChange={(e) => setFilters({ ...filters, groupSize: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Any Group</option>
                    <option value="solo">Solo Travel</option>
                    <option value="couple">Couple</option>
                    <option value="family">Family</option>
                    <option value="friends">Friends Group</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => {
                    handleSearch();
                    setShowFilters(false);
                  }}
                  className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                >
                  Apply Filters
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
