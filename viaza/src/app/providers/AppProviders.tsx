import type { PropsWithChildren } from 'react';
import { I18nextProvider } from 'react-i18next';
import { ThemeProvider } from '../theme/ThemeProvider';
import i18n from '../../lib/i18n/i18nInstance';
import { useAppStore } from '../store/useAppStore';
import { useEffect } from 'react';
import { onAuthStateChange } from '../../services/authService';
import { checkPremiumStatus } from '../../services/premiumService';
import { supabase } from '../../services/supabaseClient';

export function AppProviders({ children }: PropsWithChildren) {
  const currentLanguage = useAppStore((s) => s.currentLanguage);
  const setSupabaseUser = useAppStore((s) => s.setSupabaseUser);
  const setIsPremium = useAppStore((s) => s.setIsPremium);
  const hydrateFromSupabase = useAppStore((s) => s.hydrateFromSupabase);

  // Check de sesión al montar — cubre el caso de redirect de Stripe a producción
  // donde la sesión ya existía y onAuthStateChange no vuelve a disparar SIGNED_IN
  useEffect(() => {
    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setSupabaseUser(session.user);
        void checkPremiumStatus().then((active) => setIsPremium(active)).catch(() => setIsPremium(false));
        void hydrateFromSupabase();
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    void checkPremiumStatus().then((active) => setIsPremium(active)).catch(() => setIsPremium(false));
    params.delete('premium');
    const next = params.toString();
    const newUrl = `${window.location.pathname}${next ? `?${next}` : ''}${window.location.hash}`;
    window.history.replaceState({}, '', newUrl);
  }, [setIsPremium]);

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
