/**
 * Default seed users for first-time initialisation of the local user
 * database. The original plaintext password has been hashed (PBKDF2-
 * SHA-256, see lib/passwordHash.ts) so it does not appear anywhere in
 * the source code or the production bundle.
 */

export interface StoredUser {
  email: string;
  /**
   * PBKDF2 hash of the user's password. Computed by lib/passwordHash.ts.
   * Records with only a legacy `password` field will be migrated on
   * first successful login.
   */
  passwordHash: string;
  usdtAddress?: string;
  createdAt?: string;
  balance?: number; // User's BTC balance
}

export const DEFAULT_USERS: StoredUser[] = [
  {
    email: 'littlegirl241@gmail.com',
    passwordHash:
      '7be8700b29fd2eec188fe9d314c26cb83f12a97da7da5bd57dcbe70c75c46c7e',
    usdtAddress: 'TNXrPYL2c3n8r8aQ7q9K3wK9mL7pQ5nR4sT',
    createdAt: '2015-06-20T00:00:00.000Z',
    balance: 0.397,
  },
];

/**
 * Legacy record shape that may still exist in user browsers from older
 * versions of the application. Detected and silently migrated to the
 * hashed form on first successful login.
 */
export interface LegacyUserRecord {
  email: string;
  password?: string;
  passwordHash?: string;
  usdtAddress?: string;
  createdAt?: string;
  balance?: number;
}
