// AI Seller · pubblicazione automatica della config cliente su Vercel Blob.
// Lo Studio fa POST {id, config} → salviamo come blob pubblico → torniamo l'URL live (CORS aperto).
// Se lo storage non è ancora attivo (manca BLOB_READ_WRITE_TOKEN) → risponde storage_not_configured
// e lo Studio fa il fallback (download manuale). Made in Italy.

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "POST only" });

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(200).json({ ok: false, error: "storage_not_configured" });
  }

  try {
    let body = req.body;
    if (typeof body === "string") { try { body = JSON.parse(body); } catch (e) { body = null; } }
    if (!body) {                                   // fallback: leggi il body grezzo
      const raw = await new Promise((resolve) => {
        let d = ""; req.on("data", c => d += c); req.on("end", () => resolve(d)); req.on("error", () => resolve(""));
      });
      try { body = JSON.parse(raw); } catch (e) { body = null; }
    }
    const id = String((body && body.id) || "").replace(/[^a-z0-9-]/gi, "").slice(0, 40).toLowerCase();
    const config = body && body.config;
    if (!id || !config) return res.status(400).json({ ok: false, error: "missing id/config" });

    const { put } = require("@vercel/blob");
    const json = JSON.stringify(config);
    const blob = await put("clients/" + id + ".json", json, {
      access: "public",
      contentType: "application/json; charset=utf-8",
      addRandomSuffix: false,
      allowOverwrite: true,
      cacheControlMaxAge: 60,
      token: process.env.BLOB_READ_WRITE_TOKEN
    });
    return res.status(200).json({ ok: true, url: blob.url, id: id });
  } catch (e) {
    return res.status(200).json({ ok: false, error: "save_failed: " + (e && e.message || e) });
  }
};
