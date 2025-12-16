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

// Serve static assets
app.use(express.static(path.join(__dirname, "public")));

// Views
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ---------- Page routes ----------
app.get("/", async (_req, res, next) => {
  try {
    const projects = await getAllProjects();
    res.render("index", { projects });
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

app.get("/project/:id", async (req, res, next) => {
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
        "user-agent": "NFT-Chatbot/1.0",
      },
    });

    if (!r.ok) {
      return res.status(r.status).json({ error: "Failed to fetch OpenSea data" });
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
app.use((req, res) => {
  res.status(404).send("404 — Not Found");
});

// Central error handler
app.use((err, req, res, _next) => {
  console.error("❌ Server error:", err);
  res.status(500).send("500 — Something went wrong.");
});

// ---------- Start server ----------
app.listen(PORT, () => {
  console.log(`✅ Server running → http://localhost:${PORT}`);
});
