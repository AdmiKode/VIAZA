/**
 * AuthCallbackPage.tsx
 * Procesa el callback OAuth de Supabase en Capacitor nativo.
 *
 * Problema Android:
 * Supabase OAuth abre un Custom Chrome Tab. Al terminar, Android redirige
 * viaza://auth/callback#access_token=... de vuelta a la app.
 * Si la app ya estaba en memoria, App.getLaunchUrl() retorna null y
 * appUrlOpen puede llegar tarde o no llegar si el token va en el hash.
 *
 * Solución: combinamos 3 estrategias en paralelo:
 *   1. Extraer tokens del URL del deep link si llegan
 *   2. Polling de getSession() cada 600ms (el Custom Tab guardó la cookie)
 *   3. onAuthStateChange como seguro adicional
 */
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { supabase } from '../../../services/supabaseClient';
import { useAppStore } from '../../../app/store/useAppStore';

function extractTokensFromUrl(url: string): { access_token?: string; refresh_token?: string } {
  try {
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
  const resolvedRef = useRef(false);

  function resolveUser(user: { id: string; email?: string; user_metadata?: Record<string, unknown> }) {
    if (resolvedRef.current) return;
    resolvedRef.current = true;
    setSupabaseUser({
      id: user.id,
      email: user.email ?? '',
      name:
        (user.user_metadata?.full_name as string) ??
        (user.user_metadata?.name as string) ??
        (user.email?.split('@')[0] ?? 'Usuario'),
    });
    navigate(onboardingCompleted ? '/home' : '/onboarding', { replace: true });
  }

  async function trySetSessionFromUrl(url: string) {
    const { access_token, refresh_token } = extractTokensFromUrl(url);
    if (!access_token) return false;
    try {
      const { data, error } = await supabase.auth.setSession({
        access_token,
        refresh_token: refresh_token ?? access_token,
      });
      if (!error && data.session?.user) {
        resolveUser(data.session.user as Parameters<typeof resolveUser>[0]);
        return true;
      }
    } catch {
      // ignorar
    }
    return false;
  }

  useEffect(() => {
    let pollTimer: ReturnType<typeof setInterval> | null = null;
    let timeoutTimer: ReturnType<typeof setTimeout> | null = null;
    let authListener: { subscription: { unsubscribe: () => void } } | null = null;

    // ── Estrategia 2: polling cada 600ms hasta 15s ─────────────────────────
    // El Custom Tab de Android ya guardó la sesión en el storage de Supabase.
    // Solo necesitamos leerla.
    const startPolling = () => {
      pollTimer = setInterval(async () => {
        if (resolvedRef.current) {
          if (pollTimer) clearInterval(pollTimer);
          return;
        }
        try {
          const { data } = await supabase.auth.getSession();
          if (data.session?.user) {
            if (pollTimer) clearInterval(pollTimer);
            resolveUser(data.session.user as Parameters<typeof resolveUser>[0]);
          }
        } catch {
          // ignorar errores de red transitorios
        }
      }, 600);
    };

    // ── Estrategia 3: onAuthStateChange ────────────────────────────────────
    const startAuthListener = () => {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user && !resolvedRef.current) {
          resolveUser(session.user as Parameters<typeof resolveUser>[0]);
        }
      });
      authListener = data;
    };

    // ── Timeout final: si nada funcionó en 15s, regresar al login ──────────
    const startTimeout = () => {
      timeoutTimer = setTimeout(() => {
        if (!resolvedRef.current) {
          resolvedRef.current = true;
          navigate('/auth/login', { replace: true });
        }
      }, 15000);
    };

    async function init() {
      // Verificar si ya hay sesión activa (caso: app ya tenía sesión)
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session?.user) {
          resolveUser(data.session.user as Parameters<typeof resolveUser>[0]);
          return;
        }
      } catch {
        // continuar
      }

      startPolling();
      startAuthListener();
      startTimeout();

      if (Capacitor.isNativePlatform()) {
        // ── Estrategia 1a: URL de lanzamiento (app estaba cerrada) ──────────
        try {
          const result = await App.getLaunchUrl();
          if (result?.url) {
            const ok = await trySetSessionFromUrl(result.url);
            if (ok) return;
          }
        } catch {
          // ignorar
        }

        // ── Estrategia 1b: appUrlOpen (app estaba en memoria) ───────────────
        const handlePromise = App.addListener('appUrlOpen', async ({ url }) => {
          (await handlePromise).remove();
          await trySetSessionFromUrl(url);
        });
      } else {
        // En web: tokens en el hash de window.location
        await trySetSessionFromUrl(window.location.href);
      }
    }

    void init();

    return () => {
      if (pollTimer) clearInterval(pollTimer);
      if (timeoutTimer) clearTimeout(timeoutTimer);
      authListener?.subscription.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
