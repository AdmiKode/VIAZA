import type { TravelType } from '../types/trip';

export interface Activity {
  id: string;           // stable key used in draft.activities[]
  labelKey: string;     // i18n key
  category: 'water' | 'outdoor' | 'culture' | 'food' | 'nightlife' | 'sport' | 'wellness' | 'adventure';
  icon: string;         // SVG string (inline duotone)
}

// ── Duotone SVG icons (48×48 viewBox) ────────────────────────────────────────
const ICONS: Record<string, string> = {
  snorkeling: `<svg width="36" height="36" viewBox="0 0 48 48" fill="none"><ellipse cx="24" cy="28" rx="18" ry="10" fill="#307082"/><ellipse cx="24" cy="28" rx="18" ry="4" fill="white" opacity="0.35"/><rect x="12" y="10" width="24" height="10" rx="5" fill="#307082"/><circle cx="18" cy="15" r="4" fill="white" opacity="0.55"/><circle cx="30" cy="15" r="4" fill="white" opacity="0.55"/></svg>`,
  surfing: `<svg width="36" height="36" viewBox="0 0 48 48" fill="none"><path d="M4 38c8-10 18-14 28-8l8-16c-12-2-26 4-36 24z" fill="#307082"/><path d="M4 38c8-10 18-14 28-8" fill="white" opacity="0.35"/><path d="M32 8l-2 6 6 2-4 4" stroke="#EA9940" strokeWidth="3" strokeLinecap="round" fill="none"/></svg>`,
  kayaking: `<svg width="36" height="36" viewBox="0 0 48 48" fill="none"><ellipse cx="24" cy="32" rx="20" ry="6" fill="#307082"/><ellipse cx="24" cy="32" rx="20" ry="2.5" fill="white" opacity="0.30"/><rect x="22" y="8" width="4" height="26" rx="2" fill="#EA9940"/><ellipse cx="24" cy="9" rx="8" ry="3" fill="#EA9940"/><ellipse cx="24" cy="32" rx="8" ry="3" fill="#EA9940"/></svg>`,
  boattour: `<svg width="36" height="36" viewBox="0 0 48 48" fill="none"><path d="M6 32l5-16h26l5 16z" fill="#307082"/><path d="M6 32l5-16h13v16z" fill="white" opacity="0.30"/><rect x="18" y="8" width="3" height="14" rx="1.5" fill="#EA9940"/><path d="M18 8l10 7H18z" fill="#EA9940" opacity="0.8"/></svg>`,
  hiking: `<svg width="36" height="36" viewBox="0 0 48 48" fill="none"><path d="M6 42L22 10l20 32z" fill="#307082"/><path d="M6 42L22 10l8 14z" fill="white" opacity="0.30"/><path d="M18 22l4-12 4 12z" fill="white" opacity="0.65"/></svg>`,
  climbing: `<svg width="36" height="36" viewBox="0 0 48 48" fill="none"><path d="M8 44V8l14 12 14-12v36" fill="#307082"/><path d="M8 44V8l14 12V44z" fill="white" opacity="0.30"/><circle cx="22" cy="20" r="4" fill="#EA9940"/></svg>`,
  wildlife: `<svg width="36" height="36" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="18" fill="#307082"/><circle cx="19" cy="20" r="7" fill="white" opacity="0.50"/><ellipse cx="29" cy="30" rx="8" ry="5" fill="#12212E" opacity="0.60"/></svg>`,
  photography: `<svg width="36" height="36" viewBox="0 0 48 48" fill="none"><rect x="4" y="14" width="40" height="28" rx="7" fill="#12212E"/><rect x="4" y="14" width="40" height="12" rx="7" fill="white" opacity="0.30"/><circle cx="24" cy="30" r="8" fill="#EA9940"/><circle cx="20" cy="26" r="4" fill="white" opacity="0.50"/><rect x="16" y="8" width="8" height="8" rx="2" fill="#12212E"/></svg>`,
  museums: `<svg width="36" height="36" viewBox="0 0 48 48" fill="none"><rect x="4" y="18" width="40" height="24" rx="3" fill="#12212E"/><rect x="4" y="18" width="40" height="10" rx="3" fill="white" opacity="0.30"/><path d="M4 18L24 6l20 12z" fill="#307082"/><rect x="20" y="28" width="8" height="14" rx="2" fill="#EA9940" opacity="0.8"/></svg>`,
  gastronomy: `<svg width="36" height="36" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="28" r="16" fill="#EA9940"/><circle cx="19" cy="22" r="7" fill="white" opacity="0.45"/><rect x="22" y="8" width="4" height="12" rx="2" fill="#12212E"/><rect x="14" y="10" width="3" height="10" rx="1.5" fill="#12212E"/></svg>`,
  nightlife: `<svg width="36" height="36" viewBox="0 0 48 48" fill="none"><path d="M16 8h16l4 28H12z" fill="#12212E"/><path d="M16 8h8l2 28H12z" fill="white" opacity="0.25"/><path d="M10 36h28v4H10z" fill="#307082"/><circle cx="24" cy="22" r="5" fill="#EA9940"/></svg>`,
  shopping: `<svg width="36" height="36" viewBox="0 0 48 48" fill="none"><rect x="8" y="16" width="32" height="26" rx="7" fill="#12212E"/><rect x="8" y="16" width="32" height="12" rx="7" fill="white" opacity="0.30"/><path d="M18 16v-4a6 6 0 0 1 12 0v4" stroke="#EA9940" strokeWidth="3.5" strokeLinecap="round" fill="none"/></svg>`,
  walkingtour: `<svg width="36" height="36" viewBox="0 0 48 48" fill="none"><circle cx="28" cy="10" r="5" fill="#307082"/><path d="M28 15l-4 12 6 8M24 27l-8 12" stroke="#307082" strokeWidth="3.5" strokeLinecap="round" fill="none"/><path d="M20 20l-6 4" stroke="#307082" strokeWidth="3" strokeLinecap="round" fill="none"/><circle cx="28" cy="10" r="3" fill="white" opacity="0.55"/></svg>`,
  skiing: `<svg width="36" height="36" viewBox="0 0 48 48" fill="none"><path d="M6 40L42 18" stroke="#307082" strokeWidth="4" strokeLinecap="round"/><path d="M6 40L42 23" stroke="white" opacity="0.30" strokeWidth="2.5" strokeLinecap="round"/><circle cx="30" cy="12" r="5" fill="#307082"/><circle cx="27" cy="9" r="2.5" fill="white" opacity="0.55"/><path d="M26 16l4 6 8-4" stroke="#EA9940" strokeWidth="2.5" strokeLinecap="round" fill="none"/></svg>`,
  snowboard: `<svg width="36" height="36" viewBox="0 0 48 48" fill="none"><path d="M8 38l28-22" stroke="#307082" strokeWidth="5" strokeLinecap="round"/><path d="M8 38l28-17" stroke="white" opacity="0.30" strokeWidth="3" strokeLinecap="round"/><circle cx="34" cy="12" r="5" fill="#307082"/><circle cx="31" cy="9" r="2.5" fill="white" opacity="0.55"/></svg>`,
  sledding: `<svg width="36" height="36" viewBox="0 0 48 48" fill="none"><path d="M6 36l36-12" stroke="#307082" strokeWidth="4" strokeLinecap="round"/><rect x="10" y="26" width="28" height="6" rx="3" fill="#12212E"/><rect x="10" y="26" width="28" height="3" rx="3" fill="white" opacity="0.30"/></svg>`,
  snowhike: `<svg width="36" height="36" viewBox="0 0 48 48" fill="none"><path d="M6 42L22 10l20 32z" fill="#307082" opacity="0.70"/><path d="M16 22l6-12 4 8z" fill="white" opacity="0.70"/><circle cx="36" cy="16" r="3" fill="white" opacity="0.8"/><circle cx="38" cy="12" r="2" fill="white" opacity="0.6"/></svg>`,
  apresski: `<svg width="36" height="36" viewBox="0 0 48 48" fill="none"><rect x="10" y="20" width="28" height="20" rx="6" fill="#EA9940"/><rect x="10" y="20" width="28" height="10" rx="6" fill="white" opacity="0.35"/><path d="M18 20v-6a6 6 0 0 1 12 0v6" fill="none" stroke="#12212E" strokeWidth="3" strokeLinecap="round"/></svg>`,
  roadtrip: `<svg width="36" height="36" viewBox="0 0 48 48" fill="none"><rect x="4" y="22" width="40" height="14" rx="5" fill="#12212E"/><rect x="4" y="22" width="40" height="7" rx="5" fill="white" opacity="0.30"/><rect x="8" y="18" width="32" height="8" rx="4" fill="#307082"/><circle cx="14" cy="36" r="5" fill="#307082"/><circle cx="34" cy="36" r="5" fill="#307082"/><circle cx="14" cy="36" r="2.5" fill="white" opacity="0.6"/><circle cx="34" cy="36" r="2.5" fill="white" opacity="0.6"/></svg>`,
  camping_act: `<svg width="36" height="36" viewBox="0 0 48 48" fill="none"><path d="M2 44L24 6l22 38z" fill="#307082"/><path d="M2 44L24 6l10 18z" fill="white" opacity="0.30"/><path d="M16 44h16v-10l-8-7-8 7z" fill="#12212E"/></svg>`,
  stargazing: `<svg width="36" height="36" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="26" r="16" fill="#12212E"/><circle cx="18" cy="20" r="7" fill="white" opacity="0.20"/><circle cx="16" cy="16" r="3" fill="white" opacity="0.8"/><circle cx="26" cy="14" r="2" fill="white" opacity="0.7"/><circle cx="32" cy="20" r="2.5" fill="white" opacity="0.6"/><circle cx="24" cy="30" r="2" fill="white" opacity="0.5"/></svg>`,
  yoga: `<svg width="36" height="36" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="10" r="5" fill="#6CA3A2"/><circle cx="21" cy="7" r="2.5" fill="white" opacity="0.55"/><path d="M24 15v16M14 22l10-4 10 4M16 38l8-7 8 7" stroke="#6CA3A2" strokeWidth="3" strokeLinecap="round" fill="none"/></svg>`,
  cycling: `<svg width="36" height="36" viewBox="0 0 48 48" fill="none"><circle cx="12" cy="34" r="8" fill="#307082"/><circle cx="36" cy="34" r="8" fill="#307082"/><circle cx="12" cy="34" r="4" fill="white" opacity="0.50"/><circle cx="36" cy="34" r="4" fill="white" opacity="0.50"/><path d="M12 34l12-18 12 18" fill="none" stroke="#EA9940" strokeWidth="3" strokeLinecap="round"/></svg>`,
};

