import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppHeader } from '../../../components/ui/AppHeader';
import { AppCard } from '../../../components/ui/AppCard';
import { AppInput } from '../../../components/ui/AppInput';
import { AppSelect } from '../../../components/ui/AppSelect';
import { AppButton } from '../../../components/ui/AppButton';
import { convertAmount, fetchRates, type CurrencyCode } from '../services/currencyService';

const currencies: CurrencyCode[] = [
  'USD', 'EUR', 'MXN', 'CAD', 'GBP',
  'COP', 'BRL', 'ARS', 'THB', 'IDR',
  'INR', 'AUD', 'AED', 'CHF', 'JPY',
];

export function CurrencyConverterPage() {
  const { t } = useTranslation();
  const [amount, setAmount] = useState('100');
  const [from, setFrom] = useState<CurrencyCode>('USD');
  const [to, setTo] = useState<CurrencyCode>('MXN');
  const [rates, setRates] = useState<Record<CurrencyCode, number> | null>(null);

  useEffect(() => {
    void (async () => {
      const r = await fetchRates();
      setRates(r);
    })();
  }, []);

  const numericAmount = Number(amount);
  const result = useMemo(() => {
    if (!rates) return 0;
    return convertAmount({ amount: numericAmount, from, to, rates });
  }, [numericAmount, from, to, rates]);

  return (
    <div className="px-4 pt-4 pb-24">
      <AppHeader title={t('currency.title')} />

      <div className="mt-4 space-y-3">
        <AppCard>
          <div className="text-xs font-semibold text-[rgb(var(--viaza-primary-rgb)/0.60)]">{t('currency.amount')}</div>
          <div className="mt-2">
            <AppInput value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <div>
              <div className="text-xs font-semibold text-[rgb(var(--viaza-primary-rgb)/0.60)]">{t('currency.from')}</div>
              <div className="mt-2">
                <AppSelect value={from} onChange={(e) => setFrom(e.target.value as CurrencyCode)}>
                  {currencies.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </AppSelect>
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-[rgb(var(--viaza-primary-rgb)/0.60)]">{t('currency.to')}</div>
              <div className="mt-2">
                <AppSelect value={to} onChange={(e) => setTo(e.target.value as CurrencyCode)}>
                  {currencies.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </AppSelect>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <AppButton
              variant="secondary"
              className="w-full"
              onClick={() => {
                setFrom(to);
                setTo(from);
              }}
              type="button"
            >
              {t('currency.swap')}
            </AppButton>
          </div>
        </AppCard>

        <AppCard>
          <div className="text-xs font-semibold text-[rgb(var(--viaza-primary-rgb)/0.60)]">{t('currency.result')}</div>
          <div className="mt-2 text-3xl font-semibold">
            {rates ? result.toFixed(2) : t('currency.loading')}
          </div>
          <div className="mt-2 text-xs text-[rgb(var(--viaza-primary-rgb)/0.60)]">{t('currency.note')}</div>
        </AppCard>
      </div>
    </div>
  );
}

