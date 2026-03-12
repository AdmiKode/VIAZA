import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

/* ────────────────────────────────────────────────────────────
   Ilustraciones SVG duotone — TAMAÑO COMPLETO
   Base sólida #EA9940 + overlay glass gris
──────────────────────────────────────────────────────────── */

function IlluDestination() {
  return (
    <svg width="320" height="320" viewBox="0 0 200 200" fill="none">
      {/* Glow detrás del globo */}
      <circle cx="100" cy="105" r="85" fill="rgba(234,153,64,0.10)" />
      {/* Globo terráqueo base naranja */}
      <circle cx="100" cy="100" r="72" fill="#EA9940" />
      {/* Sombra inferior */}
      <ellipse cx="100" cy="172" rx="52" ry="8" fill="rgba(18,33,46,0.22)" />
      {/* Continentes — capa glass gris */}
      <ellipse cx="80" cy="85" rx="28" ry="20" fill="rgba(180,192,200,0.55)" />
      <ellipse cx="125" cy="75" rx="16" ry="12" fill="rgba(180,192,200,0.45)" />
      <ellipse cx="110" cy="118" rx="22" ry="15" fill="rgba(180,192,200,0.50)" />
      <ellipse cx="72" cy="120" rx="12" ry="8" fill="rgba(180,192,200,0.40)" />
      <ellipse cx="58" cy="98" rx="9" ry="6" fill="rgba(180,192,200,0.35)" />
      {/* Líneas de latitud */}
      <path d="M28 100 Q100 88 172 100" stroke="rgba(255,255,255,0.22)" strokeWidth="1.5" fill="none" />
      <path d="M35 120 Q100 108 165 120" stroke="rgba(255,255,255,0.15)" strokeWidth="1.2" fill="none" />
      <path d="M35 80 Q100 68 165 80" stroke="rgba(255,255,255,0.15)" strokeWidth="1.2" fill="none" />
      {/* Brillo superior izquierdo */}
      <ellipse cx="72" cy="65" rx="22" ry="14" fill="rgba(255,255,255,0.18)" />
      {/* Pin flotante encima */}
      <path d="M100 14C88 14 78 24 78 36C78 50 100 68 100 68s22-18 22-32c0-12-10-22-22-22z" fill="white" />
      <circle cx="100" cy="36" r="9" fill="#EA9940" />
      <circle cx="100" cy="36" r="4" fill="white" />
      {/* Sombra del pin */}
      <ellipse cx="100" cy="70" rx="8" ry="3" fill="rgba(18,33,46,0.20)" />
      {/* Estrellitas flotantes */}
      <circle cx="32" cy="42" r="3" fill="rgba(234,153,64,0.60)" />
      <circle cx="168" cy="55" r="2" fill="rgba(234,153,64,0.45)" />
      <circle cx="22" cy="130" r="2.5" fill="rgba(108,163,162,0.55)" />
      <circle cx="178" cy="140" r="3" fill="rgba(108,163,162,0.45)" />
      <circle cx="155" cy="30" r="2" fill="rgba(255,255,255,0.35)" />
      <circle cx="45" cy="160" r="2" fill="rgba(255,255,255,0.30)" />
    </svg>
  );
}

