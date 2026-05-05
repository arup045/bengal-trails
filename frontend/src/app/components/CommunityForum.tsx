import { API_BASE } from '../utils/api';
import React, { useState, useEffect } from 'react';
import { MessageSquare, ThumbsUp, Reply, Pin, Lock, TrendingUp, Clock, User, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';

interface ForumThread {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  category: string;
  tags: string[];
  replies: number;
  views: number;
  likes: number;
  isPinned: boolean;
  isLocked: boolean;
  createdAt: string;
  lastActivity: string;
}

interface ForumReply {
  id: string;
  threadId: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  likes: number;
  createdAt: string;
}

export const CommunityForum: React.FC = () => {
  const { user } = useAuth();
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<ForumThread | null>(null);
  const [replies, setReplies] = useState<ForumReply[]>([]);
  const [showNewThread, setShowNewThread] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'trending'>('recent');
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [newThreadContent, setNewThreadContent] = useState('');
  const [newThreadCategory, setNewThreadCategory] = useState('General');
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(true);

  const categories = ['all', 'General', 'Travel Tips', 'Destination Q&A', 'Food & Culture', 'Photography', 'Planning Help'];

  useEffect(() => {
    loadThreads();
  }, [selectedCategory, sortBy]);

  const loadThreads = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE}/forum/threads?category=${selectedCategory}&sort=${sortBy}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token') || ''}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setThreads(data.threads || mockThreads);
      }
    } catch (error) {
      console.error('Error loading threads:', error);
      setThreads(mockThreads);
    } finally {
      setLoading(false);
    }
  };

  const loadReplies = async (threadId: string) => {
    try {
      const response = await fetch(
        `${API_BASE}/forum/threads/${threadId}/replies`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token') || ''}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setReplies(data.replies || []);
      }
    } catch (error) {
      console.error('Error loading replies:', error);
    }
  };

  const createThread = async () => {
    if (!user) {
      toast.error('Please sign in to create a thread');
      return;
    }

    if (!newThreadTitle.trim() || !newThreadContent.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE}/forum/threads`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('access_token') || ''}`,
          },
          body: JSON.stringify({
            title: newThreadTitle,
            content: newThreadContent,
            category: newThreadCategory,
            authorId: user.id,
            authorName: user.user_metadata?.name || user.email,
          }),
        }
      );

      if (response.ok) {
        toast.success('Thread created successfully!');
        setShowNewThread(false);
        setNewThreadTitle('');
        setNewThreadContent('');
        loadThreads();
      }
    } catch (error) {
      console.error('Error creating thread:', error);
      toast.error('Failed to create thread');
    }
  };

  const postReply = async () => {
    if (!user || !selectedThread) {
      toast.error('Please sign in to reply');
      return;
    }

    if (!replyContent.trim()) {
      toast.error('Please write a reply');
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE}/forum/threads/${selectedThread.id}/replies`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('access_token') || ''}`,
          },
          body: JSON.stringify({
            content: replyContent,
            authorId: user.id,
            authorName: user.user_metadata?.name || user.email,
          }),
        }
      );

      if (response.ok) {
        toast.success('Reply posted!');
        setReplyContent('');
        loadReplies(selectedThread.id);
      }
    } catch (error) {
      console.error('Error posting reply:', error);
      toast.error('Failed to post reply');
    }
  };

  const mockThreads: ForumThread[] = [
    {
      id: '1',
      title: 'Best time to visit Darjeeling for snow?',
      content: 'Planning a trip to Darjeeling and want to see snow. When is the best time to visit?',
      author: { id: 'u1', name: 'Priya Sharma' },
      category: 'Planning Help',
      tags: ['Darjeeling', 'Winter', 'Snow'],
      replies: 15,
      views: 234,
      likes: 45,
      isPinned: true,
      isLocked: false,
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
    },
    {
      id: '2',
      title: 'Sundarbans tiger spotting tips',
      content: 'Any tips for increasing chances of tiger sightings in Sundarbans? Best boat operators?',
      author: { id: 'u2', name: 'Rajesh Kumar' },
      category: 'Travel Tips',
      tags: ['Sundarbans', 'Wildlife', 'Safari'],
      replies: 28,
      views: 567,
      likes: 89,
      isPinned: false,
      isLocked: false,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      lastActivity: new Date().toISOString(),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Community Forum</h1>
            <p className="text-gray-600">Connect with fellow travelers and share experiences</p>
          </div>
          <button
            onClick={() => setShowNewThread(!showNewThread)}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors font-semibold"
          >
            <Plus className="w-5 h-5" />
            New Thread
          </button>
        </div>

        {/* New Thread Form */}
        <AnimatePresence>
          {showNewThread && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white rounded-2xl shadow-lg p-6 mb-8"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Create New Thread</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={newThreadTitle}
                    onChange={(e) => setNewThreadTitle(e.target.value)}
                    placeholder="What's your question or topic?"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={newThreadCategory}
                    onChange={(e) => setNewThreadCategory(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    {categories.filter((c) => c !== 'all').map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                  <textarea
                    value={newThreadContent}
                    onChange={(e) => setNewThreadContent(e.target.value)}
                    placeholder="Share your thoughts, questions, or experiences..."
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={createThread}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                  >
                    Post Thread
                  </button>
                  <button
                    onClick={() => setShowNewThread(false)}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    selectedCategory === cat
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat === 'all' ? 'All Categories' : cat}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSortBy('recent')}
                className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 ${
                  sortBy === 'recent' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                <Clock className="w-4 h-4" />
                Recent
              </button>
              <button
                onClick={() => setSortBy('popular')}
                className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 ${
                  sortBy === 'popular' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                <ThumbsUp className="w-4 h-4" />
                Popular
              </button>
              <button
                onClick={() => setSortBy('trending')}
                className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 ${
                  sortBy === 'trending' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                Trending
              </button>
            </div>
          </div>
        </div>

        {/* Threads List */}
        <div className="space-y-4">
          {threads.map((thread) => (
            <motion.div
              key={thread.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer"
              onClick={() => {
                setSelectedThread(thread);
                loadReplies(thread.id);
              }}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                  {thread.author.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {thread.isPinned && <Pin className="w-4 h-4 text-purple-600" />}
                    {thread.isLocked && <Lock className="w-4 h-4 text-gray-400" />}
                    <h3 className="text-xl font-bold text-gray-900">{thread.title}</h3>
                  </div>
                  <p className="text-gray-600 mb-3 line-clamp-2">{thread.content}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-semibold">
                      {thread.category}
                    </span>
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {thread.author.name}
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      {thread.replies} replies
                    </div>
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="w-4 h-4" />
                      {thread.likes} likes
                    </div>
                    <span>{thread.views} views</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Thread Detail Modal */}
        <AnimatePresence>
          {selectedThread && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-6"
              onClick={() => setSelectedThread(null)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-3xl font-bold text-gray-900 mb-4">{selectedThread.title}</h2>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    {selectedThread.author.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold">{selectedThread.author.name}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(selectedThread.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <p className="text-gray-700 mb-8 whitespace-pre-wrap">{selectedThread.content}</p>

                {/* Replies */}
                <div className="border-t border-gray-200 pt-6 space-y-6 mb-6">
                  <h3 className="text-xl font-bold">{replies.length} Replies</h3>
                  {replies.map((reply) => (
                    <div key={reply.id} className="flex gap-3">
                      <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                        {reply.author.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold">{reply.author.name}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(reply.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <p className="text-gray-700">{reply.content}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Reply Form */}
                <div className="border-t border-gray-200 pt-6">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write your reply..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 mb-3"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={postReply}
                      className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                    >
                      Post Reply
                    </button>
                    <button
                      onClick={() => setSelectedThread(null)}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
