import { Component, afterNextRender, signal } from '@angular/core';
import { SITE } from '../site-data';

/** Logo splash shown while the first page loads (as on the WordPress site). */
@Component({
  selector: 'app-preloader',
  template: `
    @if (visible()) {
      <div class="preloader" [class.fade]="fading()" aria-hidden="true">
        <img [src]="logo" alt="" width="300" height="144" />
      </div>
    }
  `,
  styles: `
    .preloader {
      position: fixed;
      inset: 0;
      background: #fff;
      display: grid;
      place-items: center;
      z-index: 1000;
      transition: opacity 0.5s ease;
    }
    .preloader.fade {
      opacity: 0;
    }
    img {
      width: 220px;
      animation: pulse 1.4s ease-in-out infinite;
    }
    @keyframes pulse {
      50% {
        transform: scale(0.94);
        opacity: 0.75;
      }
    }
  `,
})
export class Preloader {
  readonly logo = SITE.logo;
  readonly visible = signal(true);
  readonly fading = signal(false);

  constructor() {
    afterNextRender(() => {
      const hide = () => {
        this.fading.set(true);
        setTimeout(() => this.visible.set(false), 500);
      };
      if (document.readyState === 'complete') setTimeout(hide, 200);
      else window.addEventListener('load', hide, { once: true });
    });
  }
}
