// app.js
import "dotenv/config";
import express from "express";
import fetch from "node-fetch";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getAllProjects, getProjectById, pool, pingDB } from "./db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// ---------- Core middleware ----------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static assets (/public => /css, /js, /images)
app.use(express.static(path.join(__dirname, "public")));

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Globals for all views
app.use((_req, res, next) => {
  res.locals.title = "NFT Mint";
  next();
});

// ---------- Page routes ----------
app.get("/", async (_req, res, next) => {
  try {
    const projects = await getAllProjects();

    // ✅ IMPORTANT: always define featured so index.ejs never crashes
    const featured = (projects && projects.length > 0) ? projects[0] : null;

    res.render("index", { projects, featured });
  } catch (e) {
    next(e);
  }
});

app.get("/projects", async (_req, res, next) => {
  try {
    const projects = await getAllProjects();
    res.render("projects", { projects });
  } catch (e) {
    next(e);
  }
});

// NOTE: your templates use /projects/<id> in some places
app.get("/projects/:id", async (req, res, next) => {
  try {
    const project = await getProjectById(req.params.id);
    if (!project) return res.status(404).send("Project not found");
    res.render("project", { project });
  } catch (e) {
    next(e);
  }
});

app.get("/about", (_req, res) => res.render("about"));
app.get("/contact", (_req, res) => res.render("contact"));

// ---------- Health / DB test ----------
app.get("/ping", async (_req, res) => {
  try {
    const ok = await pingDB();
    res.json({ ok });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

app.get("/db-test", async (_req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT COUNT(*) AS n FROM projects");
    res.json(rows[0]);
  } catch (e) {
    next(e);
  }
});

// ---------------- NFT LIVE DATA (OpenSea) ----------------
// GET /api/nft/opensea?slug=azuki
app.get("/api/nft/opensea", async (req, res) => {
  try {
    const { slug } = req.query;
    if (!slug) return res.status(400).json({ error: "Missing collection slug" });

    const url = `https://api.opensea.io/api/v2/collections/${encodeURIComponent(slug)}`;

const r = await fetch(url, {
  headers: {
    accept: "application/json",
    "x-api-key": process.env.OPENSEA_API_KEY,
    "user-agent": "NFT-Chatbot/1.0",
  },
});


    // ✅ Return useful debug info if OpenSea blocks (403 / 429 / etc.)
    if (!r.ok) {
      const body = await r.text().catch(() => "");
      return res.status(r.status).json({
        error: "OpenSea request failed",
        status: r.status,
        bodyPreview: body.slice(0, 250),
      });
    }

    const data = await r.json();
    const c = data.collection;

    if (!c) return res.json({ message: "No collection found." });

    res.json({
      name: c.name,
      slug: c.collection,
      description: c.description,
      image: c.image_url,
      supply: c.total_supply,
      owners: c.num_owners,
      floorEth: c.floor_price,
      externalUrl: c.external_url,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: "Server error", detail: String(err) });
  }
});

// ---------- Error handling ----------

// 404
app.use((_req, res) => {
  res.status(404).send("404 — Not Found");
});

// Central error handler
app.use((err, _req, res, _next) => {
  console.error("❌ Server error:", err);
  res.status(500).send("500 — Something went wrong.");
});

// ---------- Start server ----------
app.listen(PORT, () => {
  console.log(`✅ Server running → http://localhost:${PORT}`);
});
