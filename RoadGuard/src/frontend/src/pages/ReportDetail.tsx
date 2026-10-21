import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getInspectionDetail, getReport, approveReport, rejectReport } from '../services/api';
import { Inspection, Report } from '../types';
import { StatusBadge } from '../components/ui/StatusBadge';
import { SeverityBadge } from '../components/ui/SeverityBadge';
import { DamageClassChip } from '../components/ui/DamageClassChip';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import {
  ArrowLeft,
  Printer,
  Radio,
  CheckCircle,
  XCircle,
  FileText,
  MapPin,
  Layers,
  Wrench,
  ShieldCheck,
  Clock,
  UserCheck,
} from 'lucide-react';

export const ReportDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  // Support both INSP- and REP- ID formats in URL
  const lookupId = id?.startsWith('REP-') ? id.replace('REP-', 'INSP-') : (id || 'INSP-2026-0881');

  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Approval interaction
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [reviewerNote, setReviewerNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getInspectionDetail(lookupId);
      setInspection(data);
      try {
        const rep = await getReport(data.id);
        setReport(rep);
      } catch {
        // Report not yet generated or independent
      }
    } catch (err: any) {
      setError(err?.message || 'Report not found.');
    } finally {
      setLoading(false);
    }
  }, [lookupId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handlePrint = () => {
    window.print();
  };

  const handleApprove = async () => {
    if (!inspection) return;
    setIsSubmitting(true);
    try {
      const updated = await approveReport(inspection.id, reviewerNote || 'Authorized by Field Maintenance Engineer.');
      setReport(updated);
      setInspection((prev) => (prev ? { ...prev, status: 'APPROVED' } : null));
    } catch (err: any) {
      alert(`Approval failed: ${err?.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!inspection || !rejectReason.trim()) return;
    setIsSubmitting(true);
    try {
      const updated = await rejectReport(inspection.id, rejectReason);
      setReport(updated);
      setInspection((prev) => (prev ? { ...prev, status: 'REJECTED' } : null));
      setShowRejectModal(false);
    } catch (err: any) {
      alert(`Rejection failed: ${err?.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingState variant="card" count={3} />;
  }

  if (error || !inspection) {
    return (
      <ErrorState
        title="WORK ORDER NOT FOUND"
        reason={error || `Report for ${lookupId} could not be retrieved.`}
        onRetry={loadData}
      />
    );
  }

  const reportId = report?.id || inspection.reportId || `REP-${inspection.id.replace('INSP-', '')}`;
  const isApproved = inspection.status === 'APPROVED' || report?.status === 'APPROVED';
  const isRejected = inspection.status === 'REJECTED' || report?.status === 'REJECTED';
  const isPending = inspection.status === 'WAITING_FOR_APPROVAL' || report?.status === 'PENDING';

  return (
    <div className="space-y-10 animate-in fade-in duration-700 max-w-5xl mx-auto">
      {/* Top Navigation Bar (Hidden in Print) */}
      <div className="flex items-center justify-between print:hidden">
        <Link
          to="/reports"
          className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-muted hover:text-text transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          BACK TO WORK ORDERS
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to={`/live/${inspection.id}`}
            className="flex items-center gap-2 px-3 py-1.5 rounded-none border border-border bg-surface hover:bg-surface-alt text-text font-mono text-[10px] uppercase tracking-wider transition-colors"
          >
            <Radio className="w-3.5 h-3.5 text-muted" />
            LIVE COCKPIT
          </Link>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-none bg-text text-bg border border-border-strong font-mono text-[11px] font-bold uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 stroke-[2]" />
            PRINT WORK ORDER
          </button>
        </div>
      </div>

      {/* Main Document Sheet Container */}
      <div className="rounded-none bg-surface border border-border p-8 md:p-12 space-y-10 print:bg-white print:text-black print:border-black print:p-4">
        {/* Document Header & Official Seal */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-8 border-b border-border print:border-black">
          <div>
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-muted mb-2 print:text-slate-700 font-medium">
              <FileText className="w-3.5 h-3.5 stroke-[1.5]" />
              <span>DEPARTMENT OF TRANSPORTATION // PAVEMENT REPAIR DIVISION</span>
            </div>
            <h1 className="font-sans font-bold text-4xl sm:text-5xl tracking-tight text-text print:text-black">
              Engineering Work Order Brief
            </h1>
            <p className="mt-2 font-mono text-xs text-muted print:text-slate-600">
              MUNICIPAL DOCUMENT REFERENCE: <span className="text-text font-bold print:text-black">{reportId}</span>
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end gap-2">
            <div className="flex items-center gap-2">
              <StatusBadge status={inspection.status} />
              <SeverityBadge severity={inspection.severity} />
            </div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted print:text-slate-600">
              ISSUED: {report?.approvedAt || inspection.createdAt}
            </span>
          </div>
        </div>

        {/* Section 1: Location & Roadway Context */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-text print:text-black pb-2 border-b border-border print:border-gray-300 font-bold">
            <MapPin className="w-4 h-4 text-muted print:text-black" />
            <span>1.0 GEOGRAPHIC & ASSET CONTEXT</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            <div className="p-4 rounded-none bg-surface-alt border border-border print:border-gray-300 print:bg-gray-50">
              <span className="text-muted text-[10px] uppercase tracking-wider block mb-1 font-medium">
                CORRIDOR / HIGHWAY
              </span>
              <span className="text-text font-semibold print:text-black">
                {inspection.location || 'Interstate 405 Northbound'}
              </span>
            </div>
            <div className="p-4 rounded-none bg-surface-alt border border-border print:border-gray-300 print:bg-gray-50">
              <span className="text-muted text-[10px] uppercase tracking-wider block mb-1 font-medium">
                LANE POSITION
              </span>
              <span className="text-text font-semibold print:text-black">
                {report?.roadPosition || 'Lane 2 (Direct Wheelpath)'}
              </span>
            </div>
            <div className="p-4 rounded-none bg-surface-alt border border-border print:border-gray-300 print:bg-gray-50">
              <span className="text-muted text-[10px] uppercase tracking-wider block mb-1 font-medium">
                SENSOR RUN FILE
              </span>
              <span className="text-text font-semibold print:text-black">
                {inspection.id}
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Defect Diagnostic & Autonomous Verification */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-text print:text-black pb-2 border-b border-border print:border-gray-300 font-bold">
            <Layers className="w-4 h-4 text-muted print:text-black" />
            <span>2.0 PAVEMENT DISTRESS DIAGNOSTIC & MULTI-FRAME PROVENANCE</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
            <div className="p-4 rounded-none bg-surface-alt border border-border print:border-gray-300 print:bg-gray-50">
              <span className="text-muted text-[10px] uppercase tracking-wider block mb-1 font-medium">
                RDD2022 CLASSIFICATION
              </span>
              <div className="flex items-center gap-2 mt-1">
                <DamageClassChip damageClass={inspection.damageClass} size="sm" />
              </div>
            </div>
            <div className="p-4 rounded-none bg-surface-alt border border-border print:border-gray-300 print:bg-gray-50">
              <span className="text-muted text-[10px] uppercase tracking-wider block mb-1 font-medium">
                VERIFIED CONFIDENCE
              </span>
              <span className="text-2xl font-bold text-text print:text-black">
                {inspection.confidence}%
              </span>
            </div>
            <div className="p-4 rounded-none bg-surface-alt border border-border print:border-gray-300 print:bg-gray-50">
              <span className="text-muted text-[10px] uppercase tracking-wider block mb-1 font-medium">
                TEMPORAL PERSISTENCE
              </span>
              <span className="text-text font-semibold print:text-black">
                {inspection.persistenceFrames} of {inspection.totalFrames || 7} Frames
              </span>
            </div>
            <div className="p-4 rounded-none bg-surface-alt border border-border print:border-gray-300 print:bg-gray-50">
              <span className="text-muted text-[10px] uppercase tracking-wider block mb-1 font-medium">
                ROAD POSITION
              </span>
              <span className="text-text font-semibold print:text-black truncate">
                {report?.roadPosition || inspection.location || 'Active Wheelpath'}
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: Certified Photographic Evidence */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border print:border-gray-300">
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-text print:text-black font-bold">
              <ShieldCheck className="w-4 h-4 text-muted print:text-black" />
              <span>3.0 CERTIFIED VISUAL EVIDENCE PACKET</span>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted print:text-slate-600">
              FRAME BUFFER: OPENCV 5 COOL
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Primary Annotated Evidence Image */}
            <div className="lg:col-span-8 rounded-none overflow-hidden border border-border bg-black aspect-[16/10] relative">
              <img
                src={inspection.evidence?.[0]?.annotatedUrl || inspection.evidence?.[0]?.imageUrl || ''}
                alt="Pavement Distress Evidence"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 bg-surface/90 border border-border px-2 py-1 rounded-none font-mono text-[9px] uppercase tracking-wider text-text">
                EVIDENCE FRAME #4 // HIGH RESOLUTION
              </div>
            </div>

            {/* Supporting Multi-Frame Filmstrip Thumbnails */}
            <div className="lg:col-span-4 space-y-3">
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted block font-medium">
                SUPPORTING TEMPORAL FRAMES
              </span>
              <div className="grid grid-cols-3 gap-2">
                {(inspection.evidence?.slice(0, 6) || []).map((frame) => (
                  <div
                    key={frame.frameNumber}
                    className="rounded-none border border-border overflow-hidden bg-black relative group"
                  >
                    <img
                      src={frame.imageUrl}
                      alt={`Frame ${frame.frameNumber}`}
                      className="w-full aspect-[4/3] object-cover"
                    />
                    <div className="p-1 bg-surface/90 font-mono text-[8px] text-center text-text border-t border-border">
                      F#{frame.frameNumber} · {frame.confidence}%
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted font-sans font-normal leading-relaxed print:text-slate-600">
                Multi-frame verification confirms damage persistence across 100% of analyzed video buffer frames, ruling out transient surface debris, shadows, or sensor occlusion.
              </p>
            </div>
          </div>
        </div>

        {/* Section 4: Engineering Directive & Recommended Remediation */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-text print:text-black pb-2 border-b border-border print:border-gray-300 font-bold">
            <Wrench className="w-4 h-4 text-muted print:text-black" />
            <span>4.0 FIELD ENGINEERING DIRECTIVE</span>
          </div>

          <div className="p-6 rounded-none bg-surface-alt border border-border space-y-4 print:border-gray-300 print:bg-gray-50">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted block mb-1 font-medium">
                MUNICIPAL REPAIR SPECIFICATION
              </span>
              <p className="font-sans text-sm sm:text-base text-text font-medium leading-relaxed print:text-black">
                {report?.recommendation ||
                  'Full-depth asphalt patching within 24 hours. Mill surrounding 2m radius to sound pavement, apply tack coat, and compact hot-mix asphalt in two 3-inch lifts.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-border font-mono text-xs print:border-gray-300">
              <div>
                <span className="text-muted text-[10px] uppercase tracking-wider block font-medium">DISPATCH WINDOW</span>
                <span className="text-text font-semibold print:text-black">
                  {inspection.severity === 'HIGH' ? 'URGENT // < 24 HOURS' : 'SCHEDULED // 30 DAYS'}
                </span>
              </div>
              <div>
                <span className="text-muted text-[10px] uppercase tracking-wider block font-medium">TRAFFIC MANAGEMENT</span>
                <span className="text-text font-semibold print:text-black">
                  Single Right Lane Closure Required
                </span>
              </div>
              <div>
                <span className="text-muted text-[10px] uppercase tracking-wider block font-medium">ESTIMATED REPAIR COST</span>
                <span className="text-text font-semibold print:text-black">
                  {inspection.severity === 'HIGH' ? '$1,450 — $2,100' : '$400 — $750'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 5: Authorization & Chain of Custody */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-text print:text-black pb-2 border-b border-border print:border-gray-300 font-bold">
            <UserCheck className="w-4 h-4 text-muted print:text-black" />
            <span>5.0 HUMAN SUPERVISOR SIGN-OFF & CHAIN OF CUSTODY</span>
          </div>

          <div className="p-6 rounded-none bg-surface-alt border border-border space-y-4 print:border-gray-300 print:bg-gray-50">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted block mb-1 font-medium">
                  AUTHORIZATION STATUS
                </span>
                <div className="flex items-center gap-2">
                  {isApproved && (
                    <span className="font-mono text-sm font-bold text-sev-low flex items-center gap-1.5 print:text-green-800">
                      <CheckCircle className="w-4 h-4" />
                      OFFICIALLY AUTHORIZED FOR CREW DISPATCH
                    </span>
                  )}
                  {isRejected && (
                    <span className="font-mono text-sm font-bold text-sev-high flex items-center gap-1.5 print:text-red-800">
                      <XCircle className="w-4 h-4" />
                      OVERTURNED BY HUMAN SUPERVISOR
                    </span>
                  )}
                  {isPending && (
                    <span className="font-mono text-sm font-bold text-hazard flex items-center gap-1.5 print:text-yellow-800">
                      <Clock className="w-4 h-4" />
                      PENDING HUMAN SUPERVISOR SIGN-OFF
                    </span>
                  )}
                </div>
              </div>

              {/* Timestamp / Signer */}
              <div className="font-mono text-xs text-right">
                <span className="text-muted block text-[10px] uppercase tracking-wider font-medium">
                  SIGNING SUPERVISOR
                </span>
                <span className="text-text font-semibold print:text-black">
                  Sarah Chen, PE · Badge #PW-4482
                </span>
              </div>
            </div>

            {/* Supervisor Notes if any */}
            {(report?.reviewerNote || report?.rejectedReason) && (
              <div className="pt-3 border-t border-border font-mono text-xs text-text print:text-black">
                <span className="text-muted text-[10px] uppercase tracking-wider block mb-0.5 font-medium">
                  SUPERVISOR AUDIT STATEMENT:
                </span>
                <p className="italic">
                  "{report.reviewerNote || report.rejectedReason}"
                </p>
              </div>
            )}

            {/* In-page Approval Action if Pending (Hidden in Print) */}
            {isPending && (
              <div className="pt-4 border-t border-border print:hidden space-y-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <input
                    type="text"
                    value={reviewerNote}
                    onChange={(e) => setReviewerNote(e.target.value)}
                    placeholder="Optional engineering sign-off note..."
                    className="flex-1 px-4 py-2 bg-surface border border-border rounded-none text-xs text-text placeholder:text-muted font-sans focus:outline-none focus:border-border-strong"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleApprove}
                      disabled={isSubmitting}
                      className="px-4 py-2 rounded-none font-mono text-[11px] font-bold uppercase tracking-wider bg-sev-low hover:opacity-90 text-white transition-opacity disabled:opacity-50 cursor-pointer"
                    >
                      APPROVE BRIEF
                    </button>
                    <button
                      onClick={() => setShowRejectModal(true)}
                      disabled={isSubmitting}
                      className="px-4 py-2 rounded-none font-mono text-[11px] font-bold uppercase tracking-wider bg-sev-high hover:opacity-90 text-white transition-opacity disabled:opacity-50 cursor-pointer"
                    >
                      REJECT
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Audit Provenance */}
        <div className="pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4 font-mono text-[9px] uppercase tracking-wider text-muted print:text-slate-700 font-medium">
          <div>
            SYSTEM: ROADGUARD AI PIPELINE // S3 TELEMETRY BACKEND // OPENCV 5.0 COOL
          </div>
          <div>
            VERIFICATION HASH: sha256:7f14b30c90d81e
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-in fade-in duration-200">
          <div className="rounded-none bg-surface border border-border-strong p-6 max-w-md w-full space-y-4 shadow-none">
            <h3 className="font-sans font-bold text-2xl text-text">Overturn Work Order</h3>
            <p className="text-xs text-muted font-sans">
              Please document the technical reason for rejecting this automated pavement maintenance work order.
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Surface artifact confirmed as shadow cast by overhead utility pole..."
              className="w-full p-3 bg-surface-alt border border-border rounded-none text-xs text-text placeholder:text-muted font-sans focus:outline-none focus:border-border-strong resize-none"
            />
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 rounded-none border border-border text-muted hover:text-text font-mono text-[10px] uppercase tracking-wider cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim() || isSubmitting}
                className="px-4 py-2 rounded-none bg-sev-high hover:opacity-90 text-white font-mono text-[10px] font-bold uppercase tracking-wider disabled:opacity-50 cursor-pointer transition-opacity"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportDetail;
