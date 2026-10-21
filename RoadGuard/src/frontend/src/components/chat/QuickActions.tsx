import React from 'react';
import { cn } from '../../lib/utils';

export interface QuickActionsProps {
  onSelectAction: (prompt: string) => void;
  disabled?: boolean;
  className?: string;
}

const ACTIONS: { label: string; prompt: string }[] = [
  { label: 'Analyze Image', prompt: 'Analyze image for pavement distress.' },
  { label: 'Analyze Video', prompt: 'Analyze video sequence and damage persistence.' },
  { label: 'Show Evidence', prompt: 'Show me the evidence.' },
  { label: 'Explain Decision', prompt: 'Explain why the agent made this decision.' },
  { label: 'Assess Severity', prompt: 'Assess severity of the damage.' },
  { label: 'Generate Report', prompt: 'Generate official report brief.' },
];

export const QuickActions: React.FC<QuickActionsProps> = ({
  onSelectAction,
  disabled = false,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex items-center gap-1.5 overflow-x-auto py-2 px-3 border-t border-border bg-surface-alt/50 scrollbar-none select-none',
        className
      )}
    >
      <span className="font-mono text-[9px] uppercase tracking-wider text-muted shrink-0 mr-1 font-semibold">
        QUICK ACTIONS:
      </span>
      {ACTIONS.map((action) => (
        <button
          key={action.label}
          type="button"
          disabled={disabled}
          onClick={() => onSelectAction(action.prompt)}
          className="px-2.5 py-1 rounded-none border border-border bg-surface hover:bg-surface-alt text-text font-mono text-[10px] uppercase tracking-wider shrink-0 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:border-border-strong active:scale-95"
        >
          {action.label}
        </button>
      ))}
    </div>
  );
};

export default QuickActions;
