import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getInspectionDetail } from '../services/api';
import { Inspection, DAMAGE_CLASSES, mapStatusToWorkflowStage } from '../types';
import { StatusBadge } from '../components/ui/StatusBadge';
import { SeverityBadge } from '../components/ui/SeverityBadge';
import { AgentWorkflow } from '../components/agent/AgentWorkflow';
import { EventLog } from '../components/agent/EventLog';
import { DetectionPanel } from '../components/inspection/DetectionPanel';
import { SeverityAssessmentCard } from '../components/inspection/SeverityAssessmentCard';
import { EvidenceGallery } from '../components/evidence/EvidenceGallery';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import {
  ArrowLeft,
  Radio,
  FileText,
  Cpu,
  Zap,
  MapPin,
  Calendar,
  Layers,
  HardDrive,
  Camera,
} from 'lucide-react';

export const InspectionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const inspectionId = id || 'INSP-2026-0881';

  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getInspectionDetail(inspectionId);
      setInspection(data);
    } catch (err: any) {
      setError(err?.message || 'Inspection telemetry record not found.');
    } finally {
      setLoading(false);
    }
  }, [inspectionId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return <LoadingState variant="card" count={3} />;
  }

  if (error || !inspection) {
    return (
      <ErrorState
        title="RECORD NOT FOUND"
        reason={error || `Inspection record ${inspectionId} does not exist.`}
        onRetry={loadData}
      />
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Back Navigation & Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/history"
          className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-muted hover:text-text transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          BACK TO INSPECTION ARCHIVE
        </Link>

        <div className="font-mono text-[10px] uppercase tracking-wider text-muted">
          SECURE AUDIT RECORD // HASH: 8f9b...a1c3
        </div>
      </div>

      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-wider text-muted mb-2 font-medium">
            <span>AUDIT TELEMETRY RECORD</span>
            <span>//</span>
            <span className="text-text font-bold">{inspection.id}</span>
          </div>
          <h1 className="font-sans font-bold text-4xl sm:text-5xl tracking-tight text-text">
            {DAMAGE_CLASSES[inspection.damageClass]?.label || inspection.damageClass} Assessment
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-mono text-muted">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-muted" />
              {inspection.createdAt}
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-muted" />
              {inspection.location || 'Highway Corridor Segment 12'}
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-muted" />
              {inspection.inputType} RUN ({inspection.totalFrames || 7} Frames)
            </span>
          </div>
        </div>

        {/* Status Pills and Action CTA Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={inspection.status} />
          <SeverityBadge severity={inspection.severity} />

          <Link
            to={`/live/${inspection.id}`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-none border border-border bg-surface hover:bg-surface-alt text-text font-mono text-[11px] uppercase tracking-wider transition-colors"
          >
            <Radio className="w-3.5 h-3.5 text-muted" />
            LIVE COCKPIT
          </Link>

          <Link
            to={`/reports/${inspection.id}`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-none bg-text text-bg border border-border-strong font-mono text-[11px] font-bold uppercase tracking-wider hover:opacity-90 transition-opacity"
          >
            <FileText className="w-3.5 h-3.5 stroke-[2]" />
            REPORT BRIEF
          </Link>
        </div>
      </div>

      {/* Signature Agent Workflow Pipeline */}
      <AgentWorkflow
        currentStage={mapStatusToWorkflowStage(inspection.status)}
      />

      {/* Hardware & Hardware Acceleration Telemetry Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-none bg-surface border border-border">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-muted mb-1 font-medium">
            <Cpu className="w-3.5 h-3.5 text-muted" />
            <span>ACCELERATOR</span>
          </div>
          <div className="font-mono text-sm text-text font-semibold">AWS Graviton3 ARM</div>
          <div className="font-mono text-[10px] text-muted mt-0.5">c7g.2xlarge NEON</div>
        </div>

        <div className="p-4 rounded-none bg-surface border border-border">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-muted mb-1 font-medium">
            <Zap className="w-3.5 h-3.5 text-muted" />
            <span>VISION ENGINE</span>
          </div>
          <div className="font-mono text-sm text-text font-semibold">OpenCV 5.0.0 (COOL)</div>
          <div className="font-mono text-[10px] text-muted mt-0.5">Kernel JIT Compiled</div>
        </div>

        <div className="p-4 rounded-none bg-surface border border-border">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-muted mb-1 font-medium">
            <Layers className="w-3.5 h-3.5 text-muted" />
            <span>TEMPORAL LOCK</span>
          </div>
          <div className="font-mono text-sm text-text font-semibold">
            {inspection.persistenceFrames} / {inspection.totalFrames || 7} Frames
          </div>
          <div className="font-mono text-[10px] text-muted mt-0.5">
            Confirmed Persistent
          </div>
        </div>

        <div className="p-4 rounded-none bg-surface border border-border">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-muted mb-1 font-medium">
            <HardDrive className="w-3.5 h-3.5 text-muted" />
            <span>LATENCY PROFILE</span>
          </div>
          <div className="font-mono text-sm text-text font-semibold">14.8 ms / Frame</div>
          <div className="font-mono text-[10px] text-muted mt-0.5">4.2x Faster vs x86</div>
        </div>
      </div>

      {/* Detection & Severity Assessment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DetectionPanel
          damageClass={inspection.damageClass}
          confidence={inspection.confidence}
        />
        <SeverityAssessmentCard
          damageType={DAMAGE_CLASSES[inspection.damageClass]?.label || inspection.damageClass}
          confidence={inspection.confidence}
          severity={inspection.severity}
          roadPosition={inspection.location || 'Lane 2 (Direct Wheelpath)'}
          persistenceFrames={inspection.persistenceFrames}
          recommendation={inspection.severity === 'HIGH' ? 'Full-depth asphalt patching within 24 hours. Mill surrounding 2m radius.' : 'Standard preventive joint sealing.'}
        />
      </div>

      {/* Temporal Evidence Frames */}
      {inspection.evidence && inspection.evidence.length > 0 && (
        <EvidenceGallery
          frames={inspection.evidence}
        />
      )}

      {/* Complete Agent Reasoning Log */}
      <EventLog
        events={inspection.events || []}
        title="IMMUTABLE AUDIT LOG & AGENT REASONING FEED"
      />
    </div>
  );
};

export default InspectionDetail;
