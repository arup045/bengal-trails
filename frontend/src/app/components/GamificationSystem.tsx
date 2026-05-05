import { API_BASE } from '../utils/api';
import React, { useState, useEffect } from 'react';
import { Trophy, Star, Award, TrendingUp, Target, Zap, Crown, Medal, Gift, Users, MapPin, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

interface UserStats {
  points: number;
  level: number;
  badges: Badge[];
  achievements: Achievement[];
  rank: number;
  totalUsers: number;
  visitedPlaces: number;
  reviewsWritten: number;
  photosShared: number;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earnedAt?: string;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  points: number;
  progress: number;
  target: number;
  completed: boolean;
}

interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  avatar?: string;
  points: number;
  level: number;
  badges: number;
}

export const GamificationSystem: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'badges' | 'achievements' | 'leaderboard'>('overview');
  const [loading, setLoading] = useState(true);
  const [newBadge, setNewBadge] = useState<Badge | null>(null);

  useEffect(() => {
    if (user) {
      loadStats();
      loadLeaderboard();
    }
  }, [user]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE}/gamification/stats`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token') || ''}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLeaderboard = async () => {
    try {
      const response = await fetch(
        `${API_BASE}/gamification/leaderboard`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token') || ''}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data.leaderboard || []);
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    }
  };

  const getBadgeColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'from-yellow-400 to-orange-500';
      case 'epic':
        return 'from-purple-400 to-pink-500';
      case 'rare':
        return 'from-blue-400 to-cyan-500';
      default:
        return 'from-gray-400 to-gray-500';
    }
  };

  const getLevelProgress = () => {
    if (!stats) return 0;
    const pointsForCurrentLevel = stats.level * 1000;
    const pointsForNextLevel = (stats.level + 1) * 1000;
    const progress = ((stats.points - pointsForCurrentLevel) / (pointsForNextLevel - pointsForCurrentLevel)) * 100;
    return Math.min(100, Math.max(0, progress));
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 p-6">
        <div className="text-center">
          <Trophy className="w-24 h-24 text-purple-300 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Join the Adventure!</h2>
          <p className="text-gray-600 mb-6">Sign in to earn points, unlock badges, and compete with other travelers!</p>
          <button
            onClick={() => (window.location.hash = '/signin')}
            className="px-8 py-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
          >
            Sign In Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Explorer's Journey</h1>
          <p className="text-xl text-gray-600">Track your adventures and earn rewards!</p>
        </div>

        {/* Stats Overview */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-lg animate-pulse">
                <div className="h-12 bg-gray-200 rounded mb-3"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : stats && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl p-6 shadow-xl text-white"
              >
                <div className="flex items-center justify-between mb-3">
                  <Trophy className="w-10 h-10" />
                  <span className="text-3xl font-bold">{stats.level}</span>
                </div>
                <p className="text-purple-200 font-semibold mb-2">{t('gamification.level')}</p>
                <div className="w-full bg-purple-800 rounded-full h-2">
                  <div
                    className="bg-white rounded-full h-2 transition-all duration-500"
                    style={{ width: `${getLevelProgress()}%` }}
                  ></div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-6 shadow-xl text-white"
              >
                <div className="flex items-center justify-between mb-3">
                  <Star className="w-10 h-10" />
                  <span className="text-3xl font-bold">{stats.points.toLocaleString()}</span>
                </div>
                <p className="text-yellow-100 font-semibold">{t('gamification.points')}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl p-6 shadow-xl text-white"
              >
                <div className="flex items-center justify-between mb-3">
                  <Award className="w-10 h-10" />
                  <span className="text-3xl font-bold">{stats.badges.length}</span>
                </div>
                <p className="text-pink-100 font-semibold">{t('gamification.badges')}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-6 shadow-xl text-white"
              >
                <div className="flex items-center justify-between mb-3">
                  <TrendingUp className="w-10 h-10" />
                  <span className="text-3xl font-bold">#{stats.rank}</span>
                </div>
                <p className="text-blue-100 font-semibold">Global Rank</p>
                <p className="text-blue-200 text-sm">of {stats.totalUsers} travelers</p>
              </motion.div>
            </div>

            {/* Activity Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900">{stats.visitedPlaces}</p>
                    <p className="text-gray-600">Places Visited</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                    <Star className="w-6 h-6 text-pink-600" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900">{stats.reviewsWritten}</p>
                    <p className="text-gray-600">Reviews Written</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <Camera className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900">{stats.photosShared}</p>
                    <p className="text-gray-600">Photos Shared</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex">
              {['overview', 'badges', 'achievements', 'leaderboard'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`flex-1 px-6 py-4 font-semibold capitalize transition-colors ${
                    activeTab === tab
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-600 hover:bg-purple-50'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="p-8">
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && stats && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Achievements</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    {stats.achievements.filter((a) => a.completed).slice(0, 4).map((achievement) => (
                      <div
                        key={achievement.id}
                        className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center">
                            <Target className="w-8 h-8 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900 mb-1">{achievement.name}</h3>
                            <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                            <div className="flex items-center gap-2">
                              <Zap className="w-4 h-4 text-yellow-500" />
                              <span className="font-semibold text-purple-600">+{achievement.points} points</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'badges' && stats && (
                <motion.div
                  key="badges"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Badge Collection</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {stats.badges.map((badge) => (
                      <motion.div
                        key={badge.id}
                        whileHover={{ scale: 1.05 }}
                        className="text-center"
                      >
                        <div className={`w-24 h-24 mx-auto mb-3 rounded-full bg-gradient-to-br ${getBadgeColor(badge.rarity)} flex items-center justify-center shadow-lg`}>
                          <span className="text-4xl">{badge.icon}</span>
                        </div>
                        <p className="font-bold text-gray-900 text-sm mb-1">{badge.name}</p>
                        <p className="text-xs text-gray-600 capitalize">{badge.rarity}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'achievements' && stats && (
                <motion.div
                  key="achievements"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">All Achievements</h2>
                  <div className="space-y-4">
                    {stats.achievements.map((achievement) => (
                      <div
                        key={achievement.id}
                        className={`p-6 rounded-xl border-2 ${
                          achievement.completed
                            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                              achievement.completed ? 'bg-green-600' : 'bg-gray-400'
                            }`}>
                              <Target className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-900">{achievement.name}</h3>
                              <p className="text-sm text-gray-600">{achievement.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Zap className="w-5 h-5 text-yellow-500" />
                            <span className="font-bold text-purple-600">+{achievement.points}</span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full transition-all ${
                              achievement.completed ? 'bg-green-600' : 'bg-purple-600'
                            }`}
                            style={{ width: `${(achievement.progress / achievement.target) * 100}%` }}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                          {achievement.progress} / {achievement.target}
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'leaderboard' && (
                <motion.div
                  key="leaderboard"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Global Leaderboard</h2>
                  <div className="space-y-3">
                    {leaderboard.map((entry, index) => (
                      <motion.div
                        key={entry.userId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`flex items-center gap-4 p-4 rounded-xl ${
                          entry.userId === user?.id
                            ? 'bg-purple-100 border-2 border-purple-600'
                            : 'bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-center w-12 h-12 font-bold text-xl">
                          {entry.rank === 1 && <Crown className="w-8 h-8 text-yellow-500" />}
                          {entry.rank === 2 && <Medal className="w-8 h-8 text-gray-400" />}
                          {entry.rank === 3 && <Medal className="w-8 h-8 text-orange-600" />}
                          {entry.rank > 3 && <span className="text-gray-600">#{entry.rank}</span>}
                        </div>
                        <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                          {entry.userName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-gray-900">{entry.userName}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>Level {entry.level}</span>
                            <span>{entry.badges} badges</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-purple-600">{entry.points.toLocaleString()}</p>
                          <p className="text-sm text-gray-600">points</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* New Badge Notification */}
      <AnimatePresence>
        {newBadge && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6"
            onClick={() => setNewBadge(null)}
          >
            <div className="bg-white rounded-3xl p-12 max-w-md text-center">
              <Gift className="w-20 h-20 text-purple-600 mx-auto mb-6 animate-bounce" />
              <h2 className="text-3xl font-bold text-gray-900 mb-3">New Badge Unlocked!</h2>
              <div className={`w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br ${getBadgeColor(newBadge.rarity)} flex items-center justify-center shadow-2xl`}>
                <span className="text-6xl">{newBadge.icon}</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{newBadge.name}</h3>
              <p className="text-gray-600 mb-6">{newBadge.description}</p>
              <button
                onClick={() => setNewBadge(null)}
                className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
              >
                Awesome!
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
