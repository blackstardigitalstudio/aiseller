// Crea le "Collezioni" (product set) nel catalogo WhatsApp, una per categoria,
// nell'ordine del menu del sito. Cosi' i prodotti appaiono raggruppati per categoria
// invece che in un elenco unico disordinato.
// Idempotente: se una collezione con lo stesso nome esiste gia', la salta.
//
// Variabili d'ambiente (GitHub Secrets):
//   META_ACCESS_TOKEN — token System User (scope catalog_management)
//   WA_CATALOG_ID     — ID catalogo
//
// Made in Italy — Blackstar Digital Studio

const TOKEN   = (process.env.META_ACCESS_TOKEN || '').replace(/^﻿/, '').trim();
const CATALOG = (process.env.WA_CATALOG_ID     || '').replace(/^﻿/, '').trim();
if (!TOKEN)   { console.error('❌ META_ACCESS_TOKEN mancante'); process.exit(1); }
if (!CATALOG) { console.error('❌ WA_CATALOG_ID mancante'); process.exit(1); }

// Ordine del menu (come api/ilraviolo.js). name = etichetta mostrata, pt = categoria Supabase (product_type).
const CATS = [
  { name: '🥟 Pasta fresca',        pt: 'Pasta fresca' },
  { name: '🥓 Embutidos italianos', pt: 'Embutidos' },
  { name: '🧀 Quesos',              pt: 'Quesos' },
  { name: '🍅 Salsas',              pt: 'Salsas' },
  { name: '🍄 Trufa',               pt: 'Trufa' },
  { name: '🍰 Postres',             pt: 'Postres' },
  { name: '🍕 Focaccia y pizza',    pt: 'Focaccia y pizza' },
  { name: '🍽 Platos preparados',   pt: 'Plato preparado' },
  { name: '🥤 Bebidas',             pt: 'Bebidas' },
  { name: '🍷 Vinos',               pt: 'Vino biodinámico' },
  { name: '🥖 Horno',               pt: 'Horno' },
  { name: '🍞 Pan',                 pt: 'Pane' },
  { name: '🧺 Complementos',        pt: 'Complementos' },
];

const API = 'https://graph.facebook.com/v21.0';

// 1. Collezioni gia' esistenti (per idempotenza)
const existing = new Set();
let url = `${API}/${CATALOG}/product_sets?fields=name&limit=200&access_token=${TOKEN}`;
while (url) {
  const r = await fetch(url);
  const j = await r.json();
  if (j.error) { console.error('❌ Lettura product_sets:', JSON.stringify(j.error)); process.exit(1); }
  (j.data || []).forEach(s => existing.add(s.name));
  url = j.paging?.next || null;
}
console.log(`📋 Collezioni esistenti: ${existing.size}`);

// 2. Crea quelle mancanti, nell'ordine del menu
let created = 0, skipped = 0, errors = 0;
for (const c of CATS) {
  if (existing.has(c.name)) { console.log(`⏭️  Esiste gia': ${c.name}`); skipped++; continue; }
  const filter = JSON.stringify({ product_type: { i_contains: c.pt } });
  const body = new URLSearchParams({ name: c.name, filter, access_token: TOKEN });
  const r = await fetch(`${API}/${CATALOG}/product_sets`, { method: 'POST', body });
  const j = await r.json();
  if (!r.ok || j.error) { console.error(`❌ ${c.name}:`, JSON.stringify(j.error || j)); errors++; }
  else { console.log(`✅ Creata: ${c.name} (id ${j.id})`); created++; }
}

console.log(`\n🏁 Collezioni: ${created} create, ${skipped} gia' presenti, ${errors} errori`);
if (errors > 0) process.exit(1);
