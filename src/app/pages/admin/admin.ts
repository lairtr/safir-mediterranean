import { Component, ElementRef, OnDestroy, computed, inject, signal, viewChild } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { AdminApi, AdminApiError, AdminMenuData, CategoryRow, ItemRow, ListName, SuperCategoryRow } from './admin-api';

type AnyRow = SuperCategoryRow | CategoryRow | ItemRow;
type Draft = Record<string, string | boolean>;

interface FieldDef {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'checkbox' | 'select';
  required?: boolean;
  help?: string;
}

const VISIBLE: FieldDef = { key: 'visible', label: 'Visible on the website', type: 'checkbox' };
const SORT: FieldDef = { key: 'sortOrder', label: 'Sort order', type: 'number', help: 'Lower numbers are shown first.' };

const FIELDS: Record<ListName, FieldDef[]> = {
  items: [
    { key: 'name', label: 'Title', type: 'text', required: true },
    { key: 'category', label: 'Category', type: 'select', required: true },
    { key: 'price', label: 'Price ($)', type: 'number' },
    { key: 'description', label: 'Description', type: 'textarea' },
    SORT,
    { key: 'available', label: 'Available (uncheck when sold out)', type: 'checkbox' },
  ],
  categories: [
    { key: 'name', label: 'Name', type: 'text', required: true },
    { key: 'superCategory', label: 'Menu', type: 'select', required: true },
    { key: 'description', label: 'Description', type: 'textarea', help: 'Optional line under the title, e.g. serving times.' },
    SORT,
    VISIBLE,
  ],
  superCategories: [
    { key: 'name', label: 'Name', type: 'text', required: true },
    { key: 'description', label: 'Description', type: 'textarea', help: 'Optional, e.g. "Saturday & Sunday, 11 AM – 3 PM"' },
    SORT,
    VISIBLE,
  ],
};

const NOUN: Record<ListName, string> = { items: 'item', categories: 'category', superCategories: 'menu' };
const money = (n?: number) => (n === undefined ? '' : `$${n.toFixed(2)}`);

/**
 * /admin — edit the menu in Airtable through the menu API. Changes show on the
 * website within about a minute. Not linked from the site, not prerendered
 * (GitHub Pages answers it with status 404), not in the sitemap, noindex.
 */
