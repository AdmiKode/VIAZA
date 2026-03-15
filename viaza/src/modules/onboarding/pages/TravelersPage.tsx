import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppStore } from '../../../app/store/useAppStore';
import type { TravelerGroup } from '../../../types/trip';

const GROUPS: Array<{ value: TravelerGroup; labelKey: string; descKey: string; icon: JSX.Element; bg: string }> = [
  {
    value: 'solo',
    labelKey: 'travelerGroup.solo',
    descKey: 'travelerGroup.solo.desc',
    bg: '#12212E',
    icon: (
      <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="16" r="10" fill="#6CA3A2" />
        <circle cx="20" cy="12" r="5" fill="white" opacity="0.4" />
        <path d="M8 42c0-8.84 7.16-16 16-16s16 7.16 16 16" fill="#6CA3A2" />
        <path d="M8 42c0-8.84 7.16-16 16-16s8 3.58 12 8" fill="white" opacity="0.3" />
      </svg>
    ),
  },
  {
    value: 'couple',
    labelKey: 'travelerGroup.couple',
    descKey: 'travelerGroup.couple.desc',
    bg: '#307082',
    icon: (
      <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
        <circle cx="18" cy="16" r="8" fill="#ECE7DC" opacity="0.9" />
        <circle cx="15" cy="13" r="4" fill="white" opacity="0.4" />
        <circle cx="30" cy="16" r="8" fill="#EA9940" />
        <circle cx="27" cy="13" r="4" fill="white" opacity="0.4" />
        <path d="M4 44c0-7.73 6.27-14 14-14s8 3.13 10 7c2-3.87 4.27-7 10-7s14 6.27 14 14" fill="#6CA3A2" />
        <path d="M4 44c0-7.73 6.27-14 14-14s8 3.13 10 7z" fill="white" opacity="0.3" />
      </svg>
    ),
  },
  {
    value: 'family',
    labelKey: 'travelerGroup.family',
    descKey: 'travelerGroup.family.desc',
    bg: '#12212E',
    icon: (
      <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="12" r="7" fill="#EA9940" />
        <circle cx="21" cy="9" r="3.5" fill="white" opacity="0.4" />
        <circle cx="12" cy="18" r="6" fill="#6CA3A2" />
        <circle cx="9" cy="15" r="3" fill="white" opacity="0.4" />
        <circle cx="36" cy="18" r="6" fill="#6CA3A2" />
        <circle cx="33" cy="15" r="3" fill="white" opacity="0.4" />
        <path d="M4 44c0-6.63 5.37-12 12-12 2.8 0 5.37 0.96 7.38 2.55A11.97 11.97 0 0 1 28 32c6.63 0 12 5.37 12 12" fill="#307082" />
        <path d="M4 44c0-6.63 5.37-12 12-12 3 0 5.7 1.1 7.8 2.9A12 12 0 0 0 16 32z" fill="white" opacity="0.3" />
      </svg>
    ),
  },
  {
    value: 'family_baby',
    labelKey: 'travelerGroup.family_baby',
    descKey: 'travelerGroup.family_baby.desc',
    bg: '#307082',
    icon: (
      <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="13" r="8" fill="#EA9940" />
        <circle cx="21" cy="10" r="4" fill="white" opacity="0.45" />
        <path d="M10 40c0-7.73 6.27-14 14-14s14 6.27 14 14" fill="#6CA3A2" />
        {/* bebé */}
        <circle cx="38" cy="28" r="6" fill="#ECE7DC" opacity="0.90" />
        <circle cx="36" cy="26" r="3" fill="white" opacity="0.50" />
      </svg>
    ),
  },
  {
    value: 'friends',
    labelKey: 'travelerGroup.friends',
    descKey: 'travelerGroup.friends.desc',
    bg: '#307082',
    icon: (
      <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
        <circle cx="14" cy="14" r="7" fill="#6CA3A2" />
        <circle cx="11" cy="11" r="3.5" fill="white" opacity="0.4" />
        <circle cx="34" cy="14" r="7" fill="#EA9940" />
        <circle cx="31" cy="11" r="3.5" fill="white" opacity="0.4" />
        <circle cx="14" cy="34" r="7" fill="#EA9940" />
        <circle cx="11" cy="31" r="3.5" fill="white" opacity="0.4" />
        <circle cx="34" cy="34" r="7" fill="#6CA3A2" />
        <circle cx="31" cy="31" r="3.5" fill="white" opacity="0.4" />
      </svg>
    ),
  },
];

