import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SITE } from '../site-data';
import { Icon } from '../shared/icon';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, Icon],
  template: `
    <footer class="footer">
      <div class="container grid">
        <div class="brand">
          <img [src]="site.logoWhite" alt="Safir Mediterranean" width="301" height="144" loading="lazy" />
          <p>{{ site.tagline }}</p>
        </div>

        <nav aria-label="Footer">
          <h2>Explore</h2>
          <ul>
            <li><a routerLink="/menu">Menu</a></li>
            <li><a routerLink="/order-online">Order Online</a></li>
            <li><a [href]="site.cateringUrl" target="_blank" rel="noopener">Catering</a></li>
          </ul>
        </nav>

        <div>
          <h2>Visit</h2>
          <ul>
            <li>
              <a [href]="site.address.mapsUrl" target="_blank" rel="noopener">{{ site.address.line1 }}<br />{{ site.address.line2 }}</a>
            </li>
            <li>{{ site.hoursShort }}</li>
          </ul>
        </div>

        <div>
          <h2>Contact</h2>
          <ul>
            <li><a [href]="site.phone.tel">{{ site.phone.display }}</a></li>
            <li>
              <a class="ig" [href]="site.instagram" target="_blank" rel="noopener"><app-icon name="instagram" [size]="18" /> Instagram</a>
            </li>
          </ul>
        </div>
      </div>

      <div class="bottom">
        <div class="container bottom-inner">
          <p>{{ site.copyright }}</p>
          <p>
            Developed by <a [href]="site.credit.url" target="_blank" rel="noopener">Authorize Local</a>
          </p>
        </div>
      </div>
    </footer>
  `,
  styles: `
    .footer {
      background: var(--blue-dark);
      color: rgba(255, 255, 255, 0.85);
      font-size: 16px;
    }
    .grid {
      display: grid;
      grid-template-columns: 1.4fr 1fr 1fr 1fr;
      gap: 40px;
      padding-top: 64px;
      padding-bottom: 56px;
    }
    .brand img {
      width: 170px;
    }
    .brand p {
      margin: 14px 0 0;
      font-family: var(--script);
      font-size: 20px;
      color: #fff;
    }
    h2 {
      color: #fff;
      font-size: 13px;
      font-weight: 900;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-bottom: 14px;
    }
    ul {
      list-style: none;
      margin: 0;
      padding: 0;
      display: grid;
      gap: 8px;
    }
    a:hover {
      color: #fff;
      text-decoration: underline;
    }
    .ig {
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    .bottom {
      border-top: 1px solid rgba(255, 255, 255, 0.12);
      font-size: 13px;
    }
    .bottom-inner {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      padding-top: 18px;
      padding-bottom: 18px;
    }
    .bottom p {
      margin: 0;
    }
    .bottom a {
      font-weight: 700;
      color: #fff;
    }

    @media (max-width: 1024px) {
      .grid {
        grid-template-columns: 1fr 1fr;
      }
    }
    @media (max-width: 767px) {
      .grid {
        grid-template-columns: 1fr 1fr;
        gap: 32px 20px;
        padding-top: 48px;
        padding-bottom: 40px;
      }
      .brand {
        grid-column: 1 / -1;
      }
      .bottom-inner {
        flex-direction: column;
        text-align: center;
        gap: 4px;
      }
    }
  `,
})
export class Footer {
  readonly site = SITE;
}
