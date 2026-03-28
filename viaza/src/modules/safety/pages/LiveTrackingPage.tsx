// src/modules/safety/pages/LiveTrackingPage.tsx
//
// Página pública que el acompañante abre para ver el Safe Walk en tiempo real.
// URL: /safety/view/:token
//
// NO requiere autenticación. El token es el companion_token opaco generado
// por la edge function safety-tracking al iniciar la sesión.
//
// Sin emojis. Paleta oficial VIAZA.

import { useParams } from 'react-router-dom';
import { CompanionMapView } from '../components/CompanionMapView';

const P = {
  primary: '#12212E',
  bg: '#ECE7DC',
};

export function LiveTrackingPage() {
  const { token } = useParams<{ token: string }>();

  if (!token) {
    return (
      <div
        className="min-h-dvh flex items-center justify-center px-6 text-center"
        style={{ background: P.bg, fontFamily: 'Questrial, sans-serif' }}
      >
        <div>
          <p className="text-base font-bold" style={{ color: P.primary }}>
            Enlace inválido
          </p>
          <p className="text-sm mt-2" style={{ color: 'rgba(18,33,46,0.50)' }}>
            El enlace de seguimiento no contiene un token válido.
          </p>
        </div>
      </div>
    );
  }

  return <CompanionMapView companionToken={token} />;
}
