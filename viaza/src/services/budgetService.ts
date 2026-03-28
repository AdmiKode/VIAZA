// src/services/budgetService.ts
// Budget MVP — Sprint 1 Fase 1
// Gestiona trip_budget (presupuesto planificado) y trip_expenses (gastos reales)
// Ambas tablas creadas en migrations/20260328_finances.sql

import { supabase } from './supabaseClient';

// ─── Tipos ───────────────────────────────────────────────────────────────────

export type BudgetCategory =
  | 'transport'
  | 'accommodation'
  | 'food'
  | 'activities'
  | 'shopping'
  | 'health'
  | 'emergency'
  | 'other';

export const BUDGET_CATEGORIES: { id: BudgetCategory; label: string }[] = [
  { id: 'transport',      label: 'Transporte' },
  { id: 'accommodation',  label: 'Alojamiento' },
  { id: 'food',           label: 'Comida' },
  { id: 'activities',     label: 'Actividades' },
  { id: 'shopping',       label: 'Compras' },
  { id: 'health',         label: 'Salud' },
  { id: 'emergency',      label: 'Emergencia' },
  { id: 'other',          label: 'Otro' },
];

export interface TripBudget {
  id: string;
  userId: string;
  tripId: string;
  category: BudgetCategory;
  plannedAmount: number;
  currencyCode: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TripExpense {
  id: string;
  userId: string;
  tripId: string;
  category: BudgetCategory;
  amount: number;
  currencyCode: string;
  amountLocal: number | null;
  exchangeRate: number | null;
  description: string | null;
  paidBy: string | null;
  splitSessionId: string | null;
  expenseDate: string;
  receiptUrl: string | null;
  createdAt: string;
}

export interface BudgetSummary {
  category: BudgetCategory;
  label: string;
  planned: number;
  spent: number;
  remaining: number;
  pct: number; // 0-100
}

// ─── Helpers de mapeo ────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function budgetFromRow(row: any): TripBudget {
  return {
    id: row.id,
    userId: row.user_id,
    tripId: row.trip_id,
    category: row.category,
    plannedAmount: Number(row.planned_amount),
    currencyCode: row.currency_code,
    notes: row.notes ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function expenseFromRow(row: any): TripExpense {
  return {
    id: row.id,
    userId: row.user_id,
    tripId: row.trip_id,
    category: row.category,
    amount: Number(row.amount),
    currencyCode: row.currency_code,
    amountLocal: row.amount_local != null ? Number(row.amount_local) : null,
    exchangeRate: row.exchange_rate != null ? Number(row.exchange_rate) : null,
    description: row.description ?? null,
    paidBy: row.paid_by ?? null,
    splitSessionId: row.split_session_id ?? null,
    expenseDate: row.expense_date,
    receiptUrl: row.receipt_url ?? null,
    createdAt: row.created_at,
  };
}

// ─── TRIP BUDGET ─────────────────────────────────────────────────────────────

/** Carga todos los budgets del viaje */
export async function getBudgetsByTrip(tripId: string): Promise<TripBudget[]> {
  const { data, error } = await supabase
    .from('trip_budget')
    .select('*')
    .eq('trip_id', tripId)
    .order('category');
  if (error) throw error;
  return (data ?? []).map(budgetFromRow);
}

/**
 * Crea o actualiza el presupuesto de una categoría.
 * Usa upsert por (trip_id, category) — constraint UNIQUE en DB.
 */
export async function upsertBudget(params: {
  tripId: string;
  category: BudgetCategory;
  plannedAmount: number;
  currencyCode?: string;
  notes?: string;
}): Promise<TripBudget> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  const { data, error } = await supabase
    .from('trip_budget')
    .upsert(
      {
        user_id: user.id,
        trip_id: params.tripId,
        category: params.category,
        planned_amount: params.plannedAmount,
        currency_code: params.currencyCode ?? 'USD',
        notes: params.notes ?? null,
      },
      { onConflict: 'trip_id,category' }
    )
    .select()
    .single();

  if (error) throw error;
  return budgetFromRow(data);
}

/** Elimina el presupuesto de una categoría */
export async function deleteBudget(id: string): Promise<void> {
  const { error } = await supabase.from('trip_budget').delete().eq('id', id);
  if (error) throw error;
}

// ─── TRIP EXPENSES ────────────────────────────────────────────────────────────

/** Carga todos los gastos de un viaje ordenados por fecha desc */
export async function getExpensesByTrip(tripId: string): Promise<TripExpense[]> {
  const { data, error } = await supabase
    .from('trip_expenses')
    .select('*')
    .eq('trip_id', tripId)
    .order('expense_date', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(expenseFromRow);
}

/** Agrega un gasto real al viaje */
export async function addExpense(params: {
  tripId: string;
  category: BudgetCategory;
  amount: number;
  currencyCode?: string;
  description?: string;
  paidBy?: string;
  expenseDate?: string;        // ISO date 'YYYY-MM-DD', default hoy
  splitSessionId?: string;
}): Promise<TripExpense> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  const { data, error } = await supabase
    .from('trip_expenses')
    .insert({
      user_id: user.id,
      trip_id: params.tripId,
      category: params.category,
      amount: params.amount,
      currency_code: params.currencyCode ?? 'USD',
      description: params.description ?? null,
      paid_by: params.paidBy ?? null,
      expense_date: params.expenseDate ?? new Date().toISOString().slice(0, 10),
      split_session_id: params.splitSessionId ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return expenseFromRow(data);
}

/** Elimina un gasto */
export async function deleteExpense(id: string): Promise<void> {
  const { error } = await supabase.from('trip_expenses').delete().eq('id', id);
  if (error) throw error;
}

// ─── RESUMEN / SUMMARY ────────────────────────────────────────────────────────

/**
 * Calcula el resumen de presupuesto vs gastos reales por categoría.
 * Incluye categorías sin presupuesto si hay gastos en ellas.
 */
export async function getBudgetSummary(tripId: string): Promise<BudgetSummary[]> {
  const [budgets, expenses] = await Promise.all([
    getBudgetsByTrip(tripId),
    getExpensesByTrip(tripId),
  ]);

  // Mapa de gasto real por categoría
  const spentMap: Partial<Record<BudgetCategory, number>> = {};
  for (const exp of expenses) {
    spentMap[exp.category] = (spentMap[exp.category] ?? 0) + exp.amount;
  }

  // Combinar: categorías con presupuesto + categorías con gastos sin presupuesto
  const allCategories = new Set<BudgetCategory>([
    ...budgets.map((b) => b.category),
    ...Object.keys(spentMap) as BudgetCategory[],
  ]);

  const summary: BudgetSummary[] = [];
  for (const cat of allCategories) {
    const planned = budgets.find((b) => b.category === cat)?.plannedAmount ?? 0;
    const spent = spentMap[cat] ?? 0;
    const remaining = planned - spent;
    const pct = planned > 0 ? Math.min(100, Math.round((spent / planned) * 100)) : 0;
    const label = BUDGET_CATEGORIES.find((c) => c.id === cat)?.label ?? cat;
    summary.push({ category: cat, label, planned, spent, remaining, pct });
  }

  // Ordenar por % gastado desc (los más comprometidos primero)
  summary.sort((a, b) => b.pct - a.pct || b.spent - a.spent);
  return summary;
}
