import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Send } from 'lucide-react';
import { PanelShell } from '@/components/room/PanelShell';
import { IconButton } from '@/components/ui/IconButton';
import { CHAT_MAX_LENGTH, CHAT_RATE_LIMIT } from '@/lib/constants';
import { cn, formatTime } from '@/lib/utils';
import type { SendResult } from '@/hooks/useRoomState';
import type { ChatMessage } from '@/types';

interface ChatPanelProps {
  messages: ChatMessage[];
  onSend: (text: string) => SendResult;
  onClose: () => void;
}

export function ChatPanel({ messages, onSend, onClose }: ChatPanelProps) {
  const [text, setText] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  // Auto-scroll ke pesan terbaru.
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages.length]);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(() => setNotice(null), 2500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const result = onSend(text);
    if (result === 'ok') setText('');
    if (result === 'rate-limited') setNotice(`Terlalu cepat. Maksimal ${CHAT_RATE_LIMIT} pesan per detik.`);
  };

  return (
    <PanelShell
      title="Obrolan"
      onClose={onClose}
      footer={
        <form onSubmit={submit} className="shrink-0 border-t border-line p-3">
          {notice && (
            <p role="alert" className="mb-2 text-sm text-danger-600 dark:text-danger-300">
              {notice}
            </p>
          )}
          <div className="flex items-center gap-2">
            <label htmlFor="chat-input" className="sr-only">
              Tulis pesan
            </label>
            <input
              id="chat-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={CHAT_MAX_LENGTH}
              placeholder="Tulis pesan…"
              autoComplete="off"
              className="min-h-[48px] min-w-0 flex-1 rounded-xl border border-line bg-surface px-4 text-base text-ink placeholder:text-muted focus:border-brand-500"
            />
            <IconButton type="submit" tone="default" label="Kirim pesan" icon={<Send className="h-5 w-5" />} disabled={!text.trim()} />
          </div>
        </form>
      }
    >
      <div className="flex min-h-full flex-col p-4">
        {messages.length === 0 ? (
          <p className="my-auto text-center text-sm text-muted">Belum ada pesan. Mulai obrolan di sini.</p>
        ) : (
          <div role="log" aria-live="polite" aria-label="Daftar pesan" className="space-y-3">
            {messages.map((m) => (
              <div key={m.id} className={cn('flex flex-col', m.senderId === 'self' && 'items-end')}>
                <p className="text-xs text-muted">
                  <span className="font-semibold text-ink">{m.senderId === 'self' ? 'Anda' : m.senderName}</span>
                  {' · '}
                  {formatTime(m.timestamp)}
                </p>
                <p
                  className={cn(
                    'mt-1 max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-3 py-2 text-sm',
                    m.senderId === 'self' ? 'bg-brand-500 text-white' : 'bg-brandsoft text-ink',
                  )}
                >
                  {m.text}
                </p>
              </div>
            ))}
          </div>
        )}
        <div ref={endRef} />
      </div>
    </PanelShell>
  );
}
