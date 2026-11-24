import { Component, DOCUMENT, DestroyRef, afterNextRender, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MENU_FOOTNOTES, Menu, MenuItem, findMenuItem } from '../menu-data';
import { MenuStore } from '../menu-store';
import { SITE } from '../site-data';
import { Icon } from '../shared/icon';

/**
 * Text menu: readable on phones, searchable and accessible.
 * The selected menu is kept in the URL (?m=breakfast) so it can be shared.
 */
@Component({
  selector: 'app-menu-page',
  imports: [RouterLink, Icon],
  template: `
    <section class="intro">
      <div class="container">
        <h1 class="section-title">Our Menu</h1>
        <p class="section-sub">Turkish &amp; Mediterranean classics, made fresh in Long Island City.</p>

        <div class="tabs" role="tablist" aria-label="Menus">
          @for (m of menus(); track m.id) {
            <button
              type="button"
              role="tab"
              [id]="'tab-' + m.id"
              [class.active]="m.id === active().id"
              [attr.aria-selected]="m.id === active().id"
              aria-controls="menu-panel"
              (click)="select(m)"
            >
              <span class="long">{{ m.label }}</span><span class="short">{{ m.shortLabel }}</span>
            </button>
          }
        </div>
      </div>
    </section>

    <!-- Category bar: sticks under the header so any section is one tap away -->
    <nav class="cats" aria-label="Menu sections">
      <div class="container cats-inner">
        <ul>
          @for (s of active().sections; track s.id) {
            <li><button type="button" (click)="jump(s.id)">{{ s.title }}</button></li>
          }
        </ul>
      </div>
    </nav>

    <div id="menu-panel" class="container panel" role="tabpanel" [attr.aria-labelledby]="'tab-' + active().id">
      @if (active().note) {
        <p class="menu-note"><app-icon name="clock" [size]="16" /> {{ active().note }}</p>
      }

      @for (s of active().sections; track s.id) {
        <section class="sec" [id]="s.id" [attr.aria-labelledby]="s.id + '-title'">
          <h2 [id]="s.id + '-title'">{{ s.title }}</h2>
          @if (s.note) {
            <p class="sec-note">{{ s.note }}</p>
          }
          <ul class="items" [class.compact]="s.compact">
            @for (item of s.items; track item.id) {
              <li class="item" [id]="'item-' + item.anchor" [class.unavailable]="!item.available" [class.spotlight]="item.anchor === spotlight()">
                <div class="line">
                  <h3>{{ item.name }}</h3>
                  @if (item.price) {
                    <span class="price">\${{ item.price }}</span>
                  }
                </div>
                @if (item.desc) {
                  <p class="desc">{{ item.desc }}</p>
                }
                @if (!item.available) {
                  <p class="sold-out">Currently unavailable</p>
                }
              </li>
            }
          </ul>
        </section>
      }

      <div class="foot">
        @for (n of footnotes; track n) {
          <p>{{ n }}</p>
        }
      </div>

      <div class="cta">
        <h2 class="section-title">Hungry?</h2>
        <div class="cta-actions">
          <a class="btn btn-primary btn-lg" routerLink="/order-online">Order Online</a>
          <a class="btn btn-outline btn-lg" [href]="site.phone.tel"><app-icon name="phone" [size]="18" /> {{ site.phone.display }}</a>
        </div>
      </div>
    </div>

  `,
  styles: `
    .intro {
      padding: 56px 0 28px;
      text-align: center;
      background: var(--sand);
    }
    .tabs {
      display: inline-flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 6px;
      margin-top: 28px;
      padding: 6px;
      background: #fff;
      border-radius: 999px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
    }
    .tabs button {
      font: 700 16px var(--sans);
      padding: 10px 20px;
      min-height: 44px;
      border: 0;
      border-radius: 999px;
      background: transparent;
      color: var(--ink);
      cursor: pointer;
    }
    .tabs button.active {
      background: var(--blue);
      color: #fff;
    }
    .tabs button:not(.active):hover {
      background: var(--sand);
    }

    .cats {
      position: sticky;
      top: 84px;
      z-index: 40;
      background: #fff;
      border-bottom: 1px solid #e8e4de;
    }
    .cats-inner {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .cats ul {
      flex: 1;
      list-style: none;
      margin: 0;
      padding: 10px 0;
      display: flex;
      gap: 6px;
      overflow-x: auto;
      scrollbar-width: none;
      /* fade at the right edge hints that the bar scrolls sideways */
      -webkit-mask-image: linear-gradient(to right, #000 calc(100% - 40px), transparent);
      mask-image: linear-gradient(to right, #000 calc(100% - 40px), transparent);
      padding-right: 32px;
    }
    .cats ul::-webkit-scrollbar {
      display: none;
    }
    .cats li button {
      white-space: nowrap;
      font: 700 15px var(--sans);
      color: var(--ink);
      background: var(--sand);
      border: 0;
      border-radius: 999px;
      padding: 8px 14px;
      cursor: pointer;
    }
    .cats li button:hover {
      background: #ece5db;
    }
    .short {
      display: none;
    }

    .panel {
      max-width: 1100px;
      padding-top: 24px;
      padding-bottom: 80px;
    }
    .menu-note {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin: 16px 0 0;
      font-weight: 700;
      color: var(--red-cta);
    }
    .sec {
      padding-top: 40px;
      scroll-margin-top: 150px;
    }
    .sec > h2 {
      font-family: var(--script);
      font-size: 38px;
      color: var(--red);
      line-height: 1.2;
      padding-bottom: 10px;
      border-bottom: 2px solid #efe9e1;
    }
    .sec-note {
      margin: 12px 0 0;
      padding: 10px 14px;
      background: var(--sand);
      border-radius: 6px;
      font-size: 15px;
      font-weight: 700;
      color: var(--ink);
    }
    .items {
      list-style: none;
      margin: 0;
      padding: 0;
      display: grid;
      grid-template-columns: 1fr 1fr;
      column-gap: 56px;
    }
    .item {
      padding: 18px 0;
      border-bottom: 1px dashed #e6e0d8;
      scroll-margin-top: 170px;
    }
    /* Flash the dish someone tapped on the home page */
    .item.spotlight {
      animation: spotlight 2.6s ease-out;
      border-radius: 6px;
    }
    @keyframes spotlight {
      0%,
      45% {
        background: #fff1d6;
        box-shadow: 0 0 0 12px #fff1d6;
      }
      100% {
        background: transparent;
        box-shadow: 0 0 0 12px transparent;
      }
    }
    .items.compact .item {
      padding: 12px 0;
    }
    .line {
      display: flex;
      align-items: baseline;
      gap: 12px;
    }
    h3 {
      flex: 1;
      font-size: 18px;
      font-weight: 900;
      color: var(--ink);
      line-height: 1.3;
    }
    .items.compact h3 {
      font-size: 17px;
      font-weight: 700;
    }
    .price {
      font-weight: 900;
      color: var(--blue);
      white-space: nowrap;
      font-variant-numeric: tabular-nums;
    }
    .desc {
      margin: 4px 0 0;
      font-size: 15.5px;
      line-height: 1.5;
      color: var(--muted);
    }
    .unavailable h3,
    .unavailable .price {
      color: var(--muted);
    }
    .unavailable .price {
      text-decoration: line-through;
    }
    .sold-out {
      margin: 6px 0 0;
      font-size: 14px;
      font-weight: 700;
      color: var(--red-cta);
    }

    .foot {
      margin-top: 40px;
      font-size: 14px;
      color: var(--muted);
      text-align: center;
    }
    .foot p {
      margin: 4px 0;
    }
    .cta {
      margin-top: 48px;
      padding: 40px 20px;
      border-radius: var(--radius);
      background: var(--sand);
      text-align: center;
    }
    .cta-actions {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 12px;
      margin-top: 18px;
    }


    @media (max-width: 860px) {
      .items {
        grid-template-columns: 1fr;
      }
    }
    @media (max-width: 767px) {
      .intro {
        padding: 36px 0 20px;
      }
      .tabs {
        display: flex;
        border-radius: 12px;
      }
      .tabs button {
        flex: 1 1 auto;
        padding: 10px 12px;
        font-size: 15px;
        border-radius: 8px;
      }
      .cats {
        top: 64px;
      }
      .long {
        display: none;
      }
      .short {
        display: inline;
      }
      .item {
        scroll-margin-top: 140px;
      }
      .sec {
        padding-top: 28px;
        scroll-margin-top: 124px;
      }
      .sec > h2 {
        font-size: 32px;
      }
      .cta-actions .btn {
        width: 100%;
      }
    }
  `,
})
export class MenuPage {
  readonly site = SITE;
  private readonly store = inject(MenuStore);
  readonly menus = this.store.menus;
  readonly footnotes = MENU_FOOTNOTES;
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private readonly activeId = signal(this.route.snapshot.queryParamMap.get('m') ?? '');
  /** Item flashed after arriving from a home-page dish photo (?dish=…) */
  readonly spotlight = signal('');
  readonly active = computed(() => this.menus().find((m) => m.id === this.activeId()) ?? this.menus()[0]);

