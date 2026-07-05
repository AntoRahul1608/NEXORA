import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Message, UIComponent, UIAction, AgentState, SessionInfo } from '../types/types';

interface NexoraStore {
  sessionId: string | null;
  setSessionId: (id: string | null) => void;

  sessions: SessionInfo[];
  setSessions: (sessions: SessionInfo[]) => void;
  addSession: (session: SessionInfo) => void;
  removeSession: (id: string) => void;

  messages: Message[];
  addMessage: (msg: Message) => void;
  setMessages: (msgs: Message[]) => void;
  clearMessages: () => void;

  currentUI: UIComponent | null;
  setCurrentUI: (ui: UIComponent | null) => void;

  agentState: AgentState;
  setAgentState: (state: AgentState) => void;

  isLoading: boolean;
  setLoading: (loading: boolean) => void;

  actions: UIAction[];
  setActions: (actions: UIAction[]) => void;
}

export const useNexoraStore = create<NexoraStore>()(
  persist(
    (set) => ({
      sessionId: null,
      setSessionId: (id) => set({ sessionId: id }),

      sessions: [],
      setSessions: (sessions) => set({ sessions }),
      addSession: (session) => set((s) => ({ sessions: [session, ...s.sessions] })),
      removeSession: (id) => set((s) => ({ sessions: s.sessions.filter((x) => x.id !== id) })),

      messages: [],
      addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
      setMessages: (msgs) => set({ messages: msgs }),
      clearMessages: () => set({ messages: [], currentUI: null, actions: [] }),

      currentUI: null,
      setCurrentUI: (ui) => set({ currentUI: ui }),

      agentState: 'waiting_for_user',
      setAgentState: (state) => set({ agentState: state }),

      isLoading: false,
      setLoading: (loading) => set({ isLoading: loading }),

      actions: [],
      setActions: (actions) => set({ actions }),
    }),
    {
      name: 'nexora-session',
      // Only persist the session ID and sessions list — not messages/UI/loading state
      partialize: (state) => ({
        sessionId: state.sessionId,
        sessions: state.sessions,
      }),
    }
  )
);
