// Genera l'immagine "storia" verticale (1080x1920) del prodotto del giorno.
// Output: Buffer JPEG, pronto per WhatsApp Stato / Instagram Stories / Facebook Stories.
// Niente dipendenze da font di sistema: i font Poppins sono inclusi in assets/fonts.
//
// Made in Italy — Blackstar Digital Studio

import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const FONTS = [
  join(ROOT, 'assets/fonts/Poppins-Bold.ttf'),
  join(ROOT, 'assets/fonts/Poppins-SemiBold.ttf'),
  join(ROOT, 'assets/fonts/Poppins-Regular.ttf'),
];

const W = 1080, H = 1920;
const ACCENT = '#e8b84f';     // oro bottega
const BG1 = '#0c2440', BG2 = '#06182c';
const PHOTO = { x: 90, y: 470, w: 900, h: 900, r: 48 };

const esc = s => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// stima larghezza testo Poppins (em ~ 0.52 per SemiBold/Bold) per il word-wrap
function wrap(text, fontSize, maxW, max = 0.54) {
  const words = String(text || '').split(/\s+/).filter(Boolean);
  const lines = []; let cur = '';
  const width = s => s.length * fontSize * max;
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

async function toDataUri(buf, w, h) {
  const out = await sharp(buf).resize(w, h, { fit: 'cover', position: 'centre' }).png().toBuffer();
  return 'data:image/png;base64,' + out.toString('base64');
}

// Scarica un'immagine remota; null se manca o errore.
async function fetchImg(url) {
  if (!url) return null;
  try {
    const r = await fetch(url);
    if (!r.ok) return null;
    return Buffer.from(await r.arrayBuffer());
  } catch { return null; }
}

export async function generateStory({ name, price, imageUrl, category, badgeText = 'PRODUCTO DEL DÍA', logoUrl, whatsapp = '34 671 085 862' }) {
  const photoBuf = await fetchImg(imageUrl);
  const logoBuf = await fetchImg(logoUrl);
  const photoUri = photoBuf ? await toDataUri(photoBuf, PHOTO.w, PHOTO.h) : null;
  const logoUri = logoBuf ? await toDataUri(logoBuf, 120, 120) : null;

  // nome: wrap su max 2 righe, riduci font se troppo lungo
  let nameSize = 88;
  let nameLines = wrap(name, nameSize, W - 180, 0.55);
  if (nameLines.length > 2) { nameSize = 70; nameLines = wrap(name, nameSize, W - 180, 0.55); }
  if (nameLines.length > 2) nameLines = nameLines.slice(0, 2);
  const nameStartY = 1490;

  const photoBlock = photoUri
    ? `<image href="${photoUri}" x="${PHOTO.x}" y="${PHOTO.y}" width="${PHOTO.w}" height="${PHOTO.h}" clip-path="url(#round)"/>
       <rect x="${PHOTO.x}" y="${PHOTO.y}" width="${PHOTO.w}" height="${PHOTO.h}" rx="${PHOTO.r}" fill="none" stroke="${ACCENT}" stroke-width="4" opacity="0.65"/>`
    : `<rect x="${PHOTO.x}" y="${PHOTO.y}" width="${PHOTO.w}" height="${PHOTO.h}" rx="${PHOTO.r}" fill="#0a1f38" stroke="${ACCENT}" stroke-width="4" opacity="0.9"/>
       <text x="${W/2}" y="${PHOTO.y + PHOTO.h/2 + 16}" font-family="Poppins" font-weight="700" font-size="90" fill="${ACCENT}" text-anchor="middle" opacity="0.9" letter-spacing="4">BOTTEGA</text>`;

  const logoBlock = logoUri
    ? `<image href="${logoUri}" x="${W/2 - 60}" y="150" width="120" height="120"/>`
    : '';

  const nameSvg = nameLines.map((l, i) =>
    `<text x="${W/2}" y="${nameStartY + i * (nameSize + 12)}" font-family="Poppins" font-weight="700" font-size="${nameSize}" fill="#ffffff" text-anchor="middle">${esc(l)}</text>`
  ).join('');

  const svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${BG1}"/><stop offset="1" stop-color="${BG2}"/>
    </linearGradient>
    <clipPath id="round"><rect x="${PHOTO.x}" y="${PHOTO.y}" width="${PHOTO.w}" height="${PHOTO.h}" rx="${PHOTO.r}"/></clipPath>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>

  ${logoBlock}
  <text x="${W/2}" y="${logoUri ? 340 : 250}" font-family="Poppins" font-weight="700" font-size="46" fill="#ffffff" text-anchor="middle" letter-spacing="6">IL RAVIOLO BOTTEGA</text>

  <!-- badge -->
  <rect x="${W/2 - 290}" y="${logoUri ? 380 : 300}" width="580" height="78" rx="39" fill="${ACCENT}"/>
  <text x="${W/2}" y="${(logoUri ? 380 : 300) + 52}" font-family="Poppins" font-weight="700" font-size="40" fill="#0c2440" text-anchor="middle" letter-spacing="3">${esc(badgeText)}</text>

  ${photoBlock}

  ${category ? `<text x="${W/2}" y="1420" font-family="Poppins" font-weight="600" font-size="40" fill="${ACCENT}" text-anchor="middle" letter-spacing="2">${esc(String(category).toUpperCase())}</text>` : ''}
  ${nameSvg}

  <!-- prezzo -->
  <text x="${W/2}" y="${nameStartY + nameLines.length * (nameSize + 12) + 70}" font-family="Poppins" font-weight="700" font-size="120" fill="${ACCENT}" text-anchor="middle">${esc(fmtPrice(price))}</text>

  <!-- footer -->
  <text x="${W/2}" y="1810" font-family="Poppins" font-weight="600" font-size="38" fill="#ffffff" text-anchor="middle" opacity="0.92">WhatsApp ${esc(whatsapp)}  ·  ilraviolo.es</text>
</svg>`;

  const png = new Resvg(svg, {
    fitTo: { mode: 'width', value: W },
    font: { fontFiles: FONTS, loadSystemFonts: false, defaultFontFamily: 'Poppins' },
  }).render().asPng();

  return sharp(png).jpeg({ quality: 88, mozjpeg: true }).toBuffer();
}
