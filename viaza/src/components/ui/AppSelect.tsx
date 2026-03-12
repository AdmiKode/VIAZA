import type { SelectHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

export function AppSelect({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        'w-full rounded-2xl border border-[rgb(var(--viaza-primary-rgb)/0.12)] bg-[rgb(var(--viaza-background-rgb)/0.75)] px-4 py-3 text-sm outline-none focus:border-[rgb(var(--viaza-primary-rgb)/0.24)]',
        className
      )}
    />
  );
}
