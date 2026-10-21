import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { cn } from '../../../lib/utils';

export interface ErrorCardProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorCard: React.FC<ErrorCardProps> = ({
  message = 'Awaiting backend data. Pipeline connection could not be established.',
  onRetry,
  className,
}) => {
  return (
    <div
      className={cn(
        'rounded-none bg-surface border border-sev-high/40 p-4 flex flex-col gap-3 text-left max-w-lg',
        className
      )}
    >
      <div className="flex items-center gap-2 text-sev-high">
        <AlertTriangle className="w-4 h-4 shrink-0 stroke-[2]" />
        <h4 className="font-mono text-xs uppercase tracking-wider font-bold">
          Agent Execution Alert
        </h4>
      </div>

      <p className="font-mono text-xs text-text leading-relaxed">
        {message}
      </p>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="self-start px-3 py-1.5 rounded-none border border-border-strong bg-surface hover:bg-surface-alt text-text font-mono text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Try Again</span>
        </button>
      )}
    </div>
  );
};

export default ErrorCard;
