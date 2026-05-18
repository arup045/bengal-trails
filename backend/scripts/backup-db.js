/**
 * backup-db.js — Daily PostgreSQL backup to stdout or a file.
 *
 * Usage:
 *   node scripts/backup-db.js                    → prints pg_dump to stdout
 *   node scripts/backup-db.js > backup.sql       → saves to file
 *
 * Schedule on Render:
 *   Render → your service → Jobs → "Daily DB Backup"
 *   Command: node scripts/backup-db.js > /tmp/backup_$(date +%Y%m%d).sql
 *
 * For automated S3 upload:
 *   Set BACKUP_S3_BUCKET + AWS_ACCESS_KEY_ID + AWS_SECRET_ACCESS_KEY in env.
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
