import { ArrowLeft, Shield, Lock, Eye, Database, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/translations';

interface PrivacyPolicyProps {
  onBack: () => void;
}

export function PrivacyPolicy({ onBack }: PrivacyPolicyProps) {
  const { t } = useTranslation();

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
              <Shield className="w-8 h-8 text-amber-500" />
              <div>
                <CardTitle 
                  className="text-2xl font-bold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {t('privacyPolicy')}
                </CardTitle>
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                  {t('language') === 'اللغة' 
                    ? 'آخر تحديث: 15 فبراير 2026' 
                    : 'Last updated: February 15, 2026'}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-8 py-6">
            {/* Section 1 */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Lock className="w-5 h-5 text-amber-500" />
                <h2 
                  className="text-lg font-semibold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {t('language') === 'اللغة' 
                    ? '1. حماية البيانات' 
                    : '1. Data Protection'}
                </h2>
              </div>
              <p className="leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                {t('language') === 'اللغة' 
                  ? 'نحن نأخذ خصوصيتك على محمل الجد. يتم تشفير جميع البيانات الشخصية والمالية باستخدام أحدث تقنيات التشفير. لا نشارك معلوماتك مع أي طرف ثالث دون موافقتك الصريحة.'
                  : 'We take your privacy seriously. All personal and financial data is encrypted using the latest encryption technologies. We do not share your information with any third party without your explicit consent.'}
              </p>
            </section>

            {/* Section 2 */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Eye className="w-5 h-5 text-amber-500" />
                <h2 
                  className="text-lg font-semibold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {t('language') === 'اللغة' 
                    ? '2. البيانات التي نجمعها' 
                    : '2. Information We Collect'}
                </h2>
              </div>
              <p className="leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                {t('language') === 'اللغة' 
                  ? 'نجمع فقط البيانات الضرورية لتقديم خدماتنا، بما في ذلك: عنوان البريد الإلكتروني، معلومات المحفظة، وسجل المعاملات. لا نجمع معلومات بطاقات الائتمان حيث أن جميع المدفوعات تتم عبر شبكات البلوكتشاين.'
                  : 'We only collect data necessary to provide our services, including: email address, wallet information, and transaction history. We do not collect credit card information as all payments are made through blockchain networks.'}
              </p>
            </section>

            {/* Section 3 */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Database className="w-5 h-5 text-amber-500" />
                <h2 
                  className="text-lg font-semibold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {t('language') === 'اللغة' 
                    ? '3. تخزين البيانات' 
                    : '3. Data Storage'}
                </h2>
              </div>
              <p className="leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                {t('language') === 'اللغة' 
                  ? 'يتم تخزين البيانات على خوادم آمنة في مراكز بيانات متعددة الجغرافيا. نحتفظ ببياناتك فقط طالما كنت مستخدمًا نشطًا للمنصة. عند إغلاق حسابك، يتم حذف بياناتك الشخصية خلال 30 يومًا.'
                  : 'Data is stored on secure servers in multi-geographic data centers. We retain your data only as long as you are an active user of the platform. Upon account closure, your personal data is deleted within 30 days.'}
              </p>
            </section>

            {/* Section 4 */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Globe className="w-5 h-5 text-amber-500" />
                <h2 
                  className="text-lg font-semibold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {t('language') === 'اللغة' 
                    ? '4. ملفات تعريف الارتباط' 
                    : '4. Cookies'}
                </h2>
              </div>
              <p className="leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                {t('language') === 'اللغة' 
                  ? 'نستخدم ملفات تعريف الارتباط الأساسية فقط لتحسين تجربة المستخدم والحفاظ على جلسة تسجيل الدخول. لا نستخدم ملفات تعريف الارتباط للتتبع أو الإعلانات.'
                  : 'We use only essential cookies to improve user experience and maintain login sessions. We do not use cookies for tracking or advertising purposes.'}
              </p>
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
