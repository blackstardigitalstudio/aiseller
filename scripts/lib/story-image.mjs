// Genera l'immagine del prodotto del giorno in 2 formati e 2 temi:
//   formati: 'story' 1080x1920 (9:16) · 'feed' 1080x1350 (4:5)
//   temi:    'blue' (sfondo azzurro, testo bianco/oro) · 'gold' (sfondo oro, testo blu navy)
// Output: Buffer JPEG. Font Poppins inclusi (nessuna dipendenza dai font di sistema).
//
// Made in Italy — Blackstar Digital Studio

import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const FONTS = [
  join(ROOT, 'assets/fonts/Poppins-Bold.ttf'),
  join(ROOT, 'assets/fonts/Poppins-SemiBold.ttf'),
  join(ROOT, 'assets/fonts/Poppins-Regular.ttf'),
];

const DEFAULT_BRAND = { primary: '#0c2440', primary2: '#06182c', accent: '#e8b84f', accent2: '#cf9d35' };
// temi derivati dai colori del brand → riutilizzabile per ogni cliente (config-driven)
function buildThemes(b) { return {
  blue: { bg1: b.primary, bg2: b.primary2, text: '#ffffff', cat: b.accent, price: b.accent,
    badgeBg: b.accent, badgeText: b.primary, stroke: b.accent, foot: '#ffffff', pat: 0.13, fallback: b.accent },
  gold: { bg1: b.accent, bg2: b.accent2, text: b.primary, cat: b.primary, price: b.primary,
    badgeBg: b.primary, badgeText: b.accent, stroke: b.primary, foot: b.primary, pat: 0.16, fallback: b.primary },
}; }

// preset per formato
const LAYOUTS = {
  story: { W: 1080, H: 1920, M: 110, photo: 820, photoY: 506, logo: 196, logoY: 122,
    brandY: 392, brandSize: 44, badgeW: 570, badgeY: 420, badgeH: 76, badgeSize: 38,
    catSize: 40, gap: 96, name1: 86, name2: 72, priceSize: 116, priceGap: 156,
    footY: 1858, footSize: 36, markY: 1320, markSize: 760 },
  feed: { W: 1080, H: 1350, M: 90, photo: 604, photoY: 388, logo: 150, logoY: 56,
    brandY: 262, brandSize: 38, badgeW: 470, badgeY: 286, badgeH: 64, badgeSize: 31,
    catSize: 34, gap: 56, name1: 74, name2: 56, priceSize: 80, priceGap: 104,
    footY: 1308, footSize: 30, markY: 770, markSize: 560 },
};

const esc = s => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function wrapLines(text, fontSize, maxW, em = 0.60) {
  const words = String(text || '').trim().split(/\s+/).filter(Boolean);
  const lines = []; let cur = '';
  const width = s => s.length * fontSize * em;
  for (const w of words) {
    const t = cur ? cur + ' ' + w : w;
    if (width(t) > maxW && cur) { lines.push(cur); cur = w; } else cur = t;
  }
  if (cur) lines.push(cur);
  return lines;
}
function fmtPrice(v) {
  const n = parseFloat(String(v).replace(',', '.'));
  return (isFinite(n) ? n : 0).toFixed(2).replace('.', ',') + ' €';
}
async function fetchBuf(url) {
  if (!url) return null;
  try { const r = await fetch(url); if (!r.ok) return null; return Buffer.from(await r.arrayBuffer()); }
  catch { return null; }
}
async function uriCover(buf, w, h) {
  const out = await sharp(buf).resize(w, h, { fit: 'cover', position: 'centre' }).png().toBuffer();
  return 'data:image/png;base64,' + out.toString('base64');
}
async function uriContain(buf, size) {
  const out = await sharp(buf).resize(size, size, { fit: 'inside' }).png().toBuffer();
  return 'data:image/png;base64,' + out.toString('base64');
}

