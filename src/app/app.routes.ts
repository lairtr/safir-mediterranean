import { inject } from '@angular/core';
import { Router, Routes } from '@angular/router';
import { Home } from './pages/home';

/** Old WordPress URLs like /contact-us now jump to a section of the home page. */
const toSection = (fragment: string) => () =>
  inject(Router).createUrlTree(['/'], { fragment });

export const routes: Routes = [
  { path: '', component: Home, title: 'Home - Safir Mediterranean' },
  {
    path: 'menu',
    loadComponent: () => import('./pages/menu').then((m) => m.MenuPage),
    title: 'MENU - Safir Mediterranean',
  },
  {
    path: 'order-online',
    loadComponent: () => import('./pages/order-online').then((m) => m.OrderOnline),
    title: 'Order Online - Safir Mediterranean',
  },
  { path: 'about-us', redirectTo: '' }, // About section was removed
  { path: 'contact-us', canActivate: [toSection('contact-us')], children: [] },
  { path: '**', redirectTo: '' },
];
