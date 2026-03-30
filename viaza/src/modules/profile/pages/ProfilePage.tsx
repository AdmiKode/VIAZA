import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppButton } from '../../../components/ui/AppButton';
import { AppCard } from '../../../components/ui/AppCard';
import { AppHeader } from '../../../components/ui/AppHeader';
import { useAppStore } from '../../../app/store/useAppStore';
import { supabase } from '../../../services/supabaseClient';

const C = {
  dark: '#12212E',
  mid: '#307082',
  light: '#6CA3A2',
  bg: '#ECE7DC',
  accent: '#EA9940',
};

function NavRow({ to, label, sub }: { to: string; label: string; sub: string }) {
  return (
    <Link to={to} style={{ textDecoration: 'none' }}>
      <div style={{
        background: 'white', borderRadius: 16, padding: '14px 18px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 2px 12px rgba(18,33,46,0.07)',
      }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.dark }}>{label}</div>
          <div style={{ fontSize: 12, color: 'rgba(18,33,46,0.50)', marginTop: 2 }}>{sub}</div>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.light} strokeWidth="2.5" strokeLinecap="round">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </div>
    </Link>
  );
}

export function ProfilePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAppStore((s) => s.user);
  const trips = useAppStore((s) => s.trips);
  const currentTripId = useAppStore((s) => s.currentTripId);
  const logout = useAppStore((s) => s.logout);
  const setSupabaseUser = useAppStore((s) => s.setSupabaseUser);

  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name ?? '');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const initial = (user?.name ?? user?.email ?? 'V').charAt(0).toUpperCase();

  const recentTrips = [...trips]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  async function handleSaveName() {
    if (!nameInput.trim() || nameInput.trim() === user?.name) { setEditing(false); return; }
    setSaving(true);
    setSaveError(null);
    try {
      const { data, error } = await supabase.auth.updateUser({ data: { full_name: nameInput.trim() } });
      if (error) throw error;
      if (data.user) {
        setSupabaseUser({
          id: data.user.id,
          email: data.user.email ?? user?.email ?? '',
          name: (data.user.user_metadata?.full_name as string) ?? nameInput.trim(),
        });
      }
      setEditing(false);
    } catch (e) {
      setSaveError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="px-4 pt-4 pb-28" style={{ fontFamily: 'Questrial, sans-serif' }}>
      <AppHeader title={t('profile.title')} />

      {/* Avatar + nombre */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginTop: 24, marginBottom: 24 }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: `linear-gradient(135deg, ${C.mid} 0%, ${C.light} 100%)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 32, fontWeight: 800, color: 'white',
          boxShadow: '0 6px 24px rgba(48,112,130,0.30)',
        }}>
          {initial}
        </div>

        {editing ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, width: '100%', maxWidth: 280 }}>
            <input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 14,
                border: `1.5px solid ${C.light}`,
                fontSize: 15, fontFamily: 'Questrial, sans-serif', color: C.dark,
                background: 'white', outline: 'none', textAlign: 'center',
              }}
              autoFocus
              onKeyDown={(e) => { if (e.key === 'Enter') void handleSaveName(); }}
            />
            {saveError && <div style={{ fontSize: 12, color: C.accent }}>{saveError}</div>}
            <div style={{ display: 'flex', gap: 8, width: '100%' }}>
              <button type="button" onClick={() => setEditing(false)} style={{
                flex: 1, padding: '10px', borderRadius: 14,
                border: `1.5px solid rgba(18,33,46,0.12)`,
                background: 'white', fontSize: 13, fontWeight: 700, color: C.dark, cursor: 'pointer',
              }}>
                {t('common.cancel')}
              </button>
              <button type="button" onClick={() => void handleSaveName()} disabled={saving} style={{
                flex: 1, padding: '10px', borderRadius: 14, border: 'none',
                background: C.accent, fontSize: 13, fontWeight: 700, color: 'white', cursor: 'pointer',
                opacity: saving ? 0.6 : 1,
              }}>
                {saving ? t('common.saving') : t('common.save')}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
              <span style={{ fontSize: 20, fontWeight: 800, color: C.dark }}>{user?.name ?? '-'}</span>
              <button
                type="button"
                onClick={() => { setNameInput(user?.name ?? ''); setEditing(true); }}
                style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer' }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={C.light} strokeWidth="2" strokeLinecap="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
            </div>
            <div style={{ fontSize: 13, color: 'rgba(18,33,46,0.50)', marginTop: 2 }}>{user?.email ?? ''}</div>
          </div>
        )}
      </div>

      {/* Tarjeta Emergency */}
      <Link to="/profile/emergency" style={{ textDecoration: 'none', display: 'block', marginBottom: 12 }}>
        <div style={{
          background: `linear-gradient(135deg, ${C.dark} 0%, ${C.mid} 60%, ${C.light} 100%)`,
          borderRadius: 18, padding: '16px 18px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          boxShadow: '0 6px 22px rgba(18,33,46,0.18)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 44, height: 44, background: 'rgba(255,255,255,0.15)',
              borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
                <path d="M14 14h3v3M17 20h3M20 17v3" />
              </svg>
            </div>
            <div>
              <div style={{ color: 'white', fontSize: 15, fontWeight: 800 }}>{t('profile.emergency.title')}</div>
              <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 2 }}>{t('profile.emergency.subtitle')}</div>
            </div>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" strokeLinecap="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </div>
      </Link>

      {/* Viajes recientes */}
      {recentTrips.length > 0 && (
        <AppCard className="mb-3">
          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(18,33,46,0.45)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>
            {t('profile.recentTrips')}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recentTrips.map((trip) => (
              <Link key={trip.id} to={`/trip/${trip.id}`} style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 12px', borderRadius: 12,
                  background: trip.id === currentTripId ? `rgba(48,112,130,0.10)` : 'rgba(18,33,46,0.04)',
                  border: trip.id === currentTripId ? `1.5px solid rgba(48,112,130,0.20)` : '1.5px solid transparent',
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.dark }}>{trip.destination}</div>
                    <div style={{ fontSize: 11, color: 'rgba(18,33,46,0.50)', marginTop: 1 }}>
                      {trip.startDate} · {trip.durationDays ?? '?'} {t('common.days')}
                    </div>
                  </div>
                  {trip.id === currentTripId && (
                    <div style={{
                      fontSize: 10, fontWeight: 800, color: C.mid,
                      background: `rgba(48,112,130,0.12)`,
                      borderRadius: 8, padding: '3px 8px',
                    }}>
                      {t('profile.activeTrip')}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
          <Link to="/history" style={{ textDecoration: 'none', display: 'block', marginTop: 10 }}>
            <div style={{ fontSize: 12, color: C.mid, fontWeight: 700, textAlign: 'center' }}>
              {t('profile.allTrips')} →
            </div>
          </Link>
        </AppCard>
      )}

      {/* Accesos rápidos */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 8 }}>
        <NavRow to="/settings" label={t('settings.title')} sub={t('profile.settingsSub')} />
        <NavRow to="/premium" label={t('premium.title')} sub={t('profile.premiumSub')} />
        <NavRow to="/history" label={t('profile.myTrips')} sub={t('profile.myTripsSub')} />
      </div>

      {/* Cerrar sesión */}
      <div style={{ marginTop: 16 }}>
        <AppButton
          className="w-full"
          onClick={() => { void logout().then(() => navigate('/auth/login', { replace: true })); }}
          type="button"
        >
          {t('profile.logout')}
        </AppButton>
      </div>

      {/* Versión */}
      <div style={{ textAlign: 'center', marginTop: 20, fontSize: 11, color: 'rgba(18,33,46,0.30)' }}>
        VIAZA v0.1.0
      </div>
    </div>
  );
}

