// app.js (ESM because "type":"module")
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

/* Hardening + basics */
app.disable("x-powered-by");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* Static assets (CSS, images, client JS) go in /public */
app.use(express.static(path.join(__dirname, "public")));

/* EJS setup */
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

/* Site-wide locals (optional) */
app.locals.site = {
  name: "NFT Mint",
  author: "Quinn Harris",
};

/* Routes */
app.get("/", (req, res) => res.render("index", { title: "Home · NFT Mint" }));
app.get("/projects", (req, res) => res.render("projects", { title: "Projects · NFT Mint" }));
app.get("/about", (req, res) => res.render("about", { title: "About · NFT Mint" }));
app.get("/contact", (req, res) => res.render("contact", { title: "Contact · NFT Mint" }));

/* Health check (handy for hosting) */
app.get("/healthz", (_req, res) => res.send("ok"));

/* 404 */
app.use((req, res) => {
  res.status(404).render("index", { title: "Not Found · NFT Mint" });
});

app.listen(PORT, () => {
  console.log(`Server running → http://localhost:${PORT}`);
});
