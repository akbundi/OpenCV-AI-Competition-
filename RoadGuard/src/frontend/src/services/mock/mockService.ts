/**
 * Mock service — in-memory store that the mock API mutates.
 * Deterministic: same state sequence every run.
 * State machine advancement is time-based using MOCK_STEP_MS.
 */

import type {
  InspectionStatus,
  WorkflowStage,
  WorkflowStageStatus,
  AgentEvent,
  AgentState,
} from '../../types/agent';
import { canTransition } from '../../types/agent';
import type {
  Inspection,
  InspectionSummary,
  InspectionInputType,
  Detection,
  Severity,
} from '../../types/inspection';
import type { FrameEvidence } from '../../types/evidence';
import type { Report } from '../../types/report';
import type { BenchmarkResult, ModelEvaluation } from '../../types/evaluation';
import { MOCK_STEP_MS } from '../../config';
import {
  HISTORICAL_INSPECTIONS,
  MOCK_REPORTS,
  SAMPLE_BENCHMARK_RESULT,
  SAMPLE_MODEL_EVALUATION,
} from './mockData';
import {
  DEMO_EVIDENCE_FRAMES,
  DEMO_INSPECTION,
  DEMO_REPORT,
} from './demoInspection';

// ---------------------------------------------------------------------------
// In-memory stores
// ---------------------------------------------------------------------------

const inspections = new Map<string, Inspection>();
const reports = new Map<string, Report>();

// Seed stores from historical data
HISTORICAL_INSPECTIONS.forEach((insp) => {
  inspections.set(insp.id, JSON.parse(JSON.stringify(insp)));
});
if (inspections.has('RG-0001')) {
  const legacyDemo = JSON.parse(JSON.stringify(inspections.get('RG-0001')!));
  legacyDemo.id = 'INSP-2026-0881';
  inspections.set('INSP-2026-0881', legacyDemo);
}
MOCK_REPORTS.forEach((rep) => {
  reports.set(rep.inspectionId, JSON.parse(JSON.stringify(rep)));
  reports.set(rep.id, JSON.parse(JSON.stringify(rep)));
});
if (reports.has('RG-0001')) {
  const legacyRep = JSON.parse(JSON.stringify(reports.get('RG-0001')!));
  legacyRep.inspectionId = 'INSP-2026-0881';
  reports.set('INSP-2026-0881', legacyRep);
}

// ---------------------------------------------------------------------------
// Simulation state
// ---------------------------------------------------------------------------

interface SimulationState {
  inspectionId: string;
  startedAt: number;
  lastStepIndex: number;
}

const simulations = new Map<string, SimulationState>();

// Deterministic simulation step sequence
interface SimStep {
  status: InspectionStatus;
  stage: WorkflowStage;
  level: AgentEvent['level'];
  message: string;
  confidence?: number;
  framesChecked?: number;
  persistenceFrames?: number;
  addEvidence?: number; // index into DEMO_EVIDENCE_FRAMES to add up to
}

