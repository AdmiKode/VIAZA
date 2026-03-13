import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import type { EmergencyProfile } from '../../../types/emergency';
import { regenerateEmergencyToken } from '../../../services/emergencyService';

const C = {
  dark: '#12212E',
  cream: '#ECE7DC',
  accent: '#EA9940',
  teal: '#307082',
  red: '#c0392b',
};

interface Props {
  profile: EmergencyProfile;
  onClose: () => void;
  onTokenRegenerated: (newToken: string) => void;
}

export function EmergencyQRModal({ profile, onClose, onTokenRegenerated }: Props) {
  const [regenerating, setRegenerating] = useState(false);
  const [confirmRegen, setConfirmRegen] = useState(false);
  const [copied, setCopied] = useState(false);

  const publicUrl = `https://appviaza.com/emergency/${profile.public_token}`;

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      await navigator.share({ title: 'Mi tarjeta de emergencia VIAZA', url: publicUrl });
    } else {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  }, [publicUrl]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  }, [publicUrl]);

  const handleRegenerate = useCallback(async () => {
    if (!confirmRegen) { setConfirmRegen(true); return; }
    setRegenerating(true);
    try {
      const newToken = await regenerateEmergencyToken();
      onTokenRegenerated(newToken);
      setConfirmRegen(false);
    } finally {
      setRegenerating(false);
    }
  }, [confirmRegen, onTokenRegenerated]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(18,33,46,0.82)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        }}
      >
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 30 }}
          onClick={e => e.stopPropagation()}
          style={{
            width: '100%', maxWidth: 480,
            background: C.cream, borderRadius: '28px 28px 0 0',
            padding: '32px 24px 48px',
            fontFamily: 'Questrial, sans-serif',
          }}
        >
          {/* Handle */}
          <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(18,33,46,0.15)', margin: '0 auto 24px' }}/>

          {/* Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: C.red, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L13.09 8.26L19 7L15.45 12L19 17L13.09 15.74L12 22L10.91 15.74L5 17L8.55 12L5 7L10.91 8.26L12 2Z" fill="white"/>
              </svg>
            </div>
            <div>
              <div style={{ color: C.dark, fontSize: 17, fontWeight: 800 }}>Emergency Travel Card</div>
              <div style={{ color: 'rgba(18,33,46,0.5)', fontSize: 12 }}>Scan in case of emergency</div>
            </div>
          </div>

          {/* QR */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <div style={{
              padding: 20, background: 'white', borderRadius: 20,
              boxShadow: '0 8px 32px rgba(18,33,46,0.12)',
              border: `3px solid ${C.red}`,
            }}>
              <QRCodeSVG
                value={publicUrl}
                size={220}
                level="H"
                fgColor={C.dark}
                bgColor="white"
                imageSettings={{
                  src: '/brand/logo-white.png',
                  height: 36,
                  width: 36,
                  excavate: true,
                }}
              />
            </div>
          </div>

          {/* URL */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ color: 'rgba(18,33,46,0.4)', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>URL pública</div>
            <div style={{ color: C.teal, fontSize: 12, fontWeight: 600, wordBreak: 'break-all' }}>{publicUrl}</div>
          </div>

          {/* Acciones */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button onClick={handleShare} style={btnStyle(C.accent, 'white')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
              {copied ? '¡Copiado!' : 'Compartir / Copiar enlace'}
            </button>

            <button onClick={handleCopy} style={btnStyle('white', C.dark, true)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
              Copiar URL
            </button>

            <button
              onClick={handleRegenerate}
              disabled={regenerating}
              style={btnStyle(confirmRegen ? C.red : 'rgba(18,33,46,0.08)', confirmRegen ? 'white' : C.dark)}
            >
              {regenerating ? 'Regenerando...' : confirmRegen ? 'Confirmar — el QR anterior quedará inválido' : 'Regenerar QR'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function btnStyle(bg: string, color: string, border = false): React.CSSProperties {
  return {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    background: bg, color, border: border ? '1.5px solid rgba(18,33,46,0.15)' : 'none',
    borderRadius: 14, padding: '14px 20px', fontWeight: 700, fontSize: 15,
    cursor: 'pointer', fontFamily: 'Questrial, sans-serif', width: '100%',
    boxShadow: bg === '#EA9940' ? '0 4px 16px rgba(234,153,64,0.35)' : 'none',
  };
}
