require('dotenv').config();
const pool = require('./pool');

const blogPosts = [
  { id: '1', title: '10 Hidden Gems in Darjeeling Beyond the Toy Train', slug: 'hidden-gems-darjeeling',
    excerpt: 'Discover secret viewpoints, local cafes, and trails most tourists miss in the Queen of Hills.',
    category: 'destinations', author: 'Riya Sen', author_avatar: 'https://i.pravatar.cc/100?u=riya',
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800', read_time: 6 },
  { id: '2', title: 'A Foodie\'s Guide to Kolkata Street Food',
    slug: 'kolkata-street-food-guide',
    excerpt: 'From kathi rolls in Park Street to mishti doi in Bagbazar — the ultimate Kolkata foodie route.',
    category: 'food', author: 'Arjun Banerjee', author_avatar: 'https://i.pravatar.cc/100?u=arjun',
    image: 'https://images.unsplash.com/photo-1567337710282-00832b415979?w=800', read_time: 8 },
  { id: '3', title: 'Sundarbans Tiger Safari: A Complete Guide',
    slug: 'sundarbans-tiger-safari-guide',
    excerpt: 'Everything you need to know about visiting the world\'s largest mangrove delta and spotting Royal Bengal Tigers.',
    category: 'wildlife', author: 'Priya Roy', author_avatar: 'https://i.pravatar.cc/100?u=priya',
    image: 'https://images.unsplash.com/photo-1578269174936-2709b6aeb913?w=800', read_time: 10 },
  { id: '4', title: 'Shantiniketan in Spring: Tagore\'s Magical Land',
    slug: 'shantiniketan-spring-festival',
    excerpt: 'Why Basanta Utsav is the most beautiful festival you\'ve never heard of, and how to plan your visit.',
    category: 'culture', author: 'Suman Ghosh', author_avatar: 'https://i.pravatar.cc/100?u=suman',
    image: 'https://images.unsplash.com/photo-1600298882525-5a0e0dacb8ad?w=800', read_time: 7 },
  { id: '5', title: 'Budget Trip: Exploring Bishnupur in Under ₹3000',
    slug: 'bishnupur-budget-itinerary',
    excerpt: 'A complete weekend itinerary covering terracotta temples, Baluchari sarees, and local food on a tight budget.',
    category: 'budget', author: 'Rohan Das', author_avatar: 'https://i.pravatar.cc/100?u=rohan',
    image: 'https://images.unsplash.com/photo-1697817665440-f988c6d5080f?w=800', read_time: 5 },
  { id: '6', title: 'Why Mandarmani is the Perfect Weekend Beach Getaway',
    slug: 'mandarmani-weekend-getaway',
    excerpt: 'Drive on the beach, watch sunrises, and enjoy fresh seafood — all in 48 hours from Kolkata.',
    category: 'destinations', author: 'Anjali Mukherjee', author_avatar: 'https://i.pravatar.cc/100?u=anjali',
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800', read_time: 4 },
];

const forumThreads = [
  { title: 'Best time to visit Darjeeling for clear Kanchenjunga views?', category: 'travel-tips',
    content: 'Planning my first trip and want to make sure I get those famous mountain views. Friends have given conflicting advice — some say October, others swear by April. What\'s your experience?',
    user_email: 'priya@bengaltrails.com', tags: ['darjeeling', 'weather'] },
  { title: 'Solo female traveler heading to Sundarbans — safety tips?', category: 'safety',
    content: 'Going on a 2-day safari next month. Any recommendations for trustworthy tour operators and dos/donts as a solo woman traveler?',
    user_email: 'priya@bengaltrails.com', tags: ['sundarbans', 'solo-travel', 'safety'] },
  { title: 'Hidden gems near Kolkata for a weekend trip?', category: 'recommendations',
    content: 'Tired of going to Digha and Mandarmani every weekend. Looking for offbeat places within 200km of Kolkata. Suggestions please!',
    user_email: 'arjun@bengaltrails.com', tags: ['kolkata', 'weekend', 'offbeat'] },
  { title: 'Vegetarian food options in Bengal — is it really hard?', category: 'food',
    content: 'I\'m a strict vegetarian and worried about food options when traveling through West Bengal. Have any veg travelers been there recently? What worked for you?',
    user_email: 'rohan@bengaltrails.com', tags: ['food', 'vegetarian'] },
  { title: 'Toy Train booking — IRCTC vs offline counter?', category: 'travel-tips',
    content: 'Trying to book the Darjeeling Himalayan Railway joy ride. IRCTC website keeps showing "no availability" but heard offline counter has tickets. Anyone done this recently?',
    user_email: 'arjun@bengaltrails.com', tags: ['darjeeling', 'toy-train', 'booking'] },
];

async function seed() {
  const client = await pool.connect();
  try {
    console.log('🌱 Seeding sample content...\n');
    await client.query('BEGIN');

    // Create blog_posts table if missing
    await client.query(`
      CREATE TABLE IF NOT EXISTS blog_posts (
        id            VARCHAR(50) PRIMARY KEY,
        slug          VARCHAR(255) UNIQUE NOT NULL,
        title         VARCHAR(255) NOT NULL,
        excerpt       TEXT,
        content       TEXT,
        category      VARCHAR(100),
        author        VARCHAR(255),
        author_avatar TEXT,
        image         TEXT,
        read_time     INTEGER DEFAULT 5,
        views         INTEGER DEFAULT 0,
        created_at    TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Insert blog posts
    for (const p of blogPosts) {
      await client.query(`
        INSERT INTO blog_posts (id, slug, title, excerpt, category, author, author_avatar, image, read_time)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        ON CONFLICT (id) DO UPDATE SET title = $3, excerpt = $4
      `, [p.id, p.slug, p.title, p.excerpt, p.category, p.author, p.author_avatar, p.image, p.read_time]);
    }
    console.log(`✅ ${blogPosts.length} blog posts seeded`);

    // Create sample users for forum content
    const bcrypt = require('bcryptjs');
    const users = ['priya@bengaltrails.com', 'arjun@bengaltrails.com', 'rohan@bengaltrails.com'];
    const userIds = {};
    for (const email of users) {
      const name = email.split('@')[0];
      const pw = await bcrypt.hash('Demo@1234', 10);
      const { rows } = await client.query(`
        INSERT INTO users (email, password, name, role, status, avatar_url)
        VALUES ($1, $2, $3, 'user', 'active', $4)
        ON CONFLICT (email) DO UPDATE SET name = $3 RETURNING id
      `, [email, pw, name.charAt(0).toUpperCase() + name.slice(1), `https://i.pravatar.cc/100?u=${name}`]);
      userIds[email] = rows[0].id;
      // Init points
      await client.query('INSERT INTO user_points (user_id) VALUES ($1) ON CONFLICT DO NOTHING', [rows[0].id]);
    }
    console.log(`✅ ${users.length} sample community users seeded`);

    // Insert forum threads
    for (const t of forumThreads) {
      await client.query(`
        INSERT INTO forum_threads (user_id, title, content, category, tags)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT DO NOTHING
      `, [userIds[t.user_email], t.title, t.content, t.category, t.tags]);
    }
    console.log(`✅ ${forumThreads.length} forum threads seeded`);

    // Add a few sample reviews to popular destinations
    const sampleReviews = [
      { slug: 'darjeeling', user: 'priya@bengaltrails.com', rating: 5, title: 'Absolutely magical!', content: 'The toy train ride was the highlight of my trip. Misty mountains, hot tea, and warm hospitality. Cannot wait to go back!', visit_date: '2024-11-15' },
      { slug: 'darjeeling', user: 'arjun@bengaltrails.com', rating: 4, title: 'Beautiful but crowded', content: 'Stunning views but very touristy in peak season. Recommend visiting in shoulder months for a quieter experience.', visit_date: '2024-12-20' },
      { slug: 'sundarbans-national-park', user: 'priya@bengaltrails.com', rating: 5, title: 'Once in a lifetime!', content: 'We spotted a tiger! The boat safari was thrilling. Stay overnight at Sajnekhali for the best experience.', visit_date: '2025-01-10' },
      { slug: 'shantiniketan', user: 'rohan@bengaltrails.com', rating: 5, title: 'Tagore\'s spirit lives here', content: 'Visit during Poush Mela for the full cultural experience. The Baul singers are mesmerizing.', visit_date: '2024-12-25' },
    ];

    for (const r of sampleReviews) {
      const userId = userIds[r.user];
      if (!userId) continue;
      await client.query(`
        INSERT INTO reviews (user_id, destination_slug, rating, title, content, visit_date, status)
        VALUES ($1, $2, $3, $4, $5, $6, 'published')
        ON CONFLICT DO NOTHING
      `, [userId, r.slug, r.rating, r.title, r.content, r.visit_date]);
    }
    console.log(`✅ ${sampleReviews.length} sample reviews seeded`);

    // Update destination ratings
    await client.query(`
      UPDATE destinations d SET
        rating = (SELECT COALESCE(AVG(rating)::numeric(3,2), 0) FROM reviews WHERE destination_slug = d.slug AND status = 'published'),
        review_count = (SELECT COUNT(*) FROM reviews WHERE destination_slug = d.slug AND status = 'published')
      WHERE slug IN ('darjeeling', 'sundarbans-national-park', 'shantiniketan')
    `);
    console.log(`✅ Destination ratings updated`);

    await client.query('COMMIT');
    console.log('\n🎉 Sample content seeding complete!\n');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seed failed:', err);
    console.warn("⚠️  Seed failed (non-fatal) — server will still start:", err.message);
    process.exit(0); // exit 0 so deploy does not fail
  } finally {
    client.release();
    pool.end();
  }
}

seed();
