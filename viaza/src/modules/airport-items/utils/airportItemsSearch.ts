import { airportItems, type AirportAllowedItem } from './airportItemsData';

export function searchAirportItems(query: string): AirportAllowedItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return airportItems;
  return airportItems.filter((item) => item.keywords.some((k) => k.toLowerCase().includes(q)));
}

