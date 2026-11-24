// Turns the admin password into the ADMIN_PASSWORD_HASH secret for the admin
// API, so the password itself is never stored anywhere.
//
// usage (from admin-api/):
//   node ../scripts/hash-password.mjs | npx wrangler secret put ADMIN_PASSWORD_HASH
import { pbkdf2Sync, randomBytes } from 'node:crypto';

const ITERATIONS = 100_000; // Cloudflare Workers' PBKDF2 maximum

function ask(prompt) {
  return new Promise((resolve) => {
    const input = process.stdin;
    process.stderr.write(prompt);
    let value = '';
    if (input.isTTY) input.setRawMode(true);
    input.resume();
    input.setEncoding('utf8');
    input.on('data', function onData(chunk) {
      for (const c of chunk) {
        if (c === '\r' || c === '\n') {
          if (input.isTTY) input.setRawMode(false);
          input.pause();
          input.off('data', onData);
          process.stderr.write('\n');
          return resolve(value);
        }
        if (c === '\u0003') process.exit(130); // Ctrl-C
        if (c === '\u007f') value = value.slice(0, -1);
        else value += c;
      }
    });
  });
}

const pw = await ask('Admin password (hidden): ');
if (pw.length < 12) {
  console.error('Use at least 12 characters: a few random words works well.');
  process.exit(1);
}
if ((await ask('Type it again: ')) !== pw) {
  console.error('Passwords did not match.');
  process.exit(1);
}
const salt = randomBytes(16);
const hash = pbkdf2Sync(pw, salt, ITERATIONS, 32, 'sha256');
process.stdout.write(`pbkdf2-sha256$${ITERATIONS}$${salt.toString('base64')}$${hash.toString('base64')}\n`);
