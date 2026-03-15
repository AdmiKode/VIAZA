import type { Trip, TravelerProfile, TravelStyle, TransportType, TravelerGroup } from '../types/trip';

export type TripPhase = 'pre_trip' | 'in_trip' | 'post_trip';

export interface TripContext {
  destination: string;
  destinationPlaceId?: string;
  transportMode: TransportType;
  travelersType: TravelerGroup;
  travelStyle: TravelStyle;
  luggageStrategy?: string;
  travelerProfile: TravelerProfile;
  tripPhase: TripPhase;
  priceLevelMax: 0 | 1 | 2 | 3 | 4;
}

export function inferTripPhase(params: { startDate?: string; endDate?: string; now?: Date }): TripPhase {
  const { startDate, endDate, now = new Date() } = params;
  if (!startDate || !endDate) return 'pre_trip';
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T23:59:59`);
  if (today < start) return 'pre_trip';
  if (today > end) return 'post_trip';
  return 'in_trip';
}

export function normalizeTravelerProfile(profile?: TravelerProfile): TravelerProfile {
  return profile ?? 'balanced';
}

export function normalizeTravelStyle(style?: TravelStyle): TravelStyle {
  return style ?? 'standard';
}

export function priceLevelMaxForProfile(profile: TravelerProfile): 0 | 1 | 2 | 3 | 4 {
  switch (profile) {
    case 'economic': return 1;
    case 'balanced': return 2;
    case 'comfort': return 3;
    case 'premium': return 4;
  }
}

export function buildTripContext(trip: Trip): TripContext {
  const travelerProfile = normalizeTravelerProfile(trip.travelerProfile);
  const travelStyle = normalizeTravelStyle(trip.travelStyle);
  const transportMode = trip.transportType ?? 'flight';
  const travelersType = trip.travelerGroup;

  return {
    destination: trip.destination,
    destinationPlaceId: trip.destinationPlaceId,
    transportMode,
    travelersType,
    travelStyle,
    luggageStrategy: trip.luggageStrategy,
    travelerProfile,
    tripPhase: inferTripPhase({ startDate: trip.startDate, endDate: trip.endDate }),
    priceLevelMax: priceLevelMaxForProfile(travelerProfile),
  };
}

