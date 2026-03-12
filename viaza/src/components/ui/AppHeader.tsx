import type { ReactNode } from 'react';

export function AppHeader({ title, right }: { title: string; right?: ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-lg font-semibold text-[var(--viaza-primary)]">{title}</h1>
      {right ? <div className="flex items-center gap-2">{right}</div> : null}
    </div>
  );
}
