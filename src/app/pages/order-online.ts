import { Component } from '@angular/core';
import { SITE } from '../site-data';
import { Icon } from '../shared/icon';

/**
 * Where the header's "Order Online" button leads: every way to order, as
 * clear tap targets. Partner order matches site-data.ts (put the restaurant's
 * preferred channel first there).
 */
@Component({
  selector: 'app-order-online',
  imports: [Icon],
  template: `
    <section class="intro">
      <div class="container">
        <h1 class="section-title">Order Online</h1>
        <p class="section-sub">Delivery or pickup: order on your favorite app, or call us directly.</p>
      </div>
    </section>

    <div class="container body">
      <section aria-labelledby="apps-title">
        <h2 id="apps-title" class="label">Order on an app</h2>
        <ul class="partners">
          @for (p of site.deliveryPartners; track p.name) {
            <li>
              <a [href]="p.url" target="_blank" rel="noopener" class="partner">
                <span class="logo"><img [src]="p.logo" alt="" loading="lazy" /></span>
                <span class="cta">Order on {{ p.name }} <app-icon name="arrow-right" [size]="16" /></span>
              </a>
            </li>
          }
        </ul>
      </section>

      <div class="more">
        <section class="card call" aria-labelledby="call-title">
          <h2 id="call-title" class="label">Order by phone</h2>
          <p>Call us for pickup orders or questions.</p>
          <a class="btn btn-primary btn-lg" [href]="site.phone.tel"><app-icon name="phone" [size]="18" /> {{ site.phone.display }}</a>
        </section>

        <section class="card" aria-labelledby="catering-title">
          <h2 id="catering-title" class="label">Catering</h2>
          <p>Feeding a group? Order catering trays through ezCater.</p>
          <a class="btn btn-outline btn-lg" [href]="site.cateringUrl" target="_blank" rel="noopener">Order Catering</a>
        </section>

        <figure class="card badge">
          <img [src]="site.restaurantGuruBadge.src" [attr.srcset]="site.restaurantGuruBadge.srcset" sizes="120px" [alt]="site.restaurantGuruBadge.alt" width="120" height="170" loading="lazy" />
          <figcaption>Recommended on Restaurant Guru, 2023</figcaption>
        </figure>
      </div>
    </div>
  `,
  styles: `
    .intro {
      background: var(--sand);
      padding: 56px 0 40px;
      text-align: center;
    }
    .body {
      max-width: 1100px;
      padding-top: 40px;
      padding-bottom: 80px;
    }
    .label {
      font-size: 14px;
      font-weight: 900;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: var(--muted);
      margin-bottom: 14px;
    }

    .partners {
      list-style: none;
      margin: 0;
      padding: 0;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
      gap: 14px;
    }
    .partner {
      height: 100%;
      display: flex;
      flex-direction: column;
      border: 1px solid #e6e0d8;
      border-radius: var(--radius);
      overflow: hidden;
      background: #fff;
      transition: box-shadow 0.15s, transform 0.15s, border-color 0.15s;
    }
    .partner:hover {
      transform: translateY(-2px);
      border-color: var(--blue);
      box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
    }
    .logo {
      flex: 1;
      display: grid;
      place-items: center;
      padding: 22px 20px;
      min-height: 110px;
    }
    .logo img {
      max-height: 64px;
      max-width: 160px;
      width: auto;
      object-fit: contain;
    }
    .cta {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 12px;
      background: var(--sand);
      font-weight: 900;
      font-size: 15px;
      color: var(--blue);
    }

    .more {
      display: grid;
      grid-template-columns: 1fr 1fr auto;
      gap: 14px;
      margin-top: 28px;
    }
    .card {
      margin: 0;
      padding: 26px;
      border-radius: var(--radius);
      background: #fff;
      border: 1px solid #e6e0d8;
    }
    .card p {
      margin: 0 0 18px;
    }
    .badge {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 10px;
      width: 200px;
      text-align: center;
    }
    .badge img {
      width: 120px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
    }
    .badge figcaption {
      font-size: 14px;
      color: var(--muted);
    }

    @media (max-width: 860px) {
      .more {
        grid-template-columns: 1fr;
      }
      .badge {
        width: auto;
        flex-direction: row;
        justify-content: flex-start;
        text-align: left;
      }
      .badge img {
        width: 72px;
      }
    }
    @media (max-width: 767px) {
      .intro {
        padding: 36px 0 28px;
      }
      .body {
        padding-top: 28px;
        padding-bottom: 56px;
      }
      .partners {
        grid-template-columns: 1fr 1fr;
        gap: 10px;
      }
      .logo {
        min-height: 84px;
        padding: 16px 12px;
      }
      .logo img {
        max-height: 48px;
        max-width: 120px;
      }
      .cta {
        font-size: 14px;
        padding: 10px 6px;
      }
      .card .btn {
        width: 100%;
      }
    }
  `,
})
export class OrderOnline {
  readonly site = SITE;
}
