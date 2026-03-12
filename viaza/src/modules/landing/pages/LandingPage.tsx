import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
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

const C = {
  dark:        '#12212E',
  cream:       '#ECE7DC',
  accent:      '#EA9940',
  accentLight: '#F0B86B',
  teal:        '#307082',
  muted:       'rgba(236,231,220,0.55)',
  glass:       'rgba(255,255,255,0.05)',
  glassBorder: 'rgba(255,255,255,0.11)',
};

function FadeInSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 44 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1], delay }}>
      {children}
    </motion.div>
  );
}

function StoreButton({ href, icon, sublabel, label }: { href: string; icon: React.ReactNode; sublabel: string; label: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" style={{
        display: 'inline-flex', alignItems: 'center', gap: 14,
        background: C.glass, border: `1.5px solid ${C.glassBorder}`,
        borderRadius: 16, padding: '13px 24px', textDecoration: 'none', minWidth: 210,
        backdropFilter: 'blur(16px)', transition: 'transform 0.22s, box-shadow 0.22s, border-color 0.22s',
      }}
      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(-3px)'; el.style.boxShadow = '0 12px 36px rgba(234,153,64,0.22)'; el.style.borderColor = 'rgba(234,153,64,0.5)'; }}
      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(0)'; el.style.boxShadow = 'none'; el.style.borderColor = C.glassBorder; }}>
      <div style={{ color: C.accent, flexShrink: 0 }}>{icon}</div>
      <div>
        <div style={{ color: C.muted, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', lineHeight: 1 }}>{sublabel}</div>
        <div style={{ color: C.cream, fontSize: 15, fontWeight: 700, lineHeight: 1.4 }}>{label}</div>
      </div>
    </a>
  );
}

function GlassIcon({ children, size = 64 }: { children: React.ReactNode; size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.28,
      background: 'radial-gradient(135deg at 30% 30%, rgba(234,153,64,0.35) 0%, rgba(180,195,210,0.18) 60%, rgba(255,255,255,0.06) 100%)',
      border: '1px solid rgba(255,255,255,0.18)', backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 4px 24px rgba(234,153,64,0.15), inset 0 1px 0 rgba(255,255,255,0.2)',
      flexShrink: 0,
    }}>{children}</div>
  );
}

const IconPlane = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
    <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" fill="#EA9940"/>
    <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5" fill="rgba(180,195,210,0.5)"/>
  </svg>
);
const IconSuitcase = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
    <rect x="2" y="7" width="20" height="14" rx="3" fill="#EA9940" opacity="0.9"/>
    <rect x="8" y="4" width="8" height="4" rx="2" fill="none" stroke="rgba(180,195,210,0.7)" strokeWidth="1.5"/>
    <line x1="12" y1="7" x2="12" y2="21" stroke="rgba(180,195,210,0.5)" strokeWidth="1.5"/>
    <line x1="2" y1="13" x2="22" y2="13" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
  </svg>
);
const IconSun = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="5" fill="#EA9940"/>
    {[0,45,90,135,180,225,270,315].map(deg => (
      <line key={deg} x1="12" y1="2.5" x2="12" y2="4.5" stroke="#EA9940" strokeWidth="2" strokeLinecap="round" transform={`rotate(${deg} 12 12)`}/>
    ))}
    <circle cx="12" cy="12" r="5" fill="rgba(180,195,210,0.25)"/>
  </svg>
);
const IconPin = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#EA9940"/>
    <path d="M12 2C8.13 2 5 5.13 5 9c0 2 1 4 3 6" fill="rgba(180,195,210,0.35)"/>
    <circle cx="12" cy="9" r="2.5" fill="rgba(255,255,255,0.55)"/>
  </svg>
);
const IconCoin = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" fill="#EA9940" opacity="0.9"/>
    <circle cx="12" cy="12" r="9" fill="rgba(180,195,210,0.25)"/>
    <text x="12" y="16.5" textAnchor="middle" fontSize="10" fontWeight="800" fill="white">$</text>
  </svg>
);
const IconCalendar = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="4" width="18" height="17" rx="3" fill="#EA9940" opacity="0.85"/>
    <rect x="3" y="4" width="18" height="6" rx="3" fill="rgba(180,195,210,0.4)"/>
    <line x1="8" y1="2" x2="8" y2="6" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="16" y1="2" x2="16" y2="6" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
    {[0,1,2,3,4,5].map(i => (
      <circle key={i} cx={7+(i%3)*5} cy={14+Math.floor(i/3)*4} r="1" fill="rgba(255,255,255,0.55)"/>
    ))}
  </svg>
);
const IconApple = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11"/>
  </svg>
);
const IconAndroid = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.523 15.341c-.604 0-1.094-.49-1.094-1.093 0-.604.49-1.094 1.094-1.094.603 0 1.093.49 1.093 1.094 0 .603-.49 1.093-1.093 1.093m-11.046 0c-.604 0-1.094-.49-1.094-1.093 0-.604.49-1.094 1.094-1.094.603 0 1.093.49 1.093 1.094 0 .603-.49 1.093-1.093 1.093m11.405-6.143l1.964-3.402a.408.408 0 0 0-.149-.558.408.408 0 0 0-.558.149l-1.989 3.444A11.998 11.998 0 0 0 12 8.092c-1.747 0-3.398.397-4.869 1.1L5.142 5.748a.408.408 0 0 0-.558-.149.408.408 0 0 0-.149.558l1.964 3.402C3.88 11.075 2.5 13.31 2.5 15.856h19c0-2.546-1.38-4.781-3.618-6.658"/>
  </svg>
);

