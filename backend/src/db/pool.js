const { Pool } = require('pg');

// Connection pool tuned for Render/Railway free-tier limits.
// Render free PostgreSQL allows max 25 connections; we leave headroom for
// migrations, seeds, and concurrent deploys.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
    // rejectUnauthorized:false is required for Render/Railway managed Postgres
    // which uses self-signed certs. For dedicated Postgres with a proper CA cert,
    // set DATABASE_SSL_CA env var and switch to { ca: process.env.DATABASE_SSL_CA }.
    ? { rejectUnauthorized: false }
    : false,

  // Pool sizing: keep idle connections low on free-tier hosts
  max: process.env.DATABASE_POOL_MAX ? parseInt(process.env.DATABASE_POOL_MAX, 10) : 10,
  min: 2,

  // Fail fast on connection issues rather than queuing indefinitely
  connectionTimeoutMillis: 5_000,   // wait up to 5 s for a connection from the pool
  idleTimeoutMillis:       30_000,  // release idle connections after 30 s
  allowExitOnIdle: true,            // allow process.exit when pool is idle (graceful shutdown)
});

pool.on('error', (err) => {
  // Log but don't crash — the pool will try to reconnect on next query
  console.error('[db] Unexpected pool error:', err.message);
});

module.exports = pool;
