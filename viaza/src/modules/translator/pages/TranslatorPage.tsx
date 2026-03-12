import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { AppHeader } from '../../../components/ui/AppHeader';
import { AppCard } from '../../../components/ui/AppCard';
import { AppInput } from '../../../components/ui/AppInput';
import { AppSelect } from '../../../components/ui/AppSelect';
import { AppButton } from '../../../components/ui/AppButton';
import { translateText } from '../services/translateService';

const languages = [
  { code: 'en', labelKey: 'language.en' },
  { code: 'es', labelKey: 'language.es' },
  { code: 'pt', labelKey: 'language.pt' },
  { code: 'fr', labelKey: 'language.fr' },
  { code: 'de', labelKey: 'language.de' }
];

export function TranslatorPage() {
  const { t } = useTranslation();
  const [from, setFrom] = useState('es');
  const [to, setTo] = useState('en');
  const [text, setText] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="px-4 pt-4 pb-24">
      <AppHeader title={t('translator.title')} />

      <div className="mt-4 space-y-3">
        <AppCard>
          <div className="flex gap-2">
            <div className="flex-1">
              <div className="text-xs font-semibold text-[rgb(var(--viaza-primary-rgb)/0.60)]">
                {t('translator.from')}
              </div>
              <div className="mt-2">
                <AppSelect value={from} onChange={(e) => setFrom(e.target.value)}>
                  {languages.map((l) => (
                    <option key={l.code} value={l.code}>
                      {t(l.labelKey)}
                    </option>
                  ))}
                </AppSelect>
              </div>
            </div>

            <div className="flex-1">
              <div className="text-xs font-semibold text-[rgb(var(--viaza-primary-rgb)/0.60)]">
                {t('translator.to')}
              </div>
              <div className="mt-2">
                <AppSelect value={to} onChange={(e) => setTo(e.target.value)}>
                  {languages.map((l) => (
                    <option key={l.code} value={l.code}>
                      {t(l.labelKey)}
                    </option>
                  ))}
                </AppSelect>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="text-xs font-semibold text-[rgb(var(--viaza-primary-rgb)/0.60)]">
              {t('translator.input')}
            </div>
            <div className="mt-2">
              <AppInput value={text} onChange={(e) => setText(e.target.value)} />
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <AppButton
              className="flex-1"
              disabled={!text.trim() || isLoading}
              onClick={async () => {
                setIsLoading(true);
                try {
                  const translated = await translateText({ text, from, to });
                  setResult(translated);
                } finally {
                  setIsLoading(false);
                }
              }}
              type="button"
            >
              {t('translator.cta')}
            </AppButton>

            <Link to="/translator/phrases" className="flex-1">
              <AppButton variant="secondary" className="w-full" type="button">
                {t('translator.quickPhrases')}
              </AppButton>
            </Link>
          </div>
        </AppCard>

        <AppCard>
          <div className="text-xs font-semibold text-[rgb(var(--viaza-primary-rgb)/0.60)]">
            {t('translator.result')}
          </div>
          <div className="mt-2 text-sm">{result || t('translator.resultEmpty')}</div>
          <div className="mt-3 text-xs text-[rgb(var(--viaza-primary-rgb)/0.60)]">{t('translator.note')}</div>
        </AppCard>
      </div>
    </div>
  );
}