  constructor() {
    // Menu structured data (schema.org) so search engines can show dishes and
    // prices. Generated from menu-data.ts; written into the prerendered HTML.
    const doc = inject(DOCUMENT);
    let script = doc.getElementById('menu-jsonld') as HTMLScriptElement | null;
    if (!script) {
      script = doc.createElement('script');
      script.id = 'menu-jsonld';
      script.type = 'application/ld+json';
      doc.head.appendChild(script);
    }
    const jsonLd = script;
    // Kept in step with the live menu once it loads.
    effect(() => (jsonLd.textContent = JSON.stringify(menuJsonLd(this.menus()))));
    inject(DestroyRef).onDestroy(() => doc.getElementById('menu-jsonld')?.remove());

    // Swap in the live menu (current prices) once the page is in the browser.
    afterNextRender(() => {
      const dish = this.route.snapshot.queryParamMap.get('dish');
      const startedAt = Date.now();
      // Wait for the router's own scroll-to-top, then look the dish up by name.
      if (dish) setTimeout(() => this.showDish(dish), 120);
      this.store.refresh().then(() => {
        // Look it up again in the live menu: the item may be new, renamed,
        // moved or gone. Skip if it took too long or the visitor has
        // already scrolled away on their own.
        if (!dish || Date.now() - startedAt > 4000 || this.visitorScrolled) return;
        setTimeout(() => this.showDish(dish), 0);
      });
      if (dish) {
        // Only real input counts as "scrolled away": the live menu replacing
        // the built-in one also moves the page, and that shouldn't stop us.
        const stop = () => (this.visitorScrolled = true);
        const events = ['wheel', 'touchmove', 'keydown'] as const;
        for (const e of events) addEventListener(e, stop, { passive: true, once: true });
        this.destroyRef.onDestroy(() => events.forEach((e) => removeEventListener(e, stop)));
      }
    });
  }

