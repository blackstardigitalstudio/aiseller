// Test locale del generatore storia: prende prodotti veri dall'endpoint pubblico,
// genera 2 esempi (uno con foto, uno senza) e li salva come JPEG da controllare a occhio.
import { generateStory } from './lib/story-image.mjs';
import { writeFileSync } from 'node:fs';

const cfg = await fetch('https://aiseller-blackstar.vercel.app/api/ilraviolo').then(r => r.json());
const withImg = cfg.products.find(p => p.imageUrl && /salsa|tartuf|raviol|pizza|vino/i.test(p.name)) || cfg.products.find(p => p.imageUrl);
const noImg = cfg.products.find(p => !p.imageUrl);

const LOGO = 'https://ilraviolo.es/assets/logo.webp';

for (const [tag, p] of [['confoto', withImg], ['senzafoto', noImg]]) {
  if (!p) continue;
  const jpg = await generateStory({
    name: p.name, price: p.price, imageUrl: p.imageUrl, category: p.category, logoUrl: LOGO,
  });
  const file = `story-${tag}.jpg`;
  writeFileSync(file, jpg);
  console.log(`✅ ${file}  (${(jpg.length/1024).toFixed(0)} KB)  ← ${p.name} | ${p.category} | ${p.price}`);
}
