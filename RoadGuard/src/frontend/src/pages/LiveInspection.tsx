import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  getInspectionDetail,
  getInspectionStatus,
  getAgentState,
  approveReport,
  rejectReport,
} from '../services/api';
import { Inspection, AgentState, DAMAGE_CLASSES, mapStatusToWorkflowStage } from '../types';
import { AgentWorkflow } from '../components/agent/AgentWorkflow';
import { StatusBadge } from '../components/ui/StatusBadge';
import { SeverityBadge } from '../components/ui/SeverityBadge';
import { EventLog } from '../components/agent/EventLog';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { DetectionPanel } from '../components/inspection/DetectionPanel';
import { SeverityAssessmentCard } from '../components/inspection/SeverityAssessmentCard';
import { EvidenceGallery } from '../components/evidence/EvidenceGallery';
import { ApprovalCard } from '../components/inspection/ApprovalCard';
import {
  RotateCcw,
  FileText,
  Radio,
  MapPin,
} from 'lucide-react';

export const LiveInspection: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const inspectionId = id || 'INSP-2026-0881';

  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [agentState, setAgentState] = useState<AgentState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFrameIndex, setActiveFrameIndex] = useState(0);
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const pollTimerRef = useRef<number | null>(null);

  // Fetch current inspection and agent state
  const loadInspectionData = useCallback(async () => {
    try {
      const [inspData, stateData] = await Promise.all([
        getInspectionDetail(inspectionId),
        getAgentState(inspectionId),
      ]);
      setInspection(inspData);
      setAgentState(stateData);
      return { inspData, stateData };
    } catch (err: any) {
      setError(err?.message || 'Failed to load inspection data.');
      return null;
    }
  }, [inspectionId]);

  // Initial load
  useEffect(() => {
    setLoading(true);
    loadInspectionData().then((result) => {
      setLoading(false);
      if (result) {
        const { inspData } = result;
        const isTerminal = ['WAITING_FOR_APPROVAL', 'APPROVED', 'REJECTED', 'CLOSED'].includes(
          inspData.status
        );
        setIsLiveActive(!isTerminal);
      }
    });

    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
      }
    };
  }, [inspectionId, loadInspectionData]);

  // Handle anchor navigation (e.g. #evidence)
  useEffect(() => {
    if (!loading && window.location.hash === '#evidence') {
      const timer = setTimeout(() => {
        const el = document.getElementById('evidence');
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  // Polling loop for active simulation
  useEffect(() => {
    if (!isLiveActive) {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
      return;
    }

    pollTimerRef.current = window.setInterval(async () => {
      try {
        // Poll status first to advance mock simulation
        const currentStatus = await getInspectionStatus(inspectionId);
        const [inspData, stateData] = await Promise.all([
          getInspectionDetail(inspectionId),
          getAgentState(inspectionId),
        ]);

        setInspection(inspData);
        setAgentState(stateData);

        // Update active frame to latest evidence if new frames arrived
        if (inspData.evidence?.length) {
          setActiveFrameIndex(inspData.evidence.length - 1);
        }

        // Check if finished active pipeline
        if (['WAITING_FOR_APPROVAL', 'APPROVED', 'REJECTED', 'CLOSED'].includes(currentStatus)) {
          setIsLiveActive(false);
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 1500);

    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };
  }, [isLiveActive, inspectionId]);

  // Handle Simulation Replay
  const handleReplay = async () => {
    try {
      setIsResetting(true);
      setActiveFrameIndex(0);
      const [inspData, stateData] = await Promise.all([
        getInspectionDetail(inspectionId),
        getAgentState(inspectionId),
      ]);
      setInspection(inspData);
      setAgentState(stateData);
      setIsLiveActive(true);
    } catch (err: any) {
      console.error('Failed to reset simulation:', err);
    } finally {
      setIsResetting(false);
    }
  };

  // Handle Human Approval
  const handleApprove = async (reviewerNote?: string) => {
    try {
      await approveReport(inspectionId, reviewerNote);
      setInspection((prev) => (prev ? { ...prev, status: 'APPROVED' } : null));
      const stateData = await getAgentState(inspectionId);
      setAgentState(stateData);
    } catch (err: any) {
      alert(`Approval error: ${err?.message || 'Could not approve inspection.'}`);
    }
  };

  // Handle Human Rejection
  const handleReject = async (reason: string) => {
    try {
      await rejectReport(inspectionId, reason);
      setInspection((prev) => (prev ? { ...prev, status: 'REJECTED' } : null));
      const stateData = await getAgentState(inspectionId);
      setAgentState(stateData);
    } catch (err: any) {
      alert(`Rejection error: ${err?.message || 'Could not reject inspection.'}`);
    }
  };

  if (loading) {
    return <LoadingState variant="card" count={3} />;
  }

  if (error || !inspection) {
    return (
      <ErrorState
        title="INSPECTION SESSION NOT ACCESSIBLE"
        reason={error || `Session ${inspectionId} does not exist or could not be loaded.`}
        onRetry={() => {
          setError(null);
          setLoading(true);
          loadInspectionData().then(() => setLoading(false));
        }}
      />
    );
  }

  const isVideo = inspection.inputType === 'VIDEO';
  const hasFrames = inspection.evidence && inspection.evidence.length > 0;
  const currentFrame = inspection.evidence?.[activeFrameIndex] || inspection.evidence?.[0];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Session Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-border">
        <div>
          <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-wider text-muted mb-2 font-medium">
            <span className="flex items-center gap-1.5 text-muted">
              <Radio className={`w-3 h-3 ${isLiveActive ? 'text-accent animate-pulse' : 'text-muted'}`} />
              {isLiveActive ? 'ACTIVE PIPELINE STREAM' : 'STATIC TELEMETRY ARCHIVE'}
            </span>
            <span>//</span>
            <span className="text-text font-bold">{inspection.id}</span>
          </div>
          <h1 className="font-sans font-bold text-3xl sm:text-5xl tracking-tight text-text">
            Real-Time Decision Cockpit
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-muted font-sans flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-muted stroke-[1.5]" />
            {inspection.location || 'Interstate Corridor — Autonomous Patrol Sector'}
          </p>
        </div>

        {/* Action Controls & Badges */}
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={inspection.status} />
          <SeverityBadge severity={inspection.severity} />

          {/* Replay Run Button */}
          <button
            onClick={handleReplay}
            disabled={isResetting}
            className="flex items-center gap-2 px-4 py-2 rounded-none border border-border bg-surface hover:bg-surface-alt text-text font-mono text-[11px] uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
            title="Restart the agentic decision sequence from Frame #1"
          >
            <RotateCcw className={`w-3.5 h-3.5 text-muted ${isResetting ? 'animate-spin' : ''}`} />
            {isResetting ? 'RESETTING...' : 'REPLAY RUN'}
          </button>

          {/* View Final Report Link if Generated */}
          {(inspection.status === 'WAITING_FOR_APPROVAL' ||
            inspection.status === 'APPROVED' ||
            inspection.status === 'REJECTED') && (
            <Link
              to={`/reports/${inspection.id}`}
              className="flex items-center gap-2 px-4 py-2 rounded-none bg-text text-bg border border-border-strong font-mono text-[11px] font-bold uppercase tracking-wider hover:opacity-90 transition-opacity"
            >
              <FileText className="w-3.5 h-3.5 stroke-[2]" />
              REPORT BRIEF
            </Link>
          )}
        </div>
      </div>

      {/* Signature Agent Workflow Stepper */}
      <AgentWorkflow
        currentStage={agentState?.currentStage || mapStatusToWorkflowStage(inspection.status)}
      />

      {/* Primary Video Feed & Agent Reasoning Log (12 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Video Player / Image Sensor Feed */}
        <div className="lg:col-span-8">
          <div className="rounded-none bg-surface border border-border p-6 flex flex-col justify-between aspect-[16/10] relative overflow-hidden group">
            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-muted z-10 font-medium">
              <span>HIGH-RES OPTIC // OPENCV 5 SENSOR FEED</span>
              <span>{isVideo ? `FRAME ${activeFrameIndex + 1} OF ${inspection.evidence.length || 7}` : 'SINGLE OBSERVATION'}</span>
            </div>
            <div className="relative flex-1 my-4 flex items-center justify-center rounded-none overflow-hidden bg-black border border-border">
              {currentFrame ? (
                <img
                  src={currentFrame.annotatedUrl || currentFrame.imageUrl}
                  alt="Sensor Feed"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-muted font-mono text-xs">AWAITING SENSOR FRAMES</div>
              )}
              <div className="absolute top-4 left-4 font-mono text-[9px] uppercase tracking-wider px-2 py-1 bg-surface/90 text-text rounded-none border border-border">
                CONFIDENCE: {inspection.confidence}%
              </div>
            </div>
            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-muted z-10 font-medium">
              <span>RDD2022: {inspection.damageClass}</span>
              <span>STATUS: {inspection.status}</span>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Reasoning Telemetry Feed */}
        <div className="lg:col-span-4 flex flex-col">
          <EventLog
            events={agentState?.events || inspection.events || []}
            title="AGENT REASONING FEED"
            className="flex-1 min-h-[460px]"
          />
        </div>
      </div>

      {/* Middle Grid: Damage Classifier Lock & Hazard Assessment */}
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

      {/* Bottom Section 1: Multi-Frame Temporal Evidence Gallery */}
      {hasFrames && (
        <div id="evidence">
          <EvidenceGallery
            frames={inspection.evidence}
          />
        </div>
      )}

      {/* Bottom Section 2: Human Supervisor Approval Gate */}
      <ApprovalCard
        inspectionId={inspection.id}
        severity={inspection.severity}
        damageClass={inspection.damageClass}
        confidence={inspection.confidence}
        roadPosition={inspection.location || 'Lane 2 (Direct Wheelpath)'}
        recommendation={inspection.severity === 'HIGH' ? 'Full-depth asphalt patching within 24 hours. Mill surrounding 2m radius.' : 'Standard preventive joint sealing.'}
        status={inspection.status === 'APPROVED' ? 'APPROVED' : inspection.status === 'REJECTED' ? 'REJECTED' : 'WAITING_FOR_APPROVAL'}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
};

export default LiveInspection;
