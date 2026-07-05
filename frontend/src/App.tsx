import React, { useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatScreen } from './components/ChatScreen';
import { useNexoraStore } from './store/store';
import { getHistory } from './api/api';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export const App: React.FC = () => {
  const sessionId = useNexoraStore((state) => state.sessionId);
  const setMessages = useNexoraStore((state) => state.setMessages);
  const setLoading = useNexoraStore((state) => state.setLoading);

  // On mount, if we already have a persisted sessionId, restore its chat history
  useEffect(() => {
    if (!sessionId) return;
    const restoreHistory = async () => {
      setLoading(true);
      try {
        const history = await getHistory(sessionId);
        setMessages(history);
      } catch (err) {
        // Session may have expired on the backend — clear it gracefully
        console.warn('Could not restore session history, it may have expired:', err);
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };
    restoreHistory();
    // Only run once on mount (sessionId from localStorage is set before this runs)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex h-screen w-screen bg-[#08090f] p-4 gap-4 font-sans text-dark-100 antialiased select-none overflow-hidden">
        {/* Fixed Session Navigation Sidebar */}
        <div className="h-full rounded-2xl overflow-hidden border border-dark-600 bg-dark-800 shadow-2xl flex-shrink-0 flex">
          <Sidebar />
        </div>

        {/* Chat Screen — fills remaining width, rounded corners */}
        <div className="flex-1 h-full rounded-2xl overflow-hidden border border-dark-600 bg-dark-900 shadow-2xl relative flex flex-col min-w-0">
          <ChatScreen />
        </div>
      </div>
    </QueryClientProvider>
  );
};

export default App;
