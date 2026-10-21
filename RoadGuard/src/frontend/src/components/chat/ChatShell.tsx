import React, { useState, useEffect } from 'react';
import type { WorkflowStage } from '../../types/agent';
import { useChat } from '../../hooks/useChat';
import { CompactWorkflowStrip } from './CompactWorkflowStrip';
import { ChatMessageList } from './ChatMessageList';
import { QuickActions } from './QuickActions';
import { ChatInput } from './ChatInput';
import { EmptyState } from '../ui/EmptyState';
import { MessageSquare, RotateCcw } from 'lucide-react';
import { cn } from '../../lib/utils';
import { getAgentState } from '../../services/api';

export interface ChatShellProps {
  inspectionId: string | null;
  onAttachClick?: () => void;
  className?: string;
}

const STARTER_PROMPTS = [
  'Is there a pothole?',
  'What damage is visible?',
  'How severe is it?',
  'Show me the evidence.',
];

export const ChatShell: React.FC<ChatShellProps> = ({
  inspectionId,
  onAttachClick,
  className,
}) => {
  const effectiveId = inspectionId || 'RG-0001';
  const { messages, isSending, sendMessage, handleApprove, handleReject, clearChat } =
    useChat(effectiveId);

  const [currentStage, setCurrentStage] = useState<WorkflowStage>('RECHECK');
  const [hasBackendData, setHasBackendData] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    getAgentState(effectiveId)
      .then((state) => {
        if (mounted) {
          if (state?.currentStage) {
            setCurrentStage(state.currentStage);
          }
          setHasBackendData(true);
        }
      })
      .catch(() => {
        if (mounted) {
          setHasBackendData(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [effectiveId]);

  return (
    <div
      className={cn(
        'rounded-none bg-surface border border-border flex flex-col h-full min-h-[560px] overflow-hidden',
        className
      )}
    >
      {/* 1. Shell Header */}
      <div className="px-4 py-3 border-b border-border bg-surface-alt flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-xs uppercase tracking-wider text-text font-bold">
            ROADGUARD AGENT
          </span>
          <span className="hidden sm:inline font-mono text-[10px] text-muted uppercase tracking-wider">
            // COPILOT #{effectiveId}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-mono text-[10px] text-muted">
            <span className="w-2 h-2 rounded-none bg-sev-low animate-pulse" />
            <span className="text-text font-medium">Agent Online</span>
          </div>

          {messages.length > 0 && (
            <button
              type="button"
              onClick={clearChat}
              title="Reset conversation"
              className="p-1 hover:bg-surface text-muted hover:text-text rounded-none transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Inline Workflow Strip */}
      <CompactWorkflowStrip currentStage={currentStage} />

      {/* 3. Main Body: Messages or Empty State */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {!hasBackendData ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 text-center">
            <EmptyState
              icon={MessageSquare}
              title="Awaiting backend data"
              description="No active inspection or demo telemetry available. Upload imagery or connect backend to begin."
              className="border-none bg-transparent p-0 mb-6"
            />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 text-center">
            <EmptyState
              icon={MessageSquare}
              title="No active inspection."
              description="Upload a road image or video to begin."
              className="border-none bg-transparent p-0 mb-6"
            />
            <div className="flex flex-wrap items-center justify-center gap-2 max-w-md">
              {STARTER_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => sendMessage(prompt)}
                  className="px-3 py-1.5 rounded-none border border-border bg-surface-alt hover:bg-surface text-xs font-mono text-muted hover:text-text hover:border-border-strong tracking-wide transition-colors cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <ChatMessageList
            messages={messages}
            isSending={isSending}
            onApprove={handleApprove}
            onReject={handleReject}
            onRetry={() => {
              const lastUser = [...messages].reverse().find((m) => m.role === 'user');
              if (lastUser?.text) {
                sendMessage(lastUser.text);
              } else {
                sendMessage('Show me the evidence.');
              }
            }}
          />
        )}
      </div>

      {/* 4. Footer: Quick Actions + Input */}
      <div className="shrink-0">
        <QuickActions
          onSelectAction={(prompt) => sendMessage(prompt)}
          disabled={isSending}
        />
        <ChatInput
          onSend={(text) => sendMessage(text)}
          onAttachClick={onAttachClick}
          disabled={isSending}
        />
      </div>
    </div>
  );
};

export default ChatShell;
