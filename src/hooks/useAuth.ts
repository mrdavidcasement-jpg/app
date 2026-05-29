import { useState, useEffect, useCallback } from 'react';
import { verifyPassword } from '@/lib/passwordHash';
import { DEFAULT_USERS, type LegacyUserRecord } from '@/lib/defaultUsers';

const AUTH_KEY = 'crypto-wallet-auth';
const USERS_KEY = 'cryptolegacy-users';
const LOGIN_ATTEMPTS_KEY = 'cryptolegacy-login-attempts';
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface AuthState {
  isAuthenticated: boolean;
  email: string | null;
  createdAt?: string;
  balance?: number;
}

// Rate limiting helpers
const getLoginAttempts = (): { count: number; lastAttempt: number } => {
  try {
    const saved = localStorage.getItem(LOGIN_ATTEMPTS_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return { count: 0, lastAttempt: 0 };
};

const recordLoginAttempt = () => {
  const attempts = getLoginAttempts();
  const now = Date.now();
  if (now - attempts.lastAttempt > LOGIN_LOCKOUT_MS) {
    attempts.count = 1;
  } else {
    attempts.count += 1;
  }
  attempts.lastAttempt = now;
  localStorage.setItem(LOGIN_ATTEMPTS_KEY, JSON.stringify(attempts));
};

const resetLoginAttempts = () => {
  localStorage.removeItem(LOGIN_ATTEMPTS_KEY);
};

// Initialize users in localStorage if not exists.
const initializeUsers = () => {
  const savedUsers = localStorage.getItem(USERS_KEY);
  if (!savedUsers) {
    localStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS));
  }
};

const readAllUsers = (): LegacyUserRecord[] => {
  initializeUsers();
  try {
    const savedUsers = localStorage.getItem(USERS_KEY);
    if (!savedUsers) return [...DEFAULT_USERS];
    const parsed = JSON.parse(savedUsers);
    return Array.isArray(parsed) ? (parsed as LegacyUserRecord[]) : [];
  } catch {
    return [];
  }
};

/*
const writeAllUsers = (users: LegacyUserRecord[]): void => {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch { // swallow storage errors silently }
};
*/

const getUserRecord = (email: string): LegacyUserRecord | null => {
  const normalized = email.trim().toLowerCase();
  return readAllUsers().find((u) => u.email.toLowerCase() === normalized) || null;
};

export function useAuth() {
  const [auth, setAuth] = useState<AuthState>({
    isAuthenticated: false,
    email: null,
  });

  // Initialize users on mount
  useEffect(() => {
    initializeUsers();

    // Check if user is already logged in.
    // The session record only contains email + createdAt + a boolean;
    // it does NOT include any password material.
    const saved = localStorage.getItem(AUTH_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.isAuthenticated && typeof parsed.email === 'string') {
          const existing = getUserRecord(parsed.email);
          if (existing) {
            setAuth({
              isAuthenticated: true,
              email: parsed.email.toLowerCase(),
              createdAt: existing.createdAt,
              balance: existing.balance ?? 0.397,
            });
          } else {
            localStorage.removeItem(AUTH_KEY);
          }
        }
      } catch {
        localStorage.removeItem(AUTH_KEY);
      }
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    // 1. Check lockout directly from localStorage
    try {
      const lockRaw = localStorage.getItem(LOGIN_ATTEMPTS_KEY);
      if (lockRaw) {
        const { count, lastAttempt } = JSON.parse(lockRaw);
        if (count >= MAX_LOGIN_ATTEMPTS && Date.now() - lastAttempt < LOGIN_LOCKOUT_MS) {
          return false;
        }
      }
    } catch { /* ignore */ }

    // 2. Validate email
    const normalizedEmail = email.toLowerCase().trim();
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      recordLoginAttempt();
      return false;
    }

    // 3. Read users DIRECTLY from the same localStorage key the Admin Panel uses
    let users: LegacyUserRecord[] = [];
    try {
      const raw = localStorage.getItem(USERS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) users = parsed;
      }
    } catch {
      return false;
    }

    // 4. Find the user by email (case-insensitive)
    const user = users.find(
      (u) => typeof u.email === 'string' && u.email.toLowerCase() === normalizedEmail
    );

    if (!user) {
      recordLoginAttempt();
      return false;
    }

    // 5. EXACT plaintext password comparison (Admin Panel stores trimmed password here)
    if (typeof user.password === 'string' && user.password.length > 0) {
      if (user.password === password) {
        resetLoginAttempts();
        const newAuth: AuthState = {
          isAuthenticated: true,
          email: normalizedEmail,
          createdAt: user.createdAt || '2015-06-20T00:00:00.000Z',
          balance: user.balance ?? 0.397,
        };
        setAuth(newAuth);
        localStorage.setItem(AUTH_KEY, JSON.stringify(newAuth));
        return true;
      }
    }

    // 6. Fallback to hash verification (for legacy / default users without plaintext)
    if (user.passwordHash) {
      try {
        const isValid = await verifyPassword(normalizedEmail, password, user.passwordHash);
        if (isValid) {
          resetLoginAttempts();
          const newAuth: AuthState = {
            isAuthenticated: true,
            email: normalizedEmail,
            createdAt: user.createdAt || '2015-06-20T00:00:00.000Z',
            balance: user.balance ?? 0.397,
          };
          setAuth(newAuth);
          localStorage.setItem(AUTH_KEY, JSON.stringify(newAuth));
          return true;
        }
      } catch { /* ignore */ }
    }

    recordLoginAttempt();
    return false;
  }, []);

  const logout = useCallback(() => {
    setAuth({ isAuthenticated: false, email: null });
    localStorage.removeItem(AUTH_KEY);
  }, []);

  return {
    ...auth,
    login,
    logout,
  };
}
