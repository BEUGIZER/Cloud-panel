const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

if (!process.env.DATABASE_URL) {
  console.warn('[db] DATABASE_URL is not set. The panel will start, but DB calls will fail.');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('railway')
    ? { rejectUnauthorized: false }
    : undefined,
});

pool.on('error', (err) => {
  console.error('[db] Unexpected pool error:', err.message);
});

async function ensureSchema() {
  const schemaPath = path.join(__dirname, '..', 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');
  await pool.query(sql);
  console.log('[db] Schema ready.');
}

async function ping() {
  const start = Date.now();
  await pool.query('SELECT 1');
  return Date.now() - start;
}

module.exports = { pool, ensureSchema, ping };
