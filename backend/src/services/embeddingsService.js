// backend/src/services/embeddingsService.js
//
// Wraps Gemini's text-embedding-004 model + pgvector retrieval.
//
// Embedding model: text-embedding-004 (free with the same GEMINI_API_KEY)
//   - 768-dimensional vectors
//   - Up to 1500 requests/min, 1M tokens/day on free tier
//   - Endpoint: POST .../models/text-embedding-004:embedContent
//
// Two main exports:
//   - embed(text) → returns vector array
//   - retrieve(query, opts) → finds similar chunks via cosine distance
//
// Both functions degrade gracefully if pgvector is unavailable or the
// content_embeddings table is empty.

const pool = require('../db/pool');

const EMBEDDING_MODEL = 'text-embedding-004';
const EMBEDDING_DIM   = 768;

let pgvectorAvailable = null; // null = unknown, true/false once verified

/**
 * Check (and cache) whether pgvector is installed on the connected Postgres.
 * Used to short-circuit retrieval calls when not available.
 */
async function checkPgvector() {
  if (pgvectorAvailable !== null) return pgvectorAvailable;
  try {
    const r = await pool.query(`SELECT extname FROM pg_extension WHERE extname = 'vector'`);
    pgvectorAvailable = r.rows.length > 0;
  } catch {
    pgvectorAvailable = false;
  }
  return pgvectorAvailable;
}

/**
 * Generate a 768-dim embedding for a piece of text using Gemini.
 * Throws on configuration error — caller decides whether to retry.
 *
 * @param {string} text
 * @param {'RETRIEVAL_DOCUMENT'|'RETRIEVAL_QUERY'|'SEMANTIC_SIMILARITY'} taskType
 *   - RETRIEVAL_DOCUMENT (default): embed content to be stored & searched later
 *   - RETRIEVAL_QUERY: embed a user query for searching
 *   - SEMANTIC_SIMILARITY: for symmetric similarity (e.g. dedup)
 * @returns {Promise<number[]>} 768-dim vector
 */
async function embed(text, taskType = 'RETRIEVAL_DOCUMENT') {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY not set — required for embeddings');
  }
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    throw new Error('embed() requires a non-empty string');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${EMBEDDING_MODEL}:embedContent?key=${process.env.GEMINI_API_KEY}`;
  const body = {
    model: `models/${EMBEDDING_MODEL}`,
    content: { parts: [{ text: text.slice(0, 8000) }] }, // 8K char cap (safe under model limit)
    taskType,
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Embedding API ${res.status}: ${errText.slice(0, 200)}`);
  }

  const data = await res.json();
  const vector = data?.embedding?.values;
  if (!Array.isArray(vector) || vector.length !== EMBEDDING_DIM) {
    throw new Error(`Unexpected embedding response shape (length ${vector?.length})`);
  }
  return vector;
}

/**
 * Format a vector array as a pgvector-compatible literal: '[0.1,0.2,...]'
 */
function toPgVector(vec) {
  return `[${vec.join(',')}]`;
}

/**
 * Retrieve content chunks most similar to a query.
 *
 * @param {string} query - user's natural language query
 * @param {object} opts
 * @param {number} [opts.limit=5] - max chunks to return
 * @param {number} [opts.minSimilarity=0.5] - 0-1 cosine similarity threshold
 * @param {string[]} [opts.contentTypes] - filter by type(s): ['destination','festival','food']
 * @returns {Promise<Array<{content_type, content_id, chunk_text, similarity, metadata}>>}
 *          Empty array if pgvector unavailable, embeddings table empty, or no matches.
 *          Caller should handle this gracefully — it's NOT an error.
 */
async function retrieve(query, opts = {}) {
  const { limit = 5, minSimilarity = 0.5, contentTypes } = opts;

  // Short-circuit: pgvector not available
  if (!(await checkPgvector())) return [];

  // Short-circuit: no embeddings stored yet
  const cnt = await pool.query(`SELECT COUNT(*) AS c FROM content_embeddings LIMIT 1`).catch(() => null);
  if (!cnt || parseInt(cnt.rows[0].c, 10) === 0) return [];

  // Embed the query
  let queryVec;
  try {
    queryVec = await embed(query, 'RETRIEVAL_QUERY');
  } catch (err) {
    console.error('retrieve(): embedding query failed:', err.message);
    return [];
  }

  // Build SQL
  let sql = `
    SELECT content_type, content_id, chunk_text, metadata,
           1 - (embedding <=> $1::vector) AS similarity
    FROM content_embeddings
    WHERE 1 - (embedding <=> $1::vector) > $2
  `;
  const values = [toPgVector(queryVec), minSimilarity];
  let i = 3;

  if (Array.isArray(contentTypes) && contentTypes.length > 0) {
    const placeholders = contentTypes.map(() => `$${i++}`).join(',');
    sql += ` AND content_type IN (${placeholders})`;
    values.push(...contentTypes);
  }

  sql += ` ORDER BY embedding <=> $1::vector LIMIT $${i}`;
  values.push(Math.min(Math.max(limit, 1), 20));

  try {
    const r = await pool.query(sql, values);
    return r.rows.map((row) => ({
      content_type: row.content_type,
      content_id: row.content_id,
      chunk_text: row.chunk_text,
      metadata: row.metadata || {},
      similarity: parseFloat(row.similarity),
    }));
  } catch (err) {
    console.error('retrieve() query failed:', err.message);
    return [];
  }
}

/**
 * Insert (or replace) an embedding row.
 */
async function upsertEmbedding({ contentType, contentId, chunkIndex = 0, chunkText, vector, metadata }) {
  await pool.query(
    `INSERT INTO content_embeddings (content_type, content_id, chunk_index, chunk_text, embedding, metadata)
     VALUES ($1, $2, $3, $4, $5::vector, $6)
     ON CONFLICT (content_type, content_id, chunk_index)
     DO UPDATE SET chunk_text = EXCLUDED.chunk_text,
                   embedding  = EXCLUDED.embedding,
                   metadata   = EXCLUDED.metadata,
                   created_at = NOW()`,
    [contentType, contentId, chunkIndex, chunkText, toPgVector(vector), metadata ? JSON.stringify(metadata) : null]
  );
}

module.exports = {
  embed,
  retrieve,
  upsertEmbedding,
  checkPgvector,
  EMBEDDING_DIM,
  EMBEDDING_MODEL,
};
