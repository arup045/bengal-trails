#!/usr/bin/env node
//
// Generate embeddings for all destinations, festivals, and food.
//
// Reads each entity, builds a rich text chunk, embeds it via Gemini's
// text-embedding-004 model, and inserts into content_embeddings.
//
// What gets embedded per entity (one row each, ~1KB chunk):
//
//   DESTINATIONS (232 rows):
//     "Name: Darjeeling
//      Region: North Bengal
//      Category: TeaTrails
//      Description: ...
//      Highlights: ..., ..., ...
//      Activities: ...
//      Best time: April-June"
//
//   FESTIVALS (100 rows):
//     "Festival: Durga Puja (দুর্গা পূজা)
//      Category: religious
//      Dates: September-October
//      Vibe: vibrant, devotional
//      Description: ...
//      Where: kolkata, shantiniketan
//      Must try: ..."
//
//   FOOD (17 rows):
//     "Dish: Rosogolla (রসগোল্লা)
//      Category: sweet
//      Description: ..."
//
// Usage:
//   DATABASE_URL=... GEMINI_API_KEY=... npm run embed
//   DATABASE_URL=... GEMINI_API_KEY=... npm run embed -- --type=destinations
//   DATABASE_URL=... GEMINI_API_KEY=... npm run embed -- --limit=10
//   DATABASE_URL=... GEMINI_API_KEY=... npm run embed -- --force
//
// Safety:
//   - Idempotent: skips entities that already have embeddings (unless --force)
//   - Resumable: errors don't abort, re-run to retry failures
//   - Rate-limited: 150ms between embedding API calls (well under Gemini's 1500/min limit)

require('dotenv').config();
const pool = require('../src/db/pool');
const { embed, upsertEmbedding, checkPgvector } = require('../src/services/embeddingsService');

// ─── CLI args ──────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const typeFilter = (args.find((a) => a.startsWith('--type=')) || '').split('=')[1] || 'all';
const limitArg = parseInt(((args.find((a) => a.startsWith('--limit=')) || '').split('=')[1]) || '0', 10);
const force = args.includes('--force');

// ─── Text chunk builders ───────────────────────────────────────────────────────

function buildDestinationChunk(d) {
  const parts = [];
  parts.push(`Place: ${d.name}`);
  if (d.region)            parts.push(`Region: ${d.region}`);
  if (d.category)          parts.push(`Category: ${d.category}`);
  if (d.short_description) parts.push(`Summary: ${d.short_description}`);
  else if (d.description)  parts.push(`Description: ${d.description.slice(0, 400)}`);
  if (d.highlights?.length)         parts.push(`Highlights: ${d.highlights.slice(0, 6).join(', ')}`);
  if (d.activities?.length)         parts.push(`Activities: ${d.activities.slice(0, 6).join(', ')}`);
  if (d.best_time_to_visit)         parts.push(`Best time: ${d.best_time_to_visit}`);
  if (d.duration)                   parts.push(`Suggested stay: ${d.duration}`);
  return parts.join('. ');
}

function buildFestivalChunk(f) {
  const parts = [];
  parts.push(`Festival: ${f.name}${f.bengaliName ? ` (${f.bengaliName})` : ''}`);
  if (f.category)     parts.push(`Type: ${f.category}`);
  if (f.typicalDates) parts.push(`When: ${f.typicalDates}`);
  if (f.duration)     parts.push(`Duration: ${f.duration}`);
  if (f.vibe)         parts.push(`Vibe: ${f.vibe}`);
  if (f.description)  parts.push(`About: ${f.description}`);
  if (f.locations?.length) parts.push(`Best places: ${f.locations.slice(0, 6).join(', ')}`);
  if (f.mustTry?.length)   parts.push(`Must try: ${f.mustTry.slice(0, 5).join(', ')}`);
  return parts.join('. ');
}

function buildFoodChunk(f) {
  const parts = [];
  parts.push(`Dish: ${f.name}${f.bengaliName ? ` (${f.bengaliName})` : ''}`);
  if (f.category)    parts.push(`Type: ${f.category}`);
  if (f.description) parts.push(`Description: ${f.description}`);
  if (f.ingredients?.length) parts.push(`Made with: ${f.ingredients.slice(0, 6).join(', ')}`);
  return parts.join('. ');
}

// ─── Already-embedded check ────────────────────────────────────────────────────

