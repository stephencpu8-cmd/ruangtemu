import { VideoTile } from '@/components/room/VideoTile';
import { cn } from '@/lib/utils';
import type { Participant } from '@/types';

interface VideoGridProps {
  participants: Participant[];
  streams: Record<string, MediaStream | null>;
  pinnedId: string | null;
  viewerIsHost: boolean;
  onTogglePin: (id: string) => void;
}

/** 1 -> 1 besar; 2 -> 2 kolom; 3-4 -> 2x2; 5-9 -> 3x3; 10+ -> grid otomatis + scroll. */
function gridClass(count: number): string {
  if (count <= 1) return 'flex items-center justify-center';
  if (count === 2) return 'grid grid-cols-1 auto-rows-fr sm:grid-cols-2';
  if (count <= 4) return 'grid grid-cols-2 auto-rows-fr';
  if (count <= 9) return 'grid grid-cols-2 auto-rows-fr md:grid-cols-3';
  return 'grid grid-cols-2 content-start overflow-y-auto auto-rows-[180px] md:grid-cols-3 xl:grid-cols-4';
}

export function VideoGrid({ participants, streams, pinnedId, viewerIsHost, onTogglePin }: VideoGridProps) {
  const pinned = participants.length > 1 ? participants.find((p) => p.id === pinnedId) : undefined;

  const renderTile = (p: Participant, className?: string) => (
    <VideoTile
      key={p.id}
      participant={p}
      stream={streams[p.id] ?? null}
      pinned={p.id === pinnedId}
      viewerIsHost={viewerIsHost}
      onTogglePin={onTogglePin}
      className={className}
    />
  );

  if (pinned) {
    const others = participants.filter((p) => p.id !== pinned.id);
    return (
      <div className="flex h-full min-h-0 w-full flex-col gap-2 sm:gap-3">
        <div className="min-h-0 flex-1">{renderTile(pinned)}</div>
        <div className="flex h-24 shrink-0 gap-2 overflow-x-auto sm:h-28">
          {others.map((p) => (
            <div key={p.id} className="h-full w-36 shrink-0 sm:w-44">
              {renderTile(p)}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (participants.length <= 1) {
    return (
      <div className={cn('h-full w-full', gridClass(1))}>
        {participants.map((p) => renderTile(p, 'aspect-video h-auto max-h-full max-w-4xl'))}
      </div>
    );
  }

  return <div className={cn('h-full w-full gap-2 sm:gap-3', gridClass(participants.length))}>{participants.map((p) => renderTile(p))}</div>;
}
