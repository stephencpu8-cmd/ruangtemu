import { create } from 'zustand';
import { MAX_CHAT_HISTORY } from '@/lib/constants';
import type { ChatMessage, ConnectionState, Participant, RoomErrorCode } from '@/types';

interface InitArgs {
  roomCode: string;
  displayName: string;
  isHost: boolean;
  micOn: boolean;
  camOn: boolean;
}

interface RoomState {
  roomCode: string;
  displayName: string;
  isHost: boolean;
  participants: Participant[];
  connectionState: ConnectionState;
  reconnectAttempt: number;
  messages: ChatMessage[];
  pinnedId: string | null;
  /** Stream video/audio peserta jauh (kunci = id peserta). */
  remoteStreams: Record<string, MediaStream>;
  /** Error tingkat ruang dari server (mis. ruang penuh). */
  roomError: RoomErrorCode | null;

  initRoom: (args: InitArgs) => void;
  addParticipant: (participant: Participant) => void;
  removeParticipant: (id: string) => void;
  updateParticipant: (id: string, patch: Partial<Participant>) => void;
  addMessage: (message: ChatMessage) => void;
  setConnectionState: (state: ConnectionState, attempt?: number) => void;
  togglePin: (id: string) => void;
  setRemoteStream: (id: string, stream: MediaStream) => void;
  /** Status host untuk diri sendiri (ditentukan server saat bergabung). */
  setSelfHost: (value: boolean) => void;
  /** Pindahkan status host ke satu peserta (event "host" dari server). */
  applyHost: (hostId: string) => void;
  /** Buang semua peserta jauh (mis. saat tersambung ulang). */
  clearRemotes: () => void;
  setRoomError: (error: RoomErrorCode | null) => void;
  reset: () => void;
}

const initial = {
  roomCode: '',
  displayName: '',
  isHost: false,
  participants: [] as Participant[],
  connectionState: 'connecting' as ConnectionState,
  reconnectAttempt: 0,
  messages: [] as ChatMessage[],
  pinnedId: null as string | null,
  remoteStreams: {} as Record<string, MediaStream>,
  roomError: null as RoomErrorCode | null,
};

export const useRoomStore = create<RoomState>((set) => ({
  ...initial,

  initRoom: ({ roomCode, displayName, isHost, micOn, camOn }) =>
    set({
      ...initial,
      roomCode,
      displayName,
      isHost,
      participants: [
        { id: 'self', name: displayName, isSelf: true, isHost, micOn, camOn, handRaised: false, speaking: false, sharing: false, reaction: null },
      ],
    }),

  addParticipant: (participant) =>
    set((state) =>
      state.participants.some((p) => p.id === participant.id)
        ? state
        : { participants: [...state.participants, participant] },
    ),
  removeParticipant: (id) =>
    set((state) => {
      const { [id]: _removed, ...streams } = state.remoteStreams;
      return {
        participants: state.participants.filter((p) => p.id !== id),
        remoteStreams: streams,
        pinnedId: state.pinnedId === id ? null : state.pinnedId,
      };
    }),
  updateParticipant: (id, patch) =>
    set((state) => {
      const target = state.participants.find((p) => p.id === id);
      if (!target) return state;
      const changed = (Object.keys(patch) as (keyof Participant)[]).some((key) => target[key] !== patch[key]);
      if (!changed) return state;
      return { participants: state.participants.map((p) => (p.id === id ? { ...p, ...patch } : p)) };
    }),

  addMessage: (message) => set((state) => ({ messages: [...state.messages, message].slice(-MAX_CHAT_HISTORY) })),
  setConnectionState: (connectionState, reconnectAttempt = 0) => set({ connectionState, reconnectAttempt }),
  togglePin: (id) => set((state) => ({ pinnedId: state.pinnedId === id ? null : id })),
  setRemoteStream: (id, stream) => set((state) => ({ remoteStreams: { ...state.remoteStreams, [id]: stream } })),

  setSelfHost: (value) =>
    set((state) => ({
      isHost: value,
      participants: state.participants.map((p) => (p.isSelf ? { ...p, isHost: value } : p)),
    })),
  applyHost: (hostId) =>
    set((state) => ({
      isHost: hostId === 'self',
      participants: state.participants.map((p) => ({ ...p, isHost: p.id === hostId })),
    })),
  clearRemotes: () =>
    set((state) => ({
      participants: state.participants.filter((p) => p.isSelf),
      remoteStreams: {},
      pinnedId: null,
    })),
  setRoomError: (roomError) => set({ roomError }),
  reset: () => set({ ...initial }),
}));