function Stepper({ value, min, max, onChange }: { value: number; min: number; max: number; onChange: (v: number) => void }) {
  const safe = Number.isFinite(value) ? value : min;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <button
        type="button"
        onClick={() => onChange(Math.max(min, safe - 1))}
        disabled={safe <= min}
        style={{
          width: 36, height: 36, borderRadius: '50%',
          border: '1.5px solid rgba(18,33,46,0.18)',
          background: safe <= min ? 'rgba(18,33,46,0.06)' : '#ECE7DC',
          boxShadow: safe <= min ? 'none' : '3px 3px 8px rgba(18,33,46,0.12), -2px -2px 6px rgba(255,255,255,0.80)',
          color: '#12212E',
          fontSize: 20,
          fontWeight: 700,
          cursor: safe <= min ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: safe <= min ? 0.35 : 1,
        }}
      >−</button>
      <span style={{ fontSize: 22, fontWeight: 700, color: '#12212E', minWidth: 24, textAlign: 'center', fontFamily: 'Questrial, sans-serif' }}>
        {safe}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, safe + 1))}
        disabled={safe >= max}
        style={{
          width: 36, height: 36, borderRadius: '50%',
          border: '1.5px solid rgba(18,33,46,0.18)',
          background: safe >= max ? 'rgba(18,33,46,0.06)' : '#ECE7DC',
          boxShadow: safe >= max ? 'none' : '3px 3px 8px rgba(18,33,46,0.12), -2px -2px 6px rgba(255,255,255,0.80)',
          color: '#12212E',
          fontSize: 20,
          fontWeight: 700,
          cursor: safe >= max ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: safe >= max ? 0.35 : 1,
        }}
      >+</button>
    </div>
  );
}

