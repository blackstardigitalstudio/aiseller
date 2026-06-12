// "Prodotto del giorno" — gira ogni mattina (GitHub Actions).
// 1. Sceglie il prodotto del giorno (rotazione automatica, uno diverso ogni giorno).
// 2. Genera l'immagine-storia (1080x1920 JPEG).
// 3. La carica su Vercel Blob → link pubblico stabile (per WhatsApp Stato: aprilo sul telefono e condividi).
// 4. La pubblica in automatico su Instagram Stories e Facebook Stories.
// 5. Mette il prodotto in evidenza nel catalogo (collezione "⭐ Producto del día").
//
// Variabili d'ambiente (GitHub Secrets):
//   ILRAVIOLO_SUPABASE_KEY  — lettura prodotti
//   META_ACCESS_TOKEN       — token System User con scope: catalog_management, business_management,
//                             instagram_basic, instagram_content_publish, pages_show_list,
//                             pages_manage_posts, pages_read_engagement
//   WA_CATALOG_ID           — catalogo
//   BLOB_READ_WRITE_TOKEN   — Vercel Blob (hosting immagine pubblica)
//   IG_USER_ID              — id Instagram business (per le Stories)
//   FB_PAGE_ID              — id Pagina Facebook (per le Stories)
//
// Made in Italy — Blackstar Digital Studio

import { generateStory } from './lib/story-image.mjs';
import { put } from '@vercel/blob';

const SUPA  = 'https://rllxrcitzofompzuipxh.supabase.co/rest/v1/bottega_products';
const KEY   = (process.env.ILRAVIOLO_SUPABASE_KEY || '').replace(/^﻿/, '').trim();
const TOKEN = (process.env.META_ACCESS_TOKEN || '').replace(/^﻿/, '').trim();
const CATALOG = (process.env.WA_CATALOG_ID || '').replace(/^﻿/, '').trim();
const BLOB  = (process.env.BLOB_READ_WRITE_TOKEN || '').replace(/^﻿/, '').trim();
const IG    = (process.env.IG_USER_ID || '').replace(/^﻿/, '').trim();
const PAGE  = (process.env.FB_PAGE_ID || '').replace(/^﻿/, '').trim();
const LOGO  = 'https://ilraviolo.es/assets/logo.webp';
const G     = 'https://graph.facebook.com/v21.0';

if (!KEY)   { console.error('❌ ILRAVIOLO_SUPABASE_KEY mancante'); process.exit(1); }
if (!BLOB)  { console.error('❌ BLOB_READ_WRITE_TOKEN mancante'); process.exit(1); }

const isTrue = v => v === true || v === 'True' || v === 'true' || v === 't' || v === 1;

// ordine categorie come il menu del sito
const CAT_ORDER = ['Pasta fresca','Embutidos','Quesos','Salsas','Trufa','Postres','Focaccia y pizza',
  'Plato preparado','Bebidas','Vino biodinámico','Licores','Horno','Pane','Harinas','Complementos'];
const catIdx = c => { const i = CAT_ORDER.indexOf(c); return i < 0 ? 99 : i; };

// --- 1. Prodotti visibili e disponibili, in ordine stabile ---
const url = SUPA + '?select=id,categoria,nombre,precio,imagen_url,visible,agotado,promo_activa,promo_precio,orden';
const rows = await fetch(url, { headers: { apikey: KEY, Authorization: 'Bearer ' + KEY } }).then(r => r.json());
const items = (Array.isArray(rows) ? rows : [])
  .filter(p => p.nombre && p.id && isTrue(p.visible) && !isTrue(p.agotado) && p.imagen_url && String(p.imagen_url).trim())
  .sort((a, b) => catIdx(a.categoria) - catIdx(b.categoria) || (a.orden || 0) - (b.orden || 0) || String(a.id).localeCompare(String(b.id)));

if (!items.length) { console.error('❌ Nessun prodotto disponibile'); process.exit(1); }

// --- Rotazione: un prodotto diverso ogni giorno (deterministico per data) ---
const dayNumber = Math.floor(Date.now() / 86400000);
const p = items[dayNumber % items.length];
const promoAct = isTrue(p.promo_activa) && p.promo_precio;
const price = promoAct ? p.promo_precio : p.precio;
console.log(`⭐ Prodotto del giorno (${dayNumber % items.length + 1}/${items.length}): ${p.nombre} — ${p.categoria} — ${price}€`);

