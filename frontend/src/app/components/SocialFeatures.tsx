import { API_BASE } from '../utils/api';
import React, { useState, useEffect } from 'react';
import { Users, UserPlus, UserCheck, Share2, MessageCircle, Heart, Camera, MapPin, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

interface UserProfile {
  id: string;
  name: string;
  avatar?: string;
  bio?: string;
  location?: string;
  joinedDate: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isFollowing: boolean;
}

interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  images: string[];
  destination?: {
    name: string;
    slug: string;
  };
  visitDate?: string;
  likes: number;
  comments: number;
  isLiked: boolean;
  createdAt: string;
}

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
}

export const SocialFeatures: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'feed' | 'following' | 'discover'>('feed');
  const [posts, setPosts] = useState<Post[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedDestination, setSelectedDestination] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    if (user) {
      loadFeed();
      loadSuggestedUsers();
    }
  }, [user, activeTab]);

  const loadFeed = async () => {
    try {
      setLoading(true);
      const endpoint = activeTab === 'following' ? 'feed/following' : 'feed/discover';
      const response = await fetch(
        `${API_BASE}/social/${endpoint}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token') || ''}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
      }
    } catch (error) {
      console.error('Error loading feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSuggestedUsers = async () => {
    try {
      const response = await fetch(
        `${API_BASE}/social/suggested-users`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token') || ''}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSuggestedUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error loading suggested users:', error);
    }
  };

  const createPost = async () => {
    if (!user || !newPostContent.trim()) {
      toast.error('Please write something to share');
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE}/social/posts`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('access_token') || ''}`,
          },
          body: JSON.stringify({
            userId: user.id,
            content: newPostContent,
            destinationSlug: selectedDestination,
            visitDate,
          }),
        }
      );

      if (response.ok) {
        toast.success('Post shared successfully!');
        setShowNewPost(false);
        setNewPostContent('');
        setSelectedDestination('');
        setVisitDate('');
        loadFeed();
      }
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to share post');
    }
  };

  const toggleLike = async (postId: string) => {
    try {
      const response = await fetch(
        `${API_BASE}/social/posts/${postId}/like`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token') || ''}`,
          },
          body: JSON.stringify({ userId: user?.id }),
        }
      );

      if (response.ok) {
        loadFeed();
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const toggleFollow = async (userId: string) => {
    try {
      const response = await fetch(
        `${API_BASE}/social/follow/${userId}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token') || ''}`,
          },
          body: JSON.stringify({ followerId: user?.id }),
        }
      );

      if (response.ok) {
        loadSuggestedUsers();
        loadFeed();
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  const loadComments = async (postId: string) => {
    try {
      const response = await fetch(
        `${API_BASE}/social/posts/${postId}/comments`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token') || ''}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const addComment = async (postId: string) => {
    if (!newComment.trim()) return;

    try {
      const response = await fetch(
        `${API_BASE}/social/posts/${postId}/comments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('access_token') || ''}`,
          },
          body: JSON.stringify({
            userId: user?.id,
            content: newComment,
          }),
        }
      );

      if (response.ok) {
        setNewComment('');
        loadComments(postId);
        loadFeed();
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 p-6">
        <div className="text-center">
          <Users className="w-24 h-24 text-purple-300 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Join Our Community!</h2>
          <p className="text-gray-600 mb-6">
            Connect with fellow travelers, share your experiences, and discover new destinations together.
          </p>
          <button
            onClick={() => (window.location.hash = '/signin')}
            className="px-8 py-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
          >
            Sign In to Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Travel Community</h1>

              {/* Tabs */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setActiveTab('feed')}
                  className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-colors ${
                    activeTab === 'feed'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  My Feed
                </button>
                <button
                  onClick={() => setActiveTab('following')}
                  className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-colors ${
                    activeTab === 'following'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Following
                </button>
                <button
                  onClick={() => setActiveTab('discover')}
                  className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-colors ${
                    activeTab === 'discover'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Discover
                </button>
              </div>

              {/* New Post Button */}
              <button
                onClick={() => setShowNewPost(!showNewPost)}
                className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-semibold flex items-center justify-center gap-2"
              >
                <Camera className="w-5 h-5" />
                Share Your Travel Experience
              </button>
            </div>

            {/* New Post Form */}
            <AnimatePresence>
              {showNewPost && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-white rounded-2xl shadow-lg p-6"
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Create New Post</h3>
                  <div className="space-y-4">
                    <textarea
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      placeholder="Share your travel story, tips, or photos..."
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <MapPin className="w-4 h-4 inline mr-2" />
                          Destination (optional)
                        </label>
                        <input
                          type="text"
                          value={selectedDestination}
                          onChange={(e) => setSelectedDestination(e.target.value)}
                          placeholder="e.g., Darjeeling"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Calendar className="w-4 h-4 inline mr-2" />
                          Visit Date (optional)
                        </label>
                        <input
                          type="date"
                          value={visitDate}
                          onChange={(e) => setVisitDate(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={createPost}
                        className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                      >
                        Post
                      </button>
                      <button
                        onClick={() => setShowNewPost(false)}
                        className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Posts Feed */}
            {loading ? (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/6"></div>
                      </div>
                    </div>
                    <div className="h-40 bg-gray-200 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No posts yet. Be the first to share!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {posts.map((post) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-lg p-6"
                  >
                    {/* Post Header */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                        {(post.userName || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900">{post.userName}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Post Content */}
                    <p className="text-gray-700 mb-4 whitespace-pre-wrap">{post.content}</p>

                    {/* Destination Tag */}
                    {post.destination && (
                      <div className="mb-4">
                        <button
                          onClick={() => (window.location.hash = `/explore/${post.destination?.slug}`)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-colors"
                        >
                          <MapPin className="w-4 h-4" />
                          {post.destination.name}
                        </button>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-6 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => toggleLike(post.id)}
                        className={`flex items-center gap-2 transition-colors ${
                          post.isLiked ? 'text-red-600' : 'text-gray-600 hover:text-red-600'
                        }`}
                      >
                        <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} />
                        <span className="font-semibold">{post.likes}</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedPost(post);
                          loadComments(post.id);
                        }}
                        className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors"
                      >
                        <MessageCircle className="w-5 h-5" />
                        <span className="font-semibold">{post.comments}</span>
                      </button>
                      <button className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors">
                        <Share2 className="w-5 h-5" />
                        <span className="font-semibold">Share</span>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Suggested Users */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Suggested Travelers</h3>
              <div className="space-y-4">
                {suggestedUsers.map((suggestedUser) => (
                  <div key={suggestedUser.id} className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {(suggestedUser.name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{suggestedUser.name}</p>
                      <p className="text-sm text-gray-500">
                        {suggestedUser.followersCount} followers
                      </p>
                    </div>
                    <button
                      onClick={() => toggleFollow(suggestedUser.id)}
                      className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                        suggestedUser.isFollowing
                          ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          : 'bg-purple-600 text-white hover:bg-purple-700'
                      }`}
                    >
                      {suggestedUser.isFollowing ? (
                        <UserCheck className="w-5 h-5" />
                      ) : (
                        <UserPlus className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-lg p-6 text-white">
              <h3 className="text-xl font-bold mb-4">Your Impact</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Posts Shared</span>
                  <span className="font-bold">12</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Likes</span>
                  <span className="font-bold">248</span>
                </div>
                <div className="flex justify-between">
                  <span>Followers</span>
                  <span className="font-bold">89</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comments Modal */}
      <AnimatePresence>
        {selectedPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6"
            onClick={() => setSelectedPost(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Comments</h3>
                <button
                  onClick={() => setSelectedPost(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  ×
                </button>
              </div>

              {/* Comments List */}
              <div className="space-y-4 mb-6">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                      {(comment.userName || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-100 rounded-lg p-3">
                        <p className="font-semibold text-gray-900 mb-1">{comment.userName}</p>
                        <p className="text-gray-700">{comment.content}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Comment */}
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addComment(selectedPost.id)}
                  placeholder="Write a comment..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={() => addComment(selectedPost.id)}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                >
                  Post
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
