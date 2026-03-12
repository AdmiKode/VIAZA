interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, subtitle, action }: EmptyStateProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 32px',
      textAlign: 'center',
      gap: 12,
    }}>
      {icon && (
        <div style={{ opacity: 0.35, marginBottom: 4 }}>
          {icon}
        </div>
      )}
      <p style={{
        fontFamily: 'Questrial, sans-serif',
        fontWeight: 700,
        fontSize: 16,
        color: '#12212E',
        margin: 0,
      }}>
        {title}
      </p>
      {subtitle && (
        <p style={{
          fontFamily: 'Questrial, sans-serif',
          fontWeight: 400,
          fontSize: 13,
          color: 'rgba(18,33,46,0.50)',
          margin: 0,
          lineHeight: 1.5,
        }}>
          {subtitle}
        </p>
      )}
      {action && <div style={{ marginTop: 8 }}>{action}</div>}
    </div>
  );
}
