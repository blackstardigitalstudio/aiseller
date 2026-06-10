// AI Seller · scraper di onboarding — dato un URL, estrae i prodotti del negozio.
// Supporta Shopify (/products.json), WooCommerce (Store API), fallback JSON-LD schema.org.
// Vercel serverless (Node 18+, fetch globale). Made in Italy.

const UA = { "user-agent": "Mozilla/5.0 (compatible; AISellerBot/1.0; +https://kayamansfarm-demo.vercel.app)", "accept": "application/json,text/html" };

function decode(s) {
  return String(s || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&#8211;|&#8212;/g, "–").replace(/&#8217;|&#039;|&#x27;/g, "’")
    .replace(/&#8220;|&#8221;|&quot;/g, '"').replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
    .replace(/\s+/g, " ").trim();
}
function clean(p) {
  p = parseFloat(p);
  return isNaN(p) ? null : Math.round(p * 100) / 100;
}
function host(u) { try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return ""; } }
function normUrl(u) { u = (u || "").trim(); if (!/^https?:\/\//i.test(u)) u = "https://" + u; return u.replace(/\/+$/, ""); }

async function getJSON(url) {
  const r = await fetch(url, { headers: UA, redirect: "follow" });
  if (!r.ok) throw new Error("status " + r.status);
  const ct = r.headers.get("content-type") || "";
  if (!ct.includes("json")) throw new Error("not json");
  return r.json();
}

// ---- SHOPIFY ----
async function shopify(base) {
  const out = [];
  for (let page = 1; page <= 4; page++) {
    let j;
    try { j = await getJSON(`${base}/products.json?limit=100&page=${page}`); } catch { break; }
    const arr = (j && j.products) || [];
    if (!arr.length) break;
    for (const p of arr) {
      const v = (p.variants && p.variants[0]) || {};
      out.push({
        name: decode(p.title),
        price: clean(v.price),
        category: decode(p.product_type || (p.tags && p.tags[0]) || "General"),
        image: (p.images && p.images[0] && p.images[0].src) || "",
        desc: decode(p.body_html).slice(0, 160)
      });
    }
    if (arr.length < 100) break;
  }
  return out;
}

// ---- WOOCOMMERCE (Store API pubblica) ----
async function woo(base) {
  const out = [];
  for (let page = 1; page <= 4; page++) {
    let arr;
    try { arr = await getJSON(`${base}/wp-json/wc/store/products?per_page=100&page=${page}`); }
    catch { try { arr = await getJSON(`${base}/wp-json/wc/store/v1/products?per_page=100&page=${page}`); } catch { break; } }
    if (!Array.isArray(arr) || !arr.length) break;
    for (const p of arr) {
      const minor = (p.prices && p.prices.currency_minor_unit) || 2;
      out.push({
        name: decode(p.name),
        price: p.prices ? Math.round(Number(p.prices.price) / Math.pow(10, minor) * 100) / 100 : null,
        category: decode((p.categories && p.categories[0] && p.categories[0].name) || "General"),
        image: (p.images && p.images[0] && p.images[0].src) || "",
        desc: decode(p.short_description || p.description).slice(0, 160)
      });
    }
    if (arr.length < 100) break;
  }
  return out;
}

// ---- FALLBACK: JSON-LD schema.org Product su qualche pagina ----
async function jsonld(base) {
  const out = [];
  const pages = ["", "/shop", "/tienda", "/store", "/products", "/collections/all", "/productos", "/catalogo"];
  for (const path of pages) {
    let html;
    try { const r = await fetch(base + path, { headers: { ...UA, accept: "text/html" } }); if (!r.ok) continue; html = await r.text(); } catch { continue; }
    const blocks = [...html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1]);
    for (const b of blocks) {
      let j; try { j = JSON.parse(b); } catch { continue; }
      const arr = Array.isArray(j) ? j : (j["@graph"] || [j]);
      for (const it of arr) {
        const t = it["@type"];
        if (t === "Product" || (Array.isArray(t) && t.includes("Product"))) {
          const off = Array.isArray(it.offers) ? it.offers[0] : it.offers;
          out.push({
            name: decode(it.name),
            price: clean(off && (off.price || off.lowPrice)),
            category: decode(it.category || "General"),
            image: (Array.isArray(it.image) ? it.image[0] : it.image) || "",
            desc: decode(it.description).slice(0, 160)
          });
        }
      }
    }
    if (out.length >= 8) break;
  }
  return out;
}

// ---- COLORI DEL BRAND: estrae la palette reale dalla pagina (CSS, variabili, bottoni) ----
function toHex(s) {
  s = String(s).trim().toLowerCase();
  let m = s.match(/^#([0-9a-f]{3})$/); if (m) return "#" + m[1].split("").map(c => c + c).join("");
  m = s.match(/^#([0-9a-f]{6})$/); if (m) return "#" + m[1];
  m = s.match(/^rgba?\(([^)]+)\)$/); if (m) return rgbToHex(m[1]);
  return "";
}
function rgbToHex(inner) {
  const p = inner.split(",").map(x => parseFloat(x)); if (p.length < 3 || p.slice(0, 3).some(isNaN)) return "";
  const h = n => { n = Math.max(0, Math.min(255, Math.round(n))).toString(16); return n.length < 2 ? "0" + n : n; };
  return "#" + h(p[0]) + h(p[1]) + h(p[2]);
}
function hexToHsl(hex) {
  const m = hex.match(/^#([0-9a-f]{6})$/i); if (!m) return null;
  const r = parseInt(m[1].slice(0, 2), 16) / 255, g = parseInt(m[1].slice(2, 4), 16) / 255, b = parseInt(m[1].slice(4, 6), 16) / 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b); let h = 0, s = 0, l = (mx + mn) / 2; const d = mx - mn;
  if (d) { s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn); if (mx === r) h = (g - b) / d + (g < b ? 6 : 0); else if (mx === g) h = (b - r) / d + 2; else h = (r - g) / d + 4; h /= 6; }
  return { h: h * 360, s, l };
}
function closeHue(aHex, bHex) {
  const A = hexToHsl(aHex), B = hexToHsl(bHex); if (!A || !B) return false;
  let dh = Math.abs(A.h - B.h); dh = Math.min(dh, 360 - dh);
  return dh < 18 && Math.abs(A.l - B.l) < 0.18;
}
async function brandColors(base, html) {
  let css = "";
  for (const m of html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)) css += "\n" + m[1];
  for (const m of html.matchAll(/style=["']([^"']+)["']/gi)) css += "\n" + m[1];
  // fogli di stile collegati (primi 4, dimensione limitata)
  const hrefs = [...html.matchAll(/<link[^>]+rel=["']stylesheet["'][^>]*>/gi)]
    .map(t => (t[0].match(/href=["']([^"']+)["']/i) || [])[1]).filter(Boolean).slice(0, 4);
  for (let href of hrefs) {
    try {
      if (!/^https?:/i.test(href)) href = href.indexOf("//") === 0 ? "https:" + href : base + (href[0] === "/" ? "" : "/") + href;
      const r = await fetch(href, { headers: UA }); if (!r.ok) continue;
      css += "\n" + (await r.text()).slice(0, 200000);
    } catch { }
  }
  const freq = {}, varSet = new Set();
  const add = (hex, w, isVar) => { hex = toHex(hex); if (!hex) return; freq[hex] = (freq[hex] || 0) + w; if (isVar) varSet.add(hex); };
  // variabili-colore con nomi "brand" → il vero colore del marchio (peso forte + flag)
  for (const m of css.matchAll(/--[\w-]*(?:primary|brand|accent|main|theme|principal)[\w-]*\s*:\s*(#[0-9a-fA-F]{3,6}|rgba?\([^)]+\))/gi)) add(m[1], 60, true);
  for (const m of css.matchAll(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g)) add("#" + m[1], 1, false);
  for (const m of css.matchAll(/rgba?\(([^)]+)\)/gi)) add("rgb(" + m[1] + ")", 1, false);
  const hueDist = (a, b) => Math.min(Math.abs(a - b), 360 - Math.abs(a - b));
  // SOLO verde/teal-WhatsApp quasi-esatto (tolleranza strettissima) → non tocca i verdi/blu di brand
  const WA = ["#25d366", "#128c7e", "#075e54"].map(hexToHsl);
  const isWhatsApp = hex => { const H = hexToHsl(hex); return H && WA.some(B => B && hueDist(H.h, B.h) < 8 && Math.abs(H.l - B.l) < 0.12); };
  const topN0 = Math.max.apply(null, Object.values(freq).concat([1]));
  let scored = Object.keys(freq).map(hex => ({ hex, n: freq[hex], hsl: hexToHsl(hex), v: varSet.has(hex) }))
    .filter(c => c.hsl && c.hsl.s >= 0.22 && c.hsl.l >= 0.13 && c.hsl.l <= 0.75)   // scarta bianco/nero/grigi
    .filter(c => c.v || !(isWhatsApp(c.hex) && c.n < topN0 * 0.6))                  // togli SOLO il verde-WhatsApp incidentale
    .sort((a, b) => (b.v - a.v) || (b.n - a.n));                                     // variabili brand prima, poi frequenza
  const palette = [];                                                               // candidati ampi (li conferma l'utente coi swatch)
  for (const c of scored) { if (!palette.some(p => closeHue(p, c.hex))) palette.push(c.hex); if (palette.length >= 6) break; }
  // accento = colore di brand DOMINANTE, scurito quanto basta per essere leggibile col testo bianco (resta on-brand)
  let accent = palette[0] || "";
  if (accent && whiteContrast(accent) < 3.2) accent = darkenToContrast(accent, 3.2);
  // tema DARK/LIGHT + COLORE DI SFONDO dominante (per far adottare alla chat il tema del sito)
  let bgDark = 0, bgLight = 0; const bgFreq = {};
  for (const m of css.matchAll(/background(?:-color)?\s*:\s*([^;}{]+)/gi)) {
    for (const cm of m[1].matchAll(/#(?:[0-9a-f]{3}|[0-9a-f]{6})\b|rgba?\([^)]+\)/gi)) {
      const hex = toHex(cm[0]); const H = hex ? hexToHsl(hex) : null; if (!H) continue;
      if (H.l <= 0.25) bgDark++; else if (H.l >= 0.8) bgLight++;
      // superfici: scure (anche navy/blu di brand, fino a s<0.7) oppure chiare (poco sature)
      if ((H.l <= 0.34 && H.s < 0.7) || (H.l >= 0.82 && H.s < 0.35)) bgFreq[hex] = (bgFreq[hex] || 0) + 1;
    }
  }
  let dark = bgDark > bgLight;
  if (/color-scheme\s*:\s*dark/i.test(css)) dark = true;
  const tc = (html.match(/<meta[^>]+name=["']theme-color["'][^>]+content=["']([^"']+)/i) || [])[1];
  if (tc) { const H = hexToHsl(toHex(tc)); if (H) dark = H.l <= 0.3; }
  // colore di sfondo: la superficie (scura per dark, chiara per light) più frequente, coerente col tema
  let bg = "", bestBg = 0;
  for (const k in bgFreq) { const H = hexToHsl(k); if (!H) continue; if ((dark ? H.l <= 0.34 : H.l >= 0.82) && bgFreq[k] > bestBg) { bestBg = bgFreq[k]; bg = k; } }
  return { accent, palette, dark, bg };
}
function hslToHex(h, s, l) {
  h = ((h % 360) + 360) % 360; const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c / 2;
  let r, g, b;
  if (h < 60) { r = c; g = x; b = 0; } else if (h < 120) { r = x; g = c; b = 0; } else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; } else if (h < 300) { r = x; g = 0; b = c; } else { r = c; g = 0; b = x; }
  const to = v => { v = Math.max(0, Math.min(255, Math.round((v + m) * 255))).toString(16); return v.length < 2 ? "0" + v : v; };
  return "#" + to(r) + to(g) + to(b);
}
function darkenToContrast(hex, target) {
  const H = hexToHsl(hex); if (!H) return hex;
  let l = H.l, s = Math.max(0.4, H.s);
  for (let i = 0; i < 45 && whiteContrast(hslToHex(H.h, s, l)) < target; i++) l = Math.max(0.1, l - 0.02);
  return hslToHex(H.h, s, l);
}
function relLum(hex) {
  const m = hex.match(/^#([0-9a-f]{6})$/i); if (!m) return 1;
  const f = i => { let c = parseInt(m[1].slice(i, i + 2), 16) / 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(0) + 0.7152 * f(2) + 0.0722 * f(4);
}
function whiteContrast(hex) { return 1.05 / (relLum(hex) + 0.05); }

async function siteInfo(base) {
  const out = { brand: host(base).split(".")[0], title: "", description: "", headings: [], themeColor: "", lang: "", whatsapp: "", phone: "", accent: "", palette: [], dark: false, bg: "" };
  try {
    const r = await fetch(base, { headers: { ...UA, accept: "text/html" } });
    const html = await r.text();
    const g = re => { const m = html.match(re); return m ? decode(m[1]) : ""; };
    out.title = g(/<title[^>]*>([^<]+)<\/title>/i);
    out.description = g(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)/i);
    out.themeColor = g(/<meta[^>]+name=["']theme-color["'][^>]+content=["']([^"']+)/i);
    out.lang = g(/<html[^>]+lang=["']([^"']+)/i).slice(0, 2);
    const site = g(/<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)/i);
    out.brand = (site || out.title.split(/[|\-–·]/)[0] || out.brand).trim().slice(0, 40);
    out.headings = [...html.matchAll(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi)].map(m => decode(m[1])).filter(t => t && t.length < 90).slice(0, 16);
    // contatto per la modalità Lead (prenotazione WhatsApp)
    const wa = html.match(/(?:wa\.me\/|api\.whatsapp\.com\/send\?phone=|whatsapp\.com\/send\?phone=)\+?(\d{8,15})/i);
    if (wa) out.whatsapp = wa[1];
    const tel = html.match(/tel:\s*\+?([0-9][0-9\s().-]{6,})/i);
    if (tel) out.phone = tel[1].replace(/[\s().-]/g, "");
    if (!out.whatsapp && out.phone && out.phone.length >= 10) out.whatsapp = out.phone.replace(/^\+/, "");
    // colori del brand dalla pagina (palette + accento), il theme-color ha priorità se presente
    try {
      const bc = await brandColors(base, html);
      out.palette = bc.palette;
      out.accent = out.themeColor || bc.accent || "";
      out.dark = bc.dark;
      out.bg = bc.bg;
    } catch { }
  } catch { }
  return out;
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=600");
  const raw = (req.query && req.query.url) || "";
  if (!raw) return res.status(400).json({ ok: false, error: "Manca ?url=" });
  const base = normUrl(raw);

  try {
    let products = [], platform = "unknown";
    // tenta in ordine: woo → shopify → jsonld
    try { products = await woo(base); if (products.length) platform = "woocommerce"; } catch { }
    if (!products.length) { try { products = await shopify(base); if (products.length) platform = "shopify"; } catch { } }
    if (!products.length) { try { products = await jsonld(base); if (products.length) platform = "schema.org"; } catch { } }

    // pulizia: scarta senza nome/prezzo, dedup, cap 80
    const seen = new Set();
    products = products.filter(p => p && p.name && p.price != null)
      .filter(p => { const k = p.name.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; })
      .slice(0, 80);

    const categories = [...new Set(products.map(p => p.category))].slice(0, 12);
    const info = await siteInfo(base);
    if (!products.length && !info.title) {
      return res.status(200).json({ ok: false, platform, host: host(base),
        error: "Non sono riuscito a leggere questa pagina (potrebbe bloccare i bot). Si potrà fare import manuale o CSV." });
    }
    // suggerimento modalità: con prodotti = shop, senza = lead (servizi)
    const mode = products.length ? "shop" : "lead";
    res.status(200).json({ ok: true, platform, host: host(base), mode,
      brand: info.brand, title: info.title, description: info.description, headings: info.headings,
      themeColor: info.themeColor, lang: info.lang, whatsapp: info.whatsapp, phone: info.phone,
      accent: info.accent, colors: info.palette, dark: info.dark, bg: info.bg,
      count: products.length, categories, products });
  } catch (e) {
    res.status(200).json({ ok: false, error: "Errore di analisi: " + (e.message || e), host: host(base) });
  }
}
