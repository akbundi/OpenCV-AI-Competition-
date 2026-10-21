import React, { useState } from 'react';
import type { Severity, DamageClass } from '../../types/inspection';
import type { ReportStatus } from '../../types/report';
import { SeverityBadge } from '../ui/SeverityBadge';
import { DamageClassChip } from '../ui/DamageClassChip';
import { cn } from '../../lib/utils';
import {
  UserCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  X,
} from 'lucide-react';

export interface ApprovalCardProps {
  inspectionId: string;
  severity: Severity;
  damageClass: DamageClass;
  confidence: number;
  roadPosition: string;
  recommendation: string;
  status: ReportStatus | 'WAITING_FOR_APPROVAL';
  reviewerNote?: string;
  rejectedReason?: string;
  onApprove?: (note?: string) => void;
  onReject?: (reason: string) => void;
  className?: string;
}

export const ApprovalCard: React.FC<ApprovalCardProps> = ({
  inspectionId,
  severity,
  damageClass,
  confidence,
  roadPosition,
  recommendation,
  status,
  reviewerNote,
  rejectedReason,
  onApprove,
  onReject,
  className,
}) => {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReasonInput, setRejectReasonInput] = useState('');
  const [approveNoteInput, setApproveNoteInput] = useState('');
  const [showApproveNote, setShowApproveNote] = useState(false);

  const isPending = status === 'WAITING_FOR_APPROVAL' || status === 'PENDING';
  const isApproved = status === 'APPROVED';
  const isRejected = status === 'REJECTED';

  const handleConfirmReject = () => {
    if (rejectReasonInput.trim().length >= 10 && onReject) {
      onReject(rejectReasonInput.trim());
      setShowRejectModal(false);
      setRejectReasonInput('');
    }
  };

  const handleConfirmApprove = () => {
    if (onApprove) {
      onApprove(approveNoteInput.trim() || undefined);
      setShowApproveNote(false);
      setApproveNoteInput('');
    }
  };

  return (
    <div
      className={cn(
        'rounded-none bg-surface border p-6 flex flex-col gap-5 relative overflow-hidden',
        isPending
          ? 'border-hazard/40 bg-surface'
          : isApproved
          ? 'border-sev-low/40 bg-surface'
          : 'border-sev-high/40 bg-surface',
        className
      )}
    >
      {/* Banner */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          {isPending ? (
            <div className="w-8 h-8 rounded-none bg-hazard/10 border border-hazard/30 flex items-center justify-center text-hazard">
              <ShieldAlert className="w-4 h-4 stroke-[2]" />
            </div>
          ) : isApproved ? (
            <div className="w-8 h-8 rounded-none bg-sev-low/10 border border-sev-low/30 flex items-center justify-center text-sev-low">
              <CheckCircle2 className="w-4 h-4 stroke-[2]" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-none bg-sev-high/10 border border-sev-high/30 flex items-center justify-center text-sev-high">
              <XCircle className="w-4 h-4 stroke-[2]" />
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-mono text-xs uppercase tracking-wider text-text font-bold">
                {isPending
                  ? 'HUMAN REVIEW REQUIRED'
                  : isApproved
                  ? 'WORK ORDER AUTHORIZED'
                  : 'REPORT OVERTURNED / REJECTED'}
              </h3>
            </div>
            <span className="text-[10px] font-mono text-muted">
              Inspection Dossier: #{inspectionId}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <DamageClassChip damageClass={damageClass} size="sm" />
          <SeverityBadge severity={severity} size="sm" showIcon />
        </div>
      </div>

      {/* Safety Policy Notice for HIGH severity */}
      {severity === 'HIGH' && isPending && (
        <div className="rounded-none bg-hazard/10 border border-hazard/30 p-3 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-hazard shrink-0 mt-0.5" />
          <p className="text-xs text-text font-sans leading-relaxed">
            <span className="font-bold text-hazard">SAFETY POLICY GATE:</span> HIGH severity detections cannot be auto-dispatched by autonomous agents. Explicit human engineering authorization is mandatory.
          </p>
        </div>
      )}

      {/* Summary details */}
      <div className="space-y-2 text-xs font-mono">
        <div className="flex items-center justify-between text-text">
          <span className="text-muted uppercase tracking-wider text-[10px] font-medium">Location:</span>
          <span>{roadPosition}</span>
        </div>
        <div className="flex items-center justify-between text-text">
          <span className="text-muted uppercase tracking-wider text-[10px] font-medium">Confidence:</span>
          <span className={confidence >= 75 ? 'text-sev-low font-bold' : 'text-hazard font-bold'}>
            {confidence}%
          </span>
        </div>
        <div className="pt-2 border-t border-border">
          <span className="text-muted uppercase tracking-wider text-[10px] font-medium block mb-1">
            Recommendation:
          </span>
          <p className="text-text font-sans text-xs leading-relaxed">
            {recommendation}
          </p>
        </div>
      </div>

      {/* Audit feedback if already approved or rejected */}
      {isApproved && reviewerNote && (
        <div className="rounded-none bg-sev-low/10 border border-sev-low/30 p-3 text-xs font-sans text-text">
          <span className="font-mono text-[10px] uppercase tracking-wider block text-sev-low font-bold mb-1">
            Reviewer Note:
          </span>
          "{reviewerNote}"
        </div>
      )}

      {isRejected && rejectedReason && (
        <div className="rounded-none bg-sev-high/10 border border-sev-high/30 p-3 text-xs font-sans text-text">
          <span className="font-mono text-[10px] uppercase tracking-wider block text-sev-high font-bold mb-1">
            Rejection Rationale:
          </span>
          "{rejectedReason}"
        </div>
      )}

      {/* Pending Action Controls */}
      {isPending && (
        <div className="space-y-3 pt-2">
          {showApproveNote ? (
            <div className="space-y-2 bg-surface-alt border border-border rounded-none p-3">
              <label className="block text-[10px] font-mono uppercase tracking-wider text-muted font-medium">
                Optional Inspector Note (Work Order Dispatch):
              </label>
              <input
                type="text"
                value={approveNoteInput}
                onChange={(e) => setApproveNoteInput(e.target.value)}
                placeholder="e.g. Verified road depression; authorized emergency cold-mix dispatch."
                className="w-full bg-surface border border-border rounded-none px-3 py-1.5 text-xs text-text placeholder:text-muted focus:outline-none focus:border-border-strong font-sans"
              />
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  onClick={() => setShowApproveNote(false)}
                  className="px-3 py-1 text-xs font-mono text-muted hover:text-text cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmApprove}
                  className="px-3 py-1 bg-sev-low text-white rounded-none text-xs font-mono font-bold uppercase tracking-wider cursor-pointer hover:opacity-90 transition-opacity"
                >
                  Confirm Authorization
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={() => setShowApproveNote(true)}
                className="flex-1 bg-sev-low text-white py-2.5 rounded-none font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer hover:opacity-90 transition-opacity"
              >
                <UserCheck className="w-4 h-4" />
                APPROVE DISPATCH
              </button>

              <button
                onClick={() => setShowRejectModal(true)}
                className="px-5 py-2.5 rounded-none bg-sev-high text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer hover:opacity-90 transition-opacity"
              >
                <X className="w-4 h-4" />
                REJECT
              </button>
            </div>
          )}
        </div>
      )}

      {/* Reject Reason Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="rounded-none bg-surface border border-border-strong max-w-md w-full p-6 shadow-none space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2 text-sev-high">
                <AlertTriangle className="w-4 h-4" />
                <h4 className="font-mono text-xs uppercase tracking-wider font-bold">
                  Overturn / Reject Inspection
                </h4>
              </div>
              <button
                onClick={() => setShowRejectModal(false)}
                className="text-muted hover:text-text cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-muted font-sans leading-relaxed">
              Please document the technical reason for rejecting this autonomous inspection report (minimum 10 characters).
            </p>

            <textarea
              rows={3}
              value={rejectReasonInput}
              onChange={(e) => setRejectReasonInput(e.target.value)}
              placeholder="e.g. Visual shadow from roadside overpass mistaken for asphalt void cavity."
              className="w-full bg-surface-alt border border-border rounded-none p-3 text-xs text-text placeholder:text-muted focus:outline-none focus:border-border-strong font-sans resize-none"
            />

            <div className="flex items-center justify-between pt-2">
              <span className="font-mono text-[10px] text-muted">
                {rejectReasonInput.length}/10 chars min
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="px-3 py-1.5 text-xs font-mono text-muted hover:text-text cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmReject}
                  disabled={rejectReasonInput.trim().length < 10}
                  className="px-4 py-1.5 rounded-none bg-sev-high text-white font-mono text-xs font-bold uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity cursor-pointer"
                >
                  Submit Rejection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
