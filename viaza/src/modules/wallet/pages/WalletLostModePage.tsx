// src/modules/wallet/pages/WalletLostModePage.tsx
//
// Modo Robo / Pérdida de documentos y tarjetas.
//
// FUNCIONALIDAD:
//   1. Lista de acciones inmediatas por tipo de documento perdido
//   2. Números de bloqueo de tarjetas por país (hardcoded, los más comunes)
//   3. Marcar documentos del wallet como reportados perdidos (is_reported_lost)
//   4. Links de emergencia: embajadas, INTERPOL, policía local
//
// Sin emojis. Paleta oficial VIAZA.

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../../app/store/useAppStore';
import { reportDocLost } from '../../../services/walletDocsService';
import { AppHeader } from '../../../components/ui/AppHeader';

const P = {
  primary: '#12212E',
  secondary: '#307082',
  softTeal: '#6CA3A2',
  accent: '#EA9940',
  bg: '#ECE7DC',
};

// ─── Números de bloqueo de tarjetas por país ─────────────────────────────────
// Fuente: números oficiales publicados por cada banco/red

type CardBlockContact = {
  country: string;
  flag: string;         // texto, NO emoji — código ISO de 2 letras para mostrar
  countryCode: string;  // ISO 3166-1 alpha-2
  networks: {
    name: string;
    phone: string;
    available: string;  // ej "24/7"
    notes?: string;
  }[];
};

const CARD_BLOCK_CONTACTS: CardBlockContact[] = [
  {
    country: 'México',
    flag: 'MX',
    countryCode: 'MX',
    networks: [
      { name: 'BBVA México', phone: '800 226 2663', available: '24/7' },
      { name: 'Santander MX', phone: '800 501 0000', available: '24/7' },
      { name: 'Banamex / Citibanamex', phone: '800 021 2345', available: '24/7' },
      { name: 'Banorte', phone: '800 226 6783', available: '24/7' },
      { name: 'HSBC México', phone: '800 712 4722', available: '24/7' },
      { name: 'Visa global', phone: '+1 800 847 2911', available: '24/7' },
      { name: 'Mastercard global', phone: '+1 636 722 7111', available: '24/7' },
    ],
  },
  {
    country: 'Estados Unidos',
    flag: 'US',
    countryCode: 'US',
    networks: [
      { name: 'Visa global', phone: '+1 800 847 2911', available: '24/7' },
      { name: 'Mastercard global', phone: '+1 636 722 7111', available: '24/7' },
      { name: 'American Express', phone: '+1 800 528 4800', available: '24/7' },
      { name: 'Chase', phone: '+1 800 432 3117', available: '24/7' },
      { name: 'Bank of America', phone: '+1 800 732 9194', available: '24/7' },
    ],
  },
  {
    country: 'España',
    flag: 'ES',
    countryCode: 'ES',
    networks: [
      { name: 'Santander España', phone: '900 100 226', available: '24/7' },
      { name: 'BBVA España', phone: '900 102 801', available: '24/7' },
      { name: 'CaixaBank', phone: '900 400 900', available: '24/7' },
      { name: 'Sabadell', phone: '900 711 500', available: '24/7' },
      { name: 'Visa global', phone: '+1 800 847 2911', available: '24/7' },
      { name: 'Mastercard global', phone: '+1 636 722 7111', available: '24/7' },
    ],
  },
  {
    country: 'Argentina',
    flag: 'AR',
    countryCode: 'AR',
    networks: [
      { name: 'Visa Argentina', phone: '0800 666 8472', available: '24/7' },
      { name: 'Mastercard Argentina', phone: '0800 666 0624', available: '24/7' },
      { name: 'Banco Nación', phone: '0810 666 4444', available: '24/7' },
      { name: 'Santander AR', phone: '0800 777 7000', available: '24/7' },
    ],
  },
  {
    country: 'Colombia',
    flag: 'CO',
    countryCode: 'CO',
    networks: [
      { name: 'Bancolombia', phone: '01 8000 912 345', available: '24/7' },
      { name: 'Davivienda', phone: '01 8000 912 424', available: '24/7' },
      { name: 'Banco de Bogotá', phone: '01 8000 912 654', available: '24/7' },
      { name: 'Visa global', phone: '+1 800 847 2911', available: '24/7' },
    ],
  },
  {
    country: 'Francia',
    flag: 'FR',
    countryCode: 'FR',
    networks: [
      { name: 'BNP Paribas', phone: '+33 1 40 14 45 46', available: '24/7' },
      { name: 'Crédit Agricole', phone: '+33 1 72 05 05 05', available: '24/7' },
      { name: 'Société Générale', phone: '+33 1 42 14 20 00', available: '24/7' },
      { name: 'Visa Europa', phone: '+32 2 508 2111', available: '24/7' },
      { name: 'Mastercard global', phone: '+1 636 722 7111', available: '24/7' },
    ],
  },
  {
    country: 'Reino Unido',
    flag: 'GB',
    countryCode: 'GB',
    networks: [
      { name: 'Barclays', phone: '+44 1604 230 230', available: '24/7' },
      { name: 'HSBC UK', phone: '+44 1442 422 929', available: '24/7' },
      { name: 'Lloyds', phone: '+44 1702 278 270', available: '24/7' },
      { name: 'NatWest', phone: '+44 1268 508 020', available: '24/7' },
      { name: 'Visa global', phone: '+1 800 847 2911', available: '24/7' },
    ],
  },
  {
    country: 'Italia',
    flag: 'IT',
    countryCode: 'IT',
    networks: [
      { name: 'Intesa Sanpaolo', phone: '800 303 303', available: '24/7' },
      { name: 'UniCredit', phone: '800 323 285', available: '24/7' },
      { name: 'Visa global', phone: '+1 800 847 2911', available: '24/7' },
      { name: 'Mastercard global', phone: '+1 636 722 7111', available: '24/7' },
    ],
  },
];

