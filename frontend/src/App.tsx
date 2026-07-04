import React, { useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatScreen } from './components/ChatScreen';
import { RightCanvas } from './components/RightCanvas';
import { createSession } from './api/api';
import { useNexoraStore } from './store/store';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export const App: React.FC = () => {
  const sessionId = useNexoraStore((state) => state.sessionId);
  const setSessionId = useNexoraStore((state) => state.setSessionId);
  const addSession = useNexoraStore((state) => state.addSession);
  const setLoading = useNexoraStore((state) => state.setLoading);

  // Auto-create a session on mount if none is active
  useEffect(() => {
    const initSession = async () => {
      if (sessionId) return;
      setLoading(true);
      try {
        const newSess = await createSession();
        addSession(newSess);
        setSessionId(newSess.id);
      } catch (err) {
        console.error('Failed to initialize session on mount:', err);
      } finally {
        setLoading(false);
      }
    };
    initSession();
  }, [sessionId, setSessionId, addSession, setLoading]);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex h-screen w-screen overflow-hidden bg-dark-900 font-sans text-dark-100 antialiased select-none">
        {/* Session Navigation Sidebar */}
        <Sidebar />

        {/* Chat Screen (Middle Pane) */}
        <ChatScreen />

        {/* Analysis Canvas (Right Pane) */}
        <RightCanvas />
      </div>
    </QueryClientProvider>
  );
};

export default App;
