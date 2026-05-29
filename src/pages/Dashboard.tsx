import { useState } from 'react';
import { 
  Wallet, ArrowUpRight, ArrowDownLeft, History, 
  TrendingUp, TrendingDown, Bitcoin, CircleDollarSign, 
  Hexagon, Send, Download, QrCode, X, ChevronUp, ChevronDown,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ShutdownWarning } from '@/components/ShutdownWarning';
import { SettingsModal } from '@/components/SettingsModal';
import { useBitcoinPrice, calculateHistoricalValue } from '@/hooks/useBitcoinPrice';
import { useTranslation } from '@/translations';

import { useAuth } from '@/hooks/useAuth';

interface Transaction {
  id: string;
  type: 'buy' | 'withdraw';
  amount: number;
  date: string;
  year: 2015 | 2016;
  method: 'creditCard' | 'bankTransfer';
  fee?: number;
}

interface DashboardProps {
  onWithdraw: () => void;
}

const TRANSACTIONS: Transaction[] = [
  {
    id: 'TXN-2016-001',
    type: 'withdraw',
    amount: 0.1,
    date: '10 أغسطس 2016',
    year: 2016,
    method: 'bankTransfer',
    fee: 0.003,
  },
  {
    id: 'TXN-2015-001',
    type: 'buy',
    amount: 0.5,
    date: '20 يونيو 2015',
    year: 2015,
    method: 'creditCard',
  },
];

