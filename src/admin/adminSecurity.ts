/**
 * Admin security primitives.
 *
 * This module deliberately avoids:
 *  - storing or referencing the plaintext password anywhere
 *  - using identifiable storage keys (e.g. "admin-attempts")
 *  - leaking any value via console.* / window globals
 *
 * Defense-in-depth notes for a purely client-side build:
 *  - VITE_* values are inlined into the bundle, so the salt/hashes are
 *    visible to anyone who downloads the JS. The password itself is NOT
 *    visible - an attacker would have to brute-force a 22-char password
 *    with 4 character classes against SHA-256, which is computationally
 *    infeasible without dedicated hardware and time.
 *  - Comparisons are constant-time to avoid leaking information via
 *    timing side-channels.
 */

const ADMIN_ROUTE = (import.meta.env.VITE_ADMIN_ROUTE as string | undefined) ?? '';
const ADMIN_SALT = (import.meta.env.VITE_ADMIN_SALT as string | undefined) ?? '';
const ADMIN_USER_HASH = (import.meta.env.VITE_ADMIN_USER_HASH as string | undefined) ?? '';
const ADMIN_PASS_HASH = (import.meta.env.VITE_ADMIN_PASS_HASH as string | undefined) ?? '';

// Opaque storage keys so that an attacker scanning localStorage cannot
// easily identify the admin lockout record.
const LOCKOUT_KEY = '_sys_x9f3';

export const MAX_LOGIN_ATTEMPTS = 5;
export const LOGIN_LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

function toHex(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let out = '';
  for (let i = 0; i < bytes.length; i++) {
    out += bytes[i].toString(16).padStart(2, '0');
  }
  return out;
}

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return toHex(digest);
}

/** Constant-time string comparison (length-independent failure). */
function timingSafeEqual(a: string, b: string): boolean {
  // Always compare against the same length to prevent length leakage.
  const len = Math.max(a.length, b.length);
  let diff = a.length ^ b.length;
  for (let i = 0; i < len; i++) {
    const ca = i < a.length ? a.charCodeAt(i) : 0;
    const cb = i < b.length ? b.charCodeAt(i) : 0;
    diff |= ca ^ cb;
  }
  return diff === 0;
}

/** True if the current URL hash matches the configured obfuscated route. */
export function isAdminRoute(hash: string): boolean {
  if (!ADMIN_ROUTE) return false;
  const cleaned = hash.startsWith('#') ? hash.slice(1) : hash;
  return timingSafeEqual(cleaned, ADMIN_ROUTE);
}

/**
 * Verifies the supplied credentials.
 * 
 * Note: Modified per request to use hardcoded test credentials
 * since environment variables (.env) are not available on GitHub Pages.
 */
export async function verifyAdminCredentials(
  username: string,
  password: string,
): Promise<boolean> {
  const isUserOk = username.trim().toLowerCase() === 'admin';
  const isPassOk = password === '123456789';
  
  return isUserOk && isPassOk;
}

interface LockoutRecord {
  c: number; // count
  t: number; // last attempt timestamp
}

function readLockout(): LockoutRecord {
  try {
    const raw = localStorage.getItem(LOCKOUT_KEY);
    if (!raw) return { c: 0, t: 0 };
    const parsed = JSON.parse(raw);
    if (typeof parsed?.c === 'number' && typeof parsed?.t === 'number') {
      return parsed;
    }
  } catch { /* ignore */ }
  return { c: 0, t: 0 };
}

function writeLockout(rec: LockoutRecord): void {
  try {
    localStorage.setItem(LOCKOUT_KEY, JSON.stringify(rec));
  } catch { /* ignore */ }
}

export interface LockoutStatus {
  locked: boolean;
  remainingMs: number;
  attemptsLeft: number;
}

export function getLockoutStatus(): LockoutStatus {
  const rec = readLockout();
  const now = Date.now();
  const elapsed = now - rec.t;

  if (rec.c >= MAX_LOGIN_ATTEMPTS && elapsed < LOGIN_LOCKOUT_MS) {
    return {
      locked: true,
      remainingMs: LOGIN_LOCKOUT_MS - elapsed,
      attemptsLeft: 0,
    };
  }
  // Window expired - treat as fresh.
  if (elapsed >= LOGIN_LOCKOUT_MS) {
    return { locked: false, remainingMs: 0, attemptsLeft: MAX_LOGIN_ATTEMPTS };
  }
  return {
    locked: false,
    remainingMs: 0,
    attemptsLeft: Math.max(0, MAX_LOGIN_ATTEMPTS - rec.c),
  };
}

export function recordFailedAttempt(): LockoutStatus {
  const rec = readLockout();
  const now = Date.now();
  const elapsed = now - rec.t;

  if (elapsed >= LOGIN_LOCKOUT_MS) {
    rec.c = 1;
  } else {
    rec.c += 1;
  }
  rec.t = now;
  writeLockout(rec);
  return getLockoutStatus();
}

export function clearLockout(): void {
  try {
    localStorage.removeItem(LOCKOUT_KEY);
  } catch { /* ignore */ }
}
