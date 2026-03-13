import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../../app/store/useAppStore';
import { purchasePremium, restorePurchases } from '../../../services/premiumService';
import { Capacitor } from '@capacitor/core';

/* ─── Beneficios del plan premium ─── */
const BENEFITS = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 48 48" fill="none">
        <rect x="4" y="10" width="40" height="28" rx="8" fill="#EA9940" fillOpacity="0.9"/>
        <rect x="4" y="10" width="40" height="14" rx="8" fill="rgba(255,255,255,0.30)"/>
        <path d="M13 24h22M13 30h14" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    ),
    titleKey: 'premium.benefit.ocr.title',
    descKey: 'premium.benefit.ocr.desc',
    title: 'Escáner de boarding pass',
    desc: 'Escanea tu pase de abordar con la cámara y extrae todos los datos automáticamente.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 48 48" fill="none">
        <path d="M12 36c0-8 6-16 12-16s12 8 12 16" stroke="#307082" strokeWidth="3" strokeLinecap="round" fill="none"/>
        <rect x="10" y="8" width="28" height="20" rx="8" fill="#307082" fillOpacity="0.9"/>
        <rect x="10" y="8" width="28" height="10" rx="8" fill="rgba(255,255,255,0.30)"/>
        <circle cx="24" cy="18" r="4" fill="white" fillOpacity="0.7"/>
      </svg>
    ),
    titleKey: 'premium.benefit.luggage.title',
    descKey: 'premium.benefit.luggage.desc',
    title: 'Asistente de maleta IA',
    desc: 'Fotografía tu maleta y la IA te dice cómo acomodar todo de manera óptima.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="18" fill="#6CA3A2" fillOpacity="0.9"/>
        <circle cx="18" cy="18" r="9" fill="rgba(255,255,255,0.25)"/>
        <path d="M24 13v22M18 17h8a4 4 0 0 1 0 8h-8" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none"/>
      </svg>
    ),
    titleKey: 'premium.benefit.currency.title',
    descKey: 'premium.benefit.currency.desc',
    title: 'Conversión en tiempo real',
    desc: 'Tasas de cambio actualizadas al minuto para 170+ monedas.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 48 48" fill="none">
        <path d="M8 38L22 24l-4-8 6-6 4 8 8-4 2 2-14 10 6 12-4 2-4-8-4 4z" fill="#EA9940"/>
        <circle cx="34" cy="14" r="8" fill="#12212E" fillOpacity="0.85"/>
        <circle cx="34" cy="14" r="8" fill="rgba(255,255,255,0.08)"/>
        <path d="M30 14h8M34 10v8" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    ),
    titleKey: 'premium.benefit.trips.title',
    descKey: 'premium.benefit.trips.desc',
    title: 'Viajes ilimitados',
    desc: 'Crea y gestiona todos los viajes que quieras sin restricciones.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 48 48" fill="none">
        <rect x="6" y="10" width="36" height="24" rx="5" fill="#12212E" fillOpacity="0.9"/>
        <rect x="6" y="10" width="36" height="12" rx="5" fill="rgba(255,255,255,0.15)"/>
        <rect x="18" y="34" width="12" height="5" rx="2" fill="#12212E" fillOpacity="0.9"/>
        <rect x="14" y="39" width="20" height="3" rx="1.5" fill="#12212E" fillOpacity="0.9"/>
        <path d="M16 22l3 3 8-8" stroke="#EA9940" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    titleKey: 'premium.benefit.offline.title',
    descKey: 'premium.benefit.offline.desc',
    title: 'Modo sin conexión',
    desc: 'Accede a tus datos de viaje, frases y consejos sin necesitar internet.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 48 48" fill="none">
        <path d="M24 4l-3 5.4A14 14 0 0 0 15 12L9 10.2l-5 8.6 4.6 3.7a14.4 14.4 0 0 0 0 3l-4.6 3.7 5 8.6L15 36a14 14 0 0 0 6 2.6L24 44l3-5.4A14 14 0 0 0 33 36l6 1.8 5-8.6-4.6-3.7a14.4 14.4 0 0 0 0-3l4.6-3.7-5-8.6L33 12a14 14 0 0 0-6-2.6z" fill="#307082" fillOpacity="0.9"/>
        <circle cx="24" cy="24" r="7" fill="rgba(255,255,255,0.25)"/>
        <circle cx="24" cy="24" r="3" fill="white" fillOpacity="0.7"/>
      </svg>
    ),
    titleKey: 'premium.benefit.priority.title',
    descKey: 'premium.benefit.priority.desc',
    title: 'Soporte prioritario',
    desc: 'Respuesta en menos de 24h y acceso a nuevas funciones antes que nadie.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 48 48" fill="none">
        <rect x="6" y="8" width="36" height="32" rx="6" fill="#307082" fillOpacity="0.9"/>
        <path d="M16 20h16M16 28h10" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="36" cy="12" r="7" fill="#EA9940"/>
        <path d="M33 12h6M36 9v6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    titleKey: 'premium.benefit.agenda.title',
    descKey: 'premium.benefit.agenda.desc',
    title: 'Agenda con recurrencias',
    desc: 'Programa recordatorios para medicación, check-ins o llamadas con repetición automática cada 8h, 12h, diaria o semanal.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 48 48" fill="none">
        <rect x="4" y="6" width="40" height="36" rx="7" fill="#6CA3A2" fillOpacity="0.9"/>
        <path d="M4 14h40" stroke="white" strokeWidth="2" strokeOpacity="0.4"/>
        <circle cx="13" cy="10" r="2.5" fill="white" fillOpacity="0.5"/>
        <circle cx="20" cy="10" r="2.5" fill="white" fillOpacity="0.5"/>
        <path d="M12 24v14M12 24l10 7 10-7v14" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    titleKey: 'premium.benefit.itinerary.title',
    descKey: 'premium.benefit.itinerary.desc',
    title: 'Itinerario completo',
    desc: 'Organiza cada día de tu viaje en una timeline visual con vuelos, hoteles, actividades y lugares guardados.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 48 48" fill="none">
        <rect x="4" y="10" width="40" height="28" rx="6" fill="#EA9940" fillOpacity="0.85"/>
        <path d="M12 22l3 3 6-6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M26 22h10M26 28h7" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="38" cy="8" r="7" fill="#12212E"/>
        <path d="M35 8h6M38 5v6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    titleKey: 'premium.benefit.import.title',
    descKey: 'premium.benefit.import.desc',
    title: 'Importar reservas con IA',
    desc: 'Pega el texto de cualquier confirmación de vuelo, hotel o actividad y la IA lo añade automáticamente al itinerario.',
  },
];