// ── Activity catalog ──────────────────────────────────────────────────────────
const CATALOG: Record<string, Activity> = {
  snorkeling:  { id: 'snorkeling',  labelKey: 'activity.snorkeling',  category: 'water',     icon: ICONS.snorkeling },
  surfing:     { id: 'surfing',     labelKey: 'activity.surfing',     category: 'water',     icon: ICONS.surfing },
  kayaking:    { id: 'kayaking',    labelKey: 'activity.kayaking',    category: 'water',     icon: ICONS.kayaking },
  boattour:    { id: 'boattour',    labelKey: 'activity.boattour',    category: 'water',     icon: ICONS.boattour },
  hiking:      { id: 'hiking',      labelKey: 'activity.hiking',      category: 'outdoor',   icon: ICONS.hiking },
  climbing:    { id: 'climbing',    labelKey: 'activity.climbing',    category: 'outdoor',   icon: ICONS.climbing },
  wildlife:    { id: 'wildlife',    labelKey: 'activity.wildlife',    category: 'outdoor',   icon: ICONS.wildlife },
  photography: { id: 'photography', labelKey: 'activity.photography', category: 'outdoor',   icon: ICONS.photography },
  museums:     { id: 'museums',     labelKey: 'activity.museums',     category: 'culture',   icon: ICONS.museums },
  gastronomy:  { id: 'gastronomy',  labelKey: 'activity.gastronomy',  category: 'food',      icon: ICONS.gastronomy },
  nightlife:   { id: 'nightlife',   labelKey: 'activity.nightlife',   category: 'nightlife', icon: ICONS.nightlife },
  shopping:    { id: 'shopping',    labelKey: 'activity.shopping',    category: 'culture',   icon: ICONS.shopping },
  walkingtour: { id: 'walkingtour', labelKey: 'activity.walkingtour', category: 'culture',   icon: ICONS.walkingtour },
  skiing:      { id: 'skiing',      labelKey: 'activity.skiing',      category: 'sport',     icon: ICONS.skiing },
  snowboard:   { id: 'snowboard',   labelKey: 'activity.snowboard',   category: 'sport',     icon: ICONS.snowboard },
  sledding:    { id: 'sledding',    labelKey: 'activity.sledding',    category: 'adventure', icon: ICONS.sledding },
  snowhike:    { id: 'snowhike',    labelKey: 'activity.snowhike',    category: 'outdoor',   icon: ICONS.snowhike },
  apresski:    { id: 'apresski',    labelKey: 'activity.apresski',    category: 'nightlife', icon: ICONS.apresski },
  roadtrip:    { id: 'roadtrip',    labelKey: 'activity.roadtrip',    category: 'adventure', icon: ICONS.roadtrip },
  camping_act: { id: 'camping_act', labelKey: 'activity.camping',     category: 'outdoor',   icon: ICONS.camping_act },
  stargazing:  { id: 'stargazing',  labelKey: 'activity.stargazing',  category: 'outdoor',   icon: ICONS.stargazing },
  yoga:        { id: 'yoga',        labelKey: 'activity.yoga',        category: 'wellness',  icon: ICONS.yoga },
  cycling:     { id: 'cycling',     labelKey: 'activity.cycling',     category: 'sport',     icon: ICONS.cycling },
};

