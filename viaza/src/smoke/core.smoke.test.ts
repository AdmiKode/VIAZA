import { describe, expect, it } from 'vitest';
import { splitBill } from '../modules/split-bill/utils/splitBillCalculator';
import { calculateRecommendedDeparture } from '../modules/reminders/utils/departureCalculator';
import { computeActiveModules } from '../engines/activeModulesEngine';
import type { Trip } from '../types/trip';

describe('core smoke', () => {
  it('splitBill calcula total por persona con propina', () => {
    const perPerson = splitBill({ total: 1000, people: 4, tipPct: 10 });
    expect(perPerson).toBe(275);
  });

  it('departureCalculator resta buffer al vuelo', () => {
    const data = calculateRecommendedDeparture({
      flightDepartureIso: '2026-04-10T15:00:00.000Z',
      bufferMinutes: 180,
    });
    expect(data).not.toBeNull();
    expect(data?.recommended.toISOString()).toBe('2026-04-10T12:00:00.000Z');
  });

  it('activeModules habilita base + premium para viaje pre-trip', () => {
    const trip: Trip = {
      id: 't1',
      title: 'Cancun',
      destination: 'Cancun',
      durationDays: 5,
      travelType: 'beach',
      climate: 'hot',
      travelerGroup: 'family',
      activities: ['beach'],
      laundryMode: 'none',
      tripStatus: 'planning',
      startDate: '2099-01-01',
      endDate: '2099-01-06',
      lat: 21.1619,
      lon: -86.8515,
      createdAt: '2026-03-25T00:00:00.000Z',
      updatedAt: '2026-03-25T00:00:00.000Z',
      transportType: 'car',
      originCity: 'CDMX',
    };

    const modules = computeActiveModules({ trip, isPremium: true });
    expect(modules).toContain('packing');
    expect(modules).toContain('wallet');
    expect(modules).toContain('route');
    expect(modules).toContain('weather');
    expect(modules).toContain('places');
    expect(modules).toContain('recommendations');
    expect(modules).toContain('wallet_ocr');
    expect(modules).toContain('itinerary');
  });
});
