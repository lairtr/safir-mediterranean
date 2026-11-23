// Prepares the built site in dist/safir/browser for static hosting (GitHub Pages):
//   - replaces the __SITE_URL__ placeholder with the site's absolute URL
//     (canonical links, link previews, structured data)
//   - writes sitemap.xml and robots.txt for the prerendered pages
//   - creates 404.html (client-side fallback for any other path) and .nojekyll
//
// usage: node scripts/finalize-static.mjs https://safir-mediterranean.com/
import { readdir, readFile, rm, writeFile, copyFile } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'dist', 'safir', 'browser');
const TOKEN = '__SITE_URL__';

let siteUrl = process.argv[2];
if (!siteUrl || !/^https?:\/\//.test(siteUrl)) {
  console.error('usage: node scripts/finalize-static.mjs <absolute site URL>');
  process.exit(1);
}
if (!siteUrl.endsWith('/')) siteUrl += '/';

async function* htmlFiles(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* htmlFiles(p);
    else if (e.name.endsWith('.html')) yield p;
  }
}

// 1. Absolute URLs
const pages = [];
for await (const file of htmlFiles(OUT)) {
  const html = await readFile(file, 'utf8');
  if (html.includes(TOKEN)) await writeFile(file, html.replaceAll(TOKEN, siteUrl));
  const rel = relative(OUT, file).split('\\').join('/');
  if (rel === 'index.html' || rel.endsWith('/index.html')) pages.push(rel.replace(/index\.html$/, ''));
}

// 2. Sitemap + robots.txt (only real, prerendered pages)
const today = new Date().toISOString().slice(0, 10);
const urls = pages
  .sort()
  .map((p) => `  <url><loc>${siteUrl}${p}</loc><lastmod>${today}</lastmod></url>`)
  .join('\n');
await writeFile(
  join(OUT, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
);
await writeFile(join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}sitemap.xml\n`);

// 3. Static-hosting extras
await copyFile(join(OUT, 'index.csr.html'), join(OUT, '404.html')); // unknown paths → app
await writeFile(join(OUT, '.nojekyll'), ''); // serve files as-is on GitHub Pages
for (const f of ['_redirects', '.htaccess']) await rm(join(OUT, f), { force: true });

console.log(`✓ finalized for ${siteUrl}: ${pages.length} pages in sitemap (${pages.map((p) => '/' + p).join(', ')})`);