@Component({
  selector: 'app-admin',
  template: `
    <div class="admin">
      @if (!api.configured) {
        <div class="card narrow">
          <h1>Admin setup needed</h1>
          <p>Set <code>API_URL</code> in <code>src/app/api-config.ts</code> to the deployed menu API (see <code>admin-api/README.md</code>).</p>
        </div>
      } @else if (!api.signedIn()) {
        <form class="card narrow" (submit)="signIn($event)">
          <h1>Safir admin</h1>
          <label class="field">
            <span>Password</span>
            <input type="password" name="password" autocomplete="current-password" required [disabled]="busy()" autofocus />
          </label>
          @if (error()) {
            <p class="error" role="alert">{{ error() }}</p>
          }
          <button class="btn btn-blue" type="submit" [disabled]="busy()">{{ busy() ? 'Signing in…' : 'Sign in' }}</button>
        </form>
      } @else {
        <header class="bar">
          <h1>Menu admin</h1>
          <div class="bar-actions">
            <a class="btn btn-light" href="menu" target="_blank" rel="noopener">View menu</a>
            <button class="btn btn-light" type="button" (click)="signOut()">Sign out</button>
          </div>
        </header>

        @if (notice()) {
          <p class="notice" role="status">{{ notice() }}</p>
        }
        @if (error()) {
          <p class="error" role="alert">{{ error() }}</p>
        }

        <div class="tabs" role="tablist">
          @for (t of tabs; track t.id) {
            <button type="button" role="tab" [attr.aria-selected]="tab() === t.id" [class.active]="tab() === t.id" (click)="tab.set(t.id)">
              {{ t.label }} <span class="count">{{ count(t.id) }}</span>
            </button>
          }
        </div>

        @if (!data()) {
          <p class="muted">{{ busy() ? 'Loading the menu…' : '' }}</p>
        } @else {
          <div class="toolbar">
            @if (tab() !== 'superCategories') {
              <select aria-label="Filter by menu" (change)="menuFilter.set(val($event))">
                <option value="">All menus</option>
                @for (s of data()!.superCategories; track s._rid) {
                  <option [value]="s._rid" [selected]="menuFilter() === s._rid">{{ s.name }}</option>
                }
              </select>
            }
            @if (tab() === 'items') {
              <input type="search" placeholder="Search items" aria-label="Search items" (input)="search.set(val($event))" [value]="search()" />
            }
            <button class="btn btn-blue add" type="button" (click)="openNew()">+ Add {{ noun(tab()) }}</button>
          </div>

          @switch (tab()) {
            @case ('items') {
              @for (g of itemGroups(); track g.category._rid) {
                <section class="group">
                  <h2>
                    @if (g.items.length) {
                      <input
                        type="checkbox"
                        class="pick"
                        [checked]="groupState(g.items) === 'all'"
                        [indeterminate]="groupState(g.items) === 'some'"
                        (change)="toggleGroup(g.items, checked($event))"
                        [attr.aria-label]="'Select all items in ' + g.category.name"
                      />
                    }
                    {{ g.category.name }} <span class="muted">· {{ menuName(g.category.superCategory) }}</span>
                    @if (!g.category.visible) {
                      <span class="tag">Hidden</span>
                    }
                  </h2>
                  <ul class="rows">
                    @for (i of g.items; track i._rid) {
                      <li class="pickable" [class.picked]="selected().has(i._rid)">
                        <input
                          type="checkbox"
                          class="pick"
                          [checked]="selected().has(i._rid)"
                          (change)="toggle(i._rid, checked($event))"
                          [attr.aria-label]="'Select ' + i.name"
                        />
                        <button type="button" class="row" [class.dim]="!i.available" (click)="openEdit('items', i)">
                          <span class="row-main">
                            <strong>{{ i.name }}</strong>
                            @if (!i.available) {
                              <span class="tag red">Unavailable</span>
                            }
                            @if (i.description) {
                              <span class="desc">{{ i.description }}</span>
                            }
                          </span>
                          <span class="price">{{ money(i.price) }}</span>
                        </button>
                      </li>
                    }
                  </ul>
                </section>
              } @empty {
                <p class="muted">No items match.</p>
              }
              @if (orphanItems().length && !menuFilter()) {
                <section class="group">
                  <h2 class="error-text">Not shown: no category</h2>
                  <ul class="rows">
                    @for (i of orphanItems(); track i._rid) {
                      <li class="pickable" [class.picked]="selected().has(i._rid)">
                        <input type="checkbox" class="pick" [checked]="selected().has(i._rid)" (change)="toggle(i._rid, checked($event))" [attr.aria-label]="'Select ' + i.name" />
                        <button type="button" class="row" (click)="openEdit('items', i)"><strong>{{ i.name }}</strong></button>
                      </li>
                    }
                  </ul>
                </section>
              }

              @if (selected().size) {
                <div class="move-bar" role="region" aria-label="Move selected items">
                  <strong>{{ selected().size }} selected</strong>
                  <label class="move-to">
                    <span>Move to</span>
                    <select (change)="moveTarget.set(val($event))" aria-label="Target category">
                      <option value="" [selected]="!moveTarget()">Choose a category…</option>
                      @for (s of data()!.superCategories; track s._rid) {
                        <optgroup [label]="s.name">
                          @for (c of categoriesOf(s._rid); track c._rid) {
                            <option [value]="c._rid" [selected]="moveTarget() === c._rid">{{ c.name }}</option>
                          }
                        </optgroup>
                      }
                    </select>
                  </label>
                  <button type="button" class="btn btn-blue" [disabled]="!moveTarget() || busy()" (click)="moveSelected()">
                    {{ busy() ? 'Moving…' : 'Move' }}
                  </button>
                  <button type="button" class="btn btn-light" (click)="clearSelection()">Clear</button>
                </div>
              }
            }
            @case ('categories') {
              <ul class="rows">
                @for (c of visibleCategories(); track c._rid) {
                  <li>
                    <button type="button" class="row" [class.dim]="!c.visible" (click)="openEdit('categories', c)">
                      <span class="row-main">
                        <strong>{{ c.name }}</strong>
                        @if (!c.visible) {
                          <span class="tag">Hidden</span>
                        }
                        <span class="desc">{{ menuName(c.superCategory) }} · {{ c.childCount }} items</span>
                      </span>
                      <span class="muted">#{{ c.sortOrder ?? '–' }}</span>
                    </button>
                  </li>
                }
              </ul>
            }
            @case ('superCategories') {
              <ul class="rows">
                @for (s of data()!.superCategories; track s._rid) {
                  <li>
                    <button type="button" class="row" [class.dim]="!s.visible" (click)="openEdit('superCategories', s)">
                      <span class="row-main">
                        <strong>{{ s.name }}</strong>
                        @if (!s.visible) {
                          <span class="tag">Hidden</span>
                        }
                        <span class="desc">{{ s.childCount }} categories{{ s.description ? ' · ' + s.description : '' }}</span>
                      </span>
                      <span class="muted">#{{ s.sortOrder ?? '–' }}</span>
                    </button>
                  </li>
                }
              </ul>
            }
          }
        }
      }
    </div>

    <dialog #editorDialog class="editor" (close)="closed()" aria-labelledby="editor-title">
      @if (editing(); as e) {
        <form method="dialog" (submit)="save($event)">
          <h2 id="editor-title">{{ e.row ? 'Edit' : 'Add' }} {{ noun(e.list) }}</h2>
          @for (f of fields(e.list); track f.key) {
            @if (f.type === 'checkbox') {
              <label class="check">
                <input type="checkbox" [checked]="!!draft()[f.key]" (change)="setField(f, checked($event))" />
                {{ f.label }}
              </label>
            } @else {
              <label class="field">
                <span>{{ f.label }}{{ f.required ? ' *' : '' }}</span>
                @switch (f.type) {
                  @case ('textarea') {
                    <textarea rows="3" [value]="text(f.key)" (input)="setField(f, val($event))"></textarea>
                  }
                  @case ('select') {
                    <select [required]="!!f.required" (change)="setField(f, val($event))">
                      <option value="" disabled [selected]="!draft()[f.key]">Choose…</option>
                      @if (f.key === 'category') {
                        @for (s of data()!.superCategories; track s._rid) {
                          <optgroup [label]="s.name">
                            @for (c of categoriesOf(s._rid); track c._rid) {
                              <option [value]="c._rid" [selected]="draft()[f.key] === c._rid">{{ c.name }}</option>
                            }
                          </optgroup>
                        }
                      } @else {
                        @for (s of data()!.superCategories; track s._rid) {
                          <option [value]="s._rid" [selected]="draft()[f.key] === s._rid">{{ s.name }}</option>
                        }
                      }
                    </select>
                  }
                  @case ('number') {
                    <input type="number" min="0" step="0.01" inputmode="decimal" [value]="text(f.key)" (input)="setField(f, val($event))" />
                  }
                  @default {
                    <input type="text" [required]="!!f.required" [value]="text(f.key)" (input)="setField(f, val($event))" />
                  }
                }
                @if (f.help) {
                  <small>{{ f.help }}</small>
                }
              </label>
            }
          }
          @if (formError()) {
            <p class="error" role="alert">{{ formError() }}</p>
          }
          <div class="editor-actions">
            @if (e.row) {
              <button type="button" class="btn btn-light danger" (click)="remove()" [disabled]="busy()">
                {{ confirmDelete() ? 'Really delete?' : 'Delete' }}
              </button>
            }
            <span class="spacer"></span>
            <button type="button" class="btn btn-light" (click)="closeEditor()">Cancel</button>
            <button type="submit" class="btn btn-blue" [disabled]="busy()">{{ busy() ? 'Saving…' : 'Save' }}</button>
          </div>
        </form>
      }
    </dialog>
  `,
  styles: `
    .admin {
      max-width: 960px;
      margin: 0 auto;
      padding: 32px 20px 80px;
      min-height: 100vh;
    }
    h1 {
      font-size: 28px;
      margin: 0;
    }
    .card {
      background: #fff;
      border: 1px solid #e6e0d8;
      border-radius: var(--radius);
      padding: 28px;
    }
    .narrow {
      max-width: 400px;
      margin: 12vh auto 0;
      display: grid;
      gap: 16px;
    }
    .bar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 16px;
    }
    .bar-actions {
      display: flex;
      gap: 8px;
    }
    .notice {
      background: #e8f1fb;
      border-radius: var(--radius);
      padding: 12px 16px;
      margin: 0 0 16px;
    }
    .notice.warn {
      background: #fff6e0;
    }
    .notice a {
      font-weight: 700;
      margin-left: 6px;
    }
    .error {
      color: #b3261e;
      background: #fdecea;
      border-radius: var(--radius);
      padding: 10px 14px;
      margin: 0 0 16px;
    }
    .error-text {
      color: #b3261e;
    }
    .muted {
      color: var(--muted);
      font-weight: 400;
    }
    .tabs {
      display: flex;
      gap: 4px;
      border-bottom: 2px solid #e6e0d8;
      margin-bottom: 16px;
      overflow-x: auto;
    }
    .tabs button {
      background: none;
      border: 0;
      border-bottom: 3px solid transparent;
      margin-bottom: -2px;
      padding: 12px 16px;
      font: 700 16px var(--sans);
      color: var(--muted);
      cursor: pointer;
      white-space: nowrap;
    }
    .tabs button.active {
      color: var(--blue);
      border-bottom-color: var(--blue);
    }
    .count {
      font-weight: 400;
      font-size: 14px;
    }
    .toolbar {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 20px;
    }
    .toolbar .add {
      margin-left: auto;
    }
    input,
    select,
    textarea {
      font: 16px/1.4 var(--sans);
      padding: 10px 12px;
      border: 1px solid #cfc8bf;
      border-radius: 6px;
      background: #fff;
      color: var(--ink);
      min-height: 44px;
      width: 100%;
    }
    .toolbar select,
    .toolbar input {
      width: auto;
      flex: 1 1 180px;
      max-width: 280px;
    }
    input[readonly] {
      background: var(--sand);
      color: var(--muted);
    }
    .group h2 {
      font-size: 18px;
      margin: 24px 0 8px;
    }
    .rows {
      list-style: none;
      margin: 0;
      padding: 0;
      border: 1px solid #e6e0d8;
      border-radius: var(--radius);
      background: #fff;
    }
    .pickable {
      display: flex;
      align-items: flex-start;
    }
    .pickable > .pick {
      margin: 14px 0 0 14px;
    }
    .pickable.picked {
      background: #eef4fb;
    }
    .pick {
      width: 20px;
      height: 20px;
      min-height: 20px;
      flex: none;
      padding: 0;
      accent-color: var(--blue);
      cursor: pointer;
    }
    .group h2 .pick {
      vertical-align: -3px;
      margin-right: 6px;
    }
    .move-bar {
      position: sticky;
      bottom: 12px;
      z-index: 5;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 10px 14px;
      margin-top: 24px;
      padding: 12px 16px;
      background: #fff;
      border: 1px solid #d5dde8;
      border-radius: var(--radius);
      box-shadow: 0 8px 30px rgba(20, 30, 45, 0.18);
    }
    .move-to {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1 1 260px;
    }
    .move-to span {
      font-weight: 700;
      white-space: nowrap;
    }
    .rows li + li {
      border-top: 1px solid #eee8e0;
    }
    .row {
      display: flex;
      width: 100%;
      gap: 16px;
      justify-content: space-between;
      align-items: flex-start;
      padding: 12px 16px;
      background: none;
      border: 0;
      text-align: left;
      font: inherit;
      color: inherit;
      cursor: pointer;
    }
    .row:hover {
      background: var(--sand);
    }
    .row-main {
      min-width: 0;
    }
    .desc {
      display: block;
      color: var(--muted);
      font-size: 14px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 640px;
    }
    .price {
      font-weight: 700;
      white-space: pre-line;
      text-align: right;
      flex-shrink: 0;
    }
    .editor {
      width: min(560px, calc(100vw - 24px));
      max-height: calc(100dvh - 24px);
      border: 0;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }
    .editor::backdrop {
      background: rgba(20, 30, 45, 0.55);
    }
    .editor form {
      display: grid;
      gap: 14px;
    }
    .editor h2 {
      margin: 0;
      font-size: 22px;
    }
    .field {
      display: grid;
      gap: 4px;
    }
    .field > span {
      font-weight: 700;
      font-size: 15px;
    }
    .field small {
      color: var(--muted);
      font-size: 13px;
    }
    .check {
      display: flex;
      gap: 10px;
      align-items: center;
      font-weight: 700;
      font-size: 15px;
    }
    .check input {
      width: 22px;
      min-height: 22px;
      height: 22px;
    }
    .editor-actions {
      display: flex;
      gap: 8px;
      margin-top: 6px;
    }
    .spacer {
      flex: 1;
    }
    .danger {
      color: #b3261e;
      border-color: #f0c7c3;
    }
    code {
      background: var(--sand);
      padding: 1px 5px;
      border-radius: 4px;
      font-size: 0.9em;
    }
    .tag {
      display: inline-block;
      margin-left: 8px;
      padding: 1px 8px;
      border-radius: 999px;
      background: #eceff3;
      color: var(--muted);
      font-size: 12px;
      font-weight: 700;
      vertical-align: 2px;
    }
    .tag.red {
      background: #fdecea;
      color: #b3261e;
    }
    .row.dim strong {
      color: var(--muted);
    }
    @media (max-width: 600px) {
      .bar-actions,
      .bar-actions .btn {
        width: 100%;
      }
      .bar-actions .btn {
        flex: 1;
        padding-inline: 12px;
      }
      .toolbar .add {
        margin-left: 0;
        width: 100%;
      }
      .toolbar select,
      .toolbar input {
        max-width: none;
      }
      .desc {
        white-space: normal;
      }
    }
  `,
})
export class Admin implements OnDestroy {
  readonly api = inject(AdminApi);
  private readonly meta = inject(Meta);
  readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('editorDialog');

