// Sets the admin page password. Only a hash of the password is stored (as the
// Worker secret ADMIN_PASSWORD_HASH), never the password itself.
//
// usage (from the project folder):
//   node scripts/hash-password.mjs          asks for the password and saves it to the Worker
//   node scripts/hash-password.mjs --print  only prints the hash
import { pbkdf2Sync, randomBytes } from 'node:crypto';
import { spawn } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ITERATIONS = 100_000; // Cloudflare Workers' PBKDF2 maximum
const ADMIN_API_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'admin-api');

// Reads lines from the terminal without showing what's typed.
const input = process.stdin;
let buffer = '';
let waiting = null;
input.setEncoding('utf8');
input.on('data', (chunk) => {
  for (const c of chunk) {
    if (c === '\u0003') process.exit(130); // Ctrl-C
    if (c === '\u007f' || c === '\b') buffer = buffer.slice(0, -1);
    else buffer += c;
  }
  flush();
});
function flush() {
  const i = buffer.search(/[\r\n]/);
  if (i < 0 || !waiting) return;
  const line = buffer.slice(0, i);
  buffer = buffer.slice(i + 1).replace(/^\n/, '');
  const resolve = waiting;
  waiting = null;
  process.stderr.write('\n');
  resolve(line);
}
function ask(prompt) {
  process.stderr.write(prompt);
  if (input.isTTY) input.setRawMode(true);
  input.resume();
  return new Promise((resolve) => {
    waiting = resolve;
    flush();
  });
}
function done() {
  if (input.isTTY) input.setRawMode(false);
  input.pause();
}

const pw = await ask('New admin password (typing is hidden): ');
if (pw.length < 12) {
  done();
  console.error('Use at least 12 characters: a few random words works well.');
  process.exit(1);
}
const again = await ask('Type it again: ');
done();
if (again !== pw) {
  console.error('Passwords did not match.');
  process.exit(1);
}

const salt = randomBytes(16);
const hash = `pbkdf2-sha256$${ITERATIONS}$${salt.toString('base64')}$${pbkdf2Sync(pw, salt, ITERATIONS, 32, 'sha256').toString('base64')}`;

if (process.argv.includes('--print')) {
  process.stdout.write(hash + '\n');
  process.exit(0);
}

// Hand the hash straight to Wrangler (no shell involved, so the $ signs survive).
console.error('Saving to the Cloudflare Worker…');
const wrangler = spawn('npx', ['--yes', 'wrangler@4', 'secret', 'put', 'ADMIN_PASSWORD_HASH'], {
  cwd: ADMIN_API_DIR,
  stdio: ['pipe', 'inherit', 'inherit'],
});
wrangler.stdin.end(hash);
wrangler.on('close', (code) => {
  if (code === 0) console.error('✓ Password changed. Sign in at /admin.');
  else console.error(`Wrangler exited with code ${code}. Run \`npx wrangler login\` in admin-api/ and try again.`);
  process.exit(code ?? 1);
});
