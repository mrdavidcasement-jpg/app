/* eslint-disable no-console */
/**
 * Generates a new admin username, password, salt, obfuscated route, and the
 * corresponding SHA-256 hashes that should be placed into .env.
 *
 * Usage:
 *   node scripts/generate-admin-credentials.cjs
 *
 * The plaintext password is printed ONCE to stdout. Save it in a password
 * manager - it is not stored anywhere else.
 */

const crypto = require('crypto');

const UPPER = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const LOWER = 'abcdefghijkmnpqrstuvwxyz';
const DIGIT = '23456789';
const SYM = '!@#$%^&*-_=+?';
const ALL = UPPER + LOWER + DIGIT + SYM;

function pick(set) {
  return set[crypto.randomInt(0, set.length)];
}

function buildPassword(len = 22) {
  // Guarantee at least 2 of each character class
  const out = [
    pick(UPPER), pick(UPPER),
    pick(LOWER), pick(LOWER),
    pick(DIGIT), pick(DIGIT),
    pick(SYM),   pick(SYM),
  ];
  while (out.length < len) out.push(pick(ALL));
  // Fisher-Yates shuffle
  for (let i = out.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out.join('');
}

const username = 'cl_root_' + crypto.randomBytes(6).toString('hex');
const password = buildPassword(22);
const salt = crypto.randomBytes(24).toString('hex');
const route = 'ctrl-' + crypto.randomBytes(10).toString('hex');

const userHash = crypto.createHash('sha256')
  .update(salt + ':USR:' + username.toLowerCase()).digest('hex');
const passHash = crypto.createHash('sha256')
  .update(salt + ':PWD:' + password).digest('hex');

console.log('\n=== NEW ADMIN CREDENTIALS (save these securely) ===');
console.log('Username: ' + username);
console.log('Password: ' + password);
console.log('\n=== Paste the following into .env ===');
console.log('VITE_ADMIN_ROUTE=' + route);
console.log('VITE_ADMIN_SALT=' + salt);
console.log('VITE_ADMIN_USER_HASH=' + userHash);
console.log('VITE_ADMIN_PASS_HASH=' + passHash);
console.log('');