const SIMULATION_STEPS: SimStep[] = [
  {
    status: 'PROCESSING',
    stage: 'OBSERVE',
    level: 'info',
    message: 'Preprocessing frames with OpenCV 5 ARM NEON accelerated pipeline.',
  },
  {
    status: 'OBSERVING',
    stage: 'OBSERVE',
    level: 'info',
    message: 'Scanning input for pavement surface anomalies.',
  },
  {
    status: 'DETECTING',
    stage: 'VERIFY',
    level: 'action',
    message: 'Candidate damage anomaly detected on initial frame. Confidence: 62%.',
    confidence: 62,
    framesChecked: 1,
    addEvidence: 1,
  },
  {
    status: 'VERIFYING',
    stage: 'VERIFY',
    level: 'warning',
    message: 'Confidence 62% below autonomous threshold (75%). Requesting verification.',
  },
  {
    status: 'REINSPECTING',
    stage: 'RECHECK',
    level: 'action',
    message: 'Initiating temporal re-inspection across consecutive frames.',
  },
  {
    status: 'DETECTING',
    stage: 'RECHECK',
    level: 'info',
    message: 'Frames 2-4 analyzed. Confidence climbing: 74% → 82% → 88%.',
    confidence: 88,
    framesChecked: 4,
    persistenceFrames: 4,
    addEvidence: 4,
  },
  {
    status: 'VERIFYING',
    stage: 'RECHECK',
    level: 'success',
    message: 'Damage persistence confirmed across 7/7 consecutive frames. Confidence: 91%.',
    confidence: 91,
    framesChecked: 7,
    persistenceFrames: 7,
    addEvidence: 7,
  },
  {
    status: 'ASSESSING',
    stage: 'ASSESS',
    level: 'alert',
    message: 'Severity assessed: HIGH. Cavity in active wheelpath poses blowout risk.',
  },
  {
    status: 'REPORT_GENERATING',
    stage: 'REPORT',
    level: 'info',
    message: 'Compiling evidence packet and drafting maintenance work order.',
  },
  {
    status: 'WAITING_FOR_APPROVAL',
    stage: 'HUMAN_REVIEW',
    level: 'warning',
    message: 'Report generated. Human approval required before maintenance dispatch.',
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mapStatusToStage(status: InspectionStatus): WorkflowStage {
  switch (status) {
    case 'UPLOADED':
    case 'PROCESSING':
    case 'OBSERVING':
      return 'OBSERVE';
    case 'DETECTING':
    case 'VERIFYING':
      return 'VERIFY';
    case 'REINSPECTING':
      return 'RECHECK';
    case 'ASSESSING':
      return 'ASSESS';
    case 'REPORT_GENERATING':
      return 'REPORT';
    case 'WAITING_FOR_APPROVAL':
    case 'APPROVED':
    case 'REJECTED':
    case 'CLOSED':
      return 'HUMAN_REVIEW';
    default:
      return 'OBSERVE';
  }
}

function buildWorkflowStages(
  currentStage: WorkflowStage,
  status: InspectionStatus,
): Record<WorkflowStage, WorkflowStageStatus> {
  const order: WorkflowStage[] = ['OBSERVE', 'VERIFY', 'RECHECK', 'ASSESS', 'REPORT', 'HUMAN_REVIEW'];
  const currentIdx = order.indexOf(currentStage);

  const result = {} as Record<WorkflowStage, WorkflowStageStatus>;
  for (let i = 0; i < order.length; i++) {
    if (i < currentIdx) {
      result[order[i]] = 'COMPLETED';
    } else if (i === currentIdx) {
      if (status === 'APPROVED' || status === 'CLOSED') {
        result[order[i]] = 'COMPLETED';
      } else if (status === 'REJECTED') {
        result[order[i]] = 'FAILED';
      } else {
        result[order[i]] = 'RUNNING';
      }
    } else {
      result[order[i]] = 'PENDING';
    }
  }
  return result;
}

function advanceSimulation(sim: SimulationState): void {
  const elapsed = Date.now() - sim.startedAt;
  const targetStep = Math.min(
    Math.floor(elapsed / MOCK_STEP_MS),
    SIMULATION_STEPS.length - 1,
  );

  if (targetStep <= sim.lastStepIndex) return;

  const insp = inspections.get(sim.inspectionId);
  if (!insp) return;

  // Apply each step from last to target
  for (let i = sim.lastStepIndex + 1; i <= targetStep; i++) {
    const step = SIMULATION_STEPS[i];

    // Validate transition
    if (!canTransition(insp.status, step.status)) continue;

    insp.status = step.status;
    if (step.confidence !== undefined) insp.confidence = step.confidence;
    if (step.framesChecked !== undefined) insp.framesChecked = step.framesChecked;
    if (step.persistenceFrames !== undefined) insp.persistenceFrames = step.persistenceFrames;

    // Add evidence frames progressively
    if (step.addEvidence !== undefined) {
      insp.evidence = DEMO_EVIDENCE_FRAMES.slice(0, step.addEvidence);
      insp.detections = insp.evidence
        .filter((f): f is FrameEvidence & { detection: Detection } => f.detection !== undefined)
        .map((f) => f.detection);
    }

    // Append event
    insp.events.push({
      id: `evt-sim-${sim.inspectionId}-${i}`,
      timestamp: new Date(sim.startedAt + i * MOCK_STEP_MS).toLocaleTimeString('en-US', { hour12: false }),
      level: step.level,
      stage: step.stage,
      message: step.message,
    });

    // Generate report at WAITING_FOR_APPROVAL
    if (step.status === 'WAITING_FOR_APPROVAL') {
      const reportNum = sim.inspectionId.startsWith('RG-') ? sim.inspectionId.slice(3) : sim.inspectionId;
      const report: Report = {
        id: `REP-${reportNum}`,
        inspectionId: sim.inspectionId,
        damageClass: insp.damageClass,
        severity: insp.severity,
        confidence: insp.confidence,
        persistenceFrames: insp.persistenceFrames,
        roadPosition: insp.location,
        recommendation: 'Immediate cold-mix asphalt patch within 4 hours.',
        status: 'PENDING',
      };
      reports.set(sim.inspectionId, report);
      reports.set(report.id, report);
      insp.reportId = report.id;
      simulations.delete(sim.inspectionId);
    }
  }

  sim.lastStepIndex = targetStep;
}

let nextUploadId = 1;

function getNextInspectionId(): string {
  let maxId = 0;
  for (const id of inspections.keys()) {
    const match = id.match(/^RG-(\d+)$/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxId) maxId = num;
    }
  }
  const nextNum = maxId + 1;
  return `RG-${String(nextNum).padStart(4, '0')}`;
}

// ---------------------------------------------------------------------------
// Mock Service — implements all 15 canonical API methods
// ---------------------------------------------------------------------------

export const MockService = {
  async uploadImage(_file: File): Promise<{ uploadId: string }> {
    await delay(200);
    return { uploadId: `up-img-${nextUploadId++}` };
  },

  async uploadVideo(_file: File): Promise<{ uploadId: string }> {
    await delay(300);
    return { uploadId: `up-vid-${nextUploadId++}` };
  },

  async startInspection(uploadId: string, type: InspectionInputType): Promise<{ inspectionId: string }> {
    await delay(200);
    const inspectionId = getNextInspectionId();

    const newInspection: Inspection = {
      id: inspectionId,
      createdAt: new Date().toISOString(),
      inputType: type,
      damageClass: 'D40',
      severity: 'HIGH',
      confidence: 0,
      framesChecked: 0,
      status: 'UPLOADED',
      evidence: [],
      detections: [],
      totalFrames: 7,
      persistenceFrames: 0,
      location: 'Route 405 Northbound — Mile 24.8, Lane 2',
      events: [
        {
          id: `evt-sim-${inspectionId}-init`,
          timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
          level: 'info',
          stage: 'OBSERVE',
          message: `Upload ${uploadId} received. Queued for processing.`,
        },
      ],
    };

    inspections.set(inspectionId, newInspection);

    simulations.set(inspectionId, {
      inspectionId,
      startedAt: Date.now(),
      lastStepIndex: -1,
    });

    return { inspectionId };
  },

  async getInspectionStatus(id: string): Promise<InspectionStatus> {
    await delay(80);
    const sim = simulations.get(id);
    if (sim) advanceSimulation(sim);

    let insp = inspections.get(id);
    if (!insp) {
      console.warn(`[MockService] Inspection ID "${id}" not found. Falling back to RG-0001.`);
      insp = inspections.get('RG-0001') || DEMO_INSPECTION;
    }
    return insp.status;
  },

  async getAgentState(id: string): Promise<AgentState> {
    await delay(80);
    const sim = simulations.get(id);
    if (sim) advanceSimulation(sim);

    let insp = inspections.get(id);
    if (!insp) {
      console.warn(`[MockService] Inspection ID "${id}" not found. Falling back to RG-0001.`);
      insp = inspections.get('RG-0001') || DEMO_INSPECTION;
    }

    const currentStage = mapStatusToStage(insp.status);
    return {
      inspectionId: insp.id,
      status: insp.status,
      workflowStages: buildWorkflowStages(currentStage, insp.status),
      currentStage,
      events: insp.events,
    };
  },

  async getDetectionResults(id: string): Promise<Detection[]> {
    await delay(80);
    let insp = inspections.get(id);
    if (!insp) {
      console.warn(`[MockService] Inspection ID "${id}" not found. Falling back to RG-0001.`);
      insp = inspections.get('RG-0001') || DEMO_INSPECTION;
    }
    return insp.detections;
  },

  async getFrameEvidence(id: string): Promise<FrameEvidence[]> {
    await delay(80);
    let insp = inspections.get(id);
    if (!insp) {
      console.warn(`[MockService] Inspection ID "${id}" not found. Falling back to RG-0001.`);
      insp = inspections.get('RG-0001') || DEMO_INSPECTION;
    }
    return insp.evidence;
  },

  async getSeverity(id: string): Promise<{ severity: Severity; confidence: number; persistenceFrames: number; location: string }> {
    await delay(80);
    let insp = inspections.get(id);
    if (!insp) {
      console.warn(`[MockService] Inspection ID "${id}" not found. Falling back to RG-0001.`);
      insp = inspections.get('RG-0001') || DEMO_INSPECTION;
    }
    return {
      severity: insp.severity,
      confidence: insp.confidence,
      persistenceFrames: insp.persistenceFrames,
      location: insp.location,
    };
  },

  async getReport(id: string): Promise<Report> {
    await delay(80);
    let report = reports.get(id) || reports.get('RG-0001') || reports.get('REP-0001');
    if (!report) {
      console.warn(`[MockService] Report for inspection ID "${id}" not found. Falling back to DEMO_REPORT.`);
      report = DEMO_REPORT;
    }
    return JSON.parse(JSON.stringify(report));
  },

  async approveReport(id: string, note?: string): Promise<Report> {
    await delay(200);
    const report = reports.get(id);
    if (!report) throw new Error(`Report for inspection ${id} not found`);

    report.status = 'APPROVED';
    report.approvedAt = new Date().toISOString();
    if (note) report.reviewerNote = note;

    const insp = inspections.get(id);
    if (insp && canTransition(insp.status, 'APPROVED')) {
      insp.status = 'APPROVED';
      insp.events.push({
        id: `evt-approve-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
        level: 'success',
        stage: 'HUMAN_REVIEW',
        message: `HUMAN APPROVED: Work order authorized. ${note || ''}`.trim(),
      });
    }

    return JSON.parse(JSON.stringify(report));
  },

  async rejectReport(id: string, reason: string): Promise<Report> {
    await delay(200);
    const report = reports.get(id);
    if (!report) throw new Error(`Report for inspection ${id} not found`);

    report.status = 'REJECTED';
    report.rejectedReason = reason;

    const insp = inspections.get(id);
    if (insp && canTransition(insp.status, 'REJECTED')) {
      insp.status = 'REJECTED';
      insp.events.push({
        id: `evt-reject-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
        level: 'alert',
        stage: 'HUMAN_REVIEW',
        message: `HUMAN REJECTED: ${reason}`,
      });
    }

    return JSON.parse(JSON.stringify(report));
  },

  async getInspectionHistory(filters?: {
    inputType?: InspectionInputType;
    damageClass?: string;
    severity?: string;
    status?: string;
  }): Promise<InspectionSummary[]> {
    await delay(120);
    let all = Array.from(inspections.values()).filter((i) => i.id !== 'INSP-2026-0881');

    if (filters) {
      if (filters.inputType) {
        all = all.filter((i) => i.inputType === filters.inputType);
      }
      if (filters.damageClass) {
        all = all.filter((i) => i.damageClass === filters.damageClass);
      }
      if (filters.severity) {
        all = all.filter((i) => i.severity === filters.severity);
      }
      if (filters.status) {
        all = all.filter((i) => i.status === filters.status);
      }
    }

    return all.map((i) => ({
      id: i.id,
      createdAt: i.createdAt,
      inputType: i.inputType,
      damageClass: i.damageClass,
      severity: i.severity,
      confidence: i.confidence,
      framesChecked: i.framesChecked,
      status: i.status,
    }));
  },

  async getInspectionDetail(id: string): Promise<Inspection> {
    await delay(100);
    const sim = simulations.get(id);
    if (sim) advanceSimulation(sim);

    let insp = inspections.get(id);
    if (!insp) {
      console.warn(`[MockService] Inspection ID "${id}" not found. Falling back to RG-0001.`);
      insp = inspections.get('RG-0001') || DEMO_INSPECTION;
    }
    return JSON.parse(JSON.stringify(insp));
  },

  async getBenchmarkResults(): Promise<BenchmarkResult> {
    await delay(100);
    return SAMPLE_BENCHMARK_RESULT;
  },

  async getModelEvaluation(): Promise<ModelEvaluation> {
    await delay(100);
    return SAMPLE_MODEL_EVALUATION;
  },
};

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
