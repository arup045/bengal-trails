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
        country     VARCHAR(100),
        interests   TEXT,
        budget      VARCHAR(50),
        trip_type   VARCHAR(50),
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
    // SECURITY: Admin password must come from env. Never hardcode it.
    //   - Production: FIRST_ADMIN_PASSWORD is required. Migration fails if missing.
    //   - Development: if not set, we generate a random one and print it ONCE.
    //     You must save it from the log — it is never written to disk.
    // The password is NEVER printed in production logs (anyone with log access
    // would otherwise own the admin account on a fresh deploy).
    const bcrypt   = require('bcryptjs');
    const crypto   = require('crypto');
    const isProd   = process.env.NODE_ENV === 'production';
    const adminEmail = process.env.FIRST_ADMIN_EMAIL || 'admin@bengaltrails.com';

    let adminPlainPass = process.env.FIRST_ADMIN_PASSWORD;
    if (!adminPlainPass) {
      if (isProd) {
        throw new Error(
          'FIRST_ADMIN_PASSWORD env var is required in production. ' +
          'Set a strong password (12+ chars) in your Render/Railway dashboard before deploying.'
        );
      }
      // Dev convenience: generate a strong random password
      adminPlainPass = crypto.randomBytes(12).toString('base64').replace(/[+/=]/g, '');
    }
    if (adminPlainPass.length < 12) {
      throw new Error('FIRST_ADMIN_PASSWORD must be at least 12 characters long.');
    }

    const adminPass = await bcrypt.hash(adminPlainPass, 12); // cost 12 (was 10; P1-15)

    // Check if the admin user actually got inserted (vs. already existed).
    const adminInsert = await client.query(`
      INSERT INTO users (email, password, name, role, status)
      VALUES ($1, $2, 'Admin', 'admin', 'active')
      ON CONFLICT (email) DO NOTHING
      RETURNING id;
    `, [adminEmail, adminPass]);
    const adminWasCreated = adminInsert.rows.length > 0;

    // ── Safe column additions for already-migrated databases ──────────────────
    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS country   VARCHAR(100);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS interests TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS budget    VARCHAR(50);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS trip_type VARCHAR(50);
      -- Compliance: store when the user agreed to T&C / privacy.
      -- Required for India DPDP Act 2023 and GDPR audit trails.
      ALTER TABLE users ADD COLUMN IF NOT EXISTS terms_accepted_at   TIMESTAMPTZ;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS marketing_opt_in    BOOLEAN DEFAULT false;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS marketing_opted_in_at TIMESTAMPTZ;
    `);

    // ── Extra trigram indexes (destinations only — festivals/food served from JSON) ──
    await client.query(`CREATE INDEX IF NOT EXISTS idx_destinations_name_trgm ON destinations USING GIN (name gin_trgm_ops);`);

    // ── One review per user per destination (P1-23) ──────────────────────────
    // Idempotent: only adds the constraint if it doesn't already exist.
    // Existing duplicates (if any) will block this — admin should manually
    // clean up duplicate reviews before re-running the migration if so.
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'reviews_user_destination_unique'
        ) THEN
          BEGIN
            ALTER TABLE reviews
              ADD CONSTRAINT reviews_user_destination_unique
              UNIQUE (user_id, destination_slug);
          EXCEPTION WHEN unique_violation THEN
            RAISE NOTICE 'Could not add unique constraint on reviews — duplicates exist. Manual cleanup required.';
          END;
        END IF;
      END $$;
    `);

    // ── Review helpfulness votes (P1-22) ─────────────────────────────────────
    // Replaces the old "POST /reviews/:id/helpful increments a counter forever"
    // pattern with a real vote table. PK enforces one vote per user per review.
    // helpful_count on reviews becomes a derived value (recomputed on each vote).
    await client.query(`
      CREATE TABLE IF NOT EXISTS review_helpful_votes (
        review_id  UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
        user_id    UUID NOT NULL REFERENCES users(id)   ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        PRIMARY KEY (review_id, user_id)
      );
      CREATE INDEX IF NOT EXISTS idx_review_helpful_review ON review_helpful_votes(review_id);
      CREATE INDEX IF NOT EXISTS idx_review_helpful_user   ON review_helpful_votes(user_id);
    `);

    // ── Enquiries (P1-30) ────────────────────────────────────────────────────
    // Was queried by admin stats and used by the booking enquiry rate limiter,
    // but never created. Adding now so the route + admin panel actually work.
    await client.query(`
      CREATE TABLE IF NOT EXISTS enquiries (
        id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id          UUID REFERENCES users(id) ON DELETE SET NULL,
        destination_slug VARCHAR(255),
        destination_name VARCHAR(255),
        name             VARCHAR(255) NOT NULL,
        email            VARCHAR(255) NOT NULL,
        phone            VARCHAR(50),
        message          TEXT,
        check_in         DATE,
        check_out        DATE,
        guests           INTEGER,
        status           VARCHAR(50) DEFAULT 'new'
                         CHECK (status IN ('new','in_progress','converted','closed','spam')),
        created_at       TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_enquiries_status ON enquiries(status);
      CREATE INDEX IF NOT EXISTS idx_enquiries_created_at ON enquiries(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_enquiries_email ON enquiries(email);
    `);

    // ── Newsletter double opt-in (P1-29) ─────────────────────────────────────
    // Adds confirm_token + confirmed_at for double opt-in compliance (DPDP/GDPR).
    // status='pending' until the user clicks the confirmation link.
    await client.query(`
      ALTER TABLE newsletter_subscribers ADD COLUMN IF NOT EXISTS confirm_token VARCHAR(255);
      ALTER TABLE newsletter_subscribers ADD COLUMN IF NOT EXISTS confirmed_at  TIMESTAMPTZ;
      -- Loosen the old status check to allow 'pending'. Drop+re-add.
      ALTER TABLE newsletter_subscribers DROP CONSTRAINT IF EXISTS newsletter_subscribers_status_check;
      ALTER TABLE newsletter_subscribers
        ADD CONSTRAINT newsletter_subscribers_status_check
        CHECK (status IN ('pending','active','unsubscribed'));
      CREATE INDEX IF NOT EXISTS idx_newsletter_confirm_token ON newsletter_subscribers(confirm_token);
    `);

    await client.query('COMMIT');
    console.log('✅ Migration complete!');

    // Print credentials ONLY in dev, and ONLY when the admin was actually just created.
    // Never print the password in production — log access = admin compromise.
    if (adminWasCreated && !isProd && !process.env.FIRST_ADMIN_PASSWORD) {
      console.log('');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('👤 Admin account created (dev mode — random password)');
      console.log(`   Email:    ${adminEmail}`);
      console.log(`   Password: ${adminPlainPass}`);
      console.log('   ⚠️  SAVE THIS PASSWORD NOW — it is not stored anywhere.');
      console.log('   ⚠️  In production, set FIRST_ADMIN_PASSWORD env var instead.');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('');
    } else if (adminWasCreated) {
      console.log(`👤 Admin account created: ${adminEmail} (password from FIRST_ADMIN_PASSWORD env var)`);
    } else {
      console.log(`👤 Admin account already exists: ${adminEmail}`);
    }
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
