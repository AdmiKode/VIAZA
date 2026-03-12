import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { updatePassword } from '../../../services/authService';
import { supabase } from '../../../services/supabaseClient';

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
      <path d="M4 24s7-14 20-14 20 14 20 14-7 14-20 14S4 24 4 24z" fill="#EA9940" fillOpacity="0.85"/>
      <circle cx="24" cy="24" r="7" fill="rgba(18,33,46,0.55)"/>
      <circle cx="22" cy="22" r="3" fill="white" fillOpacity="0.5"/>
    </svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
      <path d="M4 24s7-14 20-14 20 14 20 14-7 14-20 14S4 24 4 24z" fill="rgba(18,33,46,0.25)"/>
      <line x1="8" y1="8" x2="40" y2="40" stroke="rgba(18,33,46,0.40)" strokeWidth="3.5" strokeLinecap="round"/>
    </svg>
  );
}

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [sessionReady, setSessionReady] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Supabase intercepts the token from the URL hash automatically.
  // We listen for PASSWORD_RECOVERY event to know the session is valid.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSessionReady(true);
      }
    });
    // Also check if session already exists (page reload after redirect)
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setSessionReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  function validate() {
    if (password.length < 8) return 'La contraseña debe tener al menos 8 caracteres';
    if (password !== confirm) return 'Las contraseñas no coinciden';
    return null;
  }

  async function handleSave() {
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    setError(null);
    setLoading(true);
    try {
      await updatePassword(password);
      setDone(true);
      setTimeout(() => navigate('/', { replace: true }), 2200);
    } catch (e) {
      setError((e as Error).message ?? 'Error al actualizar contraseña');
    } finally {
      setLoading(false);
    }
  }

  const strength = password.length === 0 ? 0 : password.length < 8 ? 1 : password.length < 12 ? 2 : 3;
  const strengthColor = ['transparent', '#c0392b', '#EA9940', '#6CA3A2'][strength];
  const strengthLabel = ['', 'Débil', 'Media', 'Fuerte'][strength];

  return (
    <div
      className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6"
      style={{ background: '#ECE7DC' }}
    >
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
          {/* Header */}
          <div className="mb-6 flex flex-col items-center gap-3">
            <div className="flex items-center justify-center rounded-full" style={{ width: 64, height: 64, background: '#ECE7DC', boxShadow: '6px 6px 16px rgba(18,33,46,0.13), -4px -4px 12px rgba(255,255,255,0.75)' }}>
              <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
                <rect x="10" y="22" width="28" height="22" rx="6" fill="#307082" fillOpacity="0.85"/>
                <rect x="10" y="22" width="28" height="11" rx="6" fill="rgba(180,192,200,0.35)"/>
                <path d="M16 22v-6a8 8 0 0 1 16 0v6" stroke="#12212E" strokeWidth="3" strokeLinecap="round" fill="none" strokeOpacity="0.50"/>
                <circle cx="24" cy="33" r="3" fill="rgba(255,255,255,0.60)"/>
              </svg>
            </div>
            <div style={{ color: '#12212E', fontSize: 22, fontWeight: 800, fontFamily: 'Questrial, sans-serif', textAlign: 'center' }}>
              Nueva contraseña
            </div>
            <div style={{ color: 'rgba(18,33,46,0.45)', fontSize: 13, fontFamily: 'Questrial, sans-serif', textAlign: 'center', lineHeight: 1.5 }}>
              Elige una contraseña segura para tu cuenta
            </div>
          </div>

          {/* Éxito */}
          {done && (
            <motion.div
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
              <div style={{ color: '#12212E', fontSize: 17, fontWeight: 700, fontFamily: 'Questrial, sans-serif' }}>¡Contraseña actualizada!</div>
              <div style={{ color: 'rgba(18,33,46,0.45)', fontSize: 13, fontFamily: 'Questrial, sans-serif' }}>Iniciando sesión…</div>
            </motion.div>
          )}

          {/* Sesión no lista aún */}
          {!done && !sessionReady && (
            <div className="flex flex-col items-center gap-3 py-8">
              <svg className="animate-spin" width="32" height="32" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="18" stroke="rgba(18,33,46,0.15)" strokeWidth="4"/><path d="M24 6a18 18 0 0 1 18 18" stroke="#307082" strokeWidth="4" strokeLinecap="round"/></svg>
              <div style={{ color: 'rgba(18,33,46,0.45)', fontSize: 13, fontFamily: 'Questrial, sans-serif' }}>Verificando enlace…</div>
            </div>
          )}

          {/* Form */}
          {!done && sessionReady && (
            <div className="space-y-4">
              {/* Nueva contraseña */}
              <div>
                <label style={{ display: 'block', color: 'rgba(18,33,46,0.55)', fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8, fontFamily: 'Questrial, sans-serif' }}>
                  Nueva contraseña
                </label>
                <div className="flex items-center gap-3 rounded-2xl px-4" style={{ height: 54, background: '#ECE7DC', boxShadow: 'inset 4px 4px 10px rgba(18,33,46,0.10), inset -3px -3px 8px rgba(255,255,255,0.75)' }}>
                  <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
                    <rect x="10" y="22" width="28" height="22" rx="6" fill="#EA9940" fillOpacity="0.80"/>
                    <rect x="10" y="22" width="28" height="11" rx="6" fill="rgba(180,192,200,0.45)"/>
                    <path d="M16 22v-6a8 8 0 0 1 16 0v6" stroke="#12212E" strokeWidth="3" strokeLinecap="round" fill="none" strokeOpacity="0.50"/>
                    <circle cx="24" cy="33" r="3" fill="rgba(255,255,255,0.60)"/>
                  </svg>
                  <input
                    type={showPass ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(null); }}
                    placeholder="Mínimo 8 caracteres"
                    style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 15, color: '#12212E', fontFamily: 'Questrial, sans-serif' }}
                  />
                  <button type="button" onClick={() => setShowPass((v) => !v)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
                    <EyeIcon open={showPass}/>
                  </button>
                </div>
                {/* Barra de fortaleza */}
                {password.length > 0 && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex gap-1 flex-1">
                      {[1, 2, 3].map((lvl) => (
                        <div key={lvl} className="h-1 flex-1 rounded-full transition-all" style={{ background: strength >= lvl ? strengthColor : 'rgba(18,33,46,0.10)' }}/>
                      ))}
                    </div>
                    <span style={{ fontSize: 11, color: strengthColor, fontWeight: 700, fontFamily: 'Questrial, sans-serif' }}>{strengthLabel}</span>
                  </div>
                )}
              </div>

              {/* Confirmar */}
              <div>
                <label style={{ display: 'block', color: 'rgba(18,33,46,0.55)', fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8, fontFamily: 'Questrial, sans-serif' }}>
                  Confirmar contraseña
                </label>
                <div className="flex items-center gap-3 rounded-2xl px-4" style={{ height: 54, background: '#ECE7DC', boxShadow: 'inset 4px 4px 10px rgba(18,33,46,0.10), inset -3px -3px 8px rgba(255,255,255,0.75)', border: confirm && confirm !== password ? '1px solid rgba(192,57,43,0.35)' : '1px solid transparent' }}>
                  <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
                    <rect x="10" y="22" width="28" height="22" rx="6" fill="#6CA3A2" fillOpacity="0.80"/>
                    <rect x="10" y="22" width="28" height="11" rx="6" fill="rgba(180,192,200,0.45)"/>
                    <path d="M16 22v-6a8 8 0 0 1 16 0v6" stroke="#12212E" strokeWidth="3" strokeLinecap="round" fill="none" strokeOpacity="0.50"/>
                    <circle cx="24" cy="33" r="3" fill="rgba(255,255,255,0.60)"/>
                  </svg>
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={confirm}
                    onChange={(e) => { setConfirm(e.target.value); setError(null); }}
                    onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                    placeholder="Repite la contraseña"
                    style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 15, color: '#12212E', fontFamily: 'Questrial, sans-serif' }}
                  />
                  <button type="button" onClick={() => setShowConfirm((v) => !v)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
                    <EyeIcon open={showConfirm}/>
                  </button>
                </div>
                {confirm && confirm !== password && (
                  <div style={{ color: '#c0392b', fontSize: 12, marginTop: 6, fontFamily: 'Questrial, sans-serif' }}>Las contraseñas no coinciden</div>
                )}
              </div>

              {/* Error */}
              {error && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl px-4 py-3" style={{ background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.20)' }}>
                  <span style={{ color: '#c0392b', fontSize: 13, fontFamily: 'Questrial, sans-serif' }}>{error}</span>
                </motion.div>
              )}

              {/* CTA */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={handleSave}
                disabled={loading || password.length < 8 || password !== confirm}
                style={{
                  width: '100%', height: 58, borderRadius: 18,
                  background: !loading && password.length >= 8 && password === confirm ? '#EA9940' : 'rgba(18,33,46,0.15)',
                  color: !loading && password.length >= 8 && password === confirm ? 'white' : 'rgba(18,33,46,0.30)',
                  fontSize: 17, fontWeight: 700, fontFamily: 'Questrial, sans-serif',
                  boxShadow: !loading && password.length >= 8 && password === confirm ? '0 8px 24px rgba(234,153,64,0.38)' : 'none',
                  border: 'none', cursor: !loading && password.length >= 8 && password === confirm ? 'pointer' : 'default',
                  transition: 'all 0.25s ease', marginTop: 8,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin" width="18" height="18" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="18" stroke="rgba(18,33,46,0.20)" strokeWidth="4"/><path d="M24 6a18 18 0 0 1 18 18" stroke="rgba(18,33,46,0.40)" strokeWidth="4" strokeLinecap="round"/></svg>
                    Guardando…
                  </>
                ) : '🔒 Guardar nueva contraseña'}
              </motion.button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