function IlluWeather() {
  return (
    <svg width="320" height="320" viewBox="0 0 200 200" fill="none">
      {/* Glow sol */}
      <circle cx="78" cy="72" r="58" fill="rgba(234,153,64,0.12)" />
      {/* Sol base naranja */}
      <circle cx="78" cy="72" r="38" fill="#EA9940" />
      {/* Brillo interior sol */}
      <ellipse cx="68" cy="60" rx="14" ry="10" fill="rgba(255,255,255,0.22)" />
      {/* Rayos largos */}
      {[0,30,60,90,120,150,180,210,240,270,300,330].map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        const x1 = 78 + 44 * Math.cos(rad);
        const y1 = 72 + 44 * Math.sin(rad);
        const x2 = 78 + (i % 3 === 0 ? 64 : 56) * Math.cos(rad);
        const y2 = 72 + (i % 3 === 0 ? 64 : 56) * Math.sin(rad);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#EA9940" strokeWidth={i % 3 === 0 ? 4 : 2.5} strokeLinecap="round" opacity={i % 3 === 0 ? 0.9 : 0.55} />;
      })}
      {/* Gran nube glass */}
      <ellipse cx="122" cy="128" rx="52" ry="32" fill="rgba(180,192,200,0.82)" />
      <ellipse cx="96" cy="133" rx="36" ry="26" fill="rgba(180,192,200,0.78)" />
      <ellipse cx="148" cy="136" rx="28" ry="20" fill="rgba(180,192,200,0.72)" />
      <ellipse cx="72" cy="140" rx="22" ry="16" fill="rgba(180,192,200,0.68)" />
      {/* Brillo nube */}
      <ellipse cx="106" cy="118" rx="28" ry="12" fill="rgba(255,255,255,0.38)" />
      {/* Gotas grandes */}
      <line x1="86" y1="158" x2="80" y2="178" stroke="rgba(48,112,130,0.75)" strokeWidth="4" strokeLinecap="round" />
      <line x1="110" y1="160" x2="104" y2="180" stroke="rgba(48,112,130,0.70)" strokeWidth="4" strokeLinecap="round" />
      <line x1="134" y1="158" x2="128" y2="178" stroke="rgba(48,112,130,0.65)" strokeWidth="4" strokeLinecap="round" />
      <line x1="98" y1="170" x2="94" y2="186" stroke="rgba(48,112,130,0.55)" strokeWidth="3" strokeLinecap="round" />
      <line x1="122" y1="172" x2="118" y2="188" stroke="rgba(48,112,130,0.50)" strokeWidth="3" strokeLinecap="round" />
      {/* Destellos */}
      <circle cx="30" cy="40" r="3" fill="rgba(234,153,64,0.55)" />
      <circle cx="170" cy="50" r="2" fill="rgba(234,153,64,0.40)" />
      <circle cx="160" cy="175" r="2.5" fill="rgba(108,163,162,0.50)" />
      <circle cx="25" cy="160" r="2" fill="rgba(255,255,255,0.30)" />
    </svg>
  );
}

function IlluPacking() {
  return (
    <svg width="320" height="320" viewBox="0 0 200 200" fill="none">
      {/* Glow maleta */}
      <ellipse cx="100" cy="130" rx="80" ry="55" fill="rgba(234,153,64,0.10)" />
      {/* Maleta base naranja grande */}
      <rect x="24" y="72" width="152" height="110" rx="20" fill="#EA9940" />
      {/* Asa */}
      <path d="M70 72V52a30 30 0 0 1 60 0v20" stroke="#EA9940" strokeWidth="12" strokeLinecap="round" fill="none" />
      {/* Borde interior asa */}
      <path d="M70 72V52a30 30 0 0 1 60 0v20" stroke="rgba(255,255,255,0.18)" strokeWidth="6" strokeLinecap="round" fill="none" />
      {/* Franja central glass */}
      <rect x="24" y="112" width="152" height="28" fill="rgba(180,192,200,0.52)" />
      {/* Brillo superior maleta */}
      <rect x="24" y="72" width="152" height="44" rx="20" fill="rgba(255,255,255,0.20)" />
      {/* Cerradura grande */}
      <rect x="82" y="104" width="36" height="22" rx="7" fill="rgba(18,33,46,0.38)" />
      <circle cx="100" cy="111" r="6" fill="rgba(255,255,255,0.55)" />
      <rect x="97" y="113" width="6" height="8" rx="2" fill="rgba(18,33,46,0.35)" />
      {/* Etiqueta viaje */}
      <rect x="130" y="148" width="32" height="20" rx="6" fill="rgba(255,255,255,0.30)" />
      <line x1="134" y1="153" x2="158" y2="153" stroke="rgba(18,33,46,0.30)" strokeWidth="2" strokeLinecap="round" />
      <line x1="134" y1="159" x2="150" y2="159" stroke="rgba(18,33,46,0.20)" strokeWidth="1.5" strokeLinecap="round" />
      {/* Check flotante grande — glass */}
      <circle cx="155" cy="76" r="26" fill="rgba(180,192,200,0.88)" />
      <circle cx="155" cy="76" r="20" fill="rgba(255,255,255,0.25)" />
      <path d="M143 76l8 9 18-18" stroke="#EA9940" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Sombra maleta */}
      <ellipse cx="100" cy="185" rx="62" ry="8" fill="rgba(18,33,46,0.18)" />
      {/* Destellos */}
      <circle cx="28" cy="50" r="3" fill="rgba(234,153,64,0.55)" />
      <circle cx="172" cy="42" r="2.5" fill="rgba(234,153,64,0.45)" />
      <circle cx="18" cy="140" r="2" fill="rgba(108,163,162,0.50)" />
      <circle cx="182" cy="155" r="3" fill="rgba(108,163,162,0.45)" />
      <circle cx="168" cy="175" r="2" fill="rgba(255,255,255,0.30)" />
    </svg>
  );
}

