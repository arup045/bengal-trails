import { useState, useEffect } from 'react';
import { Calendar, Clock, Tag, Search, ArrowRight, BookOpen, TrendingUp } from 'lucide-react';
import { API_BASE } from '../utils/api';
import { sanitizeRichText } from '../utils/sanitize';
import { clickable } from '../utils/a11y';

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
  { id: '1', title: 'Top 10 Places to Visit in Darjeeling', slug: 'top-10-darjeeling', excerpt: 'From Tiger Hill sunrise to the famous Darjeeling tea estates, discover the best experiences this hill station has to offer.', category: 'Destinations', author: 'Bengal Trails Team', image_url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800', read_time: 5, created_at: '2026-04-15', tags: ['darjeeling', 'hills', 'tea'],
    content: `<p>The "Queen of the Hills" rewards every kind of traveller. Here are ten experiences worth building a Darjeeling itinerary around.</p>
<h2>1. Tiger Hill sunrise</h2><p>Set out before dawn to watch the first light hit Kanchenjunga — on clear days you can even glimpse Everest on the horizon. Go October–November or March–May for the best odds.</p>
<h2>2. The Toy Train</h2><p>The UNESCO-listed Darjeeling Himalayan Railway still runs steam-hauled joy rides to Ghum, India's highest station, looping through Batasia.</p>
<h2>3. Happy Valley Tea Estate</h2><p>Tour a working garden, watch leaves being processed, and taste a fresh first-flush brew.</p>
<h2>4–10. More to love</h2><ul>
<li><strong>Batasia Loop</strong> — spiralling track with a war memorial and mountain views.</li>
<li><strong>Ghum Monastery</strong> — the area's oldest Tibetan monastery.</li>
<li><strong>Padmaja Naidu Zoological Park</strong> — red pandas and snow leopards.</li>
<li><strong>HMI</strong> — the Himalayan Mountaineering Institute and museum.</li>
<li><strong>Peace Pagoda</strong> — serene Japanese stupa.</li>
<li><strong>Chowrasta Mall</strong> — the town's lively pedestrian heart.</li>
<li><strong>Rock Garden & Ganga Maya Park</strong> — terraced gardens by a stream.</li></ul>
<p>Allow 3–4 days, pack warm layers year-round, and book the toy train in advance.</p>` },
  { id: '2', title: 'A Food Lover\'s Guide to Kolkata Street Food', slug: 'kolkata-street-food-guide', excerpt: 'Kathi rolls, puchka, mishti doi — explore the vibrant street food culture of the City of Joy.', category: 'Food & Cuisine', author: 'Bengal Trails Team', image_url: 'https://images.unsplash.com/photo-1567337710282-00832b415979?w=800', read_time: 7, created_at: '2026-04-10', tags: ['kolkata', 'food', 'street food'],
    content: `<p>Kolkata eats well on every corner. Come hungry and graze your way through these classics.</p>
<h2>The must-tries</h2><ul>
<li><strong>Kathi roll</strong> — the city's gift to the world: kebab and egg wrapped in a flaky paratha. Try Nizam's or Kusum near New Market.</li>
<li><strong>Puchka</strong> — Kolkata's sharper, tangier take on pani puri, finished with tamarind water.</li>
<li><strong>Telebhaja</strong> — crisp fritters (beguni, alur chop) best with evening cha.</li>
<li><strong>Kosha mangsho with luchi</strong> — slow-cooked mutton and puffed bread.</li>
<li><strong>Mughlai paratha</strong> — egg-and-keema stuffed, deep-fried.</li></ul>
<h2>Sweet finish</h2><p>No trip is complete without <strong>mishti doi</strong> (caramelised sweet yoghurt), <strong>rosogolla</strong>, and winter's <strong>nolen gur sandesh</strong>.</p>
<h2>Where to graze</h2><p>Head to Decker's Lane for lunch, Vivekananda Park for puchka, and College Street's Coffee House for adda over coffee. Carry small cash and eat where the queues are longest.</p>` },
  { id: '3', title: 'Durga Puja: The Biggest Festival of West Bengal', slug: 'durga-puja-guide', excerpt: 'Everything you need to know about experiencing Durga Puja — the grandest celebration in West Bengal.', category: 'Festivals', author: 'Bengal Trails Team', image_url: 'https://images.unsplash.com/photo-1605640840605-14ac1855827b?w=800', read_time: 6, created_at: '2026-03-20', tags: ['durga puja', 'festival', 'culture'],
    content: `<p>For five days each autumn, Kolkata becomes the world's biggest open-air art gallery. Durga Puja — now on UNESCO's Intangible Heritage list — celebrates the goddess Durga's victory over evil.</p>
<h2>When it happens</h2><p>Usually late September to October. The key days run Shoshthi through Dashami, peaking on Ashtami.</p>
<h2>How to experience it</h2><ul>
<li><strong>Pandal hopping</strong> — themed pavilions range from village crafts to giant art installations. North Kolkata (Kumartuli, Bagbazar) and South (Ekdalia, Mudiali) are favourites.</li>
<li><strong>Kumartuli</strong> — visit the potters' quarter beforehand to see idols being sculpted.</li>
<li><strong>Dhunuchi naach</strong> — incense dance during evening aarti.</li>
<li><strong>Sindoor khela & immersion</strong> — the emotional farewell on Dashami.</li></ul>
<h2>Tips</h2><p>Expect huge crowds and walk a lot — wear comfortable shoes, start pandal hopping after dusk, and book stays months ahead.</p>` },
  { id: '4', title: 'Sundarbans: Complete Travel Guide 2026', slug: 'sundarbans-travel-guide', excerpt: 'Plan your perfect Sundarbans trip — best time to visit, boat safaris, where to stay and what to expect.', category: 'Destinations', author: 'Bengal Trails Team', image_url: 'https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=800', read_time: 8, created_at: '2026-03-05', tags: ['sundarbans', 'wildlife', 'mangrove'],
    content: `<p>The Sundarbans is the world's largest mangrove forest and the only one home to the Royal Bengal Tiger — a UNESCO World Heritage Site straddling India and Bangladesh.</p>
<h2>Best time to visit</h2><p>November to February: cool, dry weather and the best wildlife sightings. Avoid the monsoon (June–September).</p>
<h2>Getting there</h2><p>Drive or take a train from Kolkata to Godkhali/Gosaba (around 3–4 hours), then transfer to a boat — the only way to explore the delta.</p>
<h2>What to do</h2><ul>
<li><strong>Boat safari</strong> through narrow creeks past Sajnekhali, Sudhanyakhali and Dobanki watchtowers.</li>
<li><strong>Wildlife spotting</strong> — spotted deer, estuarine crocodiles, kingfishers and, if lucky, a tiger.</li>
<li><strong>Mangrove walks</strong> on raised canopy trails.</li></ul>
<h2>Stay & tips</h2><p>Choose forest-edge eco resorts or government lodges. Carry binoculars, mosquito repellent and a permit (arranged by most tour operators). Patience is everything — the magic is in the stillness.</p>` },
  { id: '5', title: 'Best Time to Visit West Bengal', slug: 'best-time-visit-west-bengal', excerpt: 'A month-by-month guide to help you plan the perfect West Bengal trip based on weather, festivals and crowds.', category: 'Travel Tips', author: 'Bengal Trails Team', image_url: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800', read_time: 4, created_at: '2026-02-18', tags: ['travel tips', 'weather', 'planning'],
    content: `<p>West Bengal packs the Himalayas, a mangrove delta and a buzzing metropolis into one state — so timing depends on where you're headed.</p>
<h2>Winter (Nov–Feb) — the all-rounder</h2><p>Cool and dry. Ideal for Kolkata, the Sundarbans, beaches like Digha, and the plains. Peak season, so book ahead.</p>
<h2>Summer (Mar–Jun) — head for the hills</h2><p>The plains get hot, but it's prime time for Darjeeling, Kalimpong and Mirik, with clear mountain views.</p>
<h2>Monsoon (Jul–Sep) — lush and green</h2><p>Heavy rain, but tea gardens and waterfalls look spectacular. Watch for landslides in the hills.</p>
<h2>Festival season (Sep–Nov)</h2><p>Durga Puja transforms Kolkata — unforgettable, but the busiest and priciest window.</p>
<p><strong>Verdict:</strong> October–February suits most first-time visitors.</p>` },
  { id: '6', title: 'Bengali Culture: Traditions You Must Know', slug: 'bengali-culture-traditions', excerpt: 'Dive deep into the rich traditions, music, art and literature that make Bengali culture truly unique.', category: 'Culture', author: 'Bengal Trails Team', image_url: 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=800', read_time: 6, created_at: '2026-02-01', tags: ['culture', 'traditions', 'art'],
    content: `<p>Bengal's culture is built on art, intellect and warmth — a heritage that gave India its first Nobel laureate and its national anthem.</p>
<h2>Literature & music</h2><p>Rabindranath Tagore's poetry, songs (<em>Rabindra Sangeet</em>) and Shantiniketan still shape Bengali identity. Baul folk singers carry a mystical tradition across the countryside.</p>
<h2>Art & craft</h2><p>From Kalighat pat paintings and Kumartuli clay idols to Bishnupur's terracotta temples and Baluchari silk, craftsmanship runs deep.</p>
<h2>Everyday life</h2><ul>
<li><strong>Adda</strong> — the beloved art of long, free-flowing conversation.</li>
<li><strong>Food first</strong> — meals move from bitter to sweet, ending with mishti.</li>
<li><strong>Festivals</strong> — Durga Puja, Poush Mela and Saraswati Puja anchor the calendar.</li></ul>
<p>To feel it firsthand, wander College Street, catch a performance at a para pandal, and share a cup of cha with a local.</p>` },
];

function ArticleCard({ article, onClick }: { article: Article; onClick: () => void }) {
  return (
    <div {...clickable(onClick, `Read article: ${article.title}`)} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer group">
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
        // SECURITY: article.content comes from the API. Always sanitize before rendering.
        // sanitizeRichText strips <script>, on* handlers, javascript: URLs, iframes, etc.
        <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: sanitizeRichText(article.content) }} />
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
      // The backend returns { posts }, camelCased (image_url → imageUrl …). The
      // old code read data.articles (wrong key) so real posts never showed and
      // it always fell back to the static list. Map posts back to the snake_case
      // Article shape this component renders.
      .then(data => {
        const posts = data?.posts || data?.articles;
        if (Array.isArray(posts) && posts.length) {
          setArticles(posts.map((p: any): Article => ({
            id: p.id, title: p.title, slug: p.slug, excerpt: p.excerpt,
            content: p.content, category: p.category, author: p.author,
            image_url: p.imageUrl ?? p.image_url,
            read_time: p.readTime ?? p.read_time,
            created_at: p.createdAt ?? p.created_at,
            tags: p.tags || [],
          })));
        }
      })
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
          <div {...clickable(() => setSelectedArticle(filtered[0]), `Read featured article: ${filtered[0].title}`)}
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