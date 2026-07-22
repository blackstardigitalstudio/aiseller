// Sync catalogo Kayaman's Farm da WooCommerce Store API (pubblica) → clients/kayaman.json
// Pesca TUTTI i prodotti (paginando), li mappa allo schema del bot, deriva le categorie.
// I campi statici (brand, character, knowledge, safetyNote, accent...) restano invariati.
// Node 18+ (fetch nativo). Eseguito dalla GitHub Action (che ha rete). Made in Italy.
import fs from "fs";

const API = "https://kayamansfarm.com/wp-json/wc/store/v1/products";
const OUT = "clients/kayaman.json";

const stripHtml = (s) => String(s || "").replace(/<[^>]*>/g, " ").replace(/&[a-z]+;/gi, " ").replace(/\s+/g, " ").trim();
const emojiFor = (cat) => {
  const c = String(cat || "").toLowerCase();
  if (/cbd|flor|hash|resina|extracto|aromá|aroma|weed|hierba/.test(c)) return "🌿";
  if (/cartina|papel|paper|smoking|raw|blunt/.test(c)) return "📄";
  if (/grinder|moli/.test(c)) return "⚙️";
  if (/accend|lighter|clipper|mecher|fuego/.test(c)) return "🔥";
  if (/vapo|vape|cig/.test(c)) return "💨";
  if (/edible|comestible|gomit|dulce|chupa|lolli|té|te\b/.test(c)) return "🍬";
  if (/cosmet|crema|bálsamo|balsamo|aceite|roll|piel|beauty/.test(c)) return "🧴";
  if (/accesor|bandeja|cenicer|caja|kit|bong|pipa/.test(c)) return "🧰";
  return "🛍️";
};
const keysFrom = (name, cats) => {
  const words = String(name || "").toLowerCase().split(/[^a-z0-9àáèéìíòóùúñç%]+/i).filter(w => w.length >= 3);
  const cat = cats.map(c => String(c).toLowerCase());
  return [...new Set([...cat, ...words])].slice(0, 14);
};

const HDRS = {
  "Accept": "application/json, text/plain, */*",
  "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Referer": "https://kayamansfarm.com/",
  "Sec-Fetch-Mode": "cors", "Sec-Fetch-Site": "same-origin"
};
async function fetchAll() {
  const all = [];
  for (let page = 1; page <= 60; page++) {
    const url = `${API}?per_page=100&page=${page}&catalog_visibility=any`;
    const r = await fetch(url, { headers: HDRS });
    const text = await r.text();
    if (/sgcaptcha|<html/i.test(text.slice(0, 200))) {
      throw new Error("Bloccato dal captcha anti-bot di SiteGround (l'IP del runner è sfidato). Serve un'altra via (proxy/UA residenziale o endpoint diverso).");
    }
    let batch;
    try { batch = JSON.parse(text); } catch (e) { if (page === 1) throw new Error("Risposta non-JSON: " + text.slice(0, 120)); break; }
    if (!Array.isArray(batch) || !batch.length) break;
    all.push(...batch);
    if (batch.length < 100) break;
  }
  return all;
}

function mapProduct(p) {
  const cats = (p.categories || []).map(c => c.name).filter(Boolean);
  const primary = cats[0] || "Otros";
  const minor = (p.prices && p.prices.currency_minor_unit != null) ? p.prices.currency_minor_unit : 2;
  const raw = p.prices && (p.prices.price != null ? p.prices.price : p.prices.regular_price);
  const price = raw != null ? Number(raw) / Math.pow(10, minor) : 0;
  const img = (p.images && p.images[0] && p.images[0].src) || "";
  let desc = stripHtml(p.short_description) || stripHtml(p.description);
  if (desc.length > 320) desc = desc.slice(0, 317) + "…";
  const badge = p.on_sale ? "Oferta" : "";
  return {
    id: p.id, name: stripHtml(p.name), category: primary,
    price: Math.round(price * 100) / 100, currency: (p.prices && p.prices.currency_code) || "EUR",
    description: desc, imageUrl: img, badge,
    keys: keysFrom(p.name, cats), stock: p.is_in_stock ? 99 : 0
  };
}

const raw = await fetchAll();
console.log("Prodotti letti dall'API:", raw.length);
const products = raw.map(mapProduct).filter(p => p.name);

// categorie reali → catLabels, categoryOptions, emoji (ordinate per n. prodotti)
const counts = {};
products.forEach(p => { counts[p.category] = (counts[p.category] || 0) + 1; });
const cats = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
// catLabels + emoji per TUTTE le categorie reali (servono a mostrare l'etichetta giusta sui prodotti)
const catLabels = {}, emoji = {};
cats.forEach(c => { catLabels[c] = { es: c, it: c, en: c }; emoji[c] = emojiFor(c); });
// MENU: massimo ~10 categorie, con quelle "identitarie" in testa (CBD prima di tutto); il resto si trova a testo
const PRIMARY = ["CBD", "Flores", "Comestibles", "Papel de liar", "Grinders", "Bandejas de liar", "Filtros / Tips", "Pipas para fumar", "Bong", "Vaporizadores", "Clipper", "Mecheros", "Encendedores Zippo"];
const ordered = [...cats].sort((a, b) => {
  const pa = PRIMARY.indexOf(a), pb = PRIMARY.indexOf(b);
  if (pa >= 0 && pb >= 0) return pa - pb;
  if (pa >= 0) return -1;
  if (pb >= 0) return 1;
  return counts[b] - counts[a];
});
const menuCats = ordered.slice(0, 10);
const categoryOptions = menuCats.map(c => ({ es: `${c} ${emojiFor(c)}`, it: `${c} ${emojiFor(c)}`, en: `${c} ${emojiFor(c)}`, val: c }));

// preserva i campi statici già presenti nella config (mascotte, sapere del capo, nota sicurezza, brand...)
let base = {};
try { base = JSON.parse(fs.readFileSync(OUT, "utf8")); } catch (e) {}
const out = Object.assign({}, base, { products, catLabels, categoryOptions, emoji });

fs.writeFileSync(OUT, JSON.stringify(out, null, 2));
console.log(`Catalogo aggiornato: ${products.length} prodotti, ${cats.length} categorie.`);
console.log("Categorie:", cats.map(c => `${c}(${counts[c]})`).join(", "));
