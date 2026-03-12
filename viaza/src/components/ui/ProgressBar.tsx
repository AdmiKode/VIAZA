interface ProgressBarProps {
  value: number; // 0–100
  color?: string;
  height?: number;
  showLabel?: boolean;
}

export function ProgressBar({ value, color = '#EA9940', height = 6, showLabel }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{
        flex: 1,
        height,
        background: 'rgba(18,33,46,0.08)',
        borderRadius: 9999,
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${pct}%`,
          height: '100%',
          background: color,
          borderRadius: 9999,
          transition: 'width 0.4s ease',
        }} />
      </div>
      {showLabel && (
        <span style={{
          fontFamily: 'Questrial, sans-serif',
          fontWeight: 600,
          fontSize: 12,
          color: 'rgba(18,33,46,0.60)',
          minWidth: 32,
          textAlign: 'right',
        }}>
          {Math.round(pct)}%
        </span>
      )}
    </div>
  );
}
