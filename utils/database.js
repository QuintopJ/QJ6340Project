// utils/database.js
import mysql from 'mysql2';
import dotenv from 'dotenv';
import { pathToFileURL } from 'url';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,        // 127.0.0.1
  user: process.env.DB_USER,        // Quinn
  password: process.env.DB_PASSWORD, // Mama1984
  database: process.env.DB_NAME,     // nft_mint
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const db = pool.promise();
export default db;

/* -------- optional: run “node utils/database.js” to self-test -------- */
const isDirectRun = import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  (async () => {
    try {
      const [rows] = await db.query('SELECT DATABASE() AS db, USER() AS user');
      console.log('✅ MySQL connection OK:', rows[0]);
      const [countRows] = await db.query('SELECT COUNT(*) AS n FROM projects');
      console.log('📦 projects rows:', countRows[0].n);
      process.exit(0);
    } catch (err) {
      console.error('❌ MySQL connection FAILED:', err.code, err.message);
      process.exit(1);
    }
  })();
}
