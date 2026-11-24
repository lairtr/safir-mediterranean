/**
 * Address of the menu API: the Cloudflare Worker in admin-api/. It holds the
 * Airtable token. The website only reads the public menu from it, and the
 * admin page signs in to it. Replace with your Worker's URL after
 * `npx wrangler deploy`.
 */
export const API_URL = 'https://safir-admin-api.safir-mediterranean.workers.dev';

export const API_CONFIGURED = !API_URL.includes('YOUR-SUBDOMAIN');
