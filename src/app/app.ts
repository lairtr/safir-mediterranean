import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
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
    <app-header />
    <main id="main" tabindex="-1">
      <router-outlet />
    </main>
    <app-instagram-strip />
    <app-footer />
    <app-scroll-top />
  `,
})
export class App {}
