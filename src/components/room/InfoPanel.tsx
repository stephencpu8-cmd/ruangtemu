import { Check, Copy, ShieldCheck } from 'lucide-react';
import { PanelShell } from '@/components/room/PanelShell';
import { Button } from '@/components/ui/Button';
import { TEXT } from '@/lib/constants';
import { buildInviteLink } from '@/lib/roomCode';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { useToast } from '@/hooks/useToast';

function CopyRow({ label, value, toastText }: { label: string; value: string; toastText: string }) {
  const { copy, copied } = useCopyToClipboard();
  const { toast } = useToast();
  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-ink">{label}</p>
      <div className="flex items-stretch gap-2">
        <code className="min-w-0 flex-1 break-all rounded-xl border border-line bg-app px-3 py-2.5 text-sm text-ink">{value}</code>
        <Button
          variant="secondary"
          aria-label={`Salin ${label.toLowerCase()}`}
          onClick={async () => {
            const ok = await copy(value);
            toast(ok ? toastText : 'Gagal menyalin. Blok teks lalu salin manual.', ok ? 'success' : 'error');
          }}
        >
          {copied ? <Check className="h-5 w-5" aria-hidden="true" /> : <Copy className="h-5 w-5" aria-hidden="true" />}
        </Button>
      </div>
    </div>
  );
}

export function InfoPanel({ roomCode, onClose }: { roomCode: string; onClose: () => void }) {
  return (
    <PanelShell title="Info Rapat" onClose={onClose}>
      <div className="space-y-5 p-4">
        <CopyRow label="Kode ruang" value={roomCode} toastText="Kode disalin" />
        <CopyRow label="Tautan undangan" value={buildInviteLink(roomCode)} toastText="Tautan disalin" />
        <p className="flex gap-2 rounded-xl bg-brandsoft p-3 text-sm text-ink">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-500 dark:text-brand-400" aria-hidden="true" />
          {TEXT.privacyRoom}
        </p>
      </div>
    </PanelShell>
  );
}