  private readonly destroyRef = inject(DestroyRef);
  private visitorScrolled = false;
  private shownAnchor = '';

  /** Finds the dish in the current menu, switches tab, scrolls to it and flashes it. */
  private showDish(key: string) {
    const hit = findMenuItem(this.menus(), key);
    if (!hit) return;
    this.activeId.set(hit.menuId);
    requestAnimationFrame(() => {
      const el = document.getElementById('item-' + hit.anchor);
      if (!el) return;
      // Instant: a smooth scroll down a long menu is slow; the flash shows where you landed.
      el.scrollIntoView({ block: 'start', behavior: 'instant' });
      if (hit.anchor !== this.shownAnchor) {
        this.shownAnchor = hit.anchor;
        this.spotlight.set(hit.anchor);
        setTimeout(() => this.spotlight.set(''), 2700);
      }
    });
  }

  select(m: Menu) {
    this.activeId.set(m.id);
    this.router.navigate([], {
      queryParams: { m: m.id === this.menus()[0].id ? null : m.id },
      replaceUrl: true,
    });
  }

  jump(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

}

function menuJsonLd(menus: Menu[]) {
  const offers = (item: MenuItem) =>
    item.price
      ? {
          '@type': 'Offer',
          price: item.price,
          priceCurrency: 'USD',
          availability: `https://schema.org/${item.available ? 'InStock' : 'OutOfStock'}`,
        }
      : undefined;
  return {
    '@context': 'https://schema.org',
    '@type': 'Menu',
    name: 'Safir Mediterranean Menu',
    inLanguage: 'en',
    hasMenuSection: menus.map((m) => ({
      '@type': 'MenuSection',
      name: m.label,
      description: m.note,
      hasMenuSection: m.sections.map((s) => ({
        '@type': 'MenuSection',
        name: s.title,
        description: s.note,
        hasMenuItem: s.items.map((i) => ({
          '@type': 'MenuItem',
          name: i.name,
          description: i.desc,
          offers: offers(i),
        })),
      })),
    })),
  };
}
