// "Prodotto del giorno" — gira ogni mattina (GitHub Actions).
// 1. Sceglie il prodotto del giorno (rotazione, uno diverso ogni giorno, SOLO con foto).
// 2. Genera 2 immagini: storia 9:16 e post 4:5.
// 3. Le carica su Vercel Blob → link pubblici (per WhatsApp Stato: apri sul telefono e condividi).
// 4. Pubblica in automatico: Instagram Stories + post, Facebook Stories + post.
// 5. Mette il prodotto in evidenza nel catalogo (collezione "⭐ Producto del día").
//
// Variabili d'ambiente (GitHub Secrets):
//   ILRAVIOLO_SUPABASE_KEY, META_ACCESS_TOKEN, WA_CATALOG_ID,
//   BLOB_READ_WRITE_TOKEN, IG_USER_ID, FB_PAGE_ID
//   (opz.) POST_FEED=0 per pubblicare solo le storie, niente post in bacheca.
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
const DO_FEED = process.env.POST_FEED !== '0';
// Ponte social con app Meta già approvata (Make/Zapier/n8n). Se impostato, pubblica IG/FB via webhook
// invece che con la nostra app (che ha i permessi bloccati). Bypassa App Review e config Meta.
const WEBHOOK = (process.env.SOCIAL_WEBHOOK_URL || '').replace(/^﻿/, '').trim();
const WA = '34 671 085 862';
const LOGO = 'https://ilraviolo.es/assets/logo.webp';
const G = 'https://graph.facebook.com/v21.0';

if (!KEY)  { console.error('❌ ILRAVIOLO_SUPABASE_KEY mancante'); process.exit(1); }
if (!BLOB) { console.error('❌ BLOB_READ_WRITE_TOKEN mancante'); process.exit(1); }

const isTrue = v => v === true || v === 'True' || v === 'true' || v === 't' || v === 1;
const fmtPrice = v => { const n = parseFloat(String(v).replace(',', '.')); return (isFinite(n) ? n : 0).toFixed(2).replace('.', ',') + ' €'; };

const CAT_ORDER = ['Pasta fresca','Embutidos','Quesos','Salsas','Trufa','Postres','Focaccia y pizza',
  'Plato preparado','Bebidas','Vino biodinámico','Licores','Horno','Pane','Harinas','Complementos'];
const catIdx = c => { const i = CAT_ORDER.indexOf(c); return i < 0 ? 99 : i; };

// --- 1. Prodotti visibili, disponibili e CON foto, in ordine stabile ---
const url = SUPA + '?select=id,categoria,nombre,precio,imagen_url,visible,agotado,promo_activa,promo_precio,orden';
const rows = await fetch(url, { headers: { apikey: KEY, Authorization: 'Bearer ' + KEY } }).then(r => r.json());
const items = (Array.isArray(rows) ? rows : [])
  .filter(p => p.nombre && p.id && isTrue(p.visible) && !isTrue(p.agotado) && p.imagen_url && String(p.imagen_url).trim())
  .sort((a, b) => catIdx(a.categoria) - catIdx(b.categoria) || (a.orden || 0) - (b.orden || 0) || String(a.id).localeCompare(String(b.id)));
if (!items.length) { console.error('❌ Nessun prodotto con foto disponibile'); process.exit(1); }

// rotazione deterministica per data
const dayNumber = Math.floor(Date.now() / 86400000);
const p = items[dayNumber % items.length];
const price = (isTrue(p.promo_activa) && p.promo_precio) ? p.promo_precio : p.precio;
console.log(`⭐ Prodotto del giorno (${dayNumber % items.length + 1}/${items.length}): ${p.nombre} — ${p.categoria} — ${fmtPrice(price)}`);

// --- 2. Genera storia (9:16) e post (4:5) ---
// Sfondo in rotazione: 3 giorni azzurro, 3 giorni oro (il colore del logo).
const theme = (dayNumber % 6) < 3 ? 'blue' : 'gold';
const common = { name: p.nombre, price, imageUrl: p.imagen_url, category: p.categoria, logoUrl: LOGO, theme };
const storyJpg = await generateStory({ ...common, format: 'story' });
const feedJpg  = await generateStory({ ...common, format: 'feed' });
console.log(`🖼️  Immagini generate (tema ${theme}): storia ${(storyJpg.length/1024).toFixed(0)}KB, post ${(feedJpg.length/1024).toFixed(0)}KB`);

