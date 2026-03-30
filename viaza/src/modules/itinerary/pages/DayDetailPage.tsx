// DayDetailPage — timeline de un día del itinerario
// Sin emojis · paleta VIAZA oficial
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../../app/store/useAppStore';
import { AppHeader } from '../../../components/ui/AppHeader';
import { AppButton } from '../../../components/ui/AppButton';
import type { ItineraryEvent } from '../../../types/itinerary';

const C = {
  dark: '#12212E',
  mid: '#307082',
  light: '#6CA3A2',
  bg: '#ECE7DC',
  accent: '#EA9940',
};

const TYPE_COLOR: Record<string, string> = {
  flight: C.mid,
  hotel: C.light,
  activity: C.accent,
  place: C.light,
  transport: C.dark,
  meal: C.accent,
  free: 'rgba(18,33,46,0.25)',
};

function EventCard({
  event,
  onDelete,
  onEdit,
}: {
  event: ItineraryEvent;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}) {
  const { t } = useTranslation();
  const color = TYPE_COLOR[event.type] ?? C.mid;

  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      {/* Timeline dot */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 4 }}>
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: color, flexShrink: 0 }} />
        <div style={{ width: 2, flex: 1, background: 'rgba(18,33,46,0.10)', marginTop: 4, minHeight: 32 }} />
      </div>

      {/* Card */}
      <div style={{
        flex: 1, background: 'white', borderRadius: 16,
        padding: '12px 14px', marginBottom: 8,
        boxShadow: '0 2px 10px rgba(18,33,46,0.07)',
        borderLeft: `3px solid ${color}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: C.dark }}>{event.title}</div>
            {event.startTime && (
              <div style={{ fontSize: 11, color: 'rgba(18,33,46,0.45)', marginTop: 2 }}>
                {event.startTime}{event.endTime ? ` – ${event.endTime}` : ''}
              </div>
            )}
            {event.description && (
              <div style={{ fontSize: 12, color: 'rgba(18,33,46,0.55)', marginTop: 4, lineHeight: 1.4 }}>
                {event.description}
              </div>
            )}
            {event.confirmationCode && (
              <div style={{ fontSize: 11, color: C.accent, fontWeight: 700, marginTop: 4 }}>
                {t('itinerary.fields.confirmationCode')}: {event.confirmationCode}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
            <button
              type="button"
              onClick={() => onEdit(event.id)}
              style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.light} strokeWidth="2" strokeLinecap="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => onDelete(event.id)}
              style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2" strokeLinecap="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DayDetailPage() {
  const { index } = useParams<{ index: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const currentTrip = useAppStore((s) => s.trips.find((tr) => tr.id === s.currentTripId));
  const itineraryEvents = useAppStore((s) => s.itineraryEvents);
  const deleteItineraryEvent = useAppStore((s) => s.deleteItineraryEvent);

  const dayIndex = index != null ? parseInt(index, 10) : NaN;

  if (isNaN(dayIndex) || !currentTrip) {
    return (
      <div className="px-4 pt-4 pb-28" style={{ fontFamily: 'Questrial, sans-serif' }}>
        <AppHeader title={t('itinerary.dayDetail')} />
        <div style={{ marginTop: 48, textAlign: 'center', color: 'rgba(18,33,46,0.40)', fontSize: 14 }}>
          {t('itinerary.dayNotFound')}
        </div>
      </div>
    );
  }

  const dayEvents = itineraryEvents
    .filter((e) => e.tripId === currentTrip.id && e.dayIndex === dayIndex)
    .sort((a, b) => {
      if (a.startTime && b.startTime) return a.startTime.localeCompare(b.startTime);
      return a.order - b.order;
    });

  // Calcular fecha del día
  let dayLabel = `${t('itinerary.day')} ${dayIndex + 1}`;
  if (currentTrip.startDate) {
    try {
      const d = new Date(currentTrip.startDate);
      d.setDate(d.getDate() + dayIndex);
      dayLabel = d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
    } catch {
      // fallback
    }
  }

  function handleDelete(eventId: string) {
    deleteItineraryEvent(eventId);
  }

  function handleEdit(eventId: string) {
    navigate(`/itinerary/add-event?edit=${eventId}`);
  }

  return (
    <div className="px-4 pt-4 pb-28" style={{ fontFamily: 'Questrial, sans-serif' }}>
      <AppHeader title={dayLabel} />

      {/* Encabezado del día */}
      <div style={{
        marginTop: 16, marginBottom: 20,
        padding: '14px 16px', borderRadius: 16,
        background: `linear-gradient(135deg, ${C.dark} 0%, ${C.mid} 100%)`,
        boxShadow: '0 4px 18px rgba(18,33,46,0.20)',
      }}>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', fontWeight: 700 }}>
          {t('itinerary.day')} {dayIndex + 1}
        </div>
        <div style={{ fontSize: 16, fontWeight: 800, color: 'white', marginTop: 2 }}>
          {dayLabel}
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 4 }}>
          {dayEvents.length} {t('itinerary.events')}
        </div>
      </div>

      {/* Timeline */}
      {dayEvents.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '48px 24px',
          color: 'rgba(18,33,46,0.35)', fontSize: 14,
        }}>
          {t('itinerary.dayEmpty')}
        </div>
      ) : (
        <div>
          {dayEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}

      {/* Añadir evento al día */}
      <div style={{ marginTop: 16 }}>
        <AppButton
          className="w-full"
          onClick={() => navigate(`/itinerary/add-event?day=${dayIndex}`)}
          type="button"
        >
          {t('itinerary.addEvent')}
        </AppButton>
      </div>
    </div>
  );
}
