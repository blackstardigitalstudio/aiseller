// Aggiorna clients/ilraviolo.json dal catalogo LIVE su Supabase (tabella bottega_products).
// Riusa la parte FISSA dello snapshot esistente (saluti, abbinamenti, istruzioni, personaggio…)
// e rinfresca SOLO il catalogo (reparti, prodotti, foto). Gira in GitHub Actions.
// Chiave Supabase = process.env.ILRAVIOLO_SUPABASE_KEY (Secret). Made in Italy.
import { readFileSync, writeFileSync } from "node:fs";

const KEY = process.env.ILRAVIOLO_SUPABASE_KEY;
if (!KEY) { console.error("manca ILRAVIOLO_SUPABASE_KEY"); process.exit(1); }
const SUPA = "https://rllxrcitzofompzuipxh.supabase.co/rest/v1/bottega_products" +
  "?select=id,categoria,nombre,descripcion,precio,imagen_url,destacado,visible,agotado,orden,promo_activa,promo_texto,promo_precio" +
  "&visible=eq.true&order=categoria.asc,orden.asc";

const META = [
  { cat: "Pasta fresca",      emoji: "🥟", label: { es: "Pasta fresca",        it: "Pasta fresca",      en: "Fresh pasta" } },
  { cat: "Embutidos",         emoji: "🥓", label: { es: "Embutidos italianos", it: "Salumi italiani",    en: "Italian cured meats" } },
  { cat: "Quesos",            emoji: "🧀", label: { es: "Quesos",              it: "Formaggi",          en: "Cheeses" } },
  { cat: "Salsas",            emoji: "🍅", label: { es: "Salsas",              it: "Sughi & salse",     en: "Sauces" } },
  { cat: "Trufa",             emoji: "🍄", label: { es: "Trufa",               it: "Tartufo",           en: "Truffle" } },
  { cat: "Postres",           emoji: "🍰", label: { es: "Postres",             it: "Dolci",             en: "Desserts" } },
  { cat: "Focaccia y pizza",  emoji: "🍕", label: { es: "Focaccia y pizza",    it: "Focaccia e pizza",  en: "Focaccia & pizza" } },
  { cat: "Plato preparado",   emoji: "🍽️", label: { es: "Platos preparados",   it: "Piatti pronti",     en: "Ready dishes" } },
  { cat: "Bebidas",           emoji: "🥤", label: { es: "Bebidas",             it: "Bevande",           en: "Drinks" } },
  { cat: "Vino biodinámico",  emoji: "🍷", label: { es: "Vinos",               it: "Vini",              en: "Wines" } },
  { cat: "Licores",           emoji: "🥂", label: { es: "Licores",             it: "Liquori",           en: "Spirits" } },
  { cat: "Horno",             emoji: "🥖", label: { es: "Horno",               it: "Forno",             en: "Bakery" } },
  { cat: "Pane",              emoji: "🍞", label: { es: "Pan",                 it: "Pane",              en: "Bread" } },
  { cat: "Harinas",           emoji: "🌾", label: { es: "Harinas",             it: "Farine",            en: "Flours" } },
  { cat: "Complementos",      emoji: "🧺", label: { es: "Complementos",        it: "Complementi",       en: "Extras" } }
];
const metaOf = (c) => META.find(m => m.cat === c) || { cat: c, emoji: "🍝", label: { es: c, it: c, en: c } };
const orderOf = (c) => { const i = META.findIndex(m => m.cat === c); return i < 0 ? 99 : i; };
const isTrue = (v) => v === true || v === "True" || v === "true" || v === "t" || v === 1;
const toNum = (v) => { const n = parseFloat(v); return isFinite(n) ? n : 0; };
const STOP = ["italiano", "italiana", "italianos", "fresco", "fresca", "della", "con", "sin", "para", "the", "and"];
function keysFrom(name, cat) {
  const set = new Set();
  String(cat || "").toLowerCase().split(/[^a-zàâäéèêëíìîïóòôöúùûüñç]+/i).forEach(w => { if (w.length >= 4) set.add(w); });
  String(name || "").toLowerCase().split(/[^a-zàâäéèêëíìîïóòôöúùûüñç]+/i).forEach(w => { if (w.length >= 4 && STOP.indexOf(w) < 0) set.add(w); });
  return [...set].slice(0, 12);
}

const cfg = JSON.parse(readFileSync("clients/ilraviolo.json", "utf8"));   // base fissa (saluti, crossSell, character…)
const r = await fetch(SUPA, { headers: { apikey: KEY, Authorization: "Bearer " + KEY } });
if (!r.ok) { console.error("Supabase HTTP " + r.status); process.exit(1); }
const rows = await r.json();
const live = (Array.isArray(rows) ? rows : []).filter(p => isTrue(p.visible) && !isTrue(p.agotado) && p.nombre && p.categoria);
if (!live.length) { console.error("catalogo vuoto → non sovrascrivo (tengo l'ultimo buono)"); process.exit(0); }

const present = [...new Set(live.map(p => p.categoria))].sort((a, b) => orderOf(a) - orderOf(b) || a.localeCompare(b));
const LANGS = ["es", "it", "en"];
cfg.profiling = [{
  intent: "category",
  q: { es: "¿Qué te apetece hoy? 👇", it: "Cosa ti va oggi? 👇", en: "What are you craving today? 👇" },
  options: present.map(c => { const m = metaOf(c), o = {}; LANGS.forEach(l => o[l] = m.label[l] + " " + m.emoji); o.val = c; return o; })
}];
cfg.catLabels = {};
cfg.emoji = cfg.emoji || {};
present.forEach(c => { const m = metaOf(c); cfg.catLabels[c] = m.label; cfg.emoji[c] = m.emoji; });
cfg.products = live.map((p, i) => {
  const promo = isTrue(p.promo_activa) && p.promo_texto;
  return {
    id: 8000 + i, name: p.nombre, category: p.categoria, price: toNum(p.promo_precio || p.precio),
    description: p.descripcion || "", imageUrl: p.imagen_url || "",
    badge: promo ? ("🎉 " + p.promo_texto) : (isTrue(p.destacado) ? "⭐ Destacado" : ""),
    keys: keysFrom(p.nombre, p.categoria), stock: 99
  };
});

writeFileSync("clients/ilraviolo.json", JSON.stringify(cfg));
console.log("Catalogo aggiornato:", live.length, "prodotti,", present.length, "reparti");
