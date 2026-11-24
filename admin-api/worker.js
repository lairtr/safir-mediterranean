// Safir menu API: a Cloudflare Worker between the website and Airtable.
// The Airtable token and the admin password hash are encrypted Worker
// secrets. They never reach the browser or the public repository.
// See admin-api/README.md.
//
//   GET  /public/menu         visible menu for the website (no login, cached ~60 s)
//   POST /login               { password } → 8-hour session token
//   GET  /admin/menu          every row, including hidden ones   (session)
//   POST/PATCH/DELETE /records/<list>[/<record id>]               (session)
//
// Secrets (wrangler secret put NAME):
//   AIRTABLE_TOKEN       Airtable personal access token (data.records:read + write, this base only)
//   AIRTABLE_BASE_ID     app… id of the "Restaurant Menu" base
//   ADMIN_PASSWORD_HASH  output of `node scripts/hash-password.mjs`
//   SESSION_SECRET       long random string (signs login sessions)
// Vars (wrangler.toml): ALLOWED_ORIGINS

import { LISTS, RECORD_ID, airtable, toFields, toPublicMenu } from '../scripts/airtable-menu.mjs';

const SESSION_HOURS = 8;
const MAX_FAILS = 5; // per IP, then locked for LOCK_MINUTES
const LOCK_MINUTES = 15;
const PUBLIC_CACHE_SECONDS = 60;
const fails = new Map(); // ip -> { count, until } (per Worker instance; see README for a stricter rule)
let publicCache = null; // { at, body } (per Worker instance)

const enc = new TextEncoder();
const b64url = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const fromB64 = (s) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));

function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

// ---- Password: "pbkdf2-sha256$<iterations>$<salt b64>$<hash b64>" ----
async function checkPassword(password, stored) {
  const [scheme, iter, salt, hash] = String(stored || '').split('$');
  if (scheme !== 'pbkdf2-sha256' || !iter || !salt || !hash) throw new Error('ADMIN_PASSWORD_HASH is not set up');
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: fromB64(salt), iterations: Number(iter) },
    key,
    256,
  );
  return safeEqual(new Uint8Array(bits), fromB64(hash));
}

// ---- Sessions: "<payload b64url>.<HMAC b64url>" ----
async function hmacKey(secret) {
  if (!secret || secret.length < 32) throw new Error('SESSION_SECRET must be at least 32 characters');
  return crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}
async function issueSession(env) {
  const payload = b64url(enc.encode(JSON.stringify({ exp: Date.now() + SESSION_HOURS * 3600_000 })));
  const sig = await crypto.subtle.sign('HMAC', await hmacKey(env.SESSION_SECRET), enc.encode(payload));
  return `${payload}.${b64url(sig)}`;
}
async function validSession(env, token) {
  const [payload, sig] = String(token || '').split('.');
  if (!payload || !sig) return false;
  try {
    const ok = await crypto.subtle.verify('HMAC', await hmacKey(env.SESSION_SECRET), fromB64(sig), enc.encode(payload));
    return ok && JSON.parse(new TextDecoder().decode(fromB64(payload))).exp > Date.now();
  } catch {
    return false;
  }
}

// ---- HTTP helpers ----
function corsHeaders(env, origin) {
  const allowed = (env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
  if (!origin || !allowed.includes(origin)) return null;
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Max-Age': '600',
    Vary: 'Origin',
  };
}
const json = (data, status, headers = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex', ...headers },
  });

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

async function readJson(request) {
  if (!(request.headers.get('Content-Type') || '').includes('application/json')) throw new HttpError(415, 'Expected JSON');
  const text = await request.text();
  if (text.length > 20_000) throw new HttpError(413, 'Request too large');
  try {
    return JSON.parse(text || '{}');
  } catch {
    throw new HttpError(400, 'Invalid JSON');
  }
}

function airtableFor(env) {
  if (!env.AIRTABLE_TOKEN || !env.AIRTABLE_BASE_ID) throw new HttpError(500, 'Airtable is not set up');
  return airtable(env.AIRTABLE_TOKEN, env.AIRTABLE_BASE_ID);
}

