import { useCallback, useEffect, useState } from 'react';
import { Info } from 'lucide-react';
import { ChatPanel } from '@/components/room/ChatPanel';
import { ConnectionStatus } from '@/components/room/ConnectionStatus';
import { ControlBar } from '@/components/room/ControlBar';
import { CopyLinkButton } from '@/components/room/CopyLinkButton';
import { EmptyRoomState } from '@/components/room/EmptyRoomState';
import { InfoPanel } from '@/components/room/InfoPanel';
import { ParticipantsPanel } from '@/components/room/ParticipantsPanel';
import { SettingsPanel } from '@/components/room/SettingsPanel';
import { VideoGrid } from '@/components/room/VideoGrid';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { ErrorScreen } from '@/components/common/ErrorScreen';
import { Logo } from '@/components/layout/Logo';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { Modal } from '@/components/ui/Modal';
import { MAX_RECONNECT_ATTEMPTS, SPEAKING_THRESHOLD } from '@/lib/constants';
import { humanizeRoomCode } from '@/lib/utils';
import { useAudioLevel } from '@/hooks/useAudioLevel';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useLocalMedia } from '@/hooks/useLocalMedia';
import { useMediaDevices } from '@/hooks/useMediaDevices';
import { useRoomState } from '@/hooks/useRoomState';
import { reconnectSignaling, useSignaling } from '@/hooks/useSignaling';
import { useMediaStore } from '@/store/mediaStore';
import { useRoomStore } from '@/store/roomStore';
import { useUIStore } from '@/store/uiStore';

interface RoomLayoutProps {
  roomCode: string;
  displayName: string;
  isHost: boolean;
}

/** Memperbarui indikator "sedang bicara" milik sendiri tanpa merender ulang seluruh ruang. */
function SpeakingWatcher() {
  const stream = useMediaStore((s) => s.localStream);
  const micOn = useMediaStore((s) => s.micOn);
  const level = useAudioLevel(stream, micOn);
  const updateParticipant = useRoomStore((s) => s.updateParticipant);
  const speaking = micOn && level > SPEAKING_THRESHOLD;

  useEffect(() => {
    updateParticipant('self', { speaking });
  }, [speaking, updateParticipant]);

  return null;
}

