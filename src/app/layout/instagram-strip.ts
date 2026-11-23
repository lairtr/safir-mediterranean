import { Component } from '@angular/core';
import { SITE } from '../site-data';
import { Icon } from '../shared/icon';

/**
 * "Follow us on Instagram" band shown above the footer on every page.
 * The tiles are the restaurant's own photos (not a live feed — that would
 * need Meta API credentials); each one opens the Instagram profile.
 */
@Component({
  selector: 'app-instagram-strip',
  imports: [Icon],
  template: `
    <section class="strip" aria-labelledby="ig-title">
      <div class="container">
        <div class="head">
          <div>
            <h2 id="ig-title" class="section-title">Follow Us on Instagram</h2>
            <a class="handle" [href]="site.instagram" target="_blank" rel="noopener">{{ site.instagramHandle }}</a>
          </div>
          <a class="btn btn-primary follow" [href]="site.instagram" target="_blank" rel="noopener">
            <app-icon name="instagram" [size]="18" /> Follow {{ site.instagramHandle }}
          </a>
        </div>

        <ul class="grid">
          @for (p of site.instagramGrid; track p.src) {
            <li>
              <a [href]="site.instagram" target="_blank" rel="noopener" [attr.aria-label]="p.alt + ' — see more on Instagram'">
                <img [src]="p.src" [attr.srcset]="p.srcset" sizes="(max-width: 767px) 33vw, 200px" [alt]="p.alt" loading="lazy" decoding="async" width="320" height="320" />
                <span class="hover" aria-hidden="true"><app-icon name="instagram" [size]="28" /></span>
              </a>
            </li>
          }
        </ul>
      </div>
    </section>
  `,
  styles: `
    .strip {
      background: var(--sand);
      padding: 72px 0;
    }
    .head {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 20px;
      margin-bottom: 28px;
    }
    .handle {
      display: inline-block;
      margin-top: 6px;
      font-weight: 900;
      font-size: 18px;
      color: var(--blue);
    }
    .handle:hover {
      text-decoration: underline;
    }
    .grid {
      list-style: none;
      margin: 0;
      padding: 0;
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 10px;
    }
    .grid a {
      position: relative;
      display: block;
      border-radius: 6px;
      overflow: hidden;
      background: #e9e2d8;
    }
    .grid img {
      width: 100%;
      aspect-ratio: 1;
      object-fit: cover;
      transition: transform 0.4s ease;
    }
    .hover {
      position: absolute;
      inset: 0;
      display: grid;
      place-items: center;
      color: #fff;
      background: rgba(20, 55, 95, 0.45);
      opacity: 0;
      transition: opacity 0.2s;
    }
    .grid a:hover img,
    .grid a:focus-visible img {
      transform: scale(1.06);
    }
    .grid a:hover .hover,
    .grid a:focus-visible .hover {
      opacity: 1;
    }

    @media (max-width: 767px) {
      .strip {
        padding: 52px 0;
      }
      .head {
        flex-direction: column;
        align-items: center;
        text-align: center;
        margin-bottom: 20px;
      }
      .grid {
        grid-template-columns: repeat(3, 1fr);
        gap: 6px;
      }
      .follow {
        order: 2;
        width: 100%;
        margin-top: 4px;
      }
    }
  `,
})
export class InstagramStrip {
  readonly site = SITE;
}
