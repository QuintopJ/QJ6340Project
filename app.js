var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
const db = require("./db");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// ROUTES
app.use("/", indexRouter);
app.use("/users", usersRouter);

/**
 * OpenSea helper: pulls collection basics + stats
 * Docs show stats endpoint: /api/v2/collections/{slug}/stats
 */
app.get("/api/nft/opensea", async (req, res) => {
  try {
    const slug = String(req.query.slug || "").trim();

    if (!slug) {
      return res.status(400).json({ error: "Missing ?slug= (example: ?slug=azuki)" });
    }

    const apiKey = process.env.OPENSEA_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: "Missing OPENSEA_API_KEY on server (DigitalOcean env vars).",
      });
    }

    const headers = {
      accept: "application/json",
      "x-api-key": apiKey,
    };

    // 1) Collection basics
    const collectionUrl = `https://api.opensea.io/api/v2/collections/${encodeURIComponent(slug)}`;
    const collectionResp = await fetch(collectionUrl, { headers });
    const collectionJson = await collectionResp.json();

    if (!collectionResp.ok) {
      return res.status(collectionResp.status).json({
        error: "OpenSea collection request failed",
        status: collectionResp.status,
        detail: collectionJson,
      });
    }

    // 2) Collection stats (floor, owners, etc.)
    const statsUrl = `https://api.opensea.io/api/v2/collections/${encodeURIComponent(slug)}/stats`;
    const statsResp = await fetch(statsUrl, { headers });
    const statsJson = await statsResp.json();

    // stats can fail even if collection works (rate limits, permissions)
    const statsOk = statsResp.ok;

    // Try to be flexible with response shapes
    const name = collectionJson?.name ?? collectionJson?.collection?.name ?? null;
    const description =
      collectionJson?.description ?? collectionJson?.collection?.description ?? null;
    const image =
      collectionJson?.image_url ??
      collectionJson?.collection?.image_url ??
      collectionJson?.image ??
      null;

    const totalSupply =
      collectionJson?.total_supply ??
      collectionJson?.collection?.total_supply ??
      collectionJson?.supply ??
      null;

    // Common stats keys (best effort; OpenSea may change shapes)
    const floorEth =
      statsJson?.total?.floor_price ??
      statsJson?.floor_price ??
      statsJson?.floorPrice ??
      null;

    const owners =
      statsJson?.total?.num_owners ??
      statsJson?.num_owners ??
      statsJson?.owners ??
      null;

    res.json({
      name,
      slug,
      description,
      image,
      supply: totalSupply,
      owners: owners ?? null,
      floorEth: floorEth ?? null,
      externalUrl: `https://opensea.io/collection/${slug}`,
      stats: statsOk ? statsJson : null,
      statsError: statsOk ? null : statsJson,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({
      error: "Server error",
      detail: String(err),
    });
  }
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
