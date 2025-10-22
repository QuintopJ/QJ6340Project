import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getAllProjects, getProjectById, pool } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Home: random featured
app.get('/', async (req, res, next) => {
  try {
    const projects = await getAllProjects();
    const featured = projects.length
      ? projects[Math.floor(Math.random() * projects.length)]
      : null;
    res.render('index', { title: 'Personal NFT Mint', featured });
  } catch (e) { next(e); }
});

// All projects
app.get('/projects', async (req, res, next) => {
  try {
    const projects = await getAllProjects();
    res.render('projects', { title: 'Projects · NFT Mint', projects });
  } catch (e) { next(e); }
});

// Single project
app.get('/projects/:id', async (req, res, next) => {
  try {
    const project = await getProjectById(Number(req.params.id));
    if (!project) return res.status(404).render('project', { title: 'Not Found · NFT Mint', project: null });
    res.render('project', { title: `${project.title} · NFT Mint`, project });
  } catch (e) { next(e); }
});

// optional quick test
app.get('/db-test', async (_req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT COUNT(*) AS n FROM projects');
    res.json(rows[0]);
  } catch (e) { next(e); }
});

app.listen(PORT, () => console.log(`Server running → http://localhost:${PORT}`));
