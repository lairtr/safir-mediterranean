# Safir Mediterranean: Angular SPA

This is a rebuild of safir-mediterranean.com (WordPress + Elementor) as an Angular 21 single-page app. It keeps the same layout, fonts (Lato and Berkshire Swash), colors, text, menus and ordering links.

## Run it

```bash
npm install
npm run fetch-assets   # downloads all photos/logos/menus from the current site into public/images
npm start              # http://localhost:4200
```

Run `fetch-assets` **before** you shut WordPress down, because it copies the images from there.

## Build and deploy

```bash
npm run build          # output: dist/safir/browser
```

Upload the contents of `dist/safir/browser` to any static host. Because this is an SPA, the host must serve `index.html` for unknown paths so that `/menu` and `/order-online` work when someone refreshes the page or opens a direct link. The repo already includes the config for that:

- **Apache / cPanel hosting**: `public/.htaccess` is copied into the build.
- **Netlify / Cloudflare Pages**: `public/_redirects` is copied into the build.
- **Vercel**: add a rewrite of `/(.*)` to `/index.html`.

## Where things live

| What | File |
|---|---|
| Phone, hours, address, links, menu images, delivery apps | `src/app/site-data.ts` |
| Top bar, header, sticky header, mobile menu | `src/app/layout/header.ts` |
| Footer (also the `#contact-us` anchor) | `src/app/layout/footer.ts` |
| Home page / hero slider | `src/app/pages/home.ts`, `hero-slider.ts` |
| Menu page (tabs) | `src/app/pages/menu.ts` |
| Order Online page | `src/app/pages/order-online.ts` |
| Colors & fonts | `src/styles.css` (`:root` variables) |

To update the weekly specials, replace `public/images/menu/safir4.png` and redeploy.

## Routes

- `/`: home
- `/menu`: menu with Main / Breakfast / This Week's Specials tabs
- `/order-online`: call button plus links to DoorDash, Seamless, Uber Eats, Fantuan and ChowNow
- `/about-us` and `/contact-us` redirect to the matching section of the home page. On the live site these return 404.
- Any other path redirects to `/`.
