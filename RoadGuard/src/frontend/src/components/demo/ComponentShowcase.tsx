import React, { useState } from 'react';
import type { InspectionStatus, WorkflowStage, WorkflowStageStatus, AgentState } from '../../types/agent';
import type { Severity, DamageClass } from '../../types/inspection';
import type { ReportStatus, Report } from '../../types/report';
import { StatusBadge } from '../ui/StatusBadge';
import { SeverityBadge } from '../ui/SeverityBadge';
import { ConfidenceBar } from '../ui/ConfidenceBar';
import { MetricCard } from '../ui/MetricCard';
import { DamageClassChip } from '../ui/DamageClassChip';
import { EmptyState } from '../ui/EmptyState';
import { LoadingState } from '../ui/LoadingState';
import { ErrorState } from '../ui/ErrorState';
import { AgentWorkflow } from '../agent/AgentWorkflow';
import { EventLog } from '../agent/EventLog';
import { AgentDecisionCard } from '../agent/AgentDecisionCard';
import { DetectionOverlay } from '../evidence/DetectionOverlay';
import { FrameTimeline } from '../evidence/FrameTimeline';
import { PersistenceIndicator } from '../evidence/PersistenceIndicator';
import { EvidenceGallery } from '../evidence/EvidenceGallery';
import { DetectionPanel } from '../inspection/DetectionPanel';
import { SeverityAssessmentCard } from '../inspection/SeverityAssessmentCard';
import { ApprovalCard } from '../inspection/ApprovalCard';
import { ReportPreview } from '../inspection/ReportPreview';
import { DEMO_EVIDENCE_FRAMES, DEMO_AGENT_EVENTS, DEMO_REPORT } from '../../services/mock/demoInspection';
import { Shield, Cpu, Gauge, Zap } from 'lucide-react';

const ALL_STATUSES: (InspectionStatus | ReportStatus)[] = [
  'UPLOADED',
  'PROCESSING',
  'OBSERVING',
  'DETECTING',
  'VERIFYING',
  'REINSPECTING',
  'ASSESSING',
  'REPORT_GENERATING',
  'WAITING_FOR_APPROVAL',
  'PENDING',
  'APPROVED',
  'REJECTED',
  'CLOSED',
];

const ALL_SEVERITIES: Severity[] = ['LOW', 'MEDIUM', 'HIGH'];
const ALL_DAMAGE_CLASSES: DamageClass[] = ['D00', 'D10', 'D20', 'D40'];

