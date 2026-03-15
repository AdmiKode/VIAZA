import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../../app/store/useAppStore';
import { openCustomerPortal, purchasePremium } from '../../../services/premiumService';
import { supabase } from '../../../services/supabaseClient';

/* ─── Beneficios del plan premium ─── */
const BENEFITS = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 48 48" fill="none">
        <rect x="4" y="10" width="40" height="28" rx="8" fill="var(--viaza-accent)" fillOpacity="0.9" />
        <rect x="4" y="10" width="40" height="14" rx="8" fill="var(--viaza-background)" fillOpacity="0.22" />
        <path d="M13 24h22M13 30h14" stroke="var(--viaza-background)" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
    titleKey: 'premium.benefit.ocr.title',
    descKey: 'premium.benefit.ocr.desc',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 48 48" fill="none">
        <path d="M12 36c0-8 6-16 12-16s12 8 12 16" stroke="var(--viaza-secondary)" strokeWidth="3" strokeLinecap="round" fill="none" />
        <rect x="10" y="8" width="28" height="20" rx="8" fill="var(--viaza-secondary)" fillOpacity="0.9" />
        <rect x="10" y="8" width="28" height="10" rx="8" fill="var(--viaza-background)" fillOpacity="0.22" />
        <circle cx="24" cy="18" r="4" fill="var(--viaza-background)" fillOpacity="0.65" />
      </svg>
    ),
    titleKey: 'premium.benefit.luggage.title',
    descKey: 'premium.benefit.luggage.desc',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="18" fill="var(--viaza-soft)" fillOpacity="0.9" />
        <circle cx="18" cy="18" r="9" fill="var(--viaza-background)" fillOpacity="0.18" />
        <path d="M24 13v22M18 17h8a4 4 0 0 1 0 8h-8" stroke="var(--viaza-background)" strokeWidth="3" strokeLinecap="round" fill="none" />
      </svg>
    ),
    titleKey: 'premium.benefit.currency.title',
    descKey: 'premium.benefit.currency.desc',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 48 48" fill="none">
        <path d="M8 38L22 24l-4-8 6-6 4 8 8-4 2 2-14 10 6 12-4 2-4-8-4 4z" fill="var(--viaza-accent)" />
        <circle cx="34" cy="14" r="8" fill="var(--viaza-primary)" fillOpacity="0.85" />
        <circle cx="34" cy="14" r="8" fill="var(--viaza-background)" fillOpacity="0.07" />
        <path d="M30 14h8M34 10v8" stroke="var(--viaza-background)" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
    titleKey: 'premium.benefit.trips.title',
    descKey: 'premium.benefit.trips.desc',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 48 48" fill="none">
        <rect x="6" y="10" width="36" height="24" rx="5" fill="var(--viaza-primary)" fillOpacity="0.9" />
        <rect x="6" y="10" width="36" height="12" rx="5" fill="var(--viaza-background)" fillOpacity="0.12" />
        <rect x="18" y="34" width="12" height="5" rx="2" fill="var(--viaza-primary)" fillOpacity="0.9" />
        <rect x="14" y="39" width="20" height="3" rx="1.5" fill="var(--viaza-primary)" fillOpacity="0.9" />
        <path d="M16 22l3 3 8-8" stroke="var(--viaza-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    titleKey: 'premium.benefit.offline.title',
    descKey: 'premium.benefit.offline.desc',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 48 48" fill="none">
        <path d="M24 4l-3 5.4A14 14 0 0 0 15 12L9 10.2l-5 8.6 4.6 3.7a14.4 14.4 0 0 0 0 3l-4.6 3.7 5 8.6L15 36a14 14 0 0 0 6 2.6L24 44l3-5.4A14 14 0 0 0 33 36l6 1.8 5-8.6-4.6-3.7a14.4 14.4 0 0 0 0-3l4.6-3.7-5-8.6L33 12a14 14 0 0 0-6-2.6z" fill="var(--viaza-secondary)" fillOpacity="0.9" />
        <circle cx="24" cy="24" r="7" fill="var(--viaza-background)" fillOpacity="0.18" />
        <circle cx="24" cy="24" r="3" fill="var(--viaza-background)" fillOpacity="0.65" />
      </svg>
    ),
    titleKey: 'premium.benefit.priority.title',
    descKey: 'premium.benefit.priority.desc',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 48 48" fill="none">
        <rect x="6" y="8" width="36" height="32" rx="6" fill="var(--viaza-secondary)" fillOpacity="0.9" />
        <path d="M16 20h16M16 28h10" stroke="var(--viaza-background)" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="36" cy="12" r="7" fill="var(--viaza-accent)" />
        <path d="M33 12h6M36 9v6" stroke="var(--viaza-background)" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    titleKey: 'premium.benefit.agenda.title',
    descKey: 'premium.benefit.agenda.desc',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 48 48" fill="none">
        <rect x="4" y="6" width="40" height="36" rx="7" fill="var(--viaza-soft)" fillOpacity="0.9" />
        <path d="M4 14h40" stroke="var(--viaza-background)" strokeWidth="2" strokeOpacity="0.35" />
        <circle cx="13" cy="10" r="2.5" fill="var(--viaza-background)" fillOpacity="0.45" />
        <circle cx="20" cy="10" r="2.5" fill="var(--viaza-background)" fillOpacity="0.45" />
        <path d="M12 24v14M12 24l10 7 10-7v14" stroke="var(--viaza-background)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    titleKey: 'premium.benefit.itinerary.title',
    descKey: 'premium.benefit.itinerary.desc',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 48 48" fill="none">
        <rect x="4" y="10" width="40" height="28" rx="6" fill="var(--viaza-accent)" fillOpacity="0.85" />
        <path d="M12 22l3 3 6-6" stroke="var(--viaza-background)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M26 22h10M26 28h7" stroke="var(--viaza-background)" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="38" cy="8" r="7" fill="var(--viaza-primary)" />
        <path d="M35 8h6M38 5v6" stroke="var(--viaza-background)" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    titleKey: 'premium.benefit.import.title',
    descKey: 'premium.benefit.import.desc',
  },
];

