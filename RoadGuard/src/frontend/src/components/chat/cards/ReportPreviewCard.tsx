import React from 'react';
import { Link } from 'react-router-dom';
import type { Report } from '../../../types/report';
import { StatusBadge } from '../../ui/StatusBadge';
import { SeverityBadge } from '../../ui/SeverityBadge';
import { DamageClassChip } from '../../ui/DamageClassChip';
import { FileText, CheckCircle2, XCircle, ExternalLink } from 'lucide-react';
import { cn } from '../../../lib/utils';

export interface ReportPreviewCardProps {
  report: Report;
  inspectionId?: string;
  onApprove?: (note?: string) => void;
  onReject?: (reason: string) => void;
  className?: string;
}

export const ReportPreviewCard: React.FC<ReportPreviewCardProps> = ({
  report,
  inspectionId,
  onApprove,
  onReject,
  className,
}) => {
  const effectiveInspId = inspectionId || report.inspectionId || 'RG-0001';
  const effectiveReportId = report.id || (effectiveInspId === 'RG-0001' ? 'REP-0001' : `REP-${effectiveInspId}`);
  const isPending = report.status === 'PENDING';

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
          <FileText className="w-4 h-4 text-accent stroke-[1.75]" />
          <h4 className="font-mono text-xs uppercase tracking-wider text-text font-bold">
            Municipal Report Brief
          </h4>
        </div>
        <StatusBadge status={report.status} size="sm" />
      </div>

      {/* Report Info */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-2.5 rounded-none bg-surface-alt border border-border flex flex-col gap-1">
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted font-medium">
            DISTRESS & SEVERITY
          </span>
          <div className="flex items-center gap-2 pt-0.5">
            <DamageClassChip damageClass={report.damageClass} size="sm" />
            <SeverityBadge severity={report.severity} size="sm" />
          </div>
        </div>

        <div className="p-2.5 rounded-none bg-surface-alt border border-border flex flex-col gap-1">
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted font-medium">
            CONFIDENCE
          </span>
          <span className="font-mono text-sm font-bold text-text">
            {report.confidence}%
          </span>
        </div>
      </div>

      {/* Engineering Recommendation */}
      <div className="p-3 rounded-none bg-surface-alt border border-border space-y-1">
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted font-medium block">
          ENGINEERING RECOMMENDATION
        </span>
        <p className="text-xs text-text font-mono leading-relaxed">
          {report.recommendation || 'Full-depth asphalt patching and structural base stabilization.'}
        </p>
      </div>

      {/* Approval Actions (if pending) */}
      {isPending && (
        <div className="flex items-center gap-2.5 pt-2 border-t border-border">
          <button
            type="button"
            onClick={() => onApprove?.('Approved via RoadGuard AI Assistant')}
            className="flex-1 px-4 py-2 rounded-none bg-text text-bg border border-border-strong font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>APPROVE REPORT</span>
          </button>

          <button
            type="button"
            onClick={() => onReject?.('Rejection requested via assistant interface')}
            className="px-4 py-2 rounded-none bg-surface hover:bg-surface-alt text-text border border-border font-mono text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <XCircle className="w-3.5 h-3.5 text-sev-high" />
            <span>REJECT</span>
          </button>
        </div>
      )}

      {/* Deep Link Navigation */}
      <div className="flex items-center justify-between pt-2 border-t border-border font-mono text-xs uppercase tracking-wider">
        <Link
          to={`/reports/${effectiveReportId}`}
          className="inline-flex items-center gap-1 text-text hover:text-accent font-semibold transition-colors"
        >
          <span>View Full Report →</span>
        </Link>

        <Link
          to={`/live/${effectiveInspId}`}
          className="inline-flex items-center gap-1 text-muted hover:text-text transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>View Inspection</span>
        </Link>
      </div>
    </div>
  );
};

export default ReportPreviewCard;
