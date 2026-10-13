import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Shuffle, Video } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { Input } from '@/components/ui/Input';
import { ROOM_CODE_ERROR, extractRoomCode, generateRoomCode, isValidRoomCode } from '@/lib/roomCode';
import { cn } from '@/lib/utils';
import type { PreviewState } from '@/types';

export function RoomInputCard({ className }: { className?: string }) {
  const navigate = useNavigate();
  const [roomInput, setRoomInput] = useState('');
  const [joinInput, setJoinInput] = useState('');
  const [startError, setStartError] = useState<string | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);

  const goToPreview = (code: string, isHost: boolean) => {
    const state: PreviewState = { isHost };
    navigate(`/pratinjau/${code}`, { state });
  };

  const handleStart = (event: FormEvent) => {
    event.preventDefault();
    // Kosong -> isi otomatis dengan kode acak.
    let code = extractRoomCode(roomInput);
    if (!code) {
      code = generateRoomCode();
      setRoomInput(code);
    }
    if (!isValidRoomCode(code)) {
      setStartError(ROOM_CODE_ERROR);
      return;
    }
    setStartError(null);
    goToPreview(code, true);
  };

  const handleJoin = (event: FormEvent) => {
    event.preventDefault();
    const code = extractRoomCode(joinInput);
    if (!code) {
      setJoinError('Tempel kode atau tautan undangan terlebih dahulu.');
      return;
    }
    if (!isValidRoomCode(code)) {
      setJoinError(ROOM_CODE_ERROR);
      return;
    }
    setJoinError(null);
    goToPreview(code, false);
  };

  return (
    <div className={cn('rounded-2xl border border-line bg-surface p-5 shadow-card sm:p-6', className)}>
      <form onSubmit={handleStart} noValidate>
        <Input
          label="Nama atau kode ruang"
          value={roomInput}
          onChange={(e) => {
            setRoomInput(e.target.value);
            setStartError(null);
          }}
          placeholder="mis. rapat-tim-mingguan"
          error={startError}
          hint={startError ? undefined : 'Kosongkan untuk membuat kode acak.'}
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          maxLength={200}
          endAdornment={
            <IconButton
              label="Buat kode acak"
              tone="ghost"
              icon={<Shuffle className="h-5 w-5" />}
              onClick={() => {
                setRoomInput(generateRoomCode());
                setStartError(null);
              }}
            />
          }
        />
        <Button type="submit" size="lg" fullWidth className="mt-4" leftIcon={<Video className="h-5 w-5" aria-hidden="true" />}>
          Mulai Rapat
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3 text-sm text-muted" role="separator" aria-label="atau">
        <span className="h-px flex-1 bg-line" aria-hidden="true" />
        <span aria-hidden="true">atau</span>
        <span className="h-px flex-1 bg-line" aria-hidden="true" />
      </div>

      <form onSubmit={handleJoin} noValidate>
        <Input
          label="Tempel kode/tautan undangan"
          value={joinInput}
          onChange={(e) => {
            setJoinInput(e.target.value);
            setJoinError(null);
          }}
          placeholder="cerah-bulan-42 atau https://…"
          error={joinError}
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          maxLength={300}
        />
        <Button type="submit" variant="secondary" size="lg" fullWidth className="mt-4" leftIcon={<LogIn className="h-5 w-5" aria-hidden="true" />}>
          Gabung ke Rapat
        </Button>
      </form>
    </div>
  );
}
