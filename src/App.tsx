import { useState, useEffect } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Login } from '@/pages/Login';
import { Dashboard } from '@/pages/Dashboard';
import { Withdraw } from '@/pages/Withdraw';
import { WithdrawFee } from '@/pages/WithdrawFee';
import { PrivacyPolicy } from '@/pages/PrivacyPolicy';
import { TermsOfService } from '@/pages/TermsOfService';
import { Help } from '@/pages/Help';
import { About } from '@/pages/About';
import { NotFound } from '@/pages/NotFound';
import { AdminApp } from '@/admin/AdminApp';
import { isAdminRoute } from '@/admin/adminSecurity';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/translations';
import { useTheme } from '@/hooks/useTheme';

type Page = 'login' | 'dashboard' | 'withdraw' | 'withdraw-fee' | 'privacy' | 'terms' | 'help' | 'about';

function App() {
  const { language } = useTranslation();
  const { isAuthenticated, login, logout } = useAuth();
  const { isReady } = useTheme();
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isUnknownRoute, setIsUnknownRoute] = useState(false);

  // URL-layer routing.
  //
  // The application has exactly TWO valid URLs:
  //   1. The base path with no hash           -> public app (login/dashboard)
  //   2. The base path with the admin hash    -> admin app
  //
  // Anything else (deprecated paths, the old #admin token, random URLs,
  // typos) renders <NotFound /> instead of falling through to the public
  // app. There is no catch-all redirect to the home page.
  useEffect(() => {
    const evaluateRoute = () => {
      const base = import.meta.env.BASE_URL || '/';
      const normalizedBase = base.endsWith('/') ? base : base + '/';
      const path = window.location.pathname.replace(/\/index\.html$/, '/');
      const normalizedPath = path.endsWith('/') ? path : path + '/';
      const pathOk = normalizedPath === normalizedBase;

      const hash = window.location.hash;
      // تجاوزنا دالة isAdminRoute مؤقتاً للتجربة، والآن نتحقق من كلمة admin مباشرة
      const adminHere = hash === '#admin';
      const hashOk = hash === '' || hash === '#' || adminHere;

      setIsAdmin(adminHere);
      setIsUnknownRoute(!pathOk || !hashOk);
    };

    evaluateRoute();
    window.addEventListener('hashchange', evaluateRoute);
    window.addEventListener('popstate', evaluateRoute);

    return () => {
      window.removeEventListener('hashchange', evaluateRoute);
      window.removeEventListener('popstate', evaluateRoute);
    };
  }, []);

  // Update page based on auth state
  useEffect(() => {
    if (isAuthenticated && currentPage === 'login') {
      setCurrentPage('dashboard');
    } else if (!isAuthenticated && currentPage !== 'login') {
      setCurrentPage('login');
    }
  }, [isAuthenticated, currentPage]);

  // Unknown URL? Show 404 instead of falling through to the public app.
  // This is checked FIRST so a malformed URL never reveals admin or app UI.
  if (isUnknownRoute) {
    return <NotFound />;
  }

  // If on admin page, render admin app
  if (isAdmin) {
    return <AdminApp />;
  }

  const handleLogin = async (email: string, password: string): Promise<boolean> => {
    const success = await login(email, password);
    if (success) {
      setCurrentPage('dashboard');
    }
    return success;
  };

  const handleLogout = () => {
    logout();
    setCurrentPage('login');
    setWithdrawAddress('');
  };

  const handleWithdraw = () => {
    setCurrentPage('withdraw');
  };

  const handleWithdrawNext = (address: string) => {
    setWithdrawAddress(address);
    setCurrentPage('withdraw-fee');
  };

  const handleBackToDashboard = () => {
    setCurrentPage('dashboard');
    setWithdrawAddress('');
  };

  const handleBackToWithdraw = () => {
    setCurrentPage('withdraw');
  };

  const handlePrivacyClick = () => {
    setCurrentPage('privacy');
  };

  const handleTermsClick = () => {
    setCurrentPage('terms');
  };

  const handleHelpClick = () => {
    setCurrentPage('help');
  };

  const handleAboutClick = () => {
    setCurrentPage('about');
  };

  const renderPage = () => {
    // Render-time authentication gate: every page other than `login`
    // requires a valid session. If `isAuthenticated` is false (for any
    // reason - logout, tampered session, expired record, etc.) we hard
    // short-circuit to the login form instead of trusting the
    // currentPage state. This blocks IDOR/privilege-escalation attempts
    // via local state manipulation.
    if (currentPage !== 'login' && !isAuthenticated) {
      return <Login onLogin={handleLogin} />;
    }

    switch (currentPage) {
      case 'login':
        return <Login onLogin={handleLogin} />;
      case 'dashboard':
        return (
          <>
            <Dashboard onWithdraw={handleWithdraw} />
            <Footer 
              onPrivacyClick={handlePrivacyClick} 
              onTermsClick={handleTermsClick}
              onHelpClick={handleHelpClick}
              onAboutClick={handleAboutClick}
            />
          </>
        );
      case 'withdraw':
        return <Withdraw onBack={handleBackToDashboard} onNext={handleWithdrawNext} />;
      case 'withdraw-fee':
        return <WithdrawFee onBack={handleBackToWithdraw} bitcoinAddress={withdrawAddress} />;
      case 'privacy':
        return <PrivacyPolicy onBack={() => setCurrentPage('dashboard')} />;
      case 'terms':
        return <TermsOfService onBack={() => setCurrentPage('dashboard')} />;
      case 'help':
        return <Help onBack={() => setCurrentPage('dashboard')} />;
      case 'about':
        return <About onBack={() => setCurrentPage('dashboard')} />;
      default:
        // Unreachable given the Page union, but kept as a hard fallback so
        // any future enum drift surfaces as a 404 rather than silently
        // dumping the user onto the login page.
        return <NotFound />;
    }
  };

  // Wait for theme to be ready to avoid flash
  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0a0e17' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex flex-col transition-colors duration-300" 
      style={{ backgroundColor: 'var(--bg-primary)' }}
      dir={language === 'ar' ? 'rtl' : 'ltr'}
    >
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            background: 'var(--bg-secondary)',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border-color)',
          },
        }}
      />
      
      {/* Header - only show when not on login page */}
      {currentPage !== 'login' && (
        <Header isAuthenticated={isAuthenticated} onLogout={handleLogout} />
      )}
      
      {/* Main Content */}
      <main className="flex-1">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
