import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../../app/store/useAppStore';
import { searchDestinations, countryFlag } from '../../../engines/destinationSearch';
import type { DestinationResult } from '../../../engines/destinationSearch';

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

  const [inputValue, setInputValue] = useState(draftDestination);
  const [results, setResults] = useState<DestinationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<DestinationResult | null>(null);
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedQuery = useDebounce(inputValue, 420);

  // Clear selection if user edits after picking
  useEffect(() => {
    if (selected && inputValue !== selected.name) {
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
    searchDestinations(debouncedQuery)
      .then((r) => {
        setResults(r);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [debouncedQuery, selected]);

  function handleSelect(result: DestinationResult) {
    setSelected(result);
    setInputValue(result.name);
    setResults([]);
    setDraft({
      destination: result.name,
      lat: result.lat,
      lon: result.lon,
      inferredCountryCode: result.countryCode,
      inferredCurrency: result.currencyCode,
      inferredLanguage: result.languageCode,
    });
  }

  function handleConfirm() {
    if (!selected && inputValue.trim().length >= 2) {
      setDraft({ destination: inputValue.trim() });
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
            {t('onboarding.step', { current: 1, total: 7 })}
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
            onChange={(e) => setInputValue(e.target.value)}
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
                  key={r.id}
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
                    <div className="truncate text-sm font-semibold text-[var(--viaza-primary)]">{r.shortName}</div>
                    <div className="truncate text-xs text-[rgb(var(--viaza-primary-rgb)/0.50)]">{r.country}</div>
                  </div>
                  <span className="text-xl leading-none">{countryFlag(r.countryCode)}</span>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <p className="mt-2 text-xs text-[var(--viaza-accent)]">
            {t('onboarding.destination.searchError')}
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
              <span className="text-xl leading-none">{countryFlag(selected.countryCode)}</span>
              <div className="flex-1">
                <div className="text-sm font-semibold text-[var(--viaza-secondary)]">{selected.shortName}</div>
                <div className="text-xs text-[rgb(var(--viaza-primary-rgb)/0.50)]">{selected.currencyCode} · {selected.languageCode.toUpperCase()}</div>
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
