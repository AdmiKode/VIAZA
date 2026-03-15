import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppStore } from '../../../app/store/useAppStore';
import type { LaundryMode } from '../../../types/trip';

const LAUNDRY_OPTIONS: Array<{ value: LaundryMode; labelKey: string; descKey: string }> = [
  { value: 'none', labelKey: 'laundryMode.none', descKey: 'laundryMode.none.note' },
  { value: 'laundry_service', labelKey: 'laundryMode.laundry_service', descKey: 'laundryMode.laundry_service.note' },
  { value: 'washer', labelKey: 'laundryMode.washer', descKey: 'laundryMode.washer.note' },
];

const TRAVEL_STYLE_OPTIONS: Array<{ value: 'backpack_light' | 'standard' | 'comfort'; labelKey: string; descKey: string }> = [
  { value: 'backpack_light', labelKey: 'travelStyle.backpack_light', descKey: 'travelStyle.backpack_light.desc' },
  { value: 'standard', labelKey: 'travelStyle.standard', descKey: 'travelStyle.standard.desc' },
  { value: 'comfort', labelKey: 'travelStyle.comfort', descKey: 'travelStyle.comfort.desc' },
];

const TRAVELER_PROFILE_OPTIONS: Array<{ value: 'economic' | 'balanced' | 'comfort' | 'premium'; labelKey: string; descKey: string }> = [
  { value: 'economic', labelKey: 'travelerProfile.economic', descKey: 'travelerProfile.economic.desc' },
  { value: 'balanced', labelKey: 'travelerProfile.balanced', descKey: 'travelerProfile.balanced.desc' },
  { value: 'comfort', labelKey: 'travelerProfile.comfort', descKey: 'travelerProfile.comfort.desc' },
  { value: 'premium', labelKey: 'travelerProfile.premium', descKey: 'travelerProfile.premium.desc' },
];

