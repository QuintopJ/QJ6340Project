// app.js
import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getAllProjects, getProjectById, pool, pingDB } from './db.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app  = express();
const PORT = process.env.PORT || 3000;

// ---------- Core middleware ----------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static assets live under /public (so /images/*, /css/*, /js/* work)
app.use(express.static(path.join(__dirname, 'public')));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Globals for all views
app.use((req, res, next) => {
  res.locals.title = 'NFT Mint';
  res.locals.currentPath = req.path;
  res.locals.year = new Date().getFullYear();
  next();
});

// ---------- Routes ----------

// Home (random featured project)
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
    if (!project) {
      return res.status(404).render('project', {
        title: 'Not Found · NFT Mint',
        project: null,
      });
    }
    res.render('project', { title: `${project.title} · NFT Mint`, project });
  } catch (e) { next(e); }
});

// Static pages
app.get('/about',  (_req, res) => res.render('about',  { title: 'About · NFT Mint' }));
app.get('/contact',(_req, res) => res.render('contact',{ title: 'Contact · NFT Mint' }));

// Legacy redirects
app.get(['/about.html', '/contact.html', '/projects.html'], (req, res) => {
  const map = {
    '/about.html': '/about',
    '/contact.html': '/contact',
    '/projects.html': '/projects',
  };
  res.redirect(301, map[req.path]);
});

// ---------- Health + DB check ----------
app.get('/health', (_req, res) => res.send('ok'));
app.get('/db-ping', async (_req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT 1 AS ok');
    res.json(rows[0]);
  } catch (e) { next(e); }
});

// Quick DB sanity route
app.get('/db-test', async (_req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT COUNT(*) AS n FROM projects');
    res.json(rows[0]);
  } catch (e) { next(e); }
});

// ---------- Error handling ----------

// 404
app.use((req, res) => {
  res.status(404).send('404 — Not Found');
});

// Central error handler
app.use((err, req, res, _next) => {
  console.error('❌ Server error:', err);
  res.status(500).send('500 — Something went wrong.');
});

// ---------- Start server ----------
app.listen(PORT, () => {
  console.log(`✅ Server running → http://localhost:${PORT}`);
});



