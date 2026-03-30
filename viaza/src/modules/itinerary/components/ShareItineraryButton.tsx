/**
 * ShareItineraryButton — generates and copies a share link for the itinerary.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { generateShareLink, revokeShareLink } from '../../../services/itinerarySharingService';

interface ShareItineraryButtonProps {
  tripId: string;
  existingToken?: string | null;
}

export function ShareItineraryButton({ tripId, existingToken }: ShareItineraryButtonProps) {
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(existingToken ?? null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const shareUrl = token ? `${window.location.origin}/itinerary/shared/${token}` : null;

  async function handleShare() {
    setLoading(true);
    setError('');
    try {
      const result = await generateShareLink(tripId);
      setToken(result.token);
      await copyToClipboard(`${window.location.origin}${result.url}`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!shareUrl) return;
    await copyToClipboard(shareUrl);
  }

  async function handleRevoke() {
    setLoading(true);
    setError('');
    try {
      await revokeShareLink(tripId);
      setToken(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {/* ignore */}
  }

  return (
    <div className="rounded-2xl px-4 py-4" style={{ background: 'white', boxShadow: '0 2px 12px rgba(18,33,46,0.08)' }}>
      <div style={{ color: '#12212E', fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
        Compartir itinerario
      </div>

      {!token ? (
        <div>
          <div style={{ color: 'rgba(18,33,46,0.50)', fontSize: 12, lineHeight: 1.5, marginBottom: 10 }}>
            Genera un enlace de solo lectura para compartir con tu grupo de viaje.
          </div>
          <motion.button
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={handleShare}
            disabled={loading}
            className="w-full rounded-2xl py-3 font-bold text-sm flex items-center justify-center gap-2"
            style={{
              background: loading ? 'rgba(48,112,130,0.10)' : '#307082',
              color: loading ? 'rgba(18,33,46,0.45)' : 'white',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'Questrial, sans-serif',
            }}
          >
            {loading ? (
              <>
                <svg className="animate-spin" width="14" height="14" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="18" stroke="rgba(18,33,46,0.20)" strokeWidth="4"/><path d="M24 6a18 18 0 0 1 18 18" stroke="#307082" strokeWidth="4" strokeLinecap="round"/></svg>
                Generando enlace…
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Generar enlace de acceso
              </>
            )}
          </motion.button>
        </div>
      ) : (
        <div>
          <div
            className="rounded-xl px-3 py-2.5 mb-3 flex items-center gap-2"
            style={{ background: 'rgba(48,112,130,0.06)', overflow: 'hidden' }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
              <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" stroke="#307082" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" stroke="#307082" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div style={{ fontSize: 11, color: '#307082', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
              {shareUrl}
            </div>
          </div>

          <div className="flex gap-2">
            <motion.button
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={handleCopy}
              className="flex-1 rounded-xl py-2.5 font-bold text-xs flex items-center justify-center gap-1.5"
              style={{
                background: copied ? 'rgba(108,163,162,0.15)' : '#307082',
                color: copied ? '#6CA3A2' : 'white',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'Questrial, sans-serif',
              }}
            >
              {copied ? (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#6CA3A2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Copiado
                </>
              ) : (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <rect x="9" y="9" width="13" height="13" rx="2" stroke="white" strokeWidth="2"/>
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="white" strokeWidth="2"/>
                  </svg>
                  Copiar enlace
                </>
              )}
            </motion.button>

            <button
              type="button"
              onClick={handleRevoke}
              disabled={loading}
              className="rounded-xl py-2.5 px-3 text-xs font-bold"
              style={{
                background: 'rgba(18,33,46,0.06)',
                color: '#12212E',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'Questrial, sans-serif',
                opacity: loading ? 0.5 : 1,
              }}
            >
              Revocar
            </button>
          </div>
        </div>
      )}

      {error && (
        <div style={{ fontSize: 11, color: '#EA9940', marginTop: 6 }}>{error}</div>
      )}
    </div>
  );
}
