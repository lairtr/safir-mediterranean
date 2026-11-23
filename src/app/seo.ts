import { DOCUMENT, Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Meta } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

/**
 * Placeholder for the site's absolute URL in prerendered HTML. The deploy
 * workflow replaces it (scripts/finalize-static.mjs) with the real address,
 * e.g. https://safir-mediterranean.com/.
 */
export const SITE_URL_TOKEN = '__SITE_URL__';

/**
 * Keeps <meta name="description">, Open Graph tags and the canonical link in
 * sync with the current page. Values come from each route's `data`.
 */
@Injectable({ providedIn: 'root' })
export class Seo {
  private readonly doc = inject(DOCUMENT);
  private readonly meta = inject(Meta);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  init() {
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => this.update());
  }

  private update() {
    let r = this.route;
    while (r.firstChild) r = r.firstChild;
    const description: string | undefined = r.snapshot.data['description'];
    const path = this.router.url.split(/[?#]/)[0].replace(/^\//, '');
    // In the browser the base URL is known; at build time use the placeholder.
    const base = this.isBrowser ? new URL('.', this.doc.baseURI).href : SITE_URL_TOKEN;
    const url = base + (path ? path + '/' : '');

    if (description) {
      this.meta.updateTag({ name: 'description', content: description });
      this.meta.updateTag({ property: 'og:description', content: description });
    }
    this.meta.updateTag({ property: 'og:title', content: this.doc.title });
    this.meta.updateTag({ property: 'og:url', content: url });

    let link = this.doc.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.doc.createElement('link');
      link.rel = 'canonical';
      this.doc.head.appendChild(link);
    }
    link.href = url;
  }
}
