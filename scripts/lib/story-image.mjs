// Genera l'immagine del prodotto del giorno in 2 formati:
//   - 'story' 1080x1920 (9:16) → WhatsApp Stato / IG Stories / FB Stories
//   - 'feed'  1080x1350 (4:5)  → post IG / post FB
// Output: Buffer JPEG. Font Poppins inclusi (nessuna dipendenza dai font di sistema).
// Layout a ritmo verticale costante: header → foto → categoria → nome → prezzo → footer.
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

const ACCENT = '#e8b84f', BG1 = '#0c2440', BG2 = '#06182c';

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

export async function generateStory({ name, price, imageUrl, category, badgeText = 'PRODUCTO DEL DÍA', logoUrl, whatsapp = '34 671 085 862', format = 'story' }) {
  const L = LAYOUTS[format] || LAYOUTS.story;
  const { W, H, M } = L;
  const photoX = (W - L.photo) / 2;
  const photoBottom = L.photoY + L.photo;

  const photoBuf = await fetchBuf(imageUrl);
  const logoBuf = await fetchBuf(logoUrl);
  const photoUri = photoBuf ? await uriCover(photoBuf, L.photo, L.photo) : null;
  const logoUri = logoBuf ? await uriContain(logoBuf, L.logo) : null;
  const markUri = logoBuf ? await uriContain(logoBuf, L.markSize) : null;

  const catY = photoBottom + L.gap;
  let nameSize = L.name1;
  let lines = wrapLines(name, nameSize, W - 2 * M);
  if (lines.length > 1) { nameSize = L.name2; lines = wrapLines(name, nameSize, W - 2 * M); }
  if (lines.length > 2) lines = lines.slice(0, 2);
  const lineH = Math.round(nameSize * 1.12);
  const nameY = catY + L.gap;
  const nameLastY = nameY + (lines.length - 1) * lineH;
  // il prezzo non deve mai toccare il footer
  const priceY = Math.min(nameLastY + L.priceGap, L.footY - 74);

  const photoBlock = photoUri
    ? `<image href="${photoUri}" x="${photoX}" y="${L.photoY}" width="${L.photo}" height="${L.photo}" clip-path="url(#round)"/>
       <rect x="${photoX}" y="${L.photoY}" width="${L.photo}" height="${L.photo}" rx="46" fill="none" stroke="${ACCENT}" stroke-width="4" opacity="0.6"/>`
    : `<rect x="${photoX}" y="${L.photoY}" width="${L.photo}" height="${L.photo}" rx="46" fill="#0a1f38" stroke="${ACCENT}" stroke-width="4" opacity="0.9"/>
       <text x="${W / 2}" y="${L.photoY + L.photo / 2 + 14}" font-family="Poppins" font-weight="700" font-size="84" fill="${ACCENT}" text-anchor="middle" opacity="0.9" letter-spacing="4">BOTTEGA</text>`;

  const nameSvg = lines.map((l, i) =>
    `<text x="${W / 2}" y="${nameY + i * lineH}" font-family="Poppins" font-weight="700" font-size="${nameSize}" fill="#ffffff" text-anchor="middle">${esc(l)}</text>`
  ).join('\n  ');

  const svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${BG1}"/><stop offset="1" stop-color="${BG2}"/></linearGradient>
    <clipPath id="round"><rect x="${photoX}" y="${L.photoY}" width="${L.photo}" height="${L.photo}" rx="46"/></clipPath>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  ${markUri ? `<image href="${markUri}" x="${(W - L.markSize) / 2}" y="${L.markY}" width="${L.markSize}" height="${L.markSize}" opacity="0.08"/>` : ''}

  ${logoUri ? `<image href="${logoUri}" x="${W / 2 - L.logo / 2}" y="${L.logoY}" width="${L.logo}" height="${L.logo}"/>` : ''}
  <text x="${W / 2}" y="${L.brandY}" font-family="Poppins" font-weight="700" font-size="${L.brandSize}" fill="#ffffff" text-anchor="middle" letter-spacing="6">IL RAVIOLO BOTTEGA</text>
  <rect x="${W / 2 - L.badgeW / 2}" y="${L.badgeY}" width="${L.badgeW}" height="${L.badgeH}" rx="${L.badgeH / 2}" fill="${ACCENT}"/>
  <text x="${W / 2}" y="${L.badgeY + L.badgeH / 2 + L.badgeSize * 0.36}" font-family="Poppins" font-weight="700" font-size="${L.badgeSize}" fill="#0c2440" text-anchor="middle" letter-spacing="3">${esc(badgeText)}</text>

  ${photoBlock}

  ${category ? `<text x="${W / 2}" y="${catY}" font-family="Poppins" font-weight="600" font-size="${L.catSize}" fill="${ACCENT}" text-anchor="middle" letter-spacing="5">${esc(String(category).toUpperCase())}</text>` : ''}
  ${nameSvg}
  <text x="${W / 2}" y="${priceY}" font-family="Poppins" font-weight="700" font-size="${L.priceSize}" fill="${ACCENT}" text-anchor="middle">${esc(fmtPrice(price))}</text>

  <text x="${W / 2}" y="${L.footY}" font-family="Poppins" font-weight="600" font-size="${L.footSize}" fill="#ffffff" text-anchor="middle" opacity="0.9">WhatsApp ${esc(whatsapp)}  ·  ilraviolo.es</text>
</svg>`;

  const png = new Resvg(svg, {
    fitTo: { mode: 'width', value: W },
    font: { fontFiles: FONTS, loadSystemFonts: false, defaultFontFamily: 'Poppins' },
  }).render().asPng();

  return sharp(png).jpeg({ quality: 88, mozjpeg: true }).toBuffer();
}
