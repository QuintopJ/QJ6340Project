// db.js — with SSL fix for self-signed certs (DigitalOcean safe)

import 'dotenv/config';
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'node:path';

// ---------- SSL CONFIGURATION ----------
// If DB_SSL_CA exists (DigitalOcean Managed MySQL)
// Otherwise fallback to safe SSL that skips self-signed verification for deployment

let ssl;

if (process.env.DB_SSL_CA) {
  const caPath = path.resolve(process.cwd(), process.env.DB_SSL_CA);
  try {
    ssl = {
      ca: fs.readFileSync(caPath),
      rejectUnauthorized: false, // ✅ Prevent "self-signed certificate in certificate chain"
    };
  } catch (err) {
    console.warn(`⚠️ Could not read DB_SSL_CA at ${caPath}:`, err.message);
    ssl = { rejectUnauthorized: false };
  }
} else if (process.env.DB_SSL === 'require') {
  ssl = { rejectUnauthorized: false }; // fallback if only "require" provided
}

// ---------- CONNECTION POOL ----------
export const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl, // DigitalOcean requires SSL
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10,
  idleTimeout: 60000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

// ---------- BASIC UTILITIES ----------

export async function dbPing() {
  const [rows] = await pool.query('SELECT 1 AS ok');
  return rows[0];
}

export async function getAllProjects() {
  const [rows] = await pool.query(
    'SELECT id, project_name AS title, img_url AS image, project_description AS description, quantity, price_eth, royalty_percent, active FROM projects ORDER BY id DESC'
  );
  return rows;
}

export async function getProjectById(id) {
  const [rows] = await pool.query(
    'SELECT id, project_name AS title, img_url AS image, project_description AS description, quantity, price_eth, royalty_percent, active FROM projects WHERE id = ? LIMIT 1',
    [id]
  );
  return rows[0] || null;
}

// ---------- STARTUP CHECK ----------
(async () => {
  try {
    const who = await dbPing();
    const mode = process.env.DB_HOST?.includes('ondigitalocean.com')
      ? 'DigitalOcean/SSL'
      : 'Local';
    console.log(`✅ DB ready (${mode}). Ping:`, who);
  } catch (e) {
    console.error('❌ DB connection failed:', e.message);
  }
})();
