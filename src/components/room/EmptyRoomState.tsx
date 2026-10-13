import { ShieldCheck, UsersRound } from 'lucide-react';
import { CopyLinkButton } from '@/components/room/CopyLinkButton';
import { TEXT } from '@/lib/constants';

export function EmptyRoomState({ roomCode }: { roomCode: string }) {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-3 rounded-2xl border border-line bg-surface p-5 text-center">
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-brandsoft text-brand-500 dark:text-brand-400">
        <UsersRound className="h-6 w-6" aria-hidden="true" />
      </span>
      <p className="text-base text-ink">
        Belum ada peserta lain. Bagikan tautan undangan agar orang lain bisa bergabung.
      </p>
      <CopyLinkButton roomCode={roomCode} show="link" />
      <p className="flex items-center gap-1.5 text-xs text-muted">
        <ShieldCheck className="h-4 w-4" aria-hidden="true" />
        {TEXT.privacyShort}
      </p>
    </div>
  );
}
