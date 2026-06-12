// Genera l'immagine "storia" verticale (1080x1920) del prodotto del giorno.
// Output: Buffer JPEG, pronto per WhatsApp Stato / Instagram Stories / Facebook Stories.
// Font Poppins inclusi in assets/fonts (nessuna dipendenza dai font di sistema).
//
// Layout a ritmo verticale costante: header → foto → categoria → nome → prezzo → footer.
// Sfondo con filigrana del logo bottega.
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

const W = 1080, H = 1920, M = 110;
const ACCENT = '#e8b84f', BG1 = '#0c2440', BG2 = '#06182c';
const PHOTO = { size: 820, y: 486, r: 46 };
PHOTO.x = (W - PHOTO.size) / 2;
PHOTO.bottom = PHOTO.y + PHOTO.size;

const esc = s => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// stima larghezza testo Poppins Bold (~0.56 em) per il word-wrap
function wrapLines(text, fontSize, maxW, em = 0.56) {
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
async function dataUriCover(buf, w, h) {
  const out = await sharp(buf).resize(w, h, { fit: 'cover', position: 'centre' }).png().toBuffer();
  return 'data:image/png;base64,' + out.toString('base64');
}
async function dataUriContain(buf, size) {
  const out = await sharp(buf).resize(size, size, { fit: 'inside' }).png().toBuffer();
  return 'data:image/png;base64,' + out.toString('base64');
}

export async function generateStory({ name, price, imageUrl, category, badgeText = 'PRODUCTO DEL DÍA', logoUrl, whatsapp = '34 671 085 862' }) {
  const photoBuf = await fetchBuf(imageUrl);
  const logoBuf = await fetchBuf(logoUrl);
  const photoUri = photoBuf ? await dataUriCover(photoBuf, PHOTO.size, PHOTO.size) : null;
  const logoUri = logoBuf ? await dataUriContain(logoBuf, 140) : null;
  const markUri = logoBuf ? await dataUriContain(logoBuf, 900) : null;

  // --- ritmo verticale costante sotto la foto ---
  const GAP = 96;
  const catY = PHOTO.bottom + GAP;                 // baseline categoria
  let nameSize = 86;
  let lines = wrapLines(name, nameSize, W - 2 * M);
  if (lines.length > 1) { nameSize = 72; lines = wrapLines(name, nameSize, W - 2 * M); }
  if (lines.length > 2) lines = lines.slice(0, 2);
  const lineH = Math.round(nameSize * 1.12);
  const nameY = catY + GAP;                         // baseline prima riga nome
  const nameLastY = nameY + (lines.length - 1) * lineH;
  const priceY = nameLastY + 156;                   // stacco ampio nome → prezzo

  const photoBlock = photoUri
    ? `<image href="${photoUri}" x="${PHOTO.x}" y="${PHOTO.y}" width="${PHOTO.size}" height="${PHOTO.size}" clip-path="url(#round)"/>
       <rect x="${PHOTO.x}" y="${PHOTO.y}" width="${PHOTO.size}" height="${PHOTO.size}" rx="${PHOTO.r}" fill="none" stroke="${ACCENT}" stroke-width="4" opacity="0.6"/>`
    : `<rect x="${PHOTO.x}" y="${PHOTO.y}" width="${PHOTO.size}" height="${PHOTO.size}" rx="${PHOTO.r}" fill="#0a1f38" stroke="${ACCENT}" stroke-width="4" opacity="0.9"/>
       <text x="${W / 2}" y="${PHOTO.y + PHOTO.size / 2 + 14}" font-family="Poppins" font-weight="700" font-size="84" fill="${ACCENT}" text-anchor="middle" opacity="0.9" letter-spacing="4">BOTTEGA</text>`;

  const nameSvg = lines.map((l, i) =>
    `<text x="${W / 2}" y="${nameY + i * lineH}" font-family="Poppins" font-weight="700" font-size="${nameSize}" fill="#ffffff" text-anchor="middle">${esc(l)}</text>`
  ).join('\n  ');

  const svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${BG1}"/><stop offset="1" stop-color="${BG2}"/></linearGradient>
    <clipPath id="round"><rect x="${PHOTO.x}" y="${PHOTO.y}" width="${PHOTO.size}" height="${PHOTO.size}" rx="${PHOTO.r}"/></clipPath>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>

  <!-- filigrana logo (sfondo bottega) -->
  ${markUri ? `<image href="${markUri}" x="${(W - 760) / 2}" y="1300" width="760" height="760" opacity="0.08"/>` : ''}

  <!-- header -->
  ${logoUri ? `<image href="${logoUri}" x="${W / 2 - 70}" y="150" width="140" height="140"/>` : ''}
  <text x="${W / 2}" y="358" font-family="Poppins" font-weight="700" font-size="44" fill="#ffffff" text-anchor="middle" letter-spacing="6">IL RAVIOLO BOTTEGA</text>
  <rect x="${W / 2 - 285}" y="392" width="570" height="76" rx="38" fill="${ACCENT}"/>
  <text x="${W / 2}" y="442" font-family="Poppins" font-weight="700" font-size="38" fill="#0c2440" text-anchor="middle" letter-spacing="3">${esc(badgeText)}</text>

  ${photoBlock}

  <!-- categoria -->
  ${category ? `<text x="${W / 2}" y="${catY}" font-family="Poppins" font-weight="600" font-size="40" fill="${ACCENT}" text-anchor="middle" letter-spacing="5">${esc(String(category).toUpperCase())}</text>` : ''}
  <!-- nome -->
  ${nameSvg}
  <!-- prezzo -->
  <text x="${W / 2}" y="${priceY}" font-family="Poppins" font-weight="700" font-size="116" fill="${ACCENT}" text-anchor="middle">${esc(fmtPrice(price))}</text>

  <!-- footer -->
  <text x="${W / 2}" y="1858" font-family="Poppins" font-weight="600" font-size="36" fill="#ffffff" text-anchor="middle" opacity="0.9">WhatsApp ${esc(whatsapp)}  ·  ilraviolo.es</text>
</svg>`;

  const png = new Resvg(svg, {
    fitTo: { mode: 'width', value: W },
    font: { fontFiles: FONTS, loadSystemFonts: false, defaultFontFamily: 'Poppins' },
  }).render().asPng();

  return sharp(png).jpeg({ quality: 88, mozjpeg: true }).toBuffer();
}
