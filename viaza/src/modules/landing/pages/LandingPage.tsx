import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  APP_STORE_LABEL,
  PLAY_STORE_LABEL,
  RESOLVED_APP_STORE_URL,
  RESOLVED_PLAY_STORE_URL,
  IS_APP_PUBLISHED,
  SUPPORT_EMAIL,
  PRIVACY_URL,
  TERMS_URL,
  BRAND_NAME,
  BRAND_TAGLINE,
  COMPANY_NAME,
  COPYRIGHT_YEAR,
} from '../../../config/site';

// ─── Paleta de colores VIAZA ──────────────────────────────────────────────────
const C = {
  dark:    '#12212E',
  cream:   '#ECE7DC',
  accent:  '#EA9940',
  teal:    '#307082',
  muted:   'rgba(236,231,220,0.55)',
  glass:   'rgba(255,255,255,0.06)',
  glassBorder: 'rgba(255,255,255,0.12)',
};

// ─── Variantes de animación ───────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show:   { opacity: 1, y: 0,  transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] } },
};
const stagger = { show: { transition: { staggerChildren: 0.15 } } };

// ─── FadeInSection — anima cuando entra al viewport ──────────────────────────
function FadeInSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      variants={stagger}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Botón de descarga (App Store / Play Store) ───────────────────────────────
interface StoreButtonProps {
  href: string;
  icon: React.ReactNode;
  sublabel: string;
  label: string;
  published: boolean;
}
function StoreButton({ href, icon, sublabel, label, published }: StoreButtonProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 12,
        background: published ? C.cream : C.glass,
        border: `1.5px solid ${published ? C.cream : C.glassBorder}`,
        borderRadius: 14,
        padding: '12px 22px',
        textDecoration: 'none',
        transition: 'transform 0.2s, box-shadow 0.2s, background 0.2s',
        cursor: published ? 'pointer' : 'default',
        minWidth: 200,
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)';
        (e.currentTarget as HTMLAnchorElement).style.boxShadow = `0 8px 32px rgba(234,153,64,0.25)`;
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLAnchorElement).style.boxShadow = 'none';
      }}
    >
      <div style={{ color: published ? C.dark : C.cream, flexShrink: 0 }}>{icon}</div>
      <div>
        <div style={{ color: published ? 'rgba(18,33,46,0.55)' : C.muted, fontSize: 10, letterSpacing: 0.8, textTransform: 'uppercase', lineHeight: 1 }}>
          {sublabel}
        </div>
        <div style={{ color: published ? C.dark : C.cream, fontSize: 15, fontWeight: 700, lineHeight: 1.4 }}>
          {label}
        </div>
      </div>
    </a>
  );
}

// ─── Ícono Apple ──────────────────────────────────────────────────────────────
function AppleIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11"/>
    </svg>
  );
}

// ─── Ícono Android ────────────────────────────────────────────────────────────
function AndroidIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.523 15.341c-.604 0-1.094-.49-1.094-1.093 0-.604.49-1.094 1.094-1.094.603 0 1.093.49 1.093 1.094 0 .603-.49 1.093-1.093 1.093m-11.046 0c-.604 0-1.094-.49-1.094-1.093 0-.604.49-1.094 1.094-1.094.603 0 1.093.49 1.093 1.094 0 .603-.49 1.093-1.093 1.093m11.405-6.143l1.964-3.402a.408.408 0 0 0-.149-.558.408.408 0 0 0-.558.149l-1.989 3.444A11.998 11.998 0 0 0 12 8.092c-1.747 0-3.398.397-4.869 1.1L5.142 5.748a.408.408 0 0 0-.558-.149.408.408 0 0 0-.149.558l1.964 3.402C3.88 11.075 2.5 13.31 2.5 15.856h19c0-2.546-1.38-4.781-3.618-6.658"/>
    </svg>
  );
}

