# Live menu & admin

The menu lives in the **Restaurant Menu** Airtable base. The website loads it
live, so a price change in Airtable or on the admin page (`/admin`) shows on
the site within about a minute. No redeploy is needed.

```
website /menu  ── GET /public/menu ──▶ ┐
                                       ├─ Cloudflare Worker (this folder) ── token ──▶ Airtable
admin  /admin  ── password/session ──▶ ┘
```

**Why a Worker:** the website is static files on GitHub Pages, so anything in
its code is public. The Airtable token and the password hash are encrypted
Worker secrets. They never reach the browser or this repository.

**Public menu**
- `GET /public/menu` returns only visible menus and categories.
- The Worker caches it for 60 seconds, so busy days don't hit Airtable's
  limit of 5 requests per second.
- If Airtable is down, the Worker serves its last good copy. If the Worker
  can't be reached either, the site shows the menu snapshot built into it.

**Admin**
- The password is stored only as a PBKDF2 hash. Five wrong tries lock that
  IP address for 15 minutes. Sessions expire after 8 hours.
- Only origins in `ALLOWED_ORIGINS` can use the admin endpoints.
- Only the known tables and fields can be changed.
- A menu or category that still has entries can't be deleted.

**Hidden from search engines:** `/admin` isn't linked anywhere, isn't
prerendered (GitHub Pages answers it with HTTP 404), isn't in the sitemap,
and is marked `noindex`.

## Airtable fields

| Table | Fields |
|---|---|
| Super-Categories | Name, Categories (link), Description, Sort Order, Visible |
| Categories | Name, Super-Category (link to Super-Categories), Description, Sort Order, Visible, Menu Items (link) |
| Menu Items | Title, Description, Price, Category (link to Categories), Sort Order, Available |

- **Visible** unchecked hides a menu or category, and everything in it, from the website.
- **Available** unchecked shows the item greyed out as "Currently unavailable".
- Lower **Sort Order** comes first.
- A super-category's **Description** shows under the menu tabs, e.g. breakfast
  hours. A category's shows under its title.
- Printed-menu images stay in the repo (`src/app/data/menu/super-categories.json`).
  They're matched to a menu by its name, so renaming a menu disconnects them
  until you update that file.

## One-time setup

### 1. Fill Airtable with the current menu

From the project folder:

```sh
read -s AIRTABLE_TOKEN && export AIRTABLE_TOKEN   # paste the token; it isn't shown or saved
AIRTABLE_BASE_ID=appUrmFp2FFEIXPv9 node scripts/seed-airtable.mjs
```

The import reuses menus and categories already in Airtable (matched by name) and only runs while Menu Items is empty.

### 2. Deploy the Worker (free Cloudflare account)

```sh
cd admin-api
npx wrangler login
npx wrangler secret put AIRTABLE_TOKEN        # paste the token
npx wrangler secret put AIRTABLE_BASE_ID      # appUrmFp2FFEIXPv9
node ../scripts/hash-password.mjs             # asks for the admin password and saves its hash
openssl rand -base64 48 | npx wrangler secret put SESSION_SECRET
npx wrangler deploy
```

1. Put the URL that `wrangler deploy` prints into `API_URL` in
   `src/app/api-config.ts`. Then commit and run the "Deploy website" workflow
   once.
2. `ALLOWED_ORIGINS` in `wrangler.toml` must include the site's address, e.g.
   `https://lairtr.github.io` or a custom domain. Redeploy the Worker after
   changing it.
3. Recommended: in the Cloudflare dashboard, go to Security → WAF → Rate
   limiting rules. Add a rule that allows about 10 requests per minute to
   `/login`.

### 3. Optional: keep the search-engine snapshot fresh

In GitHub, go to Settings → Secrets and variables → Actions. Add
`AIRTABLE_TOKEN` and `AIRTABLE_BASE_ID`. Each run of "Deploy website" then
saves the current Airtable menu into the prerendered Menu page.

## Changing the password

```sh
node scripts/hash-password.mjs
```

It asks for the new password twice (typing is hidden) and saves only its hash
to the Worker. The change takes effect immediately.

To sign everyone out immediately, also replace `SESSION_SECRET`.
