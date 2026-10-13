import { cn } from '@/lib/utils';

const SEGMENTS = 14;

interface MicLevelIndicatorProps {
  /** 0..1 */
  level: number;
  active: boolean;
  className?: string;
}

/** Bar level mikrofon (presentasional). */
export function MicLevelIndicator({ level, active, className }: MicLevelIndicatorProps) {
  const lit = active ? Math.round(Math.min(1, level) * SEGMENTS) : 0;
  return (
    <div
      role="meter"
      aria-label="Level mikrofon"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round((active ? level : 0) * 100)}
      className={cn('flex items-center gap-1', className)}
    >
      {Array.from({ length: SEGMENTS }, (_, i) => (
        <span
          key={i}
          aria-hidden="true"
          className={cn(
            'h-3 flex-1 rounded-full transition-colors duration-75 motion-reduce:transition-none',
            i < lit ? (i >= SEGMENTS - 3 ? 'bg-warning' : 'bg-success') : 'bg-line',
          )}
        />
      ))}
    </div>
  );
}