// --- 3. Carica su Vercel Blob ---
const ymd = new Date(dayNumber * 86400000).toISOString().slice(0, 10);
async function upload(path, buf) {
  const r = await put(path, buf, { access: 'public', token: BLOB, addRandomSuffix: false, allowOverwrite: true, contentType: 'image/jpeg' });
  return r.url;
}
const storyUrl = await upload('historias/historia-hoy.jpg', storyJpg);
const feedUrl  = await upload('historias/post-hoy.jpg', feedJpg);
await upload(`historias/${ymd}-historia.jpg`, storyJpg).catch(() => {});
await upload(`historias/${ymd}-post.jpg`, feedJpg).catch(() => {});
console.log(`🔗 Storia WhatsApp (apri sul telefono → condividi su Stato):\n   ${storyUrl}`);

// --- didascalia + hashtag brandizzati (ruotano ogni giorno: IG penalizza i blocchi identici) ---
const HASHTAGS = {
  brand: ['#IlRavioloBottega', '#RavioloBottega', '#ProductoDelDíaRaviolo', '#LaBottegaItaliana'],
  local: ['#LasPalmas', '#LasPalmasDeGranCanaria', '#GranCanaria', '#Canarias', '#LPGC', '#ComerEnLasPalmas', '#GranCanariaFoodie', '#CanariasGastronomía'],
  general: ['#ComidaItaliana', '#CocinaItaliana', '#HechoEnItalia', '#ProductoItaliano', '#DelicatessenItaliana', '#SaboresDeItalia', '#ComerEnBarcelona'],
  cat: {
    'Pasta fresca': ['#PastaFresca', '#PastaArtesanal', '#PastaItaliana'],
    'Embutidos': ['#Embutidos', '#SalumiItaliani', '#Charcutería'],
    'Quesos': ['#Quesos', '#FormaggiItaliani', '#QuesoArtesano'],
    'Salsas': ['#SalsaItaliana', '#SugoFattoInCasa', '#Pesto'],
    'Trufa': ['#Trufa', '#Tartufo', '#Trufado'],
    'Postres': ['#PostresItalianos', '#Dolci', '#Tiramisú'],
    'Focaccia y pizza': ['#Focaccia', '#PizzaArtesanal', '#PizzaAlTaglio'],
    'Plato preparado': ['#ComidaCasera', '#PlatosItalianos', '#ComidaPreparada'],
    'Bebidas': ['#VinoItaliano', '#Bebidas', '#Maridaje'],
    'Vino biodinámico': ['#VinoNatural', '#VinoItaliano', '#VinoBiodinámico'],
    'Licores': ['#LicorItaliano', '#Amaro', '#Digestivo'],
    'Horno': ['#PanArtesano', '#PaneItaliano', '#Panadería'],
    'Pane': ['#PanArtesano', '#PaneItaliano', '#Panadería'],
    'Complementos': ['#GourmetItaliano', '#DespensaItaliana', '#Delicatessen'],
  },
};
const rot = (arr, n, k) => Array.from({ length: Math.min(k, arr.length) }, (_, i) => arr[(n + i) % arr.length]);
const cats = HASHTAGS.cat[p.categoria] || ['#GourmetItaliano', '#ProductoItaliano'];
const tags = [...HASHTAGS.brand, ...cats, ...rot(HASHTAGS.local, dayNumber, 4), ...rot(HASHTAGS.general, dayNumber, 3)];
const caption = `🍝 Producto del día en Il Raviolo Bottega\n\n${p.nombre} — ${fmtPrice(price)}\n${p.categoria} · recién hecho\n\n¿Te lo guardo? Pídelo por WhatsApp 📲 ${WA}\n📍 Las Palmas de Gran Canaria · ilraviolo.es\n\n${tags.join(' ')}`;

