// src/modules/finances/components/ExpenseForm.tsx
// Formulario para añadir un gasto real al viaje
// Paleta oficial VIAZA — CERO emojis — CERO colores fuera de paleta

import { useState } from 'react';
import { AppButton } from '../../../components/ui/AppButton';
import { BUDGET_CATEGORIES, type BudgetCategory } from '../../../services/budgetService';

const P = {
  primary:    '#12212E',
  secondary:  '#307082',
  softTeal:   '#6CA3A2',
  background: '#ECE7DC',
  accent:     '#EA9940',
  primaryRgb: '18,33,46',
};

interface Props {
  onSubmit: (params: {
    category: BudgetCategory;
    amount: number;
    description?: string;
    paidBy?: string;
    expenseDate?: string;
    currencyCode?: string;
  }) => Promise<void>;
  onCancel: () => void;
  defaultCurrency?: string;
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: `rgba(${P.primaryRgb},0.06)`,
  border: `1px solid rgba(${P.primaryRgb},0.15)`,
  borderRadius: 10,
  padding: '10px 12px',
  fontSize: 14,
  color: P.primary,
  outline: 'none',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: P.softTeal,
  marginBottom: 4,
  display: 'block',
};

export function ExpenseForm({ onSubmit, onCancel, defaultCurrency = 'USD' }: Props) {
  const [category, setCategory] = useState<BudgetCategory>('other');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().slice(0, 10));
  const [currencyCode, setCurrencyCode] = useState(defaultCurrency);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(amount);
    if (!parsed || parsed <= 0) {
      setError('Ingresa un monto válido');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSubmit({
        category,
        amount: parsed,
        description: description.trim() || undefined,
        paidBy: paidBy.trim() || undefined,
        expenseDate,
        currencyCode,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      style={{
        background: P.background,
        borderRadius: 16,
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: P.primary }}>
        Nuevo gasto
      </h3>

      {/* Categoría */}
      <div>
        <label style={labelStyle}>Categoria</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as BudgetCategory)}
          style={inputStyle}
        >
          {BUDGET_CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
      </div>

      {/* Monto + moneda */}
      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Monto</label>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={inputStyle}
            required
          />
        </div>
        <div style={{ width: 72 }}>
          <label style={labelStyle}>Moneda</label>
          <input
            type="text"
            maxLength={3}
            placeholder="USD"
            value={currencyCode}
            onChange={(e) => setCurrencyCode(e.target.value.toUpperCase())}
            style={inputStyle}
          />
        </div>
      </div>

      {/* Descripcion */}
      <div>
        <label style={labelStyle}>Descripcion (opcional)</label>
        <input
          type="text"
          placeholder="Taxi al aeropuerto..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={inputStyle}
        />
      </div>

      {/* Quien pago */}
      <div>
        <label style={labelStyle}>Pagado por (opcional)</label>
        <input
          type="text"
          placeholder="Tu nombre o el del grupo"
          value={paidBy}
          onChange={(e) => setPaidBy(e.target.value)}
          style={inputStyle}
        />
      </div>

      {/* Fecha */}
      <div>
        <label style={labelStyle}>Fecha</label>
        <input
          type="date"
          value={expenseDate}
          onChange={(e) => setExpenseDate(e.target.value)}
          style={inputStyle}
        />
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            background: `rgba(${P.primaryRgb},0.07)`,
            borderRadius: 8,
            padding: '8px 12px',
            fontSize: 13,
            color: P.primary,
          }}
        >
          {error}
        </div>
      )}

      {/* Acciones */}
      <div style={{ display: 'flex', gap: 10 }}>
        <AppButton
          variant="ghost"
          type="button"
          onClick={onCancel}
          style={{ flex: 1, color: P.softTeal }}
        >
          Cancelar
        </AppButton>
        <AppButton
          variant="primary"
          type="submit"
          disabled={saving}
          style={{ flex: 2 }}
        >
          {saving ? 'Guardando...' : 'Guardar gasto'}
        </AppButton>
      </div>
    </form>
  );
}
