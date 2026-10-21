import React from 'react';
import type { Severity } from '../../../types/inspection';
import { SeverityBadge } from '../../ui/SeverityBadge';
import { ConfidenceBar } from '../../ui/ConfidenceBar';
import { AlertCircle, MapPin, Wrench } from 'lucide-react';
import { cn } from '../../../lib/utils';

export interface SeverityAssessmentCardProps {
  damageType?: string;
  confidence?: number;
  severity?: Severity;
  roadPosition?: string;
  persistenceFrames?: number;
  totalFrames?: number;
  recommendation?: string;
  className?: string;
}

export const SeverityAssessmentCard: React.FC<SeverityAssessmentCardProps> = ({
  damageType = 'Class D40 — Structural Pothole',
  confidence = 91,
  severity = 'HIGH',
  roadPosition = 'Route 405 Northbound — Mile 24.8, Lane 2',
  persistenceFrames = 7,
  totalFrames = 7,
  recommendation = 'Full-depth asphalt patching and structural base stabilization.',
  className,
}) => {
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
          <AlertCircle className="w-4 h-4 text-hazard stroke-[1.75]" />
          <h4 className="font-mono text-xs uppercase tracking-wider text-text font-bold">
            Severity Assessment
          </h4>
        </div>
        <SeverityBadge severity={severity} size="sm" showIcon />
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-2 gap-3 font-mono">
        <div className="p-2.5 rounded-none bg-surface-alt border border-border flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-wider text-muted font-medium">
            DAMAGE TYPE
          </span>
          <span className="text-xs font-bold text-text truncate">{damageType}</span>
        </div>

        <div className="p-2.5 rounded-none bg-surface-alt border border-border flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-wider text-muted font-medium">
            PERSISTENCE
          </span>
          <span className="text-xs font-bold text-text">
            {persistenceFrames} / {totalFrames} frames
          </span>
        </div>
      </div>

      {/* Confidence Bar */}
      <div className="space-y-1.5">
        <ConfidenceBar confidence={confidence} size="sm" />
      </div>

      {/* Road Position */}
      <div className="flex items-center gap-2 text-xs font-mono text-muted bg-surface-alt p-2.5 border border-border">
        <MapPin className="w-3.5 h-3.5 text-muted shrink-0" />
        <span className="truncate text-text font-medium">{roadPosition}</span>
      </div>

      {/* Recommendation */}
      <div className="p-3 rounded-none bg-surface-alt border border-border flex flex-col gap-1">
        <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-muted font-medium">
          <Wrench className="w-3 h-3 text-muted" />
          <span>REPAIR RECOMMENDATION</span>
        </div>
        <p className="font-mono text-xs text-text leading-relaxed">
          {recommendation}
        </p>
      </div>
    </div>
  );
};

export default SeverityAssessmentCard;
