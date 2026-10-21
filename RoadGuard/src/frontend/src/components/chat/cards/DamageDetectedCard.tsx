import React from 'react';
import { Link } from 'react-router-dom';
import type { DamageClass, Severity } from '../../../types/inspection';
import { DamageClassChip } from '../../ui/DamageClassChip';
import { SeverityBadge } from '../../ui/SeverityBadge';
import { Target, MapPin, Eye, ExternalLink, FileText } from 'lucide-react';
import { cn } from '../../../lib/utils';

export interface DamageDetectedCardProps {
  damageClass: DamageClass;
  confidence: number;
  persistenceFrames?: number;
  totalFrames?: number;
  roadPosition?: string;
  severity: Severity;
  inspectionId: string;
  reportId?: string;
  className?: string;
}

export const DamageDetectedCard: React.FC<DamageDetectedCardProps> = ({
  damageClass,
  confidence,
  persistenceFrames = 7,
  totalFrames = 7,
  roadPosition = 'Route 405 Northbound — Mile 24.8, Lane 2',
  severity,
  inspectionId,
  reportId = 'REP-0001',
  className,
}) => {
  const effectiveId = inspectionId || 'RG-0001';
  const effectiveReportId = reportId || (effectiveId === 'RG-0001' ? 'REP-0001' : `REP-${effectiveId}`);

  return (
    <div
      className={cn(
        'rounded-none bg-surface border border-border p-5 flex flex-col gap-4 text-left max-w-xl',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-sev-high stroke-[1.75]" />
          <h4 className="font-mono text-xs uppercase tracking-wider text-text font-bold">
            Damage Detected
          </h4>
        </div>
        <SeverityBadge severity={severity} size="sm" showIcon />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="p-2.5 rounded-none bg-surface-alt border border-border flex flex-col gap-1">
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted font-medium">
            Damage Class
          </span>
          <DamageClassChip damageClass={damageClass} size="sm" active />
        </div>

        <div className="p-2.5 rounded-none bg-surface-alt border border-border flex flex-col gap-1">
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted font-medium">
            Confidence
          </span>
          <span className="font-mono text-sm font-bold text-text">
            {confidence}%
          </span>
        </div>

        <div className="p-2.5 rounded-none bg-surface-alt border border-border flex flex-col gap-1 col-span-2 sm:col-span-1">
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted font-medium">
            Persistence
          </span>
          <span className="font-mono text-sm font-bold text-text">
            {persistenceFrames} / {totalFrames} frames
          </span>
        </div>
      </div>

      {/* Road Position */}
      <div className="flex items-center gap-2 text-xs font-mono text-muted bg-surface-alt p-2.5 border border-border">
        <MapPin className="w-3.5 h-3.5 text-muted shrink-0" />
        <span className="truncate text-text font-medium">{roadPosition}</span>
      </div>

      {/* Action Buttons with Deep Links */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border font-mono text-xs uppercase tracking-wider">
        <Link
          to={`/live/${effectiveId}#evidence`}
          className="px-3 py-1.5 rounded-none border border-border bg-surface hover:bg-surface-alt text-text flex items-center gap-1.5 transition-colors"
        >
          <Eye className="w-3.5 h-3.5 text-muted" />
          <span>View Evidence</span>
        </Link>

        <Link
          to={`/live/${effectiveId}`}
          className="px-3 py-1.5 rounded-none border border-border bg-surface hover:bg-surface-alt text-text flex items-center gap-1.5 transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5 text-muted" />
          <span>View Live Inspection</span>
        </Link>

        <Link
          to={`/reports/${effectiveReportId}`}
          className="px-3 py-1.5 rounded-none bg-text text-bg border border-border-strong font-bold flex items-center gap-1.5 hover:opacity-90 transition-opacity"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>View Report</span>
        </Link>
      </div>
    </div>
  );
};

export default DamageDetectedCard;
