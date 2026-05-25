// embed-content.js — CLI to generate semantic-search embeddings.
//
// Usage:
//   DATABASE_URL=... GEMINI_API_KEY=... npm run embed
//   ... npm run embed -- --type=destinations
//   ... npm run embed -- --limit=10
//   ... npm run embed -- --force
//
// On hosts without shell access (e.g. Render free tier), use the admin panel's
// "AI Search → Generate embeddings" button instead — it runs the same logic.

require('dotenv').config();
const pool = require('../src/db/pool');
const { generateEmbeddings } = require('../src/services/embedGenerator');

const args = process.argv.slice(2);
const typeFilter = (args.find((a) => a.startsWith('--type=')) || '').split('=')[1] || 'all';
const limitArg = parseInt(((args.find((a) => a.startsWith('--limit=')) || '').split('=')[1]) || '0', 10);
const force = args.includes('--force');

(async () => {
  console.log('\n🧠 Bengal Trails semantic embedding generation');
  console.log(`   Model:  text-embedding-004 (Gemini, 768-dim)`);
  console.log(`   Types:  ${typeFilter}${limitArg ? `  Limit: ${limitArg}` : ''}${force ? '  Force: yes' : ''}\n`);

  const start = Date.now();
  try {
    const summary = await generateEmbeddings({
      types: typeFilter,
      force,
      limit: limitArg,
      onProgress: ({ processed, total, ok, failed }) => {
        process.stdout.write(`\r  [${processed}/${total}]  ok:${ok} failed:${failed}   `);
      },
    });
    const elapsed = Math.round((Date.now() - start) / 1000);
    console.log('\n──────────────────────────────────────────────');
    console.log(`✅ Embedded: ${summary.ok}   ❌ Failed: ${summary.failed}   ⏱ ${elapsed}s`);
    console.log('──────────────────────────────────────────────\n');
  } catch (err) {
    console.error('\n💥', err.message);
    await pool.end().catch(() => {});
    process.exit(1);
  }
  await pool.end().catch(() => {});
})();
