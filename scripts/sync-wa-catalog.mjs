// Sincronizza i prodotti da Supabase (bottega_products) al catalogo WhatsApp Business.
// Usa l'API Meta Graph v21 con l'endpoint items_batch per aggiornamenti efficienti.
// Variabili d'ambiente richieste:
//   ILRAVIOLO_SUPABASE_KEY  — chiave Supabase (già presente come GitHub Secret)
//   META_ACCESS_TOKEN       — token permanente (System User) con permesso catalog_management
//   WA_CATALOG_ID           — ID catalogo WhatsApp in Commerce Manager
//
// Made in Italy — Blackstar Digital Studio

const SUPABASE_URL = "https://rllxrcitzofompzuipxh.supabase.co/rest/v1/bottega_products";
const SUPABASE_KEY = process.env.ILRAVIOLO_SUPABASE_KEY;
const META_TOKEN    = process.env.META_ACCESS_TOKEN;
const CATALOG_ID    = process.env.WA_CATALOG_ID;
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
const isTrue = v => v === true || v === "True" || v === "true" || v === "t" || v === 1;
const toPrice = v => { const n = parseFloat(v); return isFinite(n) ? Math.round(n * 100).toString() : "0"; };

const requests = products
  .filter(p => p.nombre && p.id)
  .map(p => {
    const visible   = isTrue(p.visible);
    const agotado   = isTrue(p.agotado);
    const promoAct  = isTrue(p.promo_activa) && p.promo_precio;
    const price     = toPrice(promoAct ? p.promo_precio : p.precio);
    const availability = (visible && !agotado) ? "in stock" : "out of stock";

    return {
      method: visible ? "UPSERT" : "DELETE",
      retailer_id: `raviolo-${p.id}`,
      data: {
        name: (p.nombre || "").substring(0, 150),
        description: (p.descripcion || "Producto artesanal italiano").substring(0, 5000),
        price,
        currency: "EUR",
        url: PRODUCT_URL,
        image_url: p.imagen_url || "",
        availability,
        condition: "new",
        brand: BRAND,
        category: mapCategory(p.categoria || ""),
      }
    };
  });

console.log(`🔄 Operazioni da inviare: ${requests.length} (UPSERT + DELETE)`);

// --- 3. Invia a Meta in batch da 50 (limite API) ---
const BATCH_SIZE = 50;
let success = 0, errors = 0;

for (let i = 0; i < requests.length; i += BATCH_SIZE) {
  const batch = requests.slice(i, i + BATCH_SIZE);
  const payload = { allow_upsert: true, requests: batch };

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

  if (!metaResp.ok || metaBody.error) {
    console.error(`❌ Errore batch ${i}-${i + batch.length}:`, JSON.stringify(metaBody.error || metaBody));
    errors += batch.length;
  } else {
    // La risposta di items_batch include handles per tracciare lo stato asincrono
    console.log(`✅ Batch ${i}-${i + batch.length}: inviato (handle: ${metaBody.handles?.[0] || "n/a"})`);
    success += batch.length;
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
