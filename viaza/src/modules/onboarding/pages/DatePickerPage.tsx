import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppStore } from '../../../app/store/useAppStore';

function calcDuration(start: string, end: string): number {
  if (!start || !end) return 0;
  const diff = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

export function DatePickerPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { startDate, endDate, durationDays } = useAppStore((s) => s.onboardingDraft);
  const setDraft = useAppStore((s) => s.setOnboardingDraft);

  const canContinue = Boolean(startDate && endDate && endDate >= startDate);

  function handleStart(val: string) {
    const dur = calcDuration(val, endDate);
    setDraft({ startDate: val, durationDays: dur || durationDays });
  }

  function handleEnd(val: string) {
    const dur = calcDuration(startDate, val);
    setDraft({ endDate: val, durationDays: dur || durationDays });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="flex min-h-full flex-col px-5 pt-8 pb-10"
    >
      {/* Header */}
      <div className="mb-8">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[rgb(var(--viaza-accent-rgb)/0.12)] px-3 py-1">
          <span className="text-xs font-semibold text-[var(--viaza-accent)]">
            {t('onboarding.step', { current: 3, total: 8 })}
          </span>
        </div>
        <h1 className="text-2xl font-semibold leading-tight text-[var(--viaza-primary)]">
          {t('onboarding.dates.title')}
        </h1>
        <p className="mt-1 text-sm text-[rgb(var(--viaza-primary-rgb)/0.60)]">
          {t('onboarding.dates.prompt')}
        </p>
      </div>

      {/* Tarjetas de fecha */}
      <div className="flex flex-col gap-4">
        {/* Salida */}
        <div className="rounded-2xl border-2 border-[rgb(var(--viaza-primary-rgb)/0.08)] bg-white p-4 shadow-[var(--shadow-1)] transition-all focus-within:border-[var(--viaza-accent)]">
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[rgb(var(--viaza-primary-rgb)/0.45)]">
            {t('onboarding.dates.departure')}
          </label>
          <input
            type="date"
            value={startDate}
            min={todayStr()}
            onChange={(e) => handleStart(e.target.value)}
            className="w-full bg-transparent text-base font-semibold text-[var(--viaza-primary)] outline-none"
          />
        </div>

        {/* Regreso */}
        <div className="rounded-2xl border-2 border-[rgb(var(--viaza-primary-rgb)/0.08)] bg-white p-4 shadow-[var(--shadow-1)] transition-all focus-within:border-[var(--viaza-accent)]">
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[rgb(var(--viaza-primary-rgb)/0.45)]">
            {t('onboarding.dates.return')}
          </label>
          <input
            type="date"
            value={endDate}
            min={startDate || todayStr()}
            onChange={(e) => handleEnd(e.target.value)}
            className="w-full bg-transparent text-base font-semibold text-[var(--viaza-primary)] outline-none"
          />
        </div>

        {/* Duración calculada */}
        {canContinue && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-center gap-3 rounded-2xl bg-[rgb(var(--viaza-accent-rgb)/0.10)] px-5 py-4"
          >
            {/* ícono duotone calendario */}
            <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
              <rect x="4" y="9" width="40" height="36" rx="8" fill="var(--viaza-accent)" />
              <rect x="4" y="9" width="40" height="15" rx="8" fill="white" opacity="0.55" />
              <rect x="4" y="18" width="40" height="6" fill="white" opacity="0.55" />
              <rect x="14" y="4" width="5" height="11" rx="2.5" fill="var(--viaza-accent)" />
              <rect x="29" y="4" width="5" height="11" rx="2.5" fill="var(--viaza-accent)" />
            </svg>
            <div>
              <div className="text-xl font-semibold text-[var(--viaza-primary)]">
                {t('onboarding.dates.duration', { days: durationDays })}
              </div>
              <div className="text-xs text-[rgb(var(--viaza-primary-rgb)/0.55)]">
                {t('onboarding.dates.durationNote')}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Botones */}
      <div className="mt-auto flex gap-3 pt-8">
        <button
          type="button"
          onClick={() => navigate('/onboarding/destination')}
          className="flex-1 rounded-2xl border border-[rgb(var(--viaza-primary-rgb)/0.12)] py-4 text-base font-semibold text-[var(--viaza-primary)] transition-all active:scale-[0.98]"
        >
          {t('common.back')}
        </button>
        <button
          type="button"
          disabled={!canContinue}
          onClick={() => navigate('/onboarding/transport')}
          className="flex-2 flex-1 rounded-2xl bg-[var(--viaza-primary)] py-4 text-base font-semibold text-[var(--viaza-background)] shadow-[var(--shadow-2)] transition-all active:scale-[0.98] disabled:opacity-40"
        >
          {t('common.continue')}
        </button>
      </div>
    </motion.div>
  );
}
