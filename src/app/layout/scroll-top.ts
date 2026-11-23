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
      right: 20px;
      bottom: 20px;
      width: 38px;
      height: 38px;
      display: grid;
      place-items: center;
      border: 0;
      border-radius: 3px;
      background: rgba(210, 210, 210, 0.9);
      color: #333;
      cursor: pointer;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.3s, background 0.2s;
      z-index: 40;
    }
    button.show {
      opacity: 1;
      visibility: visible;
    }
    button:hover {
      background: var(--blue);
      color: #fff;
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
