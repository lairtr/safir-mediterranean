// Downloads every image the site uses from the current WordPress site
// into public/images. Run once (before WordPress is shut down):
//   npm run fetch-assets
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const WP = 'https://safir-mediterranean.com/wp-content';
const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'images');

const ASSETS = {
  'logo.png': `${WP}/uploads/2022/10/SafirMediterraneanLogo300px.png`,
  'logo-white.png': `${WP}/uploads/2022/10/SafirMediterraneanLogoWhite300px.png`,
  'hero-masa.jpeg': `${WP}/uploads/2023/05/masa2-scaled.jpeg`,
  'hero-lamb-chops.jpeg': `${WP}/uploads/2023/05/22lamp-chops-scaled-e1683836699875.jpeg`,
  'hero-homemade-bread.jpeg': `${WP}/uploads/2023/05/6-homemadebread-scaled.jpeg`,
  'band-octopus.jpeg': `${WP}/uploads/2023/05/9-octopus-scaled.jpeg`,
  'band-greek-salad.jpeg': `${WP}/uploads/2023/05/8-greeksalad-scaled-e1683833732936.jpeg`,
  'doordash.png': `${WP}/uploads/2022/10/DoorDash.png`,
  'seamless.png': `${WP}/uploads/2022/10/Seamless.png`,
  'ubereats.png': `${WP}/uploads/2022/10/UberEats.png`,
  'fantuan.png': `${WP}/uploads/2023/04/SQ8GRgW20Pj8VH6yLuC6stSHjdV1628530496111_200x200-e1682547767224.png`,
  'chownow.jpg': `${WP}/uploads/2023/05/Chownow-Logo-e1682955883519-300x162.jpg`,
  'restaurant-guru.png': `${WP}/uploads/2023/08/RestaurantGuru_Certificate1.png`,
  'menu/safir1.png': `${WP}/safir-menu/safir1.png`,
  'menu/safir2.png': `${WP}/safir-menu/safir2.png`,
  'menu/safir3.png': `${WP}/safir-menu/safir3.png`,
  'menu/safir4.png': `${WP}/safir-menu/safir4.png`,
};

let failed = 0;
for (const [name, url] of Object.entries(ASSETS)) {
  const dest = join(OUT, name);
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    await mkdir(dirname(dest), { recursive: true });
    await writeFile(dest, Buffer.from(await res.arrayBuffer()));
    console.log(`✓ ${name}`);
  } catch (err) {
    failed++;
    console.error(`✗ ${name} (${url}): ${err.message}`);
  }
}
console.log(failed ? `\n${failed} file(s) failed.` : '\nAll images saved to public/images.');
process.exitCode = failed ? 1 : 0;