// ─── Ícono de check ───────────────────────────────────────────────────────────
function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export function LandingPage() {
  return (
    <div style={{ background: C.dark, color: C.cream, fontFamily: 'Questrial, sans-serif', overflowX: 'hidden' }}>

      {/* ════════════════════════════════════════════════════════════════════════
          NAV BAR
      ════════════════════════════════════════════════════════════════════════ */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 32px',
        height: 64,
        background: 'rgba(18,33,46,0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/brand/logo-white.png" alt="VIAZA" style={{ height: 32, width: 'auto' }} />
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <a
            href={RESOLVED_APP_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: C.accent,
              color: C.dark,
              borderRadius: 10,
              padding: '8px 20px',
              fontWeight: 700,
              fontSize: 13,
              textDecoration: 'none',
              letterSpacing: 0.3,
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            Explorar VIAZA
          </a>
        </div>
      </nav>

      {/* ════════════════════════════════════════════════════════════════════════
          HERO
      ════════════════════════════════════════════════════════════════════════ */}
      <section style={{ position: 'relative', minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 24px 60px', textAlign: 'center', overflow: 'hidden' }}>

        {/* Decoración de fondo */}
        <div style={{ position: 'absolute', top: -100, right: -150, width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(48,112,130,0.18) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -120, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(234,153,64,0.12) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%,-50%)', width: 800, height: 800, borderRadius: '50%', background: 'radial-gradient(circle, rgba(48,112,130,0.06) 0%, transparent 60%)', pointerEvents: 'none' }} />

        {/* Escena avión + ruta (igual al splash) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ marginBottom: 24, position: 'relative' }}
        >
          <svg width="240" height="90" viewBox="0 0 240 90" fill="none">
            {/* Ruta punteada */}
            <motion.path
              d="M 30 72 Q 120 12 210 35"
              stroke="rgba(234,153,64,0.5)"
              strokeWidth="2"
              strokeDasharray="6 5"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.2, delay: 0.4, ease: 'easeInOut' }}
            />
            {/* Pin */}
            <motion.g initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}>
              <ellipse cx="30" cy="78" rx="10" ry="3.5" fill="rgba(234,153,64,0.2)" />
              <path d="M30 28 C21 28 14 35 14 43 C14 54 30 70 30 70 C30 70 46 54 46 43 C46 35 39 28 30 28z" fill={C.accent} />
              <path d="M30 28 C21 28 14 35 14 43 C14 48 21 57 30 66" fill="rgba(180,195,210,0.30)" />
              <circle cx="30" cy="43" r="7" fill="rgba(255,255,255,0.45)" />
            </motion.g>
            {/* Avión */}
            <motion.g initial={{ opacity: 0, x: -24, scale: 0.6 }} animate={{ opacity: 1, x: 0, scale: 1 }} transition={{ duration: 0.6, delay: 1.4, type: 'spring', stiffness: 240 }}>
              <path d="M210 25 L234 35 L210 45 L215 35 Z" fill={C.accent} />
              <path d="M215 32 L228 22 L229 27 L218 33 Z" fill="rgba(180,195,210,0.65)" />
              <path d="M215 38 L228 48 L229 43 L218 37 Z" fill="rgba(180,195,210,0.50)" />
            </motion.g>
          </svg>
        </motion.div>

        {/* Pill badge */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(234,153,64,0.15)', border: '1px solid rgba(234,153,64,0.35)', borderRadius: 20, padding: '5px 14px', marginBottom: 28, fontSize: 12, color: C.accent, letterSpacing: 0.8, textTransform: 'uppercase', fontWeight: 600 }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.accent, display: 'inline-block', animation: 'pulse 2s infinite' }} />
          {IS_APP_PUBLISHED ? 'Ya disponible en tiendas' : 'Próximamente en tiendas'}
        </motion.div>

        {/* Título */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.7 }}
          style={{ fontSize: 'clamp(36px, 7vw, 72px)', fontWeight: 800, lineHeight: 1.08, letterSpacing: -1, marginBottom: 20, maxWidth: 820 }}
        >
          Tu viaje empieza{' '}
          <span style={{ background: `linear-gradient(135deg, ${C.accent} 0%, #F0B86B 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            antes de despegar.
          </span>
        </motion.h1>

        {/* Subtítulo */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.65 }}
          style={{ fontSize: 'clamp(16px, 2.2vw, 20px)', color: C.muted, maxWidth: 660, lineHeight: 1.7, marginBottom: 14 }}
        >
          VIAZA es la primera app que integra planeación de viaje, organización inteligente de maleta,
          clima, actividades y control de tu experiencia en un solo lugar.
        </motion.p>

        {/* Frase corta */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.65 }}
          style={{ fontSize: 15, color: C.accent, fontStyle: 'italic', marginBottom: 44, letterSpacing: 0.3 }}
        >
          Planea mejor. Empaca con inteligencia. Viaja con tranquilidad.
        </motion.p>

        {/* Botones CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.6 }}
          style={{ display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'center', marginBottom: 28 }}
        >
          {/* Botón principal */}
          <a
            href={RESOLVED_APP_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: `linear-gradient(135deg, ${C.accent} 0%, #F0B86B 100%)`,
              color: C.dark, borderRadius: 14, padding: '14px 32px',
              fontWeight: 800, fontSize: 16, textDecoration: 'none',
              boxShadow: '0 8px 30px rgba(234,153,64,0.4)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 12px 40px rgba(234,153,64,0.55)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 8px 30px rgba(234,153,64,0.4)'; }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3" /></svg>
            Explorar VIAZA
          </a>

          {/* App Store */}
          <StoreButton
            href={RESOLVED_APP_STORE_URL}
            icon={<AppleIcon />}
            sublabel={IS_APP_PUBLISHED ? 'Descargar en' : 'Próximamente en'}
            label="App Store"
            published={IS_APP_PUBLISHED}
          />

          {/* Google Play */}
          <StoreButton
            href={RESOLVED_PLAY_STORE_URL}
            icon={<AndroidIcon />}
            sublabel={IS_APP_PUBLISHED ? 'Descargar en' : 'Próximamente en'}
            label="Google Play"
            published={IS_APP_PUBLISHED}
          />
        </motion.div>

        {/* Frase pequeña */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          style={{ fontSize: 13, color: 'rgba(236,231,220,0.4)', letterSpacing: 0.5 }}
        >
          Una sola app para organizar todo tu viaje.
        </motion.p>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          style={{ position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)' }}
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{ width: 24, height: 40, borderRadius: 12, border: '2px solid rgba(236,231,220,0.25)', display: 'flex', justifyContent: 'center', paddingTop: 6 }}
          >
            <div style={{ width: 3, height: 8, borderRadius: 2, background: C.accent, opacity: 0.7 }} />
          </motion.div>
        </motion.div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════════
          MANTRA — cita central
      ════════════════════════════════════════════════════════════════════════ */}
      <section style={{ padding: '120px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, transparent 0%, rgba(48,112,130,0.08) 50%, transparent 100%)`, pointerEvents: 'none' }} />
        <FadeInSection>
          <motion.div variants={fadeUp} style={{ maxWidth: 800, margin: '0 auto' }}>
            {/* Comilla decorativa */}
            <div style={{ fontSize: 120, lineHeight: 0.6, color: 'rgba(234,153,64,0.15)', marginBottom: 24, fontFamily: 'Georgia, serif' }}>"</div>
            <p style={{ fontSize: 'clamp(22px, 4vw, 38px)', fontWeight: 700, lineHeight: 1.4, color: C.cream, letterSpacing: -0.5 }}>
              El viaje no empieza en el aeropuerto.
              <br />
              <span style={{ color: C.accent }}>Empieza cuando sabes que no se te olvidó nada.</span>
            </p>
          </motion.div>
        </FadeInSection>
      </section>

      {/* ════════════════════════════════════════════════════════════════════════
          SECCIÓN 1 — Una nueva forma de viajar
      ════════════════════════════════════════════════════════════════════════ */}
      <Section
        number="01"
        title="Una nueva forma de viajar"
        accent={C.teal}
        reverse={false}
      >
        <motion.p variants={fadeUp} style={{ color: C.muted, fontSize: 17, lineHeight: 1.85, marginBottom: 20 }}>
          Durante años las apps de viaje resolvieron piezas aisladas: vuelos, hoteles o clima.
        </motion.p>
        <motion.p variants={fadeUp} style={{ color: C.muted, fontSize: 17, lineHeight: 1.85, marginBottom: 20 }}>
          VIAZA nace para resolver <strong style={{ color: C.cream }}>todo el viaje</strong> en una sola experiencia.
          Desde el momento en que decides viajar hasta el momento en que regresas a casa.
        </motion.p>
        <motion.div variants={fadeUp} style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
          {['Planeación.', 'Empaque inteligente.', 'Información del destino.', 'Todo conectado en un solo lugar.'].map(item => (
            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, color: C.cream, fontSize: 16, fontWeight: 600 }}>
              <CheckIcon />{item}
            </div>
          ))}
        </motion.div>
        <Illustration type="map" />
      </Section>

      {/* ════════════════════════════════════════════════════════════════════════
          SECCIÓN 2 — La maleta inteligente
      ════════════════════════════════════════════════════════════════════════ */}
      <Section
        number="02"
        title="La maleta inteligente"
        accent={C.accent}
        reverse={true}
      >
        <motion.p variants={fadeUp} style={{ color: C.accent, fontSize: 18, fontWeight: 700, marginBottom: 12 }}>
          La maleta es el corazón de VIAZA.
        </motion.p>
        <motion.p variants={fadeUp} style={{ color: C.muted, fontSize: 17, lineHeight: 1.85, marginBottom: 20 }}>
          No es una simple lista de cosas por empacar.
          Es un <strong style={{ color: C.cream }}>sistema inteligente</strong> que te ayuda a preparar tu viaje
          de forma visual y organizada.
        </motion.p>
        <motion.div variants={fadeUp} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            'Organizar tu maleta por categorías',
            'Preparar equipaje según el tipo de viaje',
            'Adaptar lo que llevas según el clima esperado',
            'Confirmar visualmente que todo está listo',
          ].map(item => (
            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, color: C.cream, fontSize: 16 }}>
              <CheckIcon />{item}
            </div>
          ))}
        </motion.div>
        <Illustration type="suitcase" />
      </Section>

      {/* ════════════════════════════════════════════════════════════════════════
          SECCIÓN 3 — Todo en una sola app
      ════════════════════════════════════════════════════════════════════════ */}
      <Section
        number="03"
        title="Todo tu viaje en una sola app"
        accent={C.teal}
        reverse={false}
      >
        <motion.p variants={fadeUp} style={{ color: C.muted, fontSize: 17, lineHeight: 1.85, marginBottom: 24 }}>
          VIAZA integra herramientas que normalmente están dispersas en varias aplicaciones.
          En lugar de usar cinco apps distintas, VIAZA reúne <strong style={{ color: C.cream }}>todo en un solo lugar.</strong>
        </motion.p>
        <motion.div variants={fadeUp} style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          {[
            { icon: '🗺️', text: 'Crear y organizar tus viajes' },
            { icon: '🧳', text: 'Preparar equipaje de forma inteligente' },
            { icon: '🌤️', text: 'Ver clima esperado durante tu estancia' },
            { icon: '📍', text: 'Guardar información útil del destino' },
            { icon: '📋', text: 'Planear tu experiencia paso a paso' },
          ].map(({ icon, text }) => (
            <div key={text} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: C.glass, border: `1px solid ${C.glassBorder}`,
              borderRadius: 12, padding: '12px 18px', fontSize: 14, color: C.cream,
            }}>
              <span style={{ fontSize: 20 }}>{icon}</span>{text}
            </div>
          ))}
        </motion.div>
        <Illustration type="grid" />
      </Section>

      {/* ════════════════════════════════════════════════════════════════════════
          SECCIÓN 4 — Diseñada para viajeros reales
      ════════════════════════════════════════════════════════════════════════ */}
      <Section
        number="04"
        title="Diseñada para viajeros reales"
        accent={C.accent}
        reverse={true}
      >
        <motion.p variants={fadeUp} style={{ color: C.muted, fontSize: 17, lineHeight: 1.85, marginBottom: 24 }}>
          VIAZA fue diseñada para resolver lo que realmente ocurre antes de viajar.
        </motion.p>
        <motion.div variants={fadeUp} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            '¿Ya empacaste todo?',
            '¿El clima va a cambiar?',
            '¿Tu equipaje está completo?',
            '¿Estás preparado para el viaje?',
          ].map(q => (
            <div key={q} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              background: 'rgba(234,153,64,0.08)', border: '1px solid rgba(234,153,64,0.22)',
              borderRadius: 12, padding: '14px 20px',
              fontSize: 16, color: C.cream, fontWeight: 600,
            }}>
              <span style={{ color: C.accent, fontSize: 20 }}>→</span>{q}
            </div>
          ))}
        </motion.div>
        <Illustration type="phone" />
      </Section>

      {/* ════════════════════════════════════════════════════════════════════════
          SECCIÓN 5 — Empieza a viajar diferente
      ════════════════════════════════════════════════════════════════════════ */}
      <section style={{ padding: '100px 24px', textAlign: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, transparent 0%, rgba(234,153,64,0.05) 50%, transparent 100%)`, pointerEvents: 'none' }} />
        <FadeInSection>
          <motion.div variants={fadeUp} style={{ maxWidth: 700, margin: '0 auto' }}>
            <span style={{ color: C.accent, fontSize: 13, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', display: 'block', marginBottom: 20 }}>05 — Empieza a viajar diferente</span>
            <h2 style={{ fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: 800, letterSpacing: -0.5, lineHeight: 1.15, marginBottom: 20 }}>
              Tu próximo viaje<br />
              <span style={{ background: `linear-gradient(135deg, ${C.accent} 0%, #F0B86B 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>empieza aquí.</span>
            </h2>
            <motion.p variants={fadeUp} style={{ color: C.muted, fontSize: 18, lineHeight: 1.75, marginBottom: 20 }}>
              Miles de personas planean viajes cada día.
              Pero muy pocas lo hacen con una herramienta diseñada para organizar todo el proceso.
            </motion.p>
            <motion.p variants={fadeUp} style={{ color: C.muted, fontSize: 18, lineHeight: 1.75, marginBottom: 48 }}>
              VIAZA convierte la preparación del viaje en una experiencia <strong style={{ color: C.cream }}>visual, inteligente y simple.</strong>
            </motion.p>
          </motion.div>
        </FadeInSection>

        {/* Bloque de descarga */}
        <FadeInSection>
          <motion.div variants={fadeUp} style={{ display: 'inline-block', background: C.glass, border: `1px solid ${C.glassBorder}`, borderRadius: 24, padding: '40px 48px', backdropFilter: 'blur(20px)' }}>
            <p style={{ color: C.muted, fontSize: 14, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 24 }}>
              Disponible {IS_APP_PUBLISHED ? 'en' : 'próximamente en'}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'center' }}>
              <StoreButton
                href={RESOLVED_APP_STORE_URL}
                icon={<AppleIcon />}
                sublabel={IS_APP_PUBLISHED ? 'Descargar en' : 'Próximamente en'}
                label="App Store"
                published={IS_APP_PUBLISHED}
              />
              <StoreButton
                href={RESOLVED_PLAY_STORE_URL}
                icon={<AndroidIcon />}
                sublabel={IS_APP_PUBLISHED ? 'Descargar en' : 'Próximamente en'}
                label="Google Play"
                published={IS_APP_PUBLISHED}
              />
            </div>
            {!IS_APP_PUBLISHED && (
              <p style={{ color: 'rgba(236,231,220,0.35)', fontSize: 11, marginTop: 18, letterSpacing: 0.5 }}>
                Por ahora accede a la experiencia web mientras publicamos la versión nativa.
              </p>
            )}
          </motion.div>
        </FadeInSection>
      </section>

      {/* ════════════════════════════════════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════════════════════════════════════ */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.08)',
        padding: '60px 24px 40px',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <img src="/brand/logo-white.png" alt="VIAZA" style={{ height: 36, width: 'auto', marginBottom: 8 }} />
          <p style={{ color: C.muted, fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 28 }}>
            {BRAND_TAGLINE}
          </p>
          <a href={`mailto:${SUPPORT_EMAIL}`} style={{ color: C.accent, fontSize: 14, textDecoration: 'none', display: 'block', marginBottom: 28 }}>
            {SUPPORT_EMAIL}
          </a>
          <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginBottom: 36 }}>
            <Link to={PRIVACY_URL} style={{ color: C.muted, fontSize: 13, textDecoration: 'none' }}>
              Política de Privacidad
            </Link>
            <Link to={TERMS_URL} style={{ color: C.muted, fontSize: 13, textDecoration: 'none' }}>
              Términos y Condiciones
            </Link>
          </div>
          <div style={{ width: 48, height: 1, background: 'rgba(255,255,255,0.1)', margin: '0 auto 24px' }} />
          <p style={{ color: 'rgba(236,231,220,0.3)', fontSize: 12 }}>
            {BRAND_NAME} es una marca registrada de {COMPANY_NAME}.® {COPYRIGHT_YEAR}
          </p>
        </div>
      </footer>

      {/* Estilos globales para animación pulse */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}