  readonly tabs: { id: ListName; label: string }[] = [
    { id: 'items', label: 'Items' },
    { id: 'categories', label: 'Categories' },
    { id: 'superCategories', label: 'Menus' },
  ];
  readonly tab = signal<ListName>('items');
  readonly data = signal<AdminMenuData | null>(null);
  readonly busy = signal(false);
  readonly error = signal('');
  readonly notice = signal('');
  readonly menuFilter = signal('');
  readonly search = signal('');

  readonly editing = signal<{ list: ListName; row: AnyRow | null } | null>(null);
  readonly draft = signal<Draft>({});
  readonly formError = signal('');
  readonly confirmDelete = signal(false);

  /** Items ticked for a bulk move (Airtable record ids). */
  readonly selected = signal<ReadonlySet<string>>(new Set());
  readonly moveTarget = signal('');

  readonly visibleCategories = computed(() => {
    const d = this.data();
    const f = this.menuFilter();
    return d ? d.categories.filter((c) => !f || c.superCategory === f) : [];
  });
  readonly itemGroups = computed(() => {
    const d = this.data();
    if (!d) return [];
    const q = this.search().trim().toLowerCase();
    return this.visibleCategories()
      .map((category) => ({
        category,
        items: d.items.filter(
          (i) =>
            i.category === category._rid &&
            (!q || i.name.toLowerCase().includes(q) || (i.description ?? '').toLowerCase().includes(q)),
        ),
      }))
      .filter((g) => g.items.length || !q);
  });
  readonly orphanItems = computed(() => {
    const d = this.data();
    if (!d) return [];
    const ids = new Set(d.categories.map((c) => c._rid));
    return d.items.filter((i) => !i.category || !ids.has(i.category));
  });

