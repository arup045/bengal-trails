#!/usr/bin/env node
//
// Migrate destination images to Cloudinary.
//
// What it does:
//   - Reads every destination from the database
//   - Downloads each external image (Unsplash, Wikipedia, etc.)
//   - Uploads to Cloudinary with public_id = `gobro/destinations/<slug>`
//   - Updates destinations.image_url with the new Cloudinary URL
//   - Cloudinary auto-applies WebP conversion + quality optimization
//
// Why:
//   - Original images live on third-party servers that may move/delete them
//   - Cloudinary serves from a global CDN (faster worldwide)
//   - WebP/AVIF auto-delivery cuts bandwidth ~30-50%
//   - Single source of truth for all destination imagery
//
// Safety features:
//   - Idempotent: skips images already on Cloudinary (re-runnable)
//   - Resumable: errors don't abort, you can re-run to retry failures
//   - --dry-run flag previews changes without uploading
//   - --slug=foo runs only one destination (great for testing)
//   - Rate-limited (250ms between uploads) to be polite to source servers
//
// Usage:
//   DATABASE_URL=... CLOUDINARY_* npm run migrate:images
//   DATABASE_URL=... CLOUDINARY_* npm run migrate:images -- --dry-run
//   DATABASE_URL=... CLOUDINARY_* npm run migrate:images -- --slug=darjeeling
//   DATABASE_URL=... CLOUDINARY_* npm run migrate:images -- --limit=10
//   DATABASE_URL=... CLOUDINARY_* npm run migrate:images -- --force      # re-migrate already-on-Cloudinary

require('dotenv').config();
const pool = require('../src/db/pool');

// ─── CLI args ──────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const force = args.includes('--force');
const slugArg = (args.find((a) => a.startsWith('--slug=')) || '').split('=')[1];
const limitArg = parseInt(((args.find((a) => a.startsWith('--limit=')) || '').split('=')[1]) || '0', 10);

// ─── Cloudinary setup ──────────────────────────────────────────────────────────
function getCloudinary() {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error(
      'Cloudinary not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in your .env or environment.'
    );
  }
  const cloudinary = require('cloudinary').v2;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  return cloudinary;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function isCloudinaryUrl(url) {
  if (!url) return false;
  return url.includes('res.cloudinary.com') || url.startsWith('cloudinary://');
}

function isDataUrl(url) {
  return typeof url === 'string' && url.startsWith('data:');
}

async function downloadImage(url) {
  const res = await fetch(url, {
    headers: {
      // Some hosts (Wikipedia) require a UA; Unsplash is permissive
      'User-Agent': 'Bengal Trails-Image-Migrator/1.0 (https://bengaltrails.netlify.app)',
    },
    redirect: 'follow',
  });
  if (!res.ok) {
    throw new Error(`Download failed: HTTP ${res.status}`);
  }
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.startsWith('image/')) {
    throw new Error(`Not an image (content-type: ${contentType})`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 1024) {
    throw new Error(`Image too small (${buf.length} bytes) — likely a placeholder`);
  }
  return buf;
}

function uploadToCloudinary(cloudinary, buffer, publicId) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        public_id: publicId,
        folder: 'bengal-trails/destinations',
        overwrite: true,
        resource_type: 'image',
        // Auto WebP / AVIF delivery, automatic quality
        transformation: [{ quality: 'auto:good', fetch_format: 'auto' }],
      },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ─── Main ──────────────────────────────────────────────────────────────────────

