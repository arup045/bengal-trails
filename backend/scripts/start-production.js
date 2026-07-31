// Bengal Trails — production startup for Render.
//
// Self-healing boot sequence so a fresh/recreated database always comes up
// fully working with ZERO manual steps:
//   1. migrate  — create every table (idempotent: CREATE TABLE IF NOT EXISTS).
//   2. seed     — populate the 232 real destinations, but ONLY when the table
//                 is empty (a fresh DB). Gated so normal cold-start wakes stay
//                 fast; idempotent (ON CONFLICT) so it's safe either way.
//   3. start    — boot the API server.
//
// Every step is non-fatal: even if migrate or seed hiccup, the server still
// starts so the health check passes and we can diagnose from logs.

'use strict';

var child_process = require('child_process');
var path = require('path');

var backendDir = path.join(__dirname, '..');

function run(cmd, label) {
  console.log('[startup] ' + label + '...');
  try {
    child_process.execSync(cmd, { stdio: 'inherit', cwd: backendDir });
    console.log('[startup] ' + label + ' complete.');
    return true;
  } catch (e) {
    console.error('[startup] ' + label + ' FAILED (server will still start):', e.message);
    return false;
  }
}

function startServer() {
  console.log('[startup] Starting API server...');
  require(path.join(backendDir, 'src', 'index.js'));
}

// 1) Schema
run('node src/db/migrate.js', 'Database migration');

// 2) Seed real data only if the destinations table is empty (fresh DB self-heal).
//    We reuse the app's singleton pool for a cheap COUNT — pool.query()
//    acquires+releases a client but does NOT end the pool, so index.js reuses it.
(function seedIfEmptyThenStart() {
  var pool;
  try {
    pool = require(path.join(backendDir, 'src', 'db', 'pool'));
  } catch (e) {
    console.error('[startup] could not load pool for seed check (skipping seed):', e.message);
    return startServer();
  }

  pool.query('SELECT COUNT(*)::int AS n FROM destinations')
    .then(function (r) {
      var n = (r && r.rows && r.rows[0] && r.rows[0].n) || 0;
      if (n === 0) {
        console.log('[startup] destinations table is empty — seeding real data (fresh DB)...');
        run('node src/db/seed.js', 'Seeding destinations');
      } else {
        console.log('[startup] destinations already populated (' + n + ' rows) — skipping seed.');
      }
    })
    .catch(function (e) {
      // Table might not exist if migrate failed — that's fine, just skip seed.
      console.error('[startup] destinations count check failed (skipping seed):', e.message);
    })
    .then(startServer, startServer);
})();
