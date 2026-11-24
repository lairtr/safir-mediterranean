import { Injectable, computed, signal } from '@angular/core';
import { API_CONFIGURED, API_URL } from '../../api-config';

const SESSION_KEY = 'safir-admin-session';

/** Rows as the admin API returns them (all rows, including hidden ones). */
interface RowBase {
  /** Airtable record id */
  _rid: string;
  name: string;
  description?: string;
  sortOrder?: number;
  visible: boolean;
}
export interface SuperCategoryRow extends RowBase {
  childCount: number;
}
export interface CategoryRow extends RowBase {
  /** Record id of its super-category */
  superCategory?: string;
  childCount: number;
}
export interface ItemRow extends Omit<RowBase, 'visible'> {
  /** Record id of its category */
  category?: string;
  price?: number;
  available: boolean;
}
export type ListName = 'superCategories' | 'categories' | 'items';
export interface AdminMenuData {
  superCategories: SuperCategoryRow[];
  categories: CategoryRow[];
  items: ItemRow[];
}

export class AdminApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

@Injectable({ providedIn: 'root' })
export class AdminApi {
  // sessionStorage: the login ends when the browser tab is closed.
  private readonly token = signal<string | null>(
    typeof sessionStorage === 'undefined' ? null : sessionStorage.getItem(SESSION_KEY),
  );
  readonly signedIn = computed(() => !!this.token());
  readonly configured = API_CONFIGURED;

  private async call<T>(method: string, path: string, body?: unknown): Promise<T> {
    let res: Response;
    try {
      res = await fetch(API_URL + path, {
        method,
        headers: {
          ...(body !== undefined && { 'Content-Type': 'application/json' }),
          ...(this.token() && { Authorization: `Bearer ${this.token()}` }),
        },
        body: body === undefined ? undefined : JSON.stringify(body),
        cache: 'no-store',
      });
    } catch {
      throw new AdminApiError('Could not reach the admin service. Check your connection.', 0);
    }
    const data = await res.json().catch(() => ({}));
    if (res.status === 401 && path !== '/login') this.signOut();
    if (!res.ok) throw new AdminApiError(data.error || `Request failed (${res.status})`, res.status);
    return data as T;
  }

  async signIn(password: string) {
    const { token } = await this.call<{ token: string }>('POST', '/login', { password });
    sessionStorage.setItem(SESSION_KEY, token);
    this.token.set(token);
  }

  signOut() {
    sessionStorage.removeItem(SESSION_KEY);
    this.token.set(null);
  }

  loadMenu() {
    return this.call<AdminMenuData>('GET', '/admin/menu');
  }
  create(list: ListName, record: Record<string, unknown>) {
    return this.call<unknown>('POST', `/records/${list}`, record);
  }
  update(list: ListName, rid: string, record: Record<string, unknown>) {
    return this.call<unknown>('PATCH', `/records/${list}/${rid}`, record);
  }
  remove(list: ListName, rid: string) {
    return this.call<{ deleted: string }>('DELETE', `/records/${list}/${rid}`);
  }
}
