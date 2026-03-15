/**
 * packingService.ts
 * CRUD de ítems de packing contra la tabla `packing_items` de Supabase.
 */

import { supabase } from './supabaseClient';
import type { PackingItem } from '../types/packing';

/** Insertar o actualizar múltiples ítems de packing */
export async function savePackingItems(items: PackingItem[]): Promise<void> {
  if (items.length === 0) return;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const rows = items.map((item) => ({
    id: item.id,
    trip_id: item.tripId,
    traveler_id: item.travelerId ?? null,
    user_id: user.id,
    category: item.category,
    label: item.label,
    label_key: item.labelKey ?? null,
    quantity: item.quantity,
    checked: item.checked,
    required: item.required,
    source: item.source,
  }));

  const { error } = await supabase
    .from('packing_items')
    .upsert(rows, { onConflict: 'id' });

  if (error) {
    console.error('[packingService] savePackingItems error:', error.message);
  }
}

/** Actualizar el estado checked de un ítem */
export async function togglePackingItemRemote(
  itemId: string,
  checked: boolean
): Promise<void> {
  const { error } = await supabase
    .from('packing_items')
    .update({ checked, updated_at: new Date().toISOString() })
    .eq('id', itemId);

  if (error) {
    console.error('[packingService] togglePackingItemRemote error:', error.message);
  }
}

/** Obtener todos los ítems de packing de un viaje */
export async function fetchPackingItems(tripId: string): Promise<PackingItem[]> {
  const { data, error } = await supabase
    .from('packing_items')
    .select('*')
    .eq('trip_id', tripId)
    .order('category');

  if (error) {
    console.error('[packingService] fetchPackingItems error:', error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    tripId: row.trip_id,
    travelerId: row.traveler_id,
    category: row.category,
    label: row.label,
    labelKey: row.label_key,
    quantity: row.quantity,
    checked: row.checked,
    required: row.required,
    source: row.source,
  }));
}