export function PremiumPage() {
  const { t } = useTranslation();
  const isPremium = useAppStore((s) => s.isPremium);
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string>('');

  async function handleCheckout() {
    setLoadingCheckout(true);
    setCheckoutError('');
    try {
      const res = await purchasePremium();
      if (!res.success) {
        setCheckoutError(res.error ?? t('common.error'));
        setLoadingCheckout(false);
      }
    } finally {
      // si se redirige a Stripe, esta línea no se ejecuta (navegación)
      setTimeout(() => setLoadingCheckout(false), 1500);
    }
  }

  async function handlePortal() {
    setLoadingPortal(true);
    try {
      await openCustomerPortal();
    } finally {
      setLoadingPortal(false);
    }
  }

  return (
    <div
      className="min-h-dvh pb-32"
      style={{ background: 'var(--viaza-background)', fontFamily: 'Questrial, sans-serif' }}
    >
      {/* ── Hero ── */}
      <div
        className="relative overflow-hidden px-6 pt-14 pb-10"
        style={{
          background: 'linear-gradient(160deg, var(--viaza-primary) 0%, var(--viaza-secondary) 60%, var(--viaza-soft) 100%)',
          borderBottomLeftRadius: 32,
          borderBottomRightRadius: 32,
        }}
      >
        <div className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-full" style={{ background: 'rgb(255 255 255 / 0.05)' }}/>
        <div className="pointer-events-none absolute -left-8 bottom-0 h-36 w-36 rounded-full" style={{ background: 'rgb(var(--viaza-accent-rgb) / 0.12)' }}/>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          {/* Estrella */}
          <div className="mb-4 flex justify-center">
            <div className="flex items-center justify-center rounded-full" style={{ width: 64, height: 64, background: 'var(--viaza-accent)', boxShadow: '0 8px 28px rgb(var(--viaza-accent-rgb) / 0.5)' }}>
              <svg width="30" height="30" viewBox="0 0 48 48" fill="none">
                <path d="M24 4l5 10 11 1.6-8 7.8 1.9 11L24 29l-9.9 5.4L16 23.4 8 15.6 19 14z" fill="var(--viaza-background)" fillOpacity="0.95" />
                <path d="M24 4l5 10 11 1.6-8 7.8" fill="var(--viaza-background)" fillOpacity="0.35" />
              </svg>
            </div>
          </div>

          <div className="text-center">
            <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>
              VIAZA
            </div>
            <div style={{ color: 'white', fontSize: 30, fontWeight: 800, lineHeight: 1.1 }}>
              {isPremium ? t('premium.activeTitle') : t('premium.inactiveTitle')}
            </div>
            {!isPremium && (
              <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, marginTop: 8 }}>
                {t('premium.subtitle')}
              </div>
            )}
          </div>

          {/* Precio */}
          {!isPremium && (
            <div className="mt-8 flex items-center justify-center gap-3">
              <div
                className="rounded-2xl px-6 py-3"
                style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)' }}
              >
                <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>
                  {t('premium.price.label')}
                </div>
                <div style={{ color: 'white', fontSize: 32, fontWeight: 800, lineHeight: 1, marginTop: 2 }}>
                  {t('premium.price.value')}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11 }}>
                  {t('premium.price.period')}
                </div>
              </div>
            </div>
          )}

          {/* CTA Stripe / RevenueCat */}
          {!isPremium && (
            <>
              <motion.button
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={handleCheckout}
                disabled={loadingCheckout}
                className="mt-6 w-full rounded-2xl py-4 text-center font-bold transition flex items-center justify-center gap-2"
                style={{
                  background: 'var(--viaza-accent)',
                  color: 'var(--viaza-background)',
                  fontSize: 17,
                  fontFamily: 'Questrial, sans-serif',
                  boxShadow: '0 8px 28px rgb(var(--viaza-accent-rgb) / 0.45)',
                  border: 'none',
                  cursor: loadingCheckout ? 'default' : 'pointer',
                  opacity: loadingCheckout ? 0.7 : 1,
                }}
              >
                {loadingCheckout ? (
                  <>
                    <svg className="animate-spin" width="18" height="18" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="18" stroke="rgb(var(--viaza-background-rgb) / 0.25)" strokeWidth="4"/><path d="M24 6a18 18 0 0 1 18 18" stroke="var(--viaza-background)" strokeWidth="4" strokeLinecap="round"/></svg>
                    {t('premium.cta.opening')}
                  </>
                ) : t('premium.cta.buy')}
              </motion.button>
              {checkoutError && (
                <div className="mt-3 rounded-2xl border border-[rgb(var(--viaza-accent-rgb)/0.25)] bg-[rgb(var(--viaza-accent-rgb)/0.10)] p-4 text-sm text-[rgb(var(--viaza-background-rgb)/0.90)]">
                  {checkoutError}
                </div>
              )}
            </>
          )}

          {isPremium && (
            <div className="mt-6 flex flex-col items-center justify-center gap-3 rounded-2xl py-4" style={{ background: 'rgb(255 255 255 / 0.12)' }}>
              <svg width="20" height="20" viewBox="0 0 48 48" fill="none"><path d="M10 24l10 10 18-18" stroke="var(--viaza-accent)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span style={{ color: 'white', fontWeight: 700, fontSize: 15 }}>{t('premium.activeBadge')}</span>
              <button
                type="button"
                onClick={handlePortal}
                disabled={loadingPortal}
                style={{ background: 'rgb(255 255 255 / 0.18)', border: 'none', borderRadius: 9999, padding: '10px 16px', color: 'white', fontFamily: 'Questrial, sans-serif', fontWeight: 700, cursor: loadingPortal ? 'default' : 'pointer' }}
              >
                {loadingPortal ? t('premium.cta.opening') : t('premium.cta.manage')}
              </button>
            </div>
          )}
        </motion.div>
      </div>

      {/* ── Beneficios ── */}
      <div className="px-5 pt-8">
        <div style={{ color: 'rgba(18,33,46,0.45)', fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 16 }}>
          {t('premium.includes')}
        </div>

        <div className="space-y-3">
          {BENEFITS.map((b, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 + i * 0.06 }}
              className="flex items-start gap-4 rounded-3xl p-4"
              style={{
                background: 'rgb(255 255 255 / 0.70)',
                boxShadow: '0 2px 16px rgb(var(--viaza-primary-rgb) / 0.07)',
              }}
            >
              <div
                className="flex-shrink-0 flex items-center justify-center rounded-2xl"
                style={{ width: 48, height: 48, background: 'rgb(var(--viaza-primary-rgb) / 0.04)' }}
              >
                {b.icon}
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <div style={{ color: 'var(--viaza-primary)', fontSize: 14, fontWeight: 700 }}>{t(b.titleKey)}</div>
                <div style={{ color: 'rgb(var(--viaza-primary-rgb) / 0.55)', fontSize: 12, marginTop: 3, lineHeight: 1.5 }}>{t(b.descKey)}</div>
              </div>
              {isPremium && (
                <svg width="18" height="18" viewBox="0 0 48 48" fill="none" className="flex-shrink-0 mt-1">
                  <circle cx="24" cy="24" r="20" fill="var(--viaza-accent)" fillOpacity="0.15" />
                  <path d="M14 24l7 7 13-14" stroke="var(--viaza-accent)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </motion.div>
          ))}
        </div>

        {!isPremium && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={handleCheckout}
            disabled={loadingCheckout}
          className="mt-6 w-full rounded-2xl py-4 font-bold transition"
          style={{
              background: 'var(--viaza-primary)',
              color: 'var(--viaza-background)',
              fontSize: 16,
              border: 'none',
              cursor: loadingCheckout ? 'default' : 'pointer',
            }}
          >
            {loadingCheckout ? t('premium.cta.opening') : t('premium.cta.buy')}
          </motion.button>
        )}
      </div>
    </div>
  );
}
