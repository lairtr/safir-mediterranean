import { Component, HostListener, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SITE } from '../site-data';
import { Icon } from '../shared/icon';
import { OpenStatus } from '../shared/open-status';

/**
 * Always-visible (sticky) header. The two things restaurant visitors look
 * for first — the menu and online ordering — are real buttons at every
 * screen size, never hidden in the hamburger.
 */
@Component({
  selector: 'app-header',
  imports: [RouterLink, Icon, OpenStatus],
  template: `
    <a class="skip" href="#main">Skip to content</a>

    <!-- Info bar: desktop/tablet only (on phones this info is in the hero and the drawer) -->
    <div class="infobar">
      <div class="container infobar-inner">
        <a [href]="site.address.mapsUrl" target="_blank" rel="noopener">
          <app-icon name="pin" [size]="15" /> {{ site.address.short }}
        </a>
        <app-open-status />
        <a [href]="site.phone.tel"><app-icon name="phone" [size]="15" /> {{ site.phone.display }}</a>
        <a class="ig" [href]="site.instagram" target="_blank" rel="noopener" aria-label="Instagram">
          <app-icon name="instagram" [size]="16" />
        </a>
      </div>
    </div>

    <header class="header" [class.scrolled]="scrolled()">
      <div class="container bar">
        <a routerLink="/" class="logo" aria-label="Safir Mediterranean home">
          <img [src]="site.logo" alt="Safir Mediterranean" width="301" height="144" />
        </a>

        <nav class="nav" aria-label="Main">
          <a routerLink="/" fragment="contact-us">Visit</a>
          <a [href]="site.cateringUrl" target="_blank" rel="noopener">Catering</a>
        </nav>

        <div class="ctas">
          <a class="btn btn-outline" routerLink="/menu">Menu</a>
          <a class="btn btn-primary" routerLink="/order-online">
            <span class="long">Order Online</span><span class="short">Order</span>
          </a>
          <button type="button" class="hamburger" aria-label="Open menu" [attr.aria-expanded]="menuOpen()" (click)="menuOpen.set(true)">
            <app-icon name="menu" [size]="26" />
          </button>
        </div>
      </div>
    </header>

    <!-- Drawer for secondary links (phones/tablets) -->
    <div class="overlay" [class.open]="menuOpen()" (click)="close()"></div>
    <nav class="drawer" [class.open]="menuOpen()" aria-label="More" [attr.aria-hidden]="!menuOpen()" [attr.inert]="menuOpen() ? null : ''">
      <button type="button" class="close" aria-label="Close menu" (click)="close()">
        <app-icon name="close" [size]="22" />
      </button>
      <a routerLink="/" (click)="close()">Home</a>
      <a routerLink="/menu" (click)="close()">Menu</a>
      <a routerLink="/order-online" (click)="close()">Order Online</a>
      <a [href]="site.cateringUrl" target="_blank" rel="noopener" (click)="close()">Order Catering</a>
      <div class="drawer-info">
        <a [href]="site.phone.tel"><app-icon name="phone" [size]="16" /> {{ site.phone.display }}</a>
        <a [href]="site.address.mapsUrl" target="_blank" rel="noopener"><app-icon name="pin" [size]="16" /> {{ site.address.short }}</a>
        <app-open-status />
        <a [href]="site.instagram" target="_blank" rel="noopener"><app-icon name="instagram" [size]="16" /> Instagram</a>
      </div>
    </nav>
  `,
  styles: `
    :host {
      display: contents;
    }
    .skip {
      position: absolute;
      left: -9999px;
      top: 0;
      z-index: 200;
      background: #fff;
      padding: 10px 16px;
    }
    .skip:focus {
      left: 10px;
    }

    .infobar {
      background: var(--blue-dark);
      color: #fff;
      font-size: 14px;
      font-weight: 700;
    }
    .infobar-inner {
      height: 38px;
      display: flex;
      align-items: center;
      gap: 28px;
    }
    .infobar a,
    .infobar span {
      display: inline-flex;
      align-items: center;
      gap: 7px;
    }
    .infobar a {
      padding: 6px 0; /* 24px+ tap target */
    }
    .infobar a:hover {
      text-decoration: underline;
    }
    .infobar .ig {
      margin-left: auto;
    }

    .header {
      position: sticky;
      top: 0;
      z-index: 50;
      background: #fff;
      border-bottom: 1px solid transparent;
      transition: box-shadow 0.2s, border-color 0.2s;
    }
    .header.scrolled {
      box-shadow: 0 2px 16px rgba(0, 0, 0, 0.08);
      border-color: #eee;
    }
    .bar {
      height: 84px;
      display: flex;
      align-items: center;
      gap: 32px;
    }
    .logo img {
      width: 140px;
    }
    .nav {
      display: flex;
      gap: 28px;
      margin-left: 12px;
    }
    .nav a {
      font-weight: 700;
      font-size: 16px;
      color: var(--ink);
      padding: 6px 0;
      border-bottom: 2px solid transparent;
    }
    .nav a:hover,
    .nav a.active {
      color: var(--blue);
      border-color: var(--blue);
    }
    .ctas {
      margin-left: auto;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .short {
      display: none;
    }
    .hamburger {
      display: none;
      background: none;
      border: 0;
      padding: 8px;
      margin-right: -8px;
      color: var(--ink);
      cursor: pointer;
    }

    .overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.3s;
      z-index: 90;
    }
    .overlay.open {
      opacity: 1;
      visibility: visible;
    }
    .drawer {
      position: fixed;
      top: 0;
      right: 0;
      height: 100%;
      width: 320px;
      max-width: 88vw;
      background: var(--blue);
      padding: 70px 0 30px;
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      transform: translateX(100%);
      transition: transform 0.3s ease;
      z-index: 100;
    }
    .drawer.open {
      transform: translateX(0);
    }
    .drawer > a {
      color: #fff;
      font-weight: 700;
      font-size: 18px;
      padding: 14px 28px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.14);
    }
    .drawer > a:hover {
      background: var(--blue-dark);
    }
    .drawer .close {
      position: absolute;
      top: 18px;
      right: 18px;
      background: none;
      border: 0;
      color: #fff;
      cursor: pointer;
      padding: 6px;
    }
    .drawer-info {
      display: flex;
      flex-direction: column;
      gap: 14px;
      padding: 26px 28px 0;
      color: #fff;
      font-size: 15px;
    }
    .drawer-info a,
    .drawer-info span {
      display: inline-flex;
      align-items: center;
      gap: 10px;
    }

    @media (max-width: 1024px) {
      .nav {
        display: none;
      }
      .hamburger {
        display: block;
      }
    }
    @media (max-width: 767px) {
      .infobar {
        display: none;
      }
      .bar {
        height: 64px;
        gap: 8px;
      }
      .logo img {
        width: 104px;
      }
      .ctas {
        gap: 6px;
      }
      .ctas .btn {
        padding: 10px 14px;
        font-size: 15px;
      }
      .long {
        display: none;
      }
      .short {
        display: inline;
      }
    }
    @media (max-width: 359px) {
      .logo img {
        width: 86px;
      }
      .ctas .btn {
        padding: 9px 10px;
        font-size: 14px;
      }
    }
  `,
})
export class Header {
  readonly site = SITE;
  readonly scrolled = signal(false);
  readonly menuOpen = signal(false);

  @HostListener('window:scroll')
  onScroll() {
    this.scrolled.set(window.scrollY > 10);
  }

  @HostListener('document:keydown.escape')
  close() {
    this.menuOpen.set(false);
  }
}
