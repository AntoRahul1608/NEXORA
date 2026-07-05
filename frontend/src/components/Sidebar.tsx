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

  // Sync session list from server on startup
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

  const truncateId = (id: string) => `Session ${id.substring(0, 8)}`;

  return (
    <aside className="w-[260px] h-full flex-shrink-0 bg-dark-800 border-r border-dark-400/50 flex flex-col select-none z-20 overflow-hidden">
      {/* Inner padding wrapper */}
      <div className="flex flex-col h-full px-4 py-5 gap-0">

        {/* ── Brand Header ── */}
        <div className="flex items-center gap-3 pb-5 border-b border-dark-500 mb-4 flex-shrink-0">
          <div className="brand-mark !w-10 !h-10 !rounded-xl">
            <svg className="w-5 h-5 text-accent-primary relative z-10" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="3" fill="currentColor"/>
              <path d="M12 2v5M12 17v5M2 12h5M17 12h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="font-display font-bold text-lg tracking-wide text-dark-100 leading-none">
              NEXORA
            </span>
            <span className="text-[10px] text-dark-300 tracking-widest font-semibold uppercase">
              AI Agent OS
            </span>
          </div>
        </div>

        {/* ── New Analysis Button ── */}
        <button
          onClick={handleCreateSession}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 mb-4 rounded-xl bg-gradient-to-r from-accent-primary to-orange-500 hover:brightness-110 active:scale-[0.97] text-dark-900 font-bold text-sm shadow-lg shadow-accent-primary/20 transition-all cursor-pointer flex-shrink-0"
        >
          <Plus size={17} />
          New analysis
        </button>

        {/* ── Dashboard Nav ── */}
        <div className="mb-4 flex-shrink-0">
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-dark-100 font-medium text-sm bg-gradient-to-r from-accent-primary/10 to-transparent border-l-2 border-accent-primary">
            <Activity size={16} className="text-accent-primary" />
            Dashboard
          </div>
        </div>

        {/* ── Recent Sessions label ── */}
        <div className="text-[10px] tracking-widest text-dark-400 font-bold uppercase px-1 mb-2 flex-shrink-0">
          Recent Analyses
        </div>

        {/* ── Scrollable session list ── */}
        <div className="flex-1 overflow-y-auto min-h-0 space-y-1 pr-1 -mr-1">
          {sessions.length === 0 && (
            <p className="text-xs text-dark-400 px-2 py-3 text-center leading-relaxed">
              No sessions yet.<br />Click "New analysis" to start.
            </p>
          )}
          {sessions.map((s) => (
            <div
              key={s.id}
              onClick={() => selectSession(s.id)}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold cursor-pointer border transition-all group ${
                sessionId === s.id
                  ? 'bg-accent-primary/10 border-accent-primary/20 text-accent-primary'
                  : 'text-dark-200 hover:bg-dark-700/60 hover:text-white border-transparent hover:border-dark-500/40'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate min-w-0">
                <MessageSquare
                  size={15}
                  className={`flex-shrink-0 ${sessionId === s.id ? 'text-accent-primary' : 'text-dark-400'}`}
                />
                <span className="truncate text-[13px]">{truncateId(s.id)}</span>
              </div>
              <button
                onClick={(e) => handleDeleteSession(s.id, e)}
                className="text-dark-400 hover:text-accent-error opacity-0 group-hover:opacity-100 transition-all cursor-pointer p-1 flex-shrink-0 rounded-lg hover:bg-accent-error/10"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>

        {/* ── Model Status Footer ── */}
        <div className="mt-4 p-3.5 rounded-xl bg-gradient-to-br from-dark-700 to-dark-800 border border-dark-500/60 flex-shrink-0">
          <div className="text-[10px] text-dark-300 font-bold font-mono mb-1.5 uppercase tracking-widest">
            Model Status
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent-secondary glow-secondary animate-pulse flex-shrink-0" />
            <span className="text-xs text-dark-200">Live · processing at 12ms</span>
          </div>
        </div>

      </div>
    </aside>
  );
};

export default Sidebar;