function Logo3D({ size = 160 }: { size?: number }) {
  return (
    <motion.div animate={{ rotateY: [0,6,0,-6,0], rotateX: [0,3,0,-3,0] }}
      transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      style={{ perspective: 800, transformStyle: 'preserve-3d', display: 'inline-block', position: 'relative' }}>
      <motion.div animate={{ scale: [1,1.14,1], opacity: [0.3,0.58,0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        style={{ position: 'absolute', inset: -size*0.22, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(234,153,64,0.45) 0%, rgba(48,112,130,0.2) 50%, transparent 75%)',
          filter: `blur(${size*0.18}px)`, pointerEvents: 'none', zIndex: 0 }}/>
      <motion.div animate={{ scaleX: [1,1.12,1], opacity: [0.22,0.38,0.22] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        style={{ position: 'absolute', bottom: -size*0.1, left: '50%', transform: 'translateX(-50%)',
          width: size*0.8, height: size*0.1, borderRadius: '50%',
          background: 'rgba(234,153,64,0.3)', filter: `blur(${size*0.08}px)`, pointerEvents: 'none', zIndex: 0 }}/>
      <img src="/brand/logo-white.png" alt="VIAZA" style={{ height: size, width: 'auto', position: 'relative', zIndex: 1,
        filter: `drop-shadow(0 ${size*0.06}px ${size*0.14}px rgba(234,153,64,0.55)) drop-shadow(0 ${size*0.02}px ${size*0.06}px rgba(48,112,130,0.4))` }}/>
    </motion.div>
  );
}

function HeroScene() {
  return (
    <div style={{ position: 'relative', width: 300, height: 110 }}>
      <svg width="300" height="110" viewBox="0 0 300 110" fill="none" overflow="visible">
        <motion.path d="M 38 88 Q 150 18 262 44" stroke="rgba(234,153,64,0.55)" strokeWidth="2.5"
          strokeDasharray="7 5" fill="none" strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.4, delay: 0.3, ease: 'easeInOut' }}/>
        <motion.g initial={{ opacity: 0, scale: 0, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, type: 'spring', stiffness: 320 }}>
          <ellipse cx="38" cy="96" rx="12" ry="4" fill="rgba(234,153,64,0.22)"/>
          <path d="M38 34C27 34 18 43 18 52C18 65 38 88 38 88C38 88 58 65 58 52C58 43 49 34 38 34z" fill="#EA9940"/>
          <path d="M38 34C27 34 18 43 18 52C18 58 26 68 38 80" fill="rgba(180,195,210,0.32)"/>
          <circle cx="38" cy="52" r="8" fill="rgba(255,255,255,0.48)"/>
          <motion.circle cx="38" cy="52" r="14" fill="none" stroke="#EA9940" strokeWidth="2" opacity="0"
            animate={{ r: [14,26], opacity: [0.6,0] }} transition={{ duration: 2, repeat: Infinity, delay: 2.2 }}/>
        </motion.g>
        <motion.g initial={{ opacity: 0, x: -30, scale: 0.5 }} animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 1.6, type: 'spring', stiffness: 220 }}>
          <motion.g animate={{ y: [0,-5,0,-3,0] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 2.4 }}>
            <path d="M262 32 L292 44 L262 56 L268 44 Z" fill="#EA9940"/>
            <path d="M268 40 L284 28 L286 33 L271 42 Z" fill="rgba(180,195,210,0.65)"/>
            <path d="M268 48 L284 60 L286 55 L271 46 Z" fill="rgba(180,195,210,0.48)"/>
            <path d="M262 40 L254 34 L255 38 L262 42 Z" fill="rgba(234,153,64,0.7)"/>
            <ellipse cx="274" cy="44" rx="3" ry="2" fill="rgba(255,255,255,0.35)"/>
            <motion.line x1="256" y1="44" x2="226" y2="44" stroke="rgba(234,153,64,0.22)"
              strokeWidth="1.5" strokeDasharray="4 4" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
              transition={{ duration: 0.6, delay: 2.2 }}/>
          </motion.g>
        </motion.g>
      </svg>
    </div>
  );
}

