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

        {/* Emergency Travel Card */}
        <Link to="/profile/emergency" className="block">
          <div style={{
            background: 'linear-gradient(135deg, var(--viaza-primary) 0%, var(--viaza-secondary) 60%, var(--viaza-accent) 100%)',
            borderRadius: 18,
            padding: '16px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 6px 22px rgba(18,33,46,0.18)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, background: 'rgba(255,255,255,0.15)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                  <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                  <path d="M14 14h3v3M17 20h3M20 17v3"/>
                </svg>
              </div>
              <div>
                <div style={{ color: 'white', fontSize: 15, fontWeight: 800, fontFamily: 'Questrial, sans-serif' }}>{t('profile.emergency.title')}</div>
                <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 2, fontFamily: 'Questrial, sans-serif' }}>{t('profile.emergency.subtitle')}</div>
              </div>
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" strokeLinecap="round">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </div>
        </Link>

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

