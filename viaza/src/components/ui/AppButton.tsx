import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
};

export function AppButton({ variant = 'primary', className, ...props }: Props) {
  return (
    <button
      {...props}
      className={cn(
        'inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-medium transition',
        variant === 'primary' && 'bg-[var(--viaza-accent)] text-[var(--viaza-primary)]',
        variant === 'secondary' && 'bg-[var(--viaza-primary)] text-[var(--viaza-background)]',
        variant === 'ghost' && 'bg-transparent text-[var(--viaza-primary)]',
        'disabled:opacity-50',
        className
      )}
    />
  );
}
