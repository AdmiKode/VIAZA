export function calculateRecommendedDeparture(params: { flightDepartureIso: string; bufferMinutes?: number }) {
  const { flightDepartureIso, bufferMinutes = 180 } = params;
  const flight = new Date(flightDepartureIso);
  if (Number.isNaN(flight.getTime())) return null;
  const recommended = new Date(flight.getTime() - bufferMinutes * 60_000);
  return { flight, recommended };
}

