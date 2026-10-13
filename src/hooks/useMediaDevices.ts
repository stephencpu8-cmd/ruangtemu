import { useCallback, useEffect } from 'react';
import { listDevices, supportsSpeakerSelection } from '@/services/mediaService';
import { useMediaStore } from '@/store/mediaStore';

/** Daftar perangkat (kamera/mikrofon/speaker) + pembaruan otomatis saat perangkat berubah. */
export function useMediaDevices() {
  const devices = useMediaStore((s) => s.devices);
  const activeDeviceIds = useMediaStore((s) => s.activeDeviceIds);
  const setDevices = useMediaStore((s) => s.setDevices);

  const refresh = useCallback(async () => {
    try {
      setDevices(await listDevices());
    } catch {
      /* abaikan: daftar tetap seperti sebelumnya */
    }
  }, [setDevices]);

  useEffect(() => {
    void refresh();
    const md = navigator.mediaDevices;
    md?.addEventListener?.('devicechange', refresh);
    return () => md?.removeEventListener?.('devicechange', refresh);
  }, [refresh]);

  return { devices, activeDeviceIds, speakerSupported: supportsSpeakerSelection(), refresh };
}
