// Builds responsive WebP versions of the full-resolution photos in image-src/
// into public/images/opt/. Re-run after adding or replacing a photo:
//   npm run optimize-images
//
// Masters stay at full camera resolution; the browser picks the smallest
// version that is still sharp for the screen via srcset (see site-data.ts).
import sharp from 'sharp';
import { mkdir, readdir } from 'node:fs/promises';
import { dirname, join, parse } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'image-src');
const OUT = join(ROOT, 'public', 'images', 'opt');

/** name prefix -> output widths and optional aspect ratio (w/h) to crop to */
const RULES = [
  { match: /^hero-/, widths: [640, 1024, 1600, 2400, 3024] },
  { match: /^band-/, widths: [800, 1600, 2400] },
  { match: /^dish-/, widths: [480, 960], aspect: 1 },
  { match: /^dining-room/, widths: [600, 1200], aspect: 4 / 5 },
  { match: /^ig-/, widths: [320, 640], aspect: 1 },
];

await mkdir(OUT, { recursive: true });
for (const file of (await readdir(SRC)).filter((f) => /\.(jpe?g|png)$/i.test(f)).sort()) {
  const { name } = parse(file);
  const rule = RULES.find((r) => r.match.test(name));
  if (!rule) {
    console.warn(`? ${file}: no rule, skipped`);
    continue;
  }
  const base = sharp(join(SRC, file)).rotate(); // apply EXIF orientation
  const { width: srcW, height: srcH } = await base.clone().toBuffer({ resolveWithObject: true }).then((r) => r.info);
  const made = [];
  for (const w of rule.widths) {
    if (w > srcW) continue; // never upscale
    const h = rule.aspect ? Math.round(w / rule.aspect) : undefined;
    await base
      .clone()
      .resize({ width: w, height: h, fit: 'cover', position: 'attention' })
      .webp({ quality: 78, effort: 5 })
      .toFile(join(OUT, `${name}-${w}.webp`));
    made.push(w);
  }
  console.log(`✓ ${name} (${srcW}x${srcH}) -> ${made.join(', ')}`);
}
