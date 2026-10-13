import { useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CHAT_MAX_LENGTH, CHAT_RATE_LIMIT, CHAT_RATE_WINDOW_MS } from '@/lib/constants';
import { clearSession } from '@/lib/session';
import { sanitizeText } from '@/lib/sanitize';
import { uid } from '@/lib/utils';
import { getErrorName, stopStream } from '@/services/mediaService';
import { useToast } from '@/hooks/useToast';
import { releaseLocalMedia, scheduleReleaseLocalMedia, startLocalMedia } from '@/hooks/useLocalMedia';
import { sendChat, sendReaction as sendReactionSignal } from '@/hooks/useSignaling';
import { useMediaStore } from '@/store/mediaStore';
import { useRoomStore } from '@/store/roomStore';
import { useUIStore } from '@/store/uiStore';

interface Args {
  roomCode: string;
  displayName: string;
  isHost: boolean;
}

export type SendResult = 'ok' | 'empty' | 'rate-limited';

function stopScreenShare(): void {
  const media = useMediaStore.getState();
  stopStream(media.screenStream);
  media.setScreenStream(null);
  media.setSharingScreen(false);
}

/** Logika ruang: inisialisasi, sinkronisasi status lokal, chat, reaksi, berbagi layar, keluar. */
export function useRoomState({ roomCode, displayName, isHost }: Args) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const participants = useRoomStore((s) => s.participants);
  const messages = useRoomStore((s) => s.messages);
  const pinnedId = useRoomStore((s) => s.pinnedId);
  const remoteStreams = useRoomStore((s) => s.remoteStreams);
  const roomError = useRoomStore((s) => s.roomError);
  const connectionState = useRoomStore((s) => s.connectionState);
  const reconnectAttempt = useRoomStore((s) => s.reconnectAttempt);
  const updateParticipant = useRoomStore((s) => s.updateParticipant);
  const togglePin = useRoomStore((s) => s.togglePin);

  const micOn = useMediaStore((s) => s.micOn);
  const camOn = useMediaStore((s) => s.camOn);
  const handRaised = useMediaStore((s) => s.handRaised);
  const sharingScreen = useMediaStore((s) => s.sharingScreen);

  const sendTimes = useRef<number[]>([]);
  const reactionTimer = useRef<number>();
  const knownParticipants = useRef<Map<string, string>>(new Map());

  const reportMediaError = useCallback(() => {
    const error = useMediaStore.getState().lastError;
    if (error) toast(`Tidak bisa mengakses kamera: ${error.message}`, 'error');
  }, [toast]);

  // Inisialisasi ruang + (jika belum ada) minta stream lokal. Aman untuk StrictMode.
  useEffect(() => {
    const media = useMediaStore.getState();
    media.setHandRaised(false);
    stopScreenShare();
    useRoomStore.getState().initRoom({ roomCode, displayName, isHost, micOn: media.micOn, camOn: media.camOn });
    void startLocalMedia().then((stream) => {
      if (!stream) reportMediaError();
    });
    return () => {
      stopScreenShare();
      scheduleReleaseLocalMedia();
      useRoomStore.getState().reset();
      knownParticipants.current = new Map();
    };
  }, [roomCode, displayName, isHost, reportMediaError]);

  // Sinkronkan toggle lokal -> baris "Anda" di daftar peserta.
  useEffect(() => {
    updateParticipant('self', { micOn, camOn, handRaised, sharing: sharingScreen });
  }, [micOn, camOn, handRaised, sharingScreen, updateParticipant]);

  // Toast "X bergabung" / "X keluar" (live region di ToastViewport).
  useEffect(() => {
    const previous = knownParticipants.current;
    const next = new Map(participants.map((p) => [p.id, p.name] as const));
    if (previous.size > 0) {
      next.forEach((name, id) => {
        if (id !== 'self' && !previous.has(id)) toast(`${name} bergabung`);
      });
      previous.forEach((name, id) => {
        if (id !== 'self' && !next.has(id)) toast(`${name} keluar`);
      });
    }
    knownParticipants.current = next;
  }, [participants, toast]);

  useEffect(() => () => window.clearTimeout(reactionTimer.current), []);

  const retryMedia = useCallback(async () => {
    const stream = await startLocalMedia();
    if (!stream) reportMediaError();
  }, [reportMediaError]);

  const sendMessage = useCallback((raw: string): SendResult => {
    const text = sanitizeText(raw, CHAT_MAX_LENGTH);
    if (!text) return 'empty';
    const now = Date.now();
    sendTimes.current = sendTimes.current.filter((t) => now - t < CHAT_RATE_WINDOW_MS);
    if (sendTimes.current.length >= CHAT_RATE_LIMIT) return 'rate-limited'; // rate limit sisi klien
    sendTimes.current.push(now);
    const room = useRoomStore.getState();
    room.addMessage({ id: uid('msg'), senderId: 'self', senderName: room.displayName, text, timestamp: now });
    sendChat(text);
    return 'ok';
  }, []);

  const toggleHand = useCallback(() => {
    const media = useMediaStore.getState();
    media.setHandRaised(!media.handRaised);
  }, []);

  const toggleShare = useCallback(async () => {
    const media = useMediaStore.getState();
    if (media.sharingScreen) {
      stopScreenShare();
      return;
    }
    if (!navigator.mediaDevices?.getDisplayMedia) {
      toast('Browser atau perangkat ini belum mendukung berbagi layar.', 'error');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      // Tombol "Stop sharing" bawaan browser juga harus menghentikan berbagi.
      stream.getVideoTracks()[0]?.addEventListener('ended', () => {
        if (useMediaStore.getState().screenStream === stream) stopScreenShare();
      });
      media.setScreenStream(stream);
      media.setSharingScreen(true);
    } catch (err) {
      if (getErrorName(err) !== 'NotAllowedError') toast('Tidak bisa membagikan layar.', 'error');
    }
  }, [toast]);

  const sendReaction = useCallback(
    (emoji: string) => {
      updateParticipant('self', { reaction: emoji });
      sendReactionSignal(emoji);
      window.clearTimeout(reactionTimer.current);
      reactionTimer.current = window.setTimeout(() => updateParticipant('self', { reaction: null }), 3000);
    },
    [updateParticipant],
  );

  const leave = useCallback(() => {
    stopScreenShare();
    releaseLocalMedia();
    useMediaStore.getState().resetFlags();
    useRoomStore.getState().reset();
    useUIStore.getState().closePanel();
    useUIStore.getState().resetUnread();
    clearSession();
    navigate('/', { replace: true });
  }, [navigate]);

  return {
    participants,
    messages,
    pinnedId,
    remoteStreams,
    roomError,
    connectionState,
    reconnectAttempt,
    sendMessage,
    toggleHand,
    toggleShare,
    sendReaction,
    togglePin,
    retryMedia,
    leave,
  };
}
