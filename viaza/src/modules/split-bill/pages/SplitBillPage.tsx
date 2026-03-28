// src/modules/split-bill/pages/SplitBillPage.tsx
//
// Split Bill con persistencia en Supabase (Sprint 1).
//
// DISEÑO:
//   - La calculadora rápida sigue funcionando sin conexión (estado local).
//   - "Nueva cuenta guardada" persiste la sesión + gastos en split_bill_sessions / split_bill_expenses.
//   - "Cuentas guardadas" muestra el historial del viaje actual desde DB.
//   - Schema usado: el exacto de schema_viaza.sql (leído antes de escribir este archivo).
//
// ALCANCE:
//   - Modo offline (sin señal): la calculadora funciona, guardar fallará.
//     No hay cola local en Sprint 1. El error se muestra al usuario.

import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { AppHeader } from '../../../components/ui/AppHeader';
import { AppCard } from '../../../components/ui/AppCard';
import { AppInput } from '../../../components/ui/AppInput';
import { AppButton } from '../../../components/ui/AppButton';
import { splitBill } from '../utils/splitBillCalculator';
import { useAppStore } from '../../../app/store/useAppStore';
import {
  addSplitExpense,
  calculateDebts,
  createSplitSession,
  deleteSplitExpense,
  deleteSplitSession,
  getExpensesBySession,
  getSessionsByTrip,
  SplitBillExpense,
  SplitBillSession,
  SplitParticipant,
} from '../../../services/splitBillService';

type PersonRow = { id: string; name: string; amount: string };

function newId() {
  return crypto.randomUUID();
}

// Alias para compatibilidad con la calculadora original
function id() { return newId(); }

// ─── Calculadora rápida (original sin cambios de lógica) ─────────────────────

