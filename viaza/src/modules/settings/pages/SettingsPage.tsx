import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AppHeader } from '../../../components/ui/AppHeader';
import { AppSelect } from '../../../components/ui/AppSelect';
import { AppCard } from '../../../components/ui/AppCard';
import { useAppStore } from '../../../app/store/useAppStore';
import { requestNotificationPermission } from '../../../services/pushNotificationService';

const C = {
  dark: '#12212E',
  mid: '#307082',
  light: '#6CA3A2',
  bg: '#ECE7DC',
  accent: '#EA9940',
};

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'pt', label: 'Português' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
];

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      style={{
        width: 44, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer',
        background: value ? C.mid : 'rgba(18,33,46,0.15)',
        position: 'relative', transition: 'background 0.2s',
        flexShrink: 0,
      }}
    >
      <div style={{
        position: 'absolute', top: 3, left: value ? 21 : 3,
        width: 20, height: 20, borderRadius: '50%', background: 'white',
        boxShadow: '0 1px 4px rgba(0,0,0,0.20)',
        transition: 'left 0.2s',
      }} />
    </button>
  );
}

function SettingRow({ label, sub, right }: { label: string; sub?: string; right: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 16px', borderRadius: 14,
      background: 'white', boxShadow: '0 2px 10px rgba(18,33,46,0.06)',
    }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.dark }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: 'rgba(18,33,46,0.45)', marginTop: 2 }}>{sub}</div>}
      </div>
      {right}
    </div>
  );
}

const NOTIF_KEY = 'viaza_notifications_enabled';

export function SettingsPage() {
  const { t, i18n } = useTranslation();
  const currentLanguage = useAppStore((s) => s.currentLanguage);
  const setLanguage = useAppStore((s) => s.setLanguage);
  const user = useAppStore((s) => s.user);

  const [notifEnabled, setNotifEnabled] = useState<boolean>(() => {
    return localStorage.getItem(NOTIF_KEY) !== 'false';
  });
  const [notifLoading, setNotifLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem(NOTIF_KEY, String(notifEnabled));
  }, [notifEnabled]);

  async function handleToggleNotif(value: boolean) {
    if (value) {
      setNotifLoading(true);
      try {
        const granted = await requestNotificationPermission();
        setNotifEnabled(granted);
      } finally {
        setNotifLoading(false);
      }
    } else {
      setNotifEnabled(false);
    }
  }

  function handleLanguageChange(code: string) {
    setLanguage(code);
    void i18n.changeLanguage(code);
  }

  return (
    <div className="px-4 pt-4 pb-28" style={{ fontFamily: 'Questrial, sans-serif' }}>
      <AppHeader title={t('settings.title')} />

      {/* Cuenta */}
      <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(18,33,46,0.40)', textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 20, marginBottom: 8 }}>
        {t('settings.account')}
      </div>
      <AppCard className="mb-4">
        <div style={{ fontSize: 12, color: 'rgba(18,33,46,0.50)', marginBottom: 2 }}>{t('profile.email')}</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.dark }}>{user?.email ?? '-'}</div>
        <div style={{
          marginTop: 8, display: 'inline-block',
          fontSize: 10, fontWeight: 800, color: C.mid,
          background: `rgba(48,112,130,0.10)`, borderRadius: 8, padding: '3px 10px',
        }}>
          {t('settings.planFree')}
        </div>
      </AppCard>

      {/* Idioma */}
      <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(18,33,46,0.40)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>
        {t('settings.language.label')}
      </div>
      <div style={{ marginBottom: 16 }}>
        <AppSelect
          value={currentLanguage}
          onChange={(e) => handleLanguageChange(e.target.value)}
        >
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>{l.label}</option>
          ))}
        </AppSelect>
      </div>

      {/* Notificaciones */}
      <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(18,33,46,0.40)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>
        {t('settings.notifications')}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
        <SettingRow
          label={t('settings.notifications.push')}
          sub={t('settings.notifications.pushSub')}
          right={
            notifLoading
              ? <div style={{ fontSize: 11, color: C.light }}>{t('common.loading')}</div>
              : <Toggle value={notifEnabled} onChange={(v) => void handleToggleNotif(v)} />
          }
        />
      </div>

      {/* Versión */}
      <div style={{ textAlign: 'center', marginTop: 24, fontSize: 11, color: 'rgba(18,33,46,0.30)' }}>
        VIAZA v0.1.0
      </div>
    </div>
  );
}

