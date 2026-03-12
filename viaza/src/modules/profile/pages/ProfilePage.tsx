import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppButton } from '../../../components/ui/AppButton';
import { AppCard } from '../../../components/ui/AppCard';
import { AppHeader } from '../../../components/ui/AppHeader';
import { useAppStore } from '../../../app/store/useAppStore';

export function ProfilePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAppStore((s) => s.user);
  const logout = useAppStore((s) => s.logout);

  return (
    <div className="px-4 pt-4">
      <AppHeader title={t('profile.title')} />

      <div className="mt-4 space-y-3">
        <AppCard>
          <div className="text-xs font-semibold text-[rgb(var(--viaza-primary-rgb)/0.60)]">{t('profile.name')}</div>
          <div className="mt-1 text-sm font-semibold">{user?.name ?? '-'}</div>
          <div className="mt-4 text-xs font-semibold text-[rgb(var(--viaza-primary-rgb)/0.60)]">{t('profile.email')}</div>
          <div className="mt-1 text-sm font-semibold">{user?.email ?? '-'}</div>
        </AppCard>

        <Link to="/settings" className="block">
          <AppButton variant="secondary" className="w-full" type="button">
            {t('profile.goToSettings')}
          </AppButton>
        </Link>

        <AppButton
          className="w-full"
          onClick={() => {
            logout();
            navigate('/auth/login', { replace: true });
          }}
          type="button"
        >
          {t('profile.logout')}
        </AppButton>
      </div>
    </div>
  );
}

