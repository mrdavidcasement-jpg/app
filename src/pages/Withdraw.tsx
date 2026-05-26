import { useState } from 'react';
import { ArrowLeft, Bitcoin, Landmark, AlertCircle, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShutdownWarning } from '@/components/ShutdownWarning';
import { useTranslation } from '@/translations';

interface WithdrawProps {
  onBack: () => void;
  onNext: (address: string) => void;
}

export function Withdraw({ onBack, onNext }: WithdrawProps) {
  const { t } = useTranslation();
  const [selectedMethod, setSelectedMethod] = useState<'bitcoin' | 'bank'>('bitcoin');
  const [bitcoinAddress, setBitcoinAddress] = useState('');
  const [error, setError] = useState('');

  const handleNext = () => {
    setError('');
    
    if (selectedMethod === 'bank') {
      // Bank transfer is disabled
      return;
    }

    if (!bitcoinAddress.trim()) {
      setError(t('invalidAddress'));
      return;
    }

    // Basic Bitcoin address validation (starts with 1, 3, or bc1)
    const btcRegex = /^(1|3|bc1)[a-zA-Z0-9]{25,62}$/;
    if (!btcRegex.test(bitcoinAddress.trim())) {
      setError(t('invalidAddress'));
      return;
    }

    onNext(bitcoinAddress.trim());
  };

  return (
    <div 
      className="min-h-screen p-4 md:p-8 transition-colors duration-300"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      <div className="max-w-2xl mx-auto">
        {/* Shutdown Warning - Compact */}
        <ShutdownWarning compact />

        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-4 transition-colors duration-300"
          style={{ color: 'var(--text-muted)' }}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('dashboard')}
        </Button>

        {/* Withdraw Card */}
        <Card 
          className="transition-colors duration-300"
          style={{ 
            backgroundColor: 'var(--bg-card)', 
            borderColor: 'var(--border-color)' 
          }}
        >
          <CardHeader>
            <CardTitle 
              className="text-2xl font-bold"
              style={{ color: 'var(--text-primary)' }}
            >
              {t('withdrawFunds')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p style={{ color: 'var(--text-muted)' }}>{t('selectWithdrawMethod')}</p>

            {/* Bitcoin Option */}
            <div
              onClick={() => setSelectedMethod('bitcoin')}
              className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all ${
                selectedMethod === 'bitcoin'
                  ? 'border-amber-500'
                  : 'hover:border-[var(--border-hover)]'
              }`}
              style={{ 
                backgroundColor: selectedMethod === 'bitcoin' ? 'rgba(245, 158, 11, 0.1)' : 'var(--bg-input)',
                borderColor: selectedMethod === 'bitcoin' ? '#f59e0b' : 'var(--border-color)'
              }}
            >
              <div className="flex items-center gap-4">
                <div 
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-300 ${
                    selectedMethod === 'bitcoin' ? 'bg-amber-500' : ''
                  }`}
                  style={{ backgroundColor: selectedMethod === 'bitcoin' ? '#f59e0b' : 'var(--bg-hover)' }}
                >
                  <Bitcoin 
                    className={`w-6 h-6 transition-colors duration-300 ${
                      selectedMethod === 'bitcoin' ? 'text-white' : ''
                    }`}
                    style={{ color: selectedMethod === 'bitcoin' ? '#ffffff' : 'var(--text-muted)' }}
                  />
                </div>
                <div className="flex-1">
                  <h3 
                    className="text-lg font-semibold"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {t('bitcoinWallet')}
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Bitcoin (BTC)</p>
                </div>
                <div 
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors duration-300 ${
                    selectedMethod === 'bitcoin'
                      ? 'border-amber-500 bg-amber-500'
                      : ''
                  }`}
                  style={{ borderColor: selectedMethod === 'bitcoin' ? '#f59e0b' : 'var(--border-color)' }}
                >
                  {selectedMethod === 'bitcoin' && (
                    <div className="w-3 h-3 rounded-full bg-white" />
                  )}
                </div>
              </div>

              {/* Bitcoin Address Input */}
              {selectedMethod === 'bitcoin' && (
                <div className="mt-6 animate-slide-up">
                  <Label 
                    htmlFor="btc-address" 
                    className="mb-2 block"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {t('bitcoinAddress')}
                  </Label>
                  <Input
                    id="btc-address"
                    value={bitcoinAddress}
                    onChange={(e) => setBitcoinAddress(e.target.value)}
                    placeholder={t('enterBitcoinAddress')}
                    className="transition-colors duration-300"
                    style={{ 
                      backgroundColor: 'var(--bg-primary)', 
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>
              )}
            </div>

            {/* Bank Transfer Option - Disabled */}
            <div className="relative p-6 rounded-xl border-2 border-red-600/30 bg-red-900/10 opacity-80">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-red-900/30 flex items-center justify-center">
                  <Landmark className="w-6 h-6 text-red-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-400">{t('bankTransferUnavailable')}</h3>
                  <p className="text-red-400/80 text-sm flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {t('bankTransferLimit')}
                  </p>
                </div>
                <div className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs border border-red-500/30">
                  {t('language') === 'اللغة' ? 'غير متاح' : 'Unavailable'}
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <Alert className="bg-red-900/30 border-red-600/50">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <AlertDescription className="text-red-400">{error}</AlertDescription>
              </Alert>
            )}

            {/* Next Button */}
            <Button
              onClick={handleNext}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold py-6 text-lg"
            >
              {t('next')}
              <ChevronRight className="w-5 h-5 mr-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
