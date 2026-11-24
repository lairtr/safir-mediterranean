// How the menu maps to the "Restaurant Menu" Airtable base. Shared by the
// admin API (admin-api/worker.js) and the build scripts (fetch-menu.mjs,
// seed-airtable.mjs).
//
// Airtable schema:
//   Super-Categories: Name, Categories (link), Description, Sort Order, Visible
//   Categories:       Name, Super-Category (link), Description, Sort Order, Visible, Menu Items (link)
//   Menu Items:       Title, Description, Price, Category (link), Sort Order, Available
//
// Visible unchecked (menus, categories): hidden from the website, with
// everything in it. Available unchecked (items): shown as "Currently
// unavailable". Lower Sort Order comes first.

export const LISTS = {
  superCategories: {
    table: 'Super-Categories',
    fields: { name: 'Name', description: 'Description', sortOrder: 'Sort Order', visible: 'Visible' },
    children: { list: 'categories', field: 'Categories' },
  },
  categories: {
    table: 'Categories',
    fields: {
      name: 'Name',
      superCategory: 'Super-Category',
      description: 'Description',
      sortOrder: 'Sort Order',
      visible: 'Visible',
    },
    parent: { key: 'superCategory', list: 'superCategories' },
    children: { list: 'items', field: 'Menu Items' },
  },
  items: {
    table: 'Menu Items',
    fields: {
      name: 'Title',
      category: 'Category',
      price: 'Price',
      description: 'Description',
      sortOrder: 'Sort Order',
      available: 'Available',
    },
    parent: { key: 'category', list: 'categories' },
  },
};

const LINK_KEYS = new Set(['superCategory', 'category']);
const BOOL_KEYS = new Set(['visible', 'available']);
const NUMBER_KEYS = new Set(['price', 'sortOrder']);
export const RECORD_ID = /^rec[A-Za-z0-9]{14}$/;
const TEXT_MAX = 2000;

/**
 * Airtable record → row for the admin page:
 * { _rid, name, description, sortOrder, visible, …, superCategory|category: record id, childCount }
 */
export function fromRecord(list, rec) {
  const def = LISTS[list];
  const out = { _rid: rec.id };
  for (const [key, field] of Object.entries(def.fields)) {
    let v = rec.fields[field];
    if (LINK_KEYS.has(key)) v = Array.isArray(v) ? v[0] : undefined;
    else if (BOOL_KEYS.has(key)) v = v === true;
    else if (NUMBER_KEYS.has(key)) v = v === undefined || v === null || v === '' ? undefined : Number(v);
    else if (typeof v === 'string') v = v.trim() || undefined;
    if (v !== undefined && !Number.isNaN(v)) out[key] = v;
  }
  if (def.children) out.childCount = (rec.fields[def.children.field] ?? []).length;
  return out;
}

/**
 * Checks an object from the admin page and turns it into Airtable fields.
 * Unknown keys are dropped. With `partial`, missing keys stay unchanged.
 */
export function toFields(list, obj, { partial = false } = {}) {
  const def = LISTS[list];
  if (!def) throw new Error('Unknown list');
  const required = ['name', ...(def.parent ? [def.parent.key] : [])];
  const fields = {};
  for (const [key, field] of Object.entries(def.fields)) {
    if (!Object.hasOwn(obj, key)) {
      if (!partial && required.includes(key)) throw new Error(`${field} is required`);
      continue;
    }
    let v = obj[key];
    if (v === null || v === '') v = undefined;
    if (required.includes(key) && v === undefined) throw new Error(`${field} is required`);
    if (LINK_KEYS.has(key)) {
      if (v !== undefined && (typeof v !== 'string' || !RECORD_ID.test(v))) throw new Error(`${field} is invalid`);
      v = v === undefined ? [] : [v];
    } else if (BOOL_KEYS.has(key)) {
      v = v === true;
    } else if (NUMBER_KEYS.has(key)) {
      if (v !== undefined) {
        v = Number(v);
        if (!Number.isFinite(v) || v < 0 || v > 100000) throw new Error(`${field} must be a positive number`);
        if (key === 'price') v = Math.round(v * 100) / 100;
      }
    } else if (v !== undefined) {
      if (typeof v !== 'string') throw new Error(`${field} must be text`);
      v = v.trim().slice(0, TEXT_MAX) || undefined;
    }
    fields[field] = v ?? null;
  }
  return fields;
}

