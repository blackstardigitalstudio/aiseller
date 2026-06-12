// Test locale del generatore storia: solo prodotti CON foto.
// Genera un caso nome-lungo (2 righe) e uno corto per verificare spaziatura/proporzioni.
import { generateStory } from './lib/story-image.mjs';
import { writeFileSync } from 'node:fs';

const cfg = await fetch('https://aiseller-blackstar.vercel.app/api/ilraviolo').then(r => r.json());
const withPhoto = cfg.products.filter(p => p.imageUrl);
const longName = withPhoto.find(p => /pizza artesanal/i.test(p.name)) || withPhoto.find(p => p.name.length > 18);
const shortName = withPhoto.find(p => p.name.length <= 14) || withPhoto[0];

const LOGO = 'https://ilraviolo.es/assets/logo.webp';

for (const [tag, p] of [['lungo', longName], ['corto', shortName]]) {
  if (!p) continue;
  const jpg = await generateStory({ name: p.name, price: p.price, imageUrl: p.imageUrl, category: p.category, logoUrl: LOGO });
  writeFileSync(`story-${tag}.jpg`, jpg);
  console.log(`✅ story-${tag}.jpg (${(jpg.length / 1024).toFixed(0)} KB) ← "${p.name}" | ${p.category} | ${p.price}`);
}
