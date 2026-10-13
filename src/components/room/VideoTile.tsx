import { useEffect, useRef, useState } from 'react';
import { Hand, Maximize2, MicOff, Minimize2, MoreVertical, Pin, PinOff, VideoOff } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { SPEAKING_THRESHOLD } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useAudioLevel } from '@/hooks/useAudioLevel';
import { useMediaStore } from '@/store/mediaStore';
import type { Participant } from '@/types';

interface VideoTileProps {
  participant: Participant;
  stream: MediaStream | null;
  pinned: boolean;
  /** Apakah pengguna ini host (untuk menu moderasi). */
  viewerIsHost: boolean;
  onTogglePin: (id: string) => void;
  className?: string;
}

type SinkVideo = HTMLVideoElement & {
  setSinkId?: (id: string) => Promise<void>;
  webkitEnterFullscreen?: () => void;
};

export function VideoTile({ participant: p, stream, pinned, viewerIsHost, onTogglePin, className }: VideoTileProps) {
  const tileRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<SinkVideo>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const pressTimer = useRef<number>();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const speakerId = useMediaStore((s) => s.activeDeviceIds.speakerId);

  // Indikator "sedang bicara": milik sendiri dihitung di RoomLayout, peserta lain dari audio stream-nya.
  const remoteLevel = useAudioLevel(p.isSelf ? null : stream, p.micOn);
  const speaking = p.isSelf ? p.speaking : p.micOn && remoteLevel > SPEAKING_THRESHOLD;

  useEffect(() => {
    const video = videoRef.current;
    if (video && video.srcObject !== stream) video.srcObject = stream;
  }, [stream]);

  // Output suara peserta jauh mengikuti pilihan speaker (bila browser mendukung).
  useEffect(() => {
    const video = videoRef.current;
    if (!video || p.isSelf || !speakerId || !video.setSinkId) return;
    void video.setSinkId(speakerId).catch(() => undefined);
  }, [speakerId, p.isSelf, stream]);

  // Tutup menu: klik di luar atau Esc.
  useEffect(() => {
    if (!menuOpen) return undefined;
    const onPointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  useEffect(() => () => window.clearTimeout(pressTimer.current), []);

  // Pantau status layar penuh (juga saat keluar lewat tombol Esc bawaan browser).
  useEffect(() => {
    const onChange = () => setIsFullscreen(document.fullscreenElement === tileRef.current);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const canFullscreen = p.sharing && !p.isSelf; // layar penuh untuk layar yang dibagikan orang lain

  const toggleFullscreen = async () => {
    const el = tileRef.current;
    if (!el) return;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else if (el.requestFullscreen) {
        await el.requestFullscreen();
      } else {
        videoRef.current?.webkitEnterFullscreen?.(); // iPhone Safari: hanya elemen <video>
      }
    } catch {
      /* browser menolak layar penuh; abaikan */
    }
  };

  const hasVideoTrack = !!stream && stream.getVideoTracks().length > 0;
  const showVideo = hasVideoTrack && (p.camOn || p.sharing);
  const mirror = p.isSelf && !p.sharing;

  const startPress = () => {
    window.clearTimeout(pressTimer.current);
    pressTimer.current = window.setTimeout(() => setMenuOpen(true), 500); // long-press
  };
  const cancelPress = () => window.clearTimeout(pressTimer.current);

  return (
    <div
      ref={tileRef}
      data-sharing-tile={canFullscreen ? 'true' : undefined}
      onDoubleClick={canFullscreen ? () => void toggleFullscreen() : undefined}
      role="group"
      aria-label={`${p.name}${p.isSelf ? ' (Anda)' : ''}${p.micOn ? '' : ', mikrofon mati'}${speaking ? ', sedang bicara' : ''}${p.sharing ? ', membagikan layar' : ''}`}
      onContextMenu={(event) => {
        event.preventDefault();
        setMenuOpen(true);
      }}
      onTouchStart={startPress}
      onTouchEnd={cancelPress}
      onTouchMove={cancelPress}
      onTouchCancel={cancelPress}
      className={cn(
        'group relative h-full w-full overflow-hidden rounded-2xl bg-navy-700 text-white',
        '[&:fullscreen]:rounded-none [&:fullscreen]:border-0 [&:fullscreen]:bg-black',
        'border-[3px] transition-colors motion-reduce:transition-none',
        speaking ? 'border-success' : 'border-transparent',
        className,
      )}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={p.isSelf}
        aria-hidden="true"
        className={cn('h-full w-full', p.sharing ? 'object-contain' : 'object-cover', mirror && '-scale-x-100', !showVideo && 'invisible')}
      />

      {!showVideo && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-3 text-center">
          <Avatar name={p.name} size="lg" />
          {!p.camOn && <VideoOff className="h-5 w-5 text-white/80" aria-hidden="true" />}
        </div>
      )}

      {p.handRaised && (
        <span
          role="img"
          aria-label="Mengangkat tangan"
          className="absolute left-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-warning text-navy-900"
        >
          <Hand className="h-4 w-4" aria-hidden="true" />
        </span>
      )}

      {p.reaction && (
        <span aria-hidden="true" className="absolute left-1/2 top-4 -translate-x-1/2 animate-pop text-3xl">
          {p.reaction}
        </span>
      )}

      <div className="absolute bottom-2 left-2 right-2 flex items-center gap-2">
        <span className="flex min-w-0 items-center gap-1.5 rounded-lg bg-black/60 px-2 py-1 text-sm font-medium">
          {pinned && <Pin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
          <span className="truncate">
            {p.name}
            {p.isSelf ? ' (Anda)' : ''}
          </span>
        </span>
        {!p.micOn && (
          <span
            role="img"
            aria-label="Mikrofon mati"
            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-danger-600"
          >
            <MicOff className="h-4 w-4" aria-hidden="true" />
          </span>
        )}
      </div>

      {canFullscreen && (
        <button
          type="button"
          onClick={() => void toggleFullscreen()}
          aria-label={isFullscreen ? `Keluar dari layar penuh (${p.name})` : `Layar penuh: layar ${p.name}`}
          title={isFullscreen ? 'Keluar dari layar penuh (F)' : 'Layar penuh (F)'}
          className="absolute right-[3.75rem] top-2 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-black/60 text-white hover:bg-black/80"
        >
          {isFullscreen ? <Minimize2 className="h-5 w-5" aria-hidden="true" /> : <Maximize2 className="h-5 w-5" aria-hidden="true" />}
        </button>
      )}

      <div ref={menuRef} className="absolute right-2 top-2">
        <button
          ref={menuButtonRef}
          type="button"
          aria-label={`Opsi untuk ${p.name}`}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-black/50 text-white opacity-100 hover:bg-black/70 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
        >
          <MoreVertical className="h-5 w-5" aria-hidden="true" />
        </button>
        {menuOpen && (
          <div
            role="menu"
            aria-label={`Menu untuk ${p.name}`}
            className="absolute right-0 top-12 z-20 w-52 rounded-xl border border-line bg-surface p-1 text-ink shadow-card"
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                onTogglePin(p.id);
                setMenuOpen(false);
              }}
              className="flex min-h-[44px] w-full items-center gap-2 rounded-lg px-3 text-left text-sm hover:bg-brandsoft"
            >
              {pinned ? <PinOff className="h-4 w-4" aria-hidden="true" /> : <Pin className="h-4 w-4" aria-hidden="true" />}
              {pinned ? 'Lepas pin' : 'Pin'}
            </button>
            {viewerIsHost && !p.isSelf && (
              <button
                type="button"
                role="menuitem"
                disabled
                title="Fitur moderasi segera hadir"
                className="flex min-h-[44px] w-full items-center gap-2 rounded-lg px-3 text-left text-sm opacity-60"
              >
                <MicOff className="h-4 w-4" aria-hidden="true" />
                Mute (host) — segera hadir
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
