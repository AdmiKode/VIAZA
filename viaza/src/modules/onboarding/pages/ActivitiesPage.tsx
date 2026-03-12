import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../../app/store/useAppStore';
import { suggestActivities } from '../../../engines/activityEngine';

export function ActivitiesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const draft = useAppStore((s) => s.onboardingDraft);
  const setDraft = useAppStore((s) => s.setOnboardingDraft);

  const activities = suggestActivities(draft.travelType);
  const [selected, setSelected] = useState<Set<string>>(
    new Set(draft.activities ?? [])
  );

  function toggleActivity(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleContinue() {
    setDraft({ activities: Array.from(selected) });
    navigate('/onboarding/travelers');
  }

  function handleSkip() {
    setDraft({ activities: [] });
    navigate('/onboarding/travelers');
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="flex min-h-full flex-col px-5 pt-8 pb-10"
    >
      {/* Header */}
      <div className="mb-6">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[rgb(var(--viaza-accent-rgb)/0.12)] px-3 py-1">
          <span className="text-xs font-semibold text-[var(--viaza-accent)]">
            {t('onboarding.step', { current: 4, total: 7 })}
          </span>
        </div>
        <h1 className="text-2xl font-semibold leading-tight text-[var(--viaza-primary)]">
          {t('onboarding.activities.title')}
        </h1>
        <p className="mt-1 text-sm text-[rgb(var(--viaza-primary-rgb)/0.60)]">
          {t('onboarding.activities.prompt')}
        </p>
      </div>

      {/* Activity grid */}
      <div className="grid grid-cols-2 gap-3">
        {activities.map((activity, i) => {
          const isSelected = selected.has(activity.id);
          return (
            <motion.button
              key={activity.id}
              type="button"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05, duration: 0.28 }}
              onClick={() => toggleActivity(activity.id)}
              className={`relative flex flex-col items-start overflow-hidden rounded-2xl p-4 shadow-[var(--shadow-1)] transition-all active:scale-[0.97] ${
                isSelected
                  ? 'bg-[var(--viaza-primary)] ring-2 ring-[var(--viaza-accent)] ring-offset-2'
                  : 'bg-white'
              }`}
            >
              {/* Subtle gradient overlay */}
              {isSelected && (
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
              )}

              {/* Icon */}
              <div
                className={`relative flex h-11 w-11 items-center justify-center rounded-xl ${
                  isSelected ? 'bg-white/15' : 'bg-[rgb(var(--viaza-secondary-rgb)/0.10)]'
                }`}
                dangerouslySetInnerHTML={{ __html: activity.icon }}
              />

              {/* Label */}
              <div className={`relative mt-3 text-left text-sm font-semibold ${isSelected ? 'text-white' : 'text-[var(--viaza-primary)]'}`}>
                {t(activity.labelKey)}
              </div>

              {/* Check badge */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                    className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--viaza-accent)]"
                  >
                    <svg width="12" height="12" viewBox="0 0 48 48" fill="none">
                      <path d="M10 24l10 10 18-18" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </svg>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      {/* Selected count badge */}
      <AnimatePresence>
        {selected.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="mt-4 flex items-center justify-center gap-2"
          >
            <div className="flex items-center gap-2 rounded-full bg-[rgb(var(--viaza-accent-rgb)/0.12)] px-4 py-1.5">
              <div className="h-2 w-2 rounded-full bg-[var(--viaza-accent)]" />
              <span className="text-xs font-semibold text-[var(--viaza-accent)]">
                {selected.size} {t('onboarding.activities.selected')}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer CTAs */}
      <div className="mt-auto flex gap-3 pt-6">
        <button
          type="button"
          onClick={handleSkip}
          className="flex-1 rounded-2xl border border-[rgb(var(--viaza-primary-rgb)/0.12)] py-4 text-base font-semibold text-[rgb(var(--viaza-primary-rgb)/0.55)] transition-all active:scale-[0.98]"
        >
          {t('onboarding.activities.skip')}
        </button>
        <button
          type="button"
          onClick={handleContinue}
          className="flex-[2] rounded-2xl bg-[var(--viaza-accent)] py-4 text-base font-semibold text-white shadow-[var(--shadow-2)] transition-all active:scale-[0.98]"
        >
          {selected.size > 0 ? t('common.continue') : t('onboarding.activities.continueEmpty')}
        </button>
      </div>
    </motion.div>
  );
}
