import type { PropsWithChildren } from 'react';
import { I18nextProvider } from 'react-i18next';
import { ThemeProvider } from '../theme/ThemeProvider';
import i18n from '../../lib/i18n/i18nInstance';
import { useAppStore } from '../store/useAppStore';
import { useEffect } from 'react';
import { getSession } from '../../services/authService';

export function AppProviders({ children }: PropsWithChildren) {
  const currentLanguage = useAppStore((s) => s.currentLanguage);
  const setSupabaseUser = useAppStore((s) => s.setSupabaseUser);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);

  // Restaurar sesión de Supabase al arrancar la app
  useEffect(() => {
    if (!isAuthenticated) {
      void getSession().then((user) => {
        if (user) setSupabaseUser(user);
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
