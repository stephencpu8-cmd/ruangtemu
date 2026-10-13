import type { ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface ErrorMessageProps {
  title?: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  children?: ReactNode;
  className?: string;
}

export function ErrorMessage({
  title,
  message,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondary,
  children,
  className,
}: ErrorMessageProps) {
  return (
    <div role="alert" className={cn('flex gap-3 rounded-xl border border-danger/40 bg-danger/10 p-4 text-ink', className)}>
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-danger-600 dark:text-danger-300" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        {title && <p className="text-base font-semibold">{title}</p>}
        <p className="text-sm">{message}</p>
        {(actionLabel || secondaryLabel || children) && (
          <div className="mt-3 flex flex-wrap gap-2">
            {actionLabel && onAction && (
              <Button size="sm" variant="primary" onClick={onAction}>
                {actionLabel}
              </Button>
            )}
            {secondaryLabel && onSecondary && (
              <Button size="sm" variant="secondary" onClick={onSecondary}>
                {secondaryLabel}
              </Button>
            )}
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
