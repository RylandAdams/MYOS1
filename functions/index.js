const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { JSDOM } = require("jsdom");
const Readability = require("@mozilla/readability").Readability;

admin.initializeApp();

// In-memory cache for article content (24h TTL) to avoid hammering external sites
const articleCache = new Map();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

function getCached(url) {
  const entry = articleCache.get(url);
  if (!entry || Date.now() > entry.expires) return null;
  return entry.data;
}

function setCache(url, data) {
  articleCache.set(url, { data, expires: Date.now() + CACHE_TTL_MS });
}

const SOUNDCLOUD_USER = "https://soundcloud.com/rylandofficialmusic";

/**
 * Fetches RYLAND's tracks from SoundCloud API with artwork and stream URLs.
 * Credentials are stored in Firebase config (never in code).
 */
exports.getSoundCloudTracks = functions.https.onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") {
    res.set("Access-Control-Allow-Methods", "GET");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    res.status(204).send("");
    return;
  }

  const clientId = functions.config().soundcloud?.client_id;
  const clientSecret = functions.config().soundcloud?.client_secret;

  if (!clientId || !clientSecret) {
    res.status(500).json({
      error: "SoundCloud credentials not configured. Run: firebase functions:config:set soundcloud.client_id=\"YOUR_ID\" soundcloud.client_secret=\"YOUR_SECRET\"",
    });
    return;
  }

  try {
    const token = await getAccessToken(clientId, clientSecret);
    const user = await resolveUser(token, SOUNDCLOUD_USER);
    const tracks = await fetchUserTracks(token, user.id);

    res.json({
      tracks: tracks.map((t) => ({
        id: String(t.id),
        title: t.title || "Untitled",
        artist: t.user?.username || "RYLAND",
        duration: formatDuration(t.duration),
        artwork: t.artwork_url ? t.artwork_url.replace("-large", "-t500x500") : null,
        soundcloudUrl: t.permalink_url,
        streamUrl: t.media?.transcodings?.[0]?.url || null,
        releaseDate: t.created_at ? t.created_at.slice(0, 10) : null,
      })),
    });
  } catch (err) {
    console.error("SoundCloud API error:", err.message);
    res.status(500).json({ error: err.message || "Failed to fetch tracks" });
  }
});

/**
 * Search SoundCloud tracks by query. Returns up to 10 playable tracks.
 * GET /api/soundcloud-search?q=searchterm
 */
exports.getSoundCloudSearch = functions.https.onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") {
    res.set("Access-Control-Allow-Methods", "GET");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    res.status(204).send("");
    return;
  }

  const clientId = functions.config().soundcloud?.client_id;
  const clientSecret = functions.config().soundcloud?.client_secret;
  const q = (req.query.q || "").trim();

  if (!clientId || !clientSecret) {
    res.status(500).json({
      error: "SoundCloud credentials not configured",
    });
    return;
  }

  if (!q) {
    res.json({ tracks: [] });
    return;
  }

  try {
    const token = await getAccessToken(clientId, clientSecret);
    const tracks = await searchTracks(token, clientId, q, 10);

    res.json({
      tracks: tracks.map((t) => normalizeTrack(t)),
    });
  } catch (err) {
    console.error("SoundCloud search error:", err.message);
    res.status(500).json({ error: err.message || "Search failed" });
  }
});

/**
 * Fetches a URL, extracts article content with Readability, returns clean HTML.
 * GET /api/article?url=https://example.com/article
 */
exports.getArticleContent = functions.https.onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") {
    res.set("Access-Control-Allow-Methods", "GET");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    res.status(204).send("");
    return;
  }

  const url = (req.query.url || "").trim();
  if (!url) {
    res.status(400).json({ error: "Missing url query parameter" });
    return;
  }

  // Basic URL validation
  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      res.status(400).json({ error: "Invalid URL protocol" });
      return;
    }
  } catch {
    res.status(400).json({ error: "Invalid URL" });
    return;
  }

  const cached = getCached(url);
  if (cached) {
    res.json(cached);
    return;
  }

  try {
    const resp = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; RYLAND-News-Reader/1.0)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });

    if (!resp.ok) {
      res.status(resp.status).json({ error: `Failed to fetch: ${resp.status}` });
      return;
    }

    const html = await resp.text();
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article || !article.content) {
      res.status(422).json({
        error: "Could not extract article content",
        fallback: true,
        originalUrl: url,
      });
      return;
    }

    const result = {
      title: article.title || "",
      content: article.content,
      excerpt: article.excerpt || "",
      byline: article.byline || "",
      siteName: article.siteName || "",
      originalUrl: url,
    };

    setCache(url, result);
    res.json(result);
  } catch (err) {
    console.error("Article fetch error:", err.message);
    res.status(500).json({
      error: err.message || "Failed to fetch article",
      fallback: true,
      originalUrl: url,
    });
  }
});

