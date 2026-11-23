import { Component, DOCUMENT, DestroyRef, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MENUS, MENU_FOOTNOTES, Menu, MenuItem } from '../menu-data';
import { SITE } from '../site-data';
import { Icon } from '../shared/icon';

/**
 * Text menu (readable on phones, searchable, accessible) with the original
 * printed menu images still available in a viewer.
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
          @for (m of menus; track m.id) {
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
        <div>
          <button type="button" class="printed-link" (click)="openPrinted()">
            <app-icon name="image" [size]="18" /> View the printed menu
          </button>
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
            @for (item of s.items; track item.name) {
              <li class="item">
                <div class="line">
                  <h3>
                    {{ item.name }}
                    @if (item.qty) {
                      <span class="qty">({{ item.qty }})</span>
                    }
                  </h3>
                  @if (item.price) {
                    <span class="price">\${{ item.price }}</span>
                  }
                </div>
                @if (item.desc) {
                  <p class="desc">{{ item.desc }}</p>
                }
                @if (item.prices) {
                  <ul class="variants">
                    @for (v of item.prices; track v.label) {
                      <li><span>{{ v.label }}</span><span class="price">\${{ v.price }}</span></li>
                    }
                  </ul>
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

    <!-- Printed menu viewer -->
    <dialog #printed class="viewer" aria-labelledby="viewer-title" (click)="onDialogClick($event)" (close)="viewerOpen.set(false)">
      <div class="viewer-bar">
        <h2 id="viewer-title">{{ active().label }} — printed menu</h2>
        <button type="button" class="close" aria-label="Close" (click)="printed.close()">
          <app-icon name="close" [size]="22" />
        </button>
      </div>
      <div class="viewer-body">
        @if (viewerOpen()) {
          @for (img of active().images; track img.src; let i = $index) {
            <figure>
              <img [src]="img.src" [alt]="img.alt" />
              <figcaption>
                @if (active().images.length > 1) {
                  Page {{ i + 1 }} of {{ active().images.length }} ·
                }
                <a [href]="img.src" target="_blank" rel="noopener">Open full size</a>
              </figcaption>
            </figure>
          }
        }
      </div>
    </dialog>
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
    .printed-link {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      margin-top: 18px;
      font: 700 16px var(--sans);
      color: var(--blue);
      background: none;
      border: 0;
      padding: 8px;
      min-height: 44px;
      cursor: pointer;
      text-decoration: underline;
      text-underline-offset: 3px;
    }
    .printed-link:hover {
      color: var(--blue-dark);
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
    .qty {
      font-weight: 400;
      color: var(--muted);
      font-size: 15px;
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
    .variants {
      list-style: none;
      margin: 6px 0 0;
      padding: 0;
      display: grid;
      gap: 2px;
      font-size: 15.5px;
    }
    .variants li {
      display: flex;
      justify-content: space-between;
      gap: 12px;
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

    /* Viewer */
    .viewer {
      width: min(920px, 100vw);
      max-width: 100vw;
      height: min(100dvh, 100vh);
      max-height: 100dvh;
      margin: 0 auto;
      padding: 0;
      border: 0;
      background: #2a2f38;
      color: #fff;
    }
    .viewer::backdrop {
      background: rgba(0, 0, 0, 0.75);
    }
    .viewer[open] {
      display: flex;
      flex-direction: column;
    }
    .viewer-bar {
      flex: none;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 10px 12px 10px 20px;
      background: #1d2129;
    }
    .viewer-bar h2 {
      color: #fff;
      font-size: 16px;
      font-weight: 700;
    }
    .viewer .close {
      background: none;
      border: 0;
      color: #fff;
      padding: 8px;
      cursor: pointer;
    }
    .viewer-body {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: grid;
      gap: 20px;
      align-content: start;
    }
    figure {
      margin: 0;
    }
    figure img {
      width: 100%;
      background: #fff;
    }
    figcaption {
      margin-top: 8px;
      font-size: 14px;
      text-align: center;
      color: rgba(255, 255, 255, 0.8);
    }
    figcaption a {
      color: #fff;
      text-decoration: underline;
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
      .printed-link {
        margin-top: 10px;
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
  readonly menus = MENUS;
  readonly footnotes = MENU_FOOTNOTES;
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('printed');

  private readonly activeId = signal(this.route.snapshot.queryParamMap.get('m') ?? MENUS[0].id);
  readonly active = computed(() => this.menus.find((m) => m.id === this.activeId()) ?? this.menus[0]);
  readonly viewerOpen = signal(false);

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
    script.textContent = JSON.stringify(menuJsonLd());
    inject(DestroyRef).onDestroy(() => doc.getElementById('menu-jsonld')?.remove());
  }

  select(m: Menu) {
    this.activeId.set(m.id);
    this.router.navigate([], {
      queryParams: { m: m.id === MENUS[0].id ? null : m.id },
      replaceUrl: true,
    });
  }

  jump(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  openPrinted() {
    this.viewerOpen.set(true);
    this.dialog().nativeElement.showModal();
  }

  /** Clicking the dark backdrop (outside the dialog box) closes it. */
  onDialogClick(e: MouseEvent) {
    if (e.target === this.dialog().nativeElement) this.dialog().nativeElement.close();
  }
}

function menuJsonLd() {
  const offers = (item: MenuItem) =>
    item.prices
      ? item.prices.map((p) => ({ '@type': 'Offer', name: p.label, price: p.price, priceCurrency: 'USD' }))
      : item.price
        ? { '@type': 'Offer', price: item.price, priceCurrency: 'USD' }
        : undefined;
  return {
    '@context': 'https://schema.org',
    '@type': 'Menu',
    name: 'Safir Mediterranean Menu',
    inLanguage: 'en',
    hasMenuSection: MENUS.map((m) => ({
      '@type': 'MenuSection',
      name: m.label,
      description: m.note,
      hasMenuSection: m.sections.map((s) => ({
        '@type': 'MenuSection',
        name: s.title,
        description: s.note,
        hasMenuItem: s.items.map((i) => ({
          '@type': 'MenuItem',
          name: i.qty ? `${i.name} (${i.qty})` : i.name,
          description: i.desc,
          offers: offers(i),
        })),
      })),
    })),
  };
}
