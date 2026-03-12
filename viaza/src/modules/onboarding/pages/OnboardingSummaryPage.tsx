import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppStore } from '../../../app/store/useAppStore';

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-[rgb(var(--viaza-primary-rgb)/0.07)] last:border-0">
      <span className="text-sm text-[rgb(var(--viaza-primary-rgb)/0.55)]">{label}</span>
      <span className="text-sm font-semibold text-[var(--viaza-primary)]">{value}</span>
    </div>
  );
}

export function OnboardingSummaryPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const draft = useAppStore((s) => s.onboardingDraft);
  const createTripFromDraft = useAppStore((s) => s.createTripFromDraft);
  const resetDraft = useAppStore((s) => s.resetOnboardingDraft);
  const setDraft = useAppStore((s) => s.setOnboardingDraft);

  const [destInput, setDestInput] = useState(draft.destination);

  const canCreate = Boolean(
    draft.travelType && draft.travelerGroup && (draft.destination.trim().length >= 2 || destInput.trim().length >= 2)
  );

  const handleCreate = () => {
    if (destInput.trim().length >= 2 && !draft.destination) {
      setDraft({ destination: destInput.trim() });
    }
    const tripId = createTripFromDraft();
    resetDraft();
    navigate('/home', { replace: true, state: { createdTripId: tripId } });
  };

  const formatDate = (d: string) => {
    if (!d) return '—';
    const [y, m, day] = d.split('-');
    return `${day}/${m}/${y}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="flex min-h-full flex-col px-5 pt-8 pb-10"
    >
      {/* Step badge */}
      <div className="mb-6">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[rgb(var(--viaza-accent-rgb)/0.12)] px-3 py-1">
          <span className="text-xs font-semibold text-[var(--viaza-accent)]">
            {t('onboarding.step', { current: 6, total: 6 })}
          </span>
        </div>
        <h1 className="text-2xl font-semibold leading-tight text-[var(--viaza-primary)]">
          {t('onboarding.summary.title')}
        </h1>
        <p className="mt-1 text-sm text-[rgb(var(--viaza-primary-rgb)/0.60)]">
          {t('onboarding.summary.prompt')}
        </p>
      </div>

      {/* Hero destination card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="mb-4 overflow-hidden rounded-3xl bg-[var(--viaza-primary)] p-5 shadow-[var(--shadow-3)]"
      >
        <div className="text-xs font-semibold text-[rgb(var(--viaza-background-rgb)/0.6)] uppercase tracking-widest">
          {t('onboarding.summary.destination')}
        </div>

        {draft.destination ? (
          <div className="mt-1 text-3xl font-semibold text-[var(--viaza-background)]">
            {draft.destination}
          </div>
        ) : (
          <input
            value={destInput}
            onChange={(e) => setDestInput(e.target.value)}
            placeholder={t('onboarding.destination.placeholder')}
            className="mt-2 w-full rounded-xl bg-[rgb(var(--viaza-background-rgb)/0.10)] px-4 py-3 text-lg font-semibold text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-[var(--viaza-accent)]"
          />
        )}

        <div className="mt-3 flex flex-wrap gap-2">
          {draft.inferredClimate && (
            <span className="rounded-full bg-[rgb(var(--viaza-background-rgb)/0.12)] px-3 py-1 text-xs text-[var(--viaza-background)]">
              {t(`climate.${draft.inferredClimate}`)}
            </span>
          )}
          {draft.inferredCurrency && (
            <span className="rounded-full bg-[rgb(var(--viaza-background-rgb)/0.12)] px-3 py-1 text-xs text-[var(--viaza-background)]">
              {draft.inferredCurrency}
            </span>
          )}
          {draft.inferredLanguage && (
            <span className="rounded-full bg-[rgb(var(--viaza-background-rgb)/0.12)] px-3 py-1 text-xs text-[var(--viaza-background)]">
              {draft.inferredLanguage.toUpperCase()}
            </span>
          )}
          {draft.durationDays > 0 && (
            <span className="rounded-full bg-[var(--viaza-accent)] px-3 py-1 text-xs font-semibold text-white">
              {t('onboarding.dates.duration', { days: draft.durationDays })}
            </span>
          )}
        </div>
      </motion.div>

      {/* Detail rows */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.35 }}
        className="rounded-2xl bg-white px-4 shadow-[var(--shadow-1)]"
      >
        {draft.startDate && (
          <Row label={t('onboarding.dates.departure')} value={formatDate(draft.startDate)} />
        )}
        {draft.endDate && (
          <Row label={t('onboarding.dates.return')} value={formatDate(draft.endDate)} />
        )}
        {draft.travelType && (
          <Row label={t('onboarding.summary.type')} value={t(`travelType.${draft.travelType}`)} />
        )}
        {draft.travelerGroup && (
          <Row label={t('onboarding.summary.group')} value={t(`travelerGroup.${draft.travelerGroup}`)} />
        )}
        {(draft.numberOfAdults > 1 || draft.numberOfKids > 0) && (
          <Row
            label={t('travelers.howMany', '¿Cuántos viajan?')}
            value={`${draft.numberOfAdults} adultos${draft.numberOfKids > 0 ? ` · ${draft.numberOfKids} niños` : ''}`}
          />
        )}
        <Row
          label={t('onboarding.preferences.laptop')}
          value={draft.hasLaptop ? t('common.yes') : t('common.no')}
        />
        <Row
          label={t('onboarding.preferences.travelLight')}
          value={draft.travelLight ? t('common.yes') : t('common.no')}
        />
        <Row label={t('onboarding.summary.laundry')} value={t(`laundryMode.${draft.laundryMode}`)} />
      </motion.div>

      <div className="mt-auto flex gap-3 pt-8">
        <button
          type="button"
          onClick={() => navigate('/onboarding/preferences')}
          className="flex-1 rounded-2xl border border-[rgb(var(--viaza-primary-rgb)/0.12)] py-4 text-base font-semibold text-[var(--viaza-primary)] transition-all active:scale-[0.98]"
        >
          {t('common.back')}
        </button>
        <button
          type="button"
          disabled={!canCreate}
          onClick={handleCreate}
          className="flex-1 rounded-2xl bg-[var(--viaza-accent)] py-4 text-base font-semibold text-white shadow-[var(--shadow-2)] transition-all active:scale-[0.98] disabled:opacity-40"
        >
          {t('onboarding.createTrip')}
        </button>
      </div>
    </motion.div>
  );
}
