import React from 'react';
import { motion } from 'framer-motion';
import { Bot, User } from 'lucide-react';
import type { Message } from '../types/types';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';

  // Format timestamp safely
  const formatTime = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  // If this message starts with system event headers, we can hide it or render it differently
  // Since system events are implicit turns, they are passed as chat messages but we don't want to display raw JSON systems to the user.
  if (message.content.startsWith('[SYSTEM EVENT:')) {
    return null; // Skip rendering raw system event loops to the user
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      whileHover={{ y: -1 }}
      className={`flex items-start gap-3.5 w-full max-w-[80%] ${
        isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
      }`}
    >
      <div className={`flex h-9 w-9 shrink-0 select-none items-center justify-center rounded-full border text-xs font-semibold shadow-md transition-all relative ${
        isUser
          ? 'bg-accent-primary/10 border-accent-primary/20 text-accent-primary'
          : 'bg-dark-700 border-dark-500 text-accent-primary'
      }`}>
        {!isUser && <span className="avatar-ring" />}
        {isUser ? <User size={15} /> : <Bot size={15} />}
      </div>

      <div className="flex flex-col gap-1.5 w-full">
        <div className={`px-4.5 py-3 rounded-2xl text-[13.5px] leading-[1.55] tracking-wide border transition-all ${
          isUser
            ? 'bg-gradient-to-br from-[#2a2340] to-[#241a30] border-[#3a2f52] text-white rounded-tr-sm shadow-md'
            : 'bg-dark-700 border-dark-500 text-dark-100 rounded-tl-sm glass hover:bg-dark-750'
        }`}>
          {message.content}
        </div>
        {message.timestamp && (
          <span className={`text-[10px] text-dark-300 font-medium font-mono px-1.5 ${isUser ? 'text-right' : 'text-left'}`}>
            {formatTime(message.timestamp)}
          </span>
        )}
      </div>
    </motion.div>
  );
};
export default MessageBubble;
