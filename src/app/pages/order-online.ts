import { Component } from '@angular/core';
import { SITE } from '../site-data';
import { Icon } from '../shared/icon';

@Component({
  selector: 'app-order-online',
  imports: [Icon],
  template: `
    <section class="phone-band">
      <h1 class="script">Order By Phone</h1>
      <a class="call" [href]="site.phone.tel">
        <app-icon name="phone" [size]="24" /> Call {{ site.phone.display }}
      </a>
    </section>

    <section class="container online">
      <div class="badge">
        <img [src]="site.restaurantGuruBadge" alt="Recommended on Restaurant Guru 2023" width="276" height="340" />
      </div>

      <div class="partners">
        <h2 class="script">Order Online</h2>
        @for (p of site.deliveryPartners; track p.name) {
          <a [href]="p.url" target="_blank" rel="noopener" [attr.aria-label]="'Order on ' + p.name">
            <img [src]="p.logo" [alt]="p.name" loading="lazy" />
          </a>
        }
      </div>

      <div class="spacer"></div>
    </section>
  `,
  styles: `
    .phone-band {
      background: var(--blue);
      text-align: center;
      padding: 30px 20px 34px;
    }
    h1 {
      color: #fff;
      font-size: 50px;
      line-height: 1.3;
      margin-bottom: 14px;
    }
    .call {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background: #fff;
      color: var(--blue);
      font-size: 26px;
      font-weight: 700;
      padding: 12px 30px;
      border-radius: 4px;
      transition: transform 0.2s;
    }
    .call:hover {
      transform: translateY(-2px);
    }

    .online {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 30px;
      padding-top: 20px;
      padding-bottom: 60px;
    }
    .badge img {
      width: 276px;
      box-shadow: 0 0 8px rgba(0, 0, 0, 0.15);
    }
    .partners {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 26px;
    }
    h2 {
      font-size: 50px;
      line-height: 1.2;
      color: var(--blue);
      margin-bottom: 4px;
    }
    .partners a {
      transition: transform 0.2s;
    }
    .partners a:hover {
      transform: scale(1.05);
    }
    .partners img {
      width: 210px;
      max-height: 110px;
      object-fit: contain;
    }

    @media (max-width: 900px) {
      .online {
        grid-template-columns: 1fr;
        justify-items: center;
      }
      .badge {
        order: 2;
      }
      .spacer {
        display: none;
      }
    }
    @media (max-width: 600px) {
      h1,
      h2 {
        font-size: 38px;
      }
      .call {
        font-size: 20px;
        padding: 12px 20px;
      }
    }
  `,
})
export class OrderOnline {
  readonly site = SITE;
}
