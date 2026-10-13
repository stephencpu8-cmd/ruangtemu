import { Check, Copy, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { buildInviteLink } from '@/lib/roomCode';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { useToast } from '@/hooks/useToast';

interface CopyLinkButtonProps {
  roomCode: string;
  show?: 'both' | 'link';
  /** Sembunyikan teks tombol di layar kecil (aria-label tetap ada). */
  compact?: boolean;
  fullWidth?: boolean;
}

export function CopyLinkButton({ roomCode, show = 'both', compact = false, fullWidth }: CopyLinkButtonProps) {
  const { toast } = useToast();
  const link = useCopyToClipboard();
  const code = useCopyToClipboard();
  const textClass = compact ? 'hidden md:inline' : undefined;

  const copyLink = async () => {
    const ok = await link.copy(buildInviteLink(roomCode));
    toast(ok ? 'Tautan disalin' : 'Gagal menyalin. Salin manual dari panel Info.', ok ? 'success' : 'error');
  };
  const copyCode = async () => {
    const ok = await code.copy(roomCode);
    toast(ok ? 'Kode disalin' : 'Gagal menyalin. Salin manual dari panel Info.', ok ? 'success' : 'error');
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant="secondary"
        fullWidth={fullWidth}
        onClick={copyLink}
        aria-label="Salin tautan undangan"
        leftIcon={link.copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Link2 className="h-4 w-4" aria-hidden="true" />}
      >
        <span className={textClass}>Salin Tautan</span>
      </Button>
      {show === 'both' && (
        <Button
          size="sm"
          variant="secondary"
          onClick={copyCode}
          aria-label="Salin kode ruang"
          leftIcon={code.copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
        >
          <span className={textClass}>Salin Kode</span>
        </Button>
      )}
    </div>
  );
}
