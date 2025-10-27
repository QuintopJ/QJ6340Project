import db from './database.js';

export async function getAllProjects() {
  try {
    const [rows] = await db.query('SELECT * FROM projects ORDER BY id');
    return rows;
  } catch (err) {
    console.error('Error fetching projects:', err);
    throw err;
  }
}
