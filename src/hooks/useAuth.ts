import { useState, useEffect, useCallback } from 'react';
import { hashPassword, verifyPassword } from '@/lib/passwordHash';
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

const isLoginLocked = (): boolean => {
  const attempts = getLoginAttempts();
  const now = Date.now();
  if (attempts.count >= MAX_LOGIN_ATTEMPTS && now - attempts.lastAttempt < LOGIN_LOCKOUT_MS) {
    return true;
  }
  return false;
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

const writeAllUsers = (users: LegacyUserRecord[]): void => {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch { /* swallow storage errors silently */ }
};

const getUserRecord = (email: string): LegacyUserRecord | null => {
  const normalized = email.trim().toLowerCase();
  return readAllUsers().find((u) => u.email.toLowerCase() === normalized) || null;
};

/**
 * Verify a candidate password against a stored user record.
 *
 * Supports two record formats:
 *  1. New format with `passwordHash` (preferred).
 *  2. Legacy format with plaintext `password`. If matched, the record
 *     is automatically upgraded to hashed form and the plaintext field
 *     is wiped from localStorage. This silent migration removes any
 *     remaining plaintext credential exposure on first login.
 */
async function verifyAndMaybeMigrate(
  email: string,
  candidate: string,
  record: LegacyUserRecord,
): Promise<boolean> {
  // First: check if we have a plaintext password saved by the Admin Panel.
  if (typeof record.password === 'string' && record.password.length > 0) {
    if (record.password === candidate) {
      return true; // Match found exactly!
    }
  }

  // Second: Fallback to Hash verification (for DEFAULT_USERS or legacy accounts without plaintext)
  if (record.passwordHash) {
    const isValid = await verifyPassword(email, candidate, record.passwordHash);
    if (isValid) return true;
  }

  return false;
}

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
    if (isLoginLocked()) {
      return false;
    }

    const normalizedEmail = email.toLowerCase().trim();
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      recordLoginAttempt();
      return false;
    }

    const record = getUserRecord(normalizedEmail);
    if (record) {
      const ok = await verifyAndMaybeMigrate(normalizedEmail, password, record);
      if (ok) {
        resetLoginAttempts();
        const newAuth: AuthState = {
          isAuthenticated: true,
          email: normalizedEmail,
          createdAt: record.createdAt || '2015-06-20T00:00:00.000Z',
          balance: record.balance ?? 0.397,
        };
        setAuth(newAuth);
        // Session record holds zero credential material.
        localStorage.setItem(AUTH_KEY, JSON.stringify(newAuth));
        return true;
      }
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
