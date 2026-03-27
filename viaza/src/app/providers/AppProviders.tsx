import type { PropsWithChildren } from 'react';
import { I18nextProvider } from 'react-i18next';
import { ThemeProvider } from '../theme/ThemeProvider';
import i18n from '../../lib/i18n/i18nInstance';
import { useAppStore } from '../store/useAppStore';
import { useEffect } from 'react';
import { getSession, onAuthStateChange } from '../../services/authService';
import { checkPremiumStatus, consumePremiumCheckoutStarted, syncPremiumFromStripe } from '../../services/premiumService';
import { initGlobalErrorObservers, reportError } from '../../services/observabilityService';

export function AppProviders({ children }: PropsWithChildren) {
  const currentLanguage = useAppStore((s) => s.currentLanguage);
  const setSupabaseUser = useAppStore((s) => s.setSupabaseUser);
  const setIsPremium = useAppStore((s) => s.setIsPremium);
  const hydrateFromSupabase = useAppStore((s) => s.hydrateFromSupabase);

  // Check de sesión al montar — cubre el caso de redirect de Stripe a producción
  // donde la sesión ya existía y onAuthStateChange no vuelve a disparar SIGNED_IN
  useEffect(() => {
    void getSession().then((user) => {
      if (user) {
        setSupabaseUser(user);
        void (async () => {
          const active = await checkPremiumStatus().catch(() => false);
          setIsPremium(active);
          // Si el usuario intentó comprar recientemente pero no quedó activo (webhook falló o tardó),
          // intentamos una sincronización directa contra Stripe.
          if (!active && consumePremiumCheckoutStarted({ maxAgeMs: 48 * 60 * 60 * 1000 })) {
            await syncPremiumFromStripe().catch(() => ({ ok: false }));
            const refreshed = await checkPremiumStatus().catch(() => false);
            setIsPremium(refreshed);
          }
        })();
        void hydrateFromSupabase();
      }
    }).catch((error) => {
      reportError('app.providers.getSession', error);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    initGlobalErrorObservers();
  }, []);

  // Escuchar cambios de sesión (incluye OAuth callback redirect)
  useEffect(() => {
    const { data: { subscription } } = onAuthStateChange((user) => {
      if (user) {
        setSupabaseUser(user);
        void checkPremiumStatus().then((active) => setIsPremium(active)).catch(() => setIsPremium(false));
        void hydrateFromSupabase();
      } else {
        setIsPremium(false);
      }
    });
    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('premium') !== 'success') return;

    let cancelled = false;
    const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

    // Stripe webhook puede tardar: hacemos polling corto para evitar falsos "free"
    void (async () => {
      const delays = [0, 1200, 2200, 3500, 5000, 8000];
      for (const d of delays) {
        if (cancelled) return;
        if (d) await wait(d);
        const active = await checkPremiumStatus().catch(() => false);
        if (cancelled) return;
        setIsPremium(active);
        if (active) {
          await hydrateFromSupabase().catch(() => {});
          return;
        }
      }

      // Último recurso: sincronizar contra Stripe (no depende del webhook).
      await syncPremiumFromStripe().catch(() => ({ ok: false }));
      const refreshed = await checkPremiumStatus().catch(() => false);
      setIsPremium(refreshed);
      if (refreshed) await hydrateFromSupabase().catch(() => {});
    })();

    params.delete('premium');
    const next = params.toString();
    const newUrl = `${window.location.pathname}${next ? `?${next}` : ''}${window.location.hash}`;
    window.history.replaceState({}, '', newUrl);
    return () => { cancelled = true; };
  }, [setIsPremium, hydrateFromSupabase]);

  useEffect(() => {
    if (i18n.language !== currentLanguage) {
      void i18n.changeLanguage(currentLanguage);
    }
  }, [currentLanguage]);

  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>{children}</ThemeProvider>
    </I18nextProvider>
  );
}