// ---- Public menu ----
async function publicMenu(env) {
  const headers = {
    'Access-Control-Allow-Origin': '*', // public, read-only data
    // Browsers always ask again; this Worker's own cache limits Airtable calls.
    'Cache-Control': 'no-cache',
    'X-Robots-Tag': 'noindex',
  };
  if (publicCache && Date.now() - publicCache.at < PUBLIC_CACHE_SECONDS * 1000) {
    return new Response(publicCache.body, { status: 200, headers: { ...headers, 'Content-Type': 'application/json' } });
  }
  try {
    const body = JSON.stringify(toPublicMenu(await airtableFor(env).listEverything()));
    publicCache = { at: Date.now(), body };
    return new Response(body, { status: 200, headers: { ...headers, 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error(e);
    // Serve the last good copy rather than nothing; the site falls back to its built-in menu otherwise.
    if (publicCache) return new Response(publicCache.body, { status: 200, headers: { ...headers, 'Content-Type': 'application/json' } });
    return json({ error: 'Menu unavailable' }, 502, { 'Access-Control-Allow-Origin': '*' });
  }
}

// ---- Admin ----
async function login(request, env, ip) {
  const prev = fails.get(ip);
  if (prev && prev.until > Date.now()) throw new HttpError(429, `Too many attempts. Try again in ${LOCK_MINUTES} minutes.`);
  const { password } = await readJson(request);
  const ok = typeof password === 'string' && password.length <= 200 && (await checkPassword(password, env.ADMIN_PASSWORD_HASH));
  if (!ok) {
    if (fails.size > 10_000) fails.clear();
    const count = (prev?.count ?? 0) + 1;
    fails.set(ip, count >= MAX_FAILS ? { count: 0, until: Date.now() + LOCK_MINUTES * 60_000 } : { count, until: 0 });
    await new Promise((r) => setTimeout(r, 500)); // slow down guessing
    throw new HttpError(401, 'Wrong password');
  }
  fails.delete(ip);
  return { token: await issueSession(env), expiresInHours: SESSION_HOURS };
}

function fieldsOrThrow(list, body, opts) {
  try {
    return toFields(list, body, opts);
  } catch (e) {
    throw new HttpError(400, e.message);
  }
}

async function ensureParentExists(at, list, rid) {
  const parent = LISTS[list].parent;
  if (!parent || rid === undefined) return;
  try {
    await at.get(parent.list, rid);
  } catch {
    throw new HttpError(400, `That ${parent.list === 'categories' ? 'category' : 'menu'} no longer exists. Reload the page.`);
  }
}

async function create(at, list, body) {
  const fields = fieldsOrThrow(list, body);
  await ensureParentExists(at, list, body[LISTS[list].parent?.key]);
  return at.create(list, fields);
}

async function update(at, list, rid, body) {
  const fields = fieldsOrThrow(list, body, { partial: true });
  await ensureParentExists(at, list, body[LISTS[list].parent?.key]);
  return at.update(list, rid, fields);
}

async function remove(at, list, rid) {
  const rec = await at.get(list, rid);
  if (rec.childCount) {
    const what = LISTS[list].children.list === 'items' ? 'items' : 'categories';
    throw new HttpError(409, `Move or delete its ${rec.childCount} ${what} first`);
  }
  await at.remove(list, rid);
  return { deleted: rid };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/public/menu') {
      if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET' } });
      if (request.method === 'GET') return publicMenu(env);
      return json({ error: 'Method not allowed' }, 405);
    }

    const cors = corsHeaders(env, request.headers.get('Origin'));
    if (request.method === 'OPTIONS') return new Response(null, { status: cors ? 204 : 403, headers: cors ?? {} });
    // Only the website itself may use the admin endpoints from a browser.
    if (!cors) return json({ error: 'Forbidden' }, 403);

    try {
      const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
      if (url.pathname === '/login' && request.method === 'POST') return json(await login(request, env, ip), 200, cors);

      const token = (request.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
      if (!(await validSession(env, token))) return json({ error: 'Please sign in again' }, 401, cors);

      if (url.pathname === '/session' && request.method === 'GET') return json({ ok: true }, 200, cors);

      const at = airtableFor(env);
      if (url.pathname === '/admin/menu' && request.method === 'GET') return json(await at.listEverything(), 200, cors);

      const m = url.pathname.match(/^\/records\/([A-Za-z]+)(?:\/([A-Za-z0-9]+))?$/);
      if (m && Object.hasOwn(LISTS, m[1]) && (!m[2] || RECORD_ID.test(m[2]))) {
        const [, list, rid] = m;
        let result;
        if (!rid && request.method === 'POST') result = [await create(at, list, await readJson(request)), 201];
        else if (rid && request.method === 'PATCH') result = [await update(at, list, rid, await readJson(request)), 200];
        else if (rid && request.method === 'DELETE') result = [await remove(at, list, rid), 200];
        if (result) {
          publicCache = null; // this instance shows the change right away
          return json(result[0], result[1], cors);
        }
      }
      return json({ error: 'Not found' }, 404, cors);
    } catch (e) {
      const status = e instanceof HttpError ? e.status : e.status === 422 ? 400 : 500;
      if (status >= 500) console.error(e);
      // Never echo internal details (tokens, stack traces) back to the browser.
      const message = e instanceof HttpError || e.status === 422 ? e.message : 'Something went wrong. Please try again.';
      return json({ error: message }, status, cors);
    }
  },
};
