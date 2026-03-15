import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { resetPassword } from '../../../services/authService';

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSend() {
    if (!email.trim()) return;
    setError(null);
    setLoading(true);
    try {
      await resetPassword(email.trim());
      setSent(true);
    } catch (e) {
      setError((e as Error).message ?? t('auth.forgot.errorSend'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6"
      style={{ background: '#ECE7DC' }}
    >
      {/* Círculos decorativos */}
      <div className="pointer-events-none absolute -top-28 -right-28" style={{ width: 340, height: 340, borderRadius: '50%', background: 'radial-gradient(circle, rgba(48,112,130,0.12) 0%, transparent 65%)' }}/>
      <div className="pointer-events-none absolute -bottom-24 -left-20" style={{ width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(234,153,64,0.10) 0%, transparent 65%)' }}/>

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-sm"
      >
        <div
          className="rounded-[32px] px-7 py-8"
          style={{ background: '#ECE7DC', boxShadow: '12px 12px 28px rgba(18,33,46,0.14), -8px -8px 20px rgba(255,255,255,0.72)' }}
        >
          {/* Icono */}
          <div className="mb-6 flex flex-col items-center gap-3">
            <div className="flex items-center justify-center rounded-full" style={{ width: 64, height: 64, background: '#ECE7DC', boxShadow: '6px 6px 16px rgba(18,33,46,0.13), -4px -4px 12px rgba(255,255,255,0.75)' }}>
              <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
                <rect x="4" y="10" width="40" height="28" rx="7" fill="#307082" fillOpacity="0.85"/>
                <rect x="4" y="10" width="40" height="14" rx="7" fill="rgba(180,192,200,0.35)"/>
                <path d="M4 14l20 14 20-14" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                <circle cx="36" cy="32" r="9" fill="#EA9940"/>
                <path d="M36 28v4.5l3 3" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div style={{ color: '#12212E', fontSize: 22, fontWeight: 800, fontFamily: 'Questrial, sans-serif', textAlign: 'center' }}>
              {t('auth.forgot.title')}
            </div>
            <div style={{ color: 'rgba(18,33,46,0.45)', fontSize: 13, fontFamily: 'Questrial, sans-serif', textAlign: 'center', lineHeight: 1.5 }}>
              {t('auth.forgot.subtitle')}
            </div>
          </div>

          {/* Estado éxito */}
          <AnimatePresence mode="wait">
            {sent ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-4 py-4"
              >
                <div className="flex items-center justify-center rounded-full" style={{ width: 72, height: 72, background: 'rgba(108,163,162,0.15)' }}>
                  <svg width="34" height="34" viewBox="0 0 48 48" fill="none">
                    <circle cx="24" cy="24" r="20" fill="#6CA3A2" fillOpacity="0.20"/>
                    <path d="M13 24l8 8 14-16" stroke="#307082" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div style={{ color: '#12212E', fontSize: 17, fontWeight: 700, fontFamily: 'Questrial, sans-serif', textAlign: 'center' }}>
                  {t('auth.forgot.sent.title')}
                </div>
                <div style={{ color: 'rgba(18,33,46,0.50)', fontSize: 13, fontFamily: 'Questrial, sans-serif', textAlign: 'center', lineHeight: 1.55 }}>
                  {t('auth.forgot.sent.body', { email })}
                </div>
                <div style={{ color: 'rgba(18,33,46,0.35)', fontSize: 12, fontFamily: 'Questrial, sans-serif', textAlign: 'center' }}>
                  {t('auth.forgot.sent.hint')}
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/auth/login')}
                  style={{ marginTop: 8, width: '100%', height: 54, borderRadius: 16, background: '#12212E', color: 'white', fontSize: 15, fontWeight: 700, fontFamily: 'Questrial, sans-serif', border: 'none', cursor: 'pointer', boxShadow: '0 6px 20px rgba(18,33,46,0.25)' }}
                >
                  {t('auth.forgot.back')}
                </button>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                {/* Campo email */}
                <div>
                  <label style={{ display: 'block', color: 'rgba(18,33,46,0.55)', fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8, fontFamily: 'Questrial, sans-serif' }}>
                    {t('auth.forgot.emailLabel')}
                  </label>
                  <div className="flex items-center gap-3 rounded-2xl px-4" style={{ height: 54, background: '#ECE7DC', boxShadow: 'inset 4px 4px 10px rgba(18,33,46,0.10), inset -3px -3px 8px rgba(255,255,255,0.75)' }}>
                    <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
                      <rect x="4" y="10" width="40" height="28" rx="7" fill="#EA9940" fillOpacity="0.80"/>
                      <rect x="4" y="10" width="40" height="14" rx="7" fill="rgba(180,192,200,0.45)"/>
                      <path d="M4 14l20 14 20-14" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                    </svg>
                    <input
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(null); }}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      placeholder={t('auth.forgot.emailPlaceholder')}
                      style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 15, color: '#12212E', fontFamily: 'Questrial, sans-serif' }}
                    />
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl px-4 py-3" style={{ background: 'rgba(234,153,64,0.12)', border: '1px solid rgba(234,153,64,0.30)' }}>
                    <span style={{ color: '#12212E', fontSize: 13, fontFamily: 'Questrial, sans-serif' }}>{error}</span>
                  </motion.div>
                )}

                {/* CTA */}
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={handleSend}
                  disabled={!email.trim() || loading}
                  style={{
                    width: '100%', height: 58, borderRadius: 18,
                    background: email.trim() && !loading ? '#EA9940' : 'rgba(18,33,46,0.15)',
                    color: email.trim() && !loading ? 'white' : 'rgba(18,33,46,0.30)',
                    fontSize: 17, fontWeight: 700, fontFamily: 'Questrial, sans-serif',
                    boxShadow: email.trim() && !loading ? '0 8px 24px rgba(234,153,64,0.38)' : 'none',
                    border: 'none', cursor: email.trim() && !loading ? 'pointer' : 'default',
                    transition: 'all 0.25s ease', marginTop: 8,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  }}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin" width="18" height="18" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="18" stroke="rgba(18,33,46,0.20)" strokeWidth="4"/><path d="M24 6a18 18 0 0 1 18 18" stroke="rgba(18,33,46,0.40)" strokeWidth="4" strokeLinecap="round"/></svg>
                      {t('auth.forgot.sending')}
                    </>
                  ) : t('auth.forgot.cta')}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Volver */}
        {!sent && (
          <div className="mt-5 text-center">
            <button type="button" onClick={() => navigate('/auth/login')} style={{ background: 'none', border: 'none', color: 'rgba(18,33,46,0.50)', fontSize: 14, fontFamily: 'Questrial, sans-serif', cursor: 'pointer' }}>
              {t('auth.forgot.back')}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
