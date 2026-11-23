import { Component, computed, signal } from '@angular/core';
import { SITE } from '../site-data';

@Component({
  selector: 'app-menu-page',
  template: `
    <div class="page">
      <h1>Our Menu</h1>
      <p class="subtitle">Discover the flavors of Safir Mediterranean</p>

      <div class="tabs" role="tablist">
        @for (menu of menus; track menu.id) {
          <button
            type="button"
            role="tab"
            [id]="'tab-' + menu.id"
            [class.active]="menu.id === activeId()"
            [attr.aria-selected]="menu.id === activeId()"
            [attr.aria-controls]="'panel-' + menu.id"
            (click)="activeId.set(menu.id)"
          >
            {{ menu.label }}
          </button>
        }
      </div>

      <div class="panel" role="tabpanel" [id]="'panel-' + active().id" [attr.aria-labelledby]="'tab-' + active().id">
        @for (img of active().images; track img.src) {
          <img [src]="img.src" [alt]="img.alt" loading="lazy" />
        }
      </div>
    </div>
  `,
  styles: `
    .page {
      max-width: 900px;
      margin: 0 auto;
      padding: 50px 20px 80px;
      text-align: center;
    }
    h1 {
      font-size: 44px;
      font-weight: 700;
      color: var(--menu-blue);
      line-height: 1.2;
    }
    .subtitle {
      margin: 8px 0 30px;
      color: #666;
      font-size: 16px;
    }
    .tabs {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 10px;
      margin-bottom: 30px;
    }
    .tabs button {
      font: 700 15px var(--sans);
      padding: 10px 22px;
      border-radius: 4px;
      border: 2px solid var(--menu-blue);
      background: #fff;
      color: var(--menu-blue);
      cursor: pointer;
      transition: background 0.2s, color 0.2s;
    }
    .tabs button.active,
    .tabs button:hover {
      background: var(--menu-blue);
      color: #fff;
    }
    .panel {
      display: flex;
      flex-direction: column;
      gap: 24px;
      align-items: center;
    }
    .panel img {
      width: 100%;
      max-width: 850px;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
    }
    @media (max-width: 600px) {
      h1 {
        font-size: 34px;
      }
      .tabs button {
        flex: 1 1 100%;
      }
    }
  `,
})
export class MenuPage {
  readonly menus = SITE.menus;
  readonly activeId = signal<string>(SITE.menus[0].id);
  readonly active = computed(() => this.menus.find((m) => m.id === this.activeId()) ?? this.menus[0]);
}
