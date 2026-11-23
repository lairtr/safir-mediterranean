import { Component, HostListener, signal } from '@angular/core';
import { Icon } from '../shared/icon';

@Component({
  selector: 'app-scroll-top',
  imports: [Icon],
  template: `
    <button type="button" [class.show]="show()" aria-label="Back to top" (click)="toTop()">
      <app-icon name="chevron-up" [size]="18" />
    </button>
  `,
  styles: `
    button {
      position: fixed;
      right: 7px;
      bottom: 7px;
      width: 45px;
      height: 50px;
      display: grid;
      place-items: center;
      border: 0;
      border-radius: 5px;
      background: #eee;
      color: #000;
      cursor: pointer;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.3s, background 0.2s;
      z-index: 40;
    }
    button.show {
      opacity: 0.5;
      visibility: visible;
    }
    button:hover {
      opacity: 1;
    }
    /* On phones the sticky header already gives quick access; avoid covering buttons */
    @media (max-width: 767px) {
      button {
        display: none;
      }
    }
  `,
})
export class ScrollTop {
  readonly show = signal(false);

  @HostListener('window:scroll')
  onScroll() {
    this.show.set(window.scrollY > 400);
  }

  toTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
