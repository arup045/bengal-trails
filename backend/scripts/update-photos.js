/*
 * Updates destination photos with real Wikipedia lead images.
 *
 * USAGE
 *   node scripts/update-photos.js          (uses DATABASE_URL from .env)
 *
 * SAFE TO RE-RUN
 *   - Only updates destinations in the curated map below
 *   - Skips any destination whose photo can't be fetched
 *   - Will not delete or modify other rows
 *
 * Add or edit entries in the SLUG_TO_WIKIPEDIA map to extend coverage.
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const https = require('https');
const { Pool } = require('pg');

// ── Curated map: destination slug → Wikipedia page title ─────────────────────
// Only the most famous destinations need entries here. The rest keep their
// current image. To add more, find the Wikipedia page and use its exact title.
const SLUG_TO_WIKIPEDIA = {
  // North Bengal hill stations
  'darjeeling':                       'Darjeeling',
  'kalimpong':                        'Kalimpong',
  'kurseong':                         'Kurseong',
  'mirik':                            'Mirik',
  'tiger-hill':                       'Tiger Hill (Darjeeling)',
  'mirik-lake':                       'Mirik',
  'batasia-loop':                     'Batasia Loop',

  // Sunderbans & wildlife
  'sundarbans-national-park':         'Sundarbans National Park',
  'jaldapara-national-park':          'Jaldapara National Park',
  'buxa-tiger-reserve':               'Buxa Tiger Reserve',
  'gorumara-national-park':           'Gorumara National Park',

  // Beaches
  'digha':                            'Digha',
  'mandarmani':                       'Mandarmani',
  'tajpur':                           'Tajpur',
  'shankarpur':                       'Shankarpur',
  'bakkhali':                         'Bakkhali',
  'henrys-island':                    "Henry's Island",
  'gangasagar':                       'Gangasagar',

  // Cultural & heritage
  'shantiniketan':                    'Shantiniketan',
  'bishnupur':                        'Bishnupur, Bankura',
  'murshidabad':                      'Murshidabad',
  'cooch-behar':                      'Cooch Behar',
  'gour':                             'Gour, India',

  // Kolkata landmarks
  'kolkata':                          'Kolkata',
  'victoria-memorial-kolkata':        'Victoria Memorial, Kolkata',
  'howrah-bridge':                    'Howrah Bridge',
  'howrah-hooghly-riverfront':        'Howrah Bridge',
  'indian-museum-kolkata':            'Indian Museum, Kolkata',
  'birla-planetarium':                'Birla Planetarium',
  'science-city-kolkata':             'Science City, Kolkata',
  'eden-gardens':                     'Eden Gardens',
  'park-street-kolkata':              'Park Street, Kolkata',
  'new-market-kolkata':               'New Market, Kolkata',

  // Religious
  'belur-math':                       'Belur Math',
  'dakshineswar-kali-temple':         'Dakshineswar Kali Temple',
  'kalighat-temple':                  'Kalighat Kali Temple',
  'mayapur-iskcon-temple':            'Mayapur',
  'tarapith':                         'Tarapith',
  'tarakeshwar-temple':               'Tarakeshwar',
  'nabadwip':                         'Nabadwip',
  'kankalitala-temple':               'Kankalitala',

  // Other towns
  'siliguri':                         'Siliguri',
  'malda':                            'Malda',
  'chandannagar':                     'Chandannagar',
  'serampore':                        'Serampore',
  'krishnanagar':                     'Krishnanagar',
  'asansol':                          'Asansol',
  'durgapur':                         'Durgapur',
  'jhargram':                         'Jhargram',
  'bardhaman':                        'Bardhaman',
  'haldia':                           'Haldia',
};

// ── Fetch Wikipedia lead image for a page title ──────────────────────────────
function fetchWikiImage(title) {
  return new Promise((resolve) => {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
    https.get(url, { headers: { 'User-Agent': 'GobroBengalTourism/1.0 (contact: arupbhattacharya450@gmail.com)' } }, (res) => {
      if (res.statusCode !== 200) return resolve(null);
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const image = json.originalimage?.source || json.thumbnail?.source;
          resolve(image || null);
        } catch (err) {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

// Wikipedia returns full-size images. Resize to a reasonable web size by
// inserting "thumb/" + size suffix into the URL.
function resizeWikiImage(url, width = 1200) {
  if (!url) return null;
  // If already a thumbnail, return as-is.
  if (url.includes('/thumb/')) {
    return url.replace(/\/(\d+)px-/, `/${width}px-`);
  }
  // Convert original → thumb URL
  const filename = url.split('/').pop();
  const upToFilename = url.substring(0, url.lastIndexOf('/'));
  return `${upToFilename.replace('/commons/', '/commons/thumb/')}/${filename}/${width}px-${filename}`;
}

// ── Main ─────────────────────────────────────────────────────────────────────
(async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is not set. Create a .env file or pass it as env var.');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' || /onrender|render\.com/.test(process.env.DATABASE_URL || '')
      ? { rejectUnauthorized: false }
      : false,
  });

  console.log('🖼️  Updating destination photos from Wikipedia...');
  console.log(`   Candidates: ${Object.keys(SLUG_TO_WIKIPEDIA).length}`);
  console.log();

  let updated = 0, skipped = 0, notFound = 0;

  for (const [slug, wikiTitle] of Object.entries(SLUG_TO_WIKIPEDIA)) {
    // Verify the destination exists
    const { rows } = await pool.query("SELECT id, name FROM destinations WHERE slug = $1", [slug]);
    if (rows.length === 0) {
      console.log(`⏭️   ${slug.padEnd(36)} not in DB, skipping`);
      skipped++;
      continue;
    }

    const image = await fetchWikiImage(wikiTitle);
    if (!image) {
      console.log(`❌  ${slug.padEnd(36)} no Wikipedia image found for "${wikiTitle}"`);
      notFound++;
      continue;
    }

    const sizedImage = resizeWikiImage(image, 1200);
    await pool.query(
      "UPDATE destinations SET image_url = $1, updated_at = NOW() WHERE slug = $2",
      [sizedImage, slug]
    );
    console.log(`✅  ${slug.padEnd(36)} ← ${sizedImage.split('/').pop()?.slice(0, 50)}`);
    updated++;

    // Be a good Wikipedia citizen: small delay between requests.
    await new Promise((r) => setTimeout(r, 200));
  }

  console.log();
  console.log(`✅ Updated:   ${updated}`);
  console.log(`⏭️  Skipped:   ${skipped}`);
  console.log(`❌ Not found: ${notFound}`);
  await pool.end();
  process.exit(0);
})().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
