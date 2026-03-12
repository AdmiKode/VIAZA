import type { PropsWithChildren } from 'react';
import { I18nextProvider } from 'react-i18next';
import { ThemeProvider } from '../theme/ThemeProvider';
import i18n from '../../lib/i18n/i18nInstance';
import { useAppStore } from '../store/useAppStore';
import { useEffect } from 'react';
import { onAuthStateChange } from '../../services/authService';

export function AppProviders({ children }: PropsWithChildren) {
  const currentLanguage = useAppStore((s) => s.currentLanguage);
  const setSupabaseUser = useAppStore((s) => s.setSupabaseUser);

  // Escuchar cambios de sesión (incluye OAuth callback redirect)
  useEffect(() => {
    const { data: { subscription } } = onAuthStateChange((user) => {
      if (user) setSupabaseUser(user);
    });
    return () => subscription.unsubscribe();
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
