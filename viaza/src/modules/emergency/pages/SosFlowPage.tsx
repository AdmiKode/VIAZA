// src/modules/emergency/pages/SosFlowPage.tsx
//
// Página de SOS completa:
//   1. Botón de activación de SOS (grande, rojo)
//   2. Tras activar: muestra event_token, URL pública, botón WhatsApp
//   3. Historial de SOS del usuario (últimos 10)
//
// Sin emojis. Paleta oficial VIAZA.

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../../app/store/useAppStore';
import { useNavigate } from 'react-router-dom';
import {
  triggerSos,
  getMySosEvents,
  updateSosStatus,
  buildWhatsAppSosMessage,
  openWhatsAppSos,
  type SosEvent,
  type SosCreateResult,
} from '../../../services/sosService';

const P = {
  primary:    '#12212E',
  secondary:  '#307082',
  softTeal:   '#6CA3A2',
  bg:         '#ECE7DC',
  accent:     '#EA9940',
  danger:     '#C0392B',
  rgb:        '18,33,46',
};

const STATUS_LABELS: Record<string, string> = {
  sent: 'Enviado',
  delivered: 'Entregado',
  acknowledged: 'Reconocido',
  resolved: 'Resuelto',
  expired: 'Expirado',
};
const STATUS_COLORS: Record<string, string> = {
  sent: P.accent,
  delivered: P.secondary,
  acknowledged: '#27AE60',
  resolved: P.softTeal,
  expired: `rgba(${P.rgb},0.3)`,
};

// ─── Hook de posición ──────────────────────────────────────────────────────────
// Usa el nativo del navegador como fallback

function useCurrentPosition() {
  const [pos, setPos] = useState<{ lat: number; lon: number; accuracy: number } | null>(null);
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (p) => setPos({ lat: p.coords.latitude, lon: p.coords.longitude, accuracy: p.coords.accuracy }),
      () => setPos(null),
      { timeout: 8000, maximumAge: 30000 }
    );
  }, []);
  return pos;
}

