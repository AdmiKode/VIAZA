import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppHeader } from '../../../components/ui/AppHeader';
import { AppCard } from '../../../components/ui/AppCard';
import { AppInput } from '../../../components/ui/AppInput';
import { AppButton } from '../../../components/ui/AppButton';
import { splitBill } from '../utils/splitBillCalculator';

type PersonRow = { id: string; name: string; amount: string };

function id() {
  return crypto.randomUUID();
}

export function SplitBillPage() {
  const { t } = useTranslation();
  const [total, setTotal] = useState('1200');
  const [people, setPeople] = useState('3');
  const [tipPct, setTipPct] = useState('10');
  const [advanced, setAdvanced] = useState(false);
  const [rows, setRows] = useState<PersonRow[]>([
    { id: id(), name: '', amount: '0' },
    { id: id(), name: '', amount: '0' }
  ]);

  const numericTotal = Number(total);
  const numericPeople = Number(people);
  const numericTip = Number(tipPct);
  const perPerson = useMemo(
    () => splitBill({ total: numericTotal, people: numericPeople, tipPct: numericTip }),
    [numericTotal, numericPeople, numericTip]
  );

  const advancedTotal = useMemo(() => rows.reduce((s, r) => s + (Number(r.amount) || 0), 0), [rows]);

  return (
    <div className="px-4 pt-4 pb-24">
      <AppHeader title={t('splitBill.title')} />

      <div className="mt-4 space-y-3">
        <AppCard>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-xs font-semibold text-[rgb(var(--viaza-primary-rgb)/0.60)]">
                {t('splitBill.total')}
              </div>
              <div className="mt-2">
                <AppInput value={total} onChange={(e) => setTotal(e.target.value)} inputMode="decimal" />
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-[rgb(var(--viaza-primary-rgb)/0.60)]">
                {t('splitBill.people')}
              </div>
              <div className="mt-2">
                <AppInput value={people} onChange={(e) => setPeople(e.target.value)} inputMode="numeric" />
              </div>
            </div>
          </div>

          <div className="mt-3">
            <div className="text-xs font-semibold text-[rgb(var(--viaza-primary-rgb)/0.60)]">
              {t('splitBill.tipPct')}
            </div>
            <div className="mt-2">
              <AppInput value={tipPct} onChange={(e) => setTipPct(e.target.value)} inputMode="numeric" />
            </div>
          </div>

          <div className="mt-4">
            <AppButton variant="secondary" className="w-full" onClick={() => setAdvanced((v) => !v)} type="button">
              {advanced ? t('splitBill.advanced.hide') : t('splitBill.advanced.show')}
            </AppButton>
          </div>
        </AppCard>

        {advanced ? (
          <AppCard>
            <div className="text-sm font-semibold">{t('splitBill.advanced.title')}</div>
            <div className="mt-2 space-y-2">
              {rows.map((r) => (
                <div key={r.id} className="flex gap-2">
                  <AppInput
                    value={r.name}
                    onChange={(e) => setRows((s) => s.map((x) => (x.id === r.id ? { ...x, name: e.target.value } : x)))}
                    placeholder={t('splitBill.person')}
                  />
                  <AppInput
                    value={r.amount}
                    onChange={(e) =>
                      setRows((s) => s.map((x) => (x.id === r.id ? { ...x, amount: e.target.value } : x)))
                    }
                    inputMode="decimal"
                    placeholder={t('splitBill.amount')}
                  />
                  <button
                    type="button"
                    className="rounded-2xl px-3 text-xs text-[rgb(var(--viaza-primary-rgb)/0.70)]"
                    onClick={() => setRows((s) => s.filter((x) => x.id !== r.id))}
                  >
                    {t('common.remove')}
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-3">
              <AppButton
                className="w-full"
                onClick={() => setRows((s) => [...s, { id: id(), name: t('splitBill.person'), amount: '0' }])}
                type="button"
              >
                {t('splitBill.advanced.addPerson')}
              </AppButton>
            </div>
            <div className="mt-3 text-xs text-[rgb(var(--viaza-primary-rgb)/0.60)]">
              {t('splitBill.advanced.total', { total: advancedTotal.toFixed(2) })}
            </div>
          </AppCard>
        ) : null}

        <AppCard>
          <div className="text-xs font-semibold text-[rgb(var(--viaza-primary-rgb)/0.60)]">{t('splitBill.result')}</div>
          <div className="mt-2 text-3xl font-semibold">{Number.isFinite(perPerson) ? perPerson.toFixed(2) : '0.00'}</div>
          <div className="mt-2 text-xs text-[rgb(var(--viaza-primary-rgb)/0.60)]">{t('splitBill.note')}</div>
        </AppCard>
      </div>
    </div>
  );
}
