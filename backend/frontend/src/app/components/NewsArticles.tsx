import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Clock, User, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from './ui/button';

const articles = [
  {
    id: 'article-1',
    title: 'Top 10 Hidden Gems in West Bengal You Must Visit',
    excerpt: 'Discover the lesser-known destinations that showcase the true beauty and culture of West Bengal.',
    category: 'Travel Tips',
    author: 'Amit Kumar',
    publishDate: 'Nov 15, 2025',
    readingTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1688024099219-fd598f8f0b19?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBoZXJpdGFnZSUyMHRlbXBsZXxlbnwxfHx8fDE3NjM0NDc5Njd8MA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 'article-2',
    title: 'Complete Guide to Darjeeling Tea Gardens',
    excerpt: 'Everything you need to know about visiting the famous tea estates of Darjeeling, from best times to visit to tasting tips.',
    category: 'Destination Guide',
    author: 'Sneha Chatterjee',
    publishDate: 'Nov 12, 2025',
    readingTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1679418536818-7a7fb2db49bc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXJqZWVsaW5nJTIwdGVhJTIwZ2FyZGVuc3xlbnwxfHx8fDE3NjM0NDc5MDd8MA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 'article-3',
    title: 'Wildlife Safari in Sundarbans: What to Expect',
    excerpt: 'Plan your perfect wildlife adventure in the Sundarbans with our comprehensive guide to spotting Royal Bengal Tigers.',
    category: 'Wildlife',
    author: 'Rajesh Banerjee',
    publishDate: 'Nov 10, 2025',
    readingTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1611824376845-4edd38195937?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdW5kYXJiYW5zJTIwbWFuZ3JvdmV8ZW58MXx8fHwxNzYzNDQ3OTA3fDA&ixlib=rb-4.1.0&q=80&w=1080',
  },
];

export function NewsArticles() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-[1440px] mx-auto px-6 md:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-end justify-between mb-12"
        >
          <div>
            <h2 className="mb-4">Latest News & Articles</h2>
            <p className="text-[#6B7280] text-lg max-w-2xl">
              Expert tips, destination guides, and travel inspiration to help you plan your perfect West Bengal adventure
            </p>
          </div>
          <Button variant="ghost" className="hidden lg:flex items-center gap-2">
            View All
            <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {articles.map((article, index) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <Card
                className="group overflow-hidden border-0 shadow-[0_4px_12px_rgba(12,18,30,0.06)] hover:shadow-[0_12px_32px_rgba(12,18,30,0.12)] transition-all cursor-pointer h-full flex flex-col"
                onClick={() => {
                  if (typeof window !== 'undefined' && (window as any).gtag) {
                    (window as any).gtag('event', 'article_open', {
                      article_id: article.id,
                      category: article.category,
                    });
                  }
                }}
              >
                {/* Image */}
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <Badge className="absolute top-4 left-4 bg-white text-[#111827]">
                    {article.category}
                  </Badge>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="mb-3 group-hover:text-[#6A00FF] transition-colors">
                    {article.title}
                  </h3>

                  <p className="text-[#6B7280] mb-4 flex-1">{article.excerpt}</p>

                  <div className="flex items-center gap-4 text-sm text-[#6B7280] pt-4 border-t border-[#6B7280]/10">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{article.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{article.readingTime}</span>
                    </div>
                  </div>

                  <div className="text-xs text-[#6B7280] mt-2">{article.publishDate}</div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12 lg:hidden">
          <Button variant="outline" className="rounded-full px-8">
            View All Articles
          </Button>
        </div>
      </div>
    </section>
  );
}
