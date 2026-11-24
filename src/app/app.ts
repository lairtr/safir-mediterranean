import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Seo } from './seo';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { Header } from './layout/header';
import { Footer } from './layout/footer';
import { ScrollTop } from './layout/scroll-top';
import { InstagramStrip } from './layout/instagram-strip';

// The WordPress-style preloader was removed: it hid the page until every image
// had loaded, which delays what visitors see first.
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer, ScrollTop, InstagramStrip],
  template: `
    @if (isAdmin()) {
      <!-- The admin page has no public header, footer or links. -->
      <main id="main" tabindex="-1"><router-outlet /></main>
    } @else {
      <app-header />
      <main id="main" tabindex="-1">
        <router-outlet />
      </main>
      <app-instagram-strip />
      <app-footer />
      <app-scroll-top />
    }
  `,
})
export class App {
  private readonly router = inject(Router);
  readonly isAdmin = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map((e) => /^\/admin(\/|\?|#|$)/.test(e.urlAfterRedirects)),
    ),
    { initialValue: false },
  );

  constructor() {
    inject(Seo).init();
  }
}
