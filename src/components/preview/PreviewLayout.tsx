import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mic, MicOff, Video, VideoOff } from 'lucide-react';
import { DeviceSelector, type MicTestState } from '@/components/preview/DeviceSelector';
import { MicLevelIndicator } from '@/components/preview/MicLevelIndicator';
import { PermissionBanner } from '@/components/preview/PermissionBanner';
import { VideoPreview } from '@/components/preview/VideoPreview';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { NAME_MAX } from '@/lib/constants';
import { loadSession, saveSession } from '@/lib/session';
import { sanitizeName, validateName } from '@/lib/sanitize';
import { useAudioLevel } from '@/hooks/useAudioLevel';
import { cancelReleaseLocalMedia, releaseLocalMedia, scheduleReleaseLocalMedia, useLocalMedia } from '@/hooks/useLocalMedia';
import { useMediaDevices } from '@/hooks/useMediaDevices';
import { useUIStore } from '@/store/uiStore';

interface PreviewLayoutProps {
  roomCode: string;
  isHost: boolean;
}

export function PreviewLayout({ roomCode, isHost }: PreviewLayoutProps) {
  const navigate = useNavigate();
  const media = useLocalMedia();
  const { devices, activeDeviceIds, speakerSupported } = useMediaDevices();
  const level = useAudioLevel(media.stream, media.micOn);

  const [name, setName] = useState(() => loadSession(roomCode)?.displayName ?? '');
  const [nameError, setNameError] = useState<string | null>(null);
  const [requesting, setRequesting] = useState(false);
  const [testState, setTestState] = useState<MicTestState>('idle');

  const nameRef = useRef<HTMLInputElement>(null);
  const joinedRef = useRef(false);
  const peakRef = useRef(0);
  const testTimer = useRef<number>();

  // Kamera dimatikan bila pengguna meninggalkan halaman tanpa bergabung.
  useEffect(() => {
    cancelReleaseLocalMedia();
    return () => {
      window.clearTimeout(testTimer.current);
      if (!joinedRef.current) scheduleReleaseLocalMedia();
    };
  }, []);

  useEffect(() => {
    if (testState === 'testing') peakRef.current = Math.max(peakRef.current, level);
  }, [level, testState]);

  const handleRequest = async () => {
    setRequesting(true);
    await media.start();
    setRequesting(false);
  };

  const runMicTest = () => {
    if (!media.stream || !media.micOn) return;
    peakRef.current = 0;
    setTestState('testing');
    window.clearTimeout(testTimer.current);
    testTimer.current = window.setTimeout(() => setTestState(peakRef.current > 0.08 ? 'ok' : 'silent'), 3000);
  };

  const handleJoin = () => {
    const error = validateName(name);
    if (error) {
      setNameError(error);
      nameRef.current?.focus();
      return;
    }
    const displayName = sanitizeName(name);
    const previous = loadSession(roomCode);
    const host = isHost || previous?.isHost === true;
    saveSession({ roomCode, displayName, isHost: host });
    joinedRef.current = true;
    navigate(`/rapat/${roomCode}`, { state: { displayName, isHost: host } });
  };

  const handleBack = () => {
    releaseLocalMedia();
    useUIStore.getState().closePanel();
    navigate('/');
  };

  const hasStream = !!media.stream;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
      <div>
        <VideoPreview stream={media.stream} camOn={media.camOn} micOn={media.micOn} name={name} />
        <div className="mt-4">
          <MicLevelIndicator level={level} active={hasStream && media.micOn} />
        </div>
        <p className="mt-3 text-sm text-muted">
          Pratinjau ini hanya tampil di perangkat Anda sampai Anda bergabung ke rapat.
        </p>
      </div>

      <div className="space-y-5">
        <PermissionBanner state={media.permissionState} error={media.lastError} requesting={requesting} onRequest={handleRequest} />

        <Input
          ref={nameRef}
          label="Nama tampilan"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setNameError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleJoin();
          }}
          error={nameError}
          hint="2–40 karakter. Nama ini dilihat peserta lain."
          maxLength={NAME_MAX * 2}
          autoComplete="nickname"
          required
        />

        <DeviceSelector
          idPrefix="pratinjau"
          devices={devices}
          activeIds={activeDeviceIds}
          onChange={(kind, id) => void media.changeDevice(kind, id)}
          speakerSupported={speakerSupported}
          disabled={!hasStream}
          micTest={{ state: testState, disabled: !hasStream || !media.micOn, onRun: runMicTest }}
        />

        <div className="grid gap-2 sm:grid-cols-2">
          <Button
            variant="secondary"
            disabled={!hasStream}
            onClick={media.toggleCam}
            leftIcon={media.camOn ? <VideoOff className="h-5 w-5" aria-hidden="true" /> : <Video className="h-5 w-5" aria-hidden="true" />}
          >
            {media.camOn ? 'Matikan Kamera' : 'Nyalakan Kamera'}
          </Button>
          <Button
            variant="secondary"
            disabled={!hasStream}
            onClick={media.toggleMic}
            leftIcon={media.micOn ? <MicOff className="h-5 w-5" aria-hidden="true" /> : <Mic className="h-5 w-5" aria-hidden="true" />}
          >
            {media.micOn ? 'Matikan Mikrofon' : 'Nyalakan Mikrofon'}
          </Button>
        </div>

        <div className="space-y-2">
          <Button size="lg" fullWidth onClick={handleJoin}>
            Gabung ke Rapat
          </Button>
          <Button variant="ghost" fullWidth onClick={handleBack} leftIcon={<ArrowLeft className="h-5 w-5" aria-hidden="true" />}>
            Kembali
          </Button>
        </div>
      </div>
    </div>
  );
}
