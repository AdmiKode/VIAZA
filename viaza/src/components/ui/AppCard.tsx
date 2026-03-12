import type { PropsWithChildren } from 'react';
import { cn } from '../../utils/cn';

export function AppCard({ className, children }: PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={cn(
        'rounded-3xl border border-[rgb(var(--viaza-primary-rgb)/0.10)] bg-[rgb(var(--viaza-background-rgb)/0.55)] p-4',
        className
      )}
    >
      {children}
    </div>
  );
}
