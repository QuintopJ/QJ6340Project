/**
 * app.js
 * Express server + pages + chatbot API + OpenSea proxy API
 *
 * Key goals:
 * - No "..." placeholders (those crash deployment)
 * - Chatbot knows your site content (Quinn voice)
 * - Optional live OpenSea collection lookup via /api/nft/opensea?slug=
 */

require("dotenv").config();
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");

// Node 18+ has global fetch. If you're on older Node locally, upgrade.
const app = express();
const PORT = process.env.PORT || 8080;

// --------------------
// View + Static
// --------------------
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Your project uses /css and /js folders (per your VS Code screenshot)
app.use("/css", express.static(path.join(__dirname, "css")));
app.use("/js", express.static(path.join(__dirname, "js")));
app.use("/images", express.static(path.join(__dirname, "images")));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// --------------------
// Optional DB (won't crash if DB vars missing)
// --------------------
let db = null;
try {
  db = require("./db"); // exports pool + helpers
} catch (e) {
  console.warn("DB not loaded (ok if you’re not using DB right now):", e.message);
}

// --------------------
// Site “Knowledge Base” (what your chatbot should know)
// --------------------
const SITE_KB = {
  identity: {
    name: "Quinn Harris",
    vibe: "neon / vaporwave / LA nights / streetwear + futuristic",
    mission:
      "I make neon-soaked digital art and I'm building an NFT portfolio site that blends visuals + on-chain culture + clean UI.",
  },
  pages: {
    home: "Home is the landing page for the NFT Mint project. It’s the hub to explore the site and start navigating.",
    projects:
      "Projects is where I showcase drops/collections and the creative direction behind them.",
    about:
      "About is my artist page — the story, the vibe, what I’m exploring, and what collectors can expect.",
    contact:
      "Contact is where someone can reach out for collabs, commissions, or questions.",
  },
  wallet: {
    connect:
      "The Connect Wallet button is there so collectors can link a wallet (ex: MetaMask). If it’s not installed, you’ll need to add the extension first.",
    safety:
      "Never share seed phrases. If something asks for a seed phrase, it’s a scam.",
  },
  minting: {
    note:
      "This project is a front-end + web app experience. Live minting depends on having a deployed contract. Right now, the focus is UI/UX and AI integration.",
  },
  ai: {
    chatbotPurpose:
      "This chatbot is my on-site assistant — it explains the site, helps with NFT questions, and can pull live OpenSea collection info when you paste a collection link.",
  },
};

// --------------------
// Helpers
// --------------------
function extractOpenSeaSlug(text) {
  if (!text) return null;
  // Accept: https://opensea.io/collection/azuki
  const match = text.match(/opensea\.io\/collection\/([a-zA-Z0-9-_.]+)/i);
  return match ? match[1] : null;
}

function formatCollectionSummary(c) {
  // Keep it simple + reliable. Floor/owners often aren’t provided by OS v2 collection endpoint.
  const name = c?.name || "Unknown collection";
  const slug = c?.slug || "unknown";
  const supply = c?.total_supply ?? c?.supply ?? "N/A";
  const url = c?.opensea_url || c?.external_url || `https://opensea.io/collection/${slug}`;
  return `OpenSea Live Info:\n• ${name}\n• Supply: ${supply}\n• Link: ${url}`;
}

function quinnStyleAnswer(userMsg) {
  const msg = (userMsg || "").toLowerCase();

  // Quick intent matching
  if (msg.includes("who are you") || msg.includes("your name") || msg.includes("quinn")) {
    return `I’m Quinn’s on-site assistant. The vibe here is ${SITE_KB.identity.vibe}. ${SITE_KB.identity.mission}`;
  }

  if (msg.includes("about")) return SITE_KB.pages.about;
  if (msg.includes("project")) return SITE_KB.pages.projects;
  if (msg.includes("contact")) return SITE_KB.pages.contact;
  if (msg.includes("home")) return SITE_KB.pages.home;

  if (msg.includes("connect") || msg.includes("wallet") || msg.includes("metamask")) {
    return `${SITE_KB.wallet.connect}\n\nQuick safety note: ${SITE_KB.wallet.safety}`;
  }

  if (msg.includes("mint")) {
    return `${SITE_KB.minting.note}\n\nIf you want, tell me what you want the mint flow to feel like (simple / hype / “gallery” vibe) and I’ll suggest UI copy.`;
  }

  if (msg.includes("ai") || msg.includes("chatbot")) {
    return SITE_KB.ai.chatbotPurpose;
  }

  // Default
  return `Got you. Ask me about the site (Home/Projects/About/Contact), wallet setup, or paste an OpenSea collection link and I’ll pull live collection details.`;
}

