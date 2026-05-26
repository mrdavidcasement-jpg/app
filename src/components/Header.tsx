import { Globe, LogOut, Bitcoin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslation, type Language } from '@/translations';

interface HeaderProps {
  isAuthenticated: boolean;
  onLogout: () => void;
  showLogo?: boolean;
}

export function Header({ isAuthenticated, onLogout, showLogo = true }: HeaderProps) {
  const { t, language, setLanguage } = useTranslation();

  const handleLanguageChange = (lang: Language) => {
    if (lang !== language) {
      setLanguage(lang);
      window.location.reload();
    }
  };

  return (
    <header 
      className="w-full py-4 px-6 transition-colors duration-300"
      style={{ 
        backgroundColor: 'var(--bg-secondary)', 
        borderBottom: '1px solid var(--border-color)' 
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        {showLogo && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Bitcoin className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{t('platformName')}</span>
              <span className="text-xs text-amber-500/80">{t('platformTagline')}</span>
            </div>
          </div>
        )}

        {/* Language Selector */}
        <div className="flex items-center gap-4">
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

          {/* Logout button - only show when authenticated */}
          {isAuthenticated && (
            <Button
              variant="outline"
              size="sm"
              onClick={onLogout}
              className="border-red-600/50 bg-red-600/10 hover:bg-red-600/20 text-red-400 transition-colors duration-300"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {language === 'ar' ? 'خروج' : language === 'fr' ? 'Déconnexion' : 'Logout'}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