  constructor() {
    this.meta.updateTag({ name: 'robots', content: 'noindex, nofollow' });
    if (this.api.signedIn()) this.load();
  }

  ngOnDestroy() {
    this.meta.removeTag('name="robots"');
  }

  // ---- template helpers ----
  val = (e: Event) => (e.target as HTMLInputElement).value;
  checked = (e: Event) => (e.target as HTMLInputElement).checked;
  noun = (l: ListName) => NOUN[l];
  text = (key: string) => String(this.draft()[key] ?? '');
  fields = (l: ListName) => FIELDS[l];
  money = money;
  count(l: ListName) {
    return this.data()?.[l].length ?? '';
  }
  menuName(rid?: string) {
    return this.data()?.superCategories.find((s) => s._rid === rid)?.name ?? 'no menu';
  }
  categoriesOf(superRid: string) {
    return this.data()?.categories.filter((c) => c.superCategory === superRid) ?? [];
  }

  private fail(e: unknown) {
    this.error.set(e instanceof AdminApiError ? e.message : 'Something went wrong.');
  }

  // ---- session ----
  async signIn(e: Event) {
    e.preventDefault();
    const input = (e.target as HTMLFormElement).elements.namedItem('password') as HTMLInputElement;
    this.busy.set(true);
    this.error.set('');
    try {
      await this.api.signIn(input.value);
      input.value = '';
      this.busy.set(false);
      await this.load();
    } catch (err) {
      this.fail(err);
    } finally {
      this.busy.set(false);
    }
  }

