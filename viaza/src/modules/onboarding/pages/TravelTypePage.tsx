import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppStore } from '../../../app/store/useAppStore';
import type { TravelType } from '../../../types/trip';

const TYPES: Array<{ value: TravelType; labelKey: string; descKey: string; icon: JSX.Element; bg: string }> = [
  {
    value: 'beach',
    labelKey: 'travelType.beach',
    descKey: 'travelType.beach.desc',
    bg: '#307082',
    icon: (
      <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="15" r="10" fill="#EA9940" />
        <circle cx="21" cy="12" r="6" fill="white" opacity="0.45" />
        <path d="M2 36c6-8 14-8 20-4s14 4 24-4v16H2z" fill="#12212E" />
        <path d="M2 36c6-8 14-8 20-4s8 2 14 0v16H2z" fill="white" opacity="0.30" />
      </svg>
    ),
  },
  {
    value: 'city',
    labelKey: 'travelType.city',
    descKey: 'travelType.city.desc',
    bg: '#12212E',
    icon: (
      <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
        <rect x="4" y="20" width="14" height="24" rx="2" fill="#307082" />
        <rect x="17" y="10" width="16" height="34" rx="2" fill="#307082" />
        <rect x="32" y="24" width="12" height="20" rx="2" fill="#307082" />
        <rect x="17" y="10" width="16" height="12" rx="2" fill="white" opacity="0.40" />
        <rect x="22" y="30" width="6" height="8" rx="1" fill="white" opacity="0.55" />
      </svg>
    ),
  },
  {
    value: 'mountain',
    labelKey: 'travelType.mountain',
    descKey: 'travelType.mountain.desc',
    bg: '#307082',
    icon: (
      <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
        <path d="M2 44L20 8l26 36z" fill="#6CA3A2" />
        <path d="M2 44L20 8l12 20z" fill="white" opacity="0.35" />
        <path d="M16 20l4-12 4 12z" fill="white" opacity="0.7" />
      </svg>
    ),
  },
  {
    value: 'snow',
    labelKey: 'travelType.snow',
    descKey: 'travelType.snow.desc',
    bg: '#12212E',
    icon: (
      <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
        {/* Mountain snowy */}
        <path d="M2 44L22 10l24 34z" fill="#6CA3A2" />
        <path d="M2 44L22 10l10 16z" fill="white" opacity="0.30" />
        {/* Snow cap */}
        <path d="M17 24l5-14 5 14z" fill="white" opacity="0.85" />
        {/* Snowflakes */}
        <circle cx="36" cy="16" r="2.5" fill="white" opacity="0.8" />
        <circle cx="40" cy="10" r="2" fill="white" opacity="0.6" />
        <circle cx="34" cy="8" r="1.5" fill="white" opacity="0.5" />
      </svg>
    ),
  },
  {
    value: 'camping',
    labelKey: 'travelType.camping',
    descKey: 'travelType.camping.desc',
    bg: '#307082',
    icon: (
      <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
        <path d="M2 44L24 6l22 38z" fill="#6CA3A2" />
        <path d="M2 44L24 6l10 18z" fill="white" opacity="0.30" />
        <path d="M16 44h16v-10l-8-7-8 7z" fill="#12212E" />
        <path d="M16 44h8v-10l-8 7z" fill="white" opacity="0.25" />
      </svg>
    ),
  },
  {
    value: 'roadtrip',
    labelKey: 'travelType.roadtrip',
    descKey: 'travelType.roadtrip.desc',
    bg: '#12212E',
    icon: (
      <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
        {/* Car body */}
        <rect x="4" y="24" width="40" height="14" rx="5" fill="#307082" />
        <rect x="4" y="24" width="40" height="7" rx="5" fill="white" opacity="0.28" />
        {/* Roof */}
        <rect x="10" y="16" width="28" height="10" rx="4" fill="#307082" />
        {/* Wheels */}
        <circle cx="13" cy="38" r="5" fill="#6CA3A2" />
        <circle cx="35" cy="38" r="5" fill="#6CA3A2" />
        <circle cx="13" cy="38" r="2.5" fill="white" opacity="0.55" />
        <circle cx="35" cy="38" r="2.5" fill="white" opacity="0.55" />
        {/* Windows */}
        <rect x="13" y="18" width="10" height="6" rx="2" fill="white" opacity="0.45" />
        <rect x="26" y="18" width="10" height="6" rx="2" fill="white" opacity="0.45" />
      </svg>
    ),
  },
  {
    value: 'adventure',
    labelKey: 'travelType.adventure',
    descKey: 'travelType.adventure.desc',
    bg: '#307082',
    icon: (
      <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
        {/* Backpack body */}
        <rect x="10" y="14" width="28" height="28" rx="8" fill="#12212E" />
        <rect x="10" y="14" width="28" height="14" rx="8" fill="white" opacity="0.28" />
        {/* Strap top */}
        <path d="M18 14v-5a6 6 0 0 1 12 0v5" fill="none" stroke="#EA9940" strokeWidth="3.5" strokeLinecap="round" />
        {/* Front pocket */}
        <rect x="16" y="30" width="16" height="10" rx="4" fill="#307082" />
        <rect x="16" y="30" width="16" height="5" rx="4" fill="white" opacity="0.30" />
        {/* Zipper line */}
        <line x1="20" y1="35" x2="28" y2="35" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.50" />
      </svg>
    ),
  },
  {
    value: 'work',
    labelKey: 'travelType.work',
    descKey: 'travelType.work.desc',
    bg: '#12212E',
    icon: (
      <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
        <rect x="4" y="12" width="40" height="26" rx="5" fill="#307082" />
        <rect x="4" y="12" width="40" height="12" rx="5" fill="white" opacity="0.35" />
        <rect x="1" y="38" width="46" height="5" rx="3" fill="#307082" />
        <path d="M18 12v-4a6 6 0 0 1 12 0v4" fill="#EA9940" />
        <path d="M18 12v-4a6 6 0 0 1 12 0v4" fill="white" opacity="0.40" />
      </svg>
    ),
  },
];

