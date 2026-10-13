import { useCallback } from 'react';
import { getErrorName, getLocalStream, listDevices, mapMediaError, stopStream } from '@/services/mediaService';
import { useMediaStore } from '@/store/mediaStore';
import type { DeviceKind } from '@/types';

/* ------------------------------------------------------------------ */
/* Pengendali stream lokal (module-level agar aman dipanggil dari      */
/* beberapa halaman & tahan terhadap React StrictMode).                */
/* ------------------------------------------------------------------ */

let pending: Promise<MediaStream | null> | null = null;
let abortPending = false;
let releaseTimer: ReturnType<typeof setTimeout> | null = null;

function buildConstraints(withAudio: boolean, withVideo: boolean): MediaStreamConstraints {
  const { activeDeviceIds: ids } = useMediaStore.getState();
  return {
    audio: withAudio
      ? {
          echoCancellation: true,
          noiseSuppression: true,
          ...(ids.micId ? { deviceId: { ideal: ids.micId } } : {}),
        }
      : false,
    video: withVideo
      ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          ...(ids.cameraId ? { deviceId: { ideal: ids.cameraId } } : {}),
        }
      : false,
  };
}

async function acquire(): Promise<MediaStream> {
  try {
    return await getLocalStream(buildConstraints(true, true));
  } catch (err) {
    if (getErrorName(err) === 'NotFoundError') {
      // Salah satu perangkat tidak ada: coba hanya audio, lalu hanya video.
      try {
        const audioOnly = await getLocalStream(buildConstraints(true, false));
        useMediaStore.getState().setCamOn(false);
        return audioOnly;
      } catch {
        /* lanjut */
      }
      try {
        const videoOnly = await getLocalStream(buildConstraints(false, true));
        useMediaStore.getState().setMicOn(false);
        return videoOnly;
      } catch {
        /* lanjut */
      }
    }
    throw err;
  }
}

export function cancelReleaseLocalMedia(): void {
  if (releaseTimer) {
    clearTimeout(releaseTimer);
    releaseTimer = null;
  }
}

/** Minta akses kamera/mikrofon. Idempoten: memakai stream/permintaan yang sudah ada. */
export function startLocalMedia(): Promise<MediaStream | null> {
  cancelReleaseLocalMedia();
  const store = useMediaStore.getState();
  if (store.localStream) return Promise.resolve(store.localStream);
  if (pending) {
    abortPending = false;
    return pending;
  }
  abortPending = false;

  pending = (async () => {
    try {
      const stream = await acquire();
      if (abortPending) {
        stopStream(stream);
        return null;
      }
      const s = useMediaStore.getState();
      stream.getAudioTracks().forEach((t) => {
        t.enabled = s.micOn;
      });
      stream.getVideoTracks().forEach((t) => {
        t.enabled = s.camOn;
      });
      const camId = stream.getVideoTracks()[0]?.getSettings().deviceId;
      const micId = stream.getAudioTracks()[0]?.getSettings().deviceId;
      if (camId) s.setActiveDevice('camera', camId);
      if (micId) s.setActiveDevice('microphone', micId);
      s.setLocalStream(stream);
      s.setPermission('granted', null);
      // Label perangkat baru tersedia setelah izin diberikan.
      void listDevices()
        .then((d) => useMediaStore.getState().setDevices(d))
        .catch(() => undefined);
      return stream;
    } catch (err) {
      if (!abortPending) {
        const error = mapMediaError(err);
        useMediaStore.getState().setPermission(error.code === 'NotAllowedError' ? 'denied' : 'error', error);
      }
      return null;
    } finally {
      pending = null;
    }
  })();
  return pending;
}

/** Hentikan semua track & kosongkan stream. */
export function releaseLocalMedia(): void {
  cancelReleaseLocalMedia();
  if (pending) abortPending = true;
  const s = useMediaStore.getState();
  stopStream(s.localStream);
  s.setLocalStream(null);
  if (s.permissionState === 'granted') s.setPermission('idle', null);
}

/** Dijadwalkan (bukan langsung) supaya remount StrictMode/navigasi cepat tidak mematikan kamera. */
export function scheduleReleaseLocalMedia(): void {
  cancelReleaseLocalMedia();
  releaseTimer = setTimeout(() => {
    releaseTimer = null;
    releaseLocalMedia();
  }, 150);
}

export async function switchDevice(kind: DeviceKind, id: string): Promise<void> {
  const s = useMediaStore.getState();
  s.setActiveDevice(kind, id);
  // TODO: speaker -> HTMLMediaElement.setSinkId() pada elemen audio peserta jauh saat WebRTC aktif.
  if (kind === 'speaker' || !s.localStream) return;
  stopStream(s.localStream);
  s.setLocalStream(null);
  await startLocalMedia();
}

/* ------------------------------------------------------------------ */
/* Hook                                                                */
/* ------------------------------------------------------------------ */

export function useLocalMedia() {
  const stream = useMediaStore((s) => s.localStream);
  const micOn = useMediaStore((s) => s.micOn);
  const camOn = useMediaStore((s) => s.camOn);
  const permissionState = useMediaStore((s) => s.permissionState);
  const lastError = useMediaStore((s) => s.lastError);

  const toggleMic = useCallback(() => {
    const s = useMediaStore.getState();
    const next = !s.micOn;
    s.localStream?.getAudioTracks().forEach((t) => {
      t.enabled = next;
    });
    s.setMicOn(next);
  }, []);

  const toggleCam = useCallback(() => {
    const s = useMediaStore.getState();
    const next = !s.camOn;
    s.localStream?.getVideoTracks().forEach((t) => {
      t.enabled = next;
    });
    s.setCamOn(next);
  }, []);

  const start = useCallback(() => startLocalMedia(), []);
  const stop = useCallback(() => releaseLocalMedia(), []);
  const changeDevice = useCallback((kind: DeviceKind, id: string) => switchDevice(kind, id), []);

  return { stream, micOn, camOn, permissionState, lastError, toggleMic, toggleCam, start, stop, changeDevice };
}