function QuickCalculator({ onSaveClick }: { onSaveClick?: () => void }) {
  const { t } = useTranslation();
  const [total, setTotal] = useState('1200');
  const [people, setPeople] = useState('3');
  const [tipPct, setTipPct] = useState('10');
  const [advanced, setAdvanced] = useState(false);
  const [rows, setRows] = useState<PersonRow[]>([
    { id: id(), name: '', amount: '0' },
    { id: id(), name: '', amount: '0' }
  ]);

  const numericTotal = Number(total);
  const numericPeople = Number(people);
  const numericTip = Number(tipPct);
  const perPerson = useMemo(
    () => splitBill({ total: numericTotal, people: numericPeople, tipPct: numericTip }),
    [numericTotal, numericPeople, numericTip]
  );
  const advancedTotal = useMemo(() => rows.reduce((s, r) => s + (Number(r.amount) || 0), 0), [rows]);

  return (
    <div className="space-y-3">
      <AppCard>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="text-xs font-semibold text-[rgb(var(--viaza-primary-rgb)/0.60)]">
              {t('splitBill.total')}
            </div>
            <div className="mt-2">
              <AppInput value={total} onChange={(e) => setTotal(e.target.value)} inputMode="decimal" />
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-[rgb(var(--viaza-primary-rgb)/0.60)]">
              {t('splitBill.people')}
            </div>
            <div className="mt-2">
              <AppInput value={people} onChange={(e) => setPeople(e.target.value)} inputMode="numeric" />
            </div>
          </div>
        </div>

        <div className="mt-3">
          <div className="text-xs font-semibold text-[rgb(var(--viaza-primary-rgb)/0.60)]">
            {t('splitBill.tipPct')}
          </div>
          <div className="mt-2">
            <AppInput value={tipPct} onChange={(e) => setTipPct(e.target.value)} inputMode="numeric" />
          </div>
        </div>

        <div className="mt-4">
          <AppButton variant="secondary" className="w-full" onClick={() => setAdvanced((v) => !v)} type="button">
            {advanced ? t('splitBill.advanced.hide') : t('splitBill.advanced.show')}
          </AppButton>
        </div>
      </AppCard>

      {advanced ? (
        <AppCard>
          <div className="text-sm font-semibold">{t('splitBill.advanced.title')}</div>
          <div className="mt-2 space-y-2">
            {rows.map((r) => (
              <div key={r.id} className="flex gap-2">
                <AppInput
                  value={r.name}
                  onChange={(e) => setRows((s) => s.map((x) => (x.id === r.id ? { ...x, name: e.target.value } : x)))}
                  placeholder={t('splitBill.person')}
                />
                <AppInput
                  value={r.amount}
                  onChange={(e) =>
                    setRows((s) => s.map((x) => (x.id === r.id ? { ...x, amount: e.target.value } : x)))
                  }
                  inputMode="decimal"
                  placeholder={t('splitBill.amount')}
                />
                <button
                  type="button"
                  className="rounded-2xl px-3 text-xs text-[rgb(var(--viaza-primary-rgb)/0.70)]"
                  onClick={() => setRows((s) => s.filter((x) => x.id !== r.id))}
                >
                  {t('common.remove')}
                </button>
              </div>
            ))}
          </div>
          <div className="mt-3">
            <AppButton
              className="w-full"
              onClick={() => setRows((s) => [...s, { id: id(), name: t('splitBill.person'), amount: '0' }])}
              type="button"
            >
              {t('splitBill.advanced.addPerson')}
            </AppButton>
          </div>
          <div className="mt-3 text-xs text-[rgb(var(--viaza-primary-rgb)/0.60)]">
            {t('splitBill.advanced.total', { total: advancedTotal.toFixed(2) })}
          </div>
        </AppCard>
      ) : null}

      <AppCard>
        <div className="text-xs font-semibold text-[rgb(var(--viaza-primary-rgb)/0.60)]">{t('splitBill.result')}</div>
        <div className="mt-2 text-3xl font-semibold">{Number.isFinite(perPerson) ? perPerson.toFixed(2) : '0.00'}</div>
        <div className="mt-2 text-xs text-[rgb(var(--viaza-primary-rgb)/0.60)]">{t('splitBill.note')}</div>
      </AppCard>

      {onSaveClick && (
        <AppButton className="w-full" variant="secondary" type="button" onClick={onSaveClick}>
          Guardar como cuenta del viaje →
        </AppButton>
      )}
    </div>
  );
}

// ─── Vista de sesión con gastos ───────────────────────────────────────────────

