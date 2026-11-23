import { Component, HostListener, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SITE } from '../site-data';
import { Icon } from '../shared/icon';

@Component({
  selector: 'app-header',
  imports: [RouterLink, NgTemplateOutlet, Icon],
  template: `
    <!-- Blue info bar -->
    <div class="topbar">
      <div class="container topbar-inner">
        <div class="topbar-info">
          <a [href]="site.address.mapsUrl" target="_blank" rel="noopener">
            <app-icon name="pin" [size]="13" /> {{ site.address.short }}
          </a>
          <a [href]="site.phone.tel"><app-icon name="phone" [size]="13" /> {{ site.phone.short }}</a>
        </div>
        <a [href]="site.instagram" target="_blank" rel="noopener" aria-label="Instagram">
          <app-icon name="instagram" [size]="13" />
        </a>
      </div>
    </div>

    <!-- Main header -->
    <header class="main-header">
      <div class="container bar">
        <a routerLink="/" class="logo" aria-label="Safir Mediterranean home">
          <img [src]="site.logo" alt="Safir Mediterranean" width="172" height="82" />
        </a>
        <ng-container *ngTemplateOutlet="actions" />
      </div>
    </header>

    <!-- Compact sticky header that slides in on scroll -->
    <div class="sticky" [class.visible]="scrolled()" [attr.aria-hidden]="!scrolled()">
      <div class="container bar">
        <a routerLink="/" class="logo" [attr.tabindex]="scrolled() ? null : -1">
          <img [src]="site.logo" alt="Safir Mediterranean" width="100" height="48" />
        </a>
        <ng-container *ngTemplateOutlet="actions" />
      </div>
    </div>

    <ng-template #actions>
      <div class="actions">
        <a class="btn-catering" [href]="site.cateringUrl" target="_blank" rel="noopener">Order Catering</a>
        <a class="btn-order" routerLink="/order-online">Order Online</a>
      </div>
      <button type="button" class="hamburger" aria-label="Open menu" (click)="menuOpen.set(true)">
        <app-icon name="menu" [size]="28" />
      </button>
    </ng-template>

    <!-- Off-canvas mobile menu -->
    <div class="overlay" [class.open]="menuOpen()" (click)="close()"></div>
    <nav class="offcanvas" [class.open]="menuOpen()" aria-label="Main menu" [attr.aria-hidden]="!menuOpen()">
      <button type="button" class="close" aria-label="Close menu" (click)="close()">
        <app-icon name="close" [size]="22" />
      </button>
      <a routerLink="/" (click)="close()">Home</a>
      <a routerLink="/" fragment="about-us" (click)="close()">About Us</a>
      <a routerLink="/menu" (click)="close()">Menu</a>
      <a [routerLink]="[]" fragment="contact-us" (click)="close()">Contact Us</a>
      <a routerLink="/order-online" (click)="close()">Order Online</a>
      <a [href]="site.cateringUrl" target="_blank" rel="noopener" (click)="close()">Order Catering</a>
    </nav>
  `,
  styles: `
    .topbar {
      background: var(--blue);
      color: #fff;
      font-size: 12px;
      font-weight: 700;
      height: 32px;
    }
    .topbar-inner {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .topbar-info {
      display: flex;
      gap: 26px;
    }
    .topbar a {
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    .topbar a:hover {
      opacity: 0.85;
    }

    .main-header {
      background: #fff;
      height: 142px;
    }
    .bar {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .main-header .logo img {
      width: 172px;
    }

    .sticky {
      position: fixed;
      inset: 0 0 auto 0;
      height: 83px;
      background: rgba(255, 255, 255, 0.93);
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
      z-index: 50;
      transform: translateY(-100%);
      transition: transform 0.35s ease;
    }
    .sticky.visible {
      transform: translateY(0);
    }
    .sticky .logo img {
      width: 100px;
    }

    .actions {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .btn-catering,
    .btn-order {
      font-size: 15px;
      font-weight: 700;
      padding: 10px 22px;
      border-radius: 3px;
      transition: background 0.2s, color 0.2s;
    }
    .btn-catering {
      color: var(--red);
    }
    .btn-catering:hover {
      color: var(--blue);
    }
    .btn-order {
      color: var(--blue);
      border: 1px solid var(--blue);
    }
    .btn-order:hover {
      background: var(--blue);
      color: #fff;
    }

    .hamburger {
      display: none;
      background: none;
      border: 0;
      padding: 6px;
      color: var(--blue);
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
    .offcanvas {
      position: fixed;
      top: 0;
      right: 0;
      height: 100%;
      width: 300px;
      max-width: 85vw;
      background: var(--blue);
      padding: 70px 0 30px;
      display: flex;
      flex-direction: column;
      transform: translateX(100%);
      transition: transform 0.35s ease;
      z-index: 100;
    }
    .offcanvas.open {
      transform: translateX(0);
    }
    .offcanvas a {
      color: #fff;
      font-weight: 700;
      font-size: 16px;
      padding: 13px 30px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.12);
    }
    .offcanvas a:hover {
      background: var(--blue-dark);
    }
    .offcanvas .close {
      position: absolute;
      top: 18px;
      right: 18px;
      background: none;
      border: 0;
      color: #fff;
      cursor: pointer;
    }

    @media (max-width: 1024px) {
      .actions {
        display: none;
      }
      .hamburger {
        display: block;
      }
      .main-header {
        height: 100px;
      }
      .main-header .logo img {
        width: 140px;
      }
      .sticky {
        height: 64px;
      }
      .sticky .logo img {
        width: 90px;
      }
    }
    @media (max-width: 600px) {
      .topbar {
        font-size: 11px;
      }
      .topbar-info {
        gap: 14px;
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
    this.scrolled.set(window.scrollY > 180);
  }

  @HostListener('document:keydown.escape')
  close() {
    this.menuOpen.set(false);
  }
}
