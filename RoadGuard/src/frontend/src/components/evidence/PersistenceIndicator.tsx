import React from 'react';
import type { FrameEvidenceStatus } from '../../types/evidence';
import { cn } from '../../lib/utils';
import { ShieldCheck, Layers } from 'lucide-react';

export interface PersistenceIndicatorProps {
  count: number;
  total?: number;
  status?: FrameEvidenceStatus;
  showIcon?: boolean;
  className?: string;
}

export const PersistenceIndicator: React.FC<PersistenceIndicatorProps> = ({
  count,
  total = 7,
  status,
  showIcon = true,
  className,
}) => {
  const isSatisfied = count >= 5; // Multi-frame persistence gate

  return (
    <div
      className={cn(
        'inline-flex items-center gap-3 rounded-none bg-surface border border-border px-3 py-1.5 font-mono select-none',
        className
      )}
    >
      {showIcon && (
        <div className="flex items-center text-muted">
          {isSatisfied ? (
            <ShieldCheck className="w-3.5 h-3.5 text-sev-low stroke-[2]" />
          ) : (
            <Layers className="w-3.5 h-3.5 text-muted stroke-[1.75]" />
          )}
        </div>
      )}

      {/* Label and Count */}
      <div className="flex items-center gap-1.5 text-xs">
        <span className="text-[10px] uppercase tracking-wider text-muted font-medium">
          Persistence:
        </span>
        <span className="font-bold text-text tracking-tight">
          {count} / {total}
        </span>
        <span className="text-[10px] text-muted">frames</span>
      </div>

      {/* Visual Square Dot Sequence */}
      <div className="flex items-center gap-1.5 pl-1 border-l border-border">
        {Array.from({ length: total }).map((_, idx) => {
          const filled = idx < count;
          return (
            <span
              key={idx}
              title={`Frame ${idx + 1}`}
              className={cn(
                'w-2 h-2 rounded-none transition-colors',
                filled
                  ? isSatisfied
                    ? 'bg-sev-low'
                    : 'bg-hazard'
                  : 'bg-surface-alt border border-border'
              )}
            />
          );
        })}
      </div>

      {status && (
        <span
          className={cn(
            'text-[9px] uppercase px-1.5 py-0.5 rounded-none font-bold tracking-wider ml-1 font-mono border',
            status === 'CONFIRMED'
              ? 'bg-sev-low/10 text-sev-low border-sev-low/40'
              : status === 'DETECTED'
              ? 'bg-hazard/10 text-hazard border-hazard/40'
              : 'bg-surface-alt text-muted border-border'
          )}
        >
          {status}
        </span>
      )}
    </div>
  );
};
