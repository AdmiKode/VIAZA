import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  fullHeight?: boolean;
}

export function ModalSheet({ open, onClose, title, children, fullHeight }: ModalSheetProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(18,33,46,0.45)',
              backdropFilter: 'blur(4px)',
              zIndex: 100,
            }}
          />
          {/* Sheet */}
          <motion.div
            key="sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              maxHeight: fullHeight ? '92vh' : '82vh',
              background: 'rgba(255,255,255,0.72)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.45)',
              borderRadius: '24px 24px 0 0',
              boxShadow: '0 -8px 32px rgba(18,33,46,0.13)',
              zIndex: 101,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Handle */}
            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12 }}>
              <div style={{
                width: 36, height: 4,
                background: 'rgba(18,33,46,0.18)',
                borderRadius: 9999,
              }} />
            </div>
            {/* Header */}
            {title && (
              <div style={{
                padding: '12px 20px 8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <span style={{
                  fontFamily: 'Questrial, sans-serif',
                  fontWeight: 700,
                  fontSize: 18,
                  color: '#12212E',
                }}>
                  {title}
                </span>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    background: 'rgba(18,33,46,0.07)',
                    border: 'none',
                    borderRadius: 9999,
                    width: 32,
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M6 6l12 12M18 6L6 18" stroke="#12212E" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            )}
            {/* Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0 32px' }}>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
