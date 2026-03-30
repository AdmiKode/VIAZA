// src/hooks/useTripBrain.ts
// Hook del Trip Brain — Sprint 1 Fase 1 S4 → Fase 2 completo

import { useState, useEffect, useMemo } from 'react';
import { useAppStore } from '../app/store/useAppStore';
import { supabase } from '../services/supabaseClient';
import { computeTripBrain, type TripBrainResult } from '../engines/tripBrainEngine';

const EMPTY_RESULT: TripBrainResult = {
  alerts: [],
  suggestions: [],
  readinessPct: 0,
  phase: 'unknown',
  daysLeft: null,
  prioritizedModules: [],
};

export function useTripBrain(): TripBrainResult {
  const currentTripId = useAppStore((s) => s.currentTripId);
  const trip = useAppStore((s) => s.trips.find((x) => x.id === s.currentTripId) ?? null);
  const packingItems = useAppStore((s) =>
    s.packingItems.filter((x) => x.tripId === s.currentTripId)
  );
  const walletDocs = useAppStore((s) => s.walletDocs);
  const itineraryEvents = useAppStore((s) => s.itineraryEvents);

  const [hasEmergencyProfile, setHasEmergencyProfile] = useState(false);
  const [isRiskDestination, setIsRiskDestination] = useState(false);
  const [riskLevel, setRiskLevel] = useState<'low' | 'medium' | 'high' | 'extreme' | undefined>(undefined);
  const [budgetSpent, setBudgetSpent] = useState(0);
  const [budgetTotal, setBudgetTotal] = useState(0);
  const [criticalMedsUnpacked, setCriticalMedsUnpacked] = useState(0);

  // Verificar si el usuario tiene perfil de emergencia configurado
  useEffect(() => {
    if (!currentTripId) { setHasEmergencyProfile(false); return; }

    let cancelled = false;
    void (async () => {
      try {
        const { data } = await supabase
          .from('emergency_profiles')
          .select('id')
          .limit(1)
          .maybeSingle();
        if (!cancelled) setHasEmergencyProfile(Boolean(data));
      } catch {
        if (!cancelled) setHasEmergencyProfile(false);
      }
    })();

    return () => { cancelled = true; };
  }, [currentTripId]);

  // Verificar zonas de riesgo para el destino actual — usa edge function risk-zones
  useEffect(() => {
    if (!trip?.id || !trip?.destination) { setIsRiskDestination(false); setRiskLevel(undefined); return; }

    let cancelled = false;
    void (async () => {
      try {
        const { data, error } = await supabase.functions.invoke('risk-zones', {
          body: { trip_id: trip.id },
        });
        if (cancelled) return;
        if (error || !data?.ok) { setIsRiskDestination(false); setRiskLevel(undefined); return; }
        const level = data.risk?.level as 'low' | 'medium' | 'high' | 'extreme' | undefined;
        const isRisk = level === 'high' || level === 'extreme' || level === 'critical' as unknown;
        setIsRiskDestination(Boolean(isRisk));
        setRiskLevel(level);
      } catch {
        if (!cancelled) { setIsRiskDestination(false); setRiskLevel(undefined); }
      }
    })();

    return () => { cancelled = true; };
  }, [trip?.id, trip?.destination]);

  // Calcular días desde última actualización de wallet
  const daysSinceLastWalletUpdate = useMemo(() => {
    if (walletDocs.length === 0) return null;
    const sorted = [...walletDocs]
      .filter((d) => d.updatedAt)
      .sort((a, b) => new Date(b.updatedAt!).getTime() - new Date(a.updatedAt!).getTime());
    if (!sorted[0]?.updatedAt) return null;
    const ms = Date.now() - new Date(sorted[0].updatedAt).getTime();
    return Math.floor(ms / (1000 * 60 * 60 * 24));
  }, [walletDocs]);

  // Budget totals: fetched async from Supabase to avoid store dependency
  useEffect(() => {
    if (!currentTripId) { setBudgetSpent(0); setBudgetTotal(0); return; }
    let cancelled = false;
    void (async () => {
      try {
        const { data: expenses } = await supabase
          .from('trip_expenses')
          .select('amount')
          .eq('trip_id', currentTripId);
        const { data: budgets } = await supabase
          .from('trip_budget')
          .select('amount')
          .eq('trip_id', currentTripId);
        if (!cancelled) {
          setBudgetSpent((expenses ?? []).reduce((s: number, e: { amount: number }) => s + (e.amount ?? 0), 0));
          setBudgetTotal((budgets ?? []).reduce((s: number, b: { amount: number }) => s + (b.amount ?? 0), 0));
        }
      } catch {/* ignore */}
    })();
    return () => { cancelled = true; };
  }, [currentTripId]);

  // Medicamentos críticos sin empacar
  useEffect(() => {
    if (!currentTripId) { setCriticalMedsUnpacked(0); return; }
    let cancelled = false;
    void (async () => {
      try {
        const { count } = await supabase
          .from('health_medications')
          .select('id', { count: 'exact', head: true })
          .eq('trip_id', currentTripId)
          .eq('is_critical', true)
          .eq('packed', false);
        if (!cancelled) setCriticalMedsUnpacked(count ?? 0);
      } catch {
        if (!cancelled) setCriticalMedsUnpacked(0);
      }
    })();
    return () => { cancelled = true; };
  }, [currentTripId]);

  const result = useMemo(() => {
    if (!trip) return EMPTY_RESULT;
    return computeTripBrain({
      trip,
      packingItems,
      walletDocs,
      hasEmergencyProfile,
      hasItineraryEvents: itineraryEvents.length > 0,
      budgetSpent,
      budgetTotal,
      isRiskDestination,
      riskLevel,
      daysSinceLastWalletUpdate,
      criticalMedsUnpacked,
    });
  }, [
    trip, packingItems, walletDocs, hasEmergencyProfile,
    itineraryEvents, budgetSpent, budgetTotal,
    isRiskDestination, riskLevel, daysSinceLastWalletUpdate,
    criticalMedsUnpacked,
  ]);

  return result;
}
