import React from 'react';
import { cn } from '../../lib/utils';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export interface MetricCardProps {
  label: string;
  value: string | number;
  delta?: {
    value: string | number;
    positive?: boolean;
    neutral?: boolean;
  };
  icon?: React.ComponentType<{ className?: string }>;
  description?: string;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  delta,
  icon: Icon,
  description,
  className,
}) => {
  return (
    <div
      className={cn(
        'rounded-none bg-surface border border-border p-5 flex flex-col justify-between transition-colors',
        className
      )}
    >
      {/* Header with label + icon */}
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono text-[11px] uppercase tracking-wider text-muted font-medium">
          {label}
        </span>
        {Icon && (
          <div className="text-muted">
            <Icon className="w-4 h-4 stroke-[1.75]" />
          </div>
        )}
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-2 mb-1">
        <div className="font-mono text-2xl font-bold tracking-tight text-text">
          {value}
        </div>
      </div>

      {/* Delta and description footer */}
      {(delta || description) && (
        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border">
          {delta && (
            <span
              className={cn(
                'inline-flex items-center gap-0.5 font-mono text-[11px] font-semibold rounded-none px-1.5 py-0.5 border',
                delta.neutral
                  ? 'text-muted bg-surface-alt border-border'
                  : delta.positive
                  ? 'text-sev-low bg-sev-low/10 border-sev-low/40'
                  : 'text-sev-high bg-sev-high/10 border-sev-high/40'
              )}
            >
              {delta.neutral ? (
                <Minus className="w-3 h-3" />
              ) : delta.positive ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : (
                <ArrowDownRight className="w-3 h-3" />
              )}
              {delta.value}
            </span>
          )}
          {description && (
            <span className="text-[11px] text-muted line-clamp-1">{description}</span>
          )}
        </div>
      )}
    </div>
  );
};
