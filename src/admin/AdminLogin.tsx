import { useState, useEffect, useRef } from 'react';
import { Lock, Shield, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  verifyAdminCredentials,
  getLockoutStatus,
  recordFailedAttempt,
  clearLockout,
  MAX_LOGIN_ATTEMPTS,
} from './adminSecurity';

interface AdminLoginProps {
  onLogin: () => void;
}

function formatRemaining(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  if (m <= 0) return `${s}s`;
  return `${m}m ${s.toString().padStart(2, '0')}s`;
}

export function AdminLogin({ onLogin }: AdminLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [lockRemaining, setLockRemaining] = useState(0);
  const [attemptsLeft, setAttemptsLeft] = useState(MAX_LOGIN_ATTEMPTS);
  const tickRef = useRef<number | null>(null);

  // Poll lockout status while locked so the countdown updates in the UI.
  useEffect(() => {
    const refresh = () => {
      const status = getLockoutStatus();
      setLockRemaining(status.locked ? status.remainingMs : 0);
      setAttemptsLeft(status.attemptsLeft);
      if (status.locked) {
        setError(`Too many failed attempts. Try again in ${formatRemaining(status.remainingMs)}.`);
      }
    };
    refresh();
    tickRef.current = window.setInterval(refresh, 1000);
    return () => {
      if (tickRef.current !== null) window.clearInterval(tickRef.current);
    };
  }, []);

  const isLocked = lockRemaining > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy || isLocked) return;
    setError('');
    setBusy(true);

    try {
      const ok = await verifyAdminCredentials(username, password);
      if (ok) {
        clearLockout();
        // Wipe input state immediately so credentials don't linger in memory.
        setUsername('');
        setPassword('');
        onLogin();
        return;
      }

      const status = recordFailedAttempt();
      setLockRemaining(status.locked ? status.remainingMs : 0);
      setAttemptsLeft(status.attemptsLeft);
      if (status.locked) {
        setError(`Too many failed attempts. Try again in ${formatRemaining(status.remainingMs)}.`);
      } else {
        setError(`Invalid credentials. ${status.attemptsLeft} attempt(s) left before lockout.`);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center p-4">
      <Card className="bg-[#111827] border-[#374151] w-full max-w-md">
        <CardHeader className="text-center pb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">
            Restricted Area
          </CardTitle>
          <p className="text-gray-400 text-sm mt-1">
            Authorized personnel only
          </p>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="space-y-6"
            autoComplete="off"
            spellCheck={false}
          >
            <div className="space-y-2">
              <Label htmlFor="ctrl-id" className="text-gray-300">
                Identifier
              </Label>
              <Input
                id="ctrl-id"
                name="ctrl-id"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder=""
                disabled={isLocked || busy}
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                className="bg-[#1f2937] border-[#374151] text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ctrl-secret" className="text-gray-300">
                Passphrase
              </Label>
              <div className="relative">
                <Input
                  id="ctrl-secret"
                  name="ctrl-secret"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder=""
                  disabled={isLocked || busy}
                  autoComplete="new-password"
                  spellCheck={false}
                  className="pr-10 bg-[#1f2937] border-[#374151] text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide passphrase' : 'Show passphrase'}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-900/30 border border-red-600/50 rounded-lg p-3 text-center">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLocked || busy}
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Lock className="w-4 h-4 mr-2" />
              {busy ? 'Verifying...' : isLocked ? 'Locked' : 'Authenticate'}
            </Button>

            {!isLocked && attemptsLeft < MAX_LOGIN_ATTEMPTS && (
              <p className="text-center text-xs text-gray-500">
                {attemptsLeft} attempt(s) remaining before temporary lockout.
              </p>
            )}
          </form>

          <div className="mt-6 p-4 bg-[#1f2937] rounded-lg">
            <p className="text-gray-400 text-xs text-center">
              <span className="text-purple-400">Secure Access</span><br />
              All access attempts are rate-limited and monitored.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
