import { ArrowLeft, Building2, Calendar, Users, TrendingUp, Award, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/translations';

interface AboutProps {
  onBack: () => void;
}

export function About({ onBack }: AboutProps) {
  const { t } = useTranslation();

  const stats = [
    { icon: Calendar, label: t('founded'), value: '2015' },
    { icon: Users, label: t('users'), value: '+500,000' },
    { icon: TrendingUp, label: t('transactions'), value: '+2 Million' },
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
              <Building2 className="w-8 h-8 text-amber-500" />
              <div>
                <CardTitle 
                  className="text-2xl font-bold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {t('aboutTitle')}
                </CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-8 py-6">
            {/* About Text */}
            <section className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <History className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
                    {t('aboutText')}
                  </p>
                  <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {t('aboutText2')}
                  </p>
                </div>
              </div>
            </section>

            {/* Stats */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-amber-500" />
                <h2 
                  className="text-lg font-semibold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {t('language') === 'اللغة' ? 'إحصائيات المنصة' : 'Platform Statistics'}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={index}
                      className="rounded-xl p-4 text-center transition-colors duration-300"
                      style={{ 
                        backgroundColor: 'var(--bg-input)', 
                        border: '1px solid var(--border-color)' 
                      }}
                    >
                      <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <Icon className="w-5 h-5 text-amber-500" />
                      </div>
                      <p 
                        className="text-2xl font-bold mb-1"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {stat.value}
                      </p>
                      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Timeline */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-amber-500" />
                <h2 
                  className="text-lg font-semibold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {t('language') === 'اللغة' ? 'الخط الزمني' : 'Timeline'}
                </h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-3 h-3 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-amber-500 font-medium">2015</p>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      {t('language') === 'اللغة' 
                        ? 'تأسيس المنصة وإطلاق خدمة المحفظة' 
                        : 'Platform founded and wallet service launched'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-3 h-3 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-amber-500 font-medium">2017</p>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      {t('language') === 'اللغة' 
                        ? 'وصول عدد المستخدمين إلى 100,000' 
                        : 'Reached 100,000 users'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-3 h-3 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-amber-500 font-medium">2019</p>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      {t('language') === 'اللغة' 
                        ? 'إضافة دعم العملات المتعددة' 
                        : 'Added multi-currency support'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-3 h-3 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-red-500 font-medium">2026</p>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      {t('language') === 'اللغة' 
                        ? 'إعلان إغلاق المنصة نهائياً' 
                        : 'Announced permanent platform closure'}
                    </p>
                  </div>
                </div>
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
