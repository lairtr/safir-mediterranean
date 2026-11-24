import { inject } from '@angular/core';
import { Router, Routes } from '@angular/router';
import { Home } from './pages/home';

/** Old WordPress URLs like /contact-us now jump to a section of the home page. */
const toSection = (fragment: string) => () =>
  inject(Router).createUrlTree(['/'], { fragment });

export const routes: Routes = [
  // `title` sets the browser tab / search result title; `data.description`
  // is used for the meta description and link previews (see seo.ts).
  {
    path: '',
    component: Home,
    title: 'Safir Mediterranean | Turkish Restaurant in Long Island City, NY',
    data: {
      description:
        'Turkish & Mediterranean kitchen at 47-31 Vernon Blvd, Long Island City. Kebabs, pides, mezes and more. Open daily 11 AM–10 PM. Order online or visit us.',
    },
  },
  {
    path: 'menu',
    loadComponent: () => import('./pages/menu').then((m) => m.MenuPage),
    title: 'Menu | Safir Mediterranean, Long Island City',
    data: {
      description:
        'Full menu with prices: soups and mezes, pides, kebabs, mix grills, seafood, vegetarian dishes and desserts, plus weekend breakfast and weekday lunch specials.',
    },
  },
  {
    path: 'order-online',
    loadComponent: () => import('./pages/order-online').then((m) => m.OrderOnline),
    title: 'Order Online | Safir Mediterranean, Long Island City',
    data: {
      description:
        'Order Safir Mediterranean for delivery or pickup on DoorDash, Seamless, Uber Eats or ChowNow, call (347) 924-9152, or book catering.',
    },
  },
  {
    // Menu editor. Unlinked, client-rendered only, noindex (see pages/admin).
    path: 'admin',
    loadComponent: () => import('./pages/admin/admin').then((m) => m.Admin),
    title: 'Admin | Safir Mediterranean',
  },
  { path: 'about-us', redirectTo: '' }, // About section was removed
  { path: 'contact-us', canActivate: [toSection('contact-us')], children: [] },
  { path: '**', redirectTo: '' },
];
