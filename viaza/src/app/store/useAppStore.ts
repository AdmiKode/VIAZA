import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Trip, TravelType, ClimateType, TravelerGroup, TravelerProfile, TravelStyle, LaundryMode, PackingStyle, WeatherForecast, TransportType } from '../../types/trip';
import type { PackingItem } from '../../types/packing';
import type { Traveler, PackingEvidence, LuggagePhoto } from '../../types/traveler';
import type { AgendaItem } from '../../types/agenda';
import type { ItineraryEvent, SavedPlace } from '../../types/itinerary';
import type { WalletDoc } from '../../types/wallet';
import { generatePackingItemsForTrip } from '../../modules/packing/utils/packingGenerator';
import { weatherTypeToClimate } from '../../engines/weatherEngine';
import { computeActiveModules } from '../../engines/activeModulesEngine';
import { signOut } from '../../services/authService';
import type { AuthUser } from '../../services/authService';
import { fetchTrips, saveTrip, updateTripRemote } from '../../services/tripsService';
import { fetchPackingItems, savePackingItems, togglePackingItemRemote } from '../../services/packingService';
import { deleteTravelerRemote, fetchTravelers, saveTravelers, upsertTraveler } from '../../services/travelersService';
import { upsertAgendaItem, deleteAgendaItemRemote } from '../../services/agendaService';
import { upsertItineraryEvent, deleteItineraryEventRemote } from '../../services/itineraryService';
import { upsertTripPlace, deleteTripPlaceRemote } from '../../services/tripPlacesService';
import { fetchAgendaItems } from '../../services/agendaService';
import { fetchItineraryEvents } from '../../services/itineraryService';
import { fetchTripPlaces } from '../../services/tripPlacesService';
import { fetchWalletDocs, upsertWalletDoc, deleteWalletDocRemote } from '../../services/walletDocsService';

type OnboardingDraft = {
  destination: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  lat: number;
  lon: number;
  destinationPlaceId: string;
  destinationTimezone: string;
  destinationCountry: string;
  inferredClimate: ClimateType | null;
  inferredCurrency: string;
  inferredLanguage: string;
  inferredCountryCode: string;
  weatherForecast: WeatherForecast | null;
  travelType: TravelType | null;
  travelerGroup: TravelerGroup | null;
  travelerProfile: TravelerProfile;
  travelStyle: TravelStyle;
  luggageStrategy: string;
  activities: string[];
  laundryMode: LaundryMode;
  packingStyle: PackingStyle;
  hasLaptop: boolean;
  travelLight: boolean;
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
  numberOfAdults: number;
  numberOfKids: number;
  numberOfBabies: number;
  /** Nombres de los integrantes (opcional en onboarding, editable después) */
  travelerNames: string[];
};

