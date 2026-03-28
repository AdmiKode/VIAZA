// src/modules/finances/pages/BudgetPage.tsx
// Budget MVP — Sprint 1 Fase 1
// Vista de presupuesto planificado + gastos reales + resumen por categoría
// Paleta oficial VIAZA — CERO emojis — CERO colores fuera de paleta

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AppHeader } from '../../../components/ui/AppHeader';
import { AppButton } from '../../../components/ui/AppButton';
import { BudgetBar } from '../components/BudgetBar';
import { ExpenseForm } from '../components/ExpenseForm';
import { useBudget } from '../hooks/useBudget';
import { useAppStore } from '../../../app/store/useAppStore';
import { BUDGET_CATEGORIES, type BudgetCategory } from '../../../services/budgetService';

const P = {
  primary:    '#12212E',
  secondary:  '#307082',
  softTeal:   '#6CA3A2',
  background: '#ECE7DC',
  accent:     '#EA9940',
  primaryRgb: '18,33,46',
};

type Tab = 'summary' | 'expenses' | 'plan';

const inputStyle: React.CSSProperties = {
  background: `rgba(${P.primaryRgb},0.06)`,
  border: `1px solid rgba(${P.primaryRgb},0.15)`,
  borderRadius: 10,
  padding: '8px 12px',
  fontSize: 13,
  color: P.primary,
  outline: 'none',
};