export function RoomLayout({ roomCode, displayName, isHost }: RoomLayoutProps) {
  const room = useRoomState({ roomCode, displayName, isHost });
  useSignaling(roomCode, displayName);

  const media = useLocalMedia();
  const { devices, activeDeviceIds, speakerSupported } = useMediaDevices();
  const sharingScreen = useMediaStore((s) => s.sharingScreen);
  const screenStream = useMediaStore((s) => s.screenStream);
  const handRaised = useMediaStore((s) => s.handRaised);

  const activePanel = useUIStore((s) => s.activePanel);
  const unreadChat = useUIStore((s) => s.unreadChat);
  const theme = useUIStore((s) => s.theme);
  const reducedMotion = useUIStore((s) => s.reducedMotion);
  const togglePanel = useUIStore((s) => s.togglePanel);
  const openPanel = useUIStore((s) => s.openPanel);
  const closePanel = useUIStore((s) => s.closePanel);
  const resetUnread = useUIStore((s) => s.resetUnread);
  const setTheme = useUIStore((s) => s.setTheme);
  const setReducedMotion = useUIStore((s) => s.setReducedMotion);

  const [leaveOpen, setLeaveOpen] = useState(false);
  const closeLeave = useCallback(() => setLeaveOpen(false), []);

  // Pesan dianggap terbaca selama panel obrolan terbuka.
  useEffect(() => {
    if (activePanel === 'chat') resetUnread();
  }, [activePanel, room.messages.length, resetUnread]);

  useKeyboardShortcuts({
    onMic: media.toggleMic,
    onCam: media.toggleCam,
    onShare: () => void room.toggleShare(),
    onChat: () => togglePanel('chat'),
    onParticipants: () => togglePanel('participants'),
    onFullscreen: () => {
      // Layar penuh untuk layar yang sedang dibagikan peserta lain.
      if (document.fullscreenElement) {
        void document.exitFullscreen().catch(() => undefined);
        return;
      }
      const tile = document.querySelector<HTMLElement>('[data-sharing-tile="true"]');
      if (tile) void tile.requestFullscreen?.().catch(() => undefined);
    },
    onEscape: closePanel,
  });

  const self = room.participants.find((p) => p.isSelf);
  // Tile sendiri menampilkan layar bila sedang berbagi; peserta lain dari WebRTC.
  const streams = { ...room.remoteStreams, self: screenStream ?? media.stream };
  const showMediaError = media.permissionState === 'denied' || media.permissionState === 'error';

  if (room.roomError) return <ErrorScreen kind={room.roomError} />;

  return (
    <div className="flex h-dvh flex-col bg-app text-ink">
      <SpeakingWatcher />

      <header className="grid shrink-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 border-b border-line bg-surface px-3 py-2">
        <div className="flex min-w-0 items-center gap-3">
          <Logo asLink={false} size="sm" hideName className="shrink-0" />
          <div className="hidden min-w-0 sm:block">
            <p className="truncate text-sm font-semibold">{humanizeRoomCode(roomCode)}</p>
            <p className="truncate text-xs text-muted">Kode: {roomCode}</p>
          </div>
        </div>

        <ConnectionStatus
          state={room.connectionState}
          attempt={room.reconnectAttempt}
          maxAttempts={MAX_RECONNECT_ATTEMPTS}
        />

        <div className="flex items-center justify-end gap-2">
          <CopyLinkButton roomCode={roomCode} compact />
          <IconButton
            label="Info rapat"
            tooltipSide="bottom"
            pressed={activePanel === 'info'}
            icon={<Info className="h-5 w-5" />}
            onClick={() => togglePanel('info')}
          />
        </div>
      </header>

      {room.connectionState === 'disconnected' && room.reconnectAttempt >= MAX_RECONNECT_ATTEMPTS && (
        <div className="shrink-0 px-3 pt-3">
          <ErrorMessage
            title="Koneksi ke server terputus"
            message="Tidak bisa tersambung ke server rapat. Pastikan server berjalan dan koneksi internet Anda aktif."
            actionLabel="Sambung Ulang"
            onAction={reconnectSignaling}
          />
        </div>
      )}

      {showMediaError && media.lastError && (
        <div className="shrink-0 px-3 pt-3">
          <ErrorMessage
            title="Kamera/mikrofon tidak aktif"
            message={media.lastError.message}
            actionLabel="Coba Lagi"
            onAction={() => void room.retryMedia()}
            secondaryLabel={media.lastError.code === 'NotFoundError' ? 'Pengaturan' : undefined}
            onSecondary={() => openPanel('settings')}
          />
        </div>
      )}

      <div className="relative flex min-h-0 flex-1">
        <main id="konten" className="flex min-h-0 min-w-0 flex-1 flex-col gap-2 p-2 sm:gap-3 sm:p-4">
          <div className="min-h-0 flex-1">
            <VideoGrid
              participants={room.participants}
              streams={streams}
              pinnedId={room.pinnedId}
              viewerIsHost={self?.isHost ?? false}
              onTogglePin={room.togglePin}
            />
          </div>
          {room.participants.length <= 1 && <EmptyRoomState roomCode={roomCode} />}
        </main>

        {activePanel && (
          <aside className="fixed inset-0 z-30 animate-slide-in border-line shadow-panel sm:left-auto sm:w-[360px] sm:border-l lg:static lg:z-auto lg:w-[360px] lg:shrink-0 lg:shadow-none">
            {activePanel === 'chat' && (
              <ChatPanel messages={room.messages} onSend={room.sendMessage} onClose={closePanel} />
            )}
            {activePanel === 'participants' && (
              <ParticipantsPanel participants={room.participants} viewerIsHost={self?.isHost ?? false} onClose={closePanel} />
            )}
            {activePanel === 'settings' && (
              <SettingsPanel
                devices={devices}
                activeIds={activeDeviceIds}
                speakerSupported={speakerSupported}
                hasStream={!!media.stream}
                darkMode={theme === 'dark'}
                reducedMotion={reducedMotion}
                onDeviceChange={(kind, id) => void media.changeDevice(kind, id)}
                onDarkModeChange={(value) => setTheme(value ? 'dark' : 'light')}
                onReducedMotionChange={setReducedMotion}
                onClose={closePanel}
              />
            )}
            {activePanel === 'info' && <InfoPanel roomCode={roomCode} onClose={closePanel} />}
          </aside>
        )}
      </div>

      <ControlBar
        micOn={media.micOn}
        camOn={media.camOn}
        sharing={sharingScreen}
        handRaised={handRaised}
        activePanel={activePanel}
        unreadChat={unreadChat}
        onToggleMic={media.toggleMic}
        onToggleCam={media.toggleCam}
        onToggleShare={() => void room.toggleShare()}
        onToggleHand={room.toggleHand}
        onReaction={room.sendReaction}
        onTogglePanel={togglePanel}
        onLeave={() => setLeaveOpen(true)}
      />

      <Modal
        open={leaveOpen}
        onClose={closeLeave}
        title="Keluar dari rapat?"
        description="Kamera dan mikrofon akan dimatikan, lalu Anda kembali ke beranda."
        footer={
          <>
            <Button variant="secondary" onClick={closeLeave}>
              Batal
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                closeLeave();
                room.leave();
              }}
            >
              Keluar
            </Button>
          </>
        }
      />
    </div>
  );
}
