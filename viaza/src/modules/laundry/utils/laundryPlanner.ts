import type { LaundryMode } from '../../../types/trip';

export function calculateClothesNeeded(durationDays: number, laundryMode: LaundryMode) {
  if (laundryMode === 'none') {
    return {
      shirts: durationDays,
      underwear: durationDays,
      pants: Math.ceil(durationDays / 3)
    };
  }

  if (laundryMode === 'washer' || laundryMode === 'laundry_service') {
    const cycle = Math.min(4, durationDays);
    return {
      shirts: cycle,
      underwear: cycle,
      pants: Math.max(2, Math.ceil(cycle / 2))
    };
  }

  return {
    shirts: durationDays,
    underwear: durationDays,
    pants: Math.ceil(durationDays / 3)
  };
}