async function getExistingIds(contentType) {
  const r = await pool.query(
    `SELECT DISTINCT content_id FROM content_embeddings WHERE content_type = $1`,
    [contentType]
  );
  return new Set(r.rows.map((x) => x.content_id));
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ─── Process functions per type ────────────────────────────────────────────────

async function processDestinations() {
  const { rows } = await pool.query(
    `SELECT id, name, slug, category, region, description, short_description, image_url,
            highlights, activities, best_time_to_visit, duration
     FROM destinations
     WHERE status = 'published'
     ORDER BY slug`
  );
  return processBatch('destination', rows, buildDestinationChunk, (d) => d.slug, (d) => ({
    name: d.name, region: d.region, category: d.category, image: d.image_url,
  }));
}

async function processFestivals() {
  let festivals;
  try {
    festivals = require('../src/data/festivals');
  } catch {
    console.log('   ⚠️  Festival data not available — skipping');
    return { ok: 0, failed: 0, skipped: 0 };
  }
  return processBatch('festival', festivals, buildFestivalChunk, (f) => f.id, (f) => ({
    name: f.name, bengaliName: f.bengaliName, category: f.category, image: f.image,
    typicalDates: f.typicalDates,
  }));
}

async function processFood() {
  let foods;
  try {
    const mod = require('../src/data/bengaliFood');
    foods = mod.foods || mod || [];
  } catch {
    console.log('   ⚠️  Food data not available — skipping');
    return { ok: 0, failed: 0, skipped: 0 };
  }
  return processBatch('food', foods, buildFoodChunk, (f) => f.id || f.slug, (f) => ({
    name: f.name, bengaliName: f.bengaliName, category: f.category, image: f.image,
  }));
}

async function processBatch(type, items, builder, idFn, metaFn) {
  const existing = force ? new Set() : await getExistingIds(type);
  const toProcess = items.filter((it) => idFn(it) && (!existing.has(idFn(it))));
  const finalList = limitArg > 0 ? toProcess.slice(0, limitArg) : toProcess;

  console.log(`\n📦 ${type.toUpperCase()}: ${items.length} total, ${existing.size} already embedded, ${finalList.length} to process`);
  if (finalList.length === 0) {
    return { ok: 0, failed: 0, skipped: items.length - finalList.length };
  }

  let ok = 0, failed = 0;
  for (let i = 0; i < finalList.length; i++) {
    const item = finalList[i];
    const id = idFn(item);
    const chunk = builder(item);
    const progress = `[${(i + 1).toString().padStart(3)}/${finalList.length}]`;
    process.stdout.write(`${progress} ${type.padEnd(11)} ${id.padEnd(38).slice(0, 38)} `);

    try {
      const vector = await embed(chunk, 'RETRIEVAL_DOCUMENT');
      await upsertEmbedding({
        contentType: type,
        contentId: id,
        chunkText: chunk,
        vector,
        metadata: metaFn(item),
      });
      console.log(`✅ ${chunk.length}c`);
      ok++;
    } catch (err) {
      console.log(`❌ ${err.message.slice(0, 80)}`);
      failed++;
    }
    // Rate limit: 150ms between calls (~400/min, well under Gemini's 1500/min limit)
    if (i < finalList.length - 1) await sleep(150);
  }
  return { ok, failed, skipped: items.length - finalList.length };
}

// ─── Main ──────────────────────────────────────────────────────────────────────

(async () => {
  console.log('\n🧠 Bengal Trails semantic embedding generation');
  console.log(`   Model:    text-embedding-004 (Gemini, 768-dim)`);
  console.log(`   Types:    ${typeFilter === 'all' ? 'destinations + festivals + food' : typeFilter}`);
  if (limitArg) console.log(`   Limit:    ${limitArg}`);
  if (force)    console.log(`   Force:    yes (re-embed already-embedded entities)`);
  console.log('');

  // Preflight: pgvector must be installed
  const hasVec = await checkPgvector();
  if (!hasVec) {
    console.error('❌ pgvector extension is not installed on this Postgres.');
    console.error('   Run `npm run migrate` first. If you\'re on Render, pgvector is supported out of the box.');
    console.error('   If you\'re on a local Postgres without pgvector, install it:');
    console.error('     macOS:  brew install pgvector && CREATE EXTENSION vector;');
    console.error('     Linux:  sudo apt install postgresql-16-pgvector');
    await pool.end();
    process.exit(1);
  }

  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY is not set.');
    console.error('   This script uses Gemini\'s text-embedding-004 model (free with the same key).');
    await pool.end();
    process.exit(1);
  }

  const summary = { ok: 0, failed: 0, skipped: 0 };
  const start = Date.now();

  try {
    if (typeFilter === 'all' || typeFilter === 'destinations') {
      const r = await processDestinations();
      summary.ok += r.ok;     summary.failed += r.failed;   summary.skipped += r.skipped;
    }
    if (typeFilter === 'all' || typeFilter === 'festivals') {
      const r = await processFestivals();
      summary.ok += r.ok;     summary.failed += r.failed;   summary.skipped += r.skipped;
    }
    if (typeFilter === 'all' || typeFilter === 'food') {
      const r = await processFood();
      summary.ok += r.ok;     summary.failed += r.failed;   summary.skipped += r.skipped;
    }
  } catch (err) {
    console.error('\n💥 Fatal error:', err.message);
  }

  const elapsedSec = Math.round((Date.now() - start) / 1000);
  console.log('\n──────────────────────────────────────────────');
  console.log(`✅ Embedded:   ${summary.ok}`);
  console.log(`⏭  Skipped:    ${summary.skipped}`);
  console.log(`❌ Failed:     ${summary.failed}`);
  console.log(`⏱  Elapsed:    ${elapsedSec}s`);
  console.log('──────────────────────────────────────────────\n');

  await pool.end();
})().catch(async (err) => {
  console.error('💥', err);
  try { await pool.end(); } catch {}
  process.exit(1);
});