async function searchTracks(token, clientId, query, limit = 10) {
  // Try v2 search endpoint first (uses client_id)
  const v2Url = `https://api-v2.soundcloud.com/search/tracks?q=${encodeURIComponent(query)}&client_id=${clientId}&limit=${limit}&linked_partitioning=1`;
  const v2Res = await fetch(v2Url, {
    headers: { Accept: "application/json; charset=utf-8" },
  });

  if (v2Res.ok) {
    const data = await v2Res.json();
    const collection = data.collection || (Array.isArray(data) ? data : []);
    if (collection.length > 0) {
      return collection;
    }
  }

  // Fallback: v1 tracks endpoint with OAuth
  const v1Url = `https://api.soundcloud.com/tracks?q=${encodeURIComponent(query)}&access=playable&limit=${limit}&linked_partitioning=true`;
  const v1Res = await fetch(v1Url, {
    headers: {
      Accept: "application/json; charset=utf-8",
      Authorization: `OAuth ${token}`,
    },
  });

  if (!v1Res.ok) {
    const text = await v1Res.text();
    throw new Error(`Search failed: ${v1Res.status} ${text}`);
  }

  const data = await v1Res.json();
  return Array.isArray(data) ? data : data.collection || [];
}

// Cache token to avoid SoundCloud's strict limit: 50 tokens/12h per app, 30/h per IP
let cachedToken = null;
let tokenExpiresAt = 0;

async function getAccessToken(clientId, clientSecret) {
  if (cachedToken && Date.now() < tokenExpiresAt - 60000) {
    return cachedToken; // Reuse if >1 min before expiry
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const res = await fetch("https://secure.soundcloud.com/oauth/token", {
    method: "POST",
    headers: {
      Accept: "application/json; charset=utf-8",
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${auth}`,
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  cachedToken = data.access_token;
  tokenExpiresAt = Date.now() + (data.expires_in || 3600) * 1000;
  return cachedToken;
}

async function resolveUser(token, url) {
  const res = await fetch(
    `https://api.soundcloud.com/resolve?url=${encodeURIComponent(url)}`,
    {
      headers: {
        Accept: "application/json; charset=utf-8",
        Authorization: `OAuth ${token}`,
      },
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Resolve failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  if (data.kind !== "user") {
    throw new Error("Resolve did not return a user");
  }
  return data;
}

async function fetchUserTracks(token, userId) {
  const res = await fetch(
    `https://api.soundcloud.com/users/${userId}/tracks`,
    {
      headers: {
        Accept: "application/json; charset=utf-8",
        Authorization: `OAuth ${token}`,
      },
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Tracks fetch failed: ${res.status} ${text}`);
  }

  return res.json();
}

function formatDuration(ms) {
  if (!ms || typeof ms !== "number") return "0:00";
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function normalizeTrack(t) {
  const permalink = t.permalink_url || t.permalink || (t.uri ? `https://soundcloud.com${t.uri}` : null);
  const username = t.user?.username || "Unknown";
  return {
    id: String(t.id),
    title: t.title || "Untitled",
    artist: username,
    duration: formatDuration(t.duration),
    artwork: t.artwork_url ? t.artwork_url.replace("-large", "-t500x500") : null,
    soundcloudUrl: permalink,
    streamUrl: t.media?.transcodings?.[0]?.url || null,
  };
}

/**
 * Lists photo URLs for a place (e.g. mexico) from Firebase Storage.
 * GET /api/photos?place=mexico
 */
exports.getPhotoUrls = functions.https.onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") {
    res.set("Access-Control-Allow-Methods", "GET");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    res.status(204).send("");
    return;
  }

  const place = (req.query.place || "").trim();
  if (!place) {
    res.status(400).json({ error: "Missing place query parameter" });
    return;
  }

  try {
    const bucket = admin.storage().bucket();
    const prefix = `photos/${place}/`;
    const [files] = await bucket.getFiles({ prefix });

    const urls = files
      .filter((f) => !f.name.endsWith("/"))
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((file) => {
        const encoded = encodeURIComponent(file.name);
        return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encoded}?alt=media`;
      });

    res.json({ urls });
  } catch (err) {
    console.error("Photo URLs error:", err.message);
    res.status(500).json({ error: err.message || "Failed to list photos" });
  }
});