const BY_TRAVEL_TYPE: Record<TravelType, string[]> = {
  beach:     ['snorkeling', 'surfing', 'kayaking', 'boattour', 'photography', 'nightlife', 'yoga'],
  mountain:  ['hiking', 'climbing', 'wildlife', 'photography', 'camping_act', 'stargazing', 'cycling'],
  city:      ['museums', 'gastronomy', 'nightlife', 'shopping', 'walkingtour', 'photography'],
  camping:   ['camping_act', 'hiking', 'stargazing', 'wildlife', 'photography', 'cycling'],
  work:      ['gastronomy', 'walkingtour', 'museums', 'nightlife'],
  snow:      ['skiing', 'snowboard', 'sledding', 'snowhike', 'apresski', 'photography', 'stargazing'],
  roadtrip:  ['roadtrip', 'hiking', 'photography', 'gastronomy', 'camping_act', 'wildlife', 'cycling'],
  adventure: ['hiking', 'climbing', 'kayaking', 'cycling', 'stargazing', 'wildlife', 'photography'],
};

/**
 * Returns suggested activities for a given trip type.
 * Always returns all activities for the type — the UI can show them all as selectable.
 */
export function suggestActivities(tripType: TravelType | null): Activity[] {
  if (!tripType) return [];
  const ids = BY_TRAVEL_TYPE[tripType] ?? [];
  return ids.map((id) => CATALOG[id]).filter(Boolean);
}

/** Returns Activity by id */
export function getActivity(id: string): Activity | undefined {
  return CATALOG[id];
}
