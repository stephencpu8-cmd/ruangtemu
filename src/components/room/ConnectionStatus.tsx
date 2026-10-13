import { cn } from '@/lib/utils';
import type { ConnectionState } from '@/types';

interface ConnectionStatusProps {
  state: ConnectionState;
  attempt: number;
  maxAttempts: number;
}

export function ConnectionStatus({ state, attempt, maxAttempts }: ConnectionStatusProps) {
  let label: string;
  let dot: string;
  let pulse = false;

  if (state === 'connected') {
    label = 'Terhubung';
    dot = 'bg-success';
  } else if (state === 'connecting') {
    label = 'Menyambung...';
    dot = 'bg-warning';
    pulse = true;
  } else {
    label = `Terputus — menyambung ulang (${attempt}/${maxAttempts})`;
    dot = 'bg-danger-600';
  }

  return (
    <div
      role="status"
      className="inline-flex max-w-[46vw] items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-sm font-medium text-ink sm:max-w-none"
    >
      <span aria-hidden="true" className={cn('h-2.5 w-2.5 shrink-0 rounded-full', dot, pulse && 'animate-pulse-soft')} />
      <span className="truncate">{label}</span>
    </div>
  );
}
