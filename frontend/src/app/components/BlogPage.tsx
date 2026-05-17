import { useState, useEffect } from 'react';
import { Calendar, Clock, Tag, Search, ArrowRight, BookOpen, TrendingUp } from 'lucide-react';
import { API_BASE } from '../utils/api';

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  image_url: string;
  read_time: number;
  created_at: string;
  tags: string[];
}

const CATEGORIES = ['All', 'Destinations', 'Food & Cuisine', 'Festivals', 'Travel Tips', 'Culture'];

const FALLBACK_ARTICLES: Article[] = [
  { id: '1', title: 'Top 10 Places to Visit in Darjeeling', slug: 'top-10-darjeeling', excerpt: 'From Tiger Hill sunrise to the famous Darjeeling tea estates, discover the best experiences this hill station has to offer.', content: '', category: 'Destinations', author: 'Bengal Trails Team', image_url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800', read_time: 5, created_at: '2026-04-15', tags: ['darjeeling', 'hills', 'tea'] },
  { id: '2', title: 'A Food Lover\'s Guide to Kolkata Street Food', slug: 'kolkata-street-food-guide', excerpt: 'Kathi rolls, puchka, mishti doi — explore the vibrant street food culture of the City of Joy.', content: '', category: 'Food & Cuisine', author: 'Bengal Trails Team', image_url: 'https://images.unsplash.com/photo-1567337710282-00832b415979?w=800', read_time: 7, created_at: '2026-04-10', tags: ['kolkata', 'food', 'street food'] },
  { id: '3', title: 'Durga Puja: The Biggest Festival of West Bengal', slug: 'durga-puja-guide', excerpt: 'Everything you need to know about experiencing Durga Puja — the grandest celebration in West Bengal.', content: '', category: 'Festivals', author: 'Bengal Trails Team', image_url: 'https://images.unsplash.com/photo-1605640840605-14ac1855827b?w=800', read_time: 6, created_at: '2026-03-20', tags: ['durga puja', 'festival', 'culture'] },
  { id: '4', title: 'Sundarbans: Complete Travel Guide 2026', slug: 'sundarbans-travel-guide', excerpt: 'Plan your perfect Sundarbans trip — best time to visit, boat safaris, where to stay and what to expect.', content: '', category: 'Destinations', author: 'Bengal Trails Team', image_url: 'https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=800', read_time: 8, created_at: '2026-03-05', tags: ['sundarbans', 'wildlife', 'mangrove'] },
  { id: '5', title: 'Best Time to Visit West Bengal', slug: 'best-time-visit-west-bengal', excerpt: 'A month-by-month guide to help you plan the perfect West Bengal trip based on weather, festivals and crowds.', content: '', category: 'Travel Tips', author: 'Bengal Trails Team', image_url: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800', read_time: 4, created_at: '2026-02-18', tags: ['travel tips', 'weather', 'planning'] },
  { id: '6', title: 'Bengali Culture: Traditions You Must Know', slug: 'bengali-culture-traditions', excerpt: 'Dive deep into the rich traditions, music, art and literature that make Bengali culture truly unique.', content: '', category: 'Culture', author: 'Bengal Trails Team', image_url: 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=800', read_time: 6, created_at: '2026-02-01', tags: ['culture', 'traditions', 'art'] },
];

function ArticleCard({ article, onClick }: { article: Article; onClick: () => void }) {
  return (
    <div onClick={onClick} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer group">
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <img src={article.image_url} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800'; }} />
        <span className="absolute top-3 left-3 bg-purple-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">{article.category}</span>
      </div>
      <div className="p-5">
        <h3 className="font-bold text-gray-900 text-lg leading-snug mb-2 group-hover:text-purple-600 transition-colors line-clamp-2">{article.title}</h3>
        <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2">{article.excerpt}</p>
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(article.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{article.read_time} min read</span>
          </div>
          <ArrowRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
}

function ArticleView({ article, onBack }: { article: Article; onBack: () => void }) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button onClick={onBack} className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold mb-6 text-sm">
        ← Back to Blog
      </button>
      <div className="rounded-2xl overflow-hidden h-64 sm:h-80 mb-6 bg-gray-100">
        <img src={article.image_url} alt={article.title} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800'; }} />
      </div>
      <span className="inline-block bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1 rounded-full mb-4">{article.category}</span>
      <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-4 leading-tight">{article.title}</h1>
      <div className="flex items-center gap-4 text-sm text-gray-500 mb-6 pb-6 border-b border-gray-100">
        <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4" />{article.author}</span>
        <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{new Date(article.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{article.read_time} min read</span>
      </div>
      <p className="text-gray-700 leading-relaxed text-base mb-6">{article.excerpt}</p>
      {article.content ? (
        <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: article.content }} />
      ) : (
        <div className="bg-purple-50 border border-purple-100 rounded-xl p-6 text-center">
          <p className="text-purple-700 font-semibold">Full article coming soon!</p>
          <p className="text-purple-500 text-sm mt-1">We're working on detailed content for this article.</p>
        </div>
      )}
      {article.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-gray-100">
          {article.tags.map(tag => (
            <span key={tag} className="flex items-center gap-1 bg-gray-100 text-gray-600 text-xs px-3 py-1.5 rounded-full font-medium">
              <Tag className="w-3 h-3" />{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function BlogPage() {
  const [articles, setArticles] = useState<Article[]>(FALLBACK_ARTICLES);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/blog`)
      .then(r => r.json())
      .then(data => { if (data?.articles?.length) setArticles(data.articles); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = articles.filter(a => {
    const matchCat = activeCategory === 'All' || a.category === activeCategory;
    const matchSearch = !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.excerpt.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  if (selectedArticle) return <ArticleView article={selectedArticle} onBack={() => setSelectedArticle(null)} />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-purple-600 to-purple-800 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-semibold mb-4">
            <TrendingUp className="w-4 h-4" /> Travel Stories & Guides
          </div>
          <h1 className="text-3xl sm:text-4xl font-black mb-3">Bengal Trails Blog</h1>
          <p className="text-purple-200 text-lg mb-8">Discover travel stories, local guides, food adventures and cultural insights from West Bengal</p>
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search articles…" className="w-full pl-11 pr-4 py-3 rounded-full text-gray-800 text-sm outline-none focus:ring-2 focus:ring-purple-300" />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Categories */}
        <div className="flex gap-2 flex-wrap mb-8">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${activeCategory === cat ? 'bg-purple-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300 hover:text-purple-600'}`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Featured Article */}
        {filtered.length > 0 && activeCategory === 'All' && !search && (
          <div onClick={() => setSelectedArticle(filtered[0])}
            className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer mb-8 group">
            <div className="grid md:grid-cols-2">
              <div className="h-64 md:h-auto overflow-hidden bg-gray-100">
                <img src={filtered[0].image_url} alt={filtered[0].title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800'; }} />
              </div>
              <div className="p-8 flex flex-col justify-center">
                <span className="inline-block bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1 rounded-full mb-3 w-fit">⭐ Featured</span>
                <h2 className="text-2xl font-black text-gray-900 mb-3 group-hover:text-purple-600 transition-colors leading-tight">{filtered[0].title}</h2>
                <p className="text-gray-500 leading-relaxed mb-4">{filtered[0].excerpt}</p>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(filtered[0].created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{filtered[0].read_time} min read</span>
                </div>
                <button className="mt-4 flex items-center gap-2 text-purple-600 font-bold text-sm group-hover:gap-3 transition-all">
                  Read Article <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Articles Grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => <div key={i} className="bg-white rounded-2xl h-64 animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">No articles found</p>
            <button onClick={() => { setSearch(''); setActiveCategory('All'); }} className="mt-3 text-purple-600 font-semibold text-sm">Clear filters</button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(activeCategory === 'All' && !search ? filtered.slice(1) : filtered).map(article => (
              <ArticleCard key={article.id} article={article} onClick={() => setSelectedArticle(article)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}