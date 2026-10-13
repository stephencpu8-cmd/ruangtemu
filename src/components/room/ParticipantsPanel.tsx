import { Hand, Mic, MicOff, UserX, Video, VideoOff } from 'lucide-react';
import { PanelShell } from '@/components/room/PanelShell';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { IconButton } from '@/components/ui/IconButton';
import type { Participant } from '@/types';

interface ParticipantsPanelProps {
  participants: Participant[];
  viewerIsHost: boolean;
  onClose: () => void;
}

export function ParticipantsPanel({ participants, viewerIsHost, onClose }: ParticipantsPanelProps) {
  return (
    <PanelShell title={`Peserta (${participants.length})`} onClose={onClose}>
      <ul className="divide-y divide-line">
        {participants.map((p) => (
          <li key={p.id} className="flex items-center gap-3 px-4 py-3">
            <Avatar name={p.name} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-medium text-ink">{p.name}</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {p.isSelf && <Badge tone="brand">Anda</Badge>}
                {p.isHost && <Badge tone="warning">Host</Badge>}
              </div>
            </div>
            <div className="flex items-center gap-2 text-muted">
              {p.handRaised && <Hand className="h-5 w-5 text-warning" aria-label="Mengangkat tangan" role="img" />}
              {p.micOn ? (
                <Mic className="h-5 w-5" aria-label="Mikrofon aktif" role="img" />
              ) : (
                <MicOff className="h-5 w-5 text-danger-600 dark:text-danger-300" aria-label="Mikrofon mati" role="img" />
              )}
              {p.camOn ? (
                <Video className="h-5 w-5" aria-label="Kamera aktif" role="img" />
              ) : (
                <VideoOff className="h-5 w-5 text-danger-600 dark:text-danger-300" aria-label="Kamera mati" role="img" />
              )}
              {/* STUB moderasi: hanya host, hanya untuk peserta lain. */}
              {viewerIsHost && !p.isSelf && (
                <IconButton
                  label={`Keluarkan ${p.name}`}
                  tooltip="Fitur moderasi segera hadir"
                  tone="ghost"
                  disabled
                  icon={<UserX className="h-5 w-5" />}
                />
              )}
            </div>
          </li>
        ))}
      </ul>
      {participants.length <= 1 && (
        <p className="px-4 py-3 text-sm text-muted">Hanya Anda di ruang ini. Bagikan tautan undangan untuk mengundang peserta.</p>
      )}
    </PanelShell>
  );
}
