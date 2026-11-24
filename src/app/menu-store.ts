import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { API_CONFIGURED, API_URL } from './api-config';
import { MENUS, Menu, MenuData, buildMenus } from './menu-data';

/**
 * The menus shown on the site. Starts with the built-in snapshot (so the
 * prerendered page and slow connections always have a menu), then swaps in
 * the live menu from Airtable, so price changes appear without a redeploy.
 */
@Injectable({ providedIn: 'root' })
export class MenuStore {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  readonly menus = signal<Menu[]>(MENUS);
  readonly live = signal(false);
  private loading?: Promise<void>;

  /** Loads the live menu once per visit; later calls reuse it. */
  refresh(): Promise<void> {
    if (!this.isBrowser || !API_CONFIGURED) return Promise.resolve();
    return (this.loading ??= this.load());
  }

  private async load() {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 8000);
      const res = await fetch(`${API_URL}/public/menu`, { signal: ctrl.signal });
      clearTimeout(timer);
      if (!res.ok) throw new Error(String(res.status));
      const menus = buildMenus((await res.json()) as MenuData);
      // An empty or broken response keeps the built-in menu.
      if (menus.length && menus.some((m) => m.sections.some((s) => s.items.length))) {
        this.menus.set(menus);
        this.live.set(true);
      }
    } catch {
      this.loading = undefined; // try again on the next visit to the page
    }
  }
}
