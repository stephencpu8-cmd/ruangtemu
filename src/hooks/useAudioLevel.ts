import { useEffect, useState } from 'react';

type AudioContextCtor = typeof AudioContext;

// Satu AudioContext dipakai bersama (browser membatasi jumlah context).
let sharedContext: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (sharedContext && sharedContext.state !== 'closed') return sharedContext;
  const Ctor: AudioContextCtor | undefined =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: AudioContextCtor }).webkitAudioContext;
  if (!Ctor) return null;
  try {
    sharedContext = new Ctor();
  } catch {
    sharedContext = null;
  }
  return sharedContext;
}

/**
 * Level suara 0..1 dari sebuah stream (analyser WebAudio).
 * State hanya diperbarui ~14x/detik dan bila perubahan cukup berarti.
 */
export function useAudioLevel(stream: MediaStream | null, enabled: boolean): number {
  const [level, setLevel] = useState(0);

  useEffect(() => {
    if (!stream || !enabled || stream.getAudioTracks().length === 0) {
      setLevel(0);
      return undefined;
    }
    const ctx = getContext();
    if (!ctx) return undefined;
    void ctx.resume().catch(() => undefined);

    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    source.connect(analyser);

    const data = new Uint8Array(analyser.fftSize);
    let raf = 0;
    let last = 0;
    let previous = 0;

    const tick = (time: number) => {
      raf = requestAnimationFrame(tick);
      if (time - last < 70) return;
      last = time;
      analyser.getByteTimeDomainData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i += 1) {
        const v = (data[i] - 128) / 128;
        sum += v * v;
      }
      const next = Math.min(1, Math.sqrt(sum / data.length) * 4);
      if (Math.abs(next - previous) > 0.02) {
        previous = next;
        setLevel(next);
      }
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      source.disconnect();
      analyser.disconnect();
    };
  }, [stream, enabled]);

  return enabled ? level : 0;
}
