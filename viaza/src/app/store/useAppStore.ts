import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Trip, TravelType, ClimateType, TravelerGroup, LaundryMode, PackingStyle, WeatherForecast, TransportType } from '../../types/trip';
import type { PackingItem } from '../../types/packing';
import { generatePackingItemsForTrip } from '../../modules/packing/utils/packingGenerator';
import { weatherTypeToClimate } from '../../engines/weatherEngine';

type OnboardingDraft = {
  destination: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  lat: number;
  lon: number;
  // inferidos automáticamente
  inferredClimate: ClimateType | null;
  inferredCurrency: string;
  inferredLanguage: string;
  inferredCountryCode: string;
  weatherForecast: WeatherForecast | null;
  // elegidos por el usuario
  travelType: TravelType | null;
  travelerGroup: TravelerGroup | null;
  activities: string[];
  laundryMode: LaundryMode;
  packingStyle: PackingStyle;
  hasLaptop: boolean;
  travelLight: boolean;
  // NUEVO — transporte
  transportType: TransportType | null;
  originCity: string;
  originLat: number;
  originLon: number;
  flightNumber: string;
  airline: string;
  airportCode: string;
  busTerminal: string;
  trainStation: string;
  cruisePort: string;
  // NUEVO — número de viajeros
  numberOfAdults: number;
  numberOfKids: number;
};

type AppState = {
  currentLanguage: string;
  currentTripId: string | null;
  trips: Trip[];
  packingItems: PackingItem[];
  user: { name: string; email: string } | null;
  registeredUsers: Array<{ name: string; email: string; password: string }>;
  isAuthenticated: boolean;
  onboardingCompleted: boolean;   // ← NUEVO: true solo tras completar el onboarding
  onboardingDraft: OnboardingDraft;

  setLanguage: (lang: string) => void;
  register: (params: { name: string; email: string; password: string }) => void;
  login: (params: { email: string; password: string }) => void;
  logout: () => void;
  setOnboardingDraft: (patch: Partial<OnboardingDraft>) => void;
  resetOnboardingDraft: () => void;
  createTripFromDraft: () => string;
  setCurrentTrip: (tripId: string | null) => void;
  togglePackingItem: (itemId: string) => void;
  addCustomPackingItem: (tripId: string, label: string, quantity?: number) => void;
};

const emptyDraft: OnboardingDraft = {
  destination: '',
  startDate: '',
  endDate: '',
  durationDays: 7,
  lat: 0,
  lon: 0,
  inferredClimate: null,
  inferredCurrency: 'USD',
  inferredLanguage: 'en',
  inferredCountryCode: 'US',
  weatherForecast: null,
  travelType: null,
  travelerGroup: null,
  activities: [],
  laundryMode: 'none',
  packingStyle: 'normal',
  hasLaptop: false,
  travelLight: false,
  transportType: null,
  originCity: '',
  originLat: 0,
  originLon: 0,
  flightNumber: '',
  airline: '',
  airportCode: '',
  busTerminal: '',
  trainStation: '',
  cruisePort: '',
  numberOfAdults: 1,
  numberOfKids: 0,
};

function nowIso() {
  return new Date().toISOString();
}

function id() {
  return crypto.randomUUID();
}

