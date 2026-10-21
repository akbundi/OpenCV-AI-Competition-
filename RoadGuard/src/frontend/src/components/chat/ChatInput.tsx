import React, { useState, useRef } from 'react';
import { Send, Paperclip } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ChatInputProps {
  onSend: (message: string) => void;
  onAttachClick?: () => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  onAttachClick,
  disabled = false,
  placeholder = 'Ask RoadGuard about this inspection...',
  className,
}) => {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim() || disabled) return;
    onSend(text.trim());
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    // Auto-expand textarea
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        'p-3 border-t border-border bg-surface flex items-end gap-2',
        className
      )}
    >
      {onAttachClick && (
        <button
          type="button"
          onClick={onAttachClick}
          disabled={disabled}
          title="Upload or attach sensor footage"
          className="p-2.5 rounded-none border border-border bg-surface hover:bg-surface-alt text-muted hover:text-text transition-colors cursor-pointer shrink-0 disabled:opacity-50"
        >
          <Paperclip className="w-4 h-4 stroke-[1.75]" />
        </button>
      )}

      <textarea
        ref={textareaRef}
        rows={1}
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={placeholder}
        className="flex-1 max-h-32 min-h-[40px] py-2 px-3 bg-surface-alt border border-border rounded-none text-xs font-sans text-text placeholder:text-muted focus:outline-none focus:border-border-strong resize-none leading-relaxed disabled:opacity-50"
      />

      <button
        type="submit"
        disabled={disabled || !text.trim()}
        className="px-4 py-2.5 rounded-none bg-text text-bg border border-border-strong font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
      >
        <span>SEND</span>
        <Send className="w-3.5 h-3.5" />
      </button>
    </form>
  );
};

export default ChatInput;
