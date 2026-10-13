import type { DeviceLists, MediaDeviceOption, MediaError, MediaErrorCode } from '@/types';

const MESSAGES: Record<MediaErrorCode, string> = {
  NotAllowedError: 'Akses ditolak. Buka pengaturan browser.',
  NotFoundError: 'Perangkat tidak ditemukan.',
  NotReadableError: 'Perangkat sedang dipakai aplikasi lain.',
  OverconstrainedError: 'Perangkat tidak mendukung pengaturan ini.',
  SecurityError: 'Aplikasi butuh koneksi HTTPS.',
  NotSupportedError: 'Browser belum mendukung akses kamera & mikrofon.',
  UnknownError: 'Terjadi kesalahan saat mengakses perangkat.',
};

export function getErrorName(err: unknown): string {
  if (typeof err === 'object' && err !== null && 'name' in err) {
    return String((err as { name: unknown }).name);
  }
  return '';
}

export function mapMediaError(err: unknown): MediaError {
  const name = getErrorName(err);
  const code = (name in MESSAGES ? name : 'UnknownError') as MediaErrorCode;
  return { code, message: MESSAGES[code] };
}

function makeError(name: string): Error {
  const error = new Error(name);
  error.name = name;
  return error;
}

export function isWebRTCSupported(): boolean {
  return typeof RTCPeerConnection !== 'undefined';
}

/** Cek lingkungan: HTTPS (atau localhost) dan dukungan WebRTC. */
export function getEnvironmentError(): 'insecure' | 'unsupported' | null {
  if (typeof window !== 'undefined' && !window.isSecureContext) return 'insecure';
  if (!isWebRTCSupported() || !navigator.mediaDevices) return 'unsupported';
  return null;
}

export function supportsSpeakerSelection(): boolean {
  return typeof HTMLMediaElement !== 'undefined' && 'setSinkId' in HTMLMediaElement.prototype;
}

export async function getLocalStream(constraints: MediaStreamConstraints): Promise<MediaStream> {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw makeError(window.isSecureContext ? 'NotSupportedError' : 'SecurityError');
  }
  return navigator.mediaDevices.getUserMedia(constraints);
}

function toOptions(list: MediaDeviceInfo[], fallback: string): MediaDeviceOption[] {
  return list.map((device, index) => ({
    deviceId: device.deviceId,
    label: device.label || `${fallback} ${index + 1}`,
  }));
}

export async function listDevices(): Promise<DeviceLists> {
  if (!navigator.mediaDevices?.enumerateDevices) {
    return { cameras: [], microphones: [], speakers: [] };
  }
  const devices = await navigator.mediaDevices.enumerateDevices();
  return {
    cameras: toOptions(devices.filter((d) => d.kind === 'videoinput'), 'Kamera'),
    microphones: toOptions(devices.filter((d) => d.kind === 'audioinput'), 'Mikrofon'),
    speakers: toOptions(devices.filter((d) => d.kind === 'audiooutput'), 'Speaker'),
  };
}

export function stopStream(stream: MediaStream | null | undefined): void {
  stream?.getTracks().forEach((track) => track.stop());
}
