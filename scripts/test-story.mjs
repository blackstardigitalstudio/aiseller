// Test locale: storia + post, temi blue/gold, solo prodotti CON foto.
import { generateStory } from './lib/story-image.mjs';
import { writeFileSync } from 'node:fs';

const cfg = await fetch('https://aiseller-blackstar.vercel.app/api/ilraviolo').then(r => r.json());
const withPhoto = cfg.products.filter(p => p.imageUrl);
const longName = withPhoto.find(p => /pizza artesanal/i.test(p.name)) || withPhoto.find(p => p.name.length > 18);
const shortName = withPhoto.find(p => /moretti/i.test(p.name)) || withPhoto[0];
const LOGO = 'https://ilraviolo.es/assets/logo.webp';

const jobs = [
  ['gold-story', shortName, 'story', 'gold'],
  ['gold-feed', longName, 'feed', 'gold'],
  ['blue-feed', longName, 'feed', 'blue'],
];
for (const [tag, p, format, theme] of jobs) {
  const jpg = await generateStory({ name: p.name, price: p.price, imageUrl: p.imageUrl, category: p.category, logoUrl: LOGO, format, theme });
  writeFileSync(`story-${tag}.jpg`, jpg);
  console.log(`✅ story-${tag}.jpg (${(jpg.length / 1024).toFixed(0)} KB) ← "${p.name}" [${theme}/${format}]`);
}
