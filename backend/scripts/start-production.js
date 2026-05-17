/**
 * Production startup script for Render.
 * Runs migration first, then starts the API server.
 * If migration fails, logs the error but still starts the server
 * (so health check passes and Render doesn't kill the deploy).
 */
const { execSync } = require('child_process');

console.log('\n🚀 Bengal Trails — Production Startup\n');

// ── Step 1: Run migration ─────────────────────────────────────────────────────
try {
  console.log('📦 Running database migration...');
  execSync('node src/db/migrate.js', { stdio: 'inherit', cwd: __dirname + '/..' });
  console.log('✅ Migration done\n');
} catch (err) {
  console.error('⚠️  Migration error (server will still start):', err.message);
}

// ── Step 2: Start the API server ──────────────────────────────────────────────
console.log('🌐 Starting API server...');
require('../src/index.js');
