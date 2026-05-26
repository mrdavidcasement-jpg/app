import { ArrowLeft, FileText, Scale, AlertTriangle, Wallet, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/translations';

interface TermsOfServiceProps {
  onBack: () => void;
}

export function TermsOfService({ onBack }: TermsOfServiceProps) {
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
              <FileText className="w-8 h-8 text-amber-500" />
              <div>
                <CardTitle 
                  className="text-2xl font-bold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {t('termsOfService')}
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
                <Scale className="w-5 h-5 text-amber-500" />
                <h2 
                  className="text-lg font-semibold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {t('language') === 'اللغة' 
                    ? '1. قبول الشروط' 
                    : '1. Acceptance of Terms'}
                </h2>
              </div>
              <p className="leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                {t('language') === 'اللغة' 
                  ? 'باستخدامك لمنصة CryptoLegacy Wallet، فإنك توافق على هذه الشروط والأحكام. إذا كنت لا توافق على أي جزء من هذه الشروط، يجب عليك عدم استخدام المنصة.'
                  : 'By using the CryptoLegacy Wallet platform, you agree to these terms and conditions. If you do not agree to any part of these terms, you must not use the platform.'}
              </p>
            </section>

            {/* Section 2 */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Wallet className="w-5 h-5 text-amber-500" />
                <h2 
                  className="text-lg font-semibold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {t('language') === 'اللغة' 
                    ? '2. الخدمات المقدمة' 
                    : '2. Services Provided'}
                </h2>
              </div>
              <p className="leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                {t('language') === 'اللغة' 
                  ? 'تقدم المنصة خدمة محفظة البيتكوين الرقمية. نحن لسنا بنكًا ولا نقدم خدمات مالية تقليدية. جميع المعاملات تتم على شبكة البلوكتشاين ولا يمكن عكسها.'
                  : 'The platform provides a digital Bitcoin wallet service. We are not a bank and do not provide traditional financial services. All transactions occur on the blockchain network and cannot be reversed.'}
              </p>
            </section>

            {/* Section 3 */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <h2 
                  className="text-lg font-semibold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {t('language') === 'اللغة' 
                    ? '3. المخاطر' 
                    : '3. Risks'}
                </h2>
              </div>
              <p className="leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                {t('language') === 'اللغة' 
                  ? 'تعتبر العملات الرقمية استثمارات عالية المخاطر. قد تفقد قيمة أصولك جزئيًا أو كليًا. أنت المسؤول الوحيد عن حماية مفاتيحك الخاصة وكلمات المرور الخاصة بك.'
                  : 'Cryptocurrencies are high-risk investments. You may lose part or all of your asset value. You are solely responsible for protecting your private keys and passwords.'}
              </p>
            </section>

            {/* Section 4 */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Ban className="w-5 h-5 text-amber-500" />
                <h2 
                  className="text-lg font-semibold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {t('language') === 'اللغة' 
                    ? '4. الأنشطة المحظورة' 
                    : '4. Prohibited Activities'}
                </h2>
              </div>
              <p className="leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                {t('language') === 'اللغة' 
                  ? 'يحظر استخدام المنصة لأي أنشطة غير قانونية بما في ذلك: غسل الأموال، التهرب الضريبي، تمويل الإرهاب، أو أي نشاط آخر يخالف القوانين المحلية أو الدولية.'
                  : 'Using the platform for any illegal activities is prohibited, including: money laundering, tax evasion, terrorist financing, or any other activity that violates local or international laws.'}
              </p>
            </section>

            {/* Section 5 */}
            <section>
              <h2 
                className="text-lg font-semibold mb-3"
                style={{ color: 'var(--text-primary)' }}
              >
                {t('language') === 'اللغة' 
                  ? '5. إغلاق المنصة' 
                  : '5. Platform Closure'}
              </h2>
              <p className="leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                {t('language') === 'اللغة' 
                  ? 'نحتفظ بالحق في إغلاق المنصة في أي وقت. في حال الإغلاق، سيتم إخطار المستخدمين مسبقًا وسيتم منحهم فترة كافية لسحب أرصدتهم.'
                  : 'We reserve the right to close the platform at any time. In case of closure, users will be notified in advance and given sufficient time to withdraw their balances.'}
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
