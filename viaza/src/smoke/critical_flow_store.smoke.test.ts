import { beforeEach, describe, expect, it, vi } from 'vitest';

const memoryStorage = (() => {
  let store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store = new Map<string, string>();
    },
  };
})();

vi.stubGlobal('localStorage', memoryStorage);

const mocks = vi.hoisted(() => ({
  savePackingItemsMock: vi.fn().mockResolvedValue(undefined),
  deletePackingItemRemoteMock: vi.fn().mockResolvedValue(undefined),
  upsertAgendaItemMock: vi.fn().mockResolvedValue(undefined),
  upsertItineraryEventMock: vi.fn().mockResolvedValue(undefined),
  upsertWalletDocMock: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../services/authService', () => ({
  signOut: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../services/tripsService', () => ({
  fetchTrips: vi.fn().mockResolvedValue([]),
  saveTrip: vi.fn().mockResolvedValue(undefined),
  updateTripRemote: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../services/packingService', () => ({
  fetchPackingItems: vi.fn().mockResolvedValue([]),
  savePackingItems: mocks.savePackingItemsMock,
  togglePackingItemRemote: vi.fn().mockResolvedValue(undefined),
  deletePackingItemRemote: mocks.deletePackingItemRemoteMock,
}));

vi.mock('../services/travelersService', () => ({
  fetchTravelers: vi.fn().mockResolvedValue([]),
  saveTravelers: vi.fn().mockResolvedValue(undefined),
  upsertTraveler: vi.fn().mockResolvedValue(undefined),
  deleteTravelerRemote: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../services/agendaService', () => ({
  fetchAgendaItems: vi.fn().mockResolvedValue([]),
  upsertAgendaItem: mocks.upsertAgendaItemMock,
  deleteAgendaItemRemote: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../services/itineraryService', () => ({
  fetchItineraryEvents: vi.fn().mockResolvedValue([]),
  upsertItineraryEvent: mocks.upsertItineraryEventMock,
  deleteItineraryEventRemote: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../services/tripPlacesService', () => ({
  fetchTripPlaces: vi.fn().mockResolvedValue([]),
  upsertTripPlace: vi.fn().mockResolvedValue(undefined),
  deleteTripPlaceRemote: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../services/walletDocsService', () => ({
  fetchWalletDocs: vi.fn().mockResolvedValue([]),
  upsertWalletDoc: mocks.upsertWalletDocMock,
  deleteWalletDocRemote: vi.fn().mockResolvedValue(undefined),
}));

import { useAppStore } from '../app/store/useAppStore';

describe('critical flow store smoke', () => {
  beforeEach(() => {
    memoryStorage.clear();
    vi.clearAllMocks();

    useAppStore.setState({
      currentTripId: null,
      trips: [],
      packingItems: [],
      travelers: [],
      packingEvidence: [],
      luggagePhotos: [],
      agendaItems: [],
      itineraryEvents: [],
      savedPlaces: [],
      walletDocs: [],
      user: null,
      isAuthenticated: false,
      isPremium: false,
      onboardingCompleted: false,
    });
    useAppStore.getState().resetOnboardingDraft();
  });

  it('cubre flujo onboarding -> trip -> packing -> agenda -> itinerary -> wallet -> premium', () => {
    const store = useAppStore.getState();

    store.setOnboardingDraft({
      destination: 'Cancun',
      travelType: 'beach',
      travelerGroup: 'family',
      transportType: 'car',
      startDate: '2099-01-01',
      endDate: '2099-01-06',
      durationDays: 5,
    });

    const tripId = store.createTripFromDraft();

    expect(tripId).toBeTruthy();
    expect(useAppStore.getState().trips.some((t) => t.id === tripId)).toBe(true);

    store.addCustomPackingItem(tripId, 'Cepillo dental', 1);
    expect(mocks.savePackingItemsMock).toHaveBeenCalledTimes(1);
    expect(mocks.savePackingItemsMock).toHaveBeenCalledWith([
      expect.objectContaining({
        tripId,
        label: 'Cepillo dental',
        source: 'user_custom',
      }),
    ]);

    const customItem = useAppStore.getState().packingItems.find((x) => x.label === 'Cepillo dental');
    expect(customItem).toBeTruthy();
    store.removePackingItem(customItem!.id);
    expect(mocks.deletePackingItemRemoteMock).toHaveBeenCalledWith(customItem!.id);
    expect(useAppStore.getState().packingItems.some((x) => x.id === customItem!.id)).toBe(false);

    const agendaId = store.addAgendaItem({
      tripId,
      title: 'Check-in hotel',
      category: 'checkin',
      date: '2099-01-01',
      time: '15:00',
      recurrence: 'none',
      completed: false,
    });
    expect(agendaId).toBeTruthy();
    expect(mocks.upsertAgendaItemMock).toHaveBeenCalledTimes(1);

    const itineraryId = store.addItineraryEvent({
      tripId,
      dayIndex: 0,
      order: 0,
      type: 'activity',
      title: 'Llegada',
      source: 'manual',
    });
    expect(itineraryId).toBeTruthy();
    expect(mocks.upsertItineraryEventMock).toHaveBeenCalledTimes(1);

    store.addWalletDoc({
      id: 'doc-1',
      tripId,
      docType: 'reservation',
      storagePath: 'test/path.pdf',
      createdAt: new Date().toISOString(),
    });
    expect(mocks.upsertWalletDocMock).toHaveBeenCalledTimes(1);
    expect(useAppStore.getState().walletDocs.length).toBe(1);

    store.setIsPremium(true);
    expect(useAppStore.getState().isPremium).toBe(true);
  });
});
