// One-time import: copies the menu in src/app/data/menu/*.json into
// Airtable, linking items to categories and categories to menus. Menus and
// categories are imported as Visible, items as Available.
// Menus or categories already in Airtable (matched by name) are reused, so an
// interrupted import can be run again. Items are only imported into an empty table.
//
// usage: AIRTABLE_TOKEN=… AIRTABLE_BASE_ID=app… node scripts/seed-airtable.mjs
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LISTS, airtable, toFields } from './airtable-menu.mjs';

const DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'app', 'data', 'menu');
const read = async (f) => JSON.parse(await readFile(join(DIR, f), 'utf8'));

const { AIRTABLE_TOKEN, AIRTABLE_BASE_ID } = process.env;
if (!AIRTABLE_TOKEN || !AIRTABLE_BASE_ID) {
  console.error('Set AIRTABLE_TOKEN and AIRTABLE_BASE_ID.');
  process.exit(1);
}
const at = airtable(AIRTABLE_TOKEN, AIRTABLE_BASE_ID);
const pause = () => new Promise((r) => setTimeout(r, 250)); // Airtable allows 5 requests/second

if ((await at.listAll('items')).length) {
  console.error(`"${LISTS.items.table}" already has rows. The import only runs while it is empty.`);
  process.exit(1);
}

/**
 * Creates rows in batches of 10, reusing existing rows with the same name
 * (and parent). Returns the record ids in order.
 */
async function createAll(list, rows) {
  const parentKey = LISTS[list].parent?.key;
  const keyOf = (r) => `${r.name}\u0000${parentKey ? r[parentKey] : ''}`;
  const existing = new Map(list === 'items' ? [] : (await at.listAll(list)).map((r) => [keyOf(r), r._rid]));
  const ids = rows.map((r) => existing.get(keyOf(r)));
  const todo = rows.map((r, i) => [r, i]).filter(([, i]) => !ids[i]);
  for (let i = 0; i < todo.length; i += 10) {
    const batch = todo.slice(i, i + 10);
    const created = await at.createMany(list, batch.map(([r]) => toFields(list, r)));
    created.forEach((c, j) => (ids[batch[j][1]] = c._rid));
    await pause();
  }
  console.log(`✓ ${LISTS[list].table}: ${todo.length} added${rows.length - todo.length ? `, ${rows.length - todo.length} already there` : ''}`);
  return ids;
}

// Sort Order leaves gaps of 10 so a new row can be slotted between two others.
const supers = await read('super-categories.json');
const superRid = {};
(await createAll('superCategories', supers.map((s, i) => ({ name: s.name, description: s.description, sortOrder: (i + 1) * 10, visible: true }))))
  .forEach((rid, i) => (superRid[supers[i].id] = rid));

const cats = await read('categories.json');
const catRid = {};
(await createAll('categories', cats.map((c, i) => ({
  name: c.name,
  superCategory: superRid[c.superCategoryId],
  description: c.description,
  sortOrder: (i + 1) * 10,
  visible: true,
})))).forEach((rid, i) => (catRid[cats[i].id] = rid));

const items = await read('items.json');
await createAll('items', items.map((it, i) => ({
  name: it.name,
  category: catRid[it.categoryId],
  price: it.price,
  description: it.description,
  sortOrder: (i + 1) * 10,
  available: it.available !== false,
})));
