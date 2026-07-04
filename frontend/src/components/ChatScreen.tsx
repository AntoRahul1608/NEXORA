import React, { useRef, useEffect, useState } from 'react';
import { sendMessage } from '../api/api';
import { useNexoraStore } from '../store/store';
import { MessageBubble } from './MessageBubble';
import { SendHorizontal, Loader2, Sparkles, Paperclip } from 'lucide-react';

export const ChatScreen: React.FC = () => {
  const sessionId = useNexoraStore((state) => state.sessionId);
  const messages = useNexoraStore((state) => state.messages);
  const addMessage = useNexoraStore((state) => state.addMessage);
  const currentUI = useNexoraStore((state) => state.currentUI);
  const setCurrentUI = useNexoraStore((state) => state.setCurrentUI);
  const agentState = useNexoraStore((state) => state.agentState);
  const setAgentState = useNexoraStore((state) => state.setAgentState);
  const actions = useNexoraStore((state) => state.actions);
  const setActions = useNexoraStore((state) => state.setActions);
  const isLoading = useNexoraStore((state) => state.isLoading);
  const setLoading = useNexoraStore((state) => state.setLoading);

  // After
const [input, setInput] = useState('');
const messagesEndRef = useRef<HTMLDivElement>(null);
const textareaRef = useRef<HTMLTextAreaElement>(null);

// Auto-scroll to bottom of messages
useEffect(() => {
  messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
}, [messages, currentUI, isLoading]);

// Auto-resize the textarea as the user types, capped at ~7 lines
useEffect(() => {
  const el = textareaRef.current;
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
}, [input]);

const handleSend = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!input.trim() || !sessionId || isLoading) return;

  const userMessage = input.trim();
  setInput('');
  if (textareaRef.current) textareaRef.current.style.height = 'auto';
  setLoading(true);

    // Save user message immediately in store
    const now = new Date().toISOString();
    addMessage({
      role: 'user',
      content: userMessage,
      timestamp: now,
    });

    try {
      const response = await sendMessage(sessionId, userMessage);

      // Add assistant response to store
      addMessage({
        role: 'assistant',
        content: response.response,
        timestamp: new Date().toISOString(),
        ui: response.ui as any,
        actions: response.actions as any,
      });

      // Update UI and state machine
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

  const getAgentStateBadge = () => {
    const states = {
      collecting_information: { label: 'Collecting Info', style: 'bg-accent-primary/20 text-accent-primary border-accent-primary/30' },
      waiting_for_user: { label: 'Waiting for User', style: 'bg-accent-warning/20 text-accent-warning border-accent-warning/30' },
      processing: { label: 'Processing', style: 'bg-accent-tertiary/20 text-accent-tertiary border-accent-tertiary/30 animate-pulse' },
      completed: { label: 'Completed', style: 'bg-accent-success/20 text-accent-success border-accent-success/30' },
      failed: { label: 'Failed', style: 'bg-accent-error/20 text-accent-error border-accent-error/30' },
      cancelled: { label: 'Cancelled', style: 'bg-dark-600 text-dark-300 border-dark-500' },
    };

    const current = states[agentState] || states.waiting_for_user;
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${current.style}`}>
        {current.label}
      </span>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-dark-900 text-white relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="glow-blur-primary -top-20 -left-20" />
      <div className="glow-blur-secondary -bottom-40 -right-20" />

      {/* Top Navigation Bar */}
      <header className="h-[73px] border-b border-dark-400 bg-dark-900/40 glass flex items-center justify-between px-8 z-10 shadow-lg shadow-dark-900/20 scan-line relative overflow-hidden">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold tracking-wide text-dark-100 flex items-center gap-2 font-display">
            <span className="h-2 w-2 rounded-full bg-accent-primary glow-primary animate-pulse" />
            NEXORA Runtime
          </span>
          {sessionId && getAgentStateBadge()}
        </div>
        <div className="flex items-center gap-2">
          {isLoading && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.04] text-xs text-accent-secondary font-mono">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Thinking...</span>
            </div>
          )}
        </div>
      </header>

      {/* Messages / UI display panel */}
      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6 flex flex-col bg-grid relative z-1">
        {messages.length === 0 ? (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center max-w-2xl mx-auto py-12">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-accent-primary/10 to-accent-secondary/10 border border-white/[0.08] shadow-2xl glow-primary">
              <Sparkles className="h-10 w-10 text-accent-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight gradient-text font-display">
                What would you like to analyze?
              </h2>
              <p className="text-sm text-dark-200 max-w-md mx-auto leading-relaxed">
                I am NEXORA — drop a dataset and I'll profile it, surface patterns, and flag what actually matters in seconds.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mt-4 max-w-xl">
              <div 
                className="p-4 rounded-xl bg-dark-800/30 border border-dark-600 hover:border-accent-primary/40 hover:bg-dark-850 cursor-pointer transition-all text-left flex flex-col gap-2 group"
                onClick={() => setInput('Book a flight from London to Mumbai')}
              >
                <span className="text-lg">✈️</span>
                <h4 className="text-sm font-semibold text-white group-hover:text-accent-primary transition-colors">Flight Booking</h4>
                <p className="text-xs text-dark-300">Generate a step-by-step search and reservation workflow.</p>
              </div>

              <div 
                className="p-4 rounded-xl bg-dark-800/30 border border-dark-600 hover:border-accent-primary/40 hover:bg-dark-850 cursor-pointer transition-all text-left flex flex-col gap-2 group"
                onClick={() => setInput('Show me a sales dashboard for Q3')}
              >
                <span className="text-lg">📊</span>
                <h4 className="text-sm font-semibold text-white group-hover:text-accent-primary transition-colors">Dashboard Analytics</h4>
                <p className="text-xs text-dark-300">Generate rich Recharts visualisations from sales datasets.</p>
              </div>

              <div 
                className="p-4 rounded-xl bg-dark-800/30 border border-dark-600 hover:border-accent-primary/40 hover:bg-dark-850 cursor-pointer transition-all text-left flex flex-col gap-2 group"
                onClick={() => setInput('Create a feedback form for a workshop')}
              >
                <span className="text-lg">📝</span>
                <h4 className="text-sm font-semibold text-white group-hover:text-accent-primary transition-colors">Feedback Forms</h4>
                <p className="text-xs text-dark-300">Design custom forms with real-time feedback processing.</p>
              </div>
            </div>
          </div>
        ) : (
          /* Conversation History */
          messages.map((msg, idx) => (
            <MessageBubble key={msg.id || idx} message={msg} />
          ))
        )}

        {/* Inline Actions list */}
        {sessionId && actions.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
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
                className="px-4 py-2 text-xs font-semibold rounded-full border border-accent-primary/30 bg-accent-primary/5 text-accent-primary hover:bg-accent-primary/10 transition-all cursor-pointer shadow-md hover:scale-[1.02] active:scale-[0.98]"
              >
                {act.label}
              </button>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message input bar */}
      // After
<footer className="px-6 pb-8 pt-2 bg-dark-900/60 relative z-1">
  <form
    onSubmit={handleSend}
    className={`max-w-3xl mx-auto flex items-end gap-2 p-3 rounded-[28px] bg-dark-800 border transition-all shadow-2xl shadow-black/30 ${
      sessionId
        ? 'border-dark-600 focus-within:border-accent-primary/60 focus-within:ring-2 focus-within:ring-accent-primary/20'
        : 'border-dark-700 opacity-60'
    }`}
  >
    <button
      type="button"
      disabled={!sessionId || isLoading}
      title="Attach a file"
      className="shrink-0 h-11 w-11 flex items-center justify-center rounded-full text-dark-300 hover:text-white hover:bg-dark-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
    >
      <Paperclip size={19} />
    </button>

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
          ? 'Ask NEXORA anything about your data...'
          : 'Select a conversation in the sidebar or create a new one to begin'
      }
      disabled={!sessionId || isLoading}
      className="flex-1 resize-none max-h-[200px] bg-transparent text-white placeholder-dark-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed text-base leading-relaxed py-3 px-1"
    />

    <button
      type="submit"
      disabled={!sessionId || !input.trim() || isLoading}
      className="shrink-0 h-11 w-11 flex items-center justify-center rounded-full bg-gradient-to-r from-accent-primary to-orange-500 text-dark-900 font-bold hover:brightness-105 hover:shadow-lg hover:shadow-accent-primary/20 active:scale-[0.96] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none cursor-pointer"
    >
      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <SendHorizontal size={19} />
      )}
    </button>
  </form>
  <p className="text-center text-[11px] text-dark-300 mt-2.5 tracking-wide">
    NEXORA can make mistakes. Verify important information before acting on it.
  </p>
</footer>
    </div>
  );
};
export default ChatScreen;
