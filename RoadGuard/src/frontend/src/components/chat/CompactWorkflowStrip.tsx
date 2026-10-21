import React from 'react';
import type { WorkflowStage } from '../../types/agent';
import { cn } from '../../lib/utils';

export interface CompactWorkflowStripProps {
  currentStage?: WorkflowStage;
  className?: string;
}

const STAGES: { stage: WorkflowStage; label: string }[] = [
  { stage: 'OBSERVE', label: 'OBSERVE' },
  { stage: 'VERIFY', label: 'DETECT' },
  { stage: 'VERIFY', label: 'VERIFY' },
  { stage: 'RECHECK', label: 'RE-INSPECT' },
  { stage: 'ASSESS', label: 'ASSESS' },
  { stage: 'REPORT', label: 'REPORT' },
  { stage: 'HUMAN_REVIEW', label: 'HUMAN REVIEW' },
];

const STAGE_ORDER: WorkflowStage[] = [
  'OBSERVE',
  'VERIFY',
  'RECHECK',
  'ASSESS',
  'REPORT',
  'HUMAN_REVIEW',
];

export const CompactWorkflowStrip: React.FC<CompactWorkflowStripProps> = ({
  currentStage = 'RECHECK',
  className,
}) => {
  const currentIdx = STAGE_ORDER.indexOf(currentStage);

  return (
    <div
      className={cn(
        'w-full bg-surface-alt border-b border-border py-2 px-3 flex items-center gap-1.5 overflow-x-auto scrollbar-none font-mono text-[10px] uppercase select-none',
        className
      )}
    >
      {STAGES.map((item, idx) => {
        // Approximate stage progression based on STAGE_ORDER index
        const mappedIdx = item.label === 'DETECT' ? 0.5 : STAGE_ORDER.indexOf(item.stage);
        const isCompleted = mappedIdx < currentIdx;
        const isRunning = mappedIdx === currentIdx || (item.stage === currentStage && mappedIdx >= currentIdx - 0.5 && mappedIdx <= currentIdx + 0.5);
        const isLast = idx === STAGES.length - 1;

        return (
          <React.Fragment key={`${item.label}-${idx}`}>
            <span
              className={cn(
                'inline-flex items-center gap-1 shrink-0 font-medium tracking-wider',
                isCompleted && 'text-sev-low font-semibold',
                isRunning && 'text-text font-bold',
                !isCompleted && !isRunning && 'text-muted'
              )}
            >
              {isCompleted ? (
                <span className="text-sev-low">✓</span>
              ) : isRunning ? (
                <span className="text-accent animate-pulse font-bold">●</span>
              ) : (
                <span className="text-muted">○</span>
              )}
              <span>{item.label}</span>
            </span>

            {!isLast && (
              <span className="text-muted/60 text-[9px] shrink-0 font-normal">→</span>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default CompactWorkflowStrip;