// ─── Componente de sección reutilizable ───────────────────────────────────────
interface SectionProps {
  number: string;
  title: string;
  accent: string;
  reverse: boolean;
  children: React.ReactNode;
}

function Section({ number, title, accent, reverse, children }: SectionProps) {
  const childArray = Array.isArray(children) ? children : [children];
  // El último hijo es la ilustración
  const illustration = childArray[childArray.length - 1];
  const content = childArray.slice(0, -1);

  return (
    <section style={{ padding: '80px 24px', position: 'relative' }}>
      <div style={{
        maxWidth: 1100,
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 64,
        alignItems: 'center',
        direction: reverse ? 'rtl' : 'ltr',
      }}>
        {/* Contenido */}
        <FadeInSection>
          <div style={{ direction: 'ltr' }}>
            <motion.span
              variants={fadeUp}
              style={{ color: accent, fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', display: 'block', marginBottom: 14 }}
            >
              {number}
            </motion.span>
            <motion.h2
              variants={fadeUp}
              style={{ fontSize: 'clamp(26px, 4vw, 44px)', fontWeight: 800, letterSpacing: -0.5, lineHeight: 1.15, marginBottom: 24, color: C.cream }}
            >
              {title}
            </motion.h2>
            {content}
          </div>
        </FadeInSection>

        {/* Ilustración */}
        <FadeInSection>
          <div style={{ direction: 'ltr' }}>
            {illustration}
          </div>
        </FadeInSection>
      </div>
    </section>
  );
}

// ─── Ilustraciones SVG decorativas ───────────────────────────────────────────
function Illustration({ type }: { type: 'map' | 'suitcase' | 'grid' | 'phone' }) {
  const base = {
    width: '100%',
    maxWidth: 380,
    margin: '0 auto',
    display: 'block',
    borderRadius: 24,
    background: C.glass,
    border: `1px solid ${C.glassBorder}`,
    backdropFilter: 'blur(20px)',
    padding: 32,
    boxSizing: 'border-box' as const,
  };

  if (type === 'map') return (
    <div style={base}>
      <svg viewBox="0 0 300 220" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="300" height="220" rx="16" fill="rgba(48,112,130,0.12)" />
        {/* líneas de cuadrícula de mapa */}
        {[40, 80, 120, 160, 200].map(y => <line key={y} x1="0" y1={y} x2="300" y2={y} stroke="rgba(255,255,255,0.06)" />)}
        {[50, 100, 150, 200, 250].map(x => <line key={x} x1={x} y1="0" x2={x} y2="220" stroke="rgba(255,255,255,0.06)" />)}
        {/* ruta */}
        <path d="M 40 180 Q 90 80 160 100 Q 220 120 260 60" stroke={C.accent} strokeWidth="3" strokeDasharray="8 5" fill="none" strokeLinecap="round" />
        {/* pin origen */}
        <circle cx="40" cy="180" r="10" fill={C.accent} opacity="0.9" />
        <circle cx="40" cy="180" r="5" fill="#fff" />
        {/* pin destino */}
        <circle cx="260" cy="60" r="12" fill={C.teal} opacity="0.9" />
        <circle cx="260" cy="60" r="6" fill="#fff" />
        {/* avión */}
        <path d="M 155 103 L 175 110 L 155 117 L 159 110 Z" fill={C.accent} />
        <path d="M 159 107 L 170 99 L 171 103 L 162 109 Z" fill="rgba(180,195,210,0.7)" />
        <path d="M 159 113 L 170 121 L 171 117 L 162 111 Z" fill="rgba(180,195,210,0.5)" />
      </svg>
    </div>
  );

  if (type === 'suitcase') return (
    <div style={base}>
      <svg viewBox="0 0 300 240" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="30" y="60" width="240" height="160" rx="20" fill="rgba(234,153,64,0.15)" stroke={C.accent} strokeWidth="2" />
        <rect x="100" y="30" width="100" height="40" rx="12" fill="none" stroke={C.accent} strokeWidth="2" />
        <line x1="150" y1="60" x2="150" y2="220" stroke={C.accent} strokeWidth="2" strokeDasharray="4 4" />
        {['Ropa', 'Electrónicos', 'Documentos', 'Higiene', 'Zapatos'].map((label, i) => (
          <g key={label}>
            <rect x="50" y={85 + i * 26} width="90" height="18" rx="6" fill="rgba(255,255,255,0.07)" />
            <text x="60" y={99 + i * 26} fontSize="11" fill={C.muted}>{label}</text>
            <circle cx="165" cy={94 + i * 26} r="7" fill={i < 3 ? C.accent : 'rgba(255,255,255,0.15)'} opacity="0.85" />
            {i < 3 && <path d="M 162 94 L 164 97 L 169 91" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" transform={`translate(0,${i * 26})`} />}
          </g>
        ))}
      </svg>
    </div>
  );

  if (type === 'grid') return (
    <div style={base}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {[
          { icon: '✈️', label: 'Vuelo', color: C.teal },
          { icon: '🌤️', label: 'Clima', color: C.accent },
          { icon: '🧳', label: 'Maleta', color: C.accent },
          { icon: '📍', label: 'Lugares', color: C.teal },
          { icon: '💱', label: 'Moneda', color: C.teal },
          { icon: '📋', label: 'Agenda', color: C.accent },
        ].map(({ icon, label, color }) => (
          <div key={label} style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid rgba(255,255,255,0.08)`, borderRadius: 14, padding: '16px 14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 28 }}>{icon}</span>
            <span style={{ color, fontSize: 12, fontWeight: 700, letterSpacing: 0.5 }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );

  // phone
  return (
    <div style={base}>
      <svg viewBox="0 0 200 340" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ maxHeight: 320 }}>
        <rect x="20" y="10" width="160" height="320" rx="28" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
        <rect x="35" y="30" width="130" height="280" rx="18" fill={C.dark} />
        {/* notch */}
        <rect x="75" y="18" width="50" height="10" rx="5" fill="rgba(255,255,255,0.15)" />
        {/* pantalla */}
        <rect x="45" y="50" width="110" height="60" rx="10" fill="rgba(234,153,64,0.2)" />
        <text x="65" y="85" fontSize="12" fill={C.accent} fontWeight="700">VIAZA</text>
        {[0, 1, 2, 3].map(i => (
          <rect key={i} x="45" y={130 + i * 42} width={70 + (i % 2) * 30} height="30" rx="8" fill="rgba(255,255,255,0.06)" />
        ))}
        {/* check marks */}
        <circle cx="130" cy="146" r="10" fill={C.accent} opacity="0.85" />
        <path d="M 127 146 L 129 149 L 134 143" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* bottom indicator */}
        <rect x="80" y="290" width="40" height="4" rx="2" fill="rgba(255,255,255,0.2)" />
      </svg>
    </div>
  );
}
