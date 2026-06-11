// Sincronizza i prodotti da Supabase (bottega_products) al catalogo WhatsApp Business.
// Usa l'API Meta Graph v21 con l'endpoint items_batch per aggiornamenti efficienti.
// Variabili d'ambiente richieste:
//   ILRAVIOLO_SUPABASE_KEY  — chiave Supabase (già presente come GitHub Secret)
//   META_ACCESS_TOKEN       — token permanente (System User) con permesso catalog_management
//   WA_CATALOG_ID           — ID catalogo WhatsApp in Commerce Manager
//
// Made in Italy — Blackstar Digital Studio

const SUPABASE_URL = "https://rllxrcitzofompzuipxh.supabase.co/rest/v1/bottega_products";
const SUPABASE_KEY = (process.env.ILRAVIOLO_SUPABASE_KEY || '').replace(/^﻿/, '').trim();
const META_TOKEN    = (process.env.META_ACCESS_TOKEN    || '').replace(/^﻿/, '').trim();
const CATALOG_ID    = (process.env.WA_CATALOG_ID        || '').replace(/^﻿/, '').trim();
const PRODUCT_URL   = "https://ilraviolo.es/bottega/";
const BRAND         = "Il Raviolo Bottega";

if (!SUPABASE_KEY) { console.error("❌ ILRAVIOLO_SUPABASE_KEY mancante"); process.exit(1); }
if (!META_TOKEN)   { console.error("❌ META_ACCESS_TOKEN mancante"); process.exit(1); }
if (!CATALOG_ID)   { console.error("❌ WA_CATALOG_ID mancante"); process.exit(1); }

// --- 1. Leggi tutti i prodotti da Supabase ---
const supaQuery = SUPABASE_URL
  + "?select=id,categoria,nombre,descripcion,precio,imagen_url,visible,agotado,promo_activa,promo_precio"
  + "&order=categoria.asc,orden.asc";

const resp = await fetch(supaQuery, {
  headers: { apikey: SUPABASE_KEY, Authorization: "Bearer " + SUPABASE_KEY }
});
if (!resp.ok) {
  console.error("❌ Supabase error:", resp.status, await resp.text());
  process.exit(1);
}
const rows = await resp.json();
const products = Array.isArray(rows) ? rows : [];
console.log(`📦 Letti ${products.length} prodotti da Supabase`);

// --- 2. Costruisci le richieste items_batch ---
// Formato API items_batch (PRODUCT_ITEM):
//   - method UPDATE/DELETE (con allow_upsert:true, UPDATE crea se non esiste)
//   - identificatore = data.id (il retailer id)
//   - campi: title / link / image_link (NON name / url / image_url)
//   - price = stringa "12.50 EUR" (importo + valuta ISO)
const isTrue = v => v === true || v === "True" || v === "true" || v === "t" || v === 1;
const toPrice = v => { const n = parseFloat(v); return (isFinite(n) ? n : 0).toFixed(2) + " EUR"; };

const requests = products
  .filter(p => p.nombre && p.id)
  .map(p => {
    const visible   = isTrue(p.visible);
    const agotado   = isTrue(p.agotado);
    const promoAct  = isTrue(p.promo_activa) && p.promo_precio;
    const price     = toPrice(promoAct ? p.promo_precio : p.precio);
    const availability = (visible && !agotado) ? "in stock" : "out of stock";
    const retailerId = `raviolo-${p.id}`;

    // Prodotti nascosti → DELETE (basta l'id); visibili → UPDATE (upsert) con tutti i campi.
    if (!visible) {
      return { method: "DELETE", data: { id: retailerId } };
    }

    return {
      method: "UPDATE",
      data: {
        id: retailerId,
        title: (p.nombre || "").substring(0, 150),
        description: (p.descripcion || "Producto artesanal italiano").substring(0, 5000),
        price,
        link: PRODUCT_URL,
        image_link: p.imagen_url || "",
        availability,
        condition: "new",
        brand: BRAND,
        product_type: (p.categoria || "").substring(0, 750), // categoria Supabase → filtro per le Collezioni WhatsApp
        google_product_category: mapCategory(p.categoria || ""),
      }
    };
  });