const SLIDES = [
  {
    titleKey: 'intro.slide1.title',
    subtitleKey: 'intro.slide1.subtitle',
    gradient: 'linear-gradient(165deg, #08151F 0%, #12212E 45%, #0E2C3C 100%)',
    gradientBottom: 'linear-gradient(165deg, #0E2C3C 0%, #12212E 60%, #08151F 100%)',
    accent: '#EA9940',
    Illu: IlluDestination,
  },
  {
    titleKey: 'intro.slide2.title',
    subtitleKey: 'intro.slide2.subtitle',
    gradient: 'linear-gradient(165deg, #06161A 0%, #12212E 45%, #0A2828 100%)',
    gradientBottom: 'linear-gradient(165deg, #0A2828 0%, #12212E 60%, #06161A 100%)',
    accent: '#307082',
    Illu: IlluWeather,
  },
  {
    titleKey: 'intro.slide3.title',
    subtitleKey: 'intro.slide3.subtitle',
    gradient: 'linear-gradient(165deg, #140E04 0%, #12212E 45%, #1E1506 100%)',
    gradientBottom: 'linear-gradient(165deg, #1E1506 0%, #12212E 60%, #140E04 100%)',
    accent: '#EA9940',
    Illu: IlluPacking,
  },
] as const;

export function IntroPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);

  const slide = SLIDES[index];
  const isLast = index === SLIDES.length - 1;

  function goNext() {
    if (!isLast) {
      setDir(1);
      setIndex((v) => v + 1);
    } else {
      navigate('/auth/login', { replace: true });
    }
  }

  function goBack() {
    if (index > 0) {
      setDir(-1);
      setIndex((v) => v - 1);
    }
  }

  return (
    <div
      className="relative flex min-h-dvh flex-col overflow-hidden"
      style={{ background: slide.gradient, transition: 'background 0.6s ease' }}
    >
      {/* ── Orbe grande superior derecho ── */}
      <motion.div
        key={`orb-top-${index}`}
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="pointer-events-none absolute"
        style={{
          top: -120,
          right: -120,
          width: 420,
          height: 420,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${slide.accent}22 0%, ${slide.accent}08 45%, transparent 70%)`,
        }}
      />
      {/* ── Orbe mediano inferior izquierdo ── */}
      <div
        className="pointer-events-none absolute"
        style={{
          bottom: -80,
          left: -80,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(48,112,130,0.18) 0%, transparent 65%)',
        }}
      />
      {/* ── Orbe pequeño centro ── */}
      <motion.div
        key={`orb-mid-${index}`}
        animate={{ y: [0, -18, 0], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute"
        style={{
          top: '38%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${slide.accent}0A 0%, transparent 60%)`,
        }}
      />

      {/* ── Skip ── */}
      {!isLast && (
        <button
          type="button"
          onClick={() => navigate('/auth/login', { replace: true })}
          style={{
            position: 'absolute',
            top: 52,
            right: 24,
            zIndex: 10,
            color: 'rgba(255,255,255,0.40)',
            fontSize: 15,
            fontFamily: 'Questrial, sans-serif',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            letterSpacing: 0.5,
          }}
        >
          {t('common.skip', 'Omitir')}
        </button>
      )}

      {/* ── Ilustración — ocupa 55% de la pantalla ── */}
      <div
        className="relative flex items-center justify-center"
        style={{ flex: '0 0 55vh', paddingTop: 40 }}
      >
        {/* Halo de luz detrás de la ilustración */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`halo-${index}`}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.5 }}
            style={{
              position: 'absolute',
              width: 340,
              height: 340,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${slide.accent}28 0%, transparent 65%)`,
              zIndex: 0,
            }}
          />
        </AnimatePresence>

        {/* Ilustración animada con float */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`illu-${index}`}
            initial={{ opacity: 0, x: dir * 80, scale: 0.82, rotate: dir * 4 }}
            animate={{ opacity: 1, x: 0, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, x: -dir * 80, scale: 0.82, rotate: -dir * 4 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            style={{ position: 'relative', zIndex: 1 }}
          >
            {/* Float continuo */}
            <motion.div
              animate={{ y: [0, -14, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <slide.Illu />
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Zona de texto — parte inferior ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>

        {/* Texto con entrada desde abajo */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`text-${index}`}
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
            style={{ padding: '0 32px 0', textAlign: 'center' }}
          >
            {/* Número de slide */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: `${slide.accent}22`,
              border: `1px solid ${slide.accent}44`,
              borderRadius: 99,
              padding: '4px 14px',
              marginBottom: 16,
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: slide.accent,
                display: 'inline-block',
              }} />
              <span style={{
                color: slide.accent,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 2,
                textTransform: 'uppercase',
                fontFamily: 'Questrial, sans-serif',
              }}>
                {index + 1} / {SLIDES.length}
              </span>
            </div>

            <h1 style={{
              color: 'white',
              fontSize: 36,
              fontWeight: 700,
              lineHeight: 1.1,
              fontFamily: 'Questrial, sans-serif',
              letterSpacing: -0.5,
              margin: 0,
            }}>
              {t(slide.titleKey)}
            </h1>
            <p style={{
              color: 'rgba(236,231,220,0.60)',
              fontSize: 16,
              marginTop: 14,
              lineHeight: 1.6,
              fontFamily: 'Questrial, sans-serif',
            }}>
              {t(slide.subtitleKey)}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* ── Dots ── */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: '20px 0 8px' }}>
          {SLIDES.map((_, i) => (
            <motion.div
              key={i}
              animate={{
                width: i === index ? 28 : 8,
                background: i === index ? slide.accent : 'rgba(255,255,255,0.22)',
                opacity: i === index ? 1 : 0.6,
              }}
              transition={{ duration: 0.35 }}
              style={{ height: 8, borderRadius: 4, cursor: 'pointer' }}
              onClick={() => { setDir(i > index ? 1 : -1); setIndex(i); }}
            />
          ))}
        </div>

        {/* ── Botones ── */}
        <div style={{ display: 'flex', gap: 12, padding: '12px 24px 52px' }}>
          {index > 0 && (
            <button
              type="button"
              onClick={goBack}
              style={{
                flex: 1,
                height: 60,
                borderRadius: 20,
                border: '1.5px solid rgba(255,255,255,0.16)',
                background: 'rgba(255,255,255,0.07)',
                color: 'rgba(255,255,255,0.75)',
                fontSize: 16,
                fontWeight: 700,
                fontFamily: 'Questrial, sans-serif',
                backdropFilter: 'blur(12px)',
                cursor: 'pointer',
              }}
            >
              {t('common.back')}
            </button>
          )}
          <motion.button
            type="button"
            onClick={goNext}
            whileTap={{ scale: 0.97 }}
            style={{
              flex: 2,
              height: 60,
              borderRadius: 20,
              background: `linear-gradient(135deg, ${slide.accent} 0%, ${slide.accent}CC 100%)`,
              color: '#12212E',
              fontSize: 17,
              fontWeight: 700,
              fontFamily: 'Questrial, sans-serif',
              boxShadow: `0 8px 32px ${slide.accent}55`,
              border: 'none',
              cursor: 'pointer',
              letterSpacing: 0.3,
            }}
          >
            {isLast ? t('intro.startCta', 'Empezar') : t('common.continue', 'Continuar')}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