export function SosFlowPage() {
  const navigate = useNavigate();
  const currentTripId = useAppStore((s) => s.currentTripId);
  const profile = useAppStore((s) => s.user);

  const position = useCurrentPosition();

  const [activating, setActivating] = useState(false);
  const [result, setResult] = useState<SosCreateResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Historial
  const [history, setHistory] = useState<SosEvent[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  // Contacto (tomado del emergency profile si existe)
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const events = await getMySosEvents(10);
      setHistory(events);
    } catch { /* silenciar */ }
    finally { setHistoryLoading(false); }
  }, []);

  useEffect(() => { void loadHistory(); }, [loadHistory]);

  async function handleActivateSos() {
    setActivating(true);
    setError(null);
    setResult(null);
    try {
      const res = await triggerSos({
        tripId: currentTripId ?? undefined,
        lat: position?.lat,
        lon: position?.lon,
        accuracyMeters: position?.accuracy,
        messageText: `Alerta SOS desde VIAZA. Mi ubicación está en el enlace.`,
        sentToName: contactName || undefined,
        sentToPhone: contactPhone || undefined,
        sentVia: contactPhone ? 'whatsapp' : 'manual',
      });
      setResult(res);
      void loadHistory();
    } catch (e) {
      setError((e as Error).message ?? 'Error activando SOS');
    } finally {
      setActivating(false);
    }
  }

  function handleCopyUrl() {
    if (!result?.eventUrl) return;
    void navigator.clipboard.writeText(result.eventUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  function handleWhatsApp() {
    if (!result || !contactPhone) return;
    const msg = buildWhatsAppSosMessage({
      userName: profile?.name ?? 'Viajero VIAZA',
      contactName: contactName || 'Contacto',
      eventUrl: result.eventUrl,
      lat: position?.lat,
      lon: position?.lon,
    });
    openWhatsAppSos(contactPhone, msg);
  }

  async function handleResolve(eventId: string) {
    try {
      await updateSosStatus(eventId, 'resolved');
      void loadHistory();
    } catch { /* silenciar */ }
  }

  return (
    <div style={{ minHeight: '100vh', background: P.bg, paddingBottom: 100, fontFamily: 'Questrial, sans-serif' }}>

      {/* Header */}
      <div style={{ background: `linear-gradient(160deg, ${P.danger} 0%, #922B21 100%)`, padding: '52px 20px 24px' }}>
        <button
          onClick={() => navigate(-1)}
          style={{ background: 'none', border: 'none', color: '#fff', fontSize: 14, cursor: 'pointer', opacity: 0.8, marginBottom: 12, padding: 0 }}
        >
          Atras
        </button>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>Alerta SOS</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 4 }}>
          Activa una alerta de emergencia con tu ubicacion actual
        </div>
      </div>

      <div style={{ padding: '20px' }}>

        {/* Datos del contacto */}
        {!result && (
          <div style={{ background: '#fff', borderRadius: 14, padding: '16px', marginBottom: 16, boxShadow: `0 2px 12px rgba(${P.rgb},0.07)` }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: P.primary, marginBottom: 12 }}>
              Contacto de emergencia (opcional)
            </div>
            <input
              type="text"
              placeholder="Nombre del contacto"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              style={{
                width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: 10,
                border: `1px solid rgba(${P.rgb},0.15)`, fontSize: 13, color: P.primary,
                background: `rgba(${P.rgb},0.04)`, outline: 'none', marginBottom: 8,
              }}
            />
            <input
              type="tel"
              placeholder="+52 55 1234 5678"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              style={{
                width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: 10,
                border: `1px solid rgba(${P.rgb},0.15)`, fontSize: 13, color: P.primary,
                background: `rgba(${P.rgb},0.04)`, outline: 'none',
              }}
            />
            {position && (
              <div style={{ fontSize: 11, color: P.softTeal, marginTop: 8 }}>
                Ubicacion detectada: {position.lat.toFixed(5)}, {position.lon.toFixed(5)} (~{Math.round(position.accuracy)}m)
              </div>
            )}
          </div>
        )}

        {/* Botón SOS */}
        {!result && (
          <button
            onClick={() => void handleActivateSos()}
            disabled={activating}
            style={{
              width: '100%', padding: '20px', borderRadius: 16, border: 'none',
              background: activating ? `rgba(${P.rgb},0.15)` : P.danger,
              color: activating ? P.softTeal : '#fff',
              fontSize: 18, fontWeight: 700, cursor: activating ? 'default' : 'pointer',
              letterSpacing: 1, transition: 'all 0.2s',
              boxShadow: activating ? 'none' : `0 4px 20px rgba(192,57,43,0.4)`,
            }}
          >
            {activating ? 'Activando alerta...' : 'ACTIVAR SOS'}
          </button>
        )}

        {/* Error */}
        {error && (
          <div style={{ background: `rgba(192,57,43,0.1)`, borderRadius: 10, padding: '12px 14px', color: P.danger, fontSize: 13, marginTop: 12 }}>
            {error}
          </div>
        )}

        {/* Resultado tras activar */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ background: '#fff', borderRadius: 16, padding: '20px', marginTop: 8, boxShadow: `0 4px 20px rgba(${P.rgb},0.1)` }}
            >
              <div style={{ fontSize: 15, fontWeight: 700, color: '#27AE60', marginBottom: 4 }}>
                Alerta SOS activada
              </div>
              <div style={{ fontSize: 12, color: P.softTeal, marginBottom: 16 }}>
                Token valido por 24 horas · Comparte el enlace con tu contacto
              </div>

              {/* URL del evento */}
              <div style={{ background: `rgba(${P.rgb},0.05)`, borderRadius: 10, padding: '10px 12px', marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: P.softTeal, marginBottom: 4 }}>Enlace de emergencia</div>
                <div style={{ fontSize: 12, color: P.primary, wordBreak: 'break-all', fontFamily: 'monospace' }}>
                  {result.eventUrl}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  onClick={handleCopyUrl}
                  style={{
                    flex: 1, minWidth: 120, padding: '10px 16px', borderRadius: 10, border: `1px solid rgba(${P.rgb},0.2)`,
                    background: 'transparent', color: P.secondary, fontSize: 13, cursor: 'pointer', fontWeight: 600,
                  }}
                >
                  {copied ? 'Copiado' : 'Copiar enlace'}
                </button>

                {contactPhone && (
                  <button
                    onClick={handleWhatsApp}
                    style={{
                      flex: 1, minWidth: 120, padding: '10px 16px', borderRadius: 10, border: 'none',
                      background: '#25D366', color: '#fff', fontSize: 13, cursor: 'pointer', fontWeight: 600,
                    }}
                  >
                    Enviar por WhatsApp
                  </button>
                )}

                <button
                  onClick={() => void handleResolve(result.sosEventId)}
                  style={{
                    flex: 1, minWidth: 120, padding: '10px 16px', borderRadius: 10, border: `1px solid rgba(${P.rgb},0.2)`,
                    background: 'transparent', color: P.softTeal, fontSize: 13, cursor: 'pointer',
                  }}
                >
                  Marcar resuelto
                </button>
              </div>

              <button
                onClick={() => { setResult(null); setError(null); }}
                style={{ width: '100%', marginTop: 12, padding: '10px', borderRadius: 10, border: 'none', background: `rgba(${P.rgb},0.05)`, color: P.softTeal, fontSize: 13, cursor: 'pointer' }}
              >
                Nuevo SOS
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Historial */}
        <div style={{ marginTop: 28 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: P.primary, marginBottom: 12 }}>
            Historial de alertas
          </div>

          {historyLoading && (
            <div style={{ color: P.softTeal, fontSize: 13, textAlign: 'center' }}>Cargando...</div>
          )}

          {!historyLoading && history.length === 0 && (
            <div style={{ color: P.softTeal, fontSize: 13, textAlign: 'center', padding: '20px 0' }}>
              Sin alertas previas
            </div>
          )}

          {history.map((ev) => {
            const expired = new Date(ev.tokenExpiresAt) < new Date();
            return (
              <div
                key={ev.id}
                style={{
                  background: `rgba(${P.rgb},0.04)`, borderRadius: 12, padding: '12px 14px',
                  marginBottom: 8, borderLeft: `3px solid ${STATUS_COLORS[ev.status] ?? P.softTeal}`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: STATUS_COLORS[ev.status] ?? P.softTeal }}>
                      {STATUS_LABELS[ev.status] ?? ev.status}
                    </div>
                    <div style={{ fontSize: 11, color: P.softTeal, marginTop: 2 }}>
                      {new Date(ev.createdAt).toLocaleString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      {ev.sentToName ? ` · Para: ${ev.sentToName}` : ''}
                      {ev.sentVia !== 'manual' ? ` · ${ev.sentVia}` : ''}
                    </div>
                    {ev.lat && ev.lon && (
                      <div style={{ fontSize: 11, color: P.softTeal, marginTop: 2 }}>
                        {ev.lat.toFixed(4)}, {ev.lon.toFixed(4)}
                      </div>
                    )}
                  </div>
                  {!expired && ev.status === 'sent' && (
                    <button
                      onClick={() => void handleResolve(ev.id)}
                      style={{ background: 'none', border: `1px solid rgba(${P.rgb},0.2)`, borderRadius: 8, padding: '4px 10px', fontSize: 11, color: P.softTeal, cursor: 'pointer' }}
                    >
                      Resolver
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
