import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SITE } from '../site-data';
import { Icon } from '../shared/icon';
import { OpenStatus } from '../shared/open-status';

/**
 * Hero: crossfading photo carousel (same photos as the original site) with
 * the headline, the two primary actions and key facts on top, so everything
 * a visitor needs first is visible without scrolling.
 */
@Component({
  selector: 'app-hero-slider',
  imports: [RouterLink, Icon, OpenStatus],
  template: `
    <section class="hero" aria-labelledby="hero-title">
      <div class="slides" aria-hidden="true">
        @for (slide of slides; track slide.src; let i = $index) {
          <img
            class="slide"
            [class.active]="i === current()"
            [src]="slide.src"
            [attr.srcset]="slide.srcset"
            sizes="100vw"
            [alt]="slide.alt"
            [style.object-position]="slide.position"
            [attr.fetchpriority]="i === 0 ? 'high' : null"
            [attr.loading]="i === 0 ? 'eager' : 'lazy'"
            decoding="async"
          />
        }
      </div>
      <div class="shade"></div>

      <div class="container content">
        <h1 id="hero-title" class="script">{{ site.tagline }}</h1>
        <p class="intro">{{ site.intro }}</p>
        <!-- Desktop: menu + order. On phones those live in the sticky header,
             so the hero offers the other two top mobile actions instead. -->
        <div class="actions wide-only">
          <a class="btn btn-light btn-lg" routerLink="/menu">View Menu</a>
          <a class="btn btn-primary btn-lg" routerLink="/order-online">Order Online</a>
        </div>
        <div class="actions phone-only">
          <a class="btn btn-light btn-lg" [href]="site.phone.tel"><app-icon name="phone" [size]="18" /> Call</a>
          <a class="btn btn-light btn-lg" [href]="site.address.mapsUrl" target="_blank" rel="noopener"><app-icon name="directions" [size]="18" /> Directions</a>
        </div>
        <ul class="facts">
          <li><app-open-status /></li>
          <li>
            <a [href]="site.address.mapsUrl" target="_blank" rel="noopener"><app-icon name="pin" [size]="16" /> {{ site.address.short }}</a>
          </li>
          <li class="wide-only">
            <a [href]="site.phone.tel"><app-icon name="phone" [size]="16" /> {{ site.phone.display }}</a>
          </li>
        </ul>
      </div>

      <button type="button" class="pause" (click)="toggle()" [attr.aria-label]="playing() ? 'Pause slideshow' : 'Play slideshow'">
        <app-icon [name]="playing() ? 'pause' : 'play'" [size]="14" />
      </button>
    </section>
  `,
  styles: `
    .hero {
      position: relative;
      height: clamp(540px, calc(100svh - 122px), 800px);
      overflow: hidden;
      background: #111;
      color: #fff;
      display: flex;
      align-items: flex-end;
    }
    .slides,
    .shade {
      position: absolute;
      inset: 0;
    }
    .slide {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      opacity: 0;
      transition: opacity 1.2s ease-in-out;
    }
    .slide.active {
      opacity: 1;
    }
    .shade {
      background:
        linear-gradient(to top, rgba(0, 0, 0, 0.78) 0%, rgba(0, 0, 0, 0.35) 45%, rgba(0, 0, 0, 0.12) 100%);
    }
    .content {
      position: relative;
      z-index: 2;
      padding-bottom: 64px;
    }
    h1 {
      color: #fff;
      font-size: clamp(44px, 6.4vw, 84px);
      line-height: 1.05;
      max-width: 20ch;
      text-shadow: 0 2px 18px rgba(0, 0, 0, 0.35);
    }
    .intro {
      margin: 14px 0 26px;
      font-size: clamp(18px, 2vw, 22px);
      font-weight: 700;
      max-width: 36ch;
    }
    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }
    .phone-only {
      display: none;
    }
    .facts {
      list-style: none;
      margin: 28px 0 0;
      padding: 0;
      display: flex;
      flex-wrap: wrap;
      gap: 10px 28px;
      font-size: 15px;
      font-weight: 700;
    }
    .facts li,
    .facts a {
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    .facts a:hover {
      text-decoration: underline;
    }
    .pause {
      position: absolute;
      right: 20px;
      bottom: 20px;
      z-index: 3;
      width: 34px;
      height: 34px;
      border-radius: 50%;
      border: 1px solid rgba(255, 255, 255, 0.6);
      background: rgba(0, 0, 0, 0.35);
      color: #fff;
      display: grid;
      place-items: center;
      cursor: pointer;
    }
    .pause:hover {
      background: rgba(0, 0, 0, 0.6);
    }

    @media (max-width: 767px) {
      .hero {
        height: auto;
        min-height: calc(100svh - 64px - 120px);
      }
      .content {
        padding-top: 120px;
        padding-bottom: 40px;
      }
      .intro {
        margin: 10px 0 20px;
      }
      .actions .btn {
        flex: 1 1 140px;
      }
      .actions.wide-only,
      .facts .wide-only {
        display: none;
      }
      .actions.phone-only {
        display: flex;
      }
      .facts {
        flex-direction: column;
        gap: 8px;
        margin-top: 22px;
      }
      .pause {
        top: 14px;
        bottom: auto;
        right: 14px;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .slide {
        transition: none;
      }
    }
  `,
})
export class HeroSlider implements OnInit, OnDestroy {
  readonly site = SITE;
  readonly slides = SITE.heroSlides;
  readonly current = signal(0);
  readonly playing = signal(true);
  private timer?: ReturnType<typeof setInterval>;

  ngOnInit() {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      this.playing.set(false);
      return;
    }
    this.start();
  }

  toggle() {
    if (this.playing()) {
      clearInterval(this.timer);
      this.playing.set(false);
    } else {
      this.playing.set(true);
      this.start();
    }
  }

  private start() {
    clearInterval(this.timer);
    this.timer = setInterval(() => this.current.update((i) => (i + 1) % this.slides.length), 6000);
  }

  ngOnDestroy() {
    clearInterval(this.timer);
  }
}
