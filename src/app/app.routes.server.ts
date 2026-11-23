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
  { path: '**', renderMode: RenderMode.Client },
];
