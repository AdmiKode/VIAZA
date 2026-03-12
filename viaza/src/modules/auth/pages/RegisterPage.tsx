import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { AppButton } from '../../../components/ui/AppButton';
import { AppCard } from '../../../components/ui/AppCard';
import { AppInput } from '../../../components/ui/AppInput';
import { useAppStore } from '../../../app/store/useAppStore';
import { signUp } from '../../../services/authService';

export function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setSupabaseUser = useAppStore((s) => s.setSupabaseUser);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-dvh px-4 pt-10">
      <div className="mx-auto max-w-sm">
        <div className="mb-6 flex flex-col items-center">
          <img src="/brand/logo-blue.png" alt="VIAZA" style={{ height: 100, width: 'auto' }} />
        </div>
        <h1 className="text-2xl font-semibold text-[var(--viaza-primary)]">{t('auth.register.title')}</h1>
        <p className="mt-2 text-sm text-[rgb(var(--viaza-primary-rgb)/0.75)]">{t('auth.register.subtitle')}</p>

        <div className="mt-6 space-y-3">
          <AppCard>
            <div className="text-xs font-semibold text-[rgb(var(--viaza-primary-rgb)/0.75)]">{t('auth.name')}</div>
            <div className="mt-2">
              <AppInput value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          </AppCard>

          <AppCard>
            <div className="text-xs font-semibold text-[rgb(var(--viaza-primary-rgb)/0.75)]">{t('auth.email')}</div>
            <div className="mt-2">
              <AppInput value={email} onChange={(e) => setEmail(e.target.value)} inputMode="email" />
            </div>
          </AppCard>

          <AppCard>
            <div className="text-xs font-semibold text-[rgb(var(--viaza-primary-rgb)/0.75)]">
              {t('auth.password')}
            </div>
            <div className="mt-2">
              <AppInput value={password} onChange={(e) => setPassword(e.target.value)} type="password" />
            </div>
          </AppCard>

          {error ? (
            <AppCard className="border-[rgb(var(--viaza-accent-rgb)/0.30)]">
              <div className="text-sm text-[rgb(var(--viaza-primary-rgb)/0.75)]">{error}</div>
            </AppCard>
          ) : null}
        </div>

        <div className="mt-6 space-y-3">
          <AppButton
            className="w-full"
            onClick={async () => {
              setError(null);
              setLoading(true);
              try {
                const user = await signUp({ name, email, password });
                setSupabaseUser(user);
                navigate('/', { replace: true });
              } catch {
                setError(t('auth.register.error'));
              } finally {
                setLoading(false);
              }
            }}
            disabled={!name.trim() || !email.trim() || !password || loading}
            type="button"
          >
            {t('auth.register.cta')}
          </AppButton>

          <Link to="/auth/login" className="block">
            <AppButton variant="ghost" className="w-full" type="button">
              {t('auth.register.toLogin')}
            </AppButton>
          </Link>
        </div>
      </div>
    </div>
  );
}
