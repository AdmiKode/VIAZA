// src/modules/emergency/pages/SosPublicPage.tsx
// Vista pública del evento SOS — accesible por token efímero sin autenticación.
// El contacto de emergencia abre este link para ver ubicación y estado.

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../../services/supabaseClient';

const P = {
  primary:  '#12212E',
  secondary:'#307082',
  softTeal: '#6CA3A2',
  bg:       '#ECE7DC',
  accent:   '#EA9940',
  danger:   '#C0392B',
  rgb:      '18,33,46',
};

interface SosEventPublic {
  id: string;
  lat: number | null;
  lon: number | null;
  accuracy_meters: number | null;
  status: string;
  message_text: string | null;
  sent_to_name: string | null;
  sent_via: string | null;
  created_at: string;
  token_expires_at: string;
}

const STATUS_LABELS: Record<string, string> = {
  sent: 'Alerta enviada — persona en emergencia',
  delivered: 'Alerta entregada',
  acknowledged: 'Alerta reconocida',
  resolved: 'Situacion resuelta',
  expired: 'Alerta expirada',
};

export function SosPublicPage() {
  const { token } = useParams<{ token: string }>();
  const [event, setEvent] = useState<SosEventPublic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) { setError('Token inválido'); setLoading(false); return; }

    void (async () => {
      try {
        const { data, error: dbErr } = await supabase
          .from('sos_events')
          .select('id, lat, lon, accuracy_meters, status, message_text, sent_to_name, sent_via, created_at, token_expires_at')
          .eq('event_token', token)
          .maybeSingle();

        if (dbErr || !data) {
          setError('Esta alerta no existe o el enlace ha expirado.');
        } else {
          const isExpired = new Date(data.token_expires_at) < new Date();
          if (isExpired) {
            setError('Este enlace de emergencia ha expirado (24 horas).');
          } else {
            setEvent(data as SosEventPublic);
          }
        }
      } catch {
        setError('Error cargando la alerta.');
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: P.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Questrial, sans-serif' }}>
        <p style={{ color: P.softTeal, fontSize: 15 }}>Cargando alerta...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div style={{ minHeight: '100vh', background: P.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, fontFamily: 'Questrial, sans-serif', textAlign: 'center' }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: P.primary, marginBottom: 12 }}>Enlace no disponible</div>
        <div style={{ fontSize: 14, color: P.softTeal }}>{error}</div>
      </div>
    );
  }

  const mapsUrl = event.lat && event.lon
    ? `https://maps.google.com/?q=${event.lat},${event.lon}`
    : null;

  const isActive = ['sent', 'delivered'].includes(event.status);

  return (
    <div style={{ minHeight: '100vh', background: P.bg, fontFamily: 'Questrial, sans-serif', paddingBottom: 40 }}>

      {/* Header */}
      <div style={{
        background: `linear-gradient(160deg, ${P.danger} 0%, #922B21 100%)`,
        padding: '52px 24px 28px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase' }}>
          Alerta de Emergencia VIAZA
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>
          {STATUS_LABELS[event.status] ?? event.status}
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 6 }}>
          {new Date(event.created_at).toLocaleString('es-MX', {
            weekday: 'long', day: 'numeric', month: 'long',
            hour: '2-digit', minute: '2-digit',
          })}
        </div>
        {isActive && (
          <div style={{ marginTop: 12, display: 'inline-block', background: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: '4px 14px', fontSize: 12, color: '#fff' }}>
            Activa — expira en 24h desde el inicio
          </div>
        )}
      </div>

      <div style={{ padding: '24px 20px', maxWidth: 500, margin: '0 auto' }}>

        {/* Mensaje */}
        {event.message_text && (
          <div style={{ background: '#fff', borderRadius: 14, padding: '16px', marginBottom: 16, boxShadow: `0 2px 12px rgba(${P.rgb},0.07)` }}>
            <div style={{ fontSize: 12, color: P.softTeal, marginBottom: 6 }}>Mensaje de emergencia</div>
            <div style={{ fontSize: 15, color: P.primary }}>{event.message_text}</div>
          </div>
        )}

        {/* Ubicación */}
        {mapsUrl ? (
          <div style={{ background: '#fff', borderRadius: 14, padding: '16px', marginBottom: 16, boxShadow: `0 2px 12px rgba(${P.rgb},0.07)` }}>
            <div style={{ fontSize: 12, color: P.softTeal, marginBottom: 8 }}>Ultima ubicacion conocida</div>
            <div style={{ fontSize: 13, color: P.primary, marginBottom: 4, fontFamily: 'monospace' }}>
              {event.lat?.toFixed(6)}, {event.lon?.toFixed(6)}
            </div>
            {event.accuracy_meters && (
              <div style={{ fontSize: 11, color: P.softTeal, marginBottom: 12 }}>
                Precision: ~{Math.round(event.accuracy_meters)} metros
              </div>
            )}
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block', textAlign: 'center', padding: '12px', borderRadius: 10,
                background: P.secondary, color: '#fff', fontSize: 14, fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Ver en Google Maps
            </a>
          </div>
        ) : (
          <div style={{ background: `rgba(${P.rgb},0.05)`, borderRadius: 14, padding: '16px', marginBottom: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: P.softTeal }}>Ubicacion no disponible en esta alerta</div>
          </div>
        )}

        {/* Info adicional */}
        <div style={{ background: `rgba(${P.rgb},0.04)`, borderRadius: 12, padding: '14px 16px', fontSize: 13, color: P.primary }}>
          <div style={{ marginBottom: 6 }}>
            <span style={{ color: P.softTeal }}>Estado: </span>
            {STATUS_LABELS[event.status] ?? event.status}
          </div>
          {event.sent_to_name && (
            <div style={{ marginBottom: 6 }}>
              <span style={{ color: P.softTeal }}>Destinatario: </span>
              {event.sent_to_name}
            </div>
          )}
          {event.sent_via && event.sent_via !== 'manual' && (
            <div>
              <span style={{ color: P.softTeal }}>Enviado via: </span>
              {event.sent_via}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: 32, fontSize: 11, color: `rgba(${P.rgb},0.35)` }}>
          Alerta generada por VIAZA — Sistema operativo de viaje
        </div>
      </div>
    </div>
  );
}
