require('dotenv').config();
const pool = require('./pool');
const places = require('./places-data');

function makeSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function parsePriceFrom(priceStr) {
  if (!priceStr) return null;
  const match = String(priceStr).replace(/,/g, '').match(/\d+/);
  return match ? parseInt(match[0]) : null;
}

async function seed() {
  const client = await pool.connect();
  try {
    console.log(`🌱 Seeding ${places.length} destinations...\n`);
    await client.query('BEGIN');

    let inserted = 0;
    let skipped = 0;

    for (const place of places) {
      const slug       = place.slug || makeSlug(place.title);
      const name       = place.title;
      const category   = (place.tags && place.tags[0]) ? place.tags[0] : 'General';
      const region     = place.region || 'West Bengal';
      const desc       = place.description || place.excerpt || '';
      const shortDesc  = place.excerpt || '';
      const imageUrl   = place.heroImage?.url || null;
      const gallery    = place.gallery || [];
      const priceFrom  = parsePriceFrom(place.priceFrom);
      const priceRange = place.priceFrom ? String(place.priceFrom) : null;
      const bestTime   = place.bestTime || null;
      const lat        = place.coordinates?.lat || null;
      const lng        = place.coordinates?.lng || null;
      const rating     = place.rating || 0;
      const reviewCnt  = place.reviewsCount || 0;
      const highlights = place.tags || [];
      const activities = place.tags || [];

      try {
        await client.query(
          `INSERT INTO destinations
             (name, slug, category, region, description, short_description,
              image_url, gallery_images, price_from, price_range,
              best_time_to_visit, latitude, longitude,
              rating, review_count, highlights, activities, featured, status)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
           ON CONFLICT (slug) DO UPDATE SET
             name              = EXCLUDED.name,
             category          = EXCLUDED.category,
             description       = EXCLUDED.description,
             short_description = EXCLUDED.short_description,
             image_url         = EXCLUDED.image_url,
             gallery_images    = EXCLUDED.gallery_images,
             price_from        = EXCLUDED.price_from,
             price_range       = EXCLUDED.price_range,
             best_time_to_visit= EXCLUDED.best_time_to_visit,
             latitude          = EXCLUDED.latitude,
             longitude         = EXCLUDED.longitude,
             rating            = EXCLUDED.rating,
             review_count      = EXCLUDED.review_count,
             highlights        = EXCLUDED.highlights,
             activities        = EXCLUDED.activities,
             updated_at        = NOW()`,
          [name, slug, category, region, desc, shortDesc,
           imageUrl, gallery, priceFrom, priceRange,
           bestTime, lat, lng,
           rating, reviewCnt, highlights, activities,
           inserted < 10, // first 10 are featured
           'published']
        );
        inserted++;
        process.stdout.write(`\r  ✅ ${inserted}/${places.length} — ${name}`.padEnd(60));
      } catch (err) {
        skipped++;
        console.log(`\n  ⚠️  Skipped "${name}": ${err.message}`);
      }
    }

    await client.query('COMMIT');
    console.log(`\n\n✅ Seeding complete!`);
    console.log(`   Inserted/Updated : ${inserted}`);
    console.log(`   Skipped          : ${skipped}`);

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
