import React, { useRef, useEffect, useState } from 'react';
import { sendMessage } from '../api/api';
import { useNexoraStore } from '../store/store';
import { MessageBubble } from './MessageBubble';
import {
  SendHorizontal,
  Loader2,
  Sparkles,
  Paperclip,
  Zap,
  BarChart3,
  FileText,
  Bot,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const QUICK_PROMPTS = [
  {
    icon: '✈️',
    label: 'Flight Booking',
    desc: 'Step-by-step search & reservation workflow',
    prompt: 'Book a flight from London to Mumbai',
    color: 'from-blue-500/10 to-cyan-500/5 border-blue-500/20 hover:border-blue-400/40',
  },
  {
    icon: '📊',
    label: 'Dashboard Analytics',
    desc: 'Rich Recharts visualisations from sales data',
    prompt: 'Show me a sales dashboard for Q3',
    color: 'from-accent-primary/10 to-orange-400/5 border-accent-primary/20 hover:border-accent-primary/40',
  },
  {
    icon: '📝',
    label: 'Feedback Forms',
    desc: 'Custom forms with real-time processing',
    prompt: 'Create a feedback form for a workshop',
    color: 'from-accent-tertiary/10 to-purple-500/5 border-accent-tertiary/20 hover:border-accent-tertiary/40',
  },
  {
    icon: '🤖',
    label: 'Data Profiling',
    desc: 'Surface patterns and flag anomalies instantly',
    prompt: 'Profile my dataset and show key stats',
    color: 'from-accent-secondary/10 to-green-400/5 border-accent-secondary/20 hover:border-accent-secondary/40',
  },
];

// Max width for messages AND input bar (they must match perfectly)
const CONTENT_MAX_W = 'max-w-3xl';

export const ChatScreen: React.FC = () => {
  const sessionId = useNexoraStore((state) => state.sessionId);
  const messages = useNexoraStore((state) => state.messages);
  const addMessage = useNexoraStore((state) => state.addMessage);
  const setCurrentUI = useNexoraStore((state) => state.setCurrentUI);
  const agentState = useNexoraStore((state) => state.agentState);
  const setAgentState = useNexoraStore((state) => state.setAgentState);
  const actions = useNexoraStore((state) => state.actions);
  const setActions = useNexoraStore((state) => state.setActions);
  const isLoading = useNexoraStore((state) => state.isLoading);
  const setLoading = useNexoraStore((state) => state.setLoading);

  const [input, setInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom whenever messages or loading state changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Auto-resize textarea, capped at 180px
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  }, [input]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !sessionId || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setLoading(true);

    addMessage({ role: 'user', content: userMessage, timestamp: new Date().toISOString() });

    try {
      const response = await sendMessage(sessionId, userMessage);
      addMessage({
        role: 'assistant',
        content: response.response,
        timestamp: new Date().toISOString(),
        ui: response.ui as any,
        actions: response.actions as any,
      });
      setCurrentUI(response.ui as any);
      setAgentState(response.state);
      setActions(response.actions as any);
    } catch (error) {
      console.error('Failed to send message:', error);
      addMessage({
        role: 'assistant',
        content: 'I encountered an error trying to process your request. Please try again.',
        timestamp: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !sessionId) return;
    
    setIsUploading(true);
    try {
      // Use the actual API call
      const { uploadFile } = await import('../api/api');
      const result = await uploadFile(sessionId, file);
      
      // Tell the bot the file was uploaded
      const response = await sendMessage(sessionId, `I have attached a file: ${result.filename}`);
      addMessage({
        role: 'assistant',
        content: response.response,
        timestamp: new Date().toISOString(),
        ui: response.ui as any,
        actions: response.actions as any,
      });
      setCurrentUI(response.ui as any);
      setAgentState(response.state);
      setActions(response.actions as any);
    } catch (error) {
      console.error('File upload failed:', error);
      addMessage({
        role: 'assistant',
        content: `Error uploading file: ${error instanceof Error ? error.message : String(error)}`,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const getAgentStateBadge = () => {
    const states: Record<string, { label: string; style: string }> = {
      collecting_information: { label: 'Collecting Info', style: 'bg-accent-primary/20 text-accent-primary border-accent-primary/30' },
      waiting_for_user: { label: 'Ready', style: 'bg-accent-secondary/20 text-accent-secondary border-accent-secondary/30' },
      processing: { label: 'Processing', style: 'bg-accent-tertiary/20 text-accent-tertiary border-accent-tertiary/30 animate-pulse' },
      completed: { label: 'Completed', style: 'bg-accent-success/20 text-accent-success border-accent-success/30' },
      failed: { label: 'Failed', style: 'bg-accent-error/20 text-accent-error border-accent-error/30' },
      cancelled: { label: 'Cancelled', style: 'bg-dark-600 text-dark-300 border-dark-500' },
    };
    const current = states[agentState] || states.waiting_for_user;
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${current.style}`}>
        {current.label}
      </span>
    );
  };

  const hasMessages = messages.length > 0;

  const renderInputForm = () => (
    <>
      <form
        onSubmit={handleSend}
        className={`flex items-end gap-2.5 p-2.5 rounded-[22px] transition-all duration-200 shadow-2xl shadow-black/40 ${
          sessionId
            ? 'bg-dark-800 border border-dark-500 focus-within:border-accent-primary/50 focus-within:ring-2 focus-within:ring-accent-primary/15'
            : 'bg-dark-800/50 border border-dark-600 opacity-60 pointer-events-none'
        }`}
      >
        {/* Attach button */}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
          disabled={!sessionId || isLoading || isUploading}
        />
        <button
          type="button"
          disabled={!sessionId || isLoading || isUploading}
          onClick={() => fileInputRef.current?.click()}
          title="Attach a file"
          className="shrink-0 h-10 w-10 flex items-center justify-center rounded-xl text-dark-300 hover:text-white hover:bg-dark-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          {isUploading ? <Loader2 size={17} className="animate-spin" /> : <Paperclip size={17} />}
        </button>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend(e);
            }
          }}
          placeholder={
            sessionId
              ? 'Ask NEXORA anything — generate charts, forms, dashboards...'
              : 'Select or create a conversation to begin'
          }
          disabled={!sessionId || isLoading}
          className="chat-textarea flex-1 resize-none max-h-[180px] rounded-2xl bg-[#10111a] border border-[#262a36] text-white placeholder-dark-400 focus:outline-none focus:border-accent-primary/70 focus:ring-2 focus:ring-accent-primary/20 disabled:opacity-50 disabled:cursor-not-allowed text-sm leading-relaxed py-3 px-4"
        />

        {/* Send button */}
        <button
          type="submit"
          disabled={!sessionId || !input.trim() || isLoading}
          className="shrink-0 h-10 w-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-accent-primary to-orange-500 text-dark-900 font-bold hover:brightness-110 hover:shadow-lg hover:shadow-accent-primary/25 active:scale-[0.94] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          {isLoading
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : <SendHorizontal size={17} />
          }
        </button>
      </form>

      <p className="text-center text-[10px] text-dark-500 mt-2 tracking-wide">
        NEXORA can make mistakes. Verify important information before acting on it.
      </p>
    </>
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-dark-900 text-white relative overflow-hidden min-w-0">
      {/* Ambient background glows */}
      <div className="glow-blur-primary -top-32 -left-20 opacity-50 pointer-events-none" />
      <div className="glow-blur-secondary -bottom-40 right-10 opacity-40 pointer-events-none" />
      <div
        className="absolute top-1/3 right-1/4 w-[300px] h-[300px] rounded-full pointer-events-none"
        style={{ background: 'rgba(139, 123, 255, 0.04)', filter: 'blur(100px)' }}
      />

      {/* ── Top Navigation Bar ── */}
      <header className="h-[60px] border-b border-dark-400/60 bg-dark-900/70 backdrop-blur-xl flex items-center justify-between px-6 z-20 shadow-sm relative overflow-hidden flex-shrink-0 scan-line">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-xl bg-gradient-to-br from-accent-primary to-orange-600 flex items-center justify-center shadow-lg shadow-accent-primary/20">
              <Bot size={14} className="text-dark-900" />
            </div>
            <span className="text-sm font-bold tracking-wide text-white font-display">
              NEXORA Runtime
            </span>
          </div>
          {sessionId && (
            <div className="flex items-center gap-1.5">
              <span className="text-dark-500 select-none">·</span>
              {getAgentStateBadge()}
            </div>
          )}
        </div>

        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-tertiary/10 border border-accent-tertiary/25 text-[11px] text-accent-tertiary font-mono"
            >
              <div className="flex gap-0.5">
                <span className="w-1 h-1 rounded-full bg-accent-tertiary typing-dot" />
                <span className="w-1 h-1 rounded-full bg-accent-tertiary typing-dot" />
                <span className="w-1 h-1 rounded-full bg-accent-tertiary typing-dot" />
              </div>
              <span>Thinking</span>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── Scrollable Messages Area ── */}
      <div className="flex-1 overflow-y-auto relative z-10 bg-grid">
        <AnimatePresence mode="wait">
          {!hasMessages ? (
            /* ── Empty State ── */
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center justify-center min-h-full py-16 px-6"
            >
              <div className={`w-full ${CONTENT_MAX_W} mx-auto flex flex-col items-center gap-8`}>
                {/* Hero Icon */}
                <motion.div
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 18 }}
                  className="relative"
                >
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-accent-primary/20 to-accent-tertiary/10 border border-white/[0.08] shadow-2xl">
                    <Sparkles className="h-12 w-12 text-accent-primary" />
                  </div>
                  <div className="absolute -inset-4 rounded-3xl bg-accent-primary/8 blur-2xl -z-10" />
                </motion.div>

                {/* Heading */}
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.18 }}
                  className="text-center space-y-3"
                >
                  <h1 className="text-4xl md:text-[2.75rem] font-extrabold tracking-tight gradient-text font-display leading-tight">
                    What would you like to analyze?
                  </h1>
                  <p className="text-sm text-dark-200 max-w-md mx-auto leading-relaxed">
                    I am NEXORA — describe what you need and I'll generate interactive UI, charts, forms, and insights right here in the chat.
                  </p>
                </motion.div>

                {/* Quick Prompt Cards */}
                <motion.div
                  initial={{ y: 14, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.28 }}
                  className="grid grid-cols-2 gap-3 w-full"
                >
                  {QUICK_PROMPTS.map((p, i) => (
                    <motion.button
                      key={p.label}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.32 + i * 0.07 }}
                      onClick={() => setInput(p.prompt)}
                      className={`p-4 rounded-2xl bg-gradient-to-br border cursor-pointer transition-all text-left group hover:scale-[1.02] active:scale-[0.98] shadow-md ${p.color}`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl leading-none flex-shrink-0">{p.icon}</span>
                        <div className="flex flex-col gap-1 min-w-0">
                          <h3 className="text-sm font-bold text-white group-hover:text-white/90 transition-colors truncate">
                            {p.label}
                          </h3>
                          <p className="text-xs text-dark-300 leading-relaxed">{p.desc}</p>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </motion.div>

                {/* Centered Input Form */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="w-full mt-4"
                >
                  {renderInputForm()}
                </motion.div>

                {/* Feature hints */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.55 }}
                  className="flex items-center gap-6 text-dark-400 text-xs"
                >
                  <span className="flex items-center gap-1.5"><Zap size={12} className="text-accent-primary" /> Dynamic UI</span>
                  <span className="flex items-center gap-1.5"><BarChart3 size={12} className="text-accent-secondary" /> Live Charts</span>
                  <span className="flex items-center gap-1.5"><FileText size={12} className="text-accent-tertiary" /> Smart Forms</span>
                </motion.div>
              </div>
            </motion.div>
          ) : (
            /* ── Conversation ── */
            <div key="messages" className="flex flex-col items-center w-full pb-4 pt-8">
              <div className={`${CONTENT_MAX_W} w-full px-5 space-y-5`}>
                {messages.map((msg, idx) => (
                  <MessageBubble key={msg.id || idx} message={msg} />
                ))}

                {/* Typing indicator */}
                <AnimatePresence>
                  {isLoading && (
                    <motion.div
                      key="typing"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.25 }}
                      className="flex items-start gap-3"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border bg-dark-700 border-dark-500 text-accent-primary relative mt-0.5">
                        <span className="avatar-ring" />
                        <Bot size={14} />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[11px] font-semibold text-accent-primary/80 px-1 flex items-center gap-1">
                          <Sparkles size={10} /> NEXORA
                        </span>
                        <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-dark-800 border border-dark-500 inline-flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent-primary/70 typing-dot" />
                          <span className="w-1.5 h-1.5 rounded-full bg-accent-primary/70 typing-dot" />
                          <span className="w-1.5 h-1.5 rounded-full bg-accent-primary/70 typing-dot" />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Session action pills */}
                {sessionId && actions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-wrap gap-2 pl-11"
                  >
                    {actions.map((act) => (
                      <button
                        key={act.id}
                        onClick={async () => {
                          if (isLoading) return;
                          setLoading(true);
                          try {
                            const response = await sendMessage(sessionId, `Execute action: ${act.label}`);
                            addMessage({
                              role: 'assistant',
                              content: response.response,
                              ui: response.ui as any,
                              actions: response.actions as any,
                              timestamp: new Date().toISOString(),
                            });
                            setCurrentUI(response.ui as any);
                            setAgentState(response.state);
                            setActions(response.actions as any);
                          } catch (err) {
                            console.error(err);
                          } finally {
                            setLoading(false);
                          }
                        }}
                        className="px-3.5 py-1.5 text-[11px] font-semibold rounded-full border border-accent-primary/30 bg-accent-primary/8 text-accent-primary hover:bg-accent-primary/15 hover:border-accent-primary/50 transition-all cursor-pointer hover:scale-[1.03] active:scale-[0.97]"
                      >
                        {act.label}
                      </button>
                    ))}
                  </motion.div>
                )}

                <div ref={messagesEndRef} className="h-2" />
              </div>
            </div>
          )}

        </AnimatePresence>

        {/* Anchor for empty state scroll */}
        {!hasMessages && <div ref={messagesEndRef} />}
      </div>

      {/* ── Input Bar — aligned to bottom when chat is active ── */}
      {hasMessages && (
        <footer className="mt-auto flex-shrink-0 bg-gradient-to-t from-dark-900 via-dark-900/90 to-transparent px-5 pb-5 pt-3 relative z-20 flex flex-col items-center w-full">
          <div className={`${CONTENT_MAX_W} w-full`}>
            {renderInputForm()}
          </div>
        </footer>
      )}
    </div>
  );
};

export default ChatScreen;