// --- 2. Genera immagine ---
const jpg = await generateStory({ name: p.nombre, price, imageUrl: p.imagen_url, category: p.categoria, logoUrl: LOGO });
console.log(`🖼️  Immagine generata (${(jpg.length / 1024).toFixed(0)} KB)`);

// --- 3. Carica su Vercel Blob (link stabile + archivio per data) ---
const ymd = new Date(dayNumber * 86400000).toISOString().slice(0, 10);
const hoy = await put('historias/historia-hoy.jpg', jpg, { access: 'public', token: BLOB, addRandomSuffix: false, allowOverwrite: true, contentType: 'image/jpeg', cacheControlMaxAge: 3600 });
await put(`historias/${ymd}.jpg`, jpg, { access: 'public', token: BLOB, addRandomSuffix: false, allowOverwrite: true, contentType: 'image/jpeg' }).catch(() => {});
const imageUrl = hoy.url;
console.log(`🔗 Link pubblico (WhatsApp Stato → aprilo sul telefono e condividi):\n   ${imageUrl}`);

// helper Graph API
async function fb(method, path, params) {
  const u = new URL(`${G}/${path}`);
  if (method === 'GET') Object.entries(params || {}).forEach(([k, v]) => u.searchParams.set(k, v));
  const opt = { method };
  if (method === 'POST') { opt.body = new URLSearchParams(params || {}); }
  const r = await fetch(u, opt);
  return r.json();
}

// --- 4a. Instagram Stories ---
if (IG && TOKEN) {
  try {
    const c = await fb('POST', `${IG}/media`, { media_type: 'STORIES', image_url: imageUrl, access_token: TOKEN });
    if (c.error) throw new Error(JSON.stringify(c.error));
    const pub = await fb('POST', `${IG}/media_publish`, { creation_id: c.id, access_token: TOKEN });
    if (pub.error) throw new Error(JSON.stringify(pub.error));
    console.log(`✅ Instagram Stories pubblicata (id ${pub.id})`);
  } catch (e) { console.error('⚠️  Instagram Stories non pubblicata:', e.message); }
} else { console.log('⏭️  Instagram saltato (IG_USER_ID o token mancante)'); }

// --- 4b. Facebook Page Stories ---
if (PAGE && TOKEN) {
  try {
    // serve il Page access token
    const tok = await fb('GET', PAGE, { fields: 'access_token', access_token: TOKEN });
    const pageTok = tok.access_token || TOKEN;
    // carica la foto come non pubblicata, poi la promuovi a storia
    const photo = await fb('POST', `${PAGE}/photos`, { url: imageUrl, published: 'false', access_token: pageTok });
    if (photo.error) throw new Error(JSON.stringify(photo.error));
    const story = await fb('POST', `${PAGE}/photo_stories`, { photo_id: photo.id, access_token: pageTok });
    if (story.error) throw new Error(JSON.stringify(story.error));
    console.log(`✅ Facebook Stories pubblicata (${JSON.stringify(story.post_id || story.success || story.id || story)})`);
  } catch (e) { console.error('⚠️  Facebook Stories non pubblicata:', e.message); }
} else { console.log('⏭️  Facebook saltato (FB_PAGE_ID o token mancante)'); }

// --- 5. Evidenza nel catalogo: collezione "⭐ Producto del día" = prodotto di oggi ---
if (CATALOG && TOKEN) {
  try {
    const SET_NAME = '⭐ Producto del día';
    const retailer = `raviolo-${p.id}`;
    const filter = JSON.stringify({ retailer_id: { eq: retailer } });
    const list = await fb('GET', `${CATALOG}/product_sets`, { fields: 'name', limit: '200', access_token: TOKEN });
    const found = (list.data || []).find(s => s.name === SET_NAME);
    if (found) {
      const u = await fb('POST', found.id, { filter, access_token: TOKEN });
      if (u.error) throw new Error(JSON.stringify(u.error));
      console.log('✅ Catalogo: collezione "Producto del día" aggiornata');
    } else {
      const c = await fb('POST', `${CATALOG}/product_sets`, { name: SET_NAME, filter, access_token: TOKEN });
      if (c.error) throw new Error(JSON.stringify(c.error));
      console.log(`✅ Catalogo: collezione "Producto del día" creata (id ${c.id})`);
    }
  } catch (e) { console.error('⚠️  Catalogo evidenza non aggiornata:', e.message); }
}

console.log('\n🏁 Prodotto del giorno: fatto.');
