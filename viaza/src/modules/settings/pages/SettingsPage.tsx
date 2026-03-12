import { useTranslation } from 'react-i18next';
import { AppHeader } from '../../../components/ui/AppHeader';
import { AppSelect } from '../../../components/ui/AppSelect';
import { useAppStore } from '../../../app/store/useAppStore';
import { Link } from 'react-router-dom';
import { AppCard } from '../../../components/ui/AppCard';
import { AppButton } from '../../../components/ui/AppButton';

const languages = [
  { code: 'en', labelKey: 'language.en' },
  { code: 'es', labelKey: 'language.es' },
  { code: 'pt', labelKey: 'language.pt' },
  { code: 'fr', labelKey: 'language.fr' },
  { code: 'de', labelKey: 'language.de' }
];

export function SettingsPage() {
  const { t } = useTranslation();
  const currentLanguage = useAppStore((s) => s.currentLanguage);
  const setLanguage = useAppStore((s) => s.setLanguage);

  return (
    <div className="px-4 pt-4 pb-24">
      <AppHeader title={t('settings.title')} />

      <div className="mt-4 space-y-3">
        <AppCard>
          <div className="text-xs font-semibold text-[rgb(var(--viaza-primary-rgb)/0.75)]">
            {t('settings.language.label')}
          </div>
          <div className="mt-2">
            <AppSelect
              value={currentLanguage}
              onChange={(e) => {
                const lang = e.target.value;
                setLanguage(lang);
              }}
            >
              {languages.map((l) => (
                <option key={l.code} value={l.code}>
                  {t(l.labelKey)}
                </option>
              ))}
            </AppSelect>
          </div>
        </AppCard>

        <Link to="/premium" className="block">
          <AppButton variant="secondary" className="w-full" type="button">
            {t('premium.title')}
          </AppButton>
        </Link>
      </div>
    </div>
  );
}
