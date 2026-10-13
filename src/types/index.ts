export type PermissionState = 'idle' | 'granted' | 'denied' | 'error';
export type ConnectionState = 'connecting' | 'connected' | 'disconnected';
export type PanelId = 'chat' | 'participants' | 'settings' | 'info';
export type ToastTone = 'info' | 'success' | 'error';
export type DeviceKind = 'camera' | 'microphone' | 'speaker';

export type MediaErrorCode =
  | 'NotAllowedError'
  | 'NotFoundError'
  | 'NotReadableError'
  | 'OverconstrainedError'
  | 'SecurityError'
  | 'NotSupportedError'
  | 'UnknownError';

export interface MediaError {
  code: MediaErrorCode;
  message: string;
}

export type RoomErrorCode = 'invalid-code' | 'not-found' | 'full' | 'insecure' | 'unsupported';

export interface Participant {
  id: string;
  name: string;
  isSelf: boolean;
  isHost: boolean;
  micOn: boolean;
  camOn: boolean;
  handRaised: boolean;
  speaking: boolean;
  sharing: boolean;
  reaction?: string | null;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
}

export interface ToastItem {
  id: string;
  message: string;
  tone: ToastTone;
}

export interface MediaDeviceOption {
  deviceId: string;
  label: string;
}

export interface DeviceLists {
  cameras: MediaDeviceOption[];
  microphones: MediaDeviceOption[];
  speakers: MediaDeviceOption[];
}

export interface ActiveDeviceIds {
  cameraId: string | null;
  micId: string | null;
  speakerId: string | null;
}

/** Disimpan di sessionStorage — hanya nama tampilan, TIDAK ada token/password. */
export interface RoomSession {
  roomCode: string;
  displayName: string;
  isHost: boolean;
}

/** State navigasi dari Home/Preview. */
export interface PreviewState {
  isHost?: boolean;
}
