import type { PropsWithChildren } from 'react';
import { useEffect, useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { brandTheme, travelThemes, type ThemeColors } from './travelThemes';

function hexToRgbTriplet(hex: string) {
  const cleaned = hex.replace('#', '').trim();
  const full = cleaned.length === 3 ? cleaned.split('').map((c) => c + c).join('') : cleaned;
  if (full.length !== 6) return '0 0 0';
  const r = Number.parseInt(full.slice(0, 2), 16);
  const g = Number.parseInt(full.slice(2, 4), 16);
  const b = Number.parseInt(full.slice(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return '0 0 0';
  return `${r} ${g} ${b}`;
}

function applyThemeToRoot(theme: ThemeColors) {
  const root = document.documentElement;
  root.style.setProperty('--viaza-primary', theme.primary);
  root.style.setProperty('--viaza-secondary', theme.secondary);
  root.style.setProperty('--viaza-soft', theme.soft);
  root.style.setProperty('--viaza-background', theme.background);
  root.style.setProperty('--viaza-accent', theme.accent);

  root.style.setProperty('--viaza-primary-rgb', hexToRgbTriplet(theme.primary));
  root.style.setProperty('--viaza-secondary-rgb', hexToRgbTriplet(theme.secondary));
  root.style.setProperty('--viaza-soft-rgb', hexToRgbTriplet(theme.soft));
  root.style.setProperty('--viaza-background-rgb', hexToRgbTriplet(theme.background));
  root.style.setProperty('--viaza-accent-rgb', hexToRgbTriplet(theme.accent));
}

export function ThemeProvider({ children }: PropsWithChildren) {
  const currentTrip = useAppStore((s) => s.trips.find((t) => t.id === s.currentTripId) ?? null);

  const theme = useMemo<ThemeColors>(() => {
    if (!currentTrip) return brandTheme;
    const travelTheme = travelThemes[currentTrip.travelType];
    return { ...brandTheme, ...travelTheme };
  }, [currentTrip]);

  useEffect(() => {
    applyThemeToRoot(theme);
  }, [theme]);

  return children;
}
