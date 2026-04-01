/**
 * AuthCallbackPage.tsx
 * Maneja el redirect de OAuth (Google/Apple) después de que Supabase
 * redirige a https://appviaza.com/auth/callback
 * Supabase incluye el token en el hash de la URL (#access_token=...&type=recovery|signup)
 */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../services/supabaseClient';
import { useAppStore } from '../../../app/store/useAppStore';

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const setSupabaseUser = useAppStore((s) => s.setSupabaseUser);
  const onboardingCompleted = useAppStore((s) => s.onboardingCompleted);

  useEffect(() => {
    // Supabase lee el hash automáticamente y establece la sesión
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        setSupabaseUser({
          id: data.session.user.id,
          email: data.session.user.email ?? '',
          name: data.session.user.user_metadata?.full_name ?? '',
        });
        navigate(onboardingCompleted ? '/home' : '/onboarding', { replace: true });
      } else {
        // Si no hay sesión, esperar el evento onAuthStateChange
        const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
          if (session?.user) {
            setSupabaseUser({
              id: session.user.id,
              email: session.user.email ?? '',
              name: session.user.user_metadata?.full_name ?? '',
            });
            listener.subscription.unsubscribe();
            navigate(onboardingCompleted ? '/home' : '/onboarding', { replace: true });
          } else if (event === 'SIGNED_OUT') {
            listener.subscription.unsubscribe();
            navigate('/auth/login', { replace: true });
          }
        });
        // Timeout de seguridad — si en 8 seg no hay sesión, volver al login
        setTimeout(() => {
          listener.subscription.unsubscribe();
          navigate('/auth/login', { replace: true });
        }, 8000);
      }
    });
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#12212E',
      flexDirection: 'column',
      gap: '16px',
    }}>
      <div style={{
        width: 40,
        height: 40,
        border: '3px solid #EA9940',
        borderTop: '3px solid transparent',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ color: '#ffffff', fontSize: '14px', opacity: 0.7 }}>Iniciando sesión...</p>
    </div>
  );
}
