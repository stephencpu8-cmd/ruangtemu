import { useEffect, useRef, useState } from 'react';
import { Hand, MessageSquare, Mic, MicOff, MonitorUp, PhoneOff, Settings, Smile, Users, Video, VideoOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { REACTIONS } from '@/lib/constants';
import type { PanelId } from '@/types';

interface ControlBarProps {
  micOn: boolean;
  camOn: boolean;
  sharing: boolean;
  handRaised: boolean;
  activePanel: PanelId | null;
  unreadChat: number;
  onToggleMic: () => void;
  onToggleCam: () => void;
  onToggleShare: () => void;
  onToggleHand: () => void;
  onReaction: (emoji: string) => void;
  onTogglePanel: (panel: PanelId) => void;
  onLeave: () => void;
}

const ICON = 'h-6 w-6';

export function ControlBar(props: ControlBarProps) {
  const { micOn, camOn, sharing, handRaised, activePanel, unreadChat } = props;
  const [reactionsOpen, setReactionsOpen] = useState(false);
  const reactionWrapRef = useRef<HTMLDivElement>(null);
  const reactionButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!reactionsOpen) return undefined;
    const onPointerDown = (event: PointerEvent) => {
      if (!reactionWrapRef.current?.contains(event.target as Node)) setReactionsOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [reactionsOpen]);

  return (
    <div className="shrink-0 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)]">
      <nav
        aria-label="Kontrol rapat"
        className="mx-auto flex max-w-4xl items-center gap-2 overflow-x-auto px-3 py-3 sm:justify-center sm:overflow-visible"
      >
        <IconButton
          size="lg"
          tone={micOn ? 'default' : 'danger'}
          label={micOn ? 'Matikan mikrofon' : 'Nyalakan mikrofon'}
          tooltip={micOn ? 'Matikan mikrofon (M)' : 'Nyalakan mikrofon (M)'}
          icon={micOn ? <Mic className={ICON} /> : <MicOff className={ICON} />}
          onClick={props.onToggleMic}
        />
        <IconButton
          size="lg"
          tone={camOn ? 'default' : 'danger'}
          label={camOn ? 'Matikan kamera' : 'Nyalakan kamera'}
          tooltip={camOn ? 'Matikan kamera (V)' : 'Nyalakan kamera (V)'}
          icon={camOn ? <Video className={ICON} /> : <VideoOff className={ICON} />}
          onClick={props.onToggleCam}
        />
        <IconButton
          size="lg"
          pressed={sharing}
          label={sharing ? 'Hentikan berbagi layar' : 'Bagikan layar'}
          tooltip={sharing ? 'Hentikan berbagi layar (S)' : 'Bagikan layar (S)'}
          icon={<MonitorUp className={ICON} />}
          onClick={props.onToggleShare}
        />
        <IconButton
          size="lg"
          pressed={handRaised}
          label={handRaised ? 'Turunkan tangan' : 'Angkat tangan'}
          icon={<Hand className={ICON} />}
          onClick={props.onToggleHand}
        />

        <div ref={reactionWrapRef}>
          <IconButton
            ref={reactionButtonRef}
            size="lg"
            pressed={reactionsOpen}
            label="Reaksi"
            aria-haspopup="menu"
            aria-expanded={reactionsOpen}
            icon={<Smile className={ICON} />}
            onClick={() => setReactionsOpen((open) => !open)}
          />
          {reactionsOpen && (
            <div
              role="menu"
              aria-label="Pilih reaksi"
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  event.preventDefault();
                  setReactionsOpen(false);
                  reactionButtonRef.current?.focus();
                }
              }}
              className="fixed bottom-24 left-1/2 z-40 flex -translate-x-1/2 animate-fade-in gap-1 rounded-2xl border border-line bg-surface p-2 shadow-card"
            >
              {REACTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  role="menuitem"
                  aria-label={`Reaksi ${emoji}`}
                  onClick={() => {
                    props.onReaction(emoji);
                    setReactionsOpen(false);
                  }}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-2xl hover:bg-brandsoft"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        <IconButton
          size="lg"
          pressed={activePanel === 'chat'}
          label={unreadChat > 0 ? `Obrolan, ${unreadChat} pesan belum dibaca` : 'Obrolan'}
          tooltip="Obrolan (C)"
          badge={unreadChat}
          icon={<MessageSquare className={ICON} />}
          onClick={() => props.onTogglePanel('chat')}
        />
        <IconButton
          size="lg"
          pressed={activePanel === 'participants'}
          label="Peserta"
          tooltip="Peserta (P)"
          icon={<Users className={ICON} />}
          onClick={() => props.onTogglePanel('participants')}
        />
        <IconButton
          size="lg"
          pressed={activePanel === 'settings'}
          label="Pengaturan"
          icon={<Settings className={ICON} />}
          onClick={() => props.onTogglePanel('settings')}
        />

        <Button
          variant="danger"
          size="lg"
          aria-label="Keluar dari rapat"
          className="ml-1 shrink-0"
          onClick={props.onLeave}
          leftIcon={<PhoneOff className="h-5 w-5" aria-hidden="true" />}
        >
          <span className="hidden sm:inline">Keluar</span>
        </Button>
      </nav>
    </div>
  );
}
