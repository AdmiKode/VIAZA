import { Link } from 'react-router-dom';
import { BRAND_NAME, SUPPORT_EMAIL, TERMS_URL, COMPANY_NAME, APP_URL } from '../../../config/site';

const C = {
  dark:   '#12212E',
  cream:  '#ECE7DC',
  accent: '#EA9940',
  muted:  'rgba(236,231,220,0.6)',
  glass:  'rgba(255,255,255,0.04)',
  glassBorder: 'rgba(255,255,255,0.1)',
};

export function PrivacyPage() {
  return (
    <div style={{ background: C.dark, color: C.cream, fontFamily: 'Questrial, sans-serif', minHeight: '100dvh' }}>

      {/* Nav */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 32px', height: 64,
        background: 'rgba(18,33,46,0.9)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <img src="/brand/logo-white.png" alt={BRAND_NAME} style={{ height: 28, width: 'auto' }} />
        </Link>
        <Link to="/" style={{ color: C.muted, fontSize: 13, textDecoration: 'none' }}>← Volver</Link>
      </nav>

      {/* Content */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '64px 24px 100px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(234,153,64,0.12)', border: '1px solid rgba(234,153,64,0.3)', borderRadius: 20, padding: '5px 14px', marginBottom: 32, fontSize: 12, color: C.accent, letterSpacing: 0.8, textTransform: 'uppercase', fontWeight: 600 }}>
          Legal
        </div>

        <h1 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 800, letterSpacing: -0.5, lineHeight: 1.1, marginBottom: 16 }}>
          Política de<br />
          <span style={{ background: 'linear-gradient(135deg, #EA9940 0%, #ECE7DC 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Privacidad
          </span>
        </h1>

        <p style={{ color: C.muted, fontSize: 14, marginBottom: 56, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 32 }}>
          Última actualización: marzo 2026 · {APP_URL}
        </p>

        <LegalSection title="Compromiso con tu privacidad">
          <p>En {BRAND_NAME} respetamos y protegemos la información de nuestros usuarios.</p>
          <p>Esta política describe cómo recopilamos, utilizamos y protegemos los datos que se generan al utilizar la aplicación.</p>
        </LegalSection>

        <LegalSection title="Información que recopilamos">
          <p>La información puede incluir:</p>
          <ul>
            <li>Datos de cuenta (nombre, correo electrónico)</li>
            <li>Preferencias de viaje y configuración personal</li>
            <li>Información necesaria para el funcionamiento de la app (viajes, equipaje, actividades)</li>
            <li>Datos de uso para mejorar la experiencia</li>
          </ul>
        </LegalSection>

        <LegalSection title="Uso de la información">
          <p>
            {BRAND_NAME} utiliza esta información únicamente para mejorar la experiencia del usuario
            y ofrecer funcionalidades relacionadas con la planeación de viajes.
          </p>
          <p>No vendemos ni compartimos información personal con terceros sin consentimiento explícito.</p>
        </LegalSection>

        <LegalSection title="Almacenamiento y seguridad">
          <p>
            La información se almacena de forma segura utilizando servicios de infraestructura
            con estándares internacionales de protección de datos.
          </p>
          <p>
            Tomamos medidas técnicas y organizativas para proteger tu información contra acceso
            no autorizado, pérdida o alteración.
          </p>
        </LegalSection>

        <LegalSection title="Derechos del usuario">
          <p>Como usuario tienes derecho a:</p>
          <ul>
            <li>Acceder a tu información personal</li>
            <li>Solicitar la corrección de datos incorrectos</li>
            <li>Solicitar la eliminación de tu cuenta y datos</li>
            <li>Revocar el consentimiento en cualquier momento</li>
          </ul>
        </LegalSection>

        <LegalSection title="Contacto">
          <p>
            Para cualquier consulta relacionada con privacidad puedes contactarnos en:{' '}
            <a href={`mailto:${SUPPORT_EMAIL}`} style={{ color: C.accent, textDecoration: 'none' }}>{SUPPORT_EMAIL}</a>
          </p>
        </LegalSection>

        {/* Footer nav */}
        <div style={{ marginTop: 64, paddingTop: 32, borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <Link to="/" style={{ color: C.muted, fontSize: 13, textDecoration: 'none' }}>← Inicio</Link>
          <Link to={TERMS_URL} style={{ color: C.muted, fontSize: 13, textDecoration: 'none' }}>Términos y Condiciones →</Link>
        </div>
        <p style={{ color: 'rgba(236,231,220,0.25)', fontSize: 12, marginTop: 28 }}>
          {BRAND_NAME} · {COMPANY_NAME}® · {SUPPORT_EMAIL}
        </p>
      </div>
    </div>
  );
}

function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 48 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: '#ECE7DC', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ width: 4, height: 20, background: '#EA9940', borderRadius: 2, display: 'inline-block', flexShrink: 0 }} />
        {title}
      </h2>
      <div style={{ color: 'rgba(236,231,220,0.65)', fontSize: 16, lineHeight: 1.85, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {children}
      </div>
      <style>{`
        ul { padding-left: 20px; margin: 4px 0; display: flex; flex-direction: column; gap: 6px; }
        li { color: rgba(236,231,220,0.65); }
        li::marker { color: #EA9940; }
      `}</style>
    </div>
  );
}