type AppState = {
  currentLanguage: string;
  currentTripId: string | null;
  trips: Trip[];
  packingItems: PackingItem[];
  /** Integrantes del viaje por trip */
  travelers: Traveler[];
  /** Fotos de evidencia por ítem de maleta */
  packingEvidence: PackingEvidence[];
  /** Fotos de maleta completa para asistente de acomodo */
  luggagePhotos: LuggagePhoto[];
  /** Agenda de viaje — recordatorios y eventos por trip */
  agendaItems: AgendaItem[];
  /** Itinerario por días — eventos del itinerario */
  itineraryEvents: ItineraryEvent[];
  /** Lugares guardados por trip */
  savedPlaces: SavedPlace[];
  /** Documentos del Travel Wallet */
  walletDocs: WalletDoc[];
  user: { id: string; name: string; email: string } | null;
  isAuthenticated: boolean;
  isPremium: boolean;
  onboardingCompleted: boolean;
  onboardingDraft: OnboardingDraft;

  setLanguage: (lang: string) => void;
  /** Usado por LoginPage y RegisterPage después de autenticar con Supabase */
  setSupabaseUser: (user: AuthUser) => void;
  setIsPremium: (value: boolean) => void;
  hydrateFromSupabase: () => Promise<void>;
  logout: () => Promise<void>;
  setOnboardingDraft: (patch: Partial<OnboardingDraft>) => void;
  resetOnboardingDraft: () => void;
  createTripFromDraft: (override?: { destination?: string }) => string;
  setCurrentTrip: (tripId: string | null) => void;
  updateTripStatus: (tripId: string, status: Trip['tripStatus']) => void;
  updateTrip: (tripId: string, patch: Partial<Omit<Trip, 'id' | 'createdAt'>>) => void;
  togglePackingItem: (itemId: string) => void;
  addCustomPackingItem: (tripId: string, label: string, quantity?: number, travelerId?: string) => void;
  /** Inserta un bloque de ítems generados (usado para auto-generar si el trip no tiene ninguno) */
  addPackingItems: (items: PackingItem[]) => void;

  /** Integrantes */
  addTraveler: (traveler: Omit<Traveler, 'id'>) => string;
  updateTraveler: (id: string, patch: Partial<Omit<Traveler, 'id'>>) => void;
  removeTraveler: (id: string) => void;
  initTravelersFromTrip: (tripId: string) => void;

  /** Fotos de evidencia */
  addPackingEvidence: (evidence: Omit<PackingEvidence, never>) => void;
  removePackingEvidence: (itemId: string, travelerId: string) => void;

  /** Fotos de maleta completa */
  addLuggagePhoto: (photo: Omit<LuggagePhoto, 'id'>) => string;
  updateLuggagePhoto: (id: string, patch: Partial<Omit<LuggagePhoto, 'id'>>) => void;
  removeLuggagePhoto: (id: string) => void;

  /** Agenda */
  addAgendaItem: (item: Omit<AgendaItem, 'id' | 'createdAt'>) => string;
  updateAgendaItem: (id: string, patch: Partial<Omit<AgendaItem, 'id' | 'createdAt'>>) => void;
  deleteAgendaItem: (id: string) => void;
  toggleAgendaItem: (id: string) => void;

  /** Itinerario */
  addItineraryEvent: (event: Omit<ItineraryEvent, 'id' | 'createdAt'>) => string;
  updateItineraryEvent: (id: string, patch: Partial<Omit<ItineraryEvent, 'id' | 'createdAt'>>) => void;
  deleteItineraryEvent: (id: string) => void;
  reorderItineraryEvents: (tripId: string, dayIndex: number, orderedIds: string[]) => void;

  /** Lugares guardados */
  addSavedPlace: (place: Omit<SavedPlace, 'id' | 'createdAt'>) => string;
  updateSavedPlace: (id: string, patch: Partial<Omit<SavedPlace, 'id' | 'createdAt'>>) => void;
  deleteSavedPlace: (id: string) => void;

  /** Travel Wallet */
  addWalletDoc: (doc: WalletDoc) => void;
  updateWalletDoc: (id: string, patch: Partial<Omit<WalletDoc, 'id'>>) => void;
  deleteWalletDoc: (id: string) => void;
};

const emptyDraft: OnboardingDraft = {
  destination: '',
  startDate: '',
  endDate: '',
  durationDays: 7,
  lat: 0,
  lon: 0,
  destinationPlaceId: '',
  destinationTimezone: '',
  destinationCountry: '',
  inferredClimate: null,
  inferredCurrency: '',
  inferredLanguage: '',
  inferredCountryCode: '',
  weatherForecast: null,
  travelType: null,
  travelerGroup: null,
  travelerProfile: 'balanced',
  travelStyle: 'standard',
  luggageStrategy: 'individual',
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
  numberOfBabies: 0,
  travelerNames: [],
};

function nowIso() {
  return new Date().toISOString();
}

function uid() {
  return crypto.randomUUID();
}