function SessionDetail({
  session,
  onBack,
  onDelete,
}: {
  session: SplitBillSession;
  onBack: () => void;
  onDelete: () => void;
}) {
  const [expenses, setExpenses] = useState<SplitBillExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState(session.participants[0]?.name ?? '');
  const [splitAmong, setSplitAmong] = useState<string[]>(session.participants.map((p) => p.name));
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void getExpensesBySession(session.id)
      .then((data) => { if (!cancelled) { setExpenses(data); setLoading(false); } })
      .catch((e: Error) => { if (!cancelled) { setError(e.message); setLoading(false); } });
    return () => { cancelled = true; };
  }, [session.id]);

  const debts = useMemo(() => calculateDebts(expenses, session.participants), [expenses, session.participants]);
  const totalSpent = useMemo(() => expenses.reduce((s, e) => s + e.amount, 0), [expenses]);

  async function handleAddExpense() {
    if (!desc.trim() || !amount || !paidBy) return;
    setSaving(true); setError(null);
    try {
      const expense = await addSplitExpense({
        sessionId: session.id, description: desc.trim(),
        amount: Number(amount), paidBy, splitAmong,
      });
      setExpenses((prev) => [...prev, expense]);
      setDesc(''); setAmount('');
    } catch (e) { setError((e as Error).message); }
    finally { setSaving(false); }
  }

  async function handleDeleteExpense(expenseId: string) {
    try {
      await deleteSplitExpense(expenseId);
      setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
    } catch (e) { setError((e as Error).message); }
  }

  async function handleDeleteSession() {
    setDeleting(true);
    try { await deleteSplitSession(session.id); onDelete(); }
    catch (e) { setError((e as Error).message); setDeleting(false); }
  }

  return (
    <div className="space-y-4">
      <AppHeader title={session.title} right={<button type="button" onClick={onBack} className="text-sm text-[rgb(var(--viaza-primary-rgb)/0.60)]">← Volver</button>} />

      <AppCard>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-[rgb(var(--viaza-primary-rgb)/0.60)]">Total gastado</div>
            <div className="text-2xl font-bold mt-1">{totalSpent.toFixed(2)} {session.currency}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-[rgb(var(--viaza-primary-rgb)/0.60)]">Participantes</div>
            <div className="text-sm font-semibold mt-1">{session.participants.map((p) => p.name).join(', ')}</div>
          </div>
        </div>
      </AppCard>

      {debts.length > 0 && (
        <AppCard>
          <div className="text-xs font-semibold text-[rgb(var(--viaza-primary-rgb)/0.60)] mb-3">Liquidación</div>
          <div className="space-y-2">
            {debts.map((d, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span><strong>{d.from}</strong> → {d.to}</span>
                <span className="font-semibold">{d.amount.toFixed(2)} {session.currency}</span>
              </div>
            ))}
          </div>
        </AppCard>
      )}

      <AppCard>
        <div className="text-sm font-semibold mb-3">Añadir gasto</div>
        <div className="space-y-3">
          <AppInput value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Descripción (Cena, taxi...)" />
          <AppInput value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Monto" inputMode="decimal" />
          <div>
            <div className="text-xs font-semibold text-[rgb(var(--viaza-primary-rgb)/0.60)] mb-1">Pagó</div>
            <div className="flex flex-wrap gap-2">
              {session.participants.map((p) => (
                <button key={p.id} type="button" onClick={() => setPaidBy(p.name)}
                  className="rounded-2xl px-3 py-1.5 text-sm font-semibold transition"
                  style={{ background: paidBy === p.name ? '#12212E' : 'rgba(18,33,46,0.08)', color: paidBy === p.name ? 'white' : '#12212E' }}>
                  {p.name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-[rgb(var(--viaza-primary-rgb)/0.60)] mb-1">Divide entre (vacío = todos)</div>
            <div className="flex flex-wrap gap-2">
              {session.participants.map((p) => {
                const checked = splitAmong.includes(p.name);
                return (
                  <button key={p.id} type="button"
                    onClick={() => setSplitAmong((prev) => checked ? prev.filter((n) => n !== p.name) : [...prev, p.name])}
                    className="rounded-2xl px-3 py-1.5 text-sm font-semibold transition"
                    style={{ background: checked ? '#EA9940' : 'rgba(18,33,46,0.08)', color: checked ? 'white' : '#12212E' }}>
                    {p.name}
                  </button>
                );
              })}
            </div>
          </div>
          <AppButton className="w-full" type="button" disabled={!desc.trim() || !amount || saving} onClick={handleAddExpense}>
            {saving ? 'Guardando...' : 'Añadir gasto'}
          </AppButton>
        </div>
      </AppCard>

      {loading ? (
        <div className="text-center text-sm text-[rgb(var(--viaza-primary-rgb)/0.50)] py-4">Cargando gastos...</div>
      ) : expenses.length === 0 ? (
        <div className="text-center text-sm text-[rgb(var(--viaza-primary-rgb)/0.50)] py-4">Sin gastos todavía</div>
      ) : (
        <AppCard>
          <div className="text-xs font-semibold text-[rgb(var(--viaza-primary-rgb)/0.60)] mb-3">Gastos</div>
          <div className="space-y-3">
            {expenses.map((e) => (
              <div key={e.id} className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{e.description}</div>
                  <div className="text-xs text-[rgb(var(--viaza-primary-rgb)/0.55)]">
                    Pagó {e.paid_by} · divide {e.split_among.length === 0 ? 'todos' : e.split_among.join(', ')}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-sm font-bold">{e.amount.toFixed(2)} {session.currency}</div>
                  <button type="button" className="text-xs text-[rgb(var(--viaza-primary-rgb)/0.40)] mt-0.5" onClick={() => handleDeleteExpense(e.id)}>Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        </AppCard>
      )}

      {error && (
        <div className="rounded-2xl px-4 py-3 text-sm font-semibold" style={{ background: 'rgba(18,33,46,0.07)', color: '#12212E' }}>{error}</div>
      )}

      <button type="button" className="w-full text-sm text-[rgb(var(--viaza-primary-rgb)/0.40)] py-3" onClick={handleDeleteSession} disabled={deleting}>
        {deleting ? 'Eliminando...' : 'Eliminar esta cuenta'}
      </button>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export function SplitBillPage() {
  const { t } = useTranslation();
  const trip = useAppStore((s) => s.trips.find((x) => x.id === s.currentTripId) ?? null);

  const [tab, setTab] = useState<'calculator' | 'sessions'>('calculator');
  const [sessions, setSessions] = useState<SplitBillSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [sessionsError, setSessionsError] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<SplitBillSession | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCurrency, setNewCurrency] = useState(trip?.currencyCode ?? 'USD');
  const [newParticipants, setNewParticipants] = useState<SplitParticipant[]>([
    { id: newId(), name: '' }, { id: newId(), name: '' },
  ]);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    if (tab !== 'sessions' || !trip?.id) return;
    setLoadingSessions(true); setSessionsError(null);
    void getSessionsByTrip(trip.id)
      .then((data) => { setSessions(data); setLoadingSessions(false); })
      .catch((e: Error) => { setSessionsError(e.message); setLoadingSessions(false); });
  }, [tab, trip?.id]);

  async function handleCreateSession() {
    if (!newTitle.trim() || !trip?.id) return;
    const validParticipants = newParticipants.filter((p) => p.name.trim());
    if (validParticipants.length < 2) { setCreateError('Agrega al menos 2 participantes'); return; }
    setCreating(true); setCreateError(null);
    try {
      const session = await createSplitSession({
        tripId: trip.id, title: newTitle.trim(),
        currency: newCurrency.trim() || 'USD',
        participants: validParticipants.map((p) => ({ ...p, name: p.name.trim() })),
      });
      setSessions((prev) => [session, ...prev]);
      setShowNewForm(false); setNewTitle('');
      setNewParticipants([{ id: newId(), name: '' }, { id: newId(), name: '' }]);
      setSelectedSession(session);
    } catch (e) { setCreateError((e as Error).message); }
    finally { setCreating(false); }
  }

  if (selectedSession) {
    return (
      <div className="px-4 pt-4 pb-24">
        <SessionDetail
          session={selectedSession}
          onBack={() => setSelectedSession(null)}
          onDelete={() => { setSessions((prev) => prev.filter((s) => s.id !== selectedSession.id)); setSelectedSession(null); }}
        />
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 pb-24">
      <AppHeader title={t('splitBill.title')} />

      <div className="mt-4 flex gap-2">
        {(['calculator', 'sessions'] as const).map((t_) => (
          <button key={t_} type="button" onClick={() => setTab(t_)}
            className="flex-1 rounded-2xl py-2.5 text-sm font-semibold transition"
            style={{ background: tab === t_ ? '#12212E' : 'rgba(18,33,46,0.08)', color: tab === t_ ? 'white' : '#12212E' }}>
            {t_ === 'calculator' ? 'Calculadora' : 'Cuentas guardadas'}
          </button>
        ))}
      </div>

      <div className="mt-4">
        <AnimatePresence mode="wait">
          {tab === 'calculator' ? (
            <motion.div key="calc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <QuickCalculator onSaveClick={trip?.id ? () => { setShowNewForm(true); setTab('sessions'); } : undefined} />
            </motion.div>
          ) : (
            <motion.div key="sessions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              {!showNewForm ? (
                <AppButton className="w-full" type="button" onClick={() => setShowNewForm(true)}>+ Nueva cuenta guardada</AppButton>
              ) : (
                <AppCard>
                  <div className="text-sm font-semibold mb-3">Nueva cuenta</div>
                  <div className="space-y-3">
                    <AppInput value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Nombre (Cena Oaxaca, Tour...)" />
                    <AppInput value={newCurrency} onChange={(e) => setNewCurrency(e.target.value)} placeholder="Moneda (MXN, USD...)" />
                    <div>
                      <div className="text-xs font-semibold text-[rgb(var(--viaza-primary-rgb)/0.60)] mb-2">Participantes</div>
                      <div className="space-y-2">
                        {newParticipants.map((p) => (
                          <div key={p.id} className="flex gap-2">
                            <AppInput value={p.name}
                              onChange={(e) => setNewParticipants((prev) => prev.map((x) => (x.id === p.id ? { ...x, name: e.target.value } : x)))}
                              placeholder="Nombre" />
                            {newParticipants.length > 2 && (
                              <button type="button" className="text-xs text-[rgb(var(--viaza-primary-rgb)/0.40)] px-2"
                                onClick={() => setNewParticipants((prev) => prev.filter((x) => x.id !== p.id))}>✕</button>
                            )}
                          </div>
                        ))}
                      </div>
                      <button type="button" className="mt-2 text-sm text-[rgb(var(--viaza-primary-rgb)/0.60)]"
                        onClick={() => setNewParticipants((prev) => [...prev, { id: newId(), name: '' }])}>
                        + Añadir participante
                      </button>
                    </div>
                    {createError && <div className="text-xs font-semibold" style={{ color: '#12212E' }}>{createError}</div>}
                    <div className="flex gap-2">
                      <AppButton className="flex-1" variant="secondary" type="button" onClick={() => { setShowNewForm(false); setCreateError(null); }}>Cancelar</AppButton>
                      <AppButton className="flex-1" type="button" disabled={!newTitle.trim() || creating} onClick={handleCreateSession}>
                        {creating ? 'Guardando...' : 'Crear'}
                      </AppButton>
                    </div>
                  </div>
                </AppCard>
              )}

              {!trip?.id ? (
                <div className="text-center text-sm text-[rgb(var(--viaza-primary-rgb)/0.50)] py-6">Selecciona un viaje para ver cuentas guardadas</div>
              ) : loadingSessions ? (
                <div className="text-center text-sm text-[rgb(var(--viaza-primary-rgb)/0.50)] py-6">Cargando...</div>
              ) : sessionsError ? (
                <div className="rounded-2xl px-4 py-3 text-sm font-semibold" style={{ background: 'rgba(18,33,46,0.07)', color: '#12212E' }}>{sessionsError}</div>
              ) : sessions.length === 0 ? (
                <div className="text-center text-sm text-[rgb(var(--viaza-primary-rgb)/0.50)] py-6">No hay cuentas guardadas para este viaje</div>
              ) : (
                <div className="space-y-3">
                  {sessions.map((session) => (
                    <button key={session.id} type="button" className="w-full text-left" onClick={() => setSelectedSession(session)}>
                      <AppCard>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-semibold">{session.title}</div>
                            <div className="text-xs text-[rgb(var(--viaza-primary-rgb)/0.55)] mt-1">
                              {session.participants.map((p) => p.name).join(', ')} · {session.currency}
                            </div>
                          </div>
                          <div className="text-[rgb(var(--viaza-primary-rgb)/0.40)] text-lg">›</div>
                        </div>
                      </AppCard>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
  const { t } = useTranslation();
  const [total, setTotal] = useState('1200');
  const [people, setPeople] = useState('3');
  const [tipPct, setTipPct] = useState('10');
  const [advanced, setAdvanced] = useState(false);

