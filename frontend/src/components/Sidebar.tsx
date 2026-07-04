import React, { useEffect } from 'react';
import { getSessions, createSession, deleteSession, getHistory } from '../api/api';
import { useNexoraStore } from '../store/store';
import { Plus, MessageSquare, Trash2, Activity } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const sessionId = useNexoraStore((state) => state.sessionId);
  const setSessionId = useNexoraStore((state) => state.setSessionId);
  const sessions = useNexoraStore((state) => state.sessions);
  const setSessions = useNexoraStore((state) => state.setSessions);
  const addSession = useNexoraStore((state) => state.addSession);
  const removeSession = useNexoraStore((state) => state.removeSession);
  const setMessages = useNexoraStore((state) => state.setMessages);
  const setCurrentUI = useNexoraStore((state) => state.setCurrentUI);
  const setAgentState = useNexoraStore((state) => state.setAgentState);
  const setActions = useNexoraStore((state) => state.setActions);
  const setLoading = useNexoraStore((state) => state.setLoading);

  // Load session list on startup
  useEffect(() => {
    const loadSessions = async () => {
      try {
        const list = await getSessions();
        setSessions(list);
      } catch (err) {
        console.error('Failed to load sessions:', err);
      }
    };
    loadSessions();
  }, [setSessions]);

  const handleCreateSession = async () => {
    try {
      const newSess = await createSession();
      addSession(newSess);
      await selectSession(newSess.id);
    } catch (err) {
      console.error('Failed to create new session:', err);
    }
  };

  const selectSession = async (id: string) => {
    setLoading(true);
    setSessionId(id);
    setCurrentUI(null);
    setActions([]);
    setAgentState('waiting_for_user');
    try {
      const history = await getHistory(id);
      setMessages(history);
    } catch (err) {
      console.error('Failed to load history:', err);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSession = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Delete this session? This action is irreversible.')) return;
    try {
      await deleteSession(id);
      removeSession(id);
      if (sessionId === id) {
        setSessionId(null);
        setMessages([]);
        setCurrentUI(null);
        setActions([]);
      }
    } catch (err) {
      console.error('Failed to delete session:', err);
    }
  };

  const truncateId = (id: string) => {
    return `Session ${id.substring(0, 8)}`;
  };

  return (
    <aside className="w-[230px] h-screen bg-dark-800 border-r border-dark-400/50 flex flex-col p-5 select-none z-20">
      {/* Brand Header */}
      <div className="flex items-center gap-3 pb-6 border-b border-dark-500 mb-4">
        <div className="brand-mark">
          <svg className="w-4 h-4 text-accent-primary relative z-10" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="3" fill="currentColor"/>
            <path d="M12 2v5M12 17v5M2 12h5M17 12h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </div>
        <div className="flex flex-col">
          <span className="font-display font-bold text-base tracking-wide text-dark-100">
            NEXORA
          </span>
          <span className="text-[10px] text-dark-200 tracking-wider font-semibold uppercase">
            AI Agent OS
          </span>
        </div>
      </div>

      {/* New Analysis Button */}
      <button
        onClick={handleCreateSession}
        className="w-full flex items-center justify-center gap-2 px-3 py-2.5 mb-4 rounded-xl bg-gradient-to-r from-accent-primary to-orange-500 hover:brightness-105 active:scale-[0.98] text-dark-900 font-bold text-xs shadow-lg shadow-accent-primary/10 transition-all cursor-pointer"
      >
        <Plus size={15} />
        New analysis
      </button>

      {/* Navigation section */}
      <div className="space-y-1 mb-6">
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-dark-100 font-medium text-xs bg-gradient-to-r from-accent-primary/10 to-transparent border-l-2 border-accent-primary">
          <Activity size={14} className="text-accent-primary" />
          Dashboard
        </div>
      </div>

      {/* Recent sessions label */}
      <div className="text-[9px] tracking-widest text-dark-300 font-bold uppercase px-3 mb-2">
        RECENT ANALYSES
      </div>

      {/* Scrollable session list */}
      <div className="flex-1 overflow-y-auto space-y-1 pr-1">
        {sessions.map((s) => (
          <div
            key={s.id}
            onClick={() => selectSession(s.id)}
            className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer border transition-all group ${
              sessionId === s.id
                ? 'bg-accent-primary/10 border-accent-primary/20 text-accent-primary'
                : 'text-dark-200 hover:bg-dark-700/50 hover:text-white border-transparent'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <MessageSquare size={14} className={sessionId === s.id ? 'text-accent-primary' : 'text-dark-300'} />
              <span className="truncate">{truncateId(s.id)}</span>
            </div>
            <button
              onClick={(e) => handleDeleteSession(s.id, e)}
              className="text-dark-300 hover:text-accent-error opacity-0 group-hover:opacity-100 transition-all cursor-pointer p-0.5"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>

      {/* Model status footer */}
      <div className="mt-auto p-3.5 rounded-xl bg-gradient-to-br from-dark-600 to-dark-700 border border-dark-400/50">
        <div className="text-[10px] text-dark-200 font-bold font-mono mb-1.5 uppercase">
          MODEL STATUS
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent-secondary glow-secondary animate-pulse" />
          <span className="text-[11px] text-dark-200">
            Live · processing at 12ms
          </span>
        </div>
      </div>
    </aside>
  );
};
export default Sidebar;