// ---- Public menu (what the website shows) ----

export const slugify = (s) =>
  String(s)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ı/g, 'i')
    .replace(/['’]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80) || 'section';

/**
 * Admin rows (all three lists, sorted) → the website's menu data: visible
 * rows only, links resolved, readable ids for menus and sections.
 *   { superCategories: [{ id, name, description? }],
 *     categories: [{ id, superCategoryId, name, description? }],
 *     items: [{ id, categoryId, name, description?, price?, available }] }
 */
export function toPublicMenu({ superCategories, categories, items }) {
  const used = new Set();
  const uniqueSlug = (name, prefix) => {
    let id = slugify(name);
    if (used.has(id) && prefix) id = `${prefix}-${id}`;
    for (let n = 2; used.has(id); n++) id = `${slugify(name)}-${n}`;
    used.add(id);
    return id;
  };
  const supers = new Map();
  for (const s of superCategories.filter((r) => r.visible && r.name)) {
    supers.set(s._rid, { id: uniqueSlug(s.name), name: s.name, ...(s.description && { description: s.description }) });
  }
  const cats = new Map();
  for (const c of categories.filter((r) => r.visible && r.name && supers.has(r.superCategory))) {
    const parent = supers.get(c.superCategory);
    cats.set(c._rid, {
      id: uniqueSlug(c.name, parent.id),
      superCategoryId: parent.id,
      name: c.name,
      ...(c.description && { description: c.description }),
    });
  }
  const outItems = items
    .filter((i) => i.name && cats.has(i.category))
    .map((i) => ({
      id: i._rid,
      categoryId: cats.get(i.category).id,
      name: i.name,
      ...(i.description && { description: i.description }),
      ...(i.price !== undefined && { price: i.price }),
      available: i.available,
    }));
  return { superCategories: [...supers.values()], categories: [...cats.values()], items: outItems };
}

// ---- Airtable REST API ----

export function airtable(token, baseId) {
  const root = `https://api.airtable.com/v0/${encodeURIComponent(baseId)}/`;
  async function call(path, init = {}) {
    const res = await fetch(root + path, {
      ...init,
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...init.headers },
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(body?.error?.message || body?.error?.type || body?.error || `Airtable error ${res.status}`);
      err.status = res.status;
      throw err;
    }
    return body;
  }
  const tableOf = (list) => encodeURIComponent(LISTS[list].table);
  return {
    /** All records of a list as admin rows, sorted by Sort Order. */
    async listAll(list) {
      const out = [];
      let offset;
      do {
        const q = new URLSearchParams({ pageSize: '100', 'sort[0][field]': 'Sort Order', 'sort[0][direction]': 'asc' });
        if (offset) q.set('offset', offset);
        const page = await call(`${tableOf(list)}?${q}`);
        for (const r of page.records) out.push(fromRecord(list, r));
        offset = page.offset;
      } while (offset);
      return out;
    },
    async listEverything() {
      const [superCategories, categories, items] = await Promise.all(Object.keys(LISTS).map((l) => this.listAll(l)));
      return { superCategories, categories, items };
    },
    async get(list, rid) {
      return fromRecord(list, await call(`${tableOf(list)}/${encodeURIComponent(rid)}`));
    },
    async create(list, fields) {
      return fromRecord(list, await call(tableOf(list), { method: 'POST', body: JSON.stringify({ fields }) }));
    },
    /** Up to 10 records per call (Airtable's limit). */
    async createMany(list, fieldsArr) {
      const r = await call(tableOf(list), { method: 'POST', body: JSON.stringify({ records: fieldsArr.map((fields) => ({ fields })) }) });
      return r.records.map((x) => fromRecord(list, x));
    },
    async update(list, rid, fields) {
      const r = await call(`${tableOf(list)}/${encodeURIComponent(rid)}`, { method: 'PATCH', body: JSON.stringify({ fields }) });
      return fromRecord(list, r);
    },
    /** Up to 10 records per call: [{ id, fields }] */
    async updateMany(list, records) {
      const r = await call(tableOf(list), { method: 'PATCH', body: JSON.stringify({ records }) });
      return r.records.map((x) => fromRecord(list, x));
    },
    async remove(list, rid) {
      await call(`${tableOf(list)}/${encodeURIComponent(rid)}`, { method: 'DELETE' });
    },
  };
}
