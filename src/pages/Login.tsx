import { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, Bitcoin, AlertTriangle, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ShutdownWarning } from '@/components/ShutdownWarning';
import { useTranslation, type Language } from '@/translations';

interface LoginProps {
  onLogin: (email: string, password: string) => boolean | Promise<boolean>;
}

const LOGIN_ATTEMPTS_KEY = 'cryptolegacy-login-attempts';
const LOGIN_LOCKOUT_MS = 15 * 60 * 1000;

function isLoginLocked(): boolean {
  try {
    const saved = localStorage.getItem(LOGIN_ATTEMPTS_KEY);
    if (saved) {
      const attempts = JSON.parse(saved);
      const now = Date.now();
      if (attempts.count >= 5 && now - attempts.lastAttempt < LOGIN_LOCKOUT_MS) {
        return true;
      }
    }
  } catch { /* ignore */ }
  return false;
}

export function Login({ onLogin }: LoginProps) {
  const { t, language, setLanguage } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLanguageChange = (lang: Language) => {
    if (lang !== language) {
      setLanguage(lang);
      window.location.reload();
    }
  };

  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setError('');

    if (isLoginLocked()) {
      setError(
        language === 'ar'
          ? 'تم قفل الحساب مؤقتاً. يرجى المحاولة بعد 15 دقيقة.'
          : language === 'fr'
          ? 'Compte temporairement verrouillé. Veuillez réessayer dans 15 minutes.'
          : 'Account temporarily locked. Please try again in 15 minutes.'
      );
      return;
    }

    if (!email || !password) {
      setError(t('invalidCredentials'));
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError(
        language === 'ar'
          ? 'يرجى إدخال بريد إلكتروني صحيح'
          : language === 'fr'
          ? 'Veuillez entrer un email valide'
          : 'Please enter a valid email address'
      );
      return;
    }

    setBusy(true);
    try {
      const success = await onLogin(trimmedEmail, password.trim());
      if (!success) {
        setError(t('invalidCredentials'));
      } else {
        // Wipe local state so credentials don't linger in memory.
        setPassword('');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col transition-colors duration-300"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      {/* Header with Logo and Language */}
      <header 
        className="w-full py-4 px-6 transition-colors duration-300"
        style={{ 
          backgroundColor: 'var(--bg-secondary)', 
          borderBottom: '1px solid var(--border-color)' 
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Bitcoin className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{t('platformName')}</span>
              <span className="text-xs text-amber-500/80">{t('platformTagline')}</span>
            </div>
          </div>

          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="transition-colors duration-300"
                style={{ 
                  borderColor: 'var(--border-color)', 
                  backgroundColor: 'var(--bg-input)',
                  color: 'var(--text-muted)'
                }}
              >
                <Globe className="w-4 h-4 mr-2" />
                {language === 'ar' ? t('arabic') : language === 'fr' ? t('french') : t('english')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              className="transition-colors duration-300"
              style={{ 
                backgroundColor: 'var(--bg-input)', 
                borderColor: 'var(--border-color)' 
              }}
            >
              <DropdownMenuItem
                onClick={() => handleLanguageChange('ar')}
                className="cursor-pointer transition-colors duration-300"
                style={{ 
                  color: 'var(--text-muted)',
                  backgroundColor: language === 'ar' ? 'var(--bg-hover)' : 'transparent'
                }}
              >
                {t('arabic')}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleLanguageChange('en')}
                className="cursor-pointer transition-colors duration-300"
                style={{ 
                  color: 'var(--text-muted)',
                  backgroundColor: language === 'en' ? 'var(--bg-hover)' : 'transparent'
                }}
              >
                {t('english')}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleLanguageChange('fr')}
                className="cursor-pointer transition-colors duration-300"
                style={{ 
                  color: 'var(--text-muted)',
                  backgroundColor: language === 'fr' ? 'var(--bg-hover)' : 'transparent'
                }}
              >
                {t('french')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Shutdown Warning */}
          <ShutdownWarning />

          {/* Login Message */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-amber-200 text-sm">{t('loginWarning')}</p>
          </div>

          {/* Login Card */}
          <div 
            className="border rounded-xl p-8 shadow-2xl animate-slide-up transition-colors duration-300"
            style={{ 
              backgroundColor: 'var(--bg-card)', 
              borderColor: 'var(--border-color)' 
            }}
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/20">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{t('login')}</h1>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {t('platformName')} - {t('dashboard')}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" style={{ color: 'var(--text-muted)' }}>
                  {t('email')}
                </Label>
                <div className="relative">
                  <Mail 
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" 
                    style={{ color: 'var(--text-muted)' }} 
                  />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('enterEmail')}
                    autoComplete="email"
                    className="pl-10 transition-colors duration-300"
                    style={{ 
                      backgroundColor: 'var(--bg-input)', 
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" style={{ color: 'var(--text-muted)' }}>
                  {t('password')}
                </Label>
                <div className="relative">
                  <Lock 
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" 
                    style={{ color: 'var(--text-muted)' }} 
                  />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('enterPassword')}
                    autoComplete="current-password"
                    className="pl-10 pr-10 transition-colors duration-300"
                    style={{ 
                      backgroundColor: 'var(--bg-input)', 
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-900/30 border border-red-600/50 rounded-lg p-3 text-center">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold py-3"
              >
                {t('signIn')}
              </Button>
            </form>

            {/* Footer Note */}
            <div className="mt-6 text-center">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {t('copyright')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
