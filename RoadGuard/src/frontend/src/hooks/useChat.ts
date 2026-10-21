import { useState, useEffect, useCallback } from 'react';
import type { ChatMessage } from '../types/chat';
import { sendAgentQuery, getConversation, clearConversation, approveReport } from '../services/api';

export interface UseChatReturn {
  messages: ChatMessage[];
  isSending: boolean;
  error: string | null;
  sendMessage: (text: string) => Promise<void>;
  handleApprove: (note?: string) => Promise<void>;
  handleReject: (reason: string) => Promise<void>;
  clearChat: () => Promise<void>;
}

export function useChat(inspectionId: string | null): UseChatReturn {
  const effectiveId = inspectionId || 'RG-0001';
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load conversation on inspection change
  useEffect(() => {
    let isCurrent = true;
    getConversation(effectiveId)
      .then((history) => {
        if (isCurrent) setMessages(history);
      })
      .catch(() => {
        // Fallback silently if offline
      });

    return () => {
      isCurrent = false;
    };
  }, [effectiveId]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isSending) return;

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        kind: 'text',
        timestamp: new Date().toISOString(),
        text: text.trim(),
        inspectionId: effectiveId,
      };

      // Optimistic update
      setMessages((prev) => [...prev, userMsg]);
      setIsSending(true);
      setError(null);

      try {
        const responses = await sendAgentQuery(effectiveId, text.trim());
        setMessages((prev) => {
          // Avoid duplicate user message if returned from server
          const filtered = prev.filter((m) => m.id !== userMsg.id);
          return [...filtered, userMsg, ...responses];
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Awaiting backend data';
        setError(msg);
        // Append error card into conversation
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: 'agent',
            kind: 'error',
            timestamp: new Date().toISOString(),
            text: msg,
            inspectionId: effectiveId,
          },
        ]);
      } finally {
        setIsSending(false);
      }
    },
    [effectiveId, isSending]
  );

  const handleApprove = useCallback(
    async (note?: string) => {
      await sendMessage(note ? `approve: ${note}` : 'approve');
    },
    [sendMessage]
  );

  const handleReject = useCallback(
    async (reason: string) => {
      await sendMessage(`reject: ${reason}`);
    },
    [sendMessage]
  );

  const clearChat = useCallback(async () => {
    try {
      await clearConversation(effectiveId);
      setMessages([]);
      setError(null);
    } catch {
      setMessages([]);
    }
  }, [effectiveId]);

  return {
    messages,
    isSending,
    error,
    sendMessage,
    handleApprove,
    handleReject,
    clearChat,
  };
}

export default useChat;
