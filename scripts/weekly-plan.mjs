// Motore settimanale (GRATIS, a regole). Gira ogni domenica (GitHub Actions).
// Genera il piano dei prossimi 7 giorni seguendo la "guida" del cliente (pilastri editoriali,
// rotazione prodotti/temi, hashtag, template didascalia) e lo salva come JSON su Vercel Blob.
// Niente AI a pagamento: tutta logica deterministica letta dalla config.
//
// Env (secrets): ILRAVIOLO_SUPABASE_KEY (o SUPABASE_KEY), BLOB_READ_WRITE_TOKEN
// Config: clients/<CLIENT>.config.json
// Made in Italy — Blackstar Digital Studio

import { put } from '@vercel/blob';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const CLIENT = (process.env.CLIENT || 'raviolo').trim();
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const cfg = JSON.parse(readFileSync(join(ROOT, 'clients', `${CLIENT}.config.json`), 'utf8'));
const B = cfg.brand, F = cfg.catalog.fields, P = cfg.pillars || {};
const KEY = (process.env.ILRAVIOLO_SUPABASE_KEY || process.env.SUPABASE_KEY || '').replace(/^﻿/, '').trim();
const BLOB = (process.env.BLOB_READ_WRITE_TOKEN || '').replace(/^﻿/, '').trim();
if (!KEY) { console.error('❌ Supabase key mancante'); process.exit(1); }
if (!BLOB) { console.error('❌ BLOB_READ_WRITE_TOKEN mancante'); process.exit(1); }

const isTrue = v => v === true || v === 'True' || v === 'true' || v === 't' || v === 1;
const fmtPrice = v => { const n = parseFloat(String(v).replace(',', '.')); return (isFinite(n) ? n : 0).toFixed(2).replace('.', ',') + ' €'; };
const CAT_ORDER = cfg.categoryOrder || [];
const catIdx = c => { const i = CAT_ORDER.indexOf(c); return i < 0 ? 99 : i; };
const rot = (a, n, k) => Array.from({ length: Math.min(k, (a || []).length) }, (_, i) => a[(n + i) % a.length]);
const themeRot = cfg.themeRotation || ['blue', 'blue', 'blue', 'gold', 'gold', 'gold'];

// --- catalogo: prodotti visibili con foto, ordinati ---
const url = cfg.catalog.rest + '?select=' + encodeURIComponent(cfg.catalog.select);
const rows = await fetch(url, { headers: { apikey: KEY, Authorization: 'Bearer ' + KEY } }).then(r => r.json());
const items = (Array.isArray(rows) ? rows : [])
  .filter(p => p[F.name] && p[F.id] && isTrue(p[F.visible]) && !isTrue(p[F.soldout]) && p[F.image] && String(p[F.image]).trim())
  .sort((a, b) => catIdx(a[F.category]) - catIdx(b[F.category]) || ((a[F.order] || 0) - (b[F.order] || 0)) || String(a[F.id]).localeCompare(String(b[F.id])));
if (!items.length) { console.error('❌ Nessun prodotto con foto'); process.exit(1); }
const byCat = {}; items.forEach(p => { (byCat[p[F.category]] = byCat[p[F.category]] || []).push(p); });

const H = cfg.hashtags || { brand: [], local: [], general: [], cat: {} };
function tagsFor(cat, dn) {
  const c = (H.cat && H.cat[cat]) || ['#GourmetItaliano', '#ProductoItaliano'];
  return [...(H.brand || []), ...c, ...rot(H.local, dn, 4), ...rot(H.general, dn, 2)];
}
function captionFor(pillar, prod, priceStr) {
  const tplBts = cfg.captionTemplateBts || '{intro}\n📲 {whatsapp} · {web}';
  const tpl = cfg.captionTemplate || '🍝 {intro}: {name} — {price}\n{category}\n📲 {whatsapp} · {web}';
  const base = (pillar.bts ? tplBts : tpl)
    .replaceAll('{intro}', pillar.intro || 'Producto del día')
    .replaceAll('{name}', prod ? prod[F.name] : '')
    .replaceAll('{price}', priceStr)
    .replaceAll('{category}', prod ? prod[F.category] : '')
    .replaceAll('{whatsapp}', B.whatsapp).replaceAll('{city}', B.city).replaceAll('{web}', B.web);
  return base;
}

// --- costruisci i prossimi 7 giorni ---
const today = Math.floor(Date.now() / 86400000);
const week = [];
for (let i = 0; i < 7; i++) {
  const dn = today + i;
  const date = new Date(dn * 86400000);
  const wd = date.getUTCDay();
  const pillar = P[wd] || { label: 'Producto del día', category: null, intro: 'Producto del día' };
  const theme = themeRot[dn % themeRot.length];
  let prod = null;
  if (pillar.category && byCat[pillar.category] && byCat[pillar.category].length) {
    prod = byCat[pillar.category][dn % byCat[pillar.category].length];
  }
  if (!prod && !pillar.bts) prod = items[dn % items.length];
  const unit = prod && F.unit && prod[F.unit] ? String(prod[F.unit]).trim() : (cfg.priceUnitDefault || '');
  const price = prod ? ((isTrue(prod[F.promoActive]) && prod[F.promoPrice]) ? prod[F.promoPrice] : prod[F.price]) : null;
  const priceStr = prod ? fmtPrice(price) + (unit ? ` /${unit}` : '') : '';
  const tags = tagsFor(prod ? prod[F.category] : '', dn);
  week.push({
    date: date.toISOString().slice(0, 10),
    weekday: wd, pillar: pillar.label, theme,
    productId: prod ? prod[F.id] : null,
    name: prod ? prod[F.name] : '',
    category: prod ? prod[F.category] : '',
    price: priceStr, image: prod ? prod[F.image] : '',
    caption: captionFor(pillar, prod, priceStr),
    hashtags: tags.join(' '),
  });
}

const planObj = { client: CLIENT, generatedDay: today, from: week[0].date, to: week[6].date, days: week };
const r = await put('plan/semana-actual.json', JSON.stringify(planObj, null, 2),
  { access: 'public', token: BLOB, addRandomSuffix: false, allowOverwrite: true, contentType: 'application/json' });
console.log(`🗓️  Piano settimana ${week[0].date} → ${week[6].date} generato (${week.length} giorni).`);
week.forEach(d => console.log(`   ${d.date} [${d.theme}] ${d.pillar}: ${d.name || '(detrás de la bottega)'} ${d.price}`));
console.log(`🔗 Piano pubblicato: ${r.url}`);
