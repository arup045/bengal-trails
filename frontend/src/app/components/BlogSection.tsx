import { API_BASE, getToken} from '../utils/api';
import React, { useState, useEffect } from 'react';
import { Calendar, User, Clock, Heart, MessageCircle, Share2, Tag, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  author: {
    name: string;
    avatar?: string;
  };
  category: string;
  tags: string[];
  publishedAt: string;
  readTime: number;
  likes: number;
  comments: number;
  trending: boolean;
}

export const BlogSection: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  const categories = ['all', 'Travel Tips', 'Destinations', 'Food & Culture', 'Photography', 'Adventure'];

  useEffect(() => {
    loadBlogPosts();
  }, [selectedCategory]);

  const loadBlogPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE}/blog?category=${selectedCategory}`,
        {
          headers: {
            Authorization: `Bearer ${getToken() || ''}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || mockPosts);
      }
    } catch (error) {
      console.error('Error loading blog posts:', error);
      setPosts(mockPosts);
    } finally {
      setLoading(false);
    }
  };

  const mockPosts: BlogPost[] = [
    {
      id: '1',
      slug: 'best-time-visit-darjeeling',
      title: 'The Ultimate Guide to Visiting Darjeeling: Best Time and Tips',
      excerpt: 'Discover the perfect time to visit Darjeeling, hidden gems, and insider tips for an unforgettable tea country experience.',
      content: '',
      featuredImage: 'https://images.unsplash.com/photo-1586672806791-3a5a4e8d1d85',
      author: { name: 'Anita Roy', avatar: '' },
      category: 'Destinations',
      tags: ['Darjeeling', 'Hill Stations', 'Tea Gardens'],
      publishedAt: new Date().toISOString(),
      readTime: 8,
      likes: 234,
      comments: 45,
      trending: true,
    },
    {
      id: '2',
      slug: 'bengali-street-food-guide',
      title: '10 Must-Try Bengali Street Foods in Kolkata',
      excerpt: 'From puchka to kathi rolls, explore the vibrant street food scene of Kolkata with our comprehensive guide.',
      content: '',
      featuredImage: 'https://images.unsplash.com/photo-1601050690597-df0568f70950',
      author: { name: 'Rajesh Sen', avatar: '' },
      category: 'Food & Culture',
      tags: ['Kolkata', 'Street Food', 'Bengali Cuisine'],
      publishedAt: new Date(Date.now() - 86400000).toISOString(),
      readTime: 6,
      likes: 567,
      comments: 89,
      trending: true,
    },
    {
      id: '3',
      slug: 'sundarbans-photography-tips',
      title: 'Capturing the Sundarbans: Photography Tips for Wildlife Enthusiasts',
      excerpt: 'Professional tips for photographing the majestic Royal Bengal Tigers and the unique mangrove ecosystem.',
      content: '',
      featuredImage: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7',
      author: { name: 'Priya Sharma', avatar: '' },
      category: 'Photography',
      tags: ['Sundarbans', 'Wildlife Photography', 'Nature'],
      publishedAt: new Date(Date.now() - 172800000).toISOString(),
      readTime: 10,
      likes: 432,
      comments: 67,
      trending: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Travel Stories & Tips</h1>
          <p className="text-xl text-gray-600">Expert insights and authentic experiences from West Bengal</p>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-3 rounded-full font-semibold transition-all ${
                selectedCategory === category
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-purple-50'
              }`}
            >
              {category === 'all' ? 'All Posts' : category}
            </button>
          ))}
        </div>

        {/* Featured Post */}
        {posts.length > 0 && posts[0].trending && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
              <div className="grid md:grid-cols-2">
                <div className="relative h-96 md:h-auto">
                  <img
                    src={posts[0].featuredImage}
                    alt={posts[0].title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4 bg-red-600 text-white px-4 py-2 rounded-full font-bold flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Trending
                  </div>
                </div>
                <div className="p-8 md:p-12 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-4">
                    <Tag className="w-4 h-4 text-purple-600" />
                    <span className="text-purple-600 font-semibold">{posts[0].category}</span>
                  </div>
                  <h2 className="text-4xl font-bold text-gray-900 mb-4">{posts[0].title}</h2>
                  <p className="text-gray-600 text-lg mb-6">{posts[0].excerpt}</p>
                  <div className="flex items-center gap-6 mb-6 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {posts[0].author.name}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(posts[0].publishedAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {posts[0].readTime} min read
                    </div>
                  </div>
                  <button className="px-8 py-4 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors font-semibold text-lg">
                    Read Full Story
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Blog Grid */}
        {loading ? (
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
                <div className="h-64 bg-gray-200"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {posts.slice(1).map((post) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all group cursor-pointer"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={post.featuredImage}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {post.category}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {post.author.name}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {post.readTime} min
                    </div>
                  </div>
                  <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                    <button className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors">
                      <Heart className="w-4 h-4" />
                      {post.likes}
                    </button>
                    <button className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors">
                      <MessageCircle className="w-4 h-4" />
                      {post.comments}
                    </button>
                    <button className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors ml-auto" aria-label="Share post">
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}

        {/* Load More */}
        <div className="text-center mt-12">
          <button className="px-8 py-4 bg-white text-purple-600 rounded-full hover:bg-purple-50 transition-colors font-semibold shadow-lg">
            Load More Stories
          </button>
        </div>
      </div>
    </div>
  );
};