// ─── Pasos de emergencia por tipo de pérdida ─────────────────────────────────

type LostScenario = {
  id: string;
  title: string;
  steps: string[];
  urgentContacts?: { label: string; url: string }[];
};

const LOST_SCENARIOS: LostScenario[] = [
  {
    id: 'passport',
    title: 'Pasaporte perdido o robado',
    steps: [
      'Reporta el robo a la policía local y solicita una copia del reporte (lo necesitará la embajada).',
      'Contacta inmediatamente la embajada o consulado de tu país en el destino.',
      'Solicita un pasaporte de emergencia o documento de viaje provisional.',
      'Notifica a tu aerolínea si tienes vuelo próximo — pueden requerir documentación adicional.',
      'Guarda el número de reporte policial y el número de caso de la embajada.',
    ],
    urgentContacts: [
      { label: 'Directorio de embajadas mexicanas', url: 'https://sre.gob.mx/representaciones' },
      { label: 'Directorio consular de España', url: 'https://www.exteriores.gob.es/en/Servicios/Pages/Index.aspx' },
    ],
  },
  {
    id: 'wallet_cards',
    title: 'Cartera con tarjetas',
    steps: [
      'Llama de inmediato al número de bloqueo de tu banco (ver sección de números abajo).',
      'Bloquea también las tarjetas desde la app de tu banco si la tienes.',
      'Reporta el robo a la policía local y guarda el número de reporte.',
      'Notifica a tu seguro de viaje — muchos cubren pérdida de efectivo y tarjetas.',
      'Si tienes tarjeta de crédito Visa/Mastercard, puedes solicitar efectivo de emergencia en cualquier banco con tu número de caso.',
    ],
  },
  {
    id: 'phone',
    title: 'Teléfono perdido o robado',
    steps: [
      'Reporta el IMEI a tu operadora para bloquearlo (evita que lo usen).',
      'Activa "Encontrar mi dispositivo" desde otro dispositivo si aún no lo bloquearon.',
      'Cambia contraseñas de redes sociales, email y apps financieras desde otro dispositivo.',
      'Reporta el robo a la policía y solicita el acta.',
      'Notifica a tu seguro de viaje si incluye cobertura de equipos electrónicos.',
    ],
  },
  {
    id: 'luggage',
    title: 'Equipaje perdido en aeropuerto',
    steps: [
      'Reporta inmediatamente en el mostrador de equipajes del aerolínea antes de salir del aeropuerto.',
      'Solicita el formulario PIR (Property Irregularity Report) — sin él no hay reclamación.',
      'Guarda todos los comprobantes: boleto de equipaje, PIR, recibos de compras de emergencia.',
      'La aerolínea tiene 21 días para localizar el equipaje antes de considerarlo perdido.',
      'Si tienes seguro de viaje, notifícalo dentro de las primeras 24 horas.',
    ],
  },
  {
    id: 'insurance',
    title: 'Seguro de viaje / asistencia médica',
    steps: [
      'Llama al número de emergencias 24/7 de tu asistencia médica ANTES de ir al hospital.',
      'Si ya fuiste al hospital, guarda TODOS los recibos y reportes médicos.',
      'No pagues sin autorización previa de la aseguradora (salvo emergencia inmediata).',
      'Reporta cualquier robo a la policía antes de hacer la reclamación al seguro.',
    ],
  },
];

