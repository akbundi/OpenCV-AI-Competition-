/**
 * Agent lifecycle types, state machine transitions, and workflow definitions.
 */

export type InspectionStatus =
  | 'UPLOADED'
  | 'PROCESSING'
  | 'OBSERVING'
  | 'DETECTING'
  | 'VERIFYING'
  | 'REINSPECTING'
  | 'ASSESSING'
  | 'REPORT_GENERATING'
  | 'WAITING_FOR_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'CLOSED';

/**
 * Valid state transitions mapping — authoritative source for the inspection
 * state machine. Components must call canTransition() rather than hardcoding.
 */
export const STATE_TRANSITIONS: Record<InspectionStatus, InspectionStatus[]> = {
  UPLOADED: ['PROCESSING'],
  PROCESSING: ['OBSERVING'],
  OBSERVING: ['DETECTING'],
  DETECTING: ['VERIFYING', 'REINSPECTING', 'ASSESSING'],
  VERIFYING: ['REINSPECTING', 'ASSESSING', 'DETECTING'],
  REINSPECTING: ['DETECTING', 'VERIFYING', 'ASSESSING'],
  ASSESSING: ['REPORT_GENERATING'],
  REPORT_GENERATING: ['WAITING_FOR_APPROVAL'],
  WAITING_FOR_APPROVAL: ['APPROVED', 'REJECTED'],
  APPROVED: ['CLOSED'],
  REJECTED: ['CLOSED'],
  CLOSED: [],
};

/**
 * Validates whether a state transition is permitted by the agent state machine.
 */
export function canTransition(from: InspectionStatus, to: InspectionStatus): boolean {
  return STATE_TRANSITIONS[from].includes(to);
}

export type WorkflowStage =
  | 'OBSERVE'
  | 'VERIFY'
  | 'RECHECK'
  | 'ASSESS'
  | 'REPORT'
  | 'HUMAN_REVIEW';

export type WorkflowStageStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';

export interface AgentEvent {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'success' | 'action' | 'alert';
  message: string;
  stage?: WorkflowStage;
  meta?: Record<string, unknown>;
}

export interface AgentState {
  inspectionId: string;
  status: InspectionStatus;
  workflowStages: Record<WorkflowStage, WorkflowStageStatus>;
  currentStage: WorkflowStage;
  events: AgentEvent[];
}

export function mapStatusToWorkflowStage(
  status: InspectionStatus
): WorkflowStage {
  switch (status) {
    case 'UPLOADED':
    case 'PROCESSING':
      return 'OBSERVE';
    case 'OBSERVING':
    case 'DETECTING':
      return 'VERIFY';
    case 'VERIFYING':
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
  }
}

