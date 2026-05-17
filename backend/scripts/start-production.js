// Bengal Trails - Production startup script for Render
// Runs migrate first, then starts the server.
// If migration fails, it still starts (so health check passes).

'use strict';

var child_process = require('child_process');
var path = require('path');

var backendDir = path.join(__dirname, '..');

console.log('[startup] Running database migration...');
try {
  child_process.execSync('node src/db/migrate.js', {
    stdio: 'inherit',
    cwd: backendDir
  });
  console.log('[startup] Migration complete.');
} catch (e) {
  console.error('[startup] Migration failed (server will still start):', e.message);
}

console.log('[startup] Starting API server...');
require(path.join(backendDir, 'src', 'index.js'));
