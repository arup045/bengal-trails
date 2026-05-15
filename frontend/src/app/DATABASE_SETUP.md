# 🗄️ Bengal Trails PostgreSQL Database Setup

## Overview
This document contains all PostgreSQL schemas for the Bengal Trails West Bengal Tourism website.
Execute these SQL statements in your **Supabase SQL Editor** to create proper relational tables.

---

## 📋 Step-by-Step Setup Instructions

### 1. Go to Supabase Dashboard
- Open your Supabase project: https://supabase.com/dashboard
- Navigate to **SQL Editor** (left sidebar)
- Create a new query

### 2. Execute Schemas in Order
Copy and paste each schema below and click **RUN**

---

## 🔐 Table 1: Users Table

```sql
-- Users table with authentication and roles
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  avatar_url TEXT,
  phone VARCHAR(20),
  location VARCHAR(255),
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Insert default admin user (YOU - change email/name as needed)
INSERT INTO users (email, name, role, status)
VALUES ('admin@bengaltrails.com', 'Admin User', 'admin', 'active')
ON CONFLICT (email) DO NOTHING;
```

---

## 🏞️ Table 2: Destinations Table

```sql
-- Destinations table for all West Bengal locations
CREATE TABLE IF NOT EXISTS destinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  category VARCHAR(100) NOT NULL,
  region VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  short_description VARCHAR(500),
  image_url TEXT NOT NULL,
  gallery_images TEXT[], -- Array of image URLs
  price_range VARCHAR(50),
  best_time_to_visit VARCHAR(255),
  duration VARCHAR(100),
  highlights TEXT[], -- Array of highlight strings
  activities TEXT[], -- Array of activities
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  rating DECIMAL(3, 2) DEFAULT 0.0,
  review_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  status VARCHAR(50) DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_destinations_slug ON destinations(slug);
CREATE INDEX IF NOT EXISTS idx_destinations_category ON destinations(category);
CREATE INDEX IF NOT EXISTS idx_destinations_region ON destinations(region);
CREATE INDEX IF NOT EXISTS idx_destinations_featured ON destinations(featured);
CREATE INDEX IF NOT EXISTS idx_destinations_status ON destinations(status);
```

---

## 💌 Table 3: Newsletter Subscribers

```sql
-- Newsletter subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed')),
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unsubscribed_at TIMESTAMP WITH TIME ZONE
);

-- Index for email lookups
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_status ON newsletter_subscribers(status);
```

---

## ❤️ Table 4: User Wishlists

```sql
-- User wishlists (favorite destinations)
CREATE TABLE IF NOT EXISTS user_wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  destination_id UUID NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, destination_id)
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_wishlists_user ON user_wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_destination ON user_wishlists(destination_id);
```

---

## 🗺️ Table 5: Trip Plans

```sql
-- User trip plans/itineraries
CREATE TABLE IF NOT EXISTS trip_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  destinations JSONB, -- Array of destination objects
  total_budget DECIMAL(10, 2),
  status VARCHAR(50) DEFAULT 'planning' CHECK (status IN ('planning', 'confirmed', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_trip_plans_user ON trip_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_trip_plans_status ON trip_plans(status);
```

---

## ⭐ Table 6: Reviews

```sql
-- User reviews for destinations
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  destination_id UUID NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  comment TEXT NOT NULL,
  helpful_count INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'published' CHECK (status IN ('pending', 'published', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, destination_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_reviews_destination ON reviews(destination_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
```

---

## ⚙️ Table 7: Site Settings

```sql
-- Site-wide settings and configurations
CREATE TABLE IF NOT EXISTS site_settings (
  key VARCHAR(255) PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings
INSERT INTO site_settings (key, value, description)
VALUES 
  ('site_name', '"Bengal Trails"', 'Website name'),
  ('site_tagline', '"Discover the Magic of West Bengal"', 'Website tagline'),
  ('contact_email', '"info@bengaltrails.com"', 'Contact email'),
  ('contact_phone', '"+91-1234567890"', 'Contact phone number'),
  ('social_links', '{"facebook": "https://facebook.com/gobro", "instagram": "https://instagram.com/gobro", "twitter": "https://twitter.com/gobro"}', 'Social media links'),
  ('featured_destination_count', '6', 'Number of featured destinations on homepage'),
  ('maintenance_mode', 'false', 'Site maintenance mode')
ON CONFLICT (key) DO NOTHING;
```

---

## 📊 Table 8: Analytics Events

```sql
-- Track user analytics events
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(100) NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  destination_id UUID REFERENCES destinations(id) ON DELETE SET NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_user ON analytics_events(user_id);
```

---

## 🔄 Enable Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Public read access for destinations
CREATE POLICY "Public can view published destinations" ON destinations
  FOR SELECT USING (status = 'published');

-- Users can read their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Users can manage their wishlists
CREATE POLICY "Users can manage own wishlists" ON user_wishlists
  FOR ALL USING (auth.uid()::text = user_id::text);

-- Users can manage their trip plans
CREATE POLICY "Users can manage own trip plans" ON trip_plans
  FOR ALL USING (auth.uid()::text = user_id::text);

-- Users can create reviews
CREATE POLICY "Users can create reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view published reviews" ON reviews
  FOR SELECT USING (status = 'published');

-- Public can read site settings
CREATE POLICY "Public can read site settings" ON site_settings
  FOR SELECT USING (true);

-- Admin full access (will be implemented in application layer)
```

---

## 📝 Helper Functions

```sql
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_destinations_updated_at BEFORE UPDATE ON destinations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trip_plans_updated_at BEFORE UPDATE ON trip_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## ✅ Verification Queries

After running all schemas, verify everything is set up correctly:

```sql
-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check admin user exists
SELECT * FROM users WHERE role = 'admin';

-- Check site settings
SELECT * FROM site_settings;
```

---

## 🎯 Next Steps

1. ✅ Execute all SQL above in Supabase SQL Editor
2. ✅ Verify tables are created
3. ✅ Update the admin email in users table to YOUR email
4. ✅ Update the backend code to use these tables instead of KV store
5. ✅ Test admin login at `/admin-login`

---

## 🔐 Important Security Notes

- **Never expose SUPABASE_SERVICE_ROLE_KEY** in frontend code
- Always validate user roles on the backend
- Use RLS policies for additional security layer
- Keep your admin credentials secure

---

## 📞 Need Help?

If you encounter any errors:
1. Check Supabase logs in Dashboard
2. Verify all foreign key references exist
3. Ensure UUID extension is enabled: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`