function Toggle({
  active,
  onToggle,
}: {
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative h-7 w-12 rounded-full transition-colors duration-200 ${
        active ? 'bg-[var(--viaza-accent)]' : 'bg-[rgb(var(--viaza-primary-rgb)/0.15)]'
      }`}
    >
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        className="absolute top-1 h-5 w-5 rounded-full bg-white shadow"
        style={{ left: active ? '24px' : '4px' }}
      />
    </button>
  );
}

export function PreferencesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const draft = useAppStore((s) => s.onboardingDraft);
  const setDraft = useAppStore((s) => s.setOnboardingDraft);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="flex min-h-full flex-col px-5 pt-8 pb-10"
    >
      <div className="mb-8">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[rgb(var(--viaza-accent-rgb)/0.12)] px-3 py-1">
          <span className="text-xs font-semibold text-[var(--viaza-accent)]">
            {t('onboarding.step', { current: 7, total: 8 })}
          </span>
        </div>
        <h1 className="text-2xl font-semibold leading-tight text-[var(--viaza-primary)]">
          {t('onboarding.preferences.title')}
        </h1>
        <p className="mt-1 text-sm text-[rgb(var(--viaza-primary-rgb)/0.60)]">
          {t('onboarding.preferences.prompt')}
        </p>
      </div>

      {/* Toggles */}
      <div className="space-y-3">
        {/* Laptop */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.05, duration: 0.3 }}
          className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-[var(--shadow-1)]"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[rgb(var(--viaza-primary-rgb)/0.06)]">
              <svg width="22" height="22" viewBox="0 0 48 48" fill="none">
                <rect x="5" y="10" width="38" height="26" rx="5" fill="var(--viaza-primary)" />
                <rect x="5" y="10" width="38" height="12" rx="5" fill="white" opacity="0.35" />
                <rect x="2" y="34" width="44" height="6" rx="3" fill="var(--viaza-primary)" />
                <rect x="18" y="37" width="12" height="2" rx="1" fill="white" opacity="0.5" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-semibold text-[var(--viaza-primary)]">
                {t('onboarding.preferences.laptop')}
              </div>
              <div className="text-xs text-[rgb(var(--viaza-primary-rgb)/0.55)]">
                {t('onboarding.preferences.laptopDesc')}
              </div>
            </div>
          </div>
          <Toggle
            active={draft.hasLaptop}
            onToggle={() => setDraft({ hasLaptop: !draft.hasLaptop })}
          />
        </motion.div>

        {/* Travel light */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-[var(--shadow-1)]"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[rgb(var(--viaza-primary-rgb)/0.06)]">
              <svg width="22" height="22" viewBox="0 0 48 48" fill="none">
                <rect x="10" y="14" width="28" height="28" rx="5" fill="var(--viaza-accent)" />
                <rect x="10" y="14" width="28" height="12" rx="5" fill="white" opacity="0.4" />
                <path d="M18 14v-4a6 6 0 0 1 12 0v4" stroke="var(--viaza-accent)" strokeWidth="4" strokeLinecap="round" fill="none" />
                <path d="M18 14v-4a6 6 0 0 1 12 0v4" stroke="white" strokeWidth="4" strokeLinecap="round" opacity="0.4" fill="none" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-semibold text-[var(--viaza-primary)]">
                {t('onboarding.preferences.travelLight')}
              </div>
              <div className="text-xs text-[rgb(var(--viaza-primary-rgb)/0.55)]">
                {t('onboarding.preferences.travelLightDesc')}
              </div>
            </div>
          </div>
          <Toggle
            active={draft.travelLight}
            onToggle={() => setDraft({ travelLight: !draft.travelLight })}
          />
        </motion.div>
      </div>

      {/* Perfil del viajero (señales para IA / recomendaciones / organización) */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.14, duration: 0.3 }}
        className="mt-6"
      >
        <div className="mb-3 text-sm font-semibold text-[var(--viaza-primary)]">
          {t('onboarding.profile.title')}
        </div>
        <div className="space-y-2">
          {TRAVELER_PROFILE_OPTIONS.map((opt, i) => {
            const isSelected = draft.travelerProfile === opt.value;
            return (
              <motion.button
                key={opt.value}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.16 + i * 0.05, duration: 0.25 }}
                type="button"
                onClick={() => setDraft({ travelerProfile: opt.value })}
                className={`flex w-full items-center justify-between rounded-2xl p-4 text-left shadow-[var(--shadow-1)] transition-all active:scale-[0.98] ${
                  isSelected ? 'bg-[var(--viaza-primary)] shadow-[var(--shadow-2)]' : 'bg-white'
                }`}
              >
                <div>
                  <div className={`text-sm font-semibold ${isSelected ? 'text-[var(--viaza-background)]' : 'text-[var(--viaza-primary)]'}`}>
                    {t(opt.labelKey)}
                  </div>
                  <div className={`mt-0.5 text-xs ${isSelected ? 'text-[rgb(var(--viaza-background-rgb)/0.65)]' : 'text-[rgb(var(--viaza-primary-rgb)/0.55)]'}`}>
                    {t(opt.descKey)}
                  </div>
                </div>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-3 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[var(--viaza-accent)]"
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
      </motion.div>

      {/* Estilo de viaje / equipaje */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.16, duration: 0.3 }}
        className="mt-6"
      >
        <div className="mb-3 text-sm font-semibold text-[var(--viaza-primary)]">
          {t('onboarding.travelStyle.title')}
        </div>
        <div className="space-y-2">
          {TRAVEL_STYLE_OPTIONS.map((opt, i) => {
            const isSelected = draft.travelStyle === opt.value;
            return (
              <motion.button
                key={opt.value}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 + i * 0.05, duration: 0.25 }}
                type="button"
                onClick={() => {
                  const patch =
                    opt.value === 'backpack_light'
                      ? { travelStyle: opt.value, travelLight: true, packingStyle: 'light' as const }
                      : opt.value === 'comfort'
                        ? { travelStyle: opt.value, travelLight: false, packingStyle: 'heavy' as const }
                        : { travelStyle: opt.value, travelLight: false, packingStyle: 'normal' as const };
                  setDraft(patch);
                }}
                className={`flex w-full items-center justify-between rounded-2xl p-4 text-left shadow-[var(--shadow-1)] transition-all active:scale-[0.98] ${
                  isSelected ? 'bg-[var(--viaza-primary)] shadow-[var(--shadow-2)]' : 'bg-white'
                }`}
              >
                <div>
                  <div className={`text-sm font-semibold ${isSelected ? 'text-[var(--viaza-background)]' : 'text-[var(--viaza-primary)]'}`}>
                    {t(opt.labelKey)}
                  </div>
                  <div className={`mt-0.5 text-xs ${isSelected ? 'text-[rgb(var(--viaza-background-rgb)/0.65)]' : 'text-[rgb(var(--viaza-primary-rgb)/0.55)]'}`}>
                    {t(opt.descKey)}
                  </div>
                </div>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-3 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[var(--viaza-accent)]"
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
      </motion.div>

      {/* Laundry */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="mt-6"
      >
        <div className="mb-3 text-sm font-semibold text-[var(--viaza-primary)]">
          {t('onboarding.preferences.laundryTitle')}
        </div>
        <div className="space-y-2">
          {LAUNDRY_OPTIONS.map((opt, i) => {
            const isSelected = draft.laundryMode === opt.value;
            return (
              <motion.button
                key={opt.value}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.06, duration: 0.25 }}
                type="button"
                onClick={() => setDraft({ laundryMode: opt.value })}
                className={`flex w-full items-center justify-between rounded-2xl p-4 text-left shadow-[var(--shadow-1)] transition-all active:scale-[0.98] ${
                  isSelected
                    ? 'bg-[var(--viaza-primary)] shadow-[var(--shadow-2)]'
                    : 'bg-white'
                }`}
              >
                <div>
                  <div className={`text-sm font-semibold ${isSelected ? 'text-[var(--viaza-background)]' : 'text-[var(--viaza-primary)]'}`}>
                    {t(opt.labelKey)}
                  </div>
                  <div className={`mt-0.5 text-xs ${isSelected ? 'text-[rgb(var(--viaza-background-rgb)/0.65)]' : 'text-[rgb(var(--viaza-primary-rgb)/0.55)]'}`}>
                    {t(opt.descKey)}
                  </div>
                </div>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-3 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[var(--viaza-accent)]"
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
      </motion.div>

      <div className="mt-auto flex gap-3 pt-8">
        <button
          type="button"
          onClick={() => navigate('/onboarding/travelers')}
          className="flex-1 rounded-2xl border border-[rgb(var(--viaza-primary-rgb)/0.12)] py-4 text-base font-semibold text-[var(--viaza-primary)] transition-all active:scale-[0.98]"
        >
          {t('common.back')}
        </button>
        <button
          type="button"
          onClick={() => navigate('/onboarding/summary')}
          className="flex-1 rounded-2xl bg-[var(--viaza-primary)] py-4 text-base font-semibold text-[var(--viaza-background)] shadow-[var(--shadow-2)] transition-all active:scale-[0.98]"
        >
          {t('common.continue')}
        </button>
      </div>
    </motion.div>
  );
}