  signOut() {
    this.api.signOut();
    this.data.set(null);
    this.notice.set('');
    this.error.set('');
  }

  async load() {
    this.busy.set(true);
    this.error.set('');
    try {
      this.data.set(await this.api.loadMenu());
    } catch (e) {
      this.fail(e);
    } finally {
      this.busy.set(false);
    }
  }

  // ---- bulk move ----
  toggle(rid: string, on: boolean) {
    this.selected.update((s) => {
      const next = new Set(s);
      on ? next.add(rid) : next.delete(rid);
      return next;
    });
  }

  toggleGroup(items: ItemRow[], on: boolean) {
    this.selected.update((s) => {
      const next = new Set(s);
      for (const i of items) on ? next.add(i._rid) : next.delete(i._rid);
      return next;
    });
  }

  groupState(items: ItemRow[]): 'all' | 'some' | 'none' {
    const n = items.filter((i) => this.selected().has(i._rid)).length;
    return n === 0 ? 'none' : n === items.length ? 'all' : 'some';
  }

  clearSelection() {
    this.selected.set(new Set());
    this.moveTarget.set('');
  }

  async moveSelected() {
    const to = this.moveTarget();
    const ids = [...this.selected()];
    if (!to || !ids.length) return;
    const target = this.data()?.categories.find((c) => c._rid === to)?.name ?? 'the category';
    this.busy.set(true);
    this.error.set('');
    try {
      const r = await this.api.move('items', ids, to);
      this.clearSelection();
      const extra = r.alreadyThere ? ` (${r.alreadyThere} already there)` : '';
      this.notice.set(`Moved ${r.moved} ${r.moved === 1 ? 'item' : 'items'} to ${target}${extra}. The website shows the change within about a minute.`);
      await this.load();
    } catch (e) {
      this.fail(e);
      await this.load(); // show what did move if it stopped partway
    } finally {
      this.busy.set(false);
    }
  }

