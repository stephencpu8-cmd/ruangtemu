import { useEffect } from 'react';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ToastItem } from '@/types';

interface ToastProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

const TONES = {
  info: { icon: Info, bar: 'bg-brand-500' },
  success: { icon: CheckCircle2, bar: 'bg-success' },
  error: { icon: AlertTriangle, bar: 'bg-danger-600' },
} as const;

export function Toast({ toast, onDismiss }: ToastProps) {
  const { id, tone } = toast;
  useEffect(() => {
    const timer = window.setTimeout(() => onDismiss(id), tone === 'error' ? 6500 : 3500);
    return () => window.clearTimeout(timer);
  }, [id, tone, onDismiss]);

  const { icon: Icon, bar } = TONES[tone];
  return (
    <div className="pointer-events-auto flex w-full max-w-sm animate-fade-in items-stretch overflow-hidden rounded-xl border border-line bg-surface text-ink shadow-card">
      <span className={cn('w-1.5 shrink-0', bar)} aria-hidden="true" />
      <div className="flex flex-1 items-start gap-3 py-3 pl-3 pr-2">
        <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
        <p className="flex-1 text-sm">{toast.message}</p>
        <button
          type="button"
          onClick={() => onDismiss(id)}
          aria-label="Tutup notifikasi"
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg hover:bg-brandsoft"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

/** Wilayah live (aria-live="polite") agar pembaca layar mengumumkan notifikasi. */
export function ToastViewport({ toasts, onDismiss }: { toasts: ToastItem[]; onDismiss: (id: string) => void }) {
  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex flex-col items-center gap-2 px-4"
    >
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
