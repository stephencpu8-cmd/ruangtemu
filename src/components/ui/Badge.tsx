import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

const TONES = {
  neutral: 'bg-brandsoft text-ink',
  brand: 'bg-brand-500 text-white',
  success: 'bg-success/15 text-[#14684A] dark:text-[#6EE7B7]',
  warning: 'bg-[#FFF3C4] text-[#5C4000]',
  danger: 'bg-danger/15 text-danger-600 dark:text-danger-300',
} as const;

interface BadgeProps {
  tone?: keyof typeof TONES;
  children: ReactNode;
  className?: string;
}

export function Badge({ tone = 'neutral', children, className }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold', TONES[tone], className)}>
      {children}
    </span>
  );
}
