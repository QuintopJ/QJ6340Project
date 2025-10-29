// utils/database.js
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// Resolve CA path from project root regardless of where node is started
const caPath = process.env.DB_SSL_CA
  ? path.resolve(process.cwd(), process.env.DB_SSL_CA)
  : null;

if (!caPath || !fs.existsSync(caPath)) {
  console.warn('⚠️  CA certificate not found at', caPath, '(set DB_SSL_CA in .env)');
}

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
  ssl: caPath ? { ca: fs.readFileSync(caPath) } : undefined, // DO requires SSL
});

export async function getAllProjects() {
  const [rows] = await pool.query('SELECT * FROM projects ORDER BY id DESC');
  return rows;
}

export async function getProjectById(id) {
  const [rows] = await pool.query('SELECT * FROM projects WHERE id = ?', [id]);
  return rows[0];
}
