import { API_BASE } from '../utils/api';
import React, { useState, useEffect } from 'react';
import { Camera, MapPin, Star, Heart, MessageCircle, Award, TrendingUp, Filter } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

interface UserContent {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  type: 'photo' | 'story' | 'tip';
  title: string;
  content: string;
  imageUrl?: string;
  destinationSlug?: string;
  destinationName?: string;
  tags: string[];
  likes: number;
  comments: number;
  isLiked: boolean;
  featured: boolean;
  createdAt: string;
}

export const UserGeneratedContent: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [content, setContent] = useState<UserContent[]>([]);
  const [filter, setFilter] = useState<'all' | 'photos' | 'stories' | 'tips'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'featured'>('featured');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, [filter, sortBy]);

  const loadContent = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE}/user-content?type=${filter}&sort=${sortBy}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token') || ''}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setContent(data.content || []);
      }
    } catch (error) {
      console.error('Error loading user content:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async (contentId: string) => {
    if (!user) {
      toast.error('Please sign in to like content');
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE}/user-content/${contentId}/like`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token') || ''}`,
          },
          body: JSON.stringify({ userId: user.id }),
        }
      );

      if (response.ok) {
        loadContent();
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Traveler's Gallery
          </h1>
          <p className="text-xl text-gray-600">
            Real experiences shared by real travelers
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  filter === 'all'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Content
              </button>
              <button
                onClick={() => setFilter('photos')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
                  filter === 'photos'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Camera className="w-4 h-4" />
                Photos
              </button>
              <button
                onClick={() => setFilter('stories')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  filter === 'stories'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Stories
              </button>
              <button
                onClick={() => setFilter('tips')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  filter === 'tips'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tips
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setSortBy('featured')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
                  sortBy === 'featured'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Award className="w-4 h-4" />
                Featured
              </button>
              <button
                onClick={() => setSortBy('popular')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
                  sortBy === 'popular'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                Popular
              </button>
              <button
                onClick={() => setSortBy('recent')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  sortBy === 'recent'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Recent
              </button>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
                <div className="h-64 bg-gray-200"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : content.length === 0 ? (
          <div className="text-center py-20">
            <Camera className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <p className="text-xl text-gray-600">No content found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {content.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow"
              >
                {item.imageUrl && (
                  <div className="relative h-64 overflow-hidden group">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    {item.featured && (
                      <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current" />
                        Featured
                      </div>
                    )}
                    <div className="absolute top-4 left-4 bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold capitalize">
                      {item.type}
                    </div>
                  </div>
                )}

                <div className="p-6">
                  {/* User Info */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {(item.userName || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{item.userName}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>

                  {/* Content */}
                  <p className="text-gray-600 mb-4 line-clamp-3">{item.content}</p>

                  {/* Destination */}
                  {item.destinationName && (
                    <button
                      onClick={() =>
                        item.destinationSlug &&
                        (window.location.hash = `/explore/${item.destinationSlug}`)
                      }
                      className="inline-flex items-center gap-2 mb-4 text-purple-600 hover:underline"
                    >
                      <MapPin className="w-4 h-4" />
                      {item.destinationName}
                    </button>
                  )}

                  {/* Tags */}
                  {item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {item.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => toggleLike(item.id)}
                      className={`flex items-center gap-2 transition-colors ${
                        item.isLiked ? 'text-red-600' : 'text-gray-600 hover:text-red-600'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${item.isLiked ? 'fill-current' : ''}`} />
                      <span className="font-semibold">{item.likes}</span>
                    </button>
                    <button className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors">
                      <MessageCircle className="w-5 h-5" />
                      <span className="font-semibold">{item.comments}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* CTA */}
        {user && (
          <div className="mt-12 text-center bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-12 text-white">
            <Camera className="w-16 h-16 mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">Share Your Experience!</h2>
            <p className="text-xl mb-6">
              Help other travelers by sharing your photos, stories, and tips
            </p>
            <button
              onClick={() => (window.location.hash = '/social')}
              className="px-8 py-4 bg-white text-purple-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-lg"
            >
              Start Sharing
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
