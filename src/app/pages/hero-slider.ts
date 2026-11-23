import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { SITE } from '../site-data';

/** Full-width crossfading photo slider with the white logo on top. */
@Component({
  selector: 'app-hero-slider',
  template: `
    <section class="hero" aria-label="Photos of Safir Mediterranean">
      @for (slide of slides; track slide.src; let i = $index) {
        <div
          class="slide"
          [class.active]="i === current()"
          [style.background-image]="'url(' + slide.src + ')'"
          role="img"
          [attr.aria-label]="slide.alt"
          [attr.aria-hidden]="i !== current()"
        ></div>
      }
      <img class="logo" [src]="logoWhite" alt="Safir Mediterranean" width="301" height="144" />
    </section>
  `,
  styles: `
    .hero {
      position: relative;
      height: 768px;
      overflow: hidden;
      background: #222;
    }
    .slide {
      position: absolute;
      inset: 0;
      background-size: cover;
      background-position: center;
      opacity: 0;
      transition: opacity 1.2s ease;
    }
    .slide::after {
      content: '';
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.12);
    }
    .slide.active {
      opacity: 1;
      animation: kenburns 7s ease-out forwards;
    }
    @keyframes kenburns {
      from {
        transform: scale(1);
      }
      to {
        transform: scale(1.07);
      }
    }
    .logo {
      position: absolute;
      left: 50%;
      top: 62%;
      transform: translate(-50%, -50%);
      width: 400px;
      max-width: 60vw;
      z-index: 2;
      filter: drop-shadow(0 2px 10px rgba(0, 0, 0, 0.35));
    }
    @media (max-width: 1024px) {
      .hero {
        height: 60vw;
        min-height: 320px;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .slide.active {
        animation: none;
      }
    }
  `,
})
export class HeroSlider implements OnInit, OnDestroy {
  readonly slides = SITE.heroSlides;
  readonly logoWhite = SITE.logoWhite;
  readonly current = signal(0);
  private timer?: ReturnType<typeof setInterval>;

  ngOnInit() {
    this.timer = setInterval(
      () => this.current.update((i) => (i + 1) % this.slides.length),
      6000,
    );
  }

  ngOnDestroy() {
    clearInterval(this.timer);
  }
}
