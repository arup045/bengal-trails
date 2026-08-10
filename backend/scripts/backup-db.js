/**
 * backup-db.js — Daily PostgreSQL backup to stdout or a file.
 *
 * Usage (manual / local plaintext dump):
 *   node scripts/backup-db.js                    → prints pg_dump to stdout
 *   node scripts/backup-db.js > backup.sql       → saves to file
 *
 * NOTE: the AUTOMATED nightly backup does NOT use this script. It runs in
 * .github/workflows/db-backup.yml (free GitHub Actions), which pg_dumps the
 * Render DB, AES-256 encrypts it, and stores it as an artifact. Restore with
 * backend/scripts/restore-db.sh. This script remains for ad-hoc local dumps.
 * Output here is PLAINTEXT — never commit it or upload it to the public repo.
 */
'use strict';

require('dotenv').config();
const { execSync } = require('child_process');
const path = require('path');

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('[backup] DATABASE_URL not set');
  process.exit(1);
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const filename  = `bengal-trails-backup-${timestamp}.sql`;

console.error(`[backup] Starting backup → ${filename}`);

try {
  const result = execSync(
    `pg_dump "${DATABASE_URL}" --no-owner --no-acl --format=plain`,
    { encoding: 'utf8', maxBuffer: 100 * 1024 * 1024 }
  );
  process.stdout.write(result);
  console.error(`[backup] Backup complete (${Math.round(result.length / 1024)} KB)`);
} catch (err) {
  console.error('[backup] pg_dump failed:', err.message);
  process.exit(1);
}