export default function BudgetPage() {
  const currentTripId = useAppStore((s) => s.currentTripId);
  const {
    budgets,
    expenses,
    summary,
    loading,
    error,
    totalPlanned,
    totalSpent,
    saveBudget,
    saveExpense,
    removeExpense,
  } = useBudget(currentTripId);

  const [tab, setTab] = useState<Tab>('summary');
  const [showExpenseForm, setShowExpenseForm] = useState(false);

  // Estado para editar presupuesto por categoría
  const [editCategory, setEditCategory] = useState<BudgetCategory | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [savingBudget, setSavingBudget] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);

  // Resumen global
  const globalPct =
    totalPlanned > 0 ? Math.min(100, Math.round((totalSpent / totalPlanned) * 100)) : 0;

  const handleSaveBudget = async () => {
    if (!editCategory) return;
    const parsed = parseFloat(editAmount);
    if (!parsed || parsed < 0) {
      setPlanError('Monto inválido');
      return;
    }
    setSavingBudget(true);
    setPlanError(null);
    try {
      await saveBudget(editCategory, parsed);
      setEditCategory(null);
      setEditAmount('');
    } catch (err) {
      setPlanError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSavingBudget(false);
    }
  };

  if (!currentTripId) {
    return (
      <div className="p-6" style={{ color: P.primary }}>
        <AppHeader title="Presupuesto" />
        <p style={{ marginTop: 24, color: P.softTeal, fontSize: 14 }}>
          Selecciona un viaje para gestionar el presupuesto.
        </p>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col min-h-screen"
      style={{ background: P.background, paddingBottom: 80 }}
    >
      {/* Header */}
      <div style={{ padding: '20px 20px 0' }}>
        <AppHeader
          title="Presupuesto"
          right={
            tab === 'expenses' ? (
              <AppButton
                variant="primary"
                onClick={() => setShowExpenseForm(true)}
                style={{ fontSize: 12, padding: '6px 14px' }}
              >
                + Gasto
              </AppButton>
            ) : undefined
          }
        />

        {/* Resumen global */}
        {!loading && totalPlanned > 0 && (
          <div
            style={{
              marginTop: 16,
              background: P.primary,
              borderRadius: 14,
              padding: '14px 16px',
              color: P.background,
            }}
          >
            <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 2 }}>
              Presupuesto total
            </div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>
              {totalSpent.toFixed(2)}
              <span style={{ fontSize: 13, opacity: 0.6, marginLeft: 4 }}>
                / {totalPlanned.toFixed(2)} USD
              </span>
            </div>
            {/* Barra global */}
            <div
              style={{
                marginTop: 10,
                height: 5,
                background: 'rgba(255,255,255,0.15)',
                borderRadius: 999,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${globalPct}%`,
                  height: '100%',
                  background: globalPct >= 90 ? P.accent : P.secondary,
                  borderRadius: 999,
                  transition: 'width 0.5s ease',
                }}
              />
            </div>
            <div style={{ fontSize: 11, opacity: 0.6, marginTop: 4 }}>
              {globalPct}% utilizado
            </div>
          </div>
        )}

        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            gap: 4,
            marginTop: 16,
            background: `rgba(${P.primaryRgb},0.06)`,
            borderRadius: 10,
            padding: 4,
          }}
        >
          {([
            { id: 'summary', label: 'Resumen' },
            { id: 'expenses', label: 'Gastos' },
            { id: 'plan', label: 'Planificar' },
          ] as { id: Tab; label: string }[]).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                flex: 1,
                padding: '8px 0',
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: tab === t.id ? 700 : 400,
                background: tab === t.id ? P.primary : 'transparent',
                color: tab === t.id ? P.background : P.softTeal,
                transition: 'all 0.2s',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '16px 20px', flex: 1 }}>
        {/* Error global */}
        {error && (
          <div
            style={{
              background: `rgba(${P.primaryRgb},0.07)`,
              borderRadius: 10,
              padding: '10px 14px',
              color: P.primary,
              fontSize: 13,
              marginBottom: 12,
            }}
          >
            {error}
          </div>
        )}

        {loading && (
          <p style={{ color: P.softTeal, fontSize: 14, textAlign: 'center', marginTop: 24 }}>
            Cargando...
          </p>
        )}

        {/* TAB: Resumen */}
        {tab === 'summary' && !loading && (
          <div>
            {summary.length === 0 ? (
              <div style={{ textAlign: 'center', marginTop: 32 }}>
                <p style={{ color: P.softTeal, fontSize: 14 }}>
                  Sin datos. Agrega un presupuesto en "Planificar" o registra gastos.
                </p>
              </div>
            ) : (
              summary.map((s) => (
                <BudgetBar key={s.category} summary={s} />
              ))
            )}
          </div>
        )}

        {/* TAB: Gastos */}
        {tab === 'expenses' && !loading && (
          <div>
            {expenses.length === 0 && !showExpenseForm && (
              <div style={{ textAlign: 'center', marginTop: 32 }}>
                <p style={{ color: P.softTeal, fontSize: 14 }}>
                  Sin gastos registrados. Toca "+ Gasto" para agregar.
                </p>
              </div>
            )}

            {/* Formulario de nuevo gasto */}
            <AnimatePresence>
              {showExpenseForm && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  style={{ marginBottom: 16 }}
                >
                  <ExpenseForm
                    onSubmit={async (params) => {
                      await saveExpense(params);
                      setShowExpenseForm(false);
                    }}
                    onCancel={() => setShowExpenseForm(false)}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Lista de gastos */}
            {expenses.map((exp) => {
              const catLabel = BUDGET_CATEGORIES.find((c) => c.id === exp.category)?.label ?? exp.category;
              return (
                <div
                  key={exp.id}
                  style={{
                    background: `rgba(${P.primaryRgb},0.04)`,
                    borderRadius: 12,
                    padding: '12px 14px',
                    marginBottom: 8,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: P.primary }}>
                      {exp.description || catLabel}
                    </div>
                    <div style={{ fontSize: 12, color: P.softTeal, marginTop: 2 }}>
                      {catLabel} · {exp.expenseDate}
                      {exp.paidBy ? ` · Pago: ${exp.paidBy}` : ''}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontWeight: 700, fontSize: 15, color: P.accent }}>
                      {exp.amount.toFixed(2)} {exp.currencyCode}
                    </span>
                    <button
                      onClick={() => void removeExpense(exp.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: P.softTeal,
                        fontSize: 16,
                        padding: 4,
                        lineHeight: 1,
                      }}
                      aria-label="Eliminar gasto"
                    >
                      x
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB: Planificar */}
        {tab === 'plan' && !loading && (
          <div>
            <p style={{ color: P.softTeal, fontSize: 13, marginBottom: 16 }}>
              Asigna un presupuesto planificado por categoria.
            </p>

            {BUDGET_CATEGORIES.map((cat) => {
              const existing = budgets.find((b) => b.category === cat.id);
              const isEditing = editCategory === cat.id;
              return (
                <div
                  key={cat.id}
                  style={{
                    background: `rgba(${P.primaryRgb},0.04)`,
                    borderRadius: 12,
                    padding: '12px 14px',
                    marginBottom: 8,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: 14, color: P.primary }}>
                      {cat.label}
                    </span>
                    {!isEditing && (
                      <button
                        onClick={() => {
                          setEditCategory(cat.id);
                          setEditAmount(existing?.plannedAmount.toString() ?? '');
                          setPlanError(null);
                        }}
                        style={{
                          background: 'none',
                          border: `1px solid rgba(${P.primaryRgb},0.2)`,
                          borderRadius: 8,
                          padding: '4px 12px',
                          cursor: 'pointer',
                          fontSize: 12,
                          color: P.secondary,
                        }}
                      >
                        {existing ? `${existing.plannedAmount.toFixed(2)} ${existing.currencyCode}` : 'Asignar'}
                      </button>
                    )}
                  </div>

                  {isEditing && (
                    <div style={{ marginTop: 10, display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input
                        type="number"
                        inputMode="decimal"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={editAmount}
                        onChange={(e) => setEditAmount(e.target.value)}
                        style={{ ...inputStyle, flex: 1 }}
                        autoFocus
                      />
                      <AppButton
                        variant="primary"
                        onClick={() => void handleSaveBudget()}
                        disabled={savingBudget}
                        style={{ fontSize: 12, padding: '8px 14px' }}
                      >
                        {savingBudget ? '...' : 'Guardar'}
                      </AppButton>
                      <AppButton
                        variant="ghost"
                        onClick={() => { setEditCategory(null); setPlanError(null); }}
                        style={{ fontSize: 12, padding: '8px 10px', color: P.softTeal }}
                      >
                        Cancelar
                      </AppButton>
                    </div>
                  )}
                </div>
              );
            })}

            {planError && (
              <div
                style={{
                  background: `rgba(${P.primaryRgb},0.07)`,
                  borderRadius: 10,
                  padding: '10px 14px',
                  color: P.primary,
                  fontSize: 13,
                  marginTop: 8,
                }}
              >
                {planError}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
