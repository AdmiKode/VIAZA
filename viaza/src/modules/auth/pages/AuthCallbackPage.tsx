/**
 * AuthCallbackPage.tsx
 * Procesa el callback OAuth de Supabase en Capacitor nativo.
 * El deep link viaza://auth/callback#access_token=... llega via App plugin.
 */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { supabase } from '../../../services/supabaseClient';
import { useAppStore } from '../../../app/store/useAppStore';

function extractTokensFromUrl(url: string): { access_token?: string; refresh_token?: string } {
  try {
    // El token puede venir en el hash o en query params
    const hashPart = url.includes('#') ? url.split('#')[1] : url.split('?')[1] ?? '';
    const params = new URLSearchParams(hashPart);
    return {
      access_token: params.get('access_token') ?? undefined,
      refresh_token: params.get('refresh_token') ?? undefined,
    };
  } catch {
    return {};
  }
}

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const setSupabaseUser = useAppStore((s) => s.setSupabaseUser);
  const onboardingCompleted = useAppStore((s) => s.onboardingCompleted);

  async function processSession(url?: string) {
    try {
      // Intentar extraer tokens del URL del deep link
      if (url) {
        const { access_token, refresh_token } = extractTokensFromUrl(url);
        if (access_token) {
          const { data, error } = await supabase.auth.setSession({
            access_token,
            refresh_token: refresh_token ?? access_token,
          });
          if (!error && data.session?.user) {
            setSupabaseUser({
              id: data.session.user.id,
              email: data.session.user.email ?? '',
              name: data.session.user.user_metadata?.full_name ?? '',
            });
            navigate(onboardingCompleted ? '/home' : '/onboarding', { replace: true });
            return;
          }
        }
      }

      // Fallback: verificar si ya hay sesión activa
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        setSupabaseUser({
          id: data.session.user.id,
          email: data.session.user.email ?? '',
          name: data.session.user.user_metadata?.full_name ?? '',
        });
        navigate(onboardingCompleted ? '/home' : '/onboarding', { replace: true });
        return;
      }

      // Esperar evento de auth
      const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
          setSupabaseUser({
            id: session.user.id,
            email: session.user.email ?? '',
            name: session.user.user_metadata?.full_name ?? '',
          });
          listener.subscription.unsubscribe();
          navigate(onboardingCompleted ? '/home' : '/onboarding', { replace: true });
        }
      });

      // Timeout 10s
      setTimeout(() => {
        listener.subscription.unsubscribe();
        navigate('/auth/login', { replace: true });
      }, 10000);

    } catch {
      navigate('/auth/login', { replace: true });
    }
  }

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      // En nativo, leer el URL del deep link que abrió la app
      App.getLaunchUrl().then((result) => {
        processSession(result?.url ?? undefined);
      });

      // También escuchar si la app ya estaba abierta y llega el deep link
      const handle = App.addListener('appUrlOpen', ({ url }) => {
        handle.then(h => h.remove());
        processSession(url);
      });
    } else {
      // En web, el hash está en window.location
      processSession(window.location.href);
    }
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
