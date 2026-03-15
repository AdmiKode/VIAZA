import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { inferDestinationMeta, useAppStore } from '../../../app/store/useAppStore';
import { SUPABASE_URL, supabase } from '../../../services/supabaseClient';

type PlacesPrediction = {
  place_id: string;
  description: string;
  structured_formatting: { main_text: string; secondary_text?: string };
};

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function DestinationPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const draftDestination = useAppStore((s) => s.onboardingDraft.destination);
  const setDraft = useAppStore((s) => s.setOnboardingDraft);
  const lang = useAppStore((s) => s.currentLanguage);

  const [inputValue, setInputValue] = useState(draftDestination);
  const [results, setResults] = useState<PlacesPrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<PlacesPrediction | null>(null);
  const [error, setError] = useState(false);
  const [errorText, setErrorText] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedQuery = useDebounce(inputValue, 420);

  // Clear selection if user edits after picking
  useEffect(() => {
    if (selected && inputValue !== selected.structured_formatting.main_text) {
      setSelected(null);
    }
  }, [inputValue, selected]);

  // Geocoding search
  useEffect(() => {
    if (selected) return;
    if (debouncedQuery.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    setError(false);
    setErrorText('');
    supabase.functions
      .invoke('places-autocomplete', { body: { input: debouncedQuery, language: lang } })
      .then(({ data, error: fnErr }) => {
        if (fnErr) throw fnErr;
        const payload = data as { ok?: boolean; error?: string; predictions?: PlacesPrediction[] } | null;
        if (payload && payload.ok === false) throw new Error(payload.error ?? 'Places error');
        setResults((payload?.predictions ?? []).slice(0, 6));
        setLoading(false);
      })
      .catch((e: unknown) => {
        setError(true);
        setErrorText((e as Error)?.message ?? '');
        setLoading(false);
      });
  }, [debouncedQuery, selected, lang]);

  async function handleSelect(result: PlacesPrediction) {
    setSelected(result);
    setInputValue(result.structured_formatting.main_text);
    setResults([]);
    setError(false);
    setErrorText('');

    try {
      setLoading(true);
      const { data, error: fnErr } = await supabase.functions.invoke('destination-resolve', {
        body: { place_id: result.place_id, language: lang },
      });
      if (fnErr) throw fnErr;

      const dest = (data as {
        ok?: boolean;
        error?: string;
        destination?: {
          destination_place_id: string;
          destination_name: string;
          destination_country: string | null;
          destination_country_code: string | null;
          destination_timezone: string | null;
          destination_currency: string | null;
          destination_language: string | null;
          lat: number;
          lon: number;
        };
      } | null)?.destination;

      if (!dest) throw new Error('Missing destination meta');

      setDraft({
        destination: dest.destination_name,
        destinationCountry: dest.destination_country ?? undefined,
        destinationPlaceId: dest.destination_place_id,
        destinationTimezone: dest.destination_timezone ?? '',
        lat: dest.lat,
        lon: dest.lon,
        inferredCountryCode: dest.destination_country_code ?? undefined,
        inferredCurrency: dest.destination_currency ?? undefined,
        inferredLanguage: dest.destination_language ?? undefined,
      });
    } catch (e: unknown) {
      setError(true);
      setErrorText((e as Error)?.message ?? '');
      // Fallback: al menos persistir texto (sin meta) para no bloquear el flujo
      setDraft({ destination: result.structured_formatting.main_text });
    } finally {
      setLoading(false);
    }
  }

  function handleConfirm() {
    if (!selected && inputValue.trim().length >= 2) {
      const v = inputValue.trim();
      const meta = inferDestinationMeta(v);
      setDraft({
        destination: v,
        inferredCountryCode: meta.countryCode,
        inferredCurrency: meta.currencyCode,
        inferredLanguage: meta.languageCode,
        inferredClimate: meta.climate,
      });
    }
    navigate('/onboarding/dates');
  }

  const canContinue = inputValue.trim().length >= 2;
  const showDropdown = results.length > 0 && !selected;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="flex min-h-full flex-col px-5 pt-8 pb-10"
    >
      {/* Header */}
      <div className="mb-8">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[rgb(var(--viaza-accent-rgb)/0.12)] px-3 py-1">
          <span className="text-xs font-semibold text-[var(--viaza-accent)]">
            {t('onboarding.step', { current: 2, total: 8 })}
          </span>
        </div>
        <h1 className="text-2xl font-semibold leading-tight text-[var(--viaza-primary)]">
          {t('onboarding.destination.title')}
        </h1>
        <p className="mt-1 text-sm text-[rgb(var(--viaza-primary-rgb)/0.60)]">
          {t('onboarding.destination.prompt')}
        </p>
      </div>

      {/* Search input + dropdown */}
      <div className="relative">
        <div className="relative">
          <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
            <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
              <circle cx="21" cy="21" r="14" stroke="var(--viaza-primary)" strokeWidth="4" opacity="0.35" fill="none" />
              <path d="M31 31l10 10" stroke="var(--viaza-primary)" strokeWidth="4" strokeLinecap="round" opacity="0.35" />
            </svg>
          </div>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => {
              const v = e.target.value;
              setInputValue(v);
              if (!selected && v.trim().length >= 2) {
                const meta = inferDestinationMeta(v);
                setDraft({
                  inferredCountryCode: meta.countryCode,
                  inferredCurrency: meta.currencyCode,
                  inferredLanguage: meta.languageCode,
                  inferredClimate: meta.climate,
                });
              }
            }}
            onKeyDown={(e) => e.key === 'Enter' && canContinue && !showDropdown && handleConfirm()}
            placeholder={t('onboarding.destination.placeholder')}
            autoFocus
            className="w-full rounded-2xl border-2 border-[rgb(var(--viaza-primary-rgb)/0.10)] bg-white pl-11 pr-12 py-4 text-base font-semibold text-[var(--viaza-primary)] placeholder-[rgb(var(--viaza-primary-rgb)/0.30)] shadow-[var(--shadow-2)] outline-none transition-all focus:border-[var(--viaza-accent)] focus:shadow-[var(--shadow-3)]"
          />
          {inputValue.length > 0 && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                  className="h-4 w-4 rounded-full border-2 border-[var(--viaza-accent)] border-t-transparent"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => { setInputValue(''); setResults([]); setSelected(null); inputRef.current?.focus(); }}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-[rgb(var(--viaza-primary-rgb)/0.08)] transition active:scale-90"
                >
                  <svg width="10" height="10" viewBox="0 0 48 48" fill="none">
                    <path d="M12 12l24 24M36 12L12 36" stroke="var(--viaza-primary)" strokeWidth="5" strokeLinecap="round" />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Dropdown results */}
        <AnimatePresence>
          {showDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 overflow-hidden rounded-2xl bg-white shadow-[var(--shadow-3)]"
            >
              {results.map((r, i) => (
                <motion.button
                  key={r.place_id}
                  type="button"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => handleSelect(r)}
                  className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-[rgb(var(--viaza-primary-rgb)/0.04)] active:bg-[rgb(var(--viaza-primary-rgb)/0.08)] border-b border-[rgb(var(--viaza-primary-rgb)/0.06)] last:border-0"
                >
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-[rgb(var(--viaza-secondary-rgb)/0.12)]">
                    <svg width="16" height="16" viewBox="0 0 48 48" fill="none">
                      <path d="M24 4C16.3 4 10 10.3 10 18c0 11 14 26 14 26s14-15 14-26c0-7.7-6.3-14-14-14z" fill="var(--viaza-secondary)" />
                      <path d="M24 4C16.3 4 10 10.3 10 18c0 5 3 10 7 16L24 4z" fill="white" opacity="0.35" />
                      <circle cx="24" cy="18" r="5" fill="white" opacity="0.6" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-[var(--viaza-primary)]">{r.structured_formatting.main_text}</div>
                    <div className="truncate text-xs text-[rgb(var(--viaza-primary-rgb)/0.50)]">{r.structured_formatting.secondary_text || r.description}</div>
                  </div>
                  <span className="rounded-full bg-[rgb(var(--viaza-primary-rgb)/0.06)] px-2 py-1 text-[10px] font-semibold tracking-wider text-[rgb(var(--viaza-primary-rgb)/0.60)]">
                    {t('common.confirm')}
                  </span>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <p className="mt-2 text-xs text-[var(--viaza-accent)]">
            {t('onboarding.destination.searchError')}
            {errorText ? (
              <span className="block mt-1 text-[10px] text-[rgb(var(--viaza-primary-rgb)/0.55)]">
                {errorText}
                {SUPABASE_URL ? (
                  <span className="block mt-1">
                    {new URL('/functions/v1/places-autocomplete', SUPABASE_URL).toString()}
                  </span>
                ) : null}
              </span>
            ) : null}
          </p>
        )}

        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="mt-3 flex items-center gap-3 rounded-xl bg-[rgb(var(--viaza-secondary-rgb)/0.10)] px-4 py-3"
            >
              <div className="flex-1">
                <div className="text-sm font-semibold text-[var(--viaza-secondary)]">{selected.structured_formatting.main_text}</div>
                <div className="text-xs text-[rgb(var(--viaza-primary-rgb)/0.50)]">{selected.structured_formatting.secondary_text || selected.description}</div>
              </div>
              <svg width="16" height="16" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="20" fill="var(--viaza-secondary)" opacity="0.15" />
                <path d="M14 24l8 8 12-14" stroke="var(--viaza-secondary)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-auto pt-8">
        <button
          type="button"
          disabled={!canContinue}
          onClick={handleConfirm}
          className="w-full rounded-2xl bg-[var(--viaza-accent)] py-4 text-base font-semibold text-white shadow-[var(--shadow-2)] transition-all active:scale-[0.98] disabled:opacity-40"
        >
          {t('common.continue')}
        </button>
      </div>
    </motion.div>
  );
}
