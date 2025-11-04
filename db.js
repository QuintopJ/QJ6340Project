// db.js
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// Resolve DB name from env (supports DB_DATABASE or legacy DB_NAME)
const DB_NAME = process.env.DB_DATABASE || process.env.DB_NAME || 'nft_mint';

// Optional SSL (for DigitalOcean)
let ssl = undefined;
if (process.env.DB_SSL_CA) {
  const caPath = path.isAbsolute(process.env.DB_SSL_CA)
    ? process.env.DB_SSL_CA
    : path.join(__dirname, process.env.DB_SSL_CA);
  ssl = { ca: fs.readFileSync(caPath, 'utf8'), rejectUnauthorized: true };
}

// Create the pool and **export it**
export const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  namedPlaceholders: true,
  ssl
});

// ---- Helpers ---------------------------------------------------------------

function safeParseTags(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  try {
    const parsed = typeof val === 'string' ? JSON.parse(val) : val;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// ---- Queries (new schema with old-schema fallback) -------------------------

export async function getAllProjects() {
  // Try NEW schema (project_name/img_url/…)
  try {
    const [rows] = await pool.query(`
      SELECT
        id,
        project_name        AS title,
        img_url             AS image,
        project_description AS description,
        quantity,
        price_eth,
        royalty_percent,
        marketplace_url     AS marketplaceUrl,
        active,
        tags
      FROM projects
      ORDER BY id DESC
    `);

    return rows.map(r => ({
      id: r.id,
      title: r.title,
      image: r.image,
      summary: r.description,
      description: r.description,
      tags: safeParseTags(r.tags),
      marketplaceUrl: r.marketplaceUrl || null,
      quantity: r.quantity ?? null,
      price_eth: r.price_eth ?? null,
      royalty_percent: r.royalty_percent ?? null,
      active: r.active ?? 1
    }));
  } catch {
    // Fallback to OLD schema (title/image/summary/description/marketplaceUrl)
    const [rows] = await pool.query(`
      SELECT
        id,
        title,
        image,
        COALESCE(description, summary) AS description,
        marketplaceUrl
      FROM projects
      ORDER BY id DESC
    `);

    return rows.map(r => ({
      id: r.id,
      title: r.title,
      image: r.image,
      summary: r.description,
      description: r.description,
      tags: [],
      marketplaceUrl: r.marketplaceUrl || null,
      quantity: null,
      price_eth: null,
      royalty_percent: null,
      active: 1
    }));
  }
}

export async function getProjectById(id) {
  // Try NEW schema first
  try {
    const [rows] = await pool.query(`
      SELECT
        id,
        project_name        AS title,
        img_url             AS image,
        project_description AS description,
        quantity,
        price_eth,
        royalty_percent,
        marketplace_url     AS marketplaceUrl,
        active,
        tags
      FROM projects
      WHERE id = ?
      LIMIT 1
    `, [id]);

    const r = rows[0];
    if (!r) return null;

    return {
      id: r.id,
      title: r.title,
      image: r.image,
      summary: r.description,
      description: r.description,
      tags: safeParseTags(r.tags),
      marketplaceUrl: r.marketplaceUrl || null,
      quantity: r.quantity ?? null,
      price_eth: r.price_eth ?? null,
      royalty_percent: r.royalty_percent ?? null,
      active: r.active ?? 1
    };
  } catch {
    // Old schema fallback
    const [rows] = await pool.query(`
      SELECT
        id,
        title,
        image,
        COALESCE(description, summary) AS description,
        marketplaceUrl
      FROM projects
      WHERE id = ?
      LIMIT 1
    `, [id]);

    const r = rows[0];
    if (!r) return null;

    return {
      id: r.id,
      title: r.title,
      image: r.image,
      summary: r.description,
      description: r.description,
      tags: [],
      marketplaceUrl: r.marketplaceUrl || null,
      quantity: null,
      price_eth: null,
      royalty_percent: null,
      active: 1
    };
  }
}

// Optional utility for startup ping/logging
export async function pingDB() {
  try {
    await pool.query('SELECT 1');
    return { ok: 1 };
  } catch (e) {
    return { ok: 0, error: e?.code || String(e) };
  }
}
