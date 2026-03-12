/**
 * BusinessTripPage
 * Modo viaje de trabajo: sin maleta completa, checklist rápido de essentials,
 * agenda de juntas/eventos, y herramientas de productividad.
 * Sin mocks — datos reales del store.
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../../app/store/useAppStore';

interface BusinessItem {
  id: string;
  labelKey: string;
  category: 'documents' | 'tech' | 'clothes' | 'essentials';
  checked: boolean;
}

const BUSINESS_ESSENTIALS: Omit<BusinessItem, 'checked'>[] = [
  { id: 'passport_id', labelKey: 'business.item.passport', category: 'documents' },
  { id: 'boarding_pass', labelKey: 'business.item.boardingPass', category: 'documents' },
  { id: 'hotel_confirm', labelKey: 'business.item.hotelConfirm', category: 'documents' },
  { id: 'business_cards', labelKey: 'business.item.businessCards', category: 'documents' },
  { id: 'laptop', labelKey: 'business.item.laptop', category: 'tech' },
  { id: 'charger', labelKey: 'business.item.charger', category: 'tech' },
  { id: 'adapter', labelKey: 'business.item.adapter', category: 'tech' },
  { id: 'headphones', labelKey: 'business.item.headphones', category: 'tech' },
  { id: 'formal_shirt', labelKey: 'business.item.formalShirt', category: 'clothes' },
  { id: 'formal_pants', labelKey: 'business.item.formalPants', category: 'clothes' },
  { id: 'shoes', labelKey: 'business.item.shoes', category: 'clothes' },
  { id: 'meds', labelKey: 'business.item.meds', category: 'essentials' },
  { id: 'cash', labelKey: 'business.item.cash', category: 'essentials' },
];

const CAT_ICONS: Record<BusinessItem['category'], JSX.Element> = {
  documents: (
    <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
      <rect x="8" y="4" width="32" height="40" rx="5" fill="#EA9940" />
      <rect x="8" y="4" width="32" height="18" rx="5" fill="rgba(180,192,200,0.55)" />
      <rect x="14" y="20" width="20" height="3" rx="1.5" fill="white" opacity="0.7" />
      <rect x="14" y="26" width="14" height="3" rx="1.5" fill="white" opacity="0.5" />
    </svg>
  ),
  tech: (
    <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
      <rect x="6" y="10" width="36" height="24" rx="5" fill="#EA9940" />
      <rect x="6" y="10" width="36" height="12" rx="5" fill="rgba(180,192,200,0.55)" />
      <rect x="18" y="34" width="12" height="5" rx="2" fill="#EA9940" />
    </svg>
  ),
  clothes: (
    <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
      <path d="M6 14l10-8h4l-4 8v26H32V14l-4-8h4l10 8-6 6V44H6V20z" fill="#EA9940" />
      <path d="M16 6l-4 8 6 4V6z" fill="rgba(180,192,200,0.55)" />
    </svg>
  ),
  essentials: (
    <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
      <path d="M24 4l5 10 11 1.6-8 7.8 1.9 11L24 29l-9.9 5.4L16 23.4 8 15.6 19 14z" fill="#EA9940" />
      <path d="M24 4l5 10 11 1.6-8 7.8" fill="rgba(180,192,200,0.55)" />
    </svg>
  ),
};

interface Meeting {
  id: string;
  title: string;
  time: string;
  location: string;
  notes: string;
}

export function BusinessTripPage() {
  const { t } = useTranslation();
  const currentTripId = useAppStore((s) => s.currentTripId);
  const trips = useAppStore((s) => s.trips);
  const currentTrip = trips.find((tr) => tr.id === currentTripId);

  const [checklist, setChecklist] = useState<BusinessItem[]>(
    BUSINESS_ESSENTIALS.map((item) => ({ ...item, checked: false }))
  );
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [showAddMeeting, setShowAddMeeting] = useState(false);
  const [newMeeting, setNewMeeting] = useState({ title: '', time: '', location: '', notes: '' });

  const checkedCount = checklist.filter((x) => x.checked).length;
  const totalCount = checklist.length;
  const progressPct = Math.round((checkedCount / totalCount) * 100);

  const toggleItem = (id: string) => {
    setChecklist((prev) => prev.map((x) => x.id === id ? { ...x, checked: !x.checked } : x));
  };

  const addMeeting = () => {
    if (!newMeeting.title.trim()) return;
    setMeetings((prev) => [...prev, { ...newMeeting, id: Date.now().toString() }]);
    setNewMeeting({ title: '', time: '', location: '', notes: '' });
    setShowAddMeeting(false);
  };

  const categories: BusinessItem['category'][] = ['documents', 'tech', 'clothes', 'essentials'];

  return (
    <div style={{
      minHeight: '100vh',
      background: '#ECE7DC',
      fontFamily: 'Questrial, sans-serif',
      paddingBottom: 100,
    }}>
      {/* Header */}
      <div style={{
        padding: '56px 20px 20px',
        background: 'linear-gradient(160deg, #12212E 0%, #1a3a4a 100%)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: 'rgba(234,153,64,0.20)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <svg width="22" height="22" viewBox="0 0 48 48" fill="none">
              <rect x="8" y="14" width="32" height="26" rx="4" fill="#EA9940" />
              <rect x="8" y="14" width="32" height="12" rx="4" fill="rgba(180,192,200,0.55)" />
              <path d="M18 14v-4a6 6 0 0 1 12 0v4" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" />
            </svg>
          </div>
          <div>
            <h1 style={{ color: 'white', fontSize: 22, fontWeight: 700 }}>
              {t('business.title')}
            </h1>
            {currentTrip && (
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>
                {currentTrip.destination}
              </p>
            )}
          </div>
        </div>

        {/* Progress */}
        <div style={{ background: 'rgba(255,255,255,0.10)', borderRadius: 99, height: 6, overflow: 'hidden' }}>
          <motion.div
            style={{ height: '100%', background: '#EA9940', borderRadius: 99 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.6 }}
          />
        </div>
        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, marginTop: 6 }}>
          {checkedCount}/{totalCount} {t('business.itemsReady')}
        </p>
      </div>

      {/* Checklist por categoría */}
      <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {categories.map((cat) => {
          const items = checklist.filter((x) => x.category === cat);
          const catChecked = items.filter((x) => x.checked).length;
          const catDone = catChecked === items.length;

          return (
            <div
              key={cat}
              style={{
                background: 'white',
                borderRadius: 20,
                overflow: 'hidden',
                boxShadow: catDone ? '0 4px 16px rgba(48,112,130,0.12)' : '0 2px 12px rgba(18,33,46,0.06)',
                border: catDone ? '1.5px solid rgba(48,112,130,0.25)' : '1.5px solid transparent',
              }}
            >
              {/* Header categoría */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '14px 16px',
                borderBottom: '1px solid rgba(18,33,46,0.06)',
              }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: catDone ? 'rgba(48,112,130,0.10)' : 'rgba(234,153,64,0.10)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {catDone ? (
                    <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
                      <circle cx="24" cy="24" r="20" fill="#307082" />
                      <path d="M14 24l8 8 12-12" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </svg>
                  ) : CAT_ICONS[cat]}
                </div>
                <span style={{ fontWeight: 700, fontSize: 14, color: catDone ? '#307082' : '#12212E' }}>
                  {t(`business.cat.${cat}`)}
                </span>
                <span style={{ marginLeft: 'auto', fontSize: 12, color: 'rgba(18,33,46,0.40)', fontWeight: 600 }}>
                  {catChecked}/{items.length}
                </span>
              </div>

              {/* Items */}
              <div style={{ padding: '8px 12px 12px' }}>
                {items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleItem(item.id)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '10px 8px',
                      borderRadius: 12,
                      background: item.checked ? 'rgba(48,112,130,0.05)' : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      marginBottom: 2,
                    }}
                  >
                    <div style={{
                      width: 22,
                      height: 22,
                      borderRadius: 7,
                      background: item.checked ? '#307082' : 'rgba(18,33,46,0.08)',
                      border: item.checked ? 'none' : '1.5px solid rgba(18,33,46,0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      transition: 'all 0.2s',
                    }}>
                      {item.checked && (
                        <svg width="12" height="12" viewBox="0 0 48 48" fill="none">
                          <path d="M10 24l10 10 18-18" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                        </svg>
                      )}
                    </div>
                    <span style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: item.checked ? 'rgba(18,33,46,0.40)' : '#12212E',
                      textDecoration: item.checked ? 'line-through' : 'none',
                      fontFamily: 'Questrial, sans-serif',
                    }}>
                      {t(item.labelKey)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Agenda de juntas */}
      <div style={{ padding: '0 16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#12212E' }}>
            {t('business.meetings')}
          </h2>
          <button
            type="button"
            onClick={() => setShowAddMeeting(true)}
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              background: '#EA9940',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 48 48" fill="none">
              <path d="M24 10v28M10 24h28" stroke="white" strokeWidth="4" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {meetings.length === 0 && !showAddMeeting && (
          <div style={{
            background: 'white',
            borderRadius: 16,
            padding: '20px',
            textAlign: 'center',
            color: 'rgba(18,33,46,0.35)',
            fontSize: 13,
          }}>
            {t('business.noMeetings')}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {meetings.map((meeting) => (
            <div
              key={meeting.id}
              style={{
                background: 'white',
                borderRadius: 16,
                padding: '14px 16px',
                boxShadow: '0 2px 8px rgba(18,33,46,0.06)',
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 14, color: '#12212E' }}>{meeting.title}</div>
              {meeting.time && (
                <div style={{ fontSize: 12, color: '#307082', marginTop: 3, fontWeight: 600 }}>{meeting.time}</div>
              )}
              {meeting.location && (
                <div style={{ fontSize: 12, color: 'rgba(18,33,46,0.50)', marginTop: 2 }}>{meeting.location}</div>
              )}
              {meeting.notes && (
                <div style={{ fontSize: 12, color: 'rgba(18,33,46,0.45)', marginTop: 6, lineHeight: 1.4 }}>{meeting.notes}</div>
              )}
            </div>
          ))}
        </div>

        {/* Formulario agregar junta */}
        <AnimatePresence>
          {showAddMeeting && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              style={{
                background: 'white',
                borderRadius: 20,
                padding: '16px',
                boxShadow: '0 8px 32px rgba(18,33,46,0.12)',
                marginTop: 8,
              }}
            >
              <p style={{ fontWeight: 700, fontSize: 14, color: '#12212E', marginBottom: 12 }}>
                {t('business.addMeeting')}
              </p>
              {[
                { key: 'title', placeholder: t('business.meetingTitle') },
                { key: 'time', placeholder: t('business.meetingTime') },
                { key: 'location', placeholder: t('business.meetingLocation') },
                { key: 'notes', placeholder: t('business.meetingNotes') },
              ].map(({ key, placeholder }) => (
                <input
                  key={key}
                  type="text"
                  placeholder={placeholder}
                  value={newMeeting[key as keyof typeof newMeeting]}
                  onChange={(e) => setNewMeeting((prev) => ({ ...prev, [key]: e.target.value }))}
                  style={{
                    width: '100%',
                    height: 42,
                    borderRadius: 12,
                    background: '#ECE7DC',
                    border: 'none',
                    padding: '0 14px',
                    fontSize: 13,
                    color: '#12212E',
                    fontFamily: 'Questrial, sans-serif',
                    marginBottom: 8,
                    boxSizing: 'border-box',
                  }}
                />
              ))}
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <button
                  type="button"
                  onClick={() => setShowAddMeeting(false)}
                  style={{
                    flex: 1, height: 40, borderRadius: 12,
                    background: 'rgba(18,33,46,0.08)', border: 'none',
                    fontSize: 13, fontWeight: 700, color: 'rgba(18,33,46,0.50)',
                    cursor: 'pointer', fontFamily: 'Questrial, sans-serif',
                  }}
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="button"
                  onClick={addMeeting}
                  style={{
                    flex: 2, height: 40, borderRadius: 12,
                    background: '#EA9940', border: 'none',
                    fontSize: 13, fontWeight: 700, color: 'white',
                    cursor: 'pointer', fontFamily: 'Questrial, sans-serif',
                  }}
                >
                  {t('business.saveMeeting')}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
