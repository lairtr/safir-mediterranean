import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SITE } from '../site-data';
import { Icon } from '../shared/icon';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, Icon],
  template: `
    <footer id="contact-us" class="footer notch-top">
      <div class="container grid">
        <div class="col brand">
          <img [src]="site.logoWhite" alt="Safir Mediterranean" width="240" height="115" loading="lazy" />
          <a [href]="site.instagramAlt" target="_blank" rel="noopener" aria-label="Instagram">
            <app-icon name="instagram" [size]="22" />
          </a>
        </div>

        <div class="col">
          <h2>Overview</h2>
          <ul>
            <li><a routerLink="/">Home</a></li>
            <li><a routerLink="/" fragment="about-us">About Us</a></li>
            <li><a routerLink="/menu">Menu</a></li>
            <li><a [routerLink]="[]" fragment="contact-us">Contact Us</a></li>
          </ul>
        </div>

        <div class="col">
          <h2>Contact Info</h2>
          <a class="row" [href]="site.phone.tel"><app-icon name="phone" [size]="18" /> {{ site.phone.display }}</a>
          <h2 class="spaced">Working Hours</h2>
          <p class="row"><app-icon name="clock" [size]="18" /> {{ site.hours }}</p>
        </div>

        <div class="col">
          <h2>Location</h2>
          <a class="row" [href]="site.address.mapsUrl" target="_blank" rel="noopener">
            <app-icon name="pin" [size]="18" />
            <span>{{ site.address.line1 }}<br />{{ site.address.line2 }}</span>
          </a>
        </div>
      </div>

      <div class="bottom">
        <a [href]="site.instagram" target="_blank" rel="noopener" aria-label="Instagram">
          <app-icon name="instagram" [size]="16" />
        </a>
        <p>
          {{ site.copyright }} |
          <a [href]="site.credit.url" target="_blank" rel="noopener">{{ site.credit.label }}</a>
        </p>
      </div>
    </footer>
  `,
  styles: `
    .footer {
      background: var(--blue);
      color: #fff;
    }
    .grid {
      display: grid;
      grid-template-columns: 1.3fr 1fr 1fr 1fr;
      gap: 30px;
      padding-top: 85px;
      padding-bottom: 120px;
    }
    .brand {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 22px;
      max-width: 240px;
    }
    h2 {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-bottom: 18px;
    }
    h2.spaced {
      margin-top: 26px;
    }
    ul {
      list-style: none;
      margin: 0;
      padding: 0;
    }
    li a,
    .row {
      font-size: 13px;
      font-weight: 700;
    }
    li {
      margin-bottom: 9px;
    }
    .row {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      margin: 0;
      line-height: 1.7;
    }
    a:hover {
      opacity: 0.8;
    }

    .bottom {
      background: var(--blue-dark);
      min-height: 117px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 10px;
      font-size: 12px;
      text-align: center;
      padding: 20px;
    }
    .bottom p {
      margin: 0;
    }

    @media (max-width: 1024px) {
      .grid {
        grid-template-columns: 1fr 1fr;
        padding-bottom: 70px;
      }
    }
    @media (max-width: 767px) {
      .grid {
        grid-template-columns: 1fr;
        text-align: center;
        justify-items: center;
        padding-top: 60px;
      }
      .row {
        justify-content: center;
      }
    }
  `,
})
export class Footer {
  readonly site = SITE;
}
