// AgendaItemDetailPage — detalle, completar, editar, eliminar
// Sin emojis · paleta VIAZA oficial
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../../app/store/useAppStore';
import { AppHeader } from '../../../components/ui/AppHeader';
import { AppButton } from '../../../components/ui/AppButton';
import { cancelLocalNotification } from '../../../services/pushNotificationService';

const C = {
  dark: '#12212E',
  mid: '#307082',
  light: '#6CA3A2',
  bg: '#ECE7DC',
  accent: '#EA9940',
};

const CATEGORY_LABELS: Record<string, string> = {
  medication: 'agenda.category.medication',
  call: 'agenda.category.call',
  meeting: 'agenda.category.meeting',
  checkin: 'agenda.category.checkin',
  activity: 'agenda.category.activity',
  reminder: 'agenda.category.reminder',
  transport: 'agenda.category.transport',
  custom: 'agenda.category.custom',
};

const RECURRENCE_LABELS: Record<string, string> = {
  none: 'agenda.recurrence.none',
  every_8h: 'agenda.recurrence.every8h',
  every_12h: 'agenda.recurrence.every12h',
  daily: 'agenda.recurrence.daily',
  weekly: 'agenda.recurrence.weekly',
};

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ padding: '12px 0', borderBottom: '1px solid rgba(18,33,46,0.07)' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(18,33,46,0.40)', textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, color: C.dark }}>{value}</div>
    </div>
  );
}

export function AgendaItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const agendaItems = useAppStore((s) => s.agendaItems);
  const updateAgendaItem = useAppStore((s) => s.updateAgendaItem);
  const deleteAgendaItem = useAppStore((s) => s.deleteAgendaItem);

  const item = agendaItems.find((a) => a.id === id);

  if (!item) {
    return (
      <div className="px-4 pt-4 pb-28" style={{ fontFamily: 'Questrial, sans-serif' }}>
        <AppHeader title={t('agenda.detail.title')} />
        <div style={{ marginTop: 48, textAlign: 'center', color: 'rgba(18,33,46,0.40)', fontSize: 14 }}>
          {t('agenda.detail.notFound')}
        </div>
      </div>
    );
  }

  function handleToggleComplete() {
    updateAgendaItem(item!.id, { completed: !item!.completed });
  }

  function handleDelete() {
    if (item!.notificationId != null) {
      void cancelLocalNotification(item!.notificationId);
    }
    deleteAgendaItem(item!.id);
    navigate(-1);
  }

  function handleEdit() {
    navigate(`/agenda/new?edit=${item!.id}`);
  }

  return (
    <div className="px-4 pt-4 pb-28" style={{ fontFamily: 'Questrial, sans-serif' }}>
      <AppHeader title={t('agenda.detail.title')} />

      {/* Estado completado */}
      <div style={{ marginTop: 20 }}>
        <button
          type="button"
          onClick={handleToggleComplete}
          style={{
            width: '100%', padding: '16px',
            borderRadius: 18, border: 'none', cursor: 'pointer',
            background: item.completed
              ? `linear-gradient(135deg, ${C.mid} 0%, ${C.light} 100%)`
              : 'rgba(18,33,46,0.06)',
            display: 'flex', alignItems: 'center', gap: 14,
            boxShadow: item.completed ? '0 4px 18px rgba(48,112,130,0.25)' : 'none',
            transition: 'all 0.2s',
          }}
        >
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            border: `2px solid ${item.completed ? 'white' : 'rgba(18,33,46,0.20)'}`,
            background: item.completed ? 'rgba(255,255,255,0.25)' : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            {item.completed && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            )}
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: item.completed ? 'white' : C.dark }}>
              {item.title}
            </div>
            <div style={{ fontSize: 12, color: item.completed ? 'rgba(255,255,255,0.75)' : 'rgba(18,33,46,0.45)', marginTop: 2 }}>
              {item.completed ? t('agenda.detail.tapToUnmark') : t('agenda.detail.tapToComplete')}
            </div>
          </div>
        </button>
      </div>

      {/* Detalles */}
      <div style={{
        marginTop: 16, background: 'white', borderRadius: 18,
        padding: '0 16px', boxShadow: '0 2px 12px rgba(18,33,46,0.07)',
      }}>
        <InfoRow label={t('agenda.fields.category')} value={t(CATEGORY_LABELS[item.category] ?? item.category)} />
        <InfoRow label={t('agenda.fields.date')} value={item.date} />
        <InfoRow label={t('agenda.fields.time')} value={item.time} />
        <InfoRow label={t('agenda.fields.recurrence')} value={t(RECURRENCE_LABELS[item.recurrence] ?? item.recurrence)} />
        {item.notes && (
          <div style={{ padding: '12px 0' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(18,33,46,0.40)', textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 4 }}>
              {t('agenda.fields.notes')}
            </div>
            <div style={{ fontSize: 14, color: C.dark, lineHeight: 1.5 }}>{item.notes}</div>
          </div>
        )}
      </div>

      {/* Acciones */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
        <AppButton className="w-full" onClick={handleEdit} type="button">
          {t('common.edit')}
        </AppButton>
        <button
          type="button"
          onClick={handleDelete}
          style={{
            width: '100%', padding: '14px', borderRadius: 16,
            border: `1.5px solid rgba(234,153,64,0.40)`,
            background: 'rgba(234,153,64,0.07)',
            fontSize: 14, fontWeight: 700, color: C.accent, cursor: 'pointer',
          }}
        >
          {t('common.delete')}
        </button>
      </div>
    </div>
  );
}
