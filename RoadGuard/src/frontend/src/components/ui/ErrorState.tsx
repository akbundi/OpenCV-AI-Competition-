import React from 'react';
import { cn } from '../../lib/utils';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export interface ErrorStateProps {
  title?: string;
  reason?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'UNABLE TO COMPLETE OPERATION',
  reason = 'An unexpected system error occurred while processing the agent request.',
  onRetry,
  className,
}) => {
  return (
    <div
      className={cn(
        'rounded-none bg-surface p-8 border border-sev-high/40 flex flex-col items-center justify-center text-center',
        className
      )}
    >
      <div className="w-12 h-12 rounded-none bg-sev-high/10 border border-sev-high/30 flex items-center justify-center text-sev-high mb-4">
        <AlertTriangle className="w-6 h-6 stroke-[1.75]" />
      </div>

      <h4 className="font-mono text-xs uppercase tracking-wider text-sev-high mb-2 font-bold">
        {title}
      </h4>

      <p className="text-xs text-muted max-w-md leading-relaxed mb-6 font-mono">
        {reason}
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 rounded-none text-xs font-mono font-semibold uppercase tracking-wider border border-border-strong bg-surface hover:bg-surface-alt text-text flex items-center gap-2 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 stroke-[2]" />
          RETRY OPERATION
        </button>
      )}
    </div>
  );
};