(async () => {
  console.log('\n🚀 Bengal Trails image migration to Cloudinary');
  console.log(`   Mode:    ${isDryRun ? '🔵 DRY RUN (no changes)' : '🟢 LIVE (uploads + DB writes)'}`);
  if (slugArg)  console.log(`   Slug:    ${slugArg}`);
  if (limitArg) console.log(`   Limit:   ${limitArg}`);
  if (force)    console.log(`   Force:   yes (re-migrates already-on-Cloudinary)`);
  console.log('');

  let cloudinary = null;
  if (!isDryRun) {
    try {
      cloudinary = getCloudinary();
      console.log(`☁️  Cloudinary cloud: ${process.env.CLOUDINARY_CLOUD_NAME}`);
    } catch (err) {
      console.error('❌', err.message);
      process.exit(1);
    }
  }

  // Fetch destinations
  let query = `SELECT id, slug, name, image_url FROM destinations WHERE status = 'published'`;
  const params = [];
  if (slugArg) {
    query += ` AND slug = $1`;
    params.push(slugArg);
  }
  query += ` ORDER BY slug`;
  if (limitArg > 0) {
    query += ` LIMIT $${params.length + 1}`;
    params.push(limitArg);
  }

  const { rows } = await pool.query(query, params);
  console.log(`📦 ${rows.length} destinations to consider\n`);

  // Classify
  const toMigrate = [];
  let skippedNoImage = 0, skippedAlreadyCloudinary = 0, skippedDataUrl = 0;

  for (const r of rows) {
    if (!r.image_url) {
      skippedNoImage++;
      continue;
    }
    if (isDataUrl(r.image_url)) {
      skippedDataUrl++;
      continue;
    }
    if (isCloudinaryUrl(r.image_url) && !force) {
      skippedAlreadyCloudinary++;
      continue;
    }
    toMigrate.push(r);
  }

  console.log(`   To migrate:                ${toMigrate.length}`);
  console.log(`   Skip (no image):           ${skippedNoImage}`);
  console.log(`   Skip (already Cloudinary): ${skippedAlreadyCloudinary}`);
  console.log(`   Skip (data URL):           ${skippedDataUrl}`);
  console.log('');

  if (toMigrate.length === 0) {
    console.log('✨ Nothing to migrate. All images are either on Cloudinary or unset.\n');
    await pool.end();
    return;
  }

  if (isDryRun) {
    console.log('🔵 DRY RUN — would upload these images:');
    toMigrate.slice(0, 10).forEach((r, i) => {
      console.log(`   ${(i + 1).toString().padStart(3)}. ${r.slug.padEnd(40)}  ${r.image_url.slice(0, 60)}…`);
    });
    if (toMigrate.length > 10) console.log(`   … and ${toMigrate.length - 10} more`);
    console.log('\nRun without --dry-run to perform the migration.\n');
    await pool.end();
    return;
  }

  // Actual migration
  const results = { ok: [], failed: [] };
  const startTime = Date.now();

  for (let i = 0; i < toMigrate.length; i++) {
    const r = toMigrate[i];
    const progress = `[${(i + 1).toString().padStart(3)}/${toMigrate.length}]`;
    process.stdout.write(`${progress} ${r.slug.padEnd(40)} `);

    try {
      // Download
      const buffer = await downloadImage(r.image_url);
      // Upload
      const result = await uploadToCloudinary(cloudinary, buffer, r.slug);
      // Update DB
      await pool.query(
        `UPDATE destinations SET image_url = $1, updated_at = NOW() WHERE id = $2`,
        [result.secure_url, r.id]
      );
      const sizeKb = (buffer.length / 1024).toFixed(0);
      console.log(`✅ ${sizeKb}KB → ${result.format}`);
      results.ok.push(r.slug);
    } catch (err) {
      console.log(`❌ ${err.message.slice(0, 80)}`);
      results.failed.push({ slug: r.slug, error: err.message });
    }

    // Polite delay between requests (don't hammer Unsplash/Wikipedia)
    if (i < toMigrate.length - 1) await sleep(250);
  }

  // Summary
  const elapsedSec = Math.round((Date.now() - startTime) / 1000);
  console.log('\n──────────────────────────────────────────────');
  console.log(`✅ Migrated:  ${results.ok.length}`);
  console.log(`❌ Failed:    ${results.failed.length}`);
  console.log(`⏱  Elapsed:   ${elapsedSec}s`);
  console.log('──────────────────────────────────────────────');

  if (results.failed.length) {
    console.log('\n❌ Failures (re-run the script to retry):');
    results.failed.forEach((f) => console.log(`   ${f.slug.padEnd(40)} ${f.error.slice(0, 80)}`));
  }

  console.log('');
  await pool.end();
})().catch((err) => {
  console.error('\n💥 Fatal error:', err);
  process.exit(1);
});
