/**
 * The restaurant's menus. The live menu comes from Airtable through the admin
 * API (see menu-store.ts). The JSON lists in ./data/menu/ are a snapshot of it,
 * refreshed on every deploy (scripts/fetch-menu.mjs). The snapshot is what
 * search engines see and what shows if the live menu can't load.
 *
 *   super-categories.json  whole menus: Main Menu, Breakfast, Specials
 *   categories.json        sections of a menu: Entrees, Desserts… (superCategoryId)
 *   items.json             dishes and drinks (categoryId)
 *
 * List order is display order. Printed-menu images (`images`) live only here,
 * matched to live menus by id (the menu name as a slug, e.g. "main-menu").
 */
import superCategoriesJson from './data/menu/super-categories.json';
import categoriesJson from './data/menu/categories.json';
import itemsJson from './data/menu/items.json';

// ---- Menu data (JSON files and the live API share this shape) ----

export interface MenuSuperCategory {
  id: string;
  name: string;
  /** Shown under the menu tabs, e.g. serving times */
  description?: string;
  /** Printed menu pages (repo only) */
  images?: { src: string; alt: string }[];
}

export interface MenuCategory {
  id: string;
  superCategoryId: string;
  name: string;
  /** Short line under the section title (availability, pricing note) */
  description?: string;
}

export interface MenuItemRecord {
  id: string;
  categoryId: string;
  name: string;
  description?: string;
  /** In US dollars */
  price?: number;
  /** false: shown as "Currently unavailable" */
  available: boolean;
}

export interface MenuData {
  superCategories: MenuSuperCategory[];
  categories: MenuCategory[];
  items: MenuItemRecord[];
}

export const STATIC_MENU_DATA: MenuData = {
  superCategories: superCategoriesJson,
  categories: categoriesJson,
  items: itemsJson,
};

// ---- What the Menu page renders ----

export interface MenuItem {
  id: string;
  name: string;
  /** Formatted, e.g. "8.95" */
  price?: string;
  desc?: string;
  available: boolean;
}

export interface MenuSection {
  id: string;
  title: string;
  note?: string;
  items: MenuItem[];
  /** Two-column list for short entries (drinks, sides) */
  compact: boolean;
}

export interface Menu {
  id: string;
  label: string;
  /** Tab label on phones */
  shortLabel: string;
  note?: string;
  sections: MenuSection[];
  images: { src: string; alt: string }[];
}

export const MENU_FOOTNOTES = [
  'Please inform management of any allergies you or your guests may have. Consuming raw or undercooked food may increase your risk of foodborne illness.',
  'For parties of six or more, a 20% gratuity will be automatically added to your bill.',
];

/** "This Week's Specials" → "Specials", "Main Menu" → "Main" (phone tabs). */
const shortLabel = (name: string) =>
  name.replace(/\b(this week['’]?s|our|the|menu)\b/gi, '').replace(/\s+/g, ' ').trim() || name;

/** Sections whose descriptions are all short (drinks, sides) use the compact list. */
const COMPACT_DESC_MAX = 40;

const IMAGES_BY_ID = new Map(STATIC_MENU_DATA.superCategories.map((s) => [s.id, s.images ?? []]));

export function buildMenus(data: MenuData): Menu[] {
  return data.superCategories
    .map((sc) => ({
      id: sc.id,
      label: sc.name,
      shortLabel: shortLabel(sc.name),
      note: sc.description,
      images: sc.images ?? IMAGES_BY_ID.get(sc.id) ?? [],
      sections: data.categories
        .filter((c) => c.superCategoryId === sc.id)
        .map((c) => {
          const items = data.items
            .filter((i) => i.categoryId === c.id)
            .map((i) => ({
              id: i.id,
              name: i.name,
              price: i.price === undefined ? undefined : i.price.toFixed(2),
              desc: i.description,
              available: i.available !== false,
            }));
          return {
            id: c.id,
            title: c.name,
            note: c.description,
            items,
            compact: items.every((i) => (i.desc?.length ?? 0) <= COMPACT_DESC_MAX),
          };
        })
        .filter((s) => s.items.length),
    }))
    .filter((m) => m.sections.length);
}

/** The built-in snapshot, used for prerendering and as the fallback. */
export const MENUS: Menu[] = buildMenus(STATIC_MENU_DATA);
