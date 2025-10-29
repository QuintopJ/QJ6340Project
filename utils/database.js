import mysql from 'mysql2/promise';

const {
  DB_HOST,
  DB_PORT = 25060,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  DB_SSL
} = process.env;

export const pool = await mysql.createPool({
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  ssl: DB_SSL === 'require' ? { rejectUnauthorized: true } : undefined,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export async function getAllProjects() {
  const [rows] = await pool.query('SELECT * FROM projects ORDER BY id DESC');
  return rows;
}

export async function getProjectById(id) {
  const [rows] = await pool.query('SELECT * FROM projects WHERE id = ?', [id]);
  return rows[0] || null;
}
