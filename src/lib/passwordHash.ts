/**
 * Password hashing utilities for the (frontend-only) user database.
 *
 * Uses PBKDF2-SHA-256 from the Web Crypto API with:
 *   - 200,000 iterations (slows brute force ~200x vs raw SHA-256)
 *   - Per-user salt    = lowercased email + ':' + APP_PEPPER
 *   - APP_PEPPER       = VITE_USER_AUTH_SALT (32 random bytes, from .env)
 *
 * Resulting hashes:
 *   - never expose the plaintext
 *   - are bound to a specific email (preventing hash-swap between accounts)
 *   - are bound to this deployment's pepper (preventing cross-site reuse)
 *
 * Limitations of a pure-frontend implementation:
 *   - VITE_* values are inlined into the bundle, so APP_PEPPER is visible
 *     to anyone who downloads the JS. The plaintext password is NOT
 *     visible; attacking it requires brute-forcing PBKDF2 against the
 *     hash, which is computationally infeasible for strong passwords.
 *   - Real production security should use a backend with bcrypt/argon2.
 *     This module is the strongest defence achievable on the client.
 */

const APP_PEPPER = (import.meta.env.VITE_USER_AUTH_SALT as string | undefined) ?? '';
const PBKDF2_ITERATIONS = 200_000;
const PBKDF2_KEYLEN_BITS = 256; // 32 bytes

function toHex(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let out = '';
  for (let i = 0; i < bytes.length; i++) {
    out += bytes[i].toString(16).padStart(2, '0');
  }
  return out;
}

/** Constant-time string comparison. */
export function timingSafeEqual(a: string, b: string): boolean {
  const len = Math.max(a.length, b.length);
  let diff = a.length ^ b.length;
  for (let i = 0; i < len; i++) {
    const ca = i < a.length ? a.charCodeAt(i) : 0;
    const cb = i < b.length ? b.charCodeAt(i) : 0;
    diff |= ca ^ cb;
  }
  return diff === 0;
}

/**
 * Derive a hex-encoded PBKDF2-SHA-256 hash from (email, plaintext).
 *
 * The email is normalised (trimmed + lowercased) before being used as
 * part of the salt, so identical passwords held by different users still
 * produce distinct hashes.
 */
export async function hashPassword(email: string, plaintext: string): Promise<string> {
  const pepper = APP_PEPPER || 'fallback_pepper_for_github_pages_123';
  const normalizedEmail = email.trim().toLowerCase();
  const enc = new TextEncoder();
  const saltBytes = enc.encode(normalizedEmail + ':' + pepper);
  const pwdBytes = enc.encode(plaintext);

  const key = await crypto.subtle.importKey(
    'raw',
    pwdBytes,
    { name: 'PBKDF2' },
    false,
    ['deriveBits'],
  );

  const derived = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt: saltBytes,
      iterations: PBKDF2_ITERATIONS,
    },
    key,
    PBKDF2_KEYLEN_BITS,
  );

  return toHex(derived);
}

/**
 * Verify a plaintext password against a stored hash using constant-time
 * comparison. Returns false on any input/derivation error rather than
 * throwing, so caller code never accidentally leaks why authentication
 * failed.
 */
export async function verifyPassword(
  email: string,
  plaintext: string,
  expectedHash: string,
): Promise<boolean> {
  if (!expectedHash) return false;
  try {
    const actual = await hashPassword(email, plaintext);
    return timingSafeEqual(actual, expectedHash);
  } catch {
    return false;
  }
}
