import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * Pages written out as real HTML at build time, so search engines and link
 * previews get full content (and GitHub Pages serves them with status 200).
 * Everything else falls back to the client-side app via 404.html.
 */
export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'menu', renderMode: RenderMode.Prerender },
  { path: 'order-online', renderMode: RenderMode.Prerender },
  // Never prerendered, so it isn't in the sitemap and Pages serves it as a 404.
  { path: 'admin', renderMode: RenderMode.Client },
  { path: '**', renderMode: RenderMode.Client },
];
