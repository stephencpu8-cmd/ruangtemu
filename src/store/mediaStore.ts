import { create } from 'zustand';
import type { ActiveDeviceIds, DeviceKind, DeviceLists, MediaError, PermissionState } from '@/types';

interface MediaState {
  micOn: boolean;
  camOn: boolean;
  sharingScreen: boolean;
  handRaised: boolean;
  devices: DeviceLists;
  activeDeviceIds: ActiveDeviceIds;
  permissionState: PermissionState;
  lastError: MediaError | null;
  /** Stream lokal dari getUserMedia (dibagi antara halaman pratinjau & rapat). */
  localStream: MediaStream | null;
  /** Stream layar (getDisplayMedia) saat berbagi layar. */
  screenStream: MediaStream | null;

  setMicOn: (value: boolean) => void;
  setCamOn: (value: boolean) => void;
  setSharingScreen: (value: boolean) => void;
  setHandRaised: (value: boolean) => void;
  setDevices: (devices: DeviceLists) => void;
  setActiveDevice: (kind: DeviceKind, id: string | null) => void;
  setPermission: (state: PermissionState, error?: MediaError | null) => void;
  setLocalStream: (stream: MediaStream | null) => void;
  setScreenStream: (stream: MediaStream | null) => void;
  resetFlags: () => void;
}

export const useMediaStore = create<MediaState>((set) => ({
  micOn: true,
  camOn: true,
  sharingScreen: false,
  handRaised: false,
  devices: { cameras: [], microphones: [], speakers: [] },
  activeDeviceIds: { cameraId: null, micId: null, speakerId: null },
  permissionState: 'idle',
  lastError: null,
  localStream: null,
  screenStream: null,

  setMicOn: (micOn) => set({ micOn }),
  setCamOn: (camOn) => set({ camOn }),
  setSharingScreen: (sharingScreen) => set({ sharingScreen }),
  setHandRaised: (handRaised) => set({ handRaised }),
  setDevices: (devices) => set({ devices }),
  setActiveDevice: (kind, id) =>
    set((state) => {
      const next = { ...state.activeDeviceIds };
      if (kind === 'camera') next.cameraId = id;
      else if (kind === 'microphone') next.micId = id;
      else next.speakerId = id;
      return { activeDeviceIds: next };
    }),
  setPermission: (permissionState, error = null) => set({ permissionState, lastError: error }),
  setLocalStream: (localStream) => set({ localStream }),
  setScreenStream: (screenStream) => set({ screenStream }),
  resetFlags: () =>
    set({
      micOn: true,
      camOn: true,
      sharingScreen: false,
      screenStream: null,
      handRaised: false,
      permissionState: 'idle',
      lastError: null,
    }),
}));