export function Dashboard({ onWithdraw }: DashboardProps) {
  const { t } = useTranslation();
  const { price, priceChange, change24h } = useBitcoinPrice();
  const { balance } = useAuth();
  
  const currentBalance = balance ?? 0.397;
  const currentValue = currentBalance * price;

  // Cryptocurrency data
  const CRYPTO_ASSETS = [
    { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', balance: currentBalance, icon: Bitcoin, color: 'text-orange-500', bgColor: 'bg-orange-500/20' },
    { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', balance: 0, icon: Hexagon, color: 'text-blue-500', bgColor: 'bg-blue-500/20' },
    { id: 'usdt', symbol: 'USDT', name: 'Tether', balance: 0, icon: CircleDollarSign, color: 'text-green-500', bgColor: 'bg-green-500/20' },
  ];

  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [selectedAsset, setSelectedAsset] = useState('bitcoin');
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatBTC = (amount: number) => {
    return `${amount.toFixed(3)} BTC`;
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  return (
    <div 
      className="min-h-screen p-4 md:p-8 transition-colors duration-300"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Settings Button - Top Right */}
        <div className="flex justify-end mb-4">
          <Button
            variant="outline"
            onClick={() => setShowSettingsModal(true)}
            className="transition-colors duration-300"
            style={{ 
              borderColor: 'var(--border-color)', 
              backgroundColor: 'var(--bg-input)',
              color: 'var(--text-muted)'
            }}
          >
            <Settings className="w-4 h-4 mr-2" />
            {t('language') === 'ar' 
              ? 'الإعدادات' 
              : t('language') === 'fr' 
              ? 'Paramètres' 
              : 'Settings'}
          </Button>
        </div>

        {/* Shutdown Warning - Compact */}
        <ShutdownWarning compact />

        {/* My Wallets Section */}
        <Card 
          className="mb-6 transition-colors duration-300"
          style={{ 
            backgroundColor: 'var(--bg-card)', 
            borderColor: 'var(--border-color)' 
          }}
        >
          <CardHeader className="pb-4">
            <CardTitle 
              className="text-lg flex items-center gap-2"
              style={{ color: 'var(--text-muted)' }}
            >
              <Wallet className="w-5 h-5" />
              {t('myWallets')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Crypto Assets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {CRYPTO_ASSETS.map((asset) => {
                const Icon = asset.icon;
                const isSelected = selectedAsset === asset.id;
                const assetValue = asset.balance * (asset.id === 'bitcoin' ? price : asset.id === 'ethereum' ? 3500 : 1);
                
                return (
                  <div
                    key={asset.id}
                    onClick={() => setSelectedAsset(asset.id)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-amber-500'
                        : 'hover:border-[var(--border-hover)]'
                    }`}
                    style={{ 
                      backgroundColor: isSelected ? 'rgba(245, 158, 11, 0.1)' : 'var(--bg-input)',
                      borderColor: isSelected ? '#f59e0b' : 'var(--border-color)'
                    }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${asset.bgColor}`}>
                        <Icon className={`w-5 h-5 ${asset.color}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{asset.name}</h3>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{asset.symbol}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold" style={{ color: 'var(--text-primary)' }}>
                        {asset.balance > 0 
                          ? `${asset.balance.toFixed(asset.id === 'bitcoin' ? 3 : 2)} ${asset.symbol}`
                          : `0 ${asset.symbol}`
                        }
                      </p>
                      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        {assetValue > 0 ? formatCurrency(assetValue) : '$0.00'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Asset Details */}
            {selectedAsset === 'bitcoin' && (
              <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Bitcoin className="w-6 h-6 text-orange-500" />
                      <span style={{ color: 'var(--text-muted)' }}>{t('bitcoinBalance')}</span>
                    </div>
                    <div 
                      className="text-4xl md:text-5xl font-bold mb-2"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {formatBTC(currentBalance)}
                    </div>
                    <div className={`text-xl md:text-2xl transition-colors duration-500 flex items-center gap-2 ${
                      priceChange === 'up' ? 'text-green-400' : 
                      priceChange === 'down' ? 'text-red-400' : 'text-gray-400'
                    }`}>
                      {formatCurrency(currentValue)}
                      {priceChange === 'up' ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : priceChange === 'down' ? (
                        <ChevronDown className="w-5 h-5" />
                      ) : null}
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        1 BTC = {formatCurrency(price)}
                      </p>
                      <span className={`text-sm font-medium px-2 py-0.5 rounded ${
                        change24h >= 0 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {change24h >= 0 ? <TrendingUp className="w-3 h-3 inline mr-1" /> : <TrendingDown className="w-3 h-3 inline mr-1" />}
                        {formatPercentage(change24h)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={onWithdraw}
                      className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold"
                    >
                      <ArrowUpRight className="w-4 h-4 mr-2" />
                      {t('withdrawBalance')}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowDepositModal(true)}
                      className="transition-colors duration-300"
                      style={{ 
                        borderColor: 'var(--border-color)', 
                        backgroundColor: 'var(--bg-input)',
                        color: 'var(--text-muted)'
                      }}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {t('deposit')}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={onWithdraw}
                      className="transition-colors duration-300"
                      style={{ 
                        borderColor: 'var(--border-color)', 
                        backgroundColor: 'var(--bg-input)',
                        color: 'var(--text-muted)'
                      }}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {t('send')}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowReceiveModal(true)}
                      className="transition-colors duration-300"
                      style={{ 
                        borderColor: 'var(--border-color)', 
                        backgroundColor: 'var(--bg-input)',
                        color: 'var(--text-muted)'
                      }}
                    >
                      <QrCode className="w-4 h-4 mr-2" />
                      {t('receive')}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {selectedAsset === 'ethereum' && (
              <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/30 rounded-xl p-6 text-center">
                <Hexagon className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                <h3 className="font-bold text-lg mb-1" style={{ color: 'var(--text-primary)' }}>Ethereum (ETH)</h3>
                <p className="mb-4" style={{ color: 'var(--text-muted)' }}>0 ETH = $0.00</p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{t('language') === 'اللغة' ? 'لا يوجد رصيد متاح' : 'No balance available'}</p>
              </div>
            )}

            {selectedAsset === 'usdt' && (
              <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-6 text-center">
                <CircleDollarSign className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <h3 className="font-bold text-lg mb-1" style={{ color: 'var(--text-primary)' }}>Tether (USDT)</h3>
                <p className="mb-4" style={{ color: 'var(--text-muted)' }}>0 USDT = $0.00</p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{t('language') === 'اللغة' ? 'لا يوجد رصيد متاح' : 'No balance available'}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Card 
          className="transition-colors duration-300"
          style={{ 
            backgroundColor: 'var(--bg-card)', 
            borderColor: 'var(--border-color)' 
          }}
        >
          <CardHeader>
            <CardTitle 
              className="text-lg flex items-center gap-2"
              style={{ color: 'var(--text-muted)' }}
            >
              <History className="w-5 h-5" />
              {t('transactionHistory')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-muted)' }}>{t('date')}</th>
                    <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-muted)' }}>{t('type')}</th>
                    <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-muted)' }}>{t('amount')}</th>
                    <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-muted)' }}>{t('value')}</th>
                    <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-muted)' }}>{t('status')}</th>
                    <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-muted)' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {TRANSACTIONS.map((transaction) => {
                    const historicalValue = calculateHistoricalValue(transaction.amount, transaction.year);
                    return (
                      <tr
                        key={transaction.id}
                        className="hover:opacity-80 transition-opacity cursor-pointer"
                        style={{ borderBottom: '1px solid rgba(var(--border-color), 0.5)' }}
                        onClick={() => setSelectedTransaction(transaction)}
                      >
                        <td className="py-4 px-4" style={{ color: 'var(--text-secondary)' }}>{transaction.date}</td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                            transaction.type === 'buy'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {transaction.type === 'buy' ? (
                              <ArrowDownLeft className="w-4 h-4" />
                            ) : (
                              <ArrowUpRight className="w-4 h-4" />
                            )}
                            {t(transaction.type)}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-medium" style={{ color: 'var(--text-primary)' }}>
                          {formatBTC(transaction.amount)}
                        </td>
                        <td className="py-4 px-4" style={{ color: 'var(--text-muted)' }}>
                          {formatCurrency(historicalValue)}
                          <span className="text-xs block" style={{ color: 'var(--text-muted)', opacity: 0.7 }}>
                            (@ ${calculateHistoricalValue(1, transaction.year)}/BTC)
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-green-500/20 text-green-400">
                            {t('completed')}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-amber-500 hover:text-amber-400 hover:bg-amber-500/10"
                          >
                            {t('viewDetails')}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Transaction Details Dialog */}
        <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
          <DialogContent 
            className="max-w-md transition-colors duration-300"
            style={{ 
              backgroundColor: 'var(--bg-card)', 
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)'
            }}
          >
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                {selectedTransaction?.type === 'buy' ? (
                  <ArrowDownLeft className="w-5 h-5 text-green-400" />
                ) : (
                  <ArrowUpRight className="w-5 h-5 text-red-400" />
                )}
                {t('transactionDetails')}
              </DialogTitle>
            </DialogHeader>
            
            {selectedTransaction && (
              <div className="space-y-4 mt-4">
                <div className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{t('transactionId')}</span>
                  <span className="font-mono" style={{ color: 'var(--text-primary)' }}>{selectedTransaction.id}</span>
                </div>
                
                <div className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{t('date')}</span>
                  <span style={{ color: 'var(--text-primary)' }}>{selectedTransaction.date}</span>
                </div>
                
                <div className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{t('type')}</span>
                  <span className={selectedTransaction.type === 'buy' ? 'text-green-400' : 'text-red-400'}>
                    {t(selectedTransaction.type)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{t('amount')}</span>
                  <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{formatBTC(selectedTransaction.amount)}</span>
                </div>
                
                <div className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{t('value')}</span>
                  <div className="text-right">
                    <span style={{ color: 'var(--text-primary)' }}>
                      {formatCurrency(calculateHistoricalValue(selectedTransaction.amount, selectedTransaction.year))}
                    </span>
                    <span className="text-xs block" style={{ color: 'var(--text-muted)', opacity: 0.7 }}>
                      (@ ${calculateHistoricalValue(1, selectedTransaction.year)}/BTC)
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{t('paymentMethod')}</span>
                  <span style={{ color: 'var(--text-primary)' }}>{t(selectedTransaction.method)}</span>
                </div>

                {selectedTransaction.fee && (
                  <div className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{t('fee')}</span>
                    <div className="text-right">
                      <span className="text-red-400">{formatBTC(selectedTransaction.fee)}</span>
                      <span className="text-xs block" style={{ color: 'var(--text-muted)', opacity: 0.7 }}>
                        ({formatCurrency(calculateHistoricalValue(selectedTransaction.fee, selectedTransaction.year))})
                      </span>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between items-center py-2">
                  <span style={{ color: 'var(--text-muted)' }}>{t('status')}</span>
                  <span className="text-green-400">{t('completed')}</span>
                </div>

                <Button
                  onClick={() => setSelectedTransaction(null)}
                  className="w-full mt-4 transition-colors duration-300"
                  style={{ 
                    backgroundColor: 'var(--bg-hover)',
                    color: 'var(--text-primary)'
                  }}
                >
                  <X className="w-4 h-4 mr-2" />
                  {t('close')}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Deposit Disabled Modal */}
        <Dialog open={showDepositModal} onOpenChange={setShowDepositModal}>
          <DialogContent 
            className="max-w-md transition-colors duration-300"
            style={{ 
              backgroundColor: 'var(--bg-card)', 
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)'
            }}
          >
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2 text-red-400">
                <X className="w-5 h-5" />
                {t('depositDisabled')}
              </DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{t('depositDisabledMessage')}</p>
              <Button
                onClick={() => setShowDepositModal(false)}
                className="w-full mt-6 bg-amber-500 hover:bg-amber-600 text-white font-bold"
              >
                {t('ok')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Receive Disabled Modal */}
        <Dialog open={showReceiveModal} onOpenChange={setShowReceiveModal}>
          <DialogContent 
            className="max-w-md transition-colors duration-300"
            style={{ 
              backgroundColor: 'var(--bg-card)', 
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)'
            }}
          >
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2 text-red-400">
                <X className="w-5 h-5" />
                {t('receiveDisabled')}
              </DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{t('receiveDisabledMessage')}</p>
              <Button
                onClick={() => setShowReceiveModal(false)}
                className="w-full mt-6 bg-amber-500 hover:bg-amber-600 text-white font-bold"
              >
                {t('ok')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Settings Modal */}
        <SettingsModal 
          isOpen={showSettingsModal} 
          onClose={() => setShowSettingsModal(false)} 
        />
      </div>
    </div>
  );
}
