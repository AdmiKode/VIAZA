// src/services/splitBillService.ts
//
// CRUD para split_bill_sessions y split_bill_expenses.
// Schema fuente de verdad: supabase/schema_viaza.sql (leído directamente).
//
// split_bill_sessions:
//   id uuid, trip_id uuid, user_id uuid, title text, currency text,
//   participants jsonb ([{id, name}]), created_at, updated_at
//
// split_bill_expenses:
//   id uuid, session_id uuid, user_id uuid, description text,
//   amount numeric(12,2), paid_by text, split_among text[], created_at

import { supabase } from './supabaseClient';

// ─── Tipos que mapean exactamente el schema ─────────────────────────────────

export interface SplitParticipant {
  id: string;   // UUID local (crypto.randomUUID)
  name: string;
}

export interface SplitBillSession {
  id: string;
  trip_id: string | null;
  user_id: string;
  title: string;
  currency: string;
  participants: SplitParticipant[];
  created_at: string;
  updated_at: string;
}

export interface SplitBillExpense {
  id: string;
  session_id: string;
  user_id: string;
  description: string;
  amount: number;          // numeric(12,2)
  paid_by: string;         // nombre del participante (no uuid)
  split_among: string[];   // nombres de los que dividen
  created_at: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Calcula quién le debe a quién a partir de los gastos de una sesión */
export interface DebtEntry {
  from: string;  // nombre del que debe
  to: string;    // nombre del que prestó
  amount: number;
}

export function calculateDebts(
  expenses: SplitBillExpense[],
  participants: SplitParticipant[],
): DebtEntry[] {
  // Balance neto por participante (positivo = le deben, negativo = debe)
  const balance: Record<string, number> = {};
  for (const p of participants) {
    balance[p.name] = 0;
  }

  for (const expense of expenses) {
    const among = expense.split_among.length > 0 ? expense.split_among : participants.map((p) => p.name);
    const share = expense.amount / among.length;

    // El que pagó recibe crédito
    if (balance[expense.paid_by] !== undefined) {
      balance[expense.paid_by] += expense.amount;
    }
    // Los que dividen el gasto deben su parte
    for (const name of among) {
      if (balance[name] !== undefined) {
        balance[name] -= share;
      }
    }
  }

  // Simplificar: quién debe a quién (greedy)
  const debtors = Object.entries(balance)
    .filter(([, b]) => b < -0.01)
    .map(([name, b]) => ({ name, amount: -b }))
    .sort((a, b) => b.amount - a.amount);

  const creditors = Object.entries(balance)
    .filter(([, b]) => b > 0.01)
    .map(([name, b]) => ({ name, amount: b }))
    .sort((a, b) => b.amount - a.amount);

  const debts: DebtEntry[] = [];
  let di = 0;
  let ci = 0;

  while (di < debtors.length && ci < creditors.length) {
    const d = debtors[di];
    const c = creditors[ci];
    const amount = Math.min(d.amount, c.amount);

    debts.push({ from: d.name, to: c.name, amount: Math.round(amount * 100) / 100 });

    d.amount -= amount;
    c.amount -= amount;

    if (d.amount < 0.01) di++;
    if (c.amount < 0.01) ci++;
  }

  return debts;
}

// ─── CRUD sessions ────────────────────────────────────────────────────────────

/** Crea una sesión nueva. Devuelve el registro insertado. */
export async function createSplitSession(params: {
  tripId?: string | null;
  title: string;
  currency: string;
  participants: SplitParticipant[];
}): Promise<SplitBillSession> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  const { data, error } = await supabase
    .from('split_bill_sessions')
    .insert({
      trip_id: params.tripId ?? null,
      user_id: user.id,
      title: params.title,
      currency: params.currency,
      participants: params.participants,
    })
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return {
    ...data,
    participants: (data.participants as SplitParticipant[]) ?? [],
  };
}

/** Obtiene las sesiones del usuario para un viaje, ordenadas por más reciente. */
export async function getSessionsByTrip(tripId: string): Promise<SplitBillSession[]> {
  const { data, error } = await supabase
    .from('split_bill_sessions')
    .select('*')
    .eq('trip_id', tripId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    ...row,
    participants: (row.participants as SplitParticipant[]) ?? [],
  }));
}

/** Elimina una sesión (y sus expenses en cascada por FK). */
export async function deleteSplitSession(sessionId: string): Promise<void> {
  const { error } = await supabase
    .from('split_bill_sessions')
    .delete()
    .eq('id', sessionId);

  if (error) throw new Error(error.message);
}

// ─── CRUD expenses ────────────────────────────────────────────────────────────

/** Añade un gasto a una sesión existente. */
export async function addSplitExpense(params: {
  sessionId: string;
  description: string;
  amount: number;
  paidBy: string;         // nombre del participante que pagó
  splitAmong: string[];   // nombres de los que dividen (vacío = todos)
}): Promise<SplitBillExpense> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  const { data, error } = await supabase
    .from('split_bill_expenses')
    .insert({
      session_id: params.sessionId,
      user_id: user.id,
      description: params.description,
      amount: params.amount,
      paid_by: params.paidBy,
      split_among: params.splitAmong,
    })
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return data as SplitBillExpense;
}

/** Obtiene todos los gastos de una sesión. */
export async function getExpensesBySession(sessionId: string): Promise<SplitBillExpense[]> {
  const { data, error } = await supabase
    .from('split_bill_expenses')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as SplitBillExpense[];
}

/** Elimina un gasto. */
export async function deleteSplitExpense(expenseId: string): Promise<void> {
  const { error } = await supabase
    .from('split_bill_expenses')
    .delete()
    .eq('id', expenseId);

  if (error) throw new Error(error.message);
}
