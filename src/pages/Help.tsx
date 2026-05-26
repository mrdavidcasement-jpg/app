import { ArrowLeft, HelpCircle, Mail, MessageCircle, Clock, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/translations';
import { useState } from 'react';

interface HelpProps {
  onBack: () => void;
}

export function Help({ onBack }: HelpProps) {
  const { t } = useTranslation();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    { q: t('faq1Q'), a: t('faq1A') },
    { q: t('faq2Q'), a: t('faq2A') },
    { q: t('faq3Q'), a: t('faq3A') },
  ];

  return (
    <div 
      className="min-h-screen p-4 md:p-8 transition-colors duration-300"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      <div className="max-w-4xl mx-auto">
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

        <Card 
          className="transition-colors duration-300"
          style={{ 
            backgroundColor: 'var(--bg-card)', 
            borderColor: 'var(--border-color)' 
          }}
        >
          <CardHeader 
            className="border-b transition-colors duration-300"
            style={{ borderColor: 'var(--border-color)' }}
          >
            <div className="flex items-center gap-3">
              <HelpCircle className="w-8 h-8 text-amber-500" />
              <div>
                <CardTitle 
                  className="text-2xl font-bold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {t('helpTitle')}
                </CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-8 py-6">
            {/* Contact Section */}
            <section className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Mail className="w-5 h-5 text-amber-500" />
                <h2 
                  className="text-lg font-semibold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {t('contactUs')}
                </h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-300"
                    style={{ backgroundColor: 'var(--bg-input)' }}
                  >
                    <MessageCircle className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{t('supportEmail')}</p>
                    <a 
                      href="mailto:support@cryptolegacy.com" 
                      className="text-amber-500 hover:text-amber-400 font-medium"
                    >
                      support@cryptolegacy.com
                    </a>
                  </div>
                </div>

                <div 
                  className="flex items-start gap-3 rounded-lg p-4 transition-colors duration-300"
                  style={{ backgroundColor: 'var(--bg-input)', opacity: 0.5 }}
                >
                  <Clock className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{t('responseTime')}</p>
                </div>
              </div>
            </section>

            {/* FAQ Section */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <MessageCircle className="w-5 h-5 text-amber-500" />
                <h2 
                  className="text-lg font-semibold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {t('faq')}
                </h2>
              </div>

              <div className="space-y-3">
                {faqs.map((faq, index) => (
                  <div
                    key={index}
                    className="rounded-lg overflow-hidden transition-colors duration-300"
                    style={{ border: '1px solid var(--border-color)' }}
                  >
                    <button
                      onClick={() => setOpenFaq(openFaq === index ? null : index)}
                      className="w-full flex items-center justify-between p-4 transition-colors duration-300 text-left"
                      style={{ 
                        backgroundColor: openFaq === index ? 'var(--bg-hover)' : 'var(--bg-input)'
                      }}
                    >
                      <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{faq.q}</span>
                      <ChevronDown
                        className={`w-5 h-5 transition-transform ${
                          openFaq === index ? 'rotate-180' : ''
                        }`}
                        style={{ color: 'var(--text-muted)' }}
                      />
                    </button>
                    {openFaq === index && (
                      <div 
                        className="p-4 border-t transition-colors duration-300"
                        style={{ 
                          backgroundColor: 'var(--bg-primary)',
                          borderColor: 'var(--border-color)'
                        }}
                      >
                        <p style={{ color: 'var(--text-muted)' }}>{faq.a}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Footer */}
            <div 
              className="pt-6 text-center transition-colors duration-300"
              style={{ borderTop: '1px solid var(--border-color)' }}
            >
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {t('copyright')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