// --------------------
// Pages
// --------------------
app.get("/", async (req, res) => {
  // If you have DB projects, you can load a featured project. Otherwise fallback.
  let featured = null;

  try {
    if (db?.getFeaturedProject) {
      featured = await db.getFeaturedProject();
    }
  } catch (e) {
    console.warn("Featured project load failed (ok):", e.message);
  }

  res.render("index", {
    title: "Personal NFT Mint",
    featured,
  });
});

// If you have about/projects/contact EJS templates, these routes will work.
// If not, remove them or add the EJS files.
app.get("/about", (req, res) => res.render("about", { title: "About" }));
app.get("/projects", (req, res) => res.render("projects", { title: "Projects" }));
app.get("/contact", (req, res) => res.render("contact", { title: "Contact" }));

// --------------------
// API: OpenSea proxy (keeps key server-side)
// --------------------
app.get("/api/nft/opensea", async (req, res) => {
  const slug = (req.query.slug || "").trim();
  if (!slug) return res.status(400).json({ error: "Missing slug" });

  const apiKey = process.env.OPENSEA_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "OPENSEA_API_KEY not set on server" });
  }

  try {
    // OpenSea v2 collections endpoint
    const url = `https://api.opensea.io/api/v2/collections/${encodeURIComponent(slug)}`;
    const r = await fetch(url, {
      headers: {
        accept: "application/json",
        "x-api-key": apiKey,
      },
    });

    if (!r.ok) {
      const text = await r.text();
      return res.status(r.status).json({
        error: "OpenSea request failed",
        status: r.status,
        detail: text.slice(0, 300),
      });
    }

    const data = await r.json();

    // The object shape can vary. Normalize a little:
    const c = data?.collection || data; // some responses nest in "collection"

    res.json({
      name: c?.name ?? null,
      slug: c?.collection ?? c?.slug ?? slug,
      description: c?.description ?? null,
      image: c?.image_url ?? c?.image ?? null,
      total_supply: c?.total_supply ?? c?.supply ?? null,
      opensea_url: c?.external_url ? c.external_url : `https://opensea.io/collection/${slug}`,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: "Server error", detail: String(err) });
  }
});

// --------------------
// API: Chatbot
// --------------------
app.post("/api/chat", async (req, res) => {
  const message = (req.body.message || "").trim();

  // If the user pasted an OpenSea collection URL, fetch live info
  const slug = extractOpenSeaSlug(message);
  if (slug) {
    try {
      // call our own endpoint
      const r = await fetch(
        `${req.protocol}://${req.get("host")}/api/nft/opensea?slug=${encodeURIComponent(slug)}`
      );
      const data = await r.json();

      if (!r.ok) {
        return res.json({
          reply: `I tried pulling that OpenSea collection, but it didn’t work.\n\nStatus: ${data?.status || r.status}\nTip: double-check the slug and that OPENSEA_API_KEY is set on the server.`,
        });
      }

      const reply = formatCollectionSummary({
        name: data?.name,
        slug: data?.slug,
        total_supply: data?.total_supply,
        external_url: data?.opensea_url,
        opensea_url: data?.opensea_url,
      });

      return res.json({ reply });
    } catch (e) {
      return res.json({
        reply:
          "I couldn’t fetch that collection right now. If it keeps happening, it’s usually the API key/env var not loading in the server process.",
      });
    }
  }

  // Otherwise: answer from site knowledge base
  return res.json({ reply: quinnStyleAnswer(message) });
});

// --------------------
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
