// Saves a snapshot of the live Airtable menu into src/app/data/menu/*.json.
// The snapshot is prerendered into the Menu page (for search engines) and
// shown if the live menu can't load. The deploy workflow runs this when the
// AIRTABLE_TOKEN secret is set. Price changes don't need it: the site loads
// the live menu on its own.
//
// usage: AIRTABLE_TOKEN=… AIRTABLE_BASE_ID=app… node scripts/fetch-menu.mjs
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { airtable, toPublicMenu } from './airtable-menu.mjs';

const DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'app', 'data', 'menu');
const FILES = { superCategories: 'super-categories.json', categories: 'categories.json', items: 'items.json' };

const { AIRTABLE_TOKEN, AIRTABLE_BASE_ID } = process.env;
if (!AIRTABLE_TOKEN || !AIRTABLE_BASE_ID) {
  console.error('Set AIRTABLE_TOKEN and AIRTABLE_BASE_ID.');
  process.exit(1);
}
const menu = toPublicMenu(await airtable(AIRTABLE_TOKEN, AIRTABLE_BASE_ID).listEverything());

if (!menu.superCategories.length || !menu.items.length) {
  console.warn('Airtable has no visible menu yet; keeping the existing snapshot.');
  process.exit(0);
}

// Printed-menu images are files in the repo, not in Airtable: keep them.
const old = JSON.parse(await readFile(join(DIR, FILES.superCategories), 'utf8'));
const imagesById = Object.fromEntries(old.map((s) => [s.id, s.images]));
menu.superCategories = menu.superCategories.map((s) => ({ ...s, ...(imagesById[s.id] && { images: imagesById[s.id] }) }));

for (const [list, file] of Object.entries(FILES)) await writeFile(join(DIR, file), JSON.stringify(menu[list], null, 2) + '\n');
console.log(`✓ menu snapshot: ${menu.superCategories.length} menus, ${menu.categories.length} categories, ${menu.items.length} items`);