/* URL de Stripe Checkout — se abre en browser nativo */
const isNative = Capacitor.isNativePlatform();

export function PremiumPage() {
  const { t } = useTranslation();
  const isPremium = useAppStore((s) => s.isPremium);
  const setIsPremium = useAppStore((s) => s.setIsPremium);
  const user = useAppStore((s) => s.user);
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [loadingRestore, setLoadingRestore] = useState(false);
  const [restoreMsg, setRestoreMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function handleCheckout() {
    setLoadingCheckout(true);
    try {
      const result = await purchasePremium(user?.email);
      if (result.success && isNative) {
        setIsPremium(true);
      }
    } finally {
      setTimeout(() => setLoadingCheckout(false), 3000);
    }
  }

  async function handleRestore() {
    setLoadingRestore(true);
    setRestoreMsg(null);
    try {
      const result = await restorePurchases();
      if (result.success) {
        setIsPremium(true);
        setRestoreMsg({ ok: true, text: '¡Compras restauradas! Ya tienes Premium.' });
      } else {
        setRestoreMsg({ ok: false, text: result.error ?? 'No se encontraron compras' });
      }
    } finally {
      setLoadingRestore(false);
    }
  }

  return (
    <div
      className="min-h-dvh pb-32"
      style={{ background: '#ECE7DC', fontFamily: 'Questrial, sans-serif' }}
    >
      {/* ── Hero ── */}
      <div
        className="relative overflow-hidden px-6 pt-14 pb-10"
        style={{
          background: 'linear-gradient(160deg, #12212E 0%, #307082 60%, #6CA3A2 100%)',
          borderBottomLeftRadius: 32,
          borderBottomRightRadius: 32,
        }}
      >
        <div className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}/>
        <div className="pointer-events-none absolute -left-8 bottom-0 h-36 w-36 rounded-full" style={{ background: 'rgba(234,153,64,0.12)' }}/>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          {/* Estrella */}
          <div className="mb-4 flex justify-center">
            <div className="flex items-center justify-center rounded-full" style={{ width: 64, height: 64, background: '#EA9940', boxShadow: '0 8px 28px rgba(234,153,64,0.5)' }}>
              <svg width="30" height="30" viewBox="0 0 48 48" fill="none">
                <path d="M24 4l5 10 11 1.6-8 7.8 1.9 11L24 29l-9.9 5.4L16 23.4 8 15.6 19 14z" fill="white" fillOpacity="0.95"/>
                <path d="M24 4l5 10 11 1.6-8 7.8" fill="white" fillOpacity="0.35"/>
              </svg>
            </div>
          </div>

          <div className="text-center">
            <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>
              VIAZA
            </div>
            <div style={{ color: 'white', fontSize: 30, fontWeight: 800, lineHeight: 1.1 }}>
              {isPremium ? 'Ya eres Premium' : 'Lleva tu viaje\nal siguiente nivel'}
            </div>
            {!isPremium && (
              <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, marginTop: 8 }}>
                Un solo pago. Todo desbloqueado. Para siempre.
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
                <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>Precio único</div>
                <div style={{ color: 'white', fontSize: 32, fontWeight: 800, lineHeight: 1, marginTop: 2 }}>$9.99</div>
                <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11 }}>USD · pago único</div>
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
                  background: '#EA9940',
                  color: 'white',
                  fontSize: 17,
                  fontFamily: 'Questrial, sans-serif',
                  boxShadow: '0 8px 28px rgba(234,153,64,0.45)',
                  border: 'none',
                  cursor: loadingCheckout ? 'default' : 'pointer',
                  opacity: loadingCheckout ? 0.7 : 1,
                }}
              >
                {loadingCheckout ? (
                  <>
                    <svg className="animate-spin" width="18" height="18" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="18" stroke="rgba(255,255,255,0.30)" strokeWidth="4"/><path d="M24 6a18 18 0 0 1 18 18" stroke="white" strokeWidth="4" strokeLinecap="round"/></svg>
                    {isNative ? 'Abriendo tienda…' : 'Abriendo pago…'}
                  </>
                ) : 'Activar Premium ahora'}
              </motion.button>

              {/* Restaurar compras — solo visible en nativo */}
              {isNative && (
                <div className="mt-3 text-center">
                  <button
                    type="button"
                    onClick={handleRestore}
                    disabled={loadingRestore}
                    style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.55)', fontSize: 13, fontFamily: 'Questrial, sans-serif', cursor: 'pointer', fontWeight: 600 }}
                  >
                    {loadingRestore ? 'Restaurando…' : 'Restaurar compras anteriores'}
                  </button>
                </div>
              )}

              {/* Mensaje restauración */}
              {restoreMsg && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 rounded-2xl px-4 py-3 text-center"
                  style={{ background: restoreMsg.ok ? 'rgba(108,163,162,0.20)' : 'rgba(192,57,43,0.15)' }}
                >
                  <span style={{ color: restoreMsg.ok ? '#6CA3A2' : 'rgba(255,200,200,0.90)', fontSize: 13, fontFamily: 'Questrial, sans-serif', fontWeight: 600 }}>
                    {restoreMsg.text}
                  </span>
                </motion.div>
              )}
            </>
          )}

          {isPremium && (
            <div className="mt-6 flex items-center justify-center gap-2 rounded-2xl py-4" style={{ background: 'rgba(255,255,255,0.12)' }}>
              <svg width="20" height="20" viewBox="0 0 48 48" fill="none"><path d="M10 24l10 10 18-18" stroke="#EA9940" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span style={{ color: 'white', fontWeight: 700, fontSize: 15 }}>Plan Premium activo</span>
            </div>
          )}
        </motion.div>
      </div>

      {/* ── Beneficios ── */}
      <div className="px-5 pt-8">
        <div style={{ color: 'rgba(18,33,46,0.45)', fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 16 }}>
          Qué incluye
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
                background: 'white',
                boxShadow: '0 2px 16px rgba(18,33,46,0.07)',
              }}
            >
              <div
                className="flex-shrink-0 flex items-center justify-center rounded-2xl"
                style={{ width: 48, height: 48, background: 'rgba(18,33,46,0.04)' }}
              >
                {b.icon}
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <div style={{ color: '#12212E', fontSize: 14, fontWeight: 700 }}>{b.title}</div>
                <div style={{ color: 'rgba(18,33,46,0.50)', fontSize: 12, marginTop: 3, lineHeight: 1.5 }}>{b.desc}</div>
              </div>
              {isPremium && (
                <svg width="18" height="18" viewBox="0 0 48 48" fill="none" className="flex-shrink-0 mt-1">
                  <circle cx="24" cy="24" r="20" fill="#EA9940" fillOpacity="0.15"/>
                  <path d="M14 24l7 7 13-14" stroke="#EA9940" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </motion.div>
          ))}
        </div>

        {/* Nota de seguridad */}
        {!isPremium && (
          <div
            className="mt-6 flex items-center gap-3 rounded-2xl px-4 py-3"
            style={{ background: 'rgba(18,33,46,0.05)' }}
          >
            <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
              <path d="M24 4L8 12v14c0 11 7 20 16 22 9-2 16-11 16-22V12z" fill="#307082" fillOpacity="0.8"/>
              <path d="M16 24l5 5 11-10" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span style={{ color: 'rgba(18,33,46,0.55)', fontSize: 12 }}>
              Pago seguro con Stripe · Sin suscripciones · Sin renovaciones automáticas
            </span>
          </div>
        )}

        {/* CTA bottom también */}
        {!isPremium && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={handleCheckout}
            disabled={loadingCheckout}
            className="mt-6 w-full rounded-2xl py-4 font-bold transition"
            style={{
              background: '#12212E',
              color: 'white',
              fontSize: 16,
              border: 'none',
              cursor: loadingCheckout ? 'default' : 'pointer',
            }}
          >
            {loadingCheckout ? 'Abriendo pago...' : 'Activar por $9.99 USD'}
          </motion.button>
        )}
      </div>
    </div>
  );
}


