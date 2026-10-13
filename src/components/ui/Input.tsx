import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string | null;
  hideLabel?: boolean;
  /** Elemen di dalam kolom input, sisi kanan (mis. tombol acak). */
  endAdornment?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, hideLabel, endAdornment, className, id, ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const descId = `${inputId}-desc`;

  return (
    <div className="w-full">
      <label htmlFor={inputId} className={cn('mb-1.5 block text-sm font-medium text-ink', hideLabel && 'sr-only')}>
        {label}
      </label>
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? descId : undefined}
          className={cn(
            'min-h-[48px] w-full rounded-xl border bg-surface px-4 text-base text-ink placeholder:text-muted',
            'transition-colors focus:border-brand-500',
            error ? 'border-danger-600 dark:border-danger-300' : 'border-line',
            endAdornment && 'pr-14',
            className,
          )}
          {...rest}
        />
        {endAdornment && <div className="absolute right-1 top-1/2 -translate-y-1/2">{endAdornment}</div>}
      </div>
      {(error || hint) && (
        <p
          id={descId}
          role={error ? 'alert' : undefined}
          className={cn('mt-1.5 text-sm', error ? 'text-danger-600 dark:text-danger-300' : 'text-muted')}
        >
          {error ?? hint}
        </p>
      )}
    </div>
  );
});