// helper Graph API (POST form-encoded / GET con query)
async function fb(method, path, params) {
  const u = new URL(`${G}/${path}`);
  const opt = { method };
  if (method === 'GET') Object.entries(params || {}).forEach(([k, v]) => u.searchParams.set(k, v));
  else opt.body = new URLSearchParams(params || {});
  const j = await (await fetch(u, opt)).json();
  if (j.error) throw new Error(JSON.stringify(j.error));
  return j;
}
async function igPublish(params, label) {
  try {
    const c = await fb('POST', `${IG}/media`, { ...params, access_token: TOKEN });
    const pub = await fb('POST', `${IG}/media_publish`, { creation_id: c.id, access_token: TOKEN });
    console.log(`✅ Instagram ${label} pubblicato (id ${pub.id})`);
  } catch (e) { console.error(`⚠️  Instagram ${label} NON pubblicato:`, e.message); }
}

// --- 4. Pubblicazione social via webhook (ponte con app Meta approvata: Make/Zapier/n8n) ---
if (WEBHOOK) {
  try {
    const r = await fetch(WEBHOOK, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productName: p.nombre, price: fmtPrice(price), category: p.categoria, theme,
        caption, storyUrl, feedUrl,           // storyUrl = 9:16 (storie) · feedUrl = 4:5 (post)
        date: ymd,
      }),
    });
    console.log(`✅ Inviato al ponte social via webhook (HTTP ${r.status}) — IG/FB pubblicati da lì`);
  } catch (e) { console.error('⚠️  Webhook social fallito:', e.message); }
}

// --- 4b. Instagram diretto (solo se NON si usa il webhook) ---
if (!WEBHOOK && IG && TOKEN) {
  await igPublish({ media_type: 'STORIES', image_url: storyUrl }, 'Stories');
  if (DO_FEED) await igPublish({ image_url: feedUrl, caption }, 'post');
} else console.log('⏭️  Instagram saltato (IG_USER_ID o token mancante)');

// --- 5. Facebook diretto (solo se NON si usa il webhook) ---
if (!WEBHOOK && PAGE && TOKEN) {
  try {
    const pageTok = (await fb('GET', PAGE, { fields: 'access_token', access_token: TOKEN })).access_token || TOKEN;
    // storia FB
    try {
      const ph = await fb('POST', `${PAGE}/photos`, { url: storyUrl, published: 'false', access_token: pageTok });
      await fb('POST', `${PAGE}/photo_stories`, { photo_id: ph.id, access_token: pageTok });
      console.log('✅ Facebook Stories pubblicata');
    } catch (e) { console.error('⚠️  Facebook Stories NON pubblicata:', e.message); }
    // post FB in bacheca
    if (DO_FEED) {
      try {
        const post = await fb('POST', `${PAGE}/photos`, { url: feedUrl, message: caption, published: 'true', access_token: pageTok });
        console.log(`✅ Facebook post pubblicato (id ${post.post_id || post.id})`);
      } catch (e) { console.error('⚠️  Facebook post NON pubblicato:', e.message); }
    }
  } catch (e) { console.error('⚠️  Facebook saltato (page token):', e.message); }
} else console.log('⏭️  Facebook saltato (FB_PAGE_ID o token mancante)');

// --- 6. Evidenza nel catalogo: collezione "⭐ Producto del día" ---
if (CATALOG && TOKEN) {
  try {
    const SET_NAME = '⭐ Producto del día';
    const filter = JSON.stringify({ retailer_id: { eq: `raviolo-${p.id}` } });
    const list = await fb('GET', `${CATALOG}/product_sets`, { fields: 'name', limit: '200', access_token: TOKEN });
    const found = (list.data || []).find(s => s.name === SET_NAME);
    if (found) { await fb('POST', found.id, { filter, access_token: TOKEN }); console.log('✅ Catalogo: "Producto del día" aggiornato'); }
    else { const c = await fb('POST', `${CATALOG}/product_sets`, { name: SET_NAME, filter, access_token: TOKEN }); console.log(`✅ Catalogo: "Producto del día" creato (id ${c.id})`); }
  } catch (e) { console.error('⚠️  Catalogo evidenza non aggiornata:', e.message); }
}

console.log('\n🏁 Prodotto del giorno: fatto.');
