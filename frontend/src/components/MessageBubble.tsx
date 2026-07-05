import React from 'react';
import { motion } from 'framer-motion';
import { Bot, User, Sparkles } from 'lucide-react';
import type { Message } from '../types/types';
import { DynamicUI } from '../renderer/DynamicRenderer';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';

  const formatTime = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  if (message.content.startsWith('[SYSTEM EVENT:')) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
      className={`flex gap-3 w-full ${isUser ? 'justify-end flex-row-reverse' : 'justify-start flex-row'}`}
      style={{ alignItems: 'flex-start' }}
    >
      {/* Avatar */}
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border text-xs font-semibold shadow-md relative mt-0.5 ${
          isUser
            ? 'bg-accent-primary/15 border-accent-primary/25 text-accent-primary'
            : 'bg-dark-700 border-dark-500 text-accent-primary'
        }`}
      >
        {!isUser && <span className="avatar-ring" />}
        {isUser ? <User size={14} /> : <Bot size={14} />}
      </div>

      {/* Content */}
      <div className={`flex flex-col gap-2 ${isUser ? 'items-end max-w-[72%]' : 'items-start w-full max-w-[86%]'}`}>
        {/* Sender label */}
        <span className="text-[11px] font-semibold text-dark-300 px-1 tracking-wide">
          {isUser ? 'You' : (
            <span className="flex items-center gap-1 text-accent-primary/80">
              <Sparkles size={10} />
              NEXORA
            </span>
          )}
        </span>

        {/* Text bubble */}
        {message.content && (
          <div
            className={`px-4 py-3 rounded-2xl text-sm leading-relaxed border transition-all shadow-lg ${
              isUser
                ? 'bg-gradient-to-br from-[#261b3f] to-[#1e1530] border-[#3d2e5c] text-white rounded-tr-sm'
                : 'bg-dark-800 border-dark-500 text-dark-100 rounded-tl-sm hover:border-dark-400 transition-colors'
            }`}
          >
            {message.content}
          </div>
        )}

        {/* Dynamic UI Card — rendered inline in the chat */}
        {!isUser && message.ui && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.15, ease: [0.23, 1, 0.32, 1] }}
            className="w-full"
          >
            <div className="relative">
              {/* Subtle header strip */}
              <div className="flex items-center gap-2 mb-2 px-1">
                <span className="h-1.5 w-1.5 rounded-full bg-accent-secondary animate-pulse" />
                <span className="text-[10px] font-bold tracking-widest text-dark-300 uppercase font-mono">
                  Interactive UI
                </span>
              </div>
              <div className="rounded-2xl border border-dark-500 bg-dark-800/60 backdrop-blur-sm overflow-hidden shadow-xl ring-1 ring-white/[0.04]">
                <div className="p-4">
                  <DynamicUI schema={message.ui} />
                </div>
              </div>
            </div>
          </motion.div>
        )}



        {/* Timestamp */}
        {message.timestamp && (
          <span className={`text-[10px] text-dark-400 font-mono px-1 ${isUser ? 'text-right' : 'text-left'}`}>
            {formatTime(message.timestamp)}
          </span>
        )}
      </div>
    </motion.div>
  );
};

export default MessageBubble;
