// db.js
import 'dotenv/config';
import mysql from 'mysql2/promise';

export const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'Quinn',
  password: process.env.DB_PASSWORD || 'Mama1984',
  database: process.env.DB_NAME || 'nft_mint',
  waitForConnections: true,
  connectionLimit: 10,
});

export async function getAllProjects() {
  const [rows] = await pool.query(
    `SELECT id, title, image, summary, description, tags, marketplaceUrl
     FROM projects ORDER BY id ASC`
  );
  return rows.map(r => ({
    ...r,
    tags: Array.isArray(r.tags) ? r.tags : r.tags ? JSON.parse(r.tags) : []
  }));
}

export async function getProjectById(id) {
  const [rows] = await pool.query(
    `SELECT id, title, image, summary, description, tags, marketplaceUrl
     FROM projects WHERE id = ? LIMIT 1`,
    [id]
  );
  if (!rows.length) return null;
  const r = rows[0];
  return {
    ...r,
    tags: Array.isArray(r.tags) ? r.tags : r.tags ? JSON.parse(r.tags) : []
  };
}
