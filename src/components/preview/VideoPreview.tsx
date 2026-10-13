import { useEffect, useRef } from 'react';
import { MicOff, VideoOff } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/lib/utils';

interface VideoPreviewProps {
  stream: MediaStream | null;
  camOn: boolean;
  micOn: boolean;
  name: string;
}

export function VideoPreview({ stream, camOn, micOn, name }: VideoPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video && video.srcObject !== stream) video.srcObject = stream;
  }, [stream]);

  const hasVideoTrack = !!stream && stream.getVideoTracks().length > 0;
  const showVideo = hasVideoTrack && camOn;
  const displayName = name.trim() || 'Nama Anda';

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-navy-700 shadow-card">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        aria-label="Pratinjau kamera Anda"
        className={cn('h-full w-full -scale-x-100 object-cover', !showVideo && 'invisible')}
      />

      {!showVideo && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white">
          <Avatar name={displayName} size="xl" />
          <p className="max-w-[80%] truncate text-base font-semibold">{displayName}</p>
          <p className="flex items-center gap-2 text-sm text-white/80">
            <VideoOff className="h-4 w-4" aria-hidden="true" />
            {stream ? 'Kamera mati' : 'Kamera belum aktif'}
          </p>
        </div>
      )}

      {!micOn && (
        <span
          role="img"
          aria-label="Mikrofon mati"
          className="absolute bottom-3 right-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-danger-600 text-white"
        >
          <MicOff className="h-4 w-4" aria-hidden="true" />
        </span>
      )}
    </div>
  );
}
