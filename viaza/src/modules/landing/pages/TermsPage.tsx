import { Link } from 'react-router-dom';
import { BRAND_NAME, SUPPORT_EMAIL, PRIVACY_URL, COMPANY_NAME, APP_URL } from '../../../config/site';

const C = {
  dark:   '#12212E',
  cream:  '#ECE7DC',
  accent: '#EA9940',
  muted:  'rgba(236,231,220,0.6)',
};

export function TermsPage() {
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
          Términos y<br />
          <span style={{ background: 'linear-gradient(135deg, #EA9940 0%, #ECE7DC 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Condiciones
          </span>
        </h1>

        <p style={{ color: C.muted, fontSize: 14, marginBottom: 56, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 32 }}>
          Última actualización: marzo 2026 · {APP_URL}
        </p>

        <LegalSection title="Aceptación de términos">
          <p>
            Al utilizar {BRAND_NAME} aceptas los términos y condiciones de uso de la plataforma.
          </p>
          <p>
            Si no estás de acuerdo con alguno de estos términos, te pedimos que no utilices la aplicación.
          </p>
        </LegalSection>

        <LegalSection title="Descripción del servicio">
          <p>
            {BRAND_NAME} es una herramienta digital diseñada para ayudar a organizar viajes
            y preparar equipaje de forma inteligente.
          </p>
          <p>
            El servicio incluye funcionalidades como planificación de viajes, gestión de equipaje,
            información de destinos, traducción, conversión de moneda y otras herramientas de utilidad para el viajero.
          </p>
        </LegalSection>

        <LegalSection title="Responsabilidad del usuario">
          <p>El usuario es responsable de:</p>
          <ul>
            <li>El uso adecuado de la aplicación</li>
            <li>La información que ingresa en ella</li>
            <li>Mantener la confidencialidad de sus credenciales de acceso</li>
            <li>Notificar inmediatamente cualquier uso no autorizado de su cuenta</li>
          </ul>
        </LegalSection>

        <LegalSection title="Servicios premium">
          <p>
            {BRAND_NAME} puede ofrecer funcionalidades adicionales o servicios premium
            que estarán sujetos a condiciones y precios específicos.
          </p>
          <p>
            Los términos de los servicios de pago se comunicarán claramente antes de cualquier
            transacción y el usuario deberá aceptarlos expresamente.
          </p>
        </LegalSection>

        <LegalSection title="Propiedad intelectual">
          <p>
            Todo el contenido de {BRAND_NAME}, incluyendo diseño, código, marcas y textos,
            son propiedad de {COMPANY_NAME} y están protegidos por las leyes de propiedad intelectual.
          </p>
          <p>
            {BRAND_NAME} es una marca registrada de {COMPANY_NAME}.
          </p>
        </LegalSection>

        <LegalSection title="Modificaciones">
          <p>
            Nos reservamos el derecho de actualizar o modificar estas condiciones para mejorar
            la plataforma y la experiencia de los usuarios.
          </p>
          <p>
            Los cambios significativos serán comunicados a los usuarios con antelación razonable.
          </p>
        </LegalSection>

        <LegalSection title="Limitación de responsabilidad">
          <p>
            {BRAND_NAME} se proporciona "tal como está". No garantizamos disponibilidad continua
            ni que la aplicación esté libre de errores.
          </p>
          <p>
            En ningún caso seremos responsables de daños indirectos o consecuentes derivados
            del uso o imposibilidad de uso de la aplicación.
          </p>
        </LegalSection>

        <LegalSection title="Contacto">
          <p>
            Para soporte o dudas puedes escribir a:{' '}
            <a href={`mailto:${SUPPORT_EMAIL}`} style={{ color: C.accent, textDecoration: 'none' }}>{SUPPORT_EMAIL}</a>
          </p>
        </LegalSection>

        {/* Footer nav */}
        <div style={{ marginTop: 64, paddingTop: 32, borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <Link to="/" style={{ color: C.muted, fontSize: 13, textDecoration: 'none' }}>← Inicio</Link>
          <Link to={PRIVACY_URL} style={{ color: C.muted, fontSize: 13, textDecoration: 'none' }}>Política de Privacidad →</Link>
        </div>
        <p style={{ color: 'rgba(236,231,220,0.25)', fontSize: 12, marginTop: 28 }}>
          {BRAND_NAME} es una marca registrada de {COMPANY_NAME}. · {SUPPORT_EMAIL}
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
