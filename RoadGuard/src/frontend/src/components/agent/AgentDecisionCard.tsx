import React from 'react';
import type { AgentState } from '../../types/agent';
import { cn } from '../../lib/utils';
import { StatusBadge } from '../ui/StatusBadge';
import { ConfidenceBar } from '../ui/ConfidenceBar';
import { Bot, Cpu, Sparkles } from 'lucide-react';

export interface AgentDecisionCardProps {
  state: AgentState;
  confidence?: number;
  className?: string;
}

export const AgentDecisionCard: React.FC<AgentDecisionCardProps> = ({
  state,
  confidence,
  className,
}) => {
  // Find latest reasoning event
  const latestEvent = state.events.length > 0 ? state.events[state.events.length - 1] : null;

  return (
    <div
      className={cn(
        'rounded-none bg-surface p-6 border border-border relative overflow-hidden',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-none bg-surface-alt border border-border flex items-center justify-center text-text">
            <Bot className="w-4 h-4 stroke-[1.75]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs uppercase tracking-wider text-text font-bold">
                Agent Decision Matrix
              </span>
              <span className="text-[10px] font-mono text-muted">
                #{state.inspectionId}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-muted font-mono">
              <Cpu className="w-3 h-3 text-muted" />
              <span>ARM NEON Pipeline</span>
            </div>
          </div>
        </div>

        <StatusBadge status={state.status} size="sm" />
      </div>

      {/* Main details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Current Stage */}
        <div className="rounded-none bg-surface-alt border border-border p-3">
          <div className="font-mono text-[10px] uppercase tracking-wider text-muted mb-1 font-medium">
            Current Stage
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-none bg-sev-low" />
            <span className="font-mono text-sm font-bold text-text tracking-wide">
              {state.currentStage}
            </span>
          </div>
        </div>

        {/* Confidence metric */}
        {confidence !== undefined && (
          <div className="rounded-none bg-surface-alt border border-border p-3 flex flex-col justify-center">
            <ConfidenceBar confidence={confidence} size="sm" />
          </div>
        )}
      </div>

      {/* Latest Agent Reasoning Quote */}
      <div className="rounded-none bg-surface-alt border border-border p-3.5 relative">
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted uppercase tracking-wider mb-1.5 font-medium">
          <Sparkles className="w-3 h-3 text-accent" />
          <span>Latest Autonomous Reasoning</span>
        </div>

        {latestEvent ? (
          <div className="space-y-1">
            <p className="text-xs text-text font-sans leading-relaxed">
              "{latestEvent.message}"
            </p>
            <div className="flex items-center gap-2 pt-1 font-mono text-[9px] text-muted">
              <span>Timestamp: {latestEvent.timestamp}</span>
              <span>•</span>
              <span className="uppercase">Level: {latestEvent.level}</span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-muted italic font-mono">
            Awaiting agent evaluation step...
          </p>
        )}
      </div>
    </div>
  );
};
