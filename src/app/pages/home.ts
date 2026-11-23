import { Component, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { SITE } from '../site-data';
import { Icon } from '../shared/icon';
import { OpenStatus } from '../shared/open-status';
import { HeroSlider } from './hero-slider';
// import { JourneyMap } from '../shared/journey-map';

@Component({
  selector: 'app-home',
  imports: [RouterLink, HeroSlider, Icon, OpenStatus /* , JourneyMap */],
  template: `
    <app-hero-slider />

    <!-- Signature dishes: show the food, then send people to the menu -->
    <section class="dishes" aria-labelledby="dishes-title">
      <div class="container">
        <header class="head">
          <h2 id="dishes-title" class="section-title">{{ home.menu.title }}</h2>
          <p class="section-sub">{{ home.menu.text }}</p>
        </header>
        <ul class="grid">
          @for (dish of site.dishes; track dish.name) {
            <li>
              <a routerLink="/menu" class="dish">
                <img [src]="dish.src" [attr.srcset]="dish.srcset" sizes="(max-width: 767px) 50vw, 300px" [alt]="dish.name" loading="lazy" decoding="async" width="480" height="480" />
                <span>{{ dish.name }}</span>
              </a>
            </li>
          }
        </ul>
        <div class="center">
          <a class="btn btn-blue btn-lg" routerLink="/menu">See the Full Menu <app-icon name="arrow-right" [size]="18" /></a>
        </div>
      </div>
    </section>

    <!-- Istanbul ⇄ Long Island City map (commented out; uncomment this block,
         the JourneyMap import above and the .journey styles below to restore)
    <section class="journey" aria-labelledby="journey-title">
      <div class="container">
        <header class="head">
          <h2 id="journey-title" class="section-title light">{{ site.journey.title }}</h2>
          <p class="section-sub light">{{ site.journey.text }}</p>
        </header>
        <app-journey-map />
      </div>
    </section>
    -->

    <!-- Reviews (quoted word for word from Google) -->
    <section class="reviews" aria-labelledby="reviews-title">
      <div class="container">
        <header class="head">
          <h2 id="reviews-title" class="section-title">What Our Guests Say</h2>
          <a class="rating" [href]="site.reviews.googleUrl" target="_blank" rel="noopener">
            <app-icon name="google" [size]="22" />
            <strong>{{ site.reviews.rating }}</strong>
            <!-- grey stars with gold stars on top, clipped to the rating (4.6/5) -->
            <span class="stars" aria-hidden="true">
              <span class="stars-base">
                @for (i of [1, 2, 3, 4, 5]; track i) {
                  <app-icon name="star" [size]="18" />
                }
              </span>
              <span class="stars-fill" [style.width.%]="(site.reviews.rating / 5) * 100">
                @for (i of [1, 2, 3, 4, 5]; track i) {
                  <app-icon name="star" [size]="18" />
                }
              </span>
            </span>
            <span class="sr-only">out of 5 stars</span>
            <span class="on">on Google</span>
          </a>
        </header>
        <ul class="review-list">
          @for (r of site.reviews.items; track r.name) {
            <li>
              <figure class="review">
                <div class="review-stars" [attr.aria-label]="r.stars + ' out of 5 stars'" role="img">
                  @for (i of [1, 2, 3, 4, 5]; track i) {
                    <app-icon name="star" [size]="16" />
                  }
                </div>
                <blockquote>{{ r.text }}</blockquote>
                <figcaption>{{ r.name }} <span>· Google review</span></figcaption>
              </figure>
            </li>
          }
        </ul>
        <div class="center">
          <a class="btn btn-outline" [href]="site.reviews.googleUrl" target="_blank" rel="noopener">Read more reviews on Google</a>
        </div>
      </div>
    </section>

    <!-- Ordering -->
    <section class="order shape-top" aria-labelledby="order-title">
      <div class="container order-inner">
        <h2 id="order-title" class="section-title light">Order Delivery or Pickup</h2>
        <p class="section-sub light">Order on your favorite app or call us directly.</p>
        <ul class="partners">
          @for (p of site.deliveryPartners; track p.name) {
            <li>
              <a [href]="p.url" target="_blank" rel="noopener" [attr.aria-label]="'Order on ' + p.name">
                <img [src]="p.logo" [alt]="p.name" loading="lazy" />
              </a>
            </li>
          }
        </ul>
        <div class="order-actions">
          <a class="btn btn-light btn-lg" [href]="site.phone.tel"><app-icon name="phone" [size]="18" /> Call {{ site.phone.display }}</a>
          <a class="btn btn-ghost btn-lg" [href]="site.cateringUrl" target="_blank" rel="noopener">Catering via ezCater</a>
        </div>
      </div>
    </section>

    <!-- Visit -->
    <section id="contact-us" class="visit" aria-labelledby="visit-title">
      <div class="container visit-inner">
        <div class="visit-info">
          <h2 id="visit-title" class="section-title">Visit Us</h2>
          <dl>
            <div>
              <dt><app-icon name="clock" [size]="18" /> Hours</dt>
              <dd>{{ site.hours }}<br /><app-open-status [showHours]="false" /></dd>
            </div>
            <div>
              <dt><app-icon name="pin" [size]="18" /> Address</dt>
              <dd>{{ site.address.line1 }}<br />Long Island City, NY 11101</dd>
            </div>
            <div>
              <dt><app-icon name="phone" [size]="18" /> Phone</dt>
              <dd><a [href]="site.phone.tel">{{ site.phone.display }}</a></dd>
            </div>
          </dl>
          <div class="visit-actions">
            <a class="btn btn-blue" [href]="site.address.mapsUrl" target="_blank" rel="noopener">Get Directions</a>
            <a class="btn btn-outline" [href]="site.phone.tel">Call Us</a>
          </div>
        </div>
        <iframe
          class="map"
          [src]="mapUrl"
          title="Map showing Safir Mediterranean at 47-31 Vernon Blvd, Long Island City"
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
    </section>
  `,
  styles: `
    .head {
      text-align: center;
      max-width: 720px;
      margin: 0 auto 40px;
    }
    .center {
      text-align: center;
      margin-top: 40px;
    }

    .light {
      color: #fff;
    }
    .section-sub.light {
      color: rgba(255, 255, 255, 0.85);
    }

    /* Dishes */
    .dishes {
      padding: 88px 0 96px;
    }
    .grid {
      list-style: none;
      margin: 0;
      padding: 0;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
    }
    .dish {
      display: block;
      border-radius: var(--radius);
      overflow: hidden;
      position: relative;
      background: #eee;
    }
    .dish img {
      width: 100%;
      aspect-ratio: 1;
      object-fit: cover;
      transition: transform 0.4s ease;
    }
    .dish:hover img {
      transform: scale(1.05);
    }
    .dish span {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      padding: 36px 16px 14px;
      background: linear-gradient(to top, rgba(0, 0, 0, 0.75), transparent);
      color: #fff;
      font-weight: 900;
      font-size: 18px;
    }

    /* Journey map (commented out)
    .journey {
      background: radial-gradient(ellipse at 50% 60%, #1d4a80 0%, #13325a 45%, #0b1f3a 100%);
      color: #fff;
      padding: 80px 0 56px;
      overflow: hidden;
    }
    .journey .head {
      max-width: 960px;
      margin-bottom: 8px;
    }
    .journey app-journey-map {
      max-width: 1100px;
      margin: 0 auto;
    }
    */

    /* Reviews */
    .reviews {
      background: var(--sand);
      padding: 88px 0 96px;
    }
    .rating {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      margin-top: 14px;
      padding: 8px 16px;
      background: #fff;
      border-radius: 999px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
      color: var(--ink);
      font-size: 17px;
    }
    .rating strong {
      font-size: 20px;
      font-weight: 900;
    }
    .rating:hover .on {
      text-decoration: underline;
    }
    .review-stars {
      display: inline-flex;
      color: #f5b301;
    }
    .stars {
      position: relative;
      display: inline-flex;
    }
    .stars-base {
      display: inline-flex;
      color: #d9d4cc;
    }
    .stars-fill {
      position: absolute;
      inset: 0 auto 0 0;
      display: inline-flex;
      overflow: hidden;
      white-space: nowrap;
      color: #f5b301;
    }
    .on {
      color: var(--muted);
    }
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip: rect(0 0 0 0);
      white-space: nowrap;
    }
    .review-list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
    }
    .review {
      margin: 0;
      height: 100%;
      display: flex;
      flex-direction: column;
      gap: 14px;
      padding: 28px;
      background: #fff;
      border-radius: var(--radius);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    }
    blockquote {
      flex: 1;
      margin: 0;
      font-size: 16.5px;
      line-height: 1.6;
      color: var(--ink);
    }
    blockquote::before {
      content: '“';
    }
    blockquote::after {
      content: '”';
    }
    figcaption {
      font-weight: 900;
      color: var(--ink);
    }
    figcaption span {
      font-weight: 400;
      color: var(--muted);
    }

    /* Order */
    .order {
      --shape-color: var(--sand);
      background: var(--blue);
      color: #fff;
      padding: 100px 0 96px;
      text-align: center;
    }

    .partners {
      list-style: none;
      margin: 40px auto 0;
      padding: 0;
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 16px;
      max-width: 1000px;
    }
    .partners a {
      display: grid;
      place-items: center;
      width: 172px;
      height: 92px;
      padding: 14px 18px;
      background: #fff;
      border-radius: var(--radius);
      transition: transform 0.15s, box-shadow 0.15s;
    }
    .partners a:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 24px rgba(0, 0, 0, 0.2);
    }
    .partners img {
      max-height: 60px;
      width: auto;
      object-fit: contain;
    }
    .order-actions {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 12px;
      margin-top: 40px;
    }
    .btn-ghost {
      border-color: rgba(255, 255, 255, 0.85);
      color: #fff;
    }
    .btn-ghost:hover {
      background: rgba(255, 255, 255, 0.12);
    }

    /* Visit */
    .visit {
      padding: 96px 0;
    }
    .visit-inner {
      display: grid;
      grid-template-columns: 1fr 1.3fr;
      gap: 56px;
      align-items: stretch;
    }
    dl {
      margin: 28px 0 0;
      display: grid;
      gap: 22px;
    }
    dt {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 900;
      color: var(--ink);
      text-transform: uppercase;
      letter-spacing: 1.5px;
      font-size: 13px;
    }
    dd {
      margin: 4px 0 0 26px;
      font-size: 19px;
      color: var(--ink);
    }
    dd a {
      color: var(--blue);
      font-weight: 700;
    }
    .visit-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-top: 32px;
    }
    .map {
      width: 100%;
      min-height: 380px;
      border: 0;
      border-radius: var(--radius);
      background: #eee;
    }

    @media (max-width: 1024px) {
      .grid {
        grid-template-columns: repeat(3, 1fr);
      }
      .review-list {
        grid-template-columns: 1fr;
        max-width: 640px;
        margin: 0 auto;
      }
      .visit-inner {
        grid-template-columns: 1fr;
      }
    }
    @media (max-width: 767px) {
      .dishes,
      .reviews,
      .visit {
        padding: 60px 0;
      }
      .review {
        padding: 22px;
      }
      /* Journey map (commented out). On phones the map is zoomed so the two
         cities sit near the screen edges (they're at ~19% and ~85% of its width).
      .journey {
        padding: 56px 0 28px;
      }
      .journey app-journey-map {
        width: 120%;
        max-width: none;
        margin-left: -12%;
      }
      */
      .order {
        padding: 72px 0 64px;
      }
      .head {
        margin-bottom: 28px;
      }
      .grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
      }
      .dish span {
        font-size: 16px;
        padding: 28px 12px 10px;
      }
      .partners {
        gap: 10px;
      }
      .partners li {
        flex: 1 1 140px;
      }
      .partners a {
        width: 100%;
        height: 80px;
      }
      .order-actions .btn,
      .center .btn {
        width: 100%;
      }
      /* Phones already have Call/Directions in the hero; the phone number
         above is tappable and the map has its own directions link. */
      .visit-actions {
        display: none;
      }
      .map {
        min-height: 300px;
      }
    }
  `,
})
export class Home {
  readonly site = SITE;
  readonly home = SITE.home;
  // Same Google Maps embed the original site uses; the URL is a constant.
  readonly mapUrl = inject(DomSanitizer).bypassSecurityTrustResourceUrl(
    'https://maps.google.com/maps?q=47-31%20Vernon%20Blvd%2C%20Long%20Island%20City%2C%20NY%2011101&t=m&z=16&output=embed&iwloc=near',
  );
}
