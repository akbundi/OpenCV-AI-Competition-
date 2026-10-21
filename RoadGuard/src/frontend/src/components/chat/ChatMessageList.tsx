import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import type { ChatMessage } from '../../types/chat';
import { ChatMessageBubble } from './ChatMessageBubble';
import { cn } from '../../lib/utils';

export interface ChatMessageListProps {
  messages: ChatMessage[];
  isSending?: boolean;
  onApprove?: (note?: string) => void;
  onReject?: (reason: string) => void;
  onRetry?: () => void;
  className?: string;
}

export const ChatMessageList: React.FC<ChatMessageListProps> = ({
  messages,
  isSending = false,
  onApprove,
  onReject,
  onRetry,
  className,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, isSending]);

  return (
    <div
      className={cn(
        'flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin',
        className
      )}
    >
      {messages.map((msg) => (
        <motion.div
          key={msg.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
        >
          <ChatMessageBubble
            message={msg}
            onApprove={onApprove}
            onReject={onReject}
            onRetry={onRetry}
          />
        </motion.div>
      ))}

      {/* Typing indicator (Task 4: 3 animated dots in mono) */}
      {isSending && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
          className="flex items-center gap-2 py-2 px-3.5 rounded-none bg-surface-alt border border-border w-fit font-mono text-xs text-muted"
        >
          <span className="w-1.5 h-1.5 rounded-none bg-accent animate-pulse" />
          <span>Agent analyzing</span>
          <span className="inline-flex gap-1 font-mono font-bold tracking-widest text-text">
            <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
            <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
            <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
          </span>
        </motion.div>
      )}

      <div ref={bottomRef} />
    </div>
  );
};

export default ChatMessageList;