function inferDestinationMeta(destination: string): {
  countryCode: string;
  currencyCode: string;
  languageCode: string;
  climate: ClimateType;
} {
  const d = destination.trim().toLowerCase();

  // ── Europa ──────────────────────────────────────────────────────
  if (d.includes('paris') || d.includes('lyon') || d.includes('nice') || d.includes('marseille'))
    return { countryCode: 'FR', currencyCode: 'EUR', languageCode: 'fr', climate: 'mild' };
  if (d.includes('rome') || d.includes('roma') || d.includes('milan') || d.includes('milano') || d.includes('florence') || d.includes('naples') || d.includes('venice'))
    return { countryCode: 'IT', currencyCode: 'EUR', languageCode: 'it', climate: 'mild' };
  if (d.includes('barcelona') || d.includes('madrid') || d.includes('seville') || d.includes('sevilla') || d.includes('valencia'))
    return { countryCode: 'ES', currencyCode: 'EUR', languageCode: 'es', climate: 'hot' };
  if (d.includes('london') || d.includes('manchester') || d.includes('edinburgh'))
    return { countryCode: 'GB', currencyCode: 'GBP', languageCode: 'en', climate: 'rainy' };
  if (d.includes('berlin') || d.includes('munich') || d.includes('hamburg') || d.includes('frankfurt'))
    return { countryCode: 'DE', currencyCode: 'EUR', languageCode: 'de', climate: 'cold' };
  if (d.includes('amsterdam') || d.includes('rotterdam'))
    return { countryCode: 'NL', currencyCode: 'EUR', languageCode: 'nl', climate: 'rainy' };
  if (d.includes('lisbon') || d.includes('lisboa') || d.includes('porto'))
    return { countryCode: 'PT', currencyCode: 'EUR', languageCode: 'pt', climate: 'mild' };
  if (d.includes('zurich') || d.includes('geneva') || d.includes('bern'))
    return { countryCode: 'CH', currencyCode: 'CHF', languageCode: 'de', climate: 'cold' };
  if (d.includes('vienna') || d.includes('wien') || d.includes('salzburg'))
    return { countryCode: 'AT', currencyCode: 'EUR', languageCode: 'de', climate: 'cold' };
  if (d.includes('prague') || d.includes('praga'))
    return { countryCode: 'CZ', currencyCode: 'CZK', languageCode: 'cs', climate: 'cold' };
  if (d.includes('budapest'))
    return { countryCode: 'HU', currencyCode: 'HUF', languageCode: 'hu', climate: 'mild' };
  if (d.includes('athens') || d.includes('atenas') || d.includes('santorini') || d.includes('mykonos'))
    return { countryCode: 'GR', currencyCode: 'EUR', languageCode: 'el', climate: 'hot' };
  if (d.includes('stockholm') || d.includes('oslo') || d.includes('copenhagen') || d.includes('helsinki'))
    return { countryCode: 'SE', currencyCode: 'SEK', languageCode: 'sv', climate: 'cold' };

  // ── América del Norte ─────────────────────────────────────────────
  if (d.includes('new york') || d.includes('los angeles') || d.includes('chicago') || d.includes('miami') || d.includes('san francisco') || d.includes('boston') || d.includes('seattle') || d.includes('las vegas') || d.includes('washington'))
    return { countryCode: 'US', currencyCode: 'USD', languageCode: 'en', climate: 'mild' };
  if (d.includes('miami') || d.includes('orlando'))
    return { countryCode: 'US', currencyCode: 'USD', languageCode: 'en', climate: 'hot' };
  if (d.includes('toronto') || d.includes('montreal') || d.includes('vancouver') || d.includes('calgary'))
    return { countryCode: 'CA', currencyCode: 'CAD', languageCode: 'en', climate: 'cold' };
  if (d.includes('mexico city') || d.includes('ciudad de mexico') || d.includes('cdmx') || d.includes('guadalajara') || d.includes('monterrey'))
    return { countryCode: 'MX', currencyCode: 'MXN', languageCode: 'es', climate: 'mild' };
  if (d.includes('cancun') || d.includes('cancún') || d.includes('tulum') || d.includes('playa del carmen') || d.includes('cabo') || d.includes('puerto vallarta'))
    return { countryCode: 'MX', currencyCode: 'MXN', languageCode: 'es', climate: 'hot' };

  // ── América del Sur ───────────────────────────────────────────────
  if (d.includes('buenos aires') || d.includes('mendoza') || d.includes('patagonia'))
    return { countryCode: 'AR', currencyCode: 'ARS', languageCode: 'es', climate: 'mild' };
  if (d.includes('rio') || d.includes('são paulo') || d.includes('sao paulo') || d.includes('florianopolis') || d.includes('brasilia'))
    return { countryCode: 'BR', currencyCode: 'BRL', languageCode: 'pt', climate: 'hot' };
  if (d.includes('bogota') || d.includes('bogotá') || d.includes('cartagena') || d.includes('medellin') || d.includes('medellín'))
    return { countryCode: 'CO', currencyCode: 'COP', languageCode: 'es', climate: 'mild' };
  if (d.includes('lima') || d.includes('cusco') || d.includes('machu picchu'))
    return { countryCode: 'PE', currencyCode: 'PEN', languageCode: 'es', climate: 'mild' };
  if (d.includes('santiago') || d.includes('valparaiso'))
    return { countryCode: 'CL', currencyCode: 'CLP', languageCode: 'es', climate: 'mild' };

  // ── Asia ──────────────────────────────────────────────────────────
  if (d.includes('tokyo') || d.includes('osaka') || d.includes('kyoto') || d.includes('hiroshima'))
    return { countryCode: 'JP', currencyCode: 'JPY', languageCode: 'ja', climate: 'mild' };
  if (d.includes('beijing') || d.includes('shanghai') || d.includes('hong kong') || d.includes('shenzhen'))
    return { countryCode: 'CN', currencyCode: 'CNY', languageCode: 'zh', climate: 'mild' };
  if (d.includes('bangkok') || d.includes('phuket') || d.includes('chiang mai') || d.includes('koh samui'))
    return { countryCode: 'TH', currencyCode: 'THB', languageCode: 'th', climate: 'hot' };
  if (d.includes('bali') || d.includes('jakarta') || d.includes('lombok'))
    return { countryCode: 'ID', currencyCode: 'IDR', languageCode: 'id', climate: 'hot' };
  if (d.includes('singapore') || d.includes('singapur'))
    return { countryCode: 'SG', currencyCode: 'SGD', languageCode: 'en', climate: 'hot' };
  if (d.includes('dubai') || d.includes('abu dhabi'))
    return { countryCode: 'AE', currencyCode: 'AED', languageCode: 'ar', climate: 'hot' };
  if (d.includes('istanbul') || d.includes('ankara') || d.includes('cappadocia') || d.includes('capadocia'))
    return { countryCode: 'TR', currencyCode: 'TRY', languageCode: 'tr', climate: 'mild' };
  if (d.includes('delhi') || d.includes('mumbai') || d.includes('bangalore') || d.includes('goa'))
    return { countryCode: 'IN', currencyCode: 'INR', languageCode: 'hi', climate: 'hot' };
  if (d.includes('seoul') || d.includes('busan') || d.includes('jeju'))
    return { countryCode: 'KR', currencyCode: 'KRW', languageCode: 'ko', climate: 'mild' };

  // ── África / Oceanía ──────────────────────────────────────────────
  if (d.includes('marrakech') || d.includes('casablanca') || d.includes('rabat'))
    return { countryCode: 'MA', currencyCode: 'MAD', languageCode: 'ar', climate: 'hot' };
  if (d.includes('cape town') || d.includes('johannesburg') || d.includes('safari'))
    return { countryCode: 'ZA', currencyCode: 'ZAR', languageCode: 'en', climate: 'mild' };
  if (d.includes('sydney') || d.includes('melbourne') || d.includes('brisbane') || d.includes('cairns'))
    return { countryCode: 'AU', currencyCode: 'AUD', languageCode: 'en', climate: 'hot' };
  if (d.includes('auckland') || d.includes('queenstown') || d.includes('wellington'))
    return { countryCode: 'NZ', currencyCode: 'NZD', languageCode: 'en', climate: 'mild' };

  // ── Default ───────────────────────────────────────────────────────
  return { countryCode: 'US', currencyCode: 'USD', languageCode: 'en', climate: 'mild' };
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentLanguage: 'es',
      currentTripId: null,
      trips: [],
      packingItems: [],
      user: null,
      registeredUsers: [
        // Dev seed — remove before production
        { name: 'Patricia', email: 'pattogaribayg@gmail.com', password: 'viaza2026' }
      ],
      isAuthenticated: false,
      onboardingCompleted: false,
      onboardingDraft: emptyDraft,

      setLanguage: (lang) => set({ currentLanguage: lang }),

      register: ({ name, email, password }) => {
        const normalizedEmail = email.trim().toLowerCase();
        const normalizedName = name.trim();
        const normalizedPassword = password;
        if (!normalizedName || !normalizedEmail || !normalizedPassword) {
          throw new Error('Invalid registration params');
        }

        const exists = get().registeredUsers.some((u) => u.email === normalizedEmail);
        if (exists) {
          throw new Error('User already exists');
        }

        set((state) => ({
          registeredUsers: [
            { name: normalizedName, email: normalizedEmail, password: normalizedPassword },
            ...state.registeredUsers
          ],
          user: { name: normalizedName, email: normalizedEmail },
          isAuthenticated: true
        }));
      },

      login: ({ email, password }) => {
        const normalizedEmail = email.trim().toLowerCase();
        // Dev bypass — always allow this account
        if (normalizedEmail === 'pattogaribayg@gmail.com' && password === 'viaza2026') {
          set({ user: { name: 'Patricia', email: normalizedEmail }, isAuthenticated: true });
          return;
        }
        const match = get().registeredUsers.find((u) => u.email === normalizedEmail);
        if (!match || match.password !== password) {
          throw new Error('Invalid credentials');
        }
        set({
          user: { name: match.name, email: match.email },
          isAuthenticated: true
        });
      },

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          currentTripId: null,
          onboardingCompleted: false,
        }),

      setOnboardingDraft: (patch) =>
        set((state) => ({
          onboardingDraft: { ...state.onboardingDraft, ...patch }
        })),

      resetOnboardingDraft: () => set({ onboardingDraft: emptyDraft }),

      createTripFromDraft: (destinationOverride?: string) => {
        const draft = get().onboardingDraft;
        const destination = (destinationOverride || draft.destination).trim();
        if (!draft.travelType || !draft.travelerGroup || !destination) {
          throw new Error('Onboarding draft incomplete');
        }

        const meta = inferDestinationMeta(destination);
        // Clima: usar el del forecast real si está disponible, si no el inferido del store
        const climate: ClimateType = draft.weatherForecast
          ? weatherTypeToClimate(draft.weatherForecast.weatherType)
          : draft.inferredClimate ?? meta.climate;

        // packingStyle: travelLight fuerza 'light'
        const packingStyle = draft.travelLight ? 'light' : draft.packingStyle;

        const tripId = id();
        const trip: Trip = {
          id: tripId,
          title: destination,
          destination: destination,
          countryCode: draft.inferredCountryCode || meta.countryCode,
          lat: draft.lat || undefined,
          lon: draft.lon || undefined,
          startDate: draft.startDate || undefined,
          endDate: draft.endDate || undefined,
          durationDays: draft.durationDays,
          travelType: draft.travelType,
          climate,
          travelerGroup: draft.travelerGroup,
          activities: draft.activities,
          laundryMode: draft.laundryMode,
          packingStyle,
          weatherForecast: draft.weatherForecast ?? undefined,
          tripStatus: 'planning',
          currencyCode: draft.inferredCurrency || meta.currencyCode,
          languageCode: draft.inferredLanguage || meta.languageCode,
          // Transporte
          transportType: draft.transportType ?? undefined,
          originCity: draft.originCity || undefined,
          originLat: draft.originLat || undefined,
          originLon: draft.originLon || undefined,
          flightNumber: draft.flightNumber || undefined,
          airline: draft.airline || undefined,
          airportCode: draft.airportCode || undefined,
          busTerminal: draft.busTerminal || undefined,
          trainStation: draft.trainStation || undefined,
          cruisePort: draft.cruisePort || undefined,
          // Número de viajeros
          numberOfAdults: draft.numberOfAdults ?? 1,
          numberOfKids: draft.numberOfKids ?? 0,
          createdAt: nowIso(),
          updatedAt: nowIso()
        };

        set((state) => ({
          trips: [trip, ...state.trips],
          currentTripId: tripId,
          onboardingCompleted: true,
          packingItems: [...generatePackingItemsForTrip(trip), ...state.packingItems]
        }));

        return tripId;
      },

      setCurrentTrip: (tripId) => set({ currentTripId: tripId }),

      togglePackingItem: (itemId) =>
        set((state) => ({
          packingItems: state.packingItems.map((x) => (x.id === itemId ? { ...x, checked: !x.checked } : x))
        })),

      addCustomPackingItem: (tripId, label, quantity = 1) =>
        set((state) => ({
          packingItems: [
            {
              id: id(),
              tripId,
              category: 'extras',
              label: label.trim(),
              quantity: Math.max(1, Math.floor(quantity)),
              checked: false,
              required: false,
              source: 'user_custom'
            },
            ...state.packingItems
          ]
        }))
    }),
    {
      name: 'viaza-app-state',
      partialize: (state) => ({
        currentLanguage: state.currentLanguage,
        currentTripId: state.currentTripId,
        trips: state.trips,
        packingItems: state.packingItems,
        user: state.user,
        registeredUsers: state.registeredUsers,
        isAuthenticated: state.isAuthenticated,
        onboardingCompleted: state.onboardingCompleted,
        onboardingDraft: state.onboardingDraft
      })
    }
  )
);