export const ComponentShowcase: React.FC = () => {
  const [activeFrameNum, setActiveFrameNum] = useState<number>(1);
  const [activeLoadingTab, setActiveLoadingTab] = useState<'card' | 'table' | 'list'>('card');
  const [retryNotice, setRetryNotice] = useState<string | null>(null);

  // Workflow scenario data
  const midRunStages: Record<WorkflowStage, WorkflowStageStatus> = {
    OBSERVE: 'COMPLETED',
    VERIFY: 'RUNNING',
    RECHECK: 'PENDING',
    ASSESS: 'PENDING',
    REPORT: 'PENDING',
    HUMAN_REVIEW: 'PENDING',
  };

  const completeStages: Record<WorkflowStage, WorkflowStageStatus> = {
    OBSERVE: 'COMPLETED',
    VERIFY: 'COMPLETED',
    RECHECK: 'COMPLETED',
    ASSESS: 'COMPLETED',
    REPORT: 'COMPLETED',
    HUMAN_REVIEW: 'COMPLETED',
  };

  const failedStages: Record<WorkflowStage, WorkflowStageStatus> = {
    OBSERVE: 'COMPLETED',
    VERIFY: 'COMPLETED',
    RECHECK: 'COMPLETED',
    ASSESS: 'FAILED',
    REPORT: 'PENDING',
    HUMAN_REVIEW: 'PENDING',
  };

  const sampleAgentState: AgentState = {
    inspectionId: 'RG-DEMO-01',
    status: 'VERIFYING',
    currentStage: 'VERIFY',
    workflowStages: midRunStages,
    events: DEMO_AGENT_EVENTS.slice(0, 4),
  };

  const sampleReportApproved: Report = {
    ...DEMO_REPORT,
    id: 'REP-0002',
    status: 'APPROVED',
    approvedAt: '2026-10-07T12:00:00Z',
    reviewerNote: 'Highway safety division authorized emergency cold-mix dispatch for Lane 2.',
  };

  const sampleReportRejected: Report = {
    ...DEMO_REPORT,
    id: 'REP-0003',
    status: 'REJECTED',
    rejectedReason: 'Physical survey confirmed specular rain puddle reflection rather than asphalt fissure.',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Page Header */}
      <div className="border-b border-border pb-6">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-5 h-5 text-accent" />
          <span className="font-mono text-xs uppercase tracking-wider text-muted">
            RoadGuard Design System
          </span>
        </div>
        <h1 className="text-3xl font-bold font-mono tracking-tight text-text mb-2">
          Shared Components Showcase
        </h1>
        <p className="text-muted font-sans text-sm">
          Interactive verification suite for all reusable UI, Agent, Evidence, and Inspection components.
        </p>
      </div>

      {/* SECTION 1: Status & Severity Badges */}
      <section className="space-y-6">
        <div className="border-b border-border pb-2">
          <h2 className="font-mono text-sm uppercase tracking-wider text-text font-bold">
            01. Badges & Micro-Indicators
          </h2>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-mono text-muted uppercase tracking-wider font-medium">
            All StatusBadge States (12 InspectionStatus + 1 ReportStatus)
          </h3>
          <div className="flex flex-wrap gap-2.5 p-4 rounded-none bg-surface border border-border">
            {ALL_STATUSES.map((st) => (
              <StatusBadge key={st} status={st} />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-mono text-muted uppercase tracking-wider font-medium">
            SeverityBadge States
          </h3>
          <div className="flex flex-wrap gap-3 p-4 rounded-none bg-surface border border-border items-center">
            {ALL_SEVERITIES.map((sev) => (
              <SeverityBadge key={sev} severity={sev} showIcon />
            ))}
            {ALL_SEVERITIES.map((sev) => (
              <SeverityBadge key={`no-icon-${sev}`} severity={sev} size="sm" />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-mono text-muted uppercase tracking-wider font-medium">
            DamageClassChip (D00, D10, D20, D40)
          </h3>
          <div className="flex flex-wrap gap-3 p-4 rounded-none bg-surface border border-border">
            {ALL_DAMAGE_CLASSES.map((dc) => (
              <DamageClassChip key={dc} damageClass={dc} showDescription />
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 2: Metric Cards & Confidence Progress */}
      <section className="space-y-6">
        <div className="border-b border-border pb-2">
          <h2 className="font-mono text-sm uppercase tracking-wider text-text font-bold">
            02. Confidence & Metrics
          </h2>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-mono text-muted uppercase tracking-wider font-medium">
            ConfidenceBar at 20%, 62%, 88%, 95% (75% Autonomous Gate)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 rounded-none bg-surface border border-border">
            <ConfidenceBar confidence={20} />
            <ConfidenceBar confidence={62} />
            <ConfidenceBar confidence={88} />
            <ConfidenceBar confidence={95} />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-mono text-muted uppercase tracking-wider font-medium">
            MetricCard Examples
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Inference Latency"
              value="14.1 ms"
              delta={{ value: "3.42x faster", positive: true }}
              icon={Zap}
              description="ARM + OpenCV COOL"
            />
            <MetricCard
              label="Throughput"
              value="70.9 img/s"
              delta={{ value: "+241%", positive: true }}
              icon={Gauge}
              description="AWS Graviton3"
            />
            <MetricCard
              label="False Positive Rate"
              value="2.4%"
              delta={{ value: "-4.8%", positive: true }}
              icon={Shield}
              description="Multi-frame verified"
            />
            <MetricCard
              label="CPU Utilization"
              value="38.0%"
              delta={{ value: "54% load drop", positive: true }}
              icon={Cpu}
              description="Standard c7g instance"
            />
          </div>
        </div>
      </section>

      {/* SECTION 3: Agent Workflow Stepper & Reasoning Feed */}
      <section className="space-y-6">
        <div className="border-b border-border pb-2">
          <h2 className="font-mono text-sm uppercase tracking-wider text-text font-bold">
            03. Agent Stepper & Event Log
          </h2>
        </div>

        {/* Workflow Scenarios */}
        <div className="space-y-6">
          <div>
            <h3 className="text-xs font-mono text-muted uppercase tracking-wider mb-2 font-medium">
              (a) AgentWorkflow: Mid-Run (OBSERVE Completed, VERIFY Running)
            </h3>
            <AgentWorkflow currentStage="VERIFY" workflowStages={midRunStages} />
          </div>

          <div>
            <h3 className="text-xs font-mono text-muted uppercase tracking-wider mb-2 font-medium">
              (b) AgentWorkflow: Complete (All 6 Stages Completed)
            </h3>
            <AgentWorkflow currentStage="HUMAN_REVIEW" workflowStages={completeStages} />
          </div>

          <div>
            <h3 className="text-xs font-mono text-muted uppercase tracking-wider mb-2 font-medium">
              (c) AgentWorkflow: Failed (ASSESS Stage Failed)
            </h3>
            <AgentWorkflow currentStage="ASSESS" workflowStages={failedStages} />
          </div>
        </div>

        {/* EventLog with 8 events */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
          <div>
            <h3 className="text-xs font-mono text-muted uppercase tracking-wider mb-2 font-medium">
              EventLog (8 Sample Autonomous Events)
            </h3>
            <EventLog events={DEMO_AGENT_EVENTS.slice(0, 8)} />
          </div>

          <div>
            <h3 className="text-xs font-mono text-muted uppercase tracking-wider mb-2 font-medium">
              AgentDecisionCard
            </h3>
            <AgentDecisionCard state={sampleAgentState} confidence={74} />
          </div>
        </div>
      </section>

      {/* SECTION 4: Evidence, Overlays, and Scrubbing */}
      <section className="space-y-6">
        <div className="border-b border-border pb-2">
          <h2 className="font-mono text-sm uppercase tracking-wider text-text font-bold">
            04. Evidence & Video Scrubbing
          </h2>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-mono text-muted uppercase tracking-wider font-medium">
            Persistence Indicator
          </h3>
          <div className="flex flex-wrap gap-4 p-4 rounded-none bg-surface border border-border items-center">
            <PersistenceIndicator count={1} total={7} status="POSSIBLE" />
            <PersistenceIndicator count={4} total={7} status="DETECTED" />
            <PersistenceIndicator count={7} total={7} status="CONFIRMED" />
          </div>
        </div>

        {/* Frame Timeline */}
        <div className="space-y-2">
          <h3 className="text-xs font-mono text-muted uppercase tracking-wider font-medium">
            FrameTimeline (7 Frames from Demo Inspection)
          </h3>
          <FrameTimeline
            frames={DEMO_EVIDENCE_FRAMES}
            activeFrameNumber={activeFrameNum}
            onSelect={(f) => setActiveFrameNum(f)}
          />
        </div>

        {/* Single Frame Detection Overlay */}
        <div className="space-y-2">
          <h3 className="text-xs font-mono text-muted uppercase tracking-wider font-medium">
            DetectionOverlay (Active Frame #{activeFrameNum})
          </h3>
          <div className="max-w-2xl">
            <DetectionOverlay
              imageUrl={DEMO_EVIDENCE_FRAMES[activeFrameNum - 1]?.imageUrl || DEMO_EVIDENCE_FRAMES[0].imageUrl}
              detections={
                DEMO_EVIDENCE_FRAMES[activeFrameNum - 1]?.detection
                  ? [DEMO_EVIDENCE_FRAMES[activeFrameNum - 1].detection!]
                  : []
              }
            />
          </div>
        </div>

        {/* Evidence Gallery */}
        <div className="space-y-2">
          <h3 className="text-xs font-mono text-muted uppercase tracking-wider font-medium">
            EvidenceGallery (7 Frames with Lightbox)
          </h3>
          <EvidenceGallery frames={DEMO_EVIDENCE_FRAMES} />
        </div>
      </section>

      {/* SECTION 5: Inspection Cards & Human Approval */}
      <section className="space-y-6">
        <div className="border-b border-border pb-2">
          <h2 className="font-mono text-sm uppercase tracking-wider text-text font-bold">
            05. Inspection Panels & Human Review
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DetectionPanel damageClass="D40" confidence={91} />
          <SeverityAssessmentCard
            damageType="Pothole (Severe Surface Void)"
            confidence={91}
            severity="HIGH"
            roadPosition="Interstate 405 NB, Mile Marker 24.8, Lane 2"
            persistenceFrames={7}
            damageSize="~48cm diameter x ~12cm depth"
            lane="Lane 2 of 4 (Express Traffic)"
            recommendation="Immediate cold-mix asphalt patch within 4 hours to avoid tire puncture and rim deformation."
          />
        </div>

        {/* ApprovalCard in 3 states */}
        <div className="space-y-4">
          <h3 className="text-xs font-mono text-muted uppercase tracking-wider font-medium">
            ApprovalCard in 3 Lifecycle States
          </h3>

          <div className="space-y-6">
            <div>
              <span className="text-[10px] font-mono text-muted uppercase tracking-wider block mb-2">
                1. Default Waiting For Approval (Pending Review)
              </span>
              <ApprovalCard
                inspectionId="RG-0001"
                severity="HIGH"
                damageClass="D40"
                confidence={91}
                roadPosition="Route 405 NB, Mile Marker 24.8 (Lane 2)"
                recommendation="Emergency patch within 4 hours."
                status="WAITING_FOR_APPROVAL"
                onApprove={(note) => alert(`Approved with note: ${note || 'None'}`)}
                onReject={(reason) => alert(`Rejected: ${reason}`)}
              />
            </div>

            <div>
              <span className="text-[10px] font-mono text-muted uppercase tracking-wider block mb-2">
                2. Approved State
              </span>
              <ApprovalCard
                inspectionId="RG-0002"
                severity="HIGH"
                damageClass="D40"
                confidence={91}
                roadPosition="Route 405 NB, Mile Marker 24.8 (Lane 2)"
                recommendation="Emergency patch within 4 hours."
                status="APPROVED"
                reviewerNote={sampleReportApproved.reviewerNote}
              />
            </div>

            <div>
              <span className="text-[10px] font-mono text-muted uppercase tracking-wider block mb-2">
                3. Rejected State
              </span>
              <ApprovalCard
                inspectionId="RG-0003"
                severity="HIGH"
                damageClass="D40"
                confidence={68}
                roadPosition="Industrial Parkway Gate 3"
                recommendation="Secondary camera sweep required."
                status="REJECTED"
                rejectedReason={sampleReportRejected.rejectedReason}
              />
            </div>
          </div>
        </div>

        {/* Report Preview */}
        <div className="space-y-2">
          <h3 className="text-xs font-mono text-muted uppercase tracking-wider font-medium">
            ReportPreview Card (Used on Reports & Dashboard)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ReportPreview report={DEMO_REPORT} onClick={() => alert('Clicked Report')} />
            <ReportPreview report={sampleReportApproved} onClick={() => alert('Clicked Approved Report')} />
            <ReportPreview report={sampleReportRejected} onClick={() => alert('Clicked Rejected Report')} />
          </div>
        </div>
      </section>

      {/* SECTION 6: Empty, Error & Loading States */}
      <section className="space-y-6">
        <div className="border-b border-border pb-2">
          <h2 className="font-mono text-sm uppercase tracking-wider text-text font-bold">
            06. Utility States (Empty, Loading, Error)
          </h2>
        </div>

        {/* Empty States */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-[10px] font-mono text-muted uppercase tracking-wider block mb-2">
              EmptyState with CTA
            </span>
            <EmptyState
              title="NO ACTIVE INSPECTION IN PROGRESS"
              description="Start a new road survey to initiate autonomous object detection and multi-frame temporal tracking."
              action={{
                label: "START INSPECTION",
                onClick: () => alert("Initiate inspection"),
              }}
            />
          </div>

          <div>
            <span className="text-[10px] font-mono text-muted uppercase tracking-wider block mb-2">
              EmptyState without CTA
            </span>
            <EmptyState
              title="NO FILTER RESULTS FOUND"
              description="Try adjusting your severity, damage classification, or date range parameters."
            />
          </div>
        </div>

        {/* Error State */}
        <div>
          <span className="text-[10px] font-mono text-muted uppercase tracking-wider block mb-2">
            ErrorState with Retry Callback
          </span>
          <ErrorState
            reason="Failed to connect to ARM Graviton backend inference node. Connection timed out after 5000ms."
            onRetry={() => {
              setRetryNotice('Retry callback triggered successfully at ' + new Date().toLocaleTimeString());
              setTimeout(() => setRetryNotice(null), 3000);
            }}
          />
          {retryNotice && (
            <div className="mt-2 text-xs font-mono text-sev-low p-2 rounded-none bg-sev-low/10 border border-sev-low/30 text-center">
              {retryNotice}
            </div>
          )}
        </div>

        {/* Loading States in 3 variants */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-muted uppercase tracking-wider">
              LoadingState Skeletons
            </span>
            <div className="flex items-center gap-2">
              {(['card', 'table', 'list'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveLoadingTab(tab)}
                  className={`px-3 py-1 rounded-none text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer border ${
                    activeLoadingTab === tab
                      ? 'bg-text text-bg border-border-strong font-bold'
                      : 'bg-surface text-muted hover:text-text border-border'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <LoadingState variant={activeLoadingTab} count={3} />
        </div>
      </section>
    </div>
  );
};
