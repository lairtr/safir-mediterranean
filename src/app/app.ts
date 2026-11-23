import { Component, inject } from '@angular/core';
import { ViewportScroller } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Header } from './layout/header';
import { Footer } from './layout/footer';
import { Preloader } from './layout/preloader';
import { ScrollTop } from './layout/scroll-top';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer, Preloader, ScrollTop],
  template: `
    <app-preloader />
    <app-header />
    <main>
      <router-outlet />
    </main>
    <app-footer />
    <app-scroll-top />
  `,
})
export class App {
  constructor() {
    // Keep anchored sections from hiding under the sticky header.
    inject(ViewportScroller).setOffset([0, 90]);
  }
}
