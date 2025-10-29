// db.js
import 'dotenv/config';
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'node:path';

// --- SSL selection ---
// Preferred for DO Managed MySQL: set DB_SSL=require (no CA file needed).
// If you really have a CA file path in DB_SSL_CA, we'll use it instead.
let ssl;
if (process.env.DB_SSL === 'require') {
  ssl = { rejectUnauthorized: true };
}
if (process.env.DB_SSL_CA) {
  try {
    const caPath = path.resolve(process.cwd(), process.env.DB_SSL_CA);
    const ca = fs.readFileSync(caPath);
    ssl = { ca }; // overrides 'require' mode with explicit CA
  } catch (err) {
    console.warn(`⚠️ Could not read DB_SSL_CA file: ${err.message}`);
  }
}

const {
  DB_HOST = '127.0.0.1',
  DB_PORT = '3306',
  DB_USER,
  DB_PASSWORD,
  DB_DATABASE, // <-- use this (NOT DB_NAME)
} = process.env;

export const pool = mysql.createPool({
  host: DB_HOST,
  port: Number(DB_PORT),
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_DATABASE,   // <-- fixed
  ssl,                     // undefined locally; SSL on DO
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10,
  idleTimeout: 60000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

// Helpers
export async function dbPing() {
  const [rows] = await pool.query('SELECT 1 AS ok');
  return rows[0];
}

export async function getAllProjects() {
  const [rows] = await pool.query(
    'SELECT id, project_name AS title, img_url AS image, project_description AS description, quantity, price_eth, open_date_gmt, royalty_percent, active FROM projects ORDER BY id DESC'
  );
  return rows;
}

export async function getProjectById(id) {
  const [rows] = await pool.query(
    'SELECT id, title, image, summary, description, tags, marketplaceUrl FROM projects WHERE id = ? LIMIT 1',
    [id]
  );
  return rows[0] || null;
}

// Startup probe
(async () => {
  try {
    const who = await dbPing();
    const mode = ssl
      ? (process.env.DB_SSL_CA ? 'SSL (CA file)' : 'SSL (require)')
      : 'No SSL';
    console.log(`✅ DB ready [${mode}] Ping:`, who);
  } catch (e) {
    console.error('❌ DB connection failed:', e.message);
  }
})();
