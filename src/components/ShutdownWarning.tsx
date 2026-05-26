import { useState } from 'react';
import { AlertTriangle, Clock, Info, X } from 'lucide-react';
import { useCountdown } from '@/hooks/useCountdown';
import { useTranslation } from '@/translations';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ShutdownWarningProps {
  showCountdown?: boolean;
  compact?: boolean;
}

export function ShutdownWarning({ showCountdown = true, compact = false }: ShutdownWarningProps) {
  const { t, language } = useTranslation();
  const countdown = useCountdown();
  const [showInfoDialog, setShowInfoDialog] = useState(false);

  const formatClosureDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', options);
  };

  if (compact) {
    return (
      <>
        <div className="w-full bg-red-900/40 border border-red-600/50 rounded-lg p-3 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <p className="text-red-200 text-sm">
              {t('closureDate')} {formatClosureDate(countdown.closureDate)}
            </p>
          </div>
          <button
            onClick={() => setShowInfoDialog(true)}
            className="text-amber-400 hover:text-amber-300 text-sm underline underline-offset-2 transition-colors"
          >
            {t('moreInfo')}
          </button>
        </div>

        <Dialog open={showInfoDialog} onOpenChange={setShowInfoDialog}>
          <DialogContent 
            className="max-w-md transition-colors duration-300"
            style={{ 
              backgroundColor: 'var(--bg-card)', 
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)'
            }}
          >
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2 text-amber-500">
                <Info className="w-5 h-5" />
                {t('closureReasonTitle')}
              </DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{t('closureReasonText')}</p>
              <div className="mt-4 p-3 bg-red-900/30 border border-red-600/30 rounded-lg">
                <p className="text-red-300 text-sm">
                  {t('closureDate')} <span className="font-bold">{formatClosureDate(countdown.closureDate)}</span>
                </p>
              </div>
              <Button
                onClick={() => setShowInfoDialog(false)}
                className="w-full mt-4 bg-amber-500 hover:bg-amber-600 text-white font-bold"
              >
                <X className="w-4 h-4 mr-2" />
                {t('ok')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <>
      <div className="w-full bg-gradient-to-r from-red-900/80 via-red-800/80 to-red-900/80 border border-red-600/50 rounded-lg p-4 mb-6 animate-pulse-warning">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0" />
            <h2 className="text-lg font-bold text-red-200">
              {t('platformClosing')}
            </h2>
          </div>
          <button
            onClick={() => setShowInfoDialog(true)}
            className="text-amber-400 hover:text-amber-300 text-sm underline underline-offset-2 transition-colors font-medium"
          >
            {t('moreInfo')}
          </button>
        </div>
        
        <p className="text-red-200/80 mb-3 text-sm">
          {t('withdrawAllFunds')}
        </p>

        <div className="flex items-center gap-2 mb-3 text-red-300 text-sm">
          <Clock className="w-4 h-4" />
          <span>{t('closureDate')}</span>
          <span className="font-bold">{formatClosureDate(countdown.closureDate)}</span>
        </div>

        {showCountdown && (
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-red-950/50 border border-red-600/30 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-red-300">{countdown.days}</div>
              <div className="text-xs text-red-400/70">{t('days')}</div>
            </div>
            <div className="bg-red-950/50 border border-red-600/30 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-red-300">{countdown.hours}</div>
              <div className="text-xs text-red-400/70">{t('hours')}</div>
            </div>
            <div className="bg-red-950/50 border border-red-600/30 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-red-300">{countdown.minutes}</div>
              <div className="text-xs text-red-400/70">{t('minutes')}</div>
            </div>
            <div className="bg-red-950/50 border border-red-600/30 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-red-300">{countdown.seconds}</div>
              <div className="text-xs text-red-400/70">{t('seconds')}</div>
            </div>
          </div>
        )}
      </div>

      <Dialog open={showInfoDialog} onOpenChange={setShowInfoDialog}>
        <DialogContent 
          className="max-w-md transition-colors duration-300"
          style={{ 
            backgroundColor: 'var(--bg-card)', 
            borderColor: 'var(--border-color)',
            color: 'var(--text-primary)'
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-amber-500">
              <Info className="w-5 h-5" />
              {t('closureReasonTitle')}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{t('closureReasonText')}</p>
            <div className="mt-4 p-3 bg-red-900/30 border border-red-600/30 rounded-lg">
              <p className="text-red-300 text-sm">
                {t('closureDate')} <span className="font-bold">{formatClosureDate(countdown.closureDate)}</span>
              </p>
            </div>
            <Button
              onClick={() => setShowInfoDialog(false)}
              className="w-full mt-4 bg-amber-500 hover:bg-amber-600 text-white font-bold"
            >
              <X className="w-4 h-4 mr-2" />
              {t('ok')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
