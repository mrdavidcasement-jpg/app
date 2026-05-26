import { Bitcoin } from 'lucide-react';
import { useTranslation } from '@/translations';

interface FooterProps {
  onPrivacyClick: () => void;
  onTermsClick: () => void;
  onHelpClick: () => void;
  onAboutClick: () => void;
}

export function Footer({ onPrivacyClick, onTermsClick, onHelpClick, onAboutClick }: FooterProps) {
  const { t } = useTranslation();

  return (
    <footer 
      className="w-full py-8 px-6 mt-12 transition-colors duration-300"
      style={{ 
        backgroundColor: 'var(--bg-secondary)', 
        borderTop: '1px solid var(--border-color)' 
      }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
              <Bitcoin className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{t('platformName')}</span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 flex-wrap justify-center">
            <button
              onClick={onPrivacyClick}
              className="text-sm transition-colors hover:text-amber-500"
              style={{ color: 'var(--text-muted)' }}
            >
              {t('privacyPolicy')}
            </button>
            <button
              onClick={onTermsClick}
              className="text-sm transition-colors hover:text-amber-500"
              style={{ color: 'var(--text-muted)' }}
            >
              {t('termsOfService')}
            </button>
            <button
              onClick={onHelpClick}
              className="text-sm transition-colors hover:text-amber-500"
              style={{ color: 'var(--text-muted)' }}
            >
              {t('help')}
            </button>
            <button
              onClick={onAboutClick}
              className="text-sm transition-colors hover:text-amber-500"
              style={{ color: 'var(--text-muted)' }}
            >
              {t('aboutUs')}
            </button>
          </div>
        </div>

        {/* Copyright */}
        <div 
          className="mt-6 pt-6 text-center transition-colors duration-300"
          style={{ borderTop: '1px solid var(--border-color)' }}
        >
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {t('copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
}
