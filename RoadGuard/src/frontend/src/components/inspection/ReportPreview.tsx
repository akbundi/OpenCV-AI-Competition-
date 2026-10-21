import React from 'react';
import type { Report } from '../../types/report';
import { StatusBadge } from '../ui/StatusBadge';
import { SeverityBadge } from '../ui/SeverityBadge';
import { DamageClassChip } from '../ui/DamageClassChip';
import { cn } from '../../lib/utils';
import { FileText, MapPin, ArrowRight } from 'lucide-react';

export interface ReportPreviewProps {
  report: Report;
  onClick?: () => void;
  className?: string;
}

export const ReportPreview: React.FC<ReportPreviewProps> = ({
  report,
  onClick,
  className,
}) => {
  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={cn(
        'rounded-none bg-surface p-5 border border-border transition-colors flex flex-col justify-between group',
        onClick && 'cursor-pointer hover:border-border-strong hover:bg-surface-alt/50',
        className
      )}
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-muted group-hover:text-text transition-colors" />
          <span className="font-mono text-xs font-bold text-text tracking-wider">
            {report.id}
          </span>
          <span className="text-[10px] font-mono text-muted">
            (Insp: {report.inspectionId})
          </span>
        </div>
        <StatusBadge status={report.status} size="sm" />
      </div>

      {/* Middle Specs */}
      <div className="py-3.5 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DamageClassChip damageClass={report.damageClass} size="sm" />
            <SeverityBadge severity={report.severity} size="sm" />
          </div>
          <span className="font-mono text-xs font-bold text-text">
            {report.confidence}% conf
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-text font-mono">
          <MapPin className="w-3.5 h-3.5 text-muted shrink-0" />
          <span className="truncate">{report.roadPosition}</span>
        </div>

        <p className="text-xs text-muted font-sans line-clamp-2 leading-relaxed">
          {report.recommendation}
        </p>
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-border flex items-center justify-between font-mono text-[10px] text-muted">
        <span>{report.persistenceFrames} frames locked</span>
        {onClick && (
          <span className="flex items-center gap-1 text-text font-bold uppercase tracking-wider group-hover:translate-x-1 transition-transform">
            VIEW DOSSIER <ArrowRight className="w-3 h-3" />
          </span>
        )}
      </div>
    </div>
  );
};
