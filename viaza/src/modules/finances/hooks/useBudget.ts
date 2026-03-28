// src/modules/finances/hooks/useBudget.ts
// Hook para Budget MVP — carga y mutación de trip_budget y trip_expenses

import { useState, useEffect, useCallback } from 'react';
import {
  getBudgetSummary,
  getBudgetsByTrip,
  getExpensesByTrip,
  upsertBudget,
  addExpense,
  deleteExpense,
  type TripBudget,
  type TripExpense,
  type BudgetSummary,
  type BudgetCategory,
} from '../../../services/budgetService';

export interface UseBudgetReturn {
  budgets: TripBudget[];
  expenses: TripExpense[];
  summary: BudgetSummary[];
  loading: boolean;
  error: string | null;
  totalPlanned: number;
  totalSpent: number;
  refresh: () => Promise<void>;
  saveBudget: (category: BudgetCategory, amount: number, currency?: string) => Promise<void>;
  saveExpense: (params: {
    category: BudgetCategory;
    amount: number;
    description?: string;
    paidBy?: string;
    expenseDate?: string;
    currencyCode?: string;
  }) => Promise<void>;
  removeExpense: (id: string) => Promise<void>;
}

export function useBudget(tripId: string | null): UseBudgetReturn {
  const [budgets, setBudgets] = useState<TripBudget[]>([]);
  const [expenses, setExpenses] = useState<TripExpense[]>([]);
  const [summary, setSummary] = useState<BudgetSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!tripId) return;
    setLoading(true);
    setError(null);
    try {
      const [b, e, s] = await Promise.all([
        getBudgetsByTrip(tripId),
        getExpensesByTrip(tripId),
        getBudgetSummary(tripId),
      ]);
      setBudgets(b);
      setExpenses(e);
      setSummary(s);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando presupuesto');
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    void load();
  }, [load]);

  const saveBudget = useCallback(async (
    category: BudgetCategory,
    amount: number,
    currency = 'USD',
  ) => {
    if (!tripId) return;
    await upsertBudget({ tripId, category, plannedAmount: amount, currencyCode: currency });
    await load();
  }, [tripId, load]);

  const saveExpense = useCallback(async (params: {
    category: BudgetCategory;
    amount: number;
    description?: string;
    paidBy?: string;
    expenseDate?: string;
    currencyCode?: string;
  }) => {
    if (!tripId) return;
    await addExpense({ tripId, ...params });
    await load();
  }, [tripId, load]);

  const removeExpense = useCallback(async (id: string) => {
    await deleteExpense(id);
    await load();
  }, [load]);

  const totalPlanned = budgets.reduce((sum, b) => sum + b.plannedAmount, 0);
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

  return {
    budgets,
    expenses,
    summary,
    loading,
    error,
    totalPlanned,
    totalSpent,
    refresh: load,
    saveBudget,
    saveExpense,
    removeExpense,
  };
}
