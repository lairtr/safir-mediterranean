import { Component, DestroyRef, afterNextRender, computed, inject, input, signal } from '@angular/core';
import { SITE } from '../site-data';

/** Minutes since midnight right now in the restaurant's time zone. */
function nowInRestaurantTz(): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: SITE.openingHours.timeZone,
    hour: 'numeric',
    minute: 'numeric',
    hourCycle: 'h23',
  }).formatToParts(new Date());
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  return get('hour') * 60 + get('minute');
}

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

/**
 * "Open now" / "Closed" badge followed by the opening hours.
 * Uses New York time regardless of the visitor's own time zone.
 */
@Component({
  selector: 'app-open-status',
  template: `
    <!-- The open/closed badge is computed in the browser only, so the
         prerendered HTML never shows a stale build-time status. -->
    @if (ready()) {
      <span class="badge" [class.open]="isOpen()">
        <span class="dot" aria-hidden="true"></span>{{ isOpen() ? 'Open now' : 'Closed now' }}
      </span>
    }
    @if (showHours()) {
      <span class="hours">{{ hoursText }}</span>
    }
  `,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 4px 8px;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-weight: 900;
    }
    .dot {
      width: 9px;
      height: 9px;
      border-radius: 50%;
      background: #b0b6bf;
    }
    .open .dot {
      background: #2fbf5b;
      box-shadow: 0 0 0 3px rgba(47, 191, 91, 0.25);
    }
    .badge + .hours::before {
      content: '·';
      margin-right: 8px;
      opacity: 0.7;
    }
  `,
})
export class OpenStatus {
  readonly showHours = input(true);
  readonly hoursText = SITE.hoursShort;

  readonly ready = signal(false);
  private readonly minutes = signal(0);
  readonly isOpen = computed(() => {
    const { open, close } = SITE.openingHours;
    const m = this.minutes();
    return m >= toMinutes(open) && m < toMinutes(close);
  });

  constructor() {
    let timer: ReturnType<typeof setInterval> | undefined;
    afterNextRender(() => {
      this.minutes.set(nowInRestaurantTz());
      this.ready.set(true);
      timer = setInterval(() => this.minutes.set(nowInRestaurantTz()), 60_000);
    });
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }
}