export function inferDestinationMeta(destination: string): {
  countryCode: string;
  currencyCode: string;
  languageCode: string;
  climate: ClimateType;
} {
  const d = destination.trim().toLowerCase();

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
  if (d.includes('new york') || d.includes('los angeles') || d.includes('chicago') || d.includes('san francisco') || d.includes('boston') || d.includes('seattle') || d.includes('las vegas') || d.includes('washington'))
    return { countryCode: 'US', currencyCode: 'USD', languageCode: 'en', climate: 'mild' };
  if (d.includes('miami') || d.includes('orlando'))
    return { countryCode: 'US', currencyCode: 'USD', languageCode: 'en', climate: 'hot' };
  if (d.includes('toronto') || d.includes('montreal') || d.includes('vancouver') || d.includes('calgary'))
    return { countryCode: 'CA', currencyCode: 'CAD', languageCode: 'en', climate: 'cold' };
  if (d.includes('mexico city') || d.includes('ciudad de mexico') || d.includes('cdmx') || d.includes('guadalajara') || d.includes('monterrey'))
    return { countryCode: 'MX', currencyCode: 'MXN', languageCode: 'es', climate: 'mild' };
  if (d.includes('cancun') || d.includes('cancún') || d.includes('tulum') || d.includes('playa del carmen') || d.includes('cabo') || d.includes('puerto vallarta'))
    return { countryCode: 'MX', currencyCode: 'MXN', languageCode: 'es', climate: 'hot' };
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
  if (d.includes('marrakech') || d.includes('casablanca') || d.includes('rabat'))
    return { countryCode: 'MA', currencyCode: 'MAD', languageCode: 'ar', climate: 'hot' };
  if (d.includes('cape town') || d.includes('johannesburg') || d.includes('safari'))
    return { countryCode: 'ZA', currencyCode: 'ZAR', languageCode: 'en', climate: 'mild' };
  if (d.includes('sydney') || d.includes('melbourne') || d.includes('brisbane') || d.includes('cairns'))
    return { countryCode: 'AU', currencyCode: 'AUD', languageCode: 'en', climate: 'hot' };
  if (d.includes('auckland') || d.includes('queenstown') || d.includes('wellington'))
    return { countryCode: 'NZ', currencyCode: 'NZD', languageCode: 'en', climate: 'mild' };

  return { countryCode: 'US', currencyCode: 'USD', languageCode: 'en', climate: 'mild' };
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentLanguage: 'es',
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
      onboardingDraft: emptyDraft,

      setLanguage: (lang) => set({ currentLanguage: lang }),

      setSupabaseUser: (authUser: AuthUser) =>
        set({
          user: { id: authUser.id, name: authUser.name, email: authUser.email },
          isAuthenticated: true,
        }),

      setIsPremium: (value: boolean) =>
        set((state) => ({
          isPremium: value,
          trips: state.trips.map((trip) => ({
            ...trip,
            activeModules: computeActiveModules({ trip, isPremium: value }),
          })),
        })),

      hydrateFromSupabase: async () => {
        const userId = get().user?.id;
        if (!userId) return;

        const remoteTripsRaw = await fetchTrips(userId);
        const remoteTrips = remoteTripsRaw.map((trip) => {
          if (trip.activeModules && trip.activeModules.length > 0) return trip;
          return { ...trip, activeModules: computeActiveModules({ trip, isPremium: get().isPremium }) };
        });
        if (remoteTrips.length === 0) return;

        const existingCurrent = get().currentTripId;
        const currentTripId =
          existingCurrent && remoteTrips.some((t) => t.id === existingCurrent)
            ? existingCurrent
            : remoteTrips[0].id;

        const [remotePacking, remoteTravelers, remoteAgenda, remoteItinerary, remotePlaces, remoteWalletDocs] = await Promise.all([
          fetchPackingItems(currentTripId),
          fetchTravelers(currentTripId),
          fetchAgendaItems(currentTripId),
          fetchItineraryEvents(currentTripId),
          fetchTripPlaces(currentTripId),
          fetchWalletDocs(currentTripId),
        ]);

        set({
          trips: remoteTrips,
          currentTripId,
          onboardingCompleted: true,
          packingItems: remotePacking,
          travelers: remoteTravelers,
          agendaItems: remoteAgenda,
          itineraryEvents: remoteItinerary,
          savedPlaces: remotePlaces,
          walletDocs: remoteWalletDocs,
        });
      },

      logout: async () => {
        try { await signOut(); } catch { /* ignora errores de red */ }
        set({
          user: null,
          isAuthenticated: false,
          isPremium: false,
          currentTripId: null,
          onboardingCompleted: false,
        });
      },

      setOnboardingDraft: (patch) =>
        set((state) => ({
          onboardingDraft: { ...state.onboardingDraft, ...patch }
        })),

      resetOnboardingDraft: () => set({ onboardingDraft: emptyDraft }),

      createTripFromDraft: (override) => {
        const draft = { ...get().onboardingDraft, ...(override ?? {}) };
        const destination = (override?.destination ?? draft.destination).trim();
        if (!draft.travelType || !draft.travelerGroup || !draft.transportType || !destination) {
          throw new Error('Onboarding draft incomplete');
        }

        const meta = inferDestinationMeta(destination);
        const climate: ClimateType = draft.weatherForecast
          ? weatherTypeToClimate(draft.weatherForecast.weatherType)
          : draft.inferredClimate ?? meta.climate;

        const packingStyle =
          draft.travelStyle === 'backpack_light'
            ? 'light'
            : draft.travelStyle === 'comfort'
              ? 'heavy'
              : (draft.travelLight ? 'light' : draft.packingStyle);
        const tripId = uid();

        const trip: Trip = {
          id: tripId,
          title: destination,
          destination,
          destinationPlaceId: draft.destinationPlaceId || undefined,
          destinationCountry: draft.destinationCountry || undefined,
          countryCode: draft.inferredCountryCode || meta.countryCode,
          destinationTimezone: draft.destinationTimezone || undefined,
          lat: draft.lat || undefined,
          lon: draft.lon || undefined,
          startDate: draft.startDate || undefined,
          endDate: draft.endDate || undefined,
          durationDays: draft.durationDays,
          travelType: draft.travelType,
          climate,
          travelerGroup: draft.travelerGroup,
          travelerProfile: draft.travelerProfile,
          travelStyle: draft.travelStyle,
          luggageStrategy: draft.luggageStrategy,
          activeModules: [],
          activities: draft.activities,
          laundryMode: draft.laundryMode,
          packingStyle,
          weatherForecast: draft.weatherForecast ?? undefined,
          tripStatus: 'planning',
          currencyCode: draft.inferredCurrency || meta.currencyCode,
          languageCode: draft.inferredLanguage || meta.languageCode,
          transportType: draft.transportType,
          originCity: draft.originCity || undefined,
          originLat: draft.originLat || undefined,
          originLon: draft.originLon || undefined,
          flightNumber: draft.flightNumber || undefined,
          airline: draft.airline || undefined,
          airportCode: draft.airportCode || undefined,
          busTerminal: draft.busTerminal || undefined,
          trainStation: draft.trainStation || undefined,
          cruisePort: draft.cruisePort || undefined,
          numberOfAdults: draft.numberOfAdults ?? 1,
          numberOfKids: draft.numberOfKids ?? 0,
          numberOfBabies: draft.numberOfBabies ?? 0,
          createdAt: nowIso(),
          updatedAt: nowIso()
        };

        // Recalcular módulos ya con el Trip completo
        trip.activeModules = computeActiveModules({ trip, isPremium: get().isPremium });

        // Generar integrantes automáticamente desde el draft
        const newTravelers: Traveler[] = [];
        const totalAdults = draft.numberOfAdults ?? 1;
        const totalKids = draft.numberOfKids ?? 0;
        const totalBabies = draft.numberOfBabies ?? 0;
        const names = draft.travelerNames ?? [];

        for (let i = 0; i < totalAdults; i++) {
          newTravelers.push({
            id: uid(),
            tripId,
            name: names[i] ?? (i === 0 ? (get().user?.name ?? 'Viajero 1') : `Adulto ${i + 1}`),
            role: 'adult',
            order: i,
          });
        }
        for (let i = 0; i < totalKids; i++) {
          newTravelers.push({
            id: uid(),
            tripId,
            name: names[totalAdults + i] ?? `Niño ${i + 1}`,
            role: 'kid',
            order: totalAdults + i,
          });
        }
        for (let i = 0; i < totalBabies; i++) {
          newTravelers.push({
            id: uid(),
            tripId,
            name: names[totalAdults + totalKids + i] ?? `Bebé ${i + 1}`,
            role: 'baby',
            order: totalAdults + totalKids + i,
          });
        }

        set((state) => ({
          trips: [trip, ...state.trips],
          currentTripId: tripId,
          onboardingCompleted: true,
          travelers: [...newTravelers, ...state.travelers],
          packingItems: [...generatePackingItemsForTrip(trip), ...state.packingItems]
        }));

        // Sincronizar en background con Supabase
        const userId = get().user?.id;
        const packingGenerated = generatePackingItemsForTrip(trip);
        if (userId) {
          void saveTrip(trip, userId);
          void savePackingItems(packingGenerated);
          void saveTravelers(newTravelers);
        }

        return tripId;
      },

       setCurrentTrip: (tripId) => {
        set({ currentTripId: tripId });
        if (!tripId) return;
        void Promise.all([
          fetchPackingItems(tripId),
          fetchTravelers(tripId),
          fetchAgendaItems(tripId),
          fetchItineraryEvents(tripId),
          fetchTripPlaces(tripId),
          fetchWalletDocs(tripId),
        ]).then(([remotePacking, remoteTravelers, remoteAgenda, remoteItinerary, remotePlaces, remoteWalletDocs]) => {
          set({
            packingItems: remotePacking,
            travelers: remoteTravelers,
            agendaItems: remoteAgenda,
            itineraryEvents: remoteItinerary,
            savedPlaces: remotePlaces,
            walletDocs: remoteWalletDocs,
          });
        }).catch(() => { /* silencioso */ });
      },
      updateTrip: (tripId, patch) =>
        set((state) => ({
          trips: state.trips.map((t) => {
            if (t.id !== tripId) return t;
            void updateTripRemote(tripId, patch);
            return { ...t, ...patch, updatedAt: nowIso() };
          })
        })),
      updateTripStatus: (tripId, status) =>
        set((state) => ({
          trips: state.trips.map((t) => {
            if (t.id !== tripId) return t;
            void updateTripRemote(tripId, { tripStatus: status });
            return { ...t, tripStatus: status, updatedAt: nowIso() };
          })
        })),

      togglePackingItem: (itemId) => {
        const item = get().packingItems.find((x) => x.id === itemId);
        const newChecked = item ? !item.checked : true;
        set((state) => ({
          packingItems: state.packingItems.map((x) =>
            x.id === itemId ? { ...x, checked: !x.checked } : x
          )
        }));
        // Sincronizar en background
        void togglePackingItemRemote(itemId, newChecked);
      },

      addCustomPackingItem: (tripId, label, quantity = 1, travelerId) =>
        set((state) => ({
          packingItems: [
            {
              id: uid(),
              tripId,
              travelerId,
              category: 'extras' as const,
              label: label.trim(),
              quantity: Math.max(1, Math.floor(quantity)),
              checked: false,
              required: false,
              source: 'user_custom' as const,
            },
            ...state.packingItems
          ]
        })),

      addPackingItems: (items) =>
        set((state) => ({
          packingItems: [...items, ...state.packingItems]
        })),

      // ── Integrantes ─────────────────────────────────────────────────
      addTraveler: (traveler) => {
        const id = uid();
        set((state) => ({
          travelers: [...state.travelers, { ...traveler, id }]
        }));
        void upsertTraveler({ ...traveler, id });
        return id;
      },

      updateTraveler: (id, patch) =>
        set((state) => ({
          travelers: state.travelers.map((t) => {
            if (t.id !== id) return t;
            const updated = { ...t, ...patch };
            void upsertTraveler(updated);
            return updated;
          })
        })),

      removeTraveler: (id) =>
        set((state) => {
          void deleteTravelerRemote(id);
          return { travelers: state.travelers.filter((t) => t.id !== id) };
        }),

      initTravelersFromTrip: (tripId) => {
        const trip = get().trips.find((t) => t.id === tripId);
        if (!trip) return;
        const existing = get().travelers.filter((t) => t.tripId === tripId);
        if (existing.length > 0) return; // ya inicializados

        const newTravelers: Traveler[] = [];
        const totalAdults = trip.numberOfAdults ?? 1;
        const totalKids = trip.numberOfKids ?? 0;

        for (let i = 0; i < totalAdults; i++) {
          newTravelers.push({
            id: uid(),
            tripId,
            name: i === 0 ? (get().user?.name ?? 'Viajero 1') : `Adulto ${i + 1}`,
            role: 'adult',
            order: i,
          });
        }
        for (let i = 0; i < totalKids; i++) {
          newTravelers.push({
            id: uid(),
            tripId,
            name: `Niño ${i + 1}`,
            role: 'kid',
            order: totalAdults + i,
          });
        }

        set((state) => ({
          travelers: [...state.travelers, ...newTravelers]
        }));

        void saveTravelers(newTravelers);
      },

      // ── Fotos de evidencia ───────────────────────────────────────────
      addPackingEvidence: (evidence) =>
        set((state) => ({
          packingEvidence: [
            ...state.packingEvidence.filter(
              (e) => !(e.itemId === evidence.itemId && e.travelerId === evidence.travelerId)
            ),
            evidence
          ]
        })),

      removePackingEvidence: (itemId, travelerId) =>
        set((state) => ({
          packingEvidence: state.packingEvidence.filter(
            (e) => !(e.itemId === itemId && e.travelerId === travelerId)
          )
        })),

      // ── Fotos de maleta completa ─────────────────────────────────────
      addLuggagePhoto: (photo) => {
        const id = uid();
        set((state) => ({
          luggagePhotos: [...state.luggagePhotos, { ...photo, id }]
        }));
        return id;
      },

      updateLuggagePhoto: (id, patch) =>
        set((state) => ({
          luggagePhotos: state.luggagePhotos.map((p) =>
            p.id === id ? { ...p, ...patch } : p
          )
        })),

      removeLuggagePhoto: (id) =>
        set((state) => ({
          luggagePhotos: state.luggagePhotos.filter((p) => p.id !== id)
        })),

      // ── Agenda ───────────────────────────────────────────────────────
      addAgendaItem: (item) => {
        const id = uid();
        set((state) => ({
          agendaItems: [...state.agendaItems, { ...item, id, createdAt: nowIso() }]
        }));
        void upsertAgendaItem({ ...item, id, createdAt: nowIso() });
        return id;
      },

      updateAgendaItem: (id, patch) =>
        set((state) => {
          const updated = state.agendaItems.map((a) => (a.id === id ? { ...a, ...patch } : a));
          const item = updated.find((a) => a.id === id);
          if (item) void upsertAgendaItem(item);
          return { agendaItems: updated };
        }),

      deleteAgendaItem: (id) =>
        set((state) => {
          void deleteAgendaItemRemote(id);
          return { agendaItems: state.agendaItems.filter((a) => a.id !== id) };
        }),

      toggleAgendaItem: (id) =>
        set((state) => {
          const updated = state.agendaItems.map((a) => (a.id === id ? { ...a, completed: !a.completed } : a));
          const item = updated.find((a) => a.id === id);
          if (item) void upsertAgendaItem(item);
          return { agendaItems: updated };
        }),

      // ── Itinerario ───────────────────────────────────────────────────
      addItineraryEvent: (event) => {
        const id = uid();
        set((state) => ({
          itineraryEvents: [...state.itineraryEvents, { ...event, id, createdAt: nowIso() }]
        }));
        void upsertItineraryEvent({ ...event, id, createdAt: nowIso() });
        return id;
      },

      updateItineraryEvent: (id, patch) =>
        set((state) => {
          const updated = state.itineraryEvents.map((e) => (e.id === id ? { ...e, ...patch } : e));
          const ev = updated.find((e) => e.id === id);
          if (ev) void upsertItineraryEvent(ev);
          return { itineraryEvents: updated };
        }),

      deleteItineraryEvent: (id) =>
        set((state) => {
          void deleteItineraryEventRemote(id);
          return { itineraryEvents: state.itineraryEvents.filter((e) => e.id !== id) };
        }),

      reorderItineraryEvents: (tripId, dayIndex, orderedIds) =>
        set((state) => {
          const updated = state.itineraryEvents.map((e) => {
            if (e.tripId !== tripId || e.dayIndex !== dayIndex) return e;
            const newOrder = orderedIds.indexOf(e.id);
            return newOrder === -1 ? e : { ...e, order: newOrder };
          });
          for (const ev of updated) {
            if (ev.tripId === tripId && ev.dayIndex === dayIndex) void upsertItineraryEvent(ev);
          }
          return { itineraryEvents: updated };
        }),

      // ── Lugares guardados ────────────────────────────────────────────
      addSavedPlace: (place) => {
        const id = uid();
        set((state) => ({
          savedPlaces: [...state.savedPlaces, { ...place, id, createdAt: nowIso() }]
        }));
        void upsertTripPlace({ ...place, id, createdAt: nowIso() });
        return id;
      },

      updateSavedPlace: (id, patch) =>
        set((state) => {
          const updated = state.savedPlaces.map((p) => (p.id === id ? { ...p, ...patch } : p));
          const pl = updated.find((p) => p.id === id);
          if (pl) void upsertTripPlace(pl);
          return { savedPlaces: updated };
        }),

      deleteSavedPlace: (id) =>
        set((state) => {
          void deleteTripPlaceRemote(id);
          return { savedPlaces: state.savedPlaces.filter((p) => p.id !== id) };
        }),

      // ── Travel Wallet ────────────────────────────────────────────────
      addWalletDoc: (doc) =>
        set((state) => {
          void upsertWalletDoc(doc);
          return { walletDocs: [doc, ...state.walletDocs] };
        }),

      updateWalletDoc: (id, patch) =>
        set((state) => {
          const updated = state.walletDocs.map((d) => (d.id === id ? { ...d, ...patch } : d));
          const doc = updated.find((d) => d.id === id);
          if (doc) void upsertWalletDoc(doc);
          return { walletDocs: updated };
        }),

      deleteWalletDoc: (id) =>
        set((state) => {
          void deleteWalletDocRemote(id);
          return { walletDocs: state.walletDocs.filter((d) => d.id !== id) };
        }),
    }),
    {
      name: 'viaza-app-state',
      merge: (persistedState, currentState) => {
        const p = (persistedState as Partial<AppState> | undefined) ?? {};
        const merged: AppState = { ...(currentState as AppState), ...(p as AppState) };

        // Asegurar que onboardingDraft siempre tenga defaults (evita NaN/undefined en steppers)
        const draft = { ...emptyDraft, ...(p.onboardingDraft ?? {}) } as OnboardingDraft;
        const toFinite = (v: unknown, fallback: number) => {
          const n = typeof v === 'number' ? v : Number(v);
          return Number.isFinite(n) ? n : fallback;
        };
        draft.durationDays = toFinite(draft.durationDays, emptyDraft.durationDays);
        draft.lat = toFinite(draft.lat, emptyDraft.lat);
        draft.lon = toFinite(draft.lon, emptyDraft.lon);
        draft.originLat = toFinite(draft.originLat, emptyDraft.originLat);
        draft.originLon = toFinite(draft.originLon, emptyDraft.originLon);
        draft.numberOfAdults = Math.max(1, toFinite(draft.numberOfAdults, 1));
        draft.numberOfKids = Math.max(0, toFinite(draft.numberOfKids, 0));
        draft.numberOfBabies = Math.max(0, toFinite(draft.numberOfBabies, 0));
        merged.onboardingDraft = draft;

        return merged;
      },
      partialize: (state) => ({
        currentLanguage: state.currentLanguage,
        currentTripId: state.currentTripId,
        trips: state.trips,
        packingItems: state.packingItems,
        travelers: state.travelers,
        packingEvidence: state.packingEvidence,
        luggagePhotos: state.luggagePhotos,
        agendaItems: state.agendaItems,
        itineraryEvents: state.itineraryEvents,
        savedPlaces: state.savedPlaces,
        walletDocs: state.walletDocs,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isPremium: state.isPremium,
        onboardingCompleted: state.onboardingCompleted,
        onboardingDraft: state.onboardingDraft
      })
    }
  )
);