export function TravelersPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const selected = useAppStore((s) => s.onboardingDraft.travelerGroup);
  const numberOfAdults = useAppStore((s) => s.onboardingDraft.numberOfAdults);
  const numberOfKids = useAppStore((s) => s.onboardingDraft.numberOfKids);
  const numberOfBabies = useAppStore((s) => s.onboardingDraft.numberOfBabies);
  const setDraft = useAppStore((s) => s.setOnboardingDraft);

  const needsCount = selected === 'family' || selected === 'family_baby' || selected === 'friends';
  const hasBabies = selected === 'family_baby';

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="flex min-h-full flex-col pb-10"
      style={{ background: '#ECE7DC', fontFamily: 'Questrial, sans-serif' }}
    >
      {/* Header */}
      <div className="px-5 pt-8 pb-2">
        <div
          className="mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1"
          style={{ background: 'rgba(234,153,64,0.12)' }}
        >
          <span style={{ color: '#EA9940', fontSize: 12, fontWeight: 700 }}>
            {t('onboarding.step', { current: 6, total: 8 })}
          </span>
        </div>
        <h1 style={{ color: '#12212E', fontSize: 26, fontWeight: 700, lineHeight: 1.15 }}>
          {t('onboarding.travelers.title')}
        </h1>
        <p style={{ color: 'rgba(18,33,46,0.55)', fontSize: 14, marginTop: 6 }}>
          {t('onboarding.travelers.prompt')}
        </p>
      </div>

      {/* Grid grupos */}
      <div className="grid grid-cols-2 gap-3 px-5 pt-4">
        {GROUPS.map((group, i) => {
          const isSelected = selected === group.value;
          return (
            <motion.button
              key={group.value}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.07, duration: 0.3 }}
              type="button"
              onClick={() => setDraft({ travelerGroup: group.value })}
              className={`relative flex flex-col items-start overflow-hidden rounded-2xl p-4 transition-all active:scale-[0.97] ${
                isSelected ? 'ring-2 ring-[#EA9940] ring-offset-2' : ''
              }`}
              style={{
                background: group.bg,
                boxShadow: isSelected ? '0 8px 24px rgba(234,153,64,0.30)' : '0 4px 16px rgba(18,33,46,0.12)',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
              <div className="relative">{group.icon}</div>
              <div className="relative mt-3 text-left">
                <div className="text-base font-semibold text-white">{t(group.labelKey)}</div>
                <div className="mt-0.5 text-xs text-white/60">{t(group.descKey)}</div>
              </div>
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-[#EA9940]"
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

      {/* Stepper personas — aparece cuando aplica */}
      {needsCount && (
        <motion.div
          key="stepper"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mx-5 mt-4 rounded-3xl p-5"
          style={{
            background: 'white',
            boxShadow: '0 4px 20px rgba(18,33,46,0.08)',
          }}
        >
          <p style={{ color: '#12212E', fontSize: 14, fontWeight: 700, marginBottom: 16 }}>
            {t('travelers.howMany')}
          </p>

          {/* Adultos */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <div style={{ color: '#12212E', fontSize: 15, fontWeight: 600 }}>
                {t('travelers.adults')}
              </div>
              <div style={{ color: 'rgba(18,33,46,0.45)', fontSize: 12 }}>
                {t('travelers.adults.hint')}
              </div>
            </div>
            <Stepper
              value={numberOfAdults}
              min={1}
              max={8}
              onChange={(v) => setDraft({ numberOfAdults: v })}
            />
          </div>

          {/* Separador */}
          <div style={{ height: 1, background: 'rgba(18,33,46,0.07)', marginBottom: 16 }} />

          {/* Niños */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ color: '#12212E', fontSize: 15, fontWeight: 600 }}>
                {t('travelers.kids')}
              </div>
              <div style={{ color: 'rgba(18,33,46,0.45)', fontSize: 12 }}>
                {t('travelers.kids.hint')}
              </div>
            </div>
            <Stepper
              value={numberOfKids}
              min={0}
              max={6}
              onChange={(v) => setDraft({ numberOfKids: v })}
            />
          </div>

          {/* Bebés (solo family_baby) */}
          {hasBabies && (
            <>
              <div style={{ height: 1, background: 'rgba(18,33,46,0.07)', margin: '16px 0' }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ color: '#12212E', fontSize: 15, fontWeight: 600 }}>
                    {t('travelers.babies')}
                  </div>
                  <div style={{ color: 'rgba(18,33,46,0.45)', fontSize: 12 }}>
                    {t('travelers.babies.hint')}
                  </div>
                </div>
                <Stepper
                  value={numberOfBabies}
                  min={0}
                  max={4}
                  onChange={(v) => setDraft({ numberOfBabies: v })}
                />
              </div>
            </>
          )}

          {/* Resumen */}
          {(numberOfAdults + numberOfKids + numberOfBabies) > 0 && (
            <div
              style={{
                marginTop: 16,
                padding: '10px 14px',
                borderRadius: 12,
                background: 'rgba(234,153,64,0.10)',
                border: '1px solid rgba(234,153,64,0.25)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 48 48" fill="none">
                <rect x="8" y="12" width="32" height="28" rx="5" fill="#EA9940" opacity="0.85" />
                <path d="M18 12v-4a6 6 0 0 1 12 0v4" stroke="#EA9940" strokeWidth="3.5" strokeLinecap="round" fill="none" />
              </svg>
              <span style={{ color: '#EA9940', fontSize: 13, fontWeight: 600 }}>
                {t('travelers.summary', { total: numberOfAdults + numberOfKids + numberOfBabies })}
              </span>
            </div>
          )}
        </motion.div>
      )}

      {/* Botones */}
      <div className="mt-auto flex gap-3 px-5 pt-6">
        <button
          type="button"
          onClick={() => navigate('/onboarding/smart-detection')}
          style={{
            flex: 1, height: 54, borderRadius: 16,
            border: '1.5px solid rgba(18,33,46,0.15)',
            background: 'transparent', color: '#12212E',
            fontSize: 15, fontWeight: 700, cursor: 'pointer',
          }}
        >
          {t('common.back')}
        </button>
        <button
          type="button"
          disabled={!selected}
          onClick={() => navigate('/onboarding/preferences')}
          style={{
            flex: 2, height: 54, borderRadius: 16,
            background: selected ? '#EA9940' : 'rgba(18,33,46,0.12)',
            color: selected ? 'white' : 'rgba(18,33,46,0.30)',
            fontSize: 15, fontWeight: 700,
            border: 'none', cursor: selected ? 'pointer' : 'default',
            boxShadow: selected ? '0 6px 20px rgba(234,153,64,0.35)' : 'none',
            transition: 'all 0.25s ease',
          }}
        >
          {t('common.continue')}
        </button>
      </div>
    </motion.div>
  );
}
