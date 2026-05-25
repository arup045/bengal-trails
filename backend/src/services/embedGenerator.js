// embedGenerator.js — builds + stores semantic-search embeddings for all content.
//
// Shared by the CLI (`npm run embed`) and the admin "Generate embeddings" button,
// so free-tier hosts (no Shell) can activate semantic search from the dashboard.
//
// generateEmbeddings({ types, force, limit, onProgress }) → { ok, failed, skipped, total }
//   - Idempotent: skips content that already has an embedding (unless force).
//   - Rate-limited: 150ms between Gemini calls (well under the free 1500/min cap).
//   - onProgress({ processed, total, ok, failed }) is called after each item.

const pool = require('../db/pool');
const { embed, upsertEmbedding, checkPgvector } = require('./embeddingsService');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ─── Chunk builders ──────────────────────────────────────────────────────────
function buildDestinationChunk(d) {
  const parts = [`Place: ${d.name}`];
  if (d.region)            parts.push(`Region: ${d.region}`);
  if (d.category)          parts.push(`Category: ${d.category}`);
  if (d.short_description) parts.push(`Summary: ${d.short_description}`);
  else if (d.description)  parts.push(`Description: ${String(d.description).slice(0, 400)}`);
  if (d.highlights?.length) parts.push(`Highlights: ${d.highlights.slice(0, 6).join(', ')}`);
  if (d.activities?.length) parts.push(`Activities: ${d.activities.slice(0, 6).join(', ')}`);
  if (d.best_time_to_visit) parts.push(`Best time: ${d.best_time_to_visit}`);
  if (d.duration)           parts.push(`Suggested stay: ${d.duration}`);
  return parts.join('. ');
}
function buildFestivalChunk(f) {
  const parts = [`Festival: ${f.name}${f.bengaliName ? ` (${f.bengaliName})` : ''}`];
  if (f.category)     parts.push(`Type: ${f.category}`);
  if (f.typicalDates) parts.push(`When: ${f.typicalDates}`);
  if (f.vibe)         parts.push(`Vibe: ${f.vibe}`);
  if (f.description)  parts.push(`About: ${f.description}`);
  if (f.locations?.length) parts.push(`Best places: ${f.locations.slice(0, 6).join(', ')}`);
  return parts.join('. ');
}
function buildFoodChunk(f) {
  const parts = [`Dish: ${f.name}${f.bengaliName ? ` (${f.bengaliName})` : ''}`];
  if (f.category)    parts.push(`Type: ${f.category}`);
  if (f.description) parts.push(`Description: ${f.description}`);
  return parts.join('. ');
}

async function getExistingIds(type) {
  const r = await pool.query(`SELECT DISTINCT content_id FROM content_embeddings WHERE content_type = $1`, [type]);
  return new Set(r.rows.map((x) => x.content_id));
}

// ─── Candidate gathering per type ────────────────────────────────────────────
async function destinationCandidates() {
  const { rows } = await pool.query(
    `SELECT id, name, slug, category, region, description, short_description, image_url,
            highlights, activities, best_time_to_visit, duration
       FROM destinations WHERE status = 'published' ORDER BY slug`
  );
  return rows.map((d) => ({ type: 'destination', id: d.slug, chunk: buildDestinationChunk(d),
    metadata: { name: d.name, region: d.region, category: d.category, image: d.image_url } }))
    .filter((x) => x.id);
}
function festivalCandidates() {
  let festivals; try { festivals = require('../data/festivals'); } catch { return []; }
  return festivals.map((f) => ({ type: 'festival', id: f.id, chunk: buildFestivalChunk(f),
    metadata: { name: f.name, bengaliName: f.bengaliName, category: f.category, image: f.image, typicalDates: f.typicalDates } }))
    .filter((x) => x.id);
}
function foodCandidates() {
  let foods; try { const m = require('../data/bengaliFood'); foods = m.foods || m || []; } catch { return []; }
  return foods.map((f) => ({ type: 'food', id: f.id || f.slug, chunk: buildFoodChunk(f),
    metadata: { name: f.name, bengaliName: f.bengaliName, category: f.category, image: f.image } }))
    .filter((x) => x.id);
}

/** Generate + store embeddings. Returns a summary. */
async function generateEmbeddings({ types = 'all', force = false, limit = 0, onProgress } = {}) {
  if (!(await checkPgvector())) throw new Error('pgvector extension is not installed on this database');
  if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not set');

  const want = (t) => types === 'all' || types === t || (Array.isArray(types) && types.includes(t));
  let candidates = [];
  if (want('destinations') || want('destination')) candidates = candidates.concat(await destinationCandidates());
  if (want('festivals')    || want('festival'))    candidates = candidates.concat(festivalCandidates());
  if (want('food'))                                candidates = candidates.concat(foodCandidates());

  // Skip already-embedded unless force.
  if (!force) {
    const existingByType = {};
    for (const t of ['destination', 'festival', 'food']) existingByType[t] = await getExistingIds(t);
    candidates = candidates.filter((c) => !existingByType[c.type]?.has(c.id));
  }
  if (limit > 0) candidates = candidates.slice(0, limit);

  const total = candidates.length;
  let ok = 0, failed = 0;
  for (let i = 0; i < total; i++) {
    const c = candidates[i];
    try {
      const vector = await embed(c.chunk, 'RETRIEVAL_DOCUMENT');
      await upsertEmbedding({ contentType: c.type, contentId: c.id, chunkText: c.chunk, vector, metadata: c.metadata });
      ok++;
    } catch (err) {
      failed++;
      console.error(`[embed] ${c.type}/${c.id} failed: ${err.message}`);
    }
    if (typeof onProgress === 'function') onProgress({ processed: i + 1, total, ok, failed });
    if (i < total - 1) await sleep(150);
  }
  return { ok, failed, skipped: 0, total };
}

module.exports = {
  generateEmbeddings,
  buildDestinationChunk, buildFestivalChunk, buildFoodChunk,
};
