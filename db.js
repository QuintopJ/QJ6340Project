// db.js
import 'dotenv/config';
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'node:path';

// Resolve SSL CA if provided (DigitalOcean)
let ssl;
if (process.env.DB_SSL_CA) {
  const caPath = path.resolve(process.cwd(), process.env.DB_SSL_CA);
  try {
    ssl = { ca: fs.readFileSync(caPath) };
  } catch (err) {
    console.warn(`⚠️ Could not read DB_SSL_CA at ${caPath}:`, err.message);
  }
}

export const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl, // undefined locally; { ca: ... } on DO
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10,
  idleTimeout: 60000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

// Small helper so app.js can test quickly if needed
export async function dbPing() {
  const [rows] = await pool.query('SELECT 1 AS ok');
  return rows[0];
}

export async function getAllProjects() {
  const [rows] = await pool.query(
    'SELECT id, title, image, summary, description, tags, marketplaceUrl FROM projects ORDER BY id DESC'
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

// Optional: log a friendly startup message (one-time)
(async () => {
  try {
    const who = await dbPing();
    const mode = process.env.DB_SSL_CA ? 'DigitalOcean/SSL' : 'Local';
    console.log(`✅ DB ready (${mode}). Ping:`, who);
  } catch (e) {
    console.error('❌ DB connection failed:', e.message);
  }
})();
