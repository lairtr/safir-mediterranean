import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SITE } from '../site-data';
import { HeroSlider } from './hero-slider';

@Component({
  selector: 'app-home',
  imports: [RouterLink, HeroSlider],
  template: `
    <app-hero-slider />

    <section class="tagline">
      <div class="container">
        <h1 class="script">{{ site.tagline }}</h1>
      </div>
    </section>

    <section id="about-us" class="card-section">
      <div class="container">
        <div class="card">
          <h2 class="script">{{ home.about.title }}</h2>
          <p>{{ home.about.text }}</p>
        </div>
      </div>
    </section>

    <div class="band notch-top" [style.background-image]="'url(' + home.band1 + ')'" role="img" aria-label="Grilled octopus"></div>

    <section class="card-section tall">
      <div class="container">
        <div class="card wide">
          <h2 class="script">{{ home.irresistible.title }}</h2>
          <p>{{ home.irresistible.text }}</p>
        </div>
      </div>
    </section>

    <div class="band notch-top" [style.background-image]="'url(' + home.band2 + ')'" role="img" aria-label="Greek salad"></div>

    <section class="card-section menu-section">
      <div class="container">
        <div class="card">
          <h2 class="script">{{ home.menu.title }}</h2>
          <p>{{ home.menu.text }}</p>
          <a class="btn" routerLink="/menu">View Menu</a>
        </div>
      </div>
    </section>
  `,
  styles: `
    .tagline {
      padding: 40px 0 0;
      text-align: center;
    }
    h1 {
      font-size: 67px;
      font-weight: 900;
      line-height: 1.25;
      color: var(--red-bright);
    }

    .card-section {
      padding-top: 70px;
    }
    .card-section.tall {
      padding-top: 70px;
    }
    .menu-section {
      padding-bottom: 80px;
    }
    .card {
      width: 450px;
      max-width: 100%;
      margin-left: auto;
      margin-right: 70px;
      background: #fff;
      padding: 40px 36px 46px;
      text-align: center;
      box-shadow: 0 0 30px rgba(0, 0, 0, 0.1);
      position: relative;
      z-index: 3;
    }
    .card.wide {
      width: 560px;
    }
    .card h2 {
      font-size: 50px;
      line-height: 1.2;
      color: var(--red);
      margin-bottom: 26px;
    }
    .card p {
      margin: 0;
      font-size: 14px;
      font-weight: 700;
      line-height: 1.95;
      color: #222;
    }
    .btn {
      display: inline-block;
      margin-top: 26px;
      background: var(--blue);
      color: #fff;
      font-size: 15px;
      font-weight: 700;
      padding: 12px 30px;
      border-radius: 3px;
      transition: background 0.2s;
    }
    .btn:hover {
      background: var(--blue-dark);
    }

    .band {
      height: 461px;
      background-size: cover;
      background-position: center;
      background-color: #000;
    }

    @media (max-width: 1024px) {
      h1 {
        font-size: 48px;
      }
      .card,
      .card.wide {
        margin: 0 auto;
      }
      .band {
        height: 340px;
      }
    }
    @media (max-width: 600px) {
      h1 {
        font-size: 36px;
      }
      .card h2 {
        font-size: 40px;
      }
      .card {
        padding: 30px 22px 36px;
      }
      .band {
        height: 260px;
      }
    }
  `,
})
export class Home {
  readonly site = SITE;
  readonly home = SITE.home;
}
