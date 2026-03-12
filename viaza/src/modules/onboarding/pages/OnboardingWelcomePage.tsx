import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

/* ── Feature icons duotone — base naranja + capa glass gris ── */
function IconSmartPlan() {
  return (
    <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
      {/* cerebro / mapa base naranja */}
      <path
        d="M24 6C16 6 10 12 10 20c0 5 3 10 7 13v5h14v-5c4-3 7-8 7-13 0-8-6-14-14-14z"
        fill="#EA9940"
      />
      {/* overlay glass superior */}
      <path
        d="M24 6C16 6 10 12 10 20c0 2 0.5 4 1.5 6"
        fill="rgba(180,192,200,0.45)"
      />
      {/* detalles interior */}
      <path d="M19 22h10M24 17v10" stroke="rgba(255,255,255,0.55)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <rect x="17" y="38" width="14" height="4" rx="2" fill="rgba(18,33,46,0.35)" />
    </svg>
  );
}

function IconWeatherDetect() {
  return (
    <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
      {/* sol base naranja */}
      <circle cx="22" cy="20" r="10" fill="#EA9940" />
      <path d="M22 6v4M22 30v4M6 20h4M34 20h4M10 10l3 3M31 31l3 3M10 30l3-3M31 9l3 3"
        stroke="#EA9940" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* nube glass encima */}
      <ellipse cx="30" cy="30" rx="13" ry="9" fill="rgba(180,192,200,0.80)" />
      <ellipse cx="22" cy="33" rx="9" ry="7" fill="rgba(180,192,200,0.70)" />
      <ellipse cx="36" cy="32" rx="7" ry="6" fill="rgba(180,192,200,0.65)" />
      <ellipse cx="26" cy="26" rx="7" ry="4" fill="rgba(255,255,255,0.30)" />
    </svg>
  );
}

function IconSmartPack() {
  return (
    <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
      {/* maleta base naranja */}
      <rect x="8" y="18" width="32" height="24" rx="7" fill="#EA9940" />
      <path d="M18 18v-4a6 6 0 0 1 12 0v4"
        stroke="#EA9940" strokeWidth="3" strokeLinecap="round" fill="none" />
      {/* brillo glass */}
      <rect x="8" y="18" width="32" height="11" rx="7" fill="rgba(255,255,255,0.22)" />
      {/* capa glass gris franja */}
      <rect x="8" y="27" width="32" height="8" fill="rgba(180,192,200,0.40)" />
      {/* check */}
      <path d="M19 32l4 4 8-8" stroke="rgba(255,255,255,0.80)" strokeWidth="2.8"
        strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

const FEATURES = [
  { Icon: IconSmartPlan,      titleKey: 'welcome.feature1.title',   descKey: 'welcome.feature1.desc' },
  { Icon: IconWeatherDetect,  titleKey: 'welcome.feature2.title',   descKey: 'welcome.feature2.desc' },
  { Icon: IconSmartPack,      titleKey: 'welcome.feature3.title',   descKey: 'welcome.feature3.desc' },
] as const;

export function OnboardingWelcomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div
      className="relative flex min-h-dvh flex-col overflow-hidden"
      style={{ background: '#12212E' }}
    >
      {/* Círculos de fondo decorativos */}
      <div
        className="pointer-events-none absolute -right-24 -top-24"
        style={{
          width: 380,
          height: 380,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(48,112,130,0.20) 0%, transparent 70%)',
        }}
      />
      <div
        className="pointer-events-none absolute -bottom-32 -left-20"
        style={{
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(234,153,64,0.14) 0%, transparent 70%)',
        }}
      />

      {/* ── Hero superior ── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="relative px-8 pt-16 pb-8"
      >
        {/* Logo + marca */}
        <div className="flex items-center gap-3 mb-6">
          <img
            src="/brand/logo-white.png"
            alt="VIAZA"
            style={{ height: 32, width: 'auto' }}
          />
        </div>

        {/* Headline grande */}
        <h1 style={{
          color: 'white',
          fontSize: 36,
          fontWeight: 800,
          lineHeight: 1.1,
          fontFamily: 'Questrial, sans-serif',
        }}>
          {t('onboarding.welcome.title')}
        </h1>
        <p style={{
          color: 'rgba(236,231,220,0.60)',
          fontSize: 15,
          marginTop: 12,
          lineHeight: 1.55,
          fontFamily: 'Questrial, sans-serif',
        }}>
          {t('onboarding.welcome.subtitle')}
        </p>
      </motion.div>

      {/* ── Feature cards ── */}
      <div className="relative flex-1 px-6 space-y-3">
        {FEATURES.map(({ Icon, titleKey, descKey }, i) => (
          <motion.div
            key={titleKey}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.15 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-4 rounded-2xl px-5 py-4"
            style={{
              background: 'rgba(255,255,255,0.06)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {/* Ícono en contenedor con brillo */}
            <div
              className="flex items-center justify-center rounded-2xl flex-shrink-0"
              style={{
                width: 56,
                height: 56,
                background: 'rgba(234,153,64,0.12)',
                border: '1px solid rgba(234,153,64,0.20)',
              }}
            >
              <Icon />
            </div>
            <div>
              <div style={{
                color: 'white',
                fontSize: 15,
                fontWeight: 700,
                fontFamily: 'Questrial, sans-serif',
              }}>
                {t(titleKey)}
              </div>
              <div style={{
                color: 'rgba(236,231,220,0.55)',
                fontSize: 13,
                marginTop: 2,
                fontFamily: 'Questrial, sans-serif',
              }}>
                {t(descKey)}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── CTA ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.55 }}
        className="px-6 pb-12 pt-6"
      >
        <button
          type="button"
          onClick={() => navigate('/onboarding/travel-type')}
          style={{
            width: '100%',
            height: 60,
            borderRadius: 20,
            background: '#EA9940',
            color: 'white',
            fontSize: 17,
            fontWeight: 700,
            fontFamily: 'Questrial, sans-serif',
            boxShadow: '0 8px 28px rgba(234,153,64,0.45)',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {t('common.start')} →
        </button>

        {/* Ya tengo cuenta */}
        <button
          type="button"
          onClick={() => navigate('/auth/login')}
          style={{
            width: '100%',
            marginTop: 14,
            background: 'transparent',
            border: 'none',
            color: 'rgba(255,255,255,0.45)',
            fontSize: 14,
            fontFamily: 'Questrial, sans-serif',
            cursor: 'pointer',
          }}
        >
          {t('onboarding.welcome.haveAccount', 'Ya tengo una cuenta')}
        </button>
      </motion.div>
    </div>
  );
}