  // ---- editor ----
  openNew() {
    const list = this.tab();
    const rows = this.data()![list] as AnyRow[];
    const nextOrder = Math.max(0, ...rows.map((r) => r.sortOrder ?? 0)) + 10;
    const draft: Draft = { sortOrder: String(nextOrder), ...(list === 'items' ? { available: true } : { visible: true }) };
    if (list === 'categories' && this.menuFilter()) draft['superCategory'] = this.menuFilter();
    this.open(list, null, draft);
  }

  openEdit(list: ListName, row: AnyRow) {
    const draft: Draft = {};
    for (const f of FIELDS[list]) {
      const v = (row as unknown as Record<string, unknown>)[f.key];
      draft[f.key] = f.type === 'checkbox' ? v === true : v === undefined ? '' : String(v);
    }
    this.open(list, row, draft);
  }

  private open(list: ListName, row: AnyRow | null, draft: Draft) {
    this.editing.set({ list, row });
    this.draft.set(draft);
    this.formError.set('');
    this.confirmDelete.set(false);
    this.dialog().nativeElement.showModal();
  }

  closeEditor() {
    this.dialog().nativeElement.close();
  }

  closed() {
    this.editing.set(null);
  }

  setField(f: FieldDef, value: string | boolean) {
    this.draft.update((d) => ({ ...d, [f.key]: value }));
  }

  private saved(what: string) {
    this.notice.set(`${what} The website shows the change within about a minute.`);
    this.closeEditor();
    return this.load();
  }

  async save(e: Event) {
    e.preventDefault();
    const ed = this.editing();
    if (!ed) return;
    const d = this.draft();
    for (const f of FIELDS[ed.list]) {
      if (f.required && !String(d[f.key] ?? '').trim()) return this.formError.set(`${f.label} is required.`);
    }
    this.busy.set(true);
    this.formError.set('');
    try {
      if (ed.row) await this.api.update(ed.list, ed.row._rid, { ...d });
      else await this.api.create(ed.list, { ...d });
      this.error.set('');
      await this.saved(`Saved "${d['name']}".`);
    } catch (err) {
      this.formError.set(err instanceof AdminApiError ? err.message : 'Could not save.');
    } finally {
      this.busy.set(false);
    }
  }

  async remove() {
    const ed = this.editing();
    if (!ed?.row) return;
    if (!this.confirmDelete()) return this.confirmDelete.set(true);
    this.busy.set(true);
    try {
      await this.api.remove(ed.list, ed.row._rid);
      await this.saved(`Deleted "${ed.row.name}".`);
    } catch (err) {
      this.formError.set(err instanceof AdminApiError ? err.message : 'Could not delete.');
      this.confirmDelete.set(false);
    } finally {
      this.busy.set(false);
    }
  }
}
