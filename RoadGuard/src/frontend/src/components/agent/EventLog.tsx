import React, { useEffect, useRef } from 'react';
import type { AgentEvent } from '../../types/agent';
import { cn } from '../../lib/utils';
import { Terminal } from 'lucide-react';

export interface EventLogProps {
  events: AgentEvent[];
  title?: string;
  maxHeight?: string;
  autoScroll?: boolean;
  className?: string;
}

const LEVEL_CONFIG: Record<
  AgentEvent['level'],
  { borderLeft: string; tag: string; dot: string }
> = {
  info: {
    borderLeft: 'border-l-2 border-accent',
    tag: 'text-text bg-surface-alt border border-border',
    dot: 'bg-accent',
  },
  action: {
    borderLeft: 'border-l-2 border-accent',
    tag: 'text-text bg-surface-alt border border-border',
    dot: 'bg-accent',
  },
  warning: {
    borderLeft: 'border-l-2 border-hazard',
    tag: 'text-hazard bg-hazard/10 border border-hazard/30',
    dot: 'bg-hazard',
  },
  success: {
    borderLeft: 'border-l-2 border-sev-low',
    tag: 'text-sev-low bg-sev-low/10 border border-sev-low/30',
    dot: 'bg-sev-low',
  },
  alert: {
    borderLeft: 'border-l-2 border-sev-high',
    tag: 'text-sev-high bg-sev-high/10 border border-sev-high/30',
    dot: 'bg-sev-high',
  },
  error: {
    borderLeft: 'border-l-2 border-sev-high',
    tag: 'text-sev-high bg-sev-high/10 border border-sev-high/30',
    dot: 'bg-sev-high',
  },
};

export const EventLog: React.FC<EventLogProps> = ({
  events,
  title = 'AGENT REASONING STREAM',
  maxHeight = 'max-h-80',
  autoScroll = true,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [events.length, autoScroll]);

  return (
    <div
      className={cn(
        'rounded-none bg-surface overflow-hidden flex flex-col border border-border',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface-alt">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-muted stroke-[1.75]" />
          <span className="font-mono text-[10px] uppercase tracking-wider text-text font-bold">
            {title}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-none bg-sev-low" />
          <span className="font-mono text-[10px] text-muted uppercase tracking-wider">
            {events.length} EVENTS
          </span>
        </div>
      </div>

      {/* Feed list */}
      <div
        ref={containerRef}
        className={cn(
          'divide-y divide-border overflow-y-auto font-mono text-xs select-text',
          maxHeight
        )}
      >
        {events.length === 0 ? (
          <div className="py-8 text-center text-muted italic font-mono text-[11px]">
            Awaiting autonomous reasoning stream events...
          </div>
        ) : (
          events.map((evt) => {
            const levelStyle = LEVEL_CONFIG[evt.level] || LEVEL_CONFIG.info;

            return (
              <div
                key={evt.id}
                className={cn(
                  'flex items-start gap-2.5 px-3.5 py-2.5 transition-colors leading-relaxed hover:bg-surface-alt/50',
                  levelStyle.borderLeft
                )}
              >
                {/* Level Dot */}
                <div className="pt-1.5 shrink-0">
                  <span className={cn('w-1.5 h-1.5 rounded-none block', levelStyle.dot)} />
                </div>

                {/* Timestamp */}
                <span className="text-muted select-none shrink-0 text-[10px] font-mono tracking-wider pt-0.5">
                  [{evt.timestamp}]
                </span>

                {/* Stage Tag */}
                {evt.stage && (
                  <span
                    className={cn(
                      'text-[9px] uppercase px-1.5 py-0.5 rounded-none font-mono tracking-wider shrink-0 font-medium',
                      levelStyle.tag
                    )}
                  >
                    {evt.stage}
                  </span>
                )}

                {/* Message */}
                <div className="flex-1 text-[11px] font-sans break-words text-text">
                  {evt.message}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};
