import React from 'react';
import { cn } from '../../lib/utils';

export interface ConfidenceBarProps {
  confidence: number; // 0 to 100
  threshold?: number; // default 75
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const HEIGHT_STYLES = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-3.5',
};

export const ConfidenceBar: React.FC<ConfidenceBarProps> = ({
  confidence,
  threshold = 75,
  showLabel = true,
  size = 'md',
  className,
}) => {
  const clamped = Math.max(0, Math.min(100, Math.round(confidence)));
  const isAboveThreshold = clamped >= threshold;

  return (
    <div className={cn('w-full flex flex-col gap-1.5', className)}>
      {showLabel && (
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-1.5 text-muted">
            <span className="text-[11px] uppercase tracking-wider">Confidence</span>
            <span className="text-[10px] text-muted">(Gate: {threshold}%)</span>
          </div>
          <div className="flex items-center gap-1">
            <span
              className={cn(
                'font-bold tracking-tight',
                isAboveThreshold ? 'text-sev-low' : 'text-hazard'
              )}
            >
              {clamped}%
            </span>
          </div>
        </div>
      )}

      {/* Progress track */}
      <div
        className={cn(
          'w-full bg-surface-alt border border-border rounded-none overflow-hidden relative',
          HEIGHT_STYLES[size]
        )}
      >
        {/* 75% Threshold indicator line */}
        <div
          className="absolute top-0 bottom-0 w-[1px] bg-border-strong z-10 pointer-events-none"
          style={{ left: `${threshold}%` }}
          title={`Autonomous Gate: ${threshold}%`}
        />

        {/* Fill */}
        <div
          className={cn(
            'h-full rounded-none transition-all duration-500 ease-out relative',
            isAboveThreshold ? 'bg-sev-low' : 'bg-accent'
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};