console.log(`🔄 Operazioni da inviare: ${requests.length} (UPDATE + DELETE)`);

// --- 3. Invia a Meta in batch da 50 (limite API) ---
const BATCH_SIZE = 50;
let success = 0, errors = 0;

for (let i = 0; i < requests.length; i += BATCH_SIZE) {
  const batch = requests.slice(i, i + BATCH_SIZE);
  const payload = { allow_upsert: true, item_type: "PRODUCT_ITEM", requests: batch };

  const metaResp = await fetch(
    `https://graph.facebook.com/v21.0/${CATALOG_ID}/items_batch`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${META_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    }
  );

  const metaBody = await metaResp.json();

  // Raccogli eventuali errori di validazione per-item (items_batch li restituisce
  // in validation_status[].errors anche con HTTP 200: NON sono in metaBody.error).
  const validationErrors = (metaBody.validation_status || [])
    .filter(v => v.errors && v.errors.length)
    .map(v => `${v.retailer_id || "?"}: ${v.errors.map(e => e.message).join("; ")}`);

  if (!metaResp.ok || metaBody.error) {
    console.error(`❌ Errore batch ${i}-${i + batch.length}:`, JSON.stringify(metaBody.error || metaBody));
    errors += batch.length;
  } else if (!metaBody.handles || !metaBody.handles.length) {
    // Nessun handle = batch NON accettato (di solito tutti gli item invalidi).
    console.error(`❌ Batch ${i}-${i + batch.length} rifiutato (nessun handle).`,
      validationErrors.length ? validationErrors.join(" | ") : JSON.stringify(metaBody));
    errors += batch.length;
  } else {
    // Handle presente = batch accettato per l'elaborazione asincrona.
    const okCount = batch.length - validationErrors.length;
    success += okCount;
    errors += validationErrors.length;
    console.log(`✅ Batch ${i}-${i + batch.length}: accettato (handle: ${metaBody.handles[0]})`
      + (validationErrors.length ? ` — ${validationErrors.length} item con avvisi: ${validationErrors.slice(0, 5).join(" | ")}` : ""));
  }
}

console.log(`\n🏁 Sincronizzazione completata: ${success} OK, ${errors} errori`);
if (errors > 0) process.exit(1);

// --- Mappatura categorie Supabase → Google Product Category (Meta richiede formato standard) ---
function mapCategory(cat) {
  const map = {
    "Pasta fresca":      "Food, Beverages & Tobacco > Food Items > Pasta",
    "Embutidos":         "Food, Beverages & Tobacco > Food Items > Meat & Seafood",
    "Quesos":            "Food, Beverages & Tobacco > Food Items > Dairy Products",
    "Salsas":            "Food, Beverages & Tobacco > Food Items > Condiments & Sauces",
    "Trufa":             "Food, Beverages & Tobacco > Food Items",
    "Postres":           "Food, Beverages & Tobacco > Food Items > Candy & Chocolate",
    "Focaccia y pizza":  "Food, Beverages & Tobacco > Food Items > Breads & Bakery Products",
    "Plato preparado":   "Food, Beverages & Tobacco > Food Items > Prepared Foods",
    "Bebidas":           "Food, Beverages & Tobacco > Beverages",
    "Vino biodinámico":  "Food, Beverages & Tobacco > Beverages > Wine",
    "Licores":           "Food, Beverages & Tobacco > Beverages > Spirits",
    "Horno":             "Food, Beverages & Tobacco > Food Items > Breads & Bakery Products",
    "Pane":              "Food, Beverages & Tobacco > Food Items > Breads & Bakery Products",
    "Harinas":           "Food, Beverages & Tobacco > Food Items > Grains, Rice & Cereal",
    "Complementos":      "Food, Beverages & Tobacco > Food Items",
  };
  return map[cat] || "Food, Beverages & Tobacco > Food Items";
}