export async function generateStory({ name, price, imageUrl, category, badgeText = 'PRODUCTO DEL DÍA', logoUrl, whatsapp = '671 085 862', format = 'story', theme = 'blue', brand = {}, unit = '' }) {
  const L = LAYOUTS[format] || LAYOUTS.story;
  const b = { ...DEFAULT_BRAND, ...(brand.colors || brand) };
  logoUrl = logoUrl || brand.logo;
  const THEMES = buildThemes(b);
  const T = THEMES[theme] || THEMES.blue;
  const { W, H } = L;
  const M = Math.round(W * 0.085);
  const bname = (brand.name || 'Il Raviolo Bottega').toUpperCase();
  const bweb = brand.web || 'ilraviolo.es';
  const hexA = (h, a) => { const c = h.replace('#', ''); return `rgba(${parseInt(c.slice(0,2),16)},${parseInt(c.slice(2,4),16)},${parseInt(c.slice(4,6),16)},${a})`; };

  const photoBuf = await fetchBuf(imageUrl);
  const logoBuf = await fetchBuf(logoUrl);
  const logoSize = Math.round(W * 0.14);
  const photoUri = photoBuf ? await uriCover(photoBuf, W, H) : null;     // foto a tutto schermo
  const logoUri = logoBuf ? await uriContain(logoBuf, logoSize) : null;

  // titolo: bold, max 3 righe, riduce se lungo
  const titleMax = W - 2 * M;
  let titleFs = Math.round(W * 0.094);
  let lines = wrapLines(name, titleFs, titleMax, 0.6);
  if (lines.length > 2) { titleFs = Math.round(W * 0.075); lines = wrapLines(name, titleFs, titleMax, 0.6); }
  if (lines.length > 3) lines = lines.slice(0, 3);
  const lineH = Math.round(titleFs * 1.05);
  const catFs = Math.round(W * 0.04), priceFs = Math.round(W * 0.125), footFs = Math.round(W * 0.032), brandFs = Math.round(W * 0.042);

  // blocco testo ancorato in basso (sopra il velo)
  const footY = H - Math.round(M * 0.7);
  const priceY = footY - footFs - Math.round(W * 0.05);
  const titleLastY = priceY - Math.round(priceFs * 0.72) - Math.round(W * 0.03);
  const titleY0 = titleLastY - (lines.length - 1) * lineH;
  const catY = titleY0 - Math.round(titleFs * 0.78) - Math.round(W * 0.018);

  // header
  const logoY = Math.round(M * 0.55);
  const brandY = logoY + logoSize + Math.round(W * 0.05);
  const badgeH = Math.round(W * 0.07), badgeW = Math.round(W * 0.58), badgeY = brandY + Math.round(W * 0.028);

  const nameSvg = lines.map((l, i) =>
    `<text x="${W/2}" y="${titleY0 + i*lineH}" font-family="Poppins" font-weight="800" font-size="${titleFs}" fill="#ffffff" text-anchor="middle">${esc(l)}</text>`).join('\n  ');

  const bgBlock = photoUri
    ? `<image href="${photoUri}" x="0" y="0" width="${W}" height="${H}" preserveAspectRatio="xMidYMid slice"/>`
    : `<rect width="${W}" height="${H}" fill="url(#bg)"/>`;

  const svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${b.primary}"/><stop offset="1" stop-color="${b.primary2}"/></linearGradient>
    <linearGradient id="scrim" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0.26" stop-color="${hexA(b.primary2,0)}"/>
      <stop offset="0.60" stop-color="${hexA(b.primary2,0.72)}"/>
      <stop offset="1" stop-color="${hexA(b.primary2,0.98)}"/>
    </linearGradient>
    <linearGradient id="top" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${hexA(b.primary2,0.82)}"/><stop offset="1" stop-color="${hexA(b.primary2,0)}"/>
    </linearGradient>
  </defs>
  ${bgBlock}
  <rect x="0" y="${Math.round(H*0.28)}" width="${W}" height="${Math.round(H*0.72)+2}" fill="url(#scrim)"/>
  <rect x="0" y="0" width="${W}" height="${Math.round(H*0.24)}" fill="url(#top)"/>

  ${logoUri ? `<image href="${logoUri}" x="${(W-logoSize)/2}" y="${logoY}" width="${logoSize}" height="${logoSize}"/>` : ''}
  <text x="${W/2}" y="${brandY}" font-family="Poppins" font-weight="700" font-size="${brandFs}" fill="#ffffff" text-anchor="middle" letter-spacing="6">${esc(bname)}</text>
  <rect x="${(W-badgeW)/2}" y="${badgeY}" width="${badgeW}" height="${badgeH}" rx="${badgeH/2}" fill="${b.accent}"/>
  <text x="${W/2}" y="${badgeY + badgeH/2 + Math.round(badgeH*0.34)}" font-family="Poppins" font-weight="700" font-size="${Math.round(W*0.036)}" fill="${b.primary}" text-anchor="middle" letter-spacing="3">${esc(badgeText)}</text>

  ${category ? `<text x="${W/2}" y="${catY}" font-family="Poppins" font-weight="700" font-size="${catFs}" fill="${b.accent}" text-anchor="middle" letter-spacing="5">${esc(String(category).toUpperCase())}</text>` : ''}
  ${nameSvg}
  <text x="${W/2}" y="${priceY}" font-family="Poppins" font-weight="800" font-size="${priceFs}" fill="${b.accent}" text-anchor="middle">${esc(fmtPrice(price))}${unit ? `<tspan font-size="${Math.round(priceFs*0.44)}" font-weight="700"> /${esc(unit)}</tspan>` : ''}</text>
  <text x="${W/2}" y="${footY}" font-family="Poppins" font-weight="600" font-size="${footFs}" fill="#ffffff" text-anchor="middle" opacity="0.92">WhatsApp ${esc(whatsapp)}  ·  ${esc(bweb)}</text>
</svg>`;

  const png = new Resvg(svg, {
    fitTo: { mode: 'width', value: W },
    font: { fontFiles: FONTS, loadSystemFonts: false, defaultFontFamily: 'Poppins' },
  }).render().asPng();

  return sharp(png).jpeg({ quality: 88, mozjpeg: true }).toBuffer();
}