// ─── Componente principal ─────────────────────────────────────────────────────

export function WalletLostModePage() {
  const navigate = useNavigate();
  const walletDocs = useAppStore((s) => s.walletDocs);
  const currentTripId = useAppStore((s) => s.currentTripId);
  const updateWalletDoc = useAppStore((s) => s.updateWalletDoc);

  const [activeTab, setActiveTab] = useState<'actions' | 'cards' | 'docs'>('actions');
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [activeCountry, setActiveCountry] = useState<string>('MX');
  const [markingId, setMarkingId] = useState<string | null>(null);

  const tripDocs = walletDocs.filter((d) => d.tripId === currentTripId && !d.isReportedLost);
  const lostDocs = walletDocs.filter((d) => d.tripId === currentTripId && d.isReportedLost);

  const selectedCountry = CARD_BLOCK_CONTACTS.find((c) => c.countryCode === activeCountry) ?? CARD_BLOCK_CONTACTS[0];

  async function handleMarkLost(docId: string) {
    setMarkingId(docId);
    try {
      const now = new Date().toISOString();
      updateWalletDoc(docId, { isReportedLost: true, lostReportedAt: now });
      await reportDocLost(docId);
    } finally {
      setMarkingId(null);
    }
  }

  return (
    <div className="min-h-dvh pb-24" style={{ background: P.bg, fontFamily: 'Questrial, sans-serif' }}>
      <AppHeader title="Modo Emergencia" />

      {/* Banner de alerta */}
      <div
        className="mx-4 mt-4 rounded-3xl px-5 py-4"
        style={{ background: P.primary }}
      >
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: P.accent }}>
          Modo robo / pérdida activo
        </p>
        <p className="text-sm text-white mt-1 leading-snug">
          Sigue los pasos. Actúa rápido. Cada minuto cuenta para bloquear tarjetas y reportar documentos.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 px-4 mt-4">
        {([['actions', 'Qué hacer'], ['cards', 'Bloquear tarjetas'], ['docs', 'Mis documentos']] as const).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className="flex-1 rounded-2xl py-2.5 text-xs font-bold transition"
            style={{
              background: activeTab === id ? P.primary : 'rgba(18,33,46,0.07)',
              color: activeTab === id ? 'white' : `rgba(18,33,46,0.55)`,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* TAB: Qué hacer */}
        {activeTab === 'actions' && (
          <motion.div
            key="actions"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.18 }}
            className="px-4 mt-4 space-y-3"
          >
            {LOST_SCENARIOS.map((scenario) => {
              const open = activeScenario === scenario.id;
              return (
                <div
                  key={scenario.id}
                  className="rounded-3xl overflow-hidden"
                  style={{ background: 'white', boxShadow: '0 2px 12px rgba(18,33,46,0.07)' }}
                >
                  <button
                    type="button"
                    className="w-full flex items-center justify-between px-5 py-4"
                    onClick={() => setActiveScenario(open ? null : scenario.id)}
                  >
                    <span className="text-sm font-bold text-left" style={{ color: P.primary }}>{scenario.title}</span>
                    <span
                      className="text-xs font-semibold transition-transform"
                      style={{ color: P.softTeal, transform: open ? 'rotate(180deg)' : 'none', display: 'inline-block' }}
                    >
                      &#8964;
                    </span>
                  </button>

                  <AnimatePresence>
                    {open && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div className="px-5 pb-5 space-y-3" style={{ borderTop: `1px solid rgba(18,33,46,0.06)` }}>
                          <ol className="space-y-2 mt-3">
                            {scenario.steps.map((step, i) => (
                              <li key={i} className="flex gap-3 items-start">
                                <div
                                  className="shrink-0 flex items-center justify-center rounded-full text-xs font-bold"
                                  style={{ width: 22, height: 22, background: `rgba(234,153,64,0.12)`, color: P.accent }}
                                >
                                  {i + 1}
                                </div>
                                <p className="text-xs leading-relaxed" style={{ color: `rgba(18,33,46,0.75)` }}>{step}</p>
                              </li>
                            ))}
                          </ol>

                          {scenario.urgentContacts && (
                            <div className="space-y-2 pt-1">
                              {scenario.urgentContacts.map((c) => (
                                <a
                                  key={c.url}
                                  href={c.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-between rounded-2xl px-4 py-3"
                                  style={{ background: `rgba(48,112,130,0.08)`, textDecoration: 'none' }}
                                >
                                  <span className="text-xs font-semibold" style={{ color: P.secondary }}>{c.label}</span>
                                  <svg width="12" height="12" viewBox="0 0 48 48" fill="none">
                                    <path d="M18 10l16 14-16 14" stroke={P.secondary} strokeWidth="3.5" strokeLinecap="round" fill="none"/>
                                  </svg>
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </motion.div>
        )}

        {/* TAB: Bloquear tarjetas */}
        {activeTab === 'cards' && (
          <motion.div
            key="cards"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.18 }}
            className="px-4 mt-4"
          >
            {/* Selector de país */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {CARD_BLOCK_CONTACTS.map((c) => (
                <button
                  key={c.countryCode}
                  type="button"
                  onClick={() => setActiveCountry(c.countryCode)}
                  className="shrink-0 rounded-2xl px-3 py-2 text-xs font-bold transition"
                  style={{
                    background: activeCountry === c.countryCode ? P.primary : 'rgba(18,33,46,0.07)',
                    color: activeCountry === c.countryCode ? 'white' : `rgba(18,33,46,0.55)`,
                  }}
                >
                  {c.flag} {c.country}
                </button>
              ))}
            </div>

            {/* Lista de números */}
            <div className="mt-4 space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider px-1 mb-3" style={{ color: P.softTeal }}>
                Números de bloqueo — {selectedCountry.country}
              </p>
              {selectedCountry.networks.map((net) => (
                <div
                  key={net.name}
                  className="flex items-center justify-between rounded-3xl px-5 py-4"
                  style={{ background: 'white', boxShadow: '0 2px 10px rgba(18,33,46,0.06)' }}
                >
                  <div>
                    <p className="text-sm font-bold" style={{ color: P.primary }}>{net.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: P.softTeal }}>{net.available}</p>
                    {net.notes && <p className="text-xs mt-0.5" style={{ color: `rgba(18,33,46,0.45)` }}>{net.notes}</p>}
                  </div>
                  <a
                    href={`tel:${net.phone.replace(/\s/g, '')}`}
                    className="rounded-2xl px-4 py-2.5 text-sm font-bold"
                    style={{ background: P.secondary, color: 'white', textDecoration: 'none' }}
                  >
                    {net.phone}
                  </a>
                </div>
              ))}

              <div
                className="rounded-3xl px-5 py-4 mt-4"
                style={{ background: `rgba(234,153,64,0.08)`, border: `1px solid rgba(234,153,64,0.20)` }}
              >
                <p className="text-xs font-bold" style={{ color: P.accent }}>Visa y Mastercard global</p>
                <p className="text-xs mt-1" style={{ color: `rgba(18,33,46,0.60)` }}>
                  Si no conoces el número específico de tu banco, llama directamente a Visa (+1 800 847 2911) o Mastercard (+1 636 722 7111).
                  Te ayudarán a contactar al banco emisor.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB: Mis documentos */}
        {activeTab === 'docs' && (
          <motion.div
            key="docs"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.18 }}
            className="px-4 mt-4"
          >
            {tripDocs.length === 0 && lostDocs.length === 0 && (
              <div className="text-center py-10">
                <p className="text-sm font-semibold" style={{ color: `rgba(18,33,46,0.45)` }}>
                  No hay documentos en este viaje.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/wallet')}
                  className="mt-3 rounded-2xl px-5 py-2.5 text-sm font-bold"
                  style={{ background: P.secondary, color: 'white' }}
                >
                  Ir a Wallet
                </button>
              </div>
            )}

            {tripDocs.length > 0 && (
              <>
                <p className="text-xs font-bold uppercase tracking-wider px-1 mb-3" style={{ color: P.softTeal }}>
                  Marcar como perdido / robado
                </p>
                <div className="space-y-2">
                  {tripDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between rounded-3xl px-5 py-4"
                      style={{ background: 'white', boxShadow: '0 2px 10px rgba(18,33,46,0.06)' }}
                    >
                      <div className="min-w-0 flex-1 mr-3">
                        <p className="text-sm font-bold truncate" style={{ color: P.primary }}>
                          {doc.fileName ?? 'Documento sin nombre'}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: `rgba(18,33,46,0.45)` }}>
                          {doc.docType ?? 'Tipo desconocido'}
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={markingId === doc.id}
                        onClick={() => handleMarkLost(doc.id)}
                        className="shrink-0 rounded-2xl px-4 py-2 text-xs font-bold transition"
                        style={{
                          background: `rgba(234,153,64,0.12)`,
                          color: P.accent,
                          opacity: markingId === doc.id ? 0.5 : 1,
                        }}
                      >
                        {markingId === doc.id ? 'Marcando...' : 'Reportar perdido'}
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}

            {lostDocs.length > 0 && (
              <div className="mt-5">
                <p className="text-xs font-bold uppercase tracking-wider px-1 mb-3" style={{ color: `rgba(234,153,64,0.8)` }}>
                  Documentos reportados perdidos
                </p>
                <div className="space-y-2">
                  {lostDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center gap-3 rounded-3xl px-5 py-4"
                      style={{ background: `rgba(234,153,64,0.07)`, border: `1px solid rgba(234,153,64,0.20)` }}
                    >
                      <div
                        className="shrink-0 w-2 h-2 rounded-full"
                        style={{ background: P.accent }}
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-bold truncate" style={{ color: P.primary }}>
                          {doc.fileName ?? 'Documento sin nombre'}
                        </p>
                        {doc.lostReportedAt && (
                          <p className="text-xs mt-0.5" style={{ color: `rgba(18,33,46,0.45)` }}>
                            Reportado {new Date(doc.lostReportedAt).toLocaleDateString('es', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