export function TravelTypePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const selected = useAppStore((s) => s.onboardingDraft.travelType);
  const setDraft = useAppStore((s) => s.setOnboardingDraft);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="flex min-h-full flex-col px-5 pt-8 pb-10"
    >
      <div className="mb-6">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[rgb(var(--viaza-accent-rgb)/0.12)] px-3 py-1">
          <span className="text-xs font-semibold text-[var(--viaza-accent)]">
            {t('onboarding.step', { current: 1, total: 8 })}
          </span>
        </div>
        <h1 className="text-2xl font-semibold leading-tight text-[var(--viaza-primary)]">
          {t('onboarding.travelType.title')}
        </h1>
        <p className="mt-1 text-sm text-[rgb(var(--viaza-primary-rgb)/0.60)]">
          {t('onboarding.travelType.prompt')}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {TYPES.map((type, i) => {
          const isSelected = selected === type.value;
          return (
            <motion.button
              key={type.value}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.06, duration: 0.28 }}
              type="button"
              onClick={() => setDraft({ travelType: type.value })}
              className={`relative flex flex-col items-start overflow-hidden rounded-2xl p-4 shadow-[var(--shadow-2)] transition-all active:scale-[0.97] ${
                isSelected ? 'ring-2 ring-[var(--viaza-accent)] ring-offset-2' : ''
              }`}
              style={{ background: type.bg }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
              <div className="relative">{type.icon}</div>
              <div className="relative mt-2 text-left">
                <div className="text-sm font-semibold text-white">{t(type.labelKey)}</div>
                <div className="text-xs text-white/55 mt-0.5">{t(type.descKey)}</div>
              </div>
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--viaza-accent)]"
                >
                  <svg width="12" height="12" viewBox="0 0 48 48" fill="none">
                    <path d="M10 24l10 10 18-18" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </svg>
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      <div className="mt-auto flex gap-3 pt-6">
        <button
          type="button"
          onClick={() => navigate('/onboarding/welcome')}
          className="flex-1 rounded-2xl border border-[rgb(var(--viaza-primary-rgb)/0.12)] py-4 text-base font-semibold text-[var(--viaza-primary)] transition-all active:scale-[0.98]"
        >
          {t('common.back')}
        </button>
        <button
          type="button"
          disabled={!selected}
          onClick={() => navigate('/onboarding/destination')}
          className="flex-1 rounded-2xl bg-[var(--viaza-accent)] py-4 text-base font-semibold text-white shadow-[var(--shadow-2)] transition-all active:scale-[0.98] disabled:opacity-40"
        >
          {t('common.continue')}
        </button>
      </div>
    </motion.div>
  );
}
