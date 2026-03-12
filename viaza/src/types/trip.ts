export type TravelType = 'beach' | 'mountain' | 'city' | 'camping' | 'work' | 'snow' | 'roadtrip' | 'adventure';
export type ClimateType = 'hot' | 'cold' | 'mild' | 'rainy';
export type TravelerGroup = 'solo' | 'couple' | 'family' | 'family_baby' | 'friends';
export type LaundryMode = 'none' | 'washer' | 'laundry_service';
export type PackingStyle = 'light' | 'normal' | 'heavy';
export type TripStatus = 'planning' | 'active' | 'completed';

/** Cómo se traslada el viajero al destino */
export type TransportType = 'flight' | 'car' | 'bus' | 'cruise' | 'train';

export interface WeatherForecast {
  avgTemp: number;
  minTemp: number;
  maxTemp: number;
  rainProbability: number;
  /** Derived weather category used for packing rules */
  weatherType: 'hot' | 'warm' | 'mild' | 'cold' | 'snowy' | 'rainy';
  description: string;
}

export interface Trip {
  id: string;
  title: string;
  destination: string;
  countryCode?: string;
  lat?: number;
  lon?: number;
  startDate?: string;
  endDate?: string;
  durationDays: number;
  travelType: TravelType;
  climate: ClimateType;
  travelerGroup: TravelerGroup;
  activities: string[];
  laundryMode: LaundryMode;
  packingStyle?: PackingStyle;
  weatherForecast?: WeatherForecast;
  tripStatus: TripStatus;
  /** Transporte */
  transportType?: TransportType;
  originCity?: string;          // Ciudad/lugar desde donde sale
  originLat?: number;
  originLon?: number;
  flightNumber?: string;        // Ej: "AM123"
  airline?: string;
  airportCode?: string;
  flightDepartureTime?: string;
  busTerminal?: string;
  trainStation?: string;
  cruisePort?: string;
  /** Moneda e idioma */
  currencyCode?: string;
  languageCode?: string;
  /** Número de viajeros */
  numberOfAdults?: number;
  numberOfKids?: number;
  createdAt: string;
  updatedAt: string;
}

