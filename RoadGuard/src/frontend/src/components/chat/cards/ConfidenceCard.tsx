import React from 'react';
import { ConfidenceBar } from '../../ui/ConfidenceBar';
import { Gauge, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { cn } from '../../../lib/utils';

export interface ConfidenceCardProps {
  confidence: number;
  status?: 'POSSIBLE' | 'CONFIRMED' | string;
  threshold?: number;
  inspectionId?: string;
  className?: string;
}

export function getConfidenceStateLabel(confidence: number): {
  label: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERIFIED';
  badgeStyle: string;
} {
  if (confidence >= 90) {
    return {
      label: 'VERIFIED',
      badgeStyle: 'text-emerald-600 dark:text-emerald-400 border-emerald-500/40 bg-emerald-500/10 font-bold',
    };
  }
  if (confidence >= 75) {
    return {
      label: 'HIGH',
      badgeStyle: 'text-sev-low border-sev-low/40 bg-sev-low/10 font-semibold',
    };
  }
  if (confidence >= 50) {
    return {
      label: 'MEDIUM',
      badgeStyle: 'text-hazard border-hazard/40 bg-hazard/10 font-semibold',
    };
  }
  return {
    label: 'LOW',
    badgeStyle: 'text-muted border-border bg-surface-alt font-medium',
  };
}

export const ConfidenceCard: React.FC<ConfidenceCardProps> = ({
  confidence,
  status = 'CONFIRMED',
  threshold = 75,
  className,
}) => {
  const stateInfo = getConfidenceStateLabel(confidence);

  // Distinguish visually between POSSIBLE detection (before verification)
  // and CONFIRMED detection. Possible detections must NEVER use the word "Confirmed".
  const isPossible = status === 'POSSIBLE' || confidence < threshold;

  return (
    <div
      className={cn(
        'rounded-none bg-surface border border-border p-5 flex flex-col gap-4 text-left max-w-lg',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Gauge className="w-4 h-4 text-accent stroke-[1.75]" />
          <h4 className="font-mono text-xs uppercase tracking-wider text-text font-bold">
            Confidence Metric
          </h4>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted font-medium">
          GATEWAY: {threshold}%
        </span>
      </div>

      {/* Confidence Bar with State Label directly next to the bar */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <ConfidenceBar confidence={confidence} threshold={threshold} size="md" />
          </div>
          {/* State label next to the bar */}
          <span
            className={cn(
              'font-mono text-xs uppercase tracking-wider px-2 py-0.5 rounded-none border shrink-0',
              stateInfo.badgeStyle
            )}
          >
            {stateInfo.label}
          </span>
        </div>
        <div className="flex items-center justify-between font-mono text-[10px] text-muted">
          <span>MIN GATE: {threshold}%</span>
          <span>SCORE: {confidence}%</span>
        </div>
      </div>

      {/* Detection State Badge (POSSIBLE vs CONFIRMED) */}
      <div className="p-2.5 rounded-none bg-surface-alt border border-border flex items-center justify-between font-mono text-xs">
        <span className="text-muted text-[10px] uppercase tracking-wider">
          DISTRESS STATUS
        </span>
        {isPossible ? (
          <span className="inline-flex items-center gap-1.5 text-hazard font-semibold uppercase text-[11px]">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>POSSIBLE ANOMALY</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-sev-low font-bold uppercase text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>CONFIRMED DISTRESS</span>
          </span>
        )}
      </div>
    </div>
  );
};

export default ConfidenceCard;