export function LandingPage() {
  return (
    <div style={{ background: C.dark, color: C.cream, fontFamily: 'Questrial, sans-serif', overflowX: 'hidden' }}>

      {/* NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', height: 64, background: 'rgba(18,33,46,0.88)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <img src="/brand/logo-white.png" alt="VIAZA" style={{ height: 30, width: 'auto' }}/>
        <a href={RESOLVED_APP_STORE_URL} target="_blank" rel="noopener noreferrer" style={{ background: 'linear-gradient(135deg,#EA9940 0%,#F0B86B 100%)', color: C.dark, borderRadius: 10, padding: '8px 22px', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
          Explorar VIAZA
        </a>
      </nav>

      {/* HERO */}
      <section style={{ position: 'relative', minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 24px 80px', textAlign: 'center', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -120, right: -160, width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(48,112,130,0.16) 0%, transparent 65%)', pointerEvents: 'none' }}/>
        <div style={{ position: 'absolute', bottom: -100, left: -140, width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(234,153,64,0.1) 0%, transparent 65%)', pointerEvents: 'none' }}/>

        {/* Logo 3D GRANDE */}
        <motion.div initial={{ opacity: 0, scale: 0.6, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.22,1,0.36,1] }} style={{ position: 'relative', marginBottom: 44 }}>
          <Logo3D size={190} />
        </motion.div>

        {/* Escena animada */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }} style={{ marginBottom: 36 }}>
          <HeroScene />
        </motion.div>

        {/* Badge */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(234,153,64,0.14)', border: '1px solid rgba(234,153,64,0.32)', borderRadius: 20, padding: '5px 16px', marginBottom: 28, fontSize: 11, color: '#EA9940', letterSpacing: 1, textTransform: 'uppercase', fontWeight: 700 }}>
          <motion.span animate={{ opacity: [1,0.3,1] }} transition={{ duration: 2, repeat: Infinity }}
            style={{ width: 6, height: 6, borderRadius: '50%', background: '#EA9940', display: 'inline-block' }}/>
          {IS_APP_PUBLISHED ? 'Ya disponible en tiendas' : 'Próximamente en tiendas'}
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.75 }}
          style={{ fontSize: 'clamp(38px,7vw,76px)', fontWeight: 800, lineHeight: 1.06, letterSpacing: -1.5, marginBottom: 20, maxWidth: 860 }}>
          Tu viaje empieza{' '}
          <span style={{ background: 'linear-gradient(135deg,#EA9940 0%,#F0B86B 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            antes de despegar.
          </span>
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65, duration: 0.65 }}
          style={{ fontSize: 'clamp(16px,2.2vw,20px)', color: C.muted, maxWidth: 640, lineHeight: 1.75, marginBottom: 14 }}>
          VIAZA es la primera app que integra planeación de viaje, organización inteligente de maleta, clima, actividades y control de tu experiencia en un solo lugar.
        </motion.p>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.78 }}
          style={{ fontSize: 15, color: '#EA9940', fontStyle: 'italic', marginBottom: 48, letterSpacing: 0.3 }}>
          Planea mejor. Empaca con inteligencia. Viaja con tranquilidad.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.88, duration: 0.6 }}
          style={{ display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'center', marginBottom: 24 }}>
          <a href={RESOLVED_APP_STORE_URL} target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg,#EA9940 0%,#F0B86B 100%)', color: C.dark, borderRadius: 14, padding: '15px 34px', fontWeight: 800, fontSize: 16, textDecoration: 'none', boxShadow: '0 8px 32px rgba(234,153,64,0.45)', transition: 'transform 0.2s, box-shadow 0.2s' }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform='translateY(-3px)'; el.style.boxShadow='0 14px 42px rgba(234,153,64,0.6)'; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform='translateY(0)'; el.style.boxShadow='0 8px 32px rgba(234,153,64,0.45)'; }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            Explorar VIAZA
          </a>
          <StoreButton href={RESOLVED_APP_STORE_URL} icon={<IconApple/>} sublabel={IS_APP_PUBLISHED ? 'Descargar en' : 'Próximamente en'} label="App Store"/>
          <StoreButton href={RESOLVED_PLAY_STORE_URL} icon={<IconAndroid/>} sublabel={IS_APP_PUBLISHED ? 'Descargar en' : 'Próximamente en'} label="Google Play"/>
        </motion.div>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.05 }}
          style={{ fontSize: 13, color: 'rgba(236,231,220,0.35)', letterSpacing: 0.5 }}>
          Una sola app para organizar todo tu viaje.
        </motion.p>

        {/* Flecha scroll */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}
          style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)' }}>
          <motion.svg width="22" height="22" viewBox="0 0 24 24" fill="none"
            animate={{ y: [0,7,0] }} transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}>
            <polyline points="6 9 12 15 18 9" stroke="rgba(236,231,220,0.28)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </motion.svg>
        </motion.div>
      </section>

      {/* MANTRA */}
      <section style={{ padding: '120px 24px', textAlign: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,transparent 0%,rgba(48,112,130,0.07) 50%,transparent 100%)', pointerEvents: 'none' }}/>
        <FadeInSection>
          <div style={{ maxWidth: 820, margin: '0 auto' }}>
            <div style={{ fontSize: 110, lineHeight: 0.5, color: 'rgba(234,153,64,0.12)', marginBottom: 28, fontFamily: 'Georgia,serif' }}>"</div>
            <p style={{ fontSize: 'clamp(24px,4.5vw,42px)', fontWeight: 700, lineHeight: 1.38, color: C.cream, letterSpacing: -0.5 }}>
              El viaje no empieza en el aeropuerto.{' '}
              <span style={{ color: '#EA9940' }}>Empieza cuando sabes que no se te olvidó nada.</span>
            </p>
          </div>
        </FadeInSection>
      </section>

      {/* S01 */}
      <ContentSection number="01" title="Una nueva forma de viajar" accent={C.teal} reverse={false} illustration={<IllustrationMap/>}>
        <p style={{ color: C.muted, fontSize: 17, lineHeight: 1.85, marginBottom: 16 }}>Durante años las apps de viaje resolvieron piezas aisladas: vuelos, hoteles o clima.</p>
        <p style={{ color: C.muted, fontSize: 17, lineHeight: 1.85, marginBottom: 20 }}>VIAZA nace para resolver <strong style={{ color: C.cream }}>todo el viaje</strong> en una sola experiencia.</p>
        <FeatureList items={['Planeación.','Empaque inteligente.','Información del destino.','Todo conectado en un solo lugar.']}/>
      </ContentSection>

      {/* S02 */}
      <ContentSection number="02" title="La maleta inteligente" accent={C.accent} reverse={true} illustration={<IllustrationSuitcase/>}>
        <p style={{ color: '#EA9940', fontSize: 18, fontWeight: 700, marginBottom: 12 }}>La maleta es el corazón de VIAZA.</p>
        <p style={{ color: C.muted, fontSize: 17, lineHeight: 1.85, marginBottom: 20 }}>No es una lista. Es un <strong style={{ color: C.cream }}>sistema inteligente</strong> que te ayuda a preparar tu viaje de forma visual y organizada.</p>
        <FeatureList items={['Organizar tu maleta por categorías','Preparar equipaje según el tipo de viaje','Adaptar lo que llevas según el clima esperado','Confirmar visualmente que todo está listo']}/>
      </ContentSection>

      {/* S03 */}
      <ContentSection number="03" title="Todo tu viaje en una sola app" accent={C.teal} reverse={false} illustration={<IllustrationGrid/>}>
        <p style={{ color: C.muted, fontSize: 17, lineHeight: 1.85, marginBottom: 24 }}>VIAZA integra herramientas que normalmente están dispersas en varias aplicaciones. En lugar de usar cinco apps distintas, VIAZA reúne <strong style={{ color: C.cream }}>todo en un solo lugar.</strong></p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {[{icon:<IconPlane/>,text:'Crear y organizar tus viajes'},{icon:<IconSuitcase/>,text:'Equipaje de forma inteligente'},{icon:<IconSun/>,text:'Clima esperado en tu destino'},{icon:<IconPin/>,text:'Guardar información del destino'},{icon:<IconCalendar/>,text:'Planear tu experiencia paso a paso'}].map(({icon,text}) => (
            <div key={text} style={{ display:'flex', alignItems:'center', gap:10, background:C.glass, border:`1px solid ${C.glassBorder}`, borderRadius:12, padding:'10px 16px', fontSize:14, color:C.cream }}>
              <div style={{ width:28, height:28, flexShrink:0 }}>{icon}</div>{text}
            </div>
          ))}
        </div>
      </ContentSection>

      {/* S04 */}
      <ContentSection number="04" title="Diseñada para viajeros reales" accent={C.accent} reverse={true} illustration={<IllustrationPhone/>}>
        <p style={{ color: C.muted, fontSize: 17, lineHeight: 1.85, marginBottom: 20 }}>VIAZA fue diseñada para resolver lo que realmente ocurre antes de viajar.</p>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {['¿Ya empacaste todo?','¿El clima va a cambiar?','¿Tu equipaje está completo?','¿Estás preparado para el viaje?'].map(q => (
            <div key={q} style={{ display:'flex', alignItems:'center', gap:12, background:'rgba(234,153,64,0.08)', border:'1px solid rgba(234,153,64,0.2)', borderRadius:12, padding:'14px 18px', fontSize:16, color:C.cream, fontWeight:600 }}>
              <span style={{ color:'#EA9940' }}>→</span>{q}
            </div>
          ))}
        </div>
      </ContentSection>

      {/* S05 CTA */}
      <section style={{ padding:'100px 24px', textAlign:'center', position:'relative' }}>
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(180deg,transparent 0%,rgba(234,153,64,0.04) 50%,transparent 100%)', pointerEvents:'none' }}/>
        <FadeInSection>
          <div style={{ maxWidth:680, margin:'0 auto' }}>
            <span style={{ color:'#EA9940', fontSize:12, fontWeight:700, letterSpacing:2, textTransform:'uppercase', display:'block', marginBottom:18 }}>05 — Empieza a viajar diferente</span>
            <h2 style={{ fontSize:'clamp(30px,5vw,54px)', fontWeight:800, letterSpacing:-0.5, lineHeight:1.13, marginBottom:20 }}>
              Tu próximo viaje<br/>
              <span style={{ background:'linear-gradient(135deg,#EA9940 0%,#F0B86B 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>empieza aquí.</span>
            </h2>
            <p style={{ color:C.muted, fontSize:18, lineHeight:1.75, marginBottom:48 }}>VIAZA convierte la preparación del viaje en una experiencia <strong style={{ color:C.cream }}>visual, inteligente y simple.</strong></p>
          </div>
        </FadeInSection>
        <FadeInSection delay={0.15}>
          <div style={{ display:'inline-flex', flexDirection:'column', alignItems:'center', gap:20, background:C.glass, border:`1px solid ${C.glassBorder}`, borderRadius:28, padding:'44px 52px', backdropFilter:'blur(20px)' }}>
            <p style={{ color:C.muted, fontSize:13, letterSpacing:1, textTransform:'uppercase', margin:0 }}>Disponible {IS_APP_PUBLISHED ? 'en' : 'próximamente en'}</p>
            <div style={{ display:'flex', flexWrap:'wrap', gap:14, justifyContent:'center' }}>
              <StoreButton href={RESOLVED_APP_STORE_URL} icon={<IconApple/>} sublabel={IS_APP_PUBLISHED ? 'Descargar en' : 'Próximamente en'} label="App Store"/>
              <StoreButton href={RESOLVED_PLAY_STORE_URL} icon={<IconAndroid/>} sublabel={IS_APP_PUBLISHED ? 'Descargar en' : 'Próximamente en'} label="Google Play"/>
            </div>
            {!IS_APP_PUBLISHED && <p style={{ color:'rgba(236,231,220,0.28)', fontSize:11, margin:0, letterSpacing:0.4 }}>Por ahora accede a la experiencia web mientras publicamos la versión nativa.</p>}
          </div>
        </FadeInSection>
      </section>

      {/* FOOTER con logo 3D grande */}
      <footer style={{ borderTop:'1px solid rgba(255,255,255,0.07)', padding:'80px 24px 52px', textAlign:'center', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at 50% 0%, rgba(48,112,130,0.12) 0%, transparent 60%)', pointerEvents:'none' }}/>
        <FadeInSection>
          <div style={{ maxWidth:960, margin:'0 auto', position:'relative' }}>
            <div style={{ display:'flex', justifyContent:'center', marginBottom: 16 }}>
              <Logo3D size={130}/>
            </div>
            <p style={{ color:C.muted, fontSize:11, letterSpacing:2, textTransform:'uppercase', marginBottom:32 }}>{BRAND_TAGLINE}</p>
            <a href={`mailto:${SUPPORT_EMAIL}`} style={{ color:'#EA9940', fontSize:14, textDecoration:'none', display:'block', marginBottom:32 }}>{SUPPORT_EMAIL}</a>
            <div style={{ display:'flex', gap:28, justifyContent:'center', marginBottom:40 }}>
              <Link to={PRIVACY_URL} style={{ color:C.muted, fontSize:13, textDecoration:'none' }}>Política de Privacidad</Link>
              <Link to={TERMS_URL} style={{ color:C.muted, fontSize:13, textDecoration:'none' }}>Términos y Condiciones</Link>
            </div>
            <div style={{ width:40, height:1, background:'rgba(255,255,255,0.08)', margin:'0 auto 24px' }}/>
            <p style={{ color:'rgba(236,231,220,0.25)', fontSize:12 }}>{BRAND_NAME} es una marca registrada de {COMPANY_NAME}.® {COPYRIGHT_YEAR}</p>
          </div>
        </FadeInSection>
      </footer>
    </div>
  );
}

function ContentSection({ number, title, accent, reverse, children, illustration }: {
  number: string; title: string; accent: string; reverse: boolean; children: React.ReactNode; illustration: React.ReactNode;
}) {
  return (
    <section style={{ padding:'80px 24px' }}>
      <div style={{ maxWidth:1100, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px,1fr))', gap:60, alignItems:'center', direction: reverse ? 'rtl' : 'ltr' }}>
        <FadeInSection>
          <div style={{ direction:'ltr' }}>
            <span style={{ color:accent, fontSize:11, fontWeight:700, letterSpacing:2.5, textTransform:'uppercase', display:'block', marginBottom:12 }}>{number}</span>
            <h2 style={{ fontSize:'clamp(26px,4vw,44px)', fontWeight:800, letterSpacing:-0.5, lineHeight:1.14, marginBottom:22, color:'#ECE7DC' }}>{title}</h2>
            {children}
          </div>
        </FadeInSection>
        <FadeInSection delay={0.1}><div style={{ direction:'ltr' }}>{illustration}</div></FadeInSection>
      </div>
    </section>
  );
}

function FeatureList({ items }: { items: string[] }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
      {items.map(item => (
        <div key={item} style={{ display:'flex', alignItems:'center', gap:10, color:'#ECE7DC', fontSize:16, fontWeight:600 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EA9940" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          {item}
        </div>
      ))}
    </div>
  );
}

const boxStyle = { width:'100%', maxWidth:380, margin:'0 auto', display:'block', borderRadius:24, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.11)', padding:28, boxSizing:'border-box' as const };

function IllustrationMap() {
  return (
    <div style={boxStyle}>
      <svg viewBox="0 0 300 220" fill="none">
        <rect width="300" height="220" rx="14" fill="rgba(48,112,130,0.1)"/>
        {[40,80,120,160,200].map(y => <line key={y} x1="0" y1={y} x2="300" y2={y} stroke="rgba(255,255,255,0.05)"/>)}
        {[60,120,180,240].map(x => <line key={x} x1={x} y1="0" x2={x} y2="220" stroke="rgba(255,255,255,0.05)"/>)}
        <path d="M40 180 Q90 80 160 100 Q220 120 260 55" stroke="#EA9940" strokeWidth="2.5" strokeDasharray="8 5" fill="none" strokeLinecap="round"/>
        <circle cx="40" cy="180" r="11" fill="#EA9940" opacity="0.9"/><circle cx="40" cy="180" r="5" fill="rgba(255,255,255,0.55)"/>
        <path d="M260 30C253 30 247 36 247 43C247 52 260 63 260 63C260 63 273 52 273 43C273 36 267 30 260 30z" fill="#307082"/>
        <circle cx="260" cy="43" r="5" fill="rgba(255,255,255,0.5)"/>
        <path d="M155 103 L175 110 L155 117 L159 110 Z" fill="#EA9940"/>
        <path d="M159 107 L171 98 L172 103 L162 109 Z" fill="rgba(180,195,210,0.65)"/>
        <path d="M159 113 L171 122 L172 117 L162 111 Z" fill="rgba(180,195,210,0.48)"/>
      </svg>
    </div>
  );
}
function IllustrationSuitcase() {
  return (
    <div style={boxStyle}>
      <svg viewBox="0 0 300 240" fill="none">
        <rect x="28" y="58" width="244" height="162" rx="20" fill="rgba(234,153,64,0.13)" stroke="#EA9940" strokeWidth="1.5"/>
        <rect x="98" y="28" width="104" height="38" rx="12" fill="none" stroke="#EA9940" strokeWidth="1.5"/>
        <line x1="150" y1="58" x2="150" y2="220" stroke="rgba(234,153,64,0.25)" strokeWidth="1.5" strokeDasharray="4 4"/>
        {['Ropa','Electrónicos','Documentos','Higiene','Zapatos'].map((label,i) => (
          <g key={label}>
            <rect x="48" y={82+i*26} width="92" height="18" rx="6" fill="rgba(255,255,255,0.06)"/>
            <text x="58" y={96+i*26} fontSize="11" fill="rgba(236,231,220,0.5)">{label}</text>
            <circle cx="166" cy={91+i*26} r="8" fill={i<3 ? '#EA9940' : 'rgba(255,255,255,0.1)'} opacity={i<3 ? 0.9 : 1}/>
            {i<3 && <path d={`M163 ${91+i*26} L165 ${94+i*26} L170 ${88+i*26}`} stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>}
          </g>
        ))}
      </svg>
    </div>
  );
}
function IllustrationGrid() {
  const items = [
    {icon:<IconPlane/>,label:'Vuelo',color:'#307082'},{icon:<IconSun/>,label:'Clima',color:'#EA9940'},
    {icon:<IconSuitcase/>,label:'Maleta',color:'#EA9940'},{icon:<IconPin/>,label:'Lugares',color:'#307082'},
    {icon:<IconCoin/>,label:'Moneda',color:'#307082'},{icon:<IconCalendar/>,label:'Agenda',color:'#EA9940'},
  ];
  return (
    <div style={{ ...boxStyle, display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
      {items.map(({icon,label,color}) => (
        <div key={label} style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, padding:'18px 14px', display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
          <GlassIcon size={52}>{icon}</GlassIcon>
          <span style={{ color, fontSize:12, fontWeight:700, letterSpacing:0.5 }}>{label}</span>
        </div>
      ))}
    </div>
  );
}
function IllustrationPhone() {
  return (
    <div style={boxStyle}>
      <svg viewBox="0 0 200 340" fill="none" style={{ maxHeight:300 }}>
        <rect x="20" y="10" width="160" height="320" rx="28" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.13)" strokeWidth="1.5"/>
        <rect x="34" y="28" width="132" height="284" rx="18" fill="#12212E"/>
        <rect x="74" y="17" width="52" height="10" rx="5" fill="rgba(255,255,255,0.12)"/>
        <rect x="44" y="48" width="112" height="62" rx="10" fill="rgba(234,153,64,0.18)"/>
        <text x="58" y="83" fontSize="11" fill="#EA9940" fontWeight="700">VIAZA</text>
        {[0,1,2,3].map(i => <rect key={i} x="44" y={126+i*40} width={65+(i%2)*32} height="28" rx="8" fill="rgba(255,255,255,0.05)"/>)}
        <circle cx="132" cy="140" r="11" fill="#EA9940" opacity="0.85"/>
        <path d="M129 140 L131 143 L136 137" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="78" y="288" width="44" height="4" rx="2" fill="rgba(255,255,255,0.18)"/>
      </svg>
    </div>
  );
}
