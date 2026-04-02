import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppStore } from '../../../app/store/useAppStore';
import { signIn, signInWithGoogle, signInWithApple } from '../../../services/authService';

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
      <path d="M4 24s7-14 20-14 20 14 20 14-7 14-20 14S4 24 4 24z"
        fill="#EA9940" fillOpacity="0.85" />
      <path d="M4 24s7-14 20-14c5 0 10 2 14 5"
        fill="rgba(180,192,200,0.45)" />
      <circle cx="24" cy="24" r="7" fill="rgba(18,33,46,0.55)" />
      <circle cx="22" cy="22" r="3" fill="white" fillOpacity="0.5" />
    </svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
      <path d="M4 24s7-14 20-14 20 14 20 14-7 14-20 14S4 24 4 24z"
        fill="rgba(18,33,46,0.25)" />
      <line x1="8" y1="8" x2="40" y2="40"
        stroke="rgba(18,33,46,0.40)" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}

export function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setSupabaseUser = useAppStore((s) => s.setSupabaseUser);
  const onboardingCompleted = useAppStore((s) => s.onboardingCompleted);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | 'apple' | null>(null);

  // Siempre resetear socialLoading al montar — si el usuario volvió del OAuth
  // el componente se remonta y los botones deben estar desbloqueados
  useEffect(() => {
    setSocialLoading(null);
    setError(null);
  }, []);

  async function handleSocialLogin(provider: 'google' | 'apple') {
    setSocialLoading(provider);
    setError(null);
    try {
      if (provider === 'google') await signInWithGoogle();
      else await signInWithApple();
      // El onAuthStateChange en AppProviders captura la sesión al volver del redirect
    } catch {
      setError(t('auth.login.error'));
      setSocialLoading(null);
    }
  }

  async function handleLogin() {
    if (!email.trim() || !password) return;
    setError(null);
    setLoading(true);
    try {
      const user = await signIn({ email, password });
      setSupabaseUser(user);
      // Pequeño delay para que el store se actualice antes de navegar
      await new Promise((r) => setTimeout(r, 100));
      navigate(onboardingCompleted ? '/home' : '/onboarding', { replace: true });
    } catch {
      setError(t('auth.login.error'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6"
      style={{ background: '#ECE7DC' }}
    >
      {/* Círculo decorativo fondo crema */}
      <div
        className="pointer-events-none absolute -top-28 -right-28"
        style={{
          width: 340,
          height: 340,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(48,112,130,0.12) 0%, transparent 65%)',
        }}
      />
      <div
        className="pointer-events-none absolute -bottom-24 -left-20"
        style={{
          width: 280,
          height: 280,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(234,153,64,0.10) 0%, transparent 65%)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-sm"
      >
        {/* ── Card principal elevada ── */}
        <div
          className="rounded-[32px] px-7 py-8"
          style={{
            background: '#ECE7DC',
            boxShadow:
              '12px 12px 28px rgba(18,33,46,0.14), -8px -8px 20px rgba(255,255,255,0.72)',
          }}
        >
          {/* Logo + marca */}
          <div className="mb-8 flex flex-col items-center gap-2">
            <img
              src="/brand/logo-blue.png"
              alt="VIAZA"
              style={{ height: 110, width: 'auto' }}
            />
            <div style={{
              color: 'rgba(18,33,46,0.45)',
              fontSize: 13,
              fontFamily: 'Questrial, sans-serif',
              marginTop: -4,
            }}>
              {t('auth.login.subtitle')}
            </div>
          </div>

          {/* ── Botones de login social ── */}
          <div className="space-y-3 mb-6">
            {/* Google */}
            <button
              type="button"
              onClick={() => handleSocialLogin('google')}
              disabled={socialLoading !== null || loading}
              style={{
                width: '100%',
                height: 54,
                borderRadius: 16,
                background: '#ECE7DC',
                boxShadow: '6px 6px 14px rgba(18,33,46,0.12), -4px -4px 10px rgba(255,255,255,0.75)',
                border: 'none',
                cursor: socialLoading !== null ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                fontSize: 15,
                fontWeight: 700,
                fontFamily: 'Questrial, sans-serif',
                color: '#12212E',
                opacity: socialLoading !== null ? 0.6 : 1,
                transition: 'all 0.2s ease',
              }}
            >
              {socialLoading === 'google' ? (
                <span style={{ fontSize: 13, color: 'rgba(18,33,46,0.50)' }}>...</span>
              ) : (
                <>
                  {/* Google logo */}
                  <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
                    <path d="M44.5 20H24v8.5h11.8C34.3 33.6 29.6 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6-6C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.6 20-21 0-1.4-.1-2.7-.5-4z" fill="#FFC107"/>
                    <path d="M6.3 14.7l7 5.1C15.1 16.1 19.2 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6-6C34.6 5.1 29.6 3 24 3c-7.7 0-14.4 4.4-17.7 11.7z" fill="#FF3D00"/>
                    <path d="M24 45c5.5 0 10.4-1.9 14.2-5.1l-6.6-5.4C29.6 36 26.9 37 24 37c-5.6 0-10.3-3.4-11.8-8.2l-7 5.4C8.2 41.1 15.5 45 24 45z" fill="#4CAF50"/>
                    <path d="M44.5 20H24v8.5h11.8c-.7 2.1-2 3.9-3.8 5.1l6.6 5.4C42.1 36 45 30.5 45 24c0-1.4-.1-2.7-.5-4z" fill="#1976D2"/>
                  </svg>
                  {t('auth.login.continueWithGoogle')}
                </>
              )}
            </button>

            {/* Apple */}
            <button
              type="button"
              onClick={() => handleSocialLogin('apple')}
              disabled={socialLoading !== null || loading}
              style={{
                width: '100%',
                height: 54,
                borderRadius: 16,
                background: '#12212E',
                boxShadow: '6px 6px 14px rgba(18,33,46,0.25), -2px -2px 8px rgba(255,255,255,0.10)',
                border: 'none',
                cursor: socialLoading !== null ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                fontSize: 15,
                fontWeight: 700,
                fontFamily: 'Questrial, sans-serif',
                color: 'white',
                opacity: socialLoading !== null ? 0.6 : 1,
                transition: 'all 0.2s ease',
              }}
            >
              {socialLoading === 'apple' ? (
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.50)' }}>...</span>
              ) : (
                <>
                  {/* Apple logo */}
                  <svg width="18" height="22" viewBox="0 0 814 1000" fill="white">
                    <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-42.3-150.3-109.8c-62.3-90.4-112.4-230.5-112.4-363.5 0-230.3 149.8-352.1 297.1-352.1 78.3 0 143.4 51.6 192.3 51.6 46.4 0 119.1-54.7 208.6-54.7zm-167.5-157.8c-10.3 47.3-37.4 93.3-73.9 124.1-36.1 30.8-79.7 51.2-123.9 51.2-5.6 0-11.1-.4-16.7-1.4.4-48.6 20.6-96.5 55.4-131.7 36.1-37 96.4-64.5 158.5-71.1.6 9.7.6 19.4.6 28.9z"/>
                  </svg>
                  {t('auth.login.continueWithApple')}
                </>
              )}
            </button>
          </div>

          {/* ── Separador ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(18,33,46,0.12)' }} />
            <span style={{ fontSize: 12, color: 'rgba(18,33,46,0.35)', fontFamily: 'Questrial, sans-serif', fontWeight: 600, letterSpacing: 1 }}>
              {t('auth.login.orWithEmail')}
            </span>
            <div style={{ flex: 1, height: 1, background: 'rgba(18,33,46,0.12)' }} />
          </div>

          {/* ── Campo email ── */}
          <div className="space-y-4">
            <div>
              <label style={{
                display: 'block',
                color: 'rgba(18,33,46,0.55)',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 1.2,
                textTransform: 'uppercase',
                marginBottom: 8,
                fontFamily: 'Questrial, sans-serif',
              }}>
                {t('auth.email')}
              </label>
              <div
                className="flex items-center gap-3 rounded-2xl px-4"
                style={{
                  height: 54,
                  background: '#ECE7DC',
                  boxShadow:
                    'inset 4px 4px 10px rgba(18,33,46,0.10), inset -3px -3px 8px rgba(255,255,255,0.75)',
                }}
              >
                {/* ícono email duotone */}
                <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
                  <rect x="4" y="10" width="40" height="28" rx="7" fill="#EA9940" fillOpacity="0.80" />
                  <rect x="4" y="10" width="40" height="14" rx="7" fill="rgba(180,192,200,0.45)" />
                  <path d="M4 14l20 14 20-14" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                </svg>
                <input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    fontSize: 15,
                    color: '#12212E',
                    fontFamily: 'Questrial, sans-serif',
                  }}
                />
              </div>
            </div>

            {/* ── Campo password ── */}
            <div>
              <label style={{
                display: 'block',
                color: 'rgba(18,33,46,0.55)',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 1.2,
                textTransform: 'uppercase',
                marginBottom: 8,
                fontFamily: 'Questrial, sans-serif',
              }}>
                {t('auth.password')}
              </label>
              <div
                className="flex items-center gap-3 rounded-2xl px-4"
                style={{
                  height: 54,
                  background: '#ECE7DC',
                  boxShadow:
                    'inset 4px 4px 10px rgba(18,33,46,0.10), inset -3px -3px 8px rgba(255,255,255,0.75)',
                }}
              >
                {/* ícono candado duotone */}
                <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
                  <rect x="10" y="22" width="28" height="22" rx="6" fill="#EA9940" fillOpacity="0.80" />
                  <rect x="10" y="22" width="28" height="11" rx="6" fill="rgba(180,192,200,0.45)" />
                  <path d="M16 22v-6a8 8 0 0 1 16 0v6"
                    stroke="#12212E" strokeWidth="3" strokeLinecap="round" fill="none" strokeOpacity="0.50" />
                  <circle cx="24" cy="33" r="3" fill="rgba(255,255,255,0.60)" />
                </svg>
                <input
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    fontSize: 15,
                    color: '#12212E',
                    fontFamily: 'Questrial, sans-serif',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                >
                  <EyeIcon open={showPass} />
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl px-4 py-3"
                style={{
                  background: 'rgba(234,153,64,0.12)',
                  border: '1px solid rgba(234,153,64,0.30)',
                }}
              >
                <span style={{ color: '#EA9940', fontSize: 13, fontFamily: 'Questrial, sans-serif' }}>
                  {error}
                </span>
              </motion.div>
            )}

            {/* ── CTA Login ── */}
            <button
              type="button"
              onClick={handleLogin}
              disabled={!email.trim() || !password || loading}
              style={{
                width: '100%',
                height: 58,
                borderRadius: 18,
                background: email.trim() && password ? '#EA9940' : 'rgba(18,33,46,0.15)',
                color: email.trim() && password ? 'white' : 'rgba(18,33,46,0.30)',
                fontSize: 17,
                fontWeight: 700,
                fontFamily: 'Questrial, sans-serif',
                boxShadow: email.trim() && password
                  ? '0 8px 24px rgba(234,153,64,0.38), 4px 4px 12px rgba(18,33,46,0.10)'
                  : 'none',
                border: 'none',
                cursor: email.trim() && password ? 'pointer' : 'default',
                transition: 'all 0.25s ease',
                marginTop: 8,
              }}
            >
              {loading ? '...' : t('auth.login.cta')}
            </button>
          </div>

          {/* Olvidé contraseña */}
          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={() => navigate('/auth/forgot-password')}
              style={{
                background: 'none',
                border: 'none',
                color: '#307082',
                fontSize: 13,
                fontFamily: 'Questrial, sans-serif',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              {t('auth.login.forgotPassword')}
            </button>
          </div>
        </div>

        {/* ── Crear cuenta — fuera de la card ── */}
        <div className="mt-6 text-center">
          <span style={{ color: 'rgba(18,33,46,0.50)', fontSize: 14, fontFamily: 'Questrial, sans-serif' }}>
            {t('auth.login.noAccount')}{' '}
          </span>
          <Link
            to="/auth/register"
            style={{
              color: '#307082',
              fontSize: 14,
              fontWeight: 700,
              fontFamily: 'Questrial, sans-serif',
            }}
          >
            {t('auth.login.toRegister')}
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
