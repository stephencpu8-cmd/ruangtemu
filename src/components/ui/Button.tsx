import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Spinner } from '@/components/common/Spinner';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700',
  secondary: 'border border-line bg-surface text-ink hover:bg-brandsoft active:bg-brandsoft',
  ghost: 'bg-transparent text-ink hover:bg-brandsoft active:bg-brandsoft',
  danger: 'bg-danger-600 text-white hover:bg-danger-700 active:bg-danger-700',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'min-h-[44px] px-3 text-sm font-medium',
  md: 'min-h-[44px] px-4 text-base font-medium',
  lg: 'min-h-[52px] px-6 text-base font-semibold',
};

interface StyleArgs {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
}

/** Dipakai juga untuk <Link> yang tampil seperti tombol. */
export function buttonClasses({ variant = 'primary', size = 'md', fullWidth, className }: StyleArgs = {}): string {
  return cn(
    'inline-flex items-center justify-center gap-2 rounded-xl transition-colors',
    'disabled:cursor-not-allowed disabled:opacity-60',
    VARIANTS[variant],
    SIZES[size],
    fullWidth && 'w-full',
    className,
  );
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant, size, fullWidth, loading, leftIcon, rightIcon, className, children, disabled, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClasses({ variant, size, fullWidth, className })}
      {...rest}
    >
      {loading ? <Spinner className="h-4 w-4" /> : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  );
});
