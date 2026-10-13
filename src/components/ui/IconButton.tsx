import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Tooltip } from '@/components/ui/Tooltip';

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label' | 'children'> {
  /** Wajib: dipakai sebagai aria-label dan tooltip. */
  label: string;
  icon: ReactNode;
  /** Tombol toggle yang sedang aktif. */
  pressed?: boolean;
  tone?: 'default' | 'danger' | 'ghost';
  size?: 'md' | 'lg';
  badge?: number;
  tooltipSide?: 'top' | 'bottom';
  tooltip?: string;
}

const TONES = {
  default: 'border border-line bg-surface text-ink hover:bg-brandsoft active:scale-95',
  ghost: 'border border-transparent bg-transparent text-ink hover:bg-brandsoft active:scale-95',
  danger: 'border border-danger-600 bg-danger-600 text-white hover:bg-danger-700 active:scale-95',
  pressed: 'border border-brand-500 bg-brand-500 text-white hover:bg-brand-600 active:scale-95',
} as const;

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, icon, pressed, tone = 'default', size = 'md', badge, tooltipSide = 'top', tooltip, className, type = 'button', ...rest },
  ref,
) {
  const style = pressed && tone === 'default' ? TONES.pressed : TONES[tone];
  return (
    <Tooltip label={tooltip ?? label} side={tooltipSide}>
      <button
        ref={ref}
        type={type}
        aria-label={label}
        aria-pressed={pressed}
        className={cn(
          'relative inline-flex shrink-0 items-center justify-center rounded-xl transition-all motion-reduce:transition-none',
          'disabled:cursor-not-allowed disabled:opacity-50',
          size === 'lg' ? 'h-12 min-w-[48px] sm:h-14 sm:min-w-[56px]' : 'h-11 min-w-[44px]',
          style,
          className,
        )}
        {...rest}
      >
        <span aria-hidden="true" className="inline-flex">
          {icon}
        </span>
        {badge !== undefined && badge > 0 && (
          <span
            aria-hidden="true"
            className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-danger-600 px-1 text-xs font-semibold text-white"
          >
            {badge > 9 ? '9+' : badge}
          </span>
        )}
      </button>
    </Tooltip>
  );
});
