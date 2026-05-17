require('dotenv').config();
const pool = require('./pool');

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('🚀 Running Bengal Trails database migration...');

    await client.query('BEGIN');

    // ── Extensions ──────────────────────────────────────────────────────────
    await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    // ── Users ────────────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email       VARCHAR(255) UNIQUE NOT NULL,
        password    VARCHAR(255),                        -- null for OAuth users
        name        VARCHAR(255) NOT NULL,
        role        VARCHAR(50)  DEFAULT 'user' CHECK (role IN ('user','admin','moderator')),
        status      VARCHAR(50)  DEFAULT 'active' CHECK (status IN ('active','inactive','suspended')),
        avatar_url  TEXT,
        phone       VARCHAR(20),
        location    VARCHAR(255),
        bio         TEXT,
        provider    VARCHAR(50)  DEFAULT 'local',        -- local | google | facebook
        provider_id VARCHAR(255),
        created_at  TIMESTAMPTZ  DEFAULT NOW(),
        updated_at  TIMESTAMPTZ  DEFAULT NOW(),
        last_login  TIMESTAMPTZ
      );
      CREATE INDEX IF NOT EXISTS idx_users_email  ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_role   ON users(role);
    `);

    // ── Destinations ─────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS destinations (
        id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name                VARCHAR(255) NOT NULL,
        slug                VARCHAR(255) UNIQUE NOT NULL,
        category            VARCHAR(100) NOT NULL,
        region              VARCHAR(100) NOT NULL,
        description         TEXT         NOT NULL,
        short_description   VARCHAR(500),
        image_url           TEXT,
        gallery_images      TEXT[],
        price_range         VARCHAR(50),
        price_from          INTEGER,
        best_time_to_visit  VARCHAR(255),
        duration            VARCHAR(100),
        highlights          TEXT[],
        activities          TEXT[],
        latitude            DECIMAL(10,8),
        longitude           DECIMAL(11,8),
        rating              DECIMAL(3,2) DEFAULT 0.0,
        review_count        INTEGER      DEFAULT 0,
        view_count          INTEGER      DEFAULT 0,
        featured            BOOLEAN      DEFAULT false,
        status              VARCHAR(50)  DEFAULT 'published' CHECK (status IN ('draft','published','archived')),
        created_at          TIMESTAMPTZ  DEFAULT NOW(),
        updated_at          TIMESTAMPTZ  DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_destinations_slug     ON destinations(slug);
      CREATE INDEX IF NOT EXISTS idx_destinations_category ON destinations(category);
      CREATE INDEX IF NOT EXISTS idx_destinations_region   ON destinations(region);
      CREATE INDEX IF NOT EXISTS idx_destinations_featured ON destinations(featured);
      CREATE INDEX IF NOT EXISTS idx_destinations_status   ON destinations(status);
    `);

    // ── Reviews ──────────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id         UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        destination_slug VARCHAR(255) NOT NULL,
        rating          INTEGER      NOT NULL CHECK (rating >= 1 AND rating <= 5),
        title           VARCHAR(255),
        content         TEXT         NOT NULL,
        visit_date      DATE,
        helpful_count   INTEGER      DEFAULT 0,
        status          VARCHAR(50)  DEFAULT 'published' CHECK (status IN ('pending','published','rejected')),
        photos          TEXT[],
        created_at      TIMESTAMPTZ  DEFAULT NOW(),
        updated_at      TIMESTAMPTZ  DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_reviews_slug   ON reviews(destination_slug);
      CREATE INDEX IF NOT EXISTS idx_reviews_user   ON reviews(user_id);
      CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
    `);

    // ── Bookings ─────────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        booking_id          VARCHAR(50) UNIQUE NOT NULL,
        user_id             UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        destination_slug    VARCHAR(255) NOT NULL,
        destination_name    VARCHAR(255) NOT NULL,
        check_in            DATE,
        check_out           DATE,
        guests              INTEGER     DEFAULT 1,
        rooms               INTEGER     DEFAULT 1,
        accommodation_type  VARCHAR(100),
        add_ons             JSONB,
        total               DECIMAL(10,2),
        status              VARCHAR(50) DEFAULT 'confirmed' CHECK (status IN ('pending','confirmed','cancelled','completed')),
        created_at          TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
    `);

    // ── Wishlists ─────────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS wishlists (
        id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id          UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        destination_slug VARCHAR(255) NOT NULL,
        added_at         TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, destination_slug)
      );
      CREATE INDEX IF NOT EXISTS idx_wishlists_user ON wishlists(user_id);
    `);

    // ── Trip Plans ───────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS trip_plans (
        id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id      UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name         VARCHAR(255) NOT NULL,
        description  TEXT,
        start_date   DATE,
        end_date     DATE,
        destinations JSONB,
        total_budget DECIMAL(10,2),
        status       VARCHAR(50) DEFAULT 'planning' CHECK (status IN ('planning','confirmed','completed','cancelled')),
        created_at   TIMESTAMPTZ DEFAULT NOW(),
        updated_at   TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_trip_plans_user ON trip_plans(user_id);
    `);

    // ── Newsletter ───────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email           VARCHAR(255) UNIQUE NOT NULL,
        name            VARCHAR(255),
        status          VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active','unsubscribed')),
        subscribed_at   TIMESTAMPTZ DEFAULT NOW(),
        unsubscribed_at TIMESTAMPTZ
      );
      CREATE INDEX IF NOT EXISTS idx_newsletter_email  ON newsletter_subscribers(email);
      CREATE INDEX IF NOT EXISTS idx_newsletter_status ON newsletter_subscribers(status);
    `);

    // ── Notifications ────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type       VARCHAR(100) NOT NULL,
        title      VARCHAR(255) NOT NULL,
        message    TEXT         NOT NULL,
        action_url VARCHAR(255),
        read       BOOLEAN      DEFAULT false,
        created_at TIMESTAMPTZ  DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
      CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
    `);

    // ── Social Posts ─────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS social_posts (
        id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id          UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content          TEXT        NOT NULL,
        destination_slug VARCHAR(255),
        visit_date       DATE,
        images           TEXT[],
        likes_count      INTEGER     DEFAULT 0,
        comments_count   INTEGER     DEFAULT 0,
        created_at       TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_posts_user ON social_posts(user_id);
    `);

    // ── Post Likes ───────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS post_likes (
        user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        post_id    UUID NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        PRIMARY KEY (user_id, post_id)
      );
    `);

    // ── Post Comments ─────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS post_comments (
        id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        post_id    UUID  NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
        user_id    UUID  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content    TEXT  NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_comments_post ON post_comments(post_id);
    `);

    // ── User Follows ──────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_follows (
        follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at  TIMESTAMPTZ DEFAULT NOW(),
        PRIMARY KEY (follower_id, following_id)
      );
    `);

    // ── Forum Threads ─────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS forum_threads (
        id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id        UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title          VARCHAR(255) NOT NULL,
        content        TEXT         NOT NULL,
        category       VARCHAR(100) DEFAULT 'general',
        tags           TEXT[],
        likes_count    INTEGER      DEFAULT 0,
        replies_count  INTEGER      DEFAULT 0,
        views_count    INTEGER      DEFAULT 0,
        is_pinned      BOOLEAN      DEFAULT false,
        created_at     TIMESTAMPTZ  DEFAULT NOW(),
        updated_at     TIMESTAMPTZ  DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_threads_category ON forum_threads(category);
    `);

    // ── Forum Replies ─────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS forum_replies (
        id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        thread_id  UUID  NOT NULL REFERENCES forum_threads(id) ON DELETE CASCADE,
        user_id    UUID  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content    TEXT  NOT NULL,
        likes_count INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_replies_thread ON forum_replies(thread_id);
    `);

    // ── Site Settings ─────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS site_settings (
        key        VARCHAR(255) PRIMARY KEY,
        value      JSONB        NOT NULL,
        updated_at TIMESTAMPTZ  DEFAULT NOW()
      );
    `);

    // ── Analytics Events ──────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS analytics_events (
        id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        event_type       VARCHAR(100) NOT NULL,
        user_id          UUID REFERENCES users(id) ON DELETE SET NULL,
        destination_slug VARCHAR(255),
        metadata         JSONB,
        created_at       TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_analytics_type       ON analytics_events(event_type);
      CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics_events(created_at);
    `);

    // ── Password Reset Tokens ─────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token      VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMPTZ  NOT NULL,
        used       BOOLEAN      DEFAULT false,
        created_at TIMESTAMPTZ  DEFAULT NOW()
      );
    `);

    // ── Gamification ──────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_points (
        user_id          UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        points           INTEGER DEFAULT 0,
        level            INTEGER DEFAULT 1,
        visited_places   INTEGER DEFAULT 0,
        reviews_written  INTEGER DEFAULT 0,
        photos_shared    INTEGER DEFAULT 0,
        updated_at       TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // ── Issue Reports ─────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS issue_reports (
        id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id          UUID REFERENCES users(id) ON DELETE SET NULL,
        destination_slug VARCHAR(255),
        type             VARCHAR(100),
        description      TEXT NOT NULL,
        status           VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open','in_progress','resolved')),
        created_at       TIMESTAMPTZ DEFAULT NOW()
      );
    `);



    // ── Full-text search column for destinations ─────────────────────────────
    await client.query(`
      ALTER TABLE destinations ADD COLUMN IF NOT EXISTS tsv_search tsvector;
      CREATE INDEX IF NOT EXISTS idx_destinations_tsv ON destinations USING GIN(tsv_search);

      CREATE OR REPLACE FUNCTION update_destinations_tsv() RETURNS TRIGGER AS $$
      BEGIN
        NEW.tsv_search :=
          setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
          setweight(to_tsvector('english', COALESCE(NEW.region, '')), 'B') ||
          setweight(to_tsvector('english', COALESCE(NEW.category, '')), 'B') ||
          setweight(to_tsvector('english', COALESCE(NEW.short_description, '')), 'C') ||
          setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'D');
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS trg_destinations_tsv ON destinations;
      CREATE TRIGGER trg_destinations_tsv
      BEFORE INSERT OR UPDATE ON destinations
      FOR EACH ROW EXECUTE FUNCTION update_destinations_tsv();

      UPDATE destinations SET tsv_search = NULL WHERE tsv_search IS NULL;

      -- ── Trigram fuzzy search (for typo tolerance) ──
      CREATE EXTENSION IF NOT EXISTS pg_trgm;
      CREATE INDEX IF NOT EXISTS idx_destinations_name_trgm
        ON destinations USING GIN (LOWER(name) gin_trgm_ops);
      CREATE INDEX IF NOT EXISTS idx_destinations_region_trgm
        ON destinations USING GIN (LOWER(region) gin_trgm_ops);
    `);

    // ── pgvector for semantic search (RAG) — optional, falls back gracefully ──
    try {
      await client.query(`CREATE EXTENSION IF NOT EXISTS vector;`);
      await client.query(`
        CREATE TABLE IF NOT EXISTS content_embeddings (
          id           SERIAL PRIMARY KEY,
          content_type TEXT NOT NULL,        -- 'destination' | 'festival' | 'food'
          content_id   TEXT NOT NULL,        -- slug for destinations, id for others
          chunk_index  INT NOT NULL DEFAULT 0,
          chunk_text   TEXT NOT NULL,
          embedding    vector(768) NOT NULL,
          metadata     JSONB,                -- { name, image, region, category }
          created_at   TIMESTAMP DEFAULT NOW(),
          UNIQUE(content_type, content_id, chunk_index)
        );
        CREATE INDEX IF NOT EXISTS idx_embeddings_type        ON content_embeddings(content_type);
        CREATE INDEX IF NOT EXISTS idx_embeddings_content_id  ON content_embeddings(content_id);
      `);
      // HNSW index — fast cosine-similarity search at scale
      // Wrapped in its own try since HNSW requires pgvector >= 0.5.0
      try {
        await client.query(`
          CREATE INDEX IF NOT EXISTS idx_embeddings_hnsw
            ON content_embeddings USING hnsw (embedding vector_cosine_ops);
        `);
      } catch (idxErr) {
        console.log('ℹ️  HNSW index unavailable (pgvector < 0.5); falling back to seq scan — still works, slightly slower at scale.');
      }
      console.log('✅ pgvector + content_embeddings table ready');
    } catch (vecErr) {
      console.log('ℹ️  pgvector extension unavailable on this Postgres — semantic search will be disabled. Other features unaffected.');
    }

    // Continue with no-op so the closing backtick is below
    await client.query(`SELECT 1
    `);

    // ── Recently Viewed ───────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS recently_viewed (
        user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        destination_slug VARCHAR(255) NOT NULL,
        viewed_at        TIMESTAMPTZ DEFAULT NOW(),
        PRIMARY KEY (user_id, destination_slug)
      );
      CREATE INDEX IF NOT EXISTS idx_rv_user ON recently_viewed(user_id);
    `);

    // ── Triggers: updated_at ──────────────────────────────────────────────────
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
      $$ LANGUAGE plpgsql;
    `);
    for (const tbl of ['users', 'destinations', 'reviews', 'trip_plans', 'forum_threads']) {
      await client.query(`
        DROP TRIGGER IF EXISTS trg_${tbl}_updated_at ON ${tbl};
        CREATE TRIGGER trg_${tbl}_updated_at
        BEFORE UPDATE ON ${tbl}
        FOR EACH ROW EXECUTE FUNCTION update_updated_at();
      `);
    }

    // ── Default site settings ────────────────────────────────────────────────
    await client.query(`
      INSERT INTO site_settings (key, value) VALUES
        ('site_name',     '"Bengal Trails"'),
        ('site_tagline',  '"Discover the Magic of West Bengal"'),
        ('contact_email', '"info@bengaltrails.com"'),
        ('maintenance_mode', 'false')
      ON CONFLICT (key) DO NOTHING;
    `);

    // ── First admin user ──────────────────────────────────────────────────────
    const bcrypt = require('bcryptjs');
    const adminEmail = process.env.FIRST_ADMIN_EMAIL || 'admin@bengaltrails.com';
    const adminPass  = await bcrypt.hash('Admin@12345', 10);
    await client.query(`
      INSERT INTO users (email, password, name, role, status)
      VALUES ($1, $2, 'Admin', 'admin', 'active')
      ON CONFLICT (email) DO NOTHING;
    `, [adminEmail, adminPass]);

    // ── Extra trigram indexes (destinations only — festivals/food served from JSON) ──
    await client.query(`CREATE INDEX IF NOT EXISTS idx_destinations_name_trgm ON destinations USING GIN (name gin_trgm_ops);`);

    await client.query('COMMIT');
    console.log('✅ Migration complete!');
    console.log(`👤 Admin account: ${adminEmail} / Admin@12345  ← CHANGE THIS PASSWORD!`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', err);
    process.exit(1);
  } finally {
    client.release();
    pool.end();
  }
}

migrate();
