import { useState, useEffect } from 'react';
import { X, Moon, Sun, Lock, Shield, Check, Eye, EyeOff, ChevronDown, Mail, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useTranslation } from '@/translations';
import { useTheme } from '@/hooks/useTheme';
import { verifyPassword } from '@/lib/passwordHash';
import { DEFAULT_USERS, type LegacyUserRecord } from '@/lib/defaultUsers';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const USERS_KEY = 'cryptolegacy-users';
const AUTH_KEY = 'crypto-wallet-auth';

// Single hardcoded user fallback
const HARDCODED_USER = {
  name: 'زينب',
  email: 'zineb@gmail.com',
  password: 'Money1996',
  usdtAddress: 'TBnXgXvfoUiZD3nKbQzoBW4am4eKZAZk6r',
  createdAt: '2015-06-20T00:00:00.000Z',
  balance: 0.397,
};

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { language } = useTranslation();
  const { theme, setTheme } = useTheme();
  
  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Account details state
  const [showAccountDetails, setShowAccountDetails] = useState(false);
  const [userData, setUserData] = useState<{ name: string; email: string; createdAt: string } | null>(null);

  // Load user data
  useEffect(() => {
    const authData = localStorage.getItem(AUTH_KEY);
    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        const isHardcoded = parsed.email?.toLowerCase() === HARDCODED_USER.email.toLowerCase();
        setUserData({
          name: parsed.name || (isHardcoded ? HARDCODED_USER.name : 'User'),
          email: parsed.email || '',
          createdAt: parsed.createdAt || '2015-06-20T00:00:00.000Z',
        });
      } catch (e) {
        setUserData(null);
      }
    }
  }, [isOpen]);

  // Initialize users if not exists
  useEffect(() => {
    const savedUsers = localStorage.getItem(USERS_KEY);
    if (!savedUsers) {
      localStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS));
    }
  }, []);

  const handleThemeChange = (newTheme: 'dark' | 'light') => {
    setTheme(newTheme);
    
    toast.success(
      language === 'ar' 
        ? 'تم تغيير السمة بنجاح' 
        : language === 'fr'
        ? 'Thème modifié avec succès'
        : 'Theme changed successfully'
    );
  };

  const handlePasswordChange = async () => {
    // Validate inputs
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error(
        language === 'ar'
          ? 'يرجى ملء جميع الحقول'
          : language === 'fr'
          ? 'Veuillez remplir tous les champs'
          : 'Please fill in all fields'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error(
        language === 'ar'
          ? 'كلمتا المرور الجديدتان غير متطابقتين'
          : language === 'fr'
          ? 'Les nouveaux mots de passe ne correspondent pas'
          : 'New passwords do not match'
      );
      return;
    }

    if (newPassword.length < 8) {
      toast.error(
        language === 'ar'
          ? 'يجب أن تكون كلمة المرور الجديدة 8 أحرف على الأقل'
          : language === 'fr'
          ? 'Le nouveau mot de passe doit contenir au moins 8 caractères'
          : 'New password must be at least 8 characters'
      );
      return;
    }

    const hasUppercase = /[A-Z]/.test(newPassword);
    const hasLowercase = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    if (!hasUppercase || !hasLowercase || !hasNumber) {
      toast.error(
        language === 'ar'
          ? 'يجب أن تحتوي كلمة المرور على حرف كبير وحرف صغير ورقم'
          : language === 'fr'
          ? 'Le mot de passe doit contenir une majuscule, une minuscule et un chiffre'
          : 'Password must contain an uppercase letter, a lowercase letter, and a number'
      );
      return;
    }

    // Get current user email
    const authData = localStorage.getItem(AUTH_KEY);
    if (!authData) {
      toast.error('User not logged in');
      return;
    }

    let email = '';
    try {
      const parsed = JSON.parse(authData);
      email = parsed.email;
    } catch (e) {
      toast.error('Error reading user data');
      return;
    }

    if (!email) {
      toast.error('User email not found');
      return;
    }

    const isHardcoded = email.toLowerCase() === HARDCODED_USER.email.toLowerCase();

    // Verify current password
    let currentOk = false;

    if (isHardcoded) {
      // For the hardcoded user: check localStorage first, then fallback to hardcoded password
      let storedPassword: string | null = null;
      try {
        const raw = localStorage.getItem(USERS_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            const user = parsed.find((u: LegacyUserRecord) =>
              u.email.toLowerCase() === email.toLowerCase()
            );
            if (user && typeof user.password === 'string' && user.password.length > 0) {
              storedPassword = user.password;
            }
          }
        }
      } catch { /* ignore */ }
      const effectiveCurrent = storedPassword ?? HARDCODED_USER.password;
      currentOk = currentPassword === effectiveCurrent;
    } else {
      // For admin-created users: verify against localStorage record
      let users: LegacyUserRecord[] = [];
      try {
        const savedUsers = localStorage.getItem(USERS_KEY);
        if (savedUsers) {
          const parsed = JSON.parse(savedUsers);
          users = Array.isArray(parsed) ? parsed : [];
        } else {
          users = [...DEFAULT_USERS];
          localStorage.setItem(USERS_KEY, JSON.stringify(users));
        }
      } catch {
        toast.error('Error reading users data');
        return;
      }

      const stored = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (stored) {
        if (typeof stored.password === 'string' && stored.password.length > 0) {
          currentOk = stored.password === currentPassword;
        } else if (stored.passwordHash) {
          currentOk = await verifyPassword(stored.email, currentPassword, stored.passwordHash);
        }
      }
    }

    if (!currentOk) {
      toast.error(
        language === 'ar'
          ? 'كلمة المرور الحالية غير صحيحة'
          : language === 'fr'
          ? 'Le mot de passe actuel est incorrect'
          : 'Current password is incorrect'
      );
      return;
    }

    // Save new password
    if (isHardcoded) {
      // Save plaintext password in localStorage for this browser
      let users: LegacyUserRecord[] = [];
      try {
        const raw = localStorage.getItem(USERS_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          users = Array.isArray(parsed) ? parsed : [];
        }
      } catch { /* ignore */ }

      const idx = users.findIndex((u) => u.email.toLowerCase() === email.toLowerCase());
      const newRecord: LegacyUserRecord = {
        email: HARDCODED_USER.email,
        name: HARDCODED_USER.name,
        password: newPassword, // Store updated password as plaintext
        createdAt: HARDCODED_USER.createdAt,
        balance: HARDCODED_USER.balance,
        usdtAddress: HARDCODED_USER.usdtAddress,
      };

      if (idx >= 0) {
        users[idx] = newRecord;
      } else {
        users.push(newRecord);
      }

      try {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
      } catch {
        toast.error('Error saving password');
        return;
      }
    } else {
      // For non-hardcoded users, update hash in localStorage
      let users: LegacyUserRecord[] = [];
      try {
        const raw = localStorage.getItem(USERS_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          users = Array.isArray(parsed) ? parsed : [];
        }
      } catch {
        toast.error('Error reading users data');
        return;
      }

      const idx = users.findIndex((u) => u.email.toLowerCase() === email.toLowerCase());
      if (idx >= 0) {
        const { password: _legacy, ...rest } = users[idx];
        void _legacy;
        users[idx] = { ...rest, passwordHash: '' }; // Mark for re-hash on next login
        try {
          localStorage.setItem(USERS_KEY, JSON.stringify(users));
        } catch {
          toast.error('Error saving password');
          return;
        }
      }
    }

    // Clear form
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');

    toast.success(
      language === 'ar'
        ? 'تم تغيير كلمة المرور بنجاح'
        : language === 'fr'
        ? 'Mot de passe modifié avec succès'
        : 'Password changed successfully'
    );
    
    // Close modal after success
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  const formatAccountAge = (createdAt: string) => {
    const createdDate = new Date(createdAt);
    const years = Math.max(0, new Date().getFullYear() - createdDate.getFullYear());

    if (language === 'ar') {
      return years > 0 ? `منذ ${years} سنوات` : 'تم إنشاؤه هذا العام';
    }

    if (language === 'fr') {
      return years > 0 ? `Depuis ${years} ans` : 'Créé cette année';
    }

    return years > 0 ? `${years} years ago` : 'Created this year';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="border max-w-md transition-colors duration-300"
        style={{ 
          backgroundColor: 'var(--bg-card)', 
          borderColor: 'var(--border-color)',
          color: 'var(--text-primary)'
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Shield className="w-5 h-5 text-amber-500" />
            {language === 'ar'
              ? 'الإعدادات'
              : language === 'fr'
              ? 'Paramètres'
              : 'Settings'}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="account" className="mt-4">
          <TabsList 
            className="border w-full transition-colors duration-300"
            style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)' }}
          >
            <TabsTrigger 
              value="account" 
              className="flex-1 data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400"
            >
              {language === 'ar'
                ? 'الحساب'
                : language === 'fr'
                ? 'Compte'
                : 'Account'}
            </TabsTrigger>
            <TabsTrigger 
              value="appearance" 
              className="flex-1 data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400"
            >
              {language === 'ar'
                ? 'المظهر'
                : language === 'fr'
                ? 'Apparence'
                : 'Appearance'}
            </TabsTrigger>
            <TabsTrigger 
              value="security"
              className="flex-1 data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400"
            >
              {language === 'ar'
                ? 'الأمان'
                : language === 'fr'
                ? 'Sécurité'
                : 'Security'}
            </TabsTrigger>
          </TabsList>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-4 mt-4">
            <div className="space-y-4">
              {/* Avatar */}
              <div 
                className="flex items-center gap-4 rounded-2xl border p-4"
                style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)' }}
              >
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 shadow-xl flex-shrink-0" style={{ borderColor: 'rgba(236, 72, 153, 0.35)' }}>
                  <svg viewBox="0 0 100 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Avatar">
                    <defs>
                      <linearGradient id="avatarBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#f9a8d4" />
                        <stop offset="52%" stopColor="#c084fc" />
                        <stop offset="100%" stopColor="#6366f1" />
                      </linearGradient>
                      <linearGradient id="avatarHairGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#7c2d12" />
                        <stop offset="100%" stopColor="#3b0764" />
                      </linearGradient>
                    </defs>
                    <circle cx="50" cy="50" r="50" fill="url(#avatarBgGrad)" />
                    <path d="M24 72 C24 34 34 17 50 17 C66 17 76 34 76 72 C66 66 34 66 24 72 Z" fill="url(#avatarHairGrad)" opacity="0.92" />
                    <ellipse cx="50" cy="45" rx="18" ry="21" fill="#f5d0c5" />
                    <path d="M26 92 C31 72 40 65 50 65 C60 65 69 72 74 92 Z" fill="rgba(255,255,255,0.36)" />
                    <path d="M33 32 C41 20 60 20 68 33 C58 29 44 29 33 32 Z" fill="url(#avatarHairGrad)" />
                    <circle cx="76" cy="24" r="10" fill="rgba(255,255,255,0.18)" />
                  </svg>
                </div>

                {/* User Name */}
                <div className="min-w-0 flex-1 text-start">
                  <p className="text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>
                    {language === 'ar' ? 'ملف الحساب' : language === 'fr' ? 'Profil du compte' : 'Account Profile'}
                  </p>
                  <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                    {userData?.name || (language === 'ar' ? 'المستخدمة' : language === 'fr' ? 'Utilisatrice' : 'User')}
                  </h3>
                  <p className="text-sm mt-1 truncate" style={{ color: 'var(--text-muted)' }}>
                    {userData?.email ? userData.email.replace(/(.{2}).*?(@.*)/, '$1***$2') : '---'}
                  </p>
                  <div className="inline-flex items-center gap-2 mt-3 rounded-full px-3 py-1 text-xs font-medium bg-emerald-500/10 text-emerald-400">
                    <Shield className="w-3.5 h-3.5" />
                    {language === 'ar' ? 'حساب محمي' : language === 'fr' ? 'Compte protégé' : 'Protected account'}
                  </div>
                </div>
              </div>

              {/* View Details Button */}
              <Button
                variant="outline"
                onClick={() => setShowAccountDetails(!showAccountDetails)}
                className="w-full transition-colors duration-300"
                style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}
              >
                <span className="flex-1">
                  {language === 'ar'
                    ? 'عرض التفاصيل'
                    : language === 'fr'
                    ? 'Voir les détails'
                    : 'View Details'}
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showAccountDetails ? 'rotate-180' : ''}`} />
              </Button>

              {/* Details Panel */}
              {showAccountDetails && userData && (
                <div 
                  className="w-full rounded-xl p-4 space-y-3 text-start border"
                  style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)' }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <Mail className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {language === 'ar' ? 'البريد الإلكتروني' : language === 'fr' ? 'Email' : 'Email'}
                      </p>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {userData.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                      <CalendarDays className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {language === 'ar' ? 'تاريخ إنشاء الحساب' : language === 'fr' ? 'Date de création' : 'Account Created'}
                      </p>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {formatAccountAge(userData.createdAt)}
                      </p>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                        {new Date(userData.createdAt).toLocaleDateString(
                          language === 'ar' ? 'ar-SA' : language === 'fr' ? 'fr-FR' : 'en-US',
                          { year: 'numeric', month: 'long', day: 'numeric' }
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-4 mt-4">
            <div className="space-y-3">
              <Label style={{ color: 'var(--text-muted)' }}>
                {language === 'ar'
                  ? 'السمة'
                  : language === 'fr'
                  ? 'Thème'
                  : 'Theme'}
              </Label>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleThemeChange('dark')}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                    theme === 'dark'
                      ? 'border-amber-500 bg-amber-500/10'
                      : 'hover:border-[var(--border-hover)]'
                  }`}
                  style={{ 
                    backgroundColor: theme === 'dark' ? 'rgba(245, 158, 11, 0.1)' : 'var(--bg-input)',
                    borderColor: theme === 'dark' ? '#f59e0b' : 'var(--border-color)'
                  }}
                >
                  <Moon className={`w-6 h-6 ${theme === 'dark' ? 'text-amber-400' : 'text-gray-400'}`} />
                  <div className="text-left">
                    <p className="font-medium" style={{ color: theme === 'dark' ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                      {language === 'ar'
                        ? 'داكن'
                        : language === 'fr'
                        ? 'Sombre'
                        : 'Dark'}
                    </p>
                    {theme === 'dark' && (
                      <Check className="w-4 h-4 text-amber-500 mt-1" />
                    )}
                  </div>
                </button>

                <button
                  onClick={() => handleThemeChange('light')}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                    theme === 'light'
                      ? 'border-amber-500 bg-amber-500/10'
                      : 'hover:border-[var(--border-hover)]'
                  }`}
                  style={{ 
                    backgroundColor: theme === 'light' ? 'rgba(245, 158, 11, 0.1)' : 'var(--bg-input)',
                    borderColor: theme === 'light' ? '#f59e0b' : 'var(--border-color)'
                  }}
                >
                  <Sun className={`w-6 h-6 ${theme === 'light' ? 'text-amber-400' : 'text-gray-400'}`} />
                  <div className="text-left">
                    <p className="font-medium" style={{ color: theme === 'light' ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                      {language === 'ar'
                        ? 'فاتح'
                        : language === 'fr'
                        ? 'Clair'
                        : 'Light'}
                    </p>
                    {theme === 'light' && (
                      <Check className="w-4 h-4 text-amber-500 mt-1" />
                    )}
                  </div>
                </button>
              </div>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Lock className="w-5 h-5 text-green-500" />
                <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>
                  {language === 'ar'
                    ? 'تغيير كلمة المرور'
                    : language === 'fr'
                    ? 'Changer le mot de passe'
                    : 'Change Password'}
                </h3>
              </div>

              {/* Current Password */}
              <div className="space-y-2">
                <Label className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {language === 'ar'
                    ? 'كلمة المرور الحالية'
                    : language === 'fr'
                    ? 'Mot de passe actuel'
                    : 'Current Password'}
                </Label>
                <div className="relative">
                  <Input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder={language === 'ar' ? 'أدخل كلمة المرور الحالية' : language === 'fr' ? 'Entrez le mot de passe actuel' : 'Enter current password'}
                    autoComplete="current-password"
                    className="pr-10 transition-colors duration-300"
                    style={{ 
                      backgroundColor: 'var(--bg-input)', 
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <Label className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {language === 'ar'
                    ? 'كلمة المرور الجديدة'
                    : language === 'fr'
                    ? 'Nouveau mot de passe'
                    : 'New Password'}
                </Label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={language === 'ar' ? 'أدخل كلمة المرور الجديدة' : language === 'fr' ? 'Entrez le nouveau mot de passe' : 'Enter new password'}
                    autoComplete="new-password"
                    className="pr-10 transition-colors duration-300"
                    style={{ 
                      backgroundColor: 'var(--bg-input)', 
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div className="space-y-2">
                <Label className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {language === 'ar'
                    ? 'تأكيد كلمة المرور الجديدة'
                    : language === 'fr'
                    ? 'Confirmer le nouveau mot de passe'
                    : 'Confirm New Password'}
                </Label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={language === 'ar' ? 'أعد إدخال كلمة المرور الجديدة' : language === 'fr' ? 'Confirmez le nouveau mot de passe' : 'Confirm new password'}
                    autoComplete="new-password"
                    className="pr-10 transition-colors duration-300"
                    style={{ 
                      backgroundColor: 'var(--bg-input)', 
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                onClick={handlePasswordChange}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold"
              >
                <Lock className="w-4 h-4 mr-2" />
                {language === 'ar'
                  ? 'تغيير كلمة المرور'
                  : language === 'fr'
                  ? 'Changer le mot de passe'
                  : 'Change Password'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <Button
          onClick={onClose}
          variant="outline"
          className="w-full mt-4 transition-colors duration-300"
          style={{ 
            borderColor: 'var(--border-color)', 
            backgroundColor: 'var(--bg-input)',
            color: 'var(--text-muted)'
          }}
        >
          <X className="w-4 h-4 mr-2" />
          {language === 'ar'
            ? 'إغلاق'
            : language === 'fr'
            ? 'Fermer'
            : 'Close'}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
