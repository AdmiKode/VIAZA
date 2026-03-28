// src/hooks/useBudget.ts
// Hook para gestionar presupuesto y gastos del viaje activo.
// Fuente de datos: budgetService → Supabase (trip_budget + trip_expenses)

import { useState, useEffect, useCallback } from 'react';
import {
  getBudgetSummary,
  getExpensesByTrip,
  addExpense,
  deleteExpense,
  upsertBudget,
  deleteBudget,
  type BudgetSummary,
  type TripExpense,
  type BudgetCategory,
} from '../services/budgetService';

interface UseBudgetResult {
  summary: BudgetSummary[];
  expenses: TripExpense[];
  totalPlanned: number;
  totalSpent: number;
  totalRemaining: number;
  overallPct: number;
  loading: boolean;
  error: string | null;
  refresh: () => void;
  addExpenseFn: (params: Parameters<typeof addExpense>[0]) => Promise<void>;
  deleteExpenseFn: (id: string) => Promise<void>;
  upsertBudgetFn: (params: Parameters<typeof upsertBudget>[0]) => Promise<void>;
  deleteBudgetFn: (id: string) => Promise<void>;
}

export function useBudget(tripId: string | null): UseBudgetResult {
  const [summary, setSummary] = useState<BudgetSummary[]>([]);
  const [expenses, setExpenses] = useState<TripExpense[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    if (!tripId) {
      setSummary([]);
      setExpenses([]);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    void (async () => {
      try {
        const [sumData, expData] = await Promise.all([
          getBudgetSummary(tripId),
          getExpensesByTrip(tripId),
        ]);
        if (!cancelled) {
          setSummary(sumData);
          setExpenses(expData);
        }
      } catch (e) {
        if (!cancelled) setError((e as Error).message ?? 'Error cargando presupuesto');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [tripId, tick]);

  // Totales derivados
  const totalPlanned = summary.reduce((acc, s) => acc + s.planned, 0);
  const totalSpent = summary.reduce((acc, s) => acc + s.spent, 0);
  const totalRemaining = totalPlanned - totalSpent;
  const overallPct = totalPlanned > 0
    ? Math.min(100, Math.round((totalSpent / totalPlanned) * 100))
    : 0;

  const addExpenseFn = useCallback(
    async (params: Parameters<typeof addExpense>[0]) => {
      await addExpense(params);
      refresh();
    },
    [refresh]
  );

  const deleteExpenseFn = useCallback(
    async (id: string) => {
      await deleteExpense(id);
      refresh();
    },
    [refresh]
  );

  const upsertBudgetFn = useCallback(
    async (params: Parameters<typeof upsertBudget>[0]) => {
      await upsertBudget(params);
      refresh();
    },
    [refresh]
  );

  const deleteBudgetFn = useCallback(
    async (id: string) => {
      await deleteBudget(id);
      refresh();
    },
    [refresh]
  );

  return {
    summary,
    expenses,
    totalPlanned,
    totalSpent,
    totalRemaining,
    overallPct,
    loading,
    error,
    refresh,
    addExpenseFn,
    deleteExpenseFn,
    upsertBudgetFn,
    deleteBudgetFn,
  };
}

// Re-exporta tipos útiles para las páginas
export type { BudgetSummary, TripExpense, BudgetCategory };
