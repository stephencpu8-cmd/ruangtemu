import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TooltipProps {
  label: string;
  children: ReactNode;
  side?: 'top' | 'bottom';
  className?: string;
}

/**
 * Tooltip CSS murni (muncul saat hover/fokus). Bersifat dekoratif — elemen
 * pemicu wajib punya aria-label sendiri, jadi tooltip disembunyikan dari AT.
 */
export function Tooltip({ label, children, side = 'top', className }: TooltipProps) {
  return (
    <span className={cn('group/tip relative inline-flex', className)}>
      {children}
      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-lg bg-navy-900 px-2.5 py-1.5',
          'text-xs font-medium text-white opacity-0 shadow-lg transition-opacity',
          'group-hover/tip:opacity-100 group-focus-within/tip:opacity-100 motion-reduce:transition-none',
          side === 'top' ? 'bottom-full mb-2' : 'top-full mt-2',
        )}
      >
        {label}
      </span>
    </span>
  );
}
