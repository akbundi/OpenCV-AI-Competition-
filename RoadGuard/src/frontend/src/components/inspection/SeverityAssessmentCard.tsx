import React from 'react';
import type { Severity } from '../../types/inspection';
import { SeverityBadge } from '../ui/SeverityBadge';
import { ConfidenceBar } from '../ui/ConfidenceBar';
import { PersistenceIndicator } from '../evidence/PersistenceIndicator';
import { cn } from '../../lib/utils';
import { AlertCircle, MapPin, Ruler, Navigation, Wrench } from 'lucide-react';

export interface SeverityAssessmentCardProps {
  damageType: string;
  confidence: number;
  severity: Severity;
  roadPosition: string;
  persistenceFrames: number;
  damageSize?: string;
  lane?: string;
  recommendation: string;
  className?: string;
}

export const SeverityAssessmentCard: React.FC<SeverityAssessmentCardProps> = ({
  damageType,
  confidence,
  severity,
  roadPosition,
  persistenceFrames,
  damageSize,
  lane,
  recommendation,
  className,
}) => {
  return (
    <div
      className={cn(
        'rounded-none bg-surface p-6 border border-border flex flex-col gap-5',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-border">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-hazard stroke-[1.75]" />
          <h3 className="font-mono text-xs uppercase tracking-wider text-text font-bold">
            Autonomous Severity Assessment
          </h3>
        </div>
        <SeverityBadge severity={severity} size="sm" showIcon />
      </div>

      {/* Main Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Damage Type & Size */}
        <div className="rounded-none bg-surface-alt border border-border p-3.5 space-y-1.5">
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted font-medium">
            Detected Anomaly
          </div>
          <div className="text-sm font-bold text-text font-mono">{damageType}</div>
          {damageSize && (
            <div className="flex items-center gap-1.5 text-xs text-muted font-mono pt-1">
              <Ruler className="w-3.5 h-3.5 text-muted" />
              <span>Aperture: {damageSize}</span>
            </div>
          )}
        </div>

        {/* Location & Lane */}
        <div className="rounded-none bg-surface-alt border border-border p-3.5 space-y-1.5">
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted font-medium">
            Road Position
          </div>
          <div className="flex items-start gap-1.5 text-xs text-text font-mono">
            <MapPin className="w-3.5 h-3.5 text-muted shrink-0 mt-0.5" />
            <span className="leading-snug">{roadPosition}</span>
          </div>
          {lane && (
            <div className="flex items-center gap-1.5 text-[11px] text-muted font-mono pt-1">
              <Navigation className="w-3 h-3 text-muted" />
              <span>{lane}</span>
            </div>
          )}
        </div>
      </div>

      {/* Metrics Row: Confidence + Persistence */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        <div className="rounded-none bg-surface-alt border border-border p-3.5">
          <ConfidenceBar confidence={confidence} size="sm" />
        </div>
        <div className="flex items-center justify-start md:justify-end">
          <PersistenceIndicator count={persistenceFrames} total={7} />
        </div>
      </div>

      {/* Maintenance Recommendation Banner */}
      <div className="rounded-none bg-surface-alt border border-border p-4 flex items-start gap-3">
        <div className="w-8 h-8 rounded-none bg-surface border border-border flex items-center justify-center text-text shrink-0 mt-0.5">
          <Wrench className="w-4 h-4 stroke-[1.75]" />
        </div>
        <div className="space-y-1">
          <div className="font-mono text-[10px] uppercase tracking-wider text-muted font-bold">
            Actionable Recommendation
          </div>
          <p className="text-xs text-text font-sans leading-relaxed">
            {recommendation}
          </p>
        </div>
      </div>
    </div>
  );
};
