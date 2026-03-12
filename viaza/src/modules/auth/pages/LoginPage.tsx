import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppStore } from '../../../app/store/useAppStore';
import { signIn } from '../../../services/authService';

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

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password) return;
    setError(null);
    setLoading(true);
    try {
      const user = await signIn({ email, password });
      setSupabaseUser(user);
      navigate('/', { replace: true });
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
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(18,33,46,0.45)',
                fontSize: 13,
                fontFamily: 'Questrial, sans-serif',
                cursor: 'pointer',
              }}
            >
              {t('auth.login.forgotPassword', '¿Olvidaste tu contraseña?')}
            </button>
          </div>
        </div>

        {/* ── Crear cuenta — fuera de la card ── */}
        <div className="mt-6 text-center">
          <span style={{ color: 'rgba(18,33,46,0.50)', fontSize: 14, fontFamily: 'Questrial, sans-serif' }}>
            {t('auth.login.noAccount', '¿No tienes cuenta?')}{' '}
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
