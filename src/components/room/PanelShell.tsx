import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { IconButton } from '@/components/ui/IconButton';

interface PanelShellProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

/** Kerangka bersama untuk panel samping (obrolan, peserta, pengaturan, info). */
export function PanelShell({ title, onClose, children, footer }: PanelShellProps) {
  return (
    <section aria-label={title} className="flex h-full min-h-0 flex-col bg-surface text-ink">
      <header className="flex shrink-0 items-center justify-between border-b border-line px-4 py-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        <IconButton label="Tutup panel" tone="ghost" tooltipSide="bottom" icon={<X className="h-5 w-5" />} onClick={onClose} />
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      {footer}
    </section>
  );
}
