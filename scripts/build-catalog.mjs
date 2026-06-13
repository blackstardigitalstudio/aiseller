// AI Seller · genera data/catalog.json (statico) leggendo il catalogo LIVE da Supabase.
// Gira in GitHub Actions (chiave = secret ILRAVIOLO_SUPABASE_KEY) prima del deploy su
// Cloudflare Pages, così le pagine del pannello (hub/plan/reportes/creador/panel) hanno i
// dati sullo STESSO dominio, senza dipendere da Vercel. Stesso mapping di api/ilraviolo.js.
// Se Supabase non risponde, NON sovrascrive il file esistente (rete di sicurezza). Made in Italy.

import { writeFileSync, existsSync } from "node:fs";
import { mkdirSync } from "node:fs";

const SUPABASE = "https://rllxrcitzofompzuipxh.supabase.co/rest/v1/bottega_products";

const META = [
  { cat: "Pasta fresca",     emoji: "🥟", label: { es: "Pasta fresca",      it: "Pasta fresca",     en: "Fresh pasta" } },
  { cat: "Embutidos",        emoji: "🥓", label: { es: "Embutidos italianos", it: "Salumi italiani",  en: "Italian cured meats" } },
  { cat: "Quesos",           emoji: "🧀", label: { es: "Quesos",            it: "Formaggi",         en: "Cheeses" } },
  { cat: "Salsas",           emoji: "🍅", label: { es: "Salsas",            it: "Sughi & salse",    en: "Sauces" } },
  { cat: "Trufa",            emoji: "🍄", label: { es: "Trufa",             it: "Tartufo",          en: "Truffle" } },
  { cat: "Postres",          emoji: "🍰", label: { es: "Postres",           it: "Dolci",            en: "Desserts" } },
  { cat: "Focaccia y pizza", emoji: "🍕", label: { es: "Focaccia y pizza",  it: "Focaccia e pizza", en: "Focaccia & pizza" } },
  { cat: "Plato preparado",  emoji: "🍽️", label: { es: "Platos preparados", it: "Piatti pronti",    en: "Ready dishes" } },
  { cat: "Bebidas",          emoji: "🥤", label: { es: "Bebidas",           it: "Bevande",          en: "Drinks" } },
  { cat: "Vino biodinámico", emoji: "🍷", label: { es: "Vinos",             it: "Vini",             en: "Wines" } },
  { cat: "Licores",          emoji: "🥂", label: { es: "Licores",           it: "Liquori",          en: "Spirits" } },
  { cat: "Horno",            emoji: "🥖", label: { es: "Horno",             it: "Forno",            en: "Bakery" } },
  { cat: "Pane",             emoji: "🍞", label: { es: "Pan",               it: "Pane",             en: "Bread" } },
  { cat: "Harinas",          emoji: "🌾", label: { es: "Harinas",           it: "Farine",           en: "Flours" } },
  { cat: "Complementos",     emoji: "🧺", label: { es: "Complementos",      it: "Complementi",      en: "Extras" } }
];
const metaOf = (c) => META.find(m => m.cat === c) || { cat: c, emoji: "🍝", label: { es: c, it: c, en: c } };
const orderOf = (c) => { const i = META.findIndex(m => m.cat === c); return i < 0 ? 99 : i; };
const isTrue = (v) => v === true || v === "True" || v === "true" || v === "t" || v === 1;
const toNum = (v) => { const n = parseFloat(v); return isFinite(n) ? n : 0; };

const key = process.env.ILRAVIOLO_SUPABASE_KEY;
if (!key) { console.error("[build-catalog] manca ILRAVIOLO_SUPABASE_KEY — non genero nulla"); process.exit(0); }

const url = SUPABASE + "?select=id,categoria,nombre,descripcion,precio,imagen_url,destacado,visible,agotado,orden,promo_activa,promo_texto,promo_precio,unidad&visible=eq.true&order=categoria.asc,orden.asc";

try {
  const r = await fetch(url, { headers: { apikey: key, Authorization: "Bearer " + key } });
  if (!r.ok) throw new Error("supabase " + r.status);
  const rows = await r.json();
  const live = (Array.isArray(rows) ? rows : []).filter(p => isTrue(p.visible) && !isTrue(p.agotado) && p.nombre && p.categoria);
  if (!live.length) throw new Error("catalogo vuoto");

  const present = [...new Set(live.map(p => p.categoria))].sort((a, b) => orderOf(a) - orderOf(b) || a.localeCompare(b));
  const catLabels = {}, emoji = {};
  present.forEach(c => { const m = metaOf(c); catLabels[c] = m.label; emoji[c] = m.emoji; });

  const products = live.map((p, i) => {
    const promo = isTrue(p.promo_activa) && p.promo_texto;
    return {
      id: 8000 + i,
      name: p.nombre,
      category: p.categoria,
      price: toNum(p.promo_precio || p.precio),
      description: p.descripcion || "",
      imageUrl: p.imagen_url || "",
      unit: p.unidad || "",
      badge: promo ? ("🎉 " + p.promo_texto) : (isTrue(p.destacado) ? "⭐ Destacado" : ""),
      stock: 99
    };
  });

  const out = { brand: "Il Raviolo Bottega", catLabels, emoji, products, _source: "supabase-static", _count: products.length };
  if (!existsSync("data")) mkdirSync("data", { recursive: true });
  writeFileSync("data/catalog.json", JSON.stringify(out));
  const withUnit = products.filter(p => p.unit).length;
  console.log(`[build-catalog] OK: ${products.length} prodotti, ${present.length} categorie, ${withUnit} con unità → data/catalog.json`);
} catch (e) {
  console.error("[build-catalog] errore:", e.message, "— mantengo il file esistente se c'è");
  process.exit(0); // non blocca il deploy: le pagine useranno il ripiego clients/ilraviolo.json
}
