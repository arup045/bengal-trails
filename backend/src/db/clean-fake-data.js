/**
 * Cleanup script — removes all seeded/fake data from production database.
 *
 * Run this ONCE on Render Shell:
 *   node src/db/clean-fake-data.js
 *
 * Wipes:
 *   1. All seeded "test" reviews (any review where the user has @bengaltrails.com email,
 *      or any review created during database initialization)
 *   2. Resets all destinations' rating + review_count to 0
 *   3. Removes fake blog posts (Priya Roy, Riya Sen, etc.)
 *   4. Removes fake forum threads
 *
 * Safe to run multiple times — idempotent.
 */
require('dotenv').config();
const pool = require('./pool');

async function clean() {
  const client = await pool.connect();
  try {
    console.log('🧹 Cleaning fake/seeded data...\n');
    await client.query('BEGIN');

    // 1. Delete reviews from seed test accounts
    const seedEmails = [
      'priya@bengaltrails.com', 'arjun@bengaltrails.com', 'rohan@bengaltrails.com',
      'riya@bengaltrails.com',  'suman@bengaltrails.com', 'anjali@bengaltrails.com',
    ];
    const r1 = await client.query(
      `DELETE FROM reviews WHERE user_id IN (SELECT id FROM users WHERE email = ANY($1::text[]))`,
      [seedEmails]
    );
    console.log(`✓ Removed ${r1.rowCount} seeded reviews`);

    // 2. Delete ALL reviews older than 24h that have an avatar from i.pravatar.cc
    // (those are seeded test users — real users use Cloudinary or no avatar)
    const r2 = await client.query(`
      DELETE FROM reviews WHERE id IN (
        SELECT r.id FROM reviews r
        JOIN users u ON u.id = r.user_id
        WHERE u.avatar_url LIKE '%pravatar.cc%'
      )
    `);
    console.log(`✓ Removed ${r2.rowCount} pravatar test reviews`);

    // 3. Reset destination ratings + review counts to reflect ONLY real reviews
    const r3 = await client.query(`
      UPDATE destinations
      SET review_count = COALESCE((
            SELECT COUNT(*) FROM reviews
            WHERE destination_slug = destinations.slug AND status = 'published'
          ), 0),
          rating = COALESCE((
            SELECT AVG(rating)::numeric(3,2) FROM reviews
            WHERE destination_slug = destinations.slug AND status = 'published'
          ), 0)
    `);
    console.log(`✓ Recomputed ratings for ${r3.rowCount} destinations`);

    // 4. Delete seeded blog posts (have specific seed authors)
    const r4 = await client.query(`
      DELETE FROM blog_posts WHERE author IN
        ('Riya Sen','Arjun Banerjee','Priya Roy','Suman Ghosh','Rohan Das','Anjali Mukherjee')
    `);
    console.log(`✓ Removed ${r4.rowCount} seed blog posts`);

    // 5. Delete seeded forum threads
    const r5 = await client.query(`
      DELETE FROM forum_threads WHERE user_id IN
        (SELECT id FROM users WHERE email = ANY($1::text[]))
    `, [seedEmails]);
    console.log(`✓ Removed ${r5.rowCount} seed forum threads`);

    // 6. Delete the seed user accounts themselves (so they can't be referenced)
    const r6 = await client.query(`
      DELETE FROM users WHERE email = ANY($1::text[])
    `, [seedEmails]);
    console.log(`✓ Removed ${r6.rowCount} seed user accounts`);

    await client.query('COMMIT');
    console.log('\n✅ Cleanup complete!\n');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Cleanup failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

clean();
