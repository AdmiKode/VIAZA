import { describe, expect, it } from 'vitest';
import { computePackingScanResult } from '../services/packingValidationService';
import type { PackingItem } from '../types/packing';

function item(partial: Partial<PackingItem> & { id: string; label: string }): PackingItem {
  return {
    id: partial.id,
    tripId: partial.tripId ?? 'trip_1',
    travelerId: partial.travelerId,
    category: partial.category ?? 'extras',
    label: partial.label,
    quantity: partial.quantity ?? 1,
    checked: partial.checked ?? false,
    required: partial.required ?? true,
    source: partial.source ?? 'default',
  };
}

describe('packing scan analytics', () => {
  it('calcula faltantes y progreso por categoria/viajero', () => {
    const checklist: PackingItem[] = [
      item({ id: 'a', label: 'Pasaporte', category: 'documents', travelerId: 't1' }),
      item({ id: 'b', label: 'Playera', category: 'clothes', travelerId: 't1' }),
      item({ id: 'c', label: 'Cargador', category: 'electronics', travelerId: 't1' }),
      item({ id: 'd', label: 'Botella', category: 'extras', travelerId: 't2' }),
    ];

    const result = computePackingScanResult({
      checklistItems: checklist,
      detected: [
        {
          packingItemId: 'a',
          detectedLabel: 'pasaporte',
          normalizedLabel: 'pasaporte',
          confidence: 0.93,
          quantityDetected: 1,
          matchStatus: 'matched',
        },
        {
          packingItemId: 'b',
          detectedLabel: 'playera',
          normalizedLabel: 'playera',
          confidence: 0.85,
          quantityDetected: 2,
          matchStatus: 'duplicate',
        },
        {
          packingItemId: null,
          detectedLabel: 'audifonos',
          normalizedLabel: 'audifonos',
          confidence: 0.51,
          quantityDetected: 1,
          matchStatus: 'extra',
        },
      ],
    });

    expect(result.summary.completionPct).toBe(25);
    expect(result.summary.missingCount).toBe(3);
    expect(result.summary.duplicateCount).toBe(1);
    expect(result.summary.extraCount).toBe(1);
    expect(result.missingPackingItemIds).toEqual(expect.arrayContaining(['b', 'c', 'd']));

    const documents = result.categoryProgress.find((x) => x.key === 'documents');
    const clothes = result.categoryProgress.find((x) => x.key === 'clothes');
    expect(documents?.pct).toBe(100);
    expect(clothes?.pct).toBe(0);

    const traveler1 = result.travelerProgress.find((x) => x.key === 't1');
    const traveler2 = result.travelerProgress.find((x) => x.key === 't2');
    expect(traveler1?.detected).toBe(1);
    expect(traveler2?.detected).toBe(0);
  });
});
