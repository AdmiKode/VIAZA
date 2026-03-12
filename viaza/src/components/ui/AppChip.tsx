interface AppChipProps {
  label: string;
  variant?: 'default' | 'active' | 'alert' | 'success';
  icon?: React.ReactNode;
  onClick?: () => void;
}

const VARIANTS = {
  default: { bg: 'rgba(18,33,46,0.08)', color: '#12212E' },
  active:  { bg: '#EA9940',             color: '#12212E' },
  alert:   { bg: 'rgba(192,57,43,0.10)', color: '#C0392B' },
  success: { bg: 'rgba(48,112,130,0.12)', color: '#307082' },
};

export function AppChip({ label, variant = 'default', icon, onClick }: AppChipProps) {
  const style = VARIANTS[variant];
  return (
    <span
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '5px 12px',
        borderRadius: 9999,
        background: style.bg,
        color: style.color,
        fontFamily: 'Questrial, sans-serif',
        fontWeight: 600,
        fontSize: 12,
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
        whiteSpace: 'nowrap',
      }}
    >
      {icon}
      {label}
    </span>
  );
}
