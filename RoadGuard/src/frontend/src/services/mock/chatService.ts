/**
 * Chat service — mock conversational engine grounded in the current AgentState.
 * Deterministic responses based on keyword matching.
 */

import type { ChatMessage } from '../../types/chat';
import { MockService } from './mockService';

let nextMsgId = 1;
function genId(): string {
  return `msg-${Date.now()}-${nextMsgId++}`;
}

const conversations = new Map<string, ChatMessage[]>();

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const ChatService = {
  async getConversation(inspectionId: string): Promise<ChatMessage[]> {
    await delay(50);
    const id = inspectionId || 'RG-0001';
    return conversations.get(id) || [];
  },

  async clearConversation(inspectionId: string): Promise<void> {
    await delay(50);
    const id = inspectionId || 'RG-0001';
    conversations.delete(id);
  },

  async sendAgentQuery(
    inspectionId: string,
    message: string
  ): Promise<ChatMessage[]> {
    await delay(350); // Simulate network & agent reasoning delay

    const effectiveId = inspectionId || 'RG-0001';
    const history = conversations.get(effectiveId) || [];

    const userMsg: ChatMessage = {
      id: genId(),
      role: 'user',
      kind: 'text',
      timestamp: new Date().toISOString(),
      text: message,
      inspectionId: effectiveId,
    };

    history.push(userMsg);

    // Fetch live state from MockService
    const [insp, agentState, evidence, severityData, report] = await Promise.all([
      MockService.getInspectionDetail(effectiveId),
      MockService.getAgentState(effectiveId),
      MockService.getFrameEvidence(effectiveId),
      MockService.getSeverity(effectiveId),
      MockService.getReport(effectiveId).catch(() => null),
    ]);

    const lower = message.toLowerCase().trim();
    const newResponses: ChatMessage[] = [];

    // Keyword matching logic
    if (lower.includes('approve')) {
      // Trigger approval in mock state machine
      const approvedReport = await MockService.approveReport(effectiveId);

      newResponses.push({
        id: genId(),
        role: 'agent',
        kind: 'text',
        timestamp: new Date().toISOString(),
        text: `Inspection #${effectiveId} maintenance brief has been approved and promoted for municipal sign-off.`,
        inspectionId: effectiveId,
        stage: agentState.currentStage,
      });

      newResponses.push({
        id: genId(),
        role: 'agent',
        kind: 'report',
        timestamp: new Date().toISOString(),
        inspectionId: effectiveId,
        stage: 'HUMAN_REVIEW',
        meta: {
          report: approvedReport,
          inspection: insp,
        },
      });

      newResponses.push({
        id: genId(),
        role: 'system',
        kind: 'text',
        timestamp: new Date().toISOString(),
        text: '✓ REPORT APPROVED — Municipal work order certified and locked for contractor dispatch.',
        inspectionId: effectiveId,
      });
    } else if (lower.includes('reject')) {
      newResponses.push({
        id: genId(),
        role: 'agent',
        kind: 'text',
        timestamp: new Date().toISOString(),
        text: 'Inspection rejection logged. Please provide the technical deficiency reason to include in the engineering audit ledger.',
        inspectionId: effectiveId,
        stage: agentState.currentStage,
      });
    } else if (
      lower.includes('evidence') ||
      lower.includes('frame') ||
      lower.includes('show me the evidence') ||
      lower.includes('persistence') ||
      lower.includes('persist')
    ) {
      const confirmedCount = evidence.filter((f) => f.status === 'CONFIRMED' || f.status === 'DETECTED').length;

      newResponses.push({
        id: genId(),
        role: 'agent',
        kind: 'text',
        timestamp: new Date().toISOString(),
        text: `Multi-frame OpenCV 5 sensor telemetry across ${evidence.length} sequential frames. Distress persistence confirmed in ${confirmedCount} of ${evidence.length} frames.`,
        inspectionId: effectiveId,
        stage: agentState.currentStage,
      });

      newResponses.push({
        id: genId(),
        role: 'agent',
        kind: 'evidence-strip',
        timestamp: new Date().toISOString(),
        inspectionId: effectiveId,
        stage: agentState.currentStage,
        meta: {
          evidence,
          persistenceCount: confirmedCount || insp.persistenceFrames || evidence.length,
          totalFrames: evidence.length || 7,
          inspectionId: effectiveId,
        },
      });
    } else if (lower.includes('why') && lower.includes('re-inspect')) {
      newResponses.push({
        id: genId(),
        role: 'agent',
        kind: 'text',
        timestamp: new Date().toISOString(),
        text: 'Initial candidate confidence (62%) fell below the 75% autonomous threshold. RoadGuard engaged the RECHECK temporal buffer over consecutive frames to filter out transient shadows and confirm surface depth.',
        inspectionId: effectiveId,
        stage: agentState.currentStage,
      });
    } else if (lower.includes('why') && (lower.includes('severity') || lower.includes('severe'))) {
      newResponses.push({
        id: genId(),
        role: 'agent',
        kind: 'text',
        timestamp: new Date().toISOString(),
        text: `Severity is assessed as ${severityData.severity}. Multiple factors contributed: high depth indicator, continuous wheel-path location (${severityData.location || 'Lane 2'}), and persistent candidate detection across consecutive frames.`,
        inspectionId: effectiveId,
        stage: agentState.currentStage,
      });

      newResponses.push({
        id: genId(),
        role: 'agent',
        kind: 'severity',
        timestamp: new Date().toISOString(),
        inspectionId: effectiveId,
        stage: agentState.currentStage,
        meta: {
          damageType: 'Class D40 — Structural Pothole',
          confidence: severityData.confidence || insp.confidence,
          severity: severityData.severity,
          roadPosition: severityData.location || insp.location,
          persistenceFrames: severityData.persistenceFrames || insp.persistenceFrames || 7,
          recommendation: report?.recommendation || 'Mill and overlay 50mm asphalt patch within 48 hours.',
        },
      });
    } else if (lower.includes('confident') || lower.includes('confidence')) {
      const isPossible = insp.status === 'OBSERVING' || insp.status === 'DETECTING';

      newResponses.push({
        id: genId(),
        role: 'agent',
        kind: 'text',
        timestamp: new Date().toISOString(),
        text: `Current detection confidence is ${insp.confidence}%. The autonomous gate requires 75% persistence to verify pavement distress without human escalation.`,
        inspectionId: effectiveId,
        stage: agentState.currentStage,
      });

      newResponses.push({
        id: genId(),
        role: 'agent',
        kind: 'confidence',
        timestamp: new Date().toISOString(),
        inspectionId: effectiveId,
        stage: agentState.currentStage,
        meta: {
          confidence: insp.confidence,
          status: isPossible ? 'POSSIBLE' : 'CONFIRMED',
          inspectionId: effectiveId,
        },
      });
    } else if (lower.includes('pothole') || lower.includes('damage') || lower.includes('detect')) {
      newResponses.push({
        id: genId(),
        role: 'agent',
        kind: 'text',
        timestamp: new Date().toISOString(),
        text: `Primary distress identified: Class ${insp.damageClass} (Structural Pothole) with ${insp.confidence}% confidence. Detected at ${insp.location}.`,
        inspectionId: effectiveId,
        stage: agentState.currentStage,
      });

      newResponses.push({
        id: genId(),
        role: 'agent',
        kind: 'detection',
        timestamp: new Date().toISOString(),
        inspectionId: effectiveId,
        stage: agentState.currentStage,
        meta: {
          damageClass: insp.damageClass,
          confidence: insp.confidence,
          persistenceFrames: insp.persistenceFrames || 7,
          totalFrames: insp.totalFrames || 7,
          roadPosition: insp.location,
          severity: insp.severity,
          reportId: report?.id || 'REP-0001',
          inspectionId: effectiveId,
        },
      });
    } else if (lower.includes('report') || lower.includes('brief')) {
      newResponses.push({
        id: genId(),
        role: 'agent',
        kind: 'text',
        timestamp: new Date().toISOString(),
        text: `Municipal engineering brief for inspection #${effectiveId} is ready. Review technical recommendations and execute sign-off below.`,
        inspectionId: effectiveId,
        stage: agentState.currentStage,
      });

      newResponses.push({
        id: genId(),
        role: 'agent',
        kind: 'report',
        timestamp: new Date().toISOString(),
        inspectionId: effectiveId,
        stage: agentState.currentStage,
        meta: {
          report: report || {
            id: 'REP-0001',
            inspectionId: effectiveId,
            status: 'WAITING_FOR_APPROVAL',
            damageClass: insp.damageClass,
            severity: insp.severity,
            confidence: insp.confidence,
            roadPosition: insp.location,
            createdAt: insp.createdAt,
            recommendation: 'Cold planing and full-depth asphalt restoration required.',
            estimatedRepairCost: 4200,
            evidence: evidence,
          },
          inspectionId: effectiveId,
        },
      });
    } else {
      // Default fallback
      newResponses.push({
        id: genId(),
        role: 'agent',
        kind: 'text',
        timestamp: new Date().toISOString(),
        text: `Inspection #${effectiveId} is currently in stage [${agentState.currentStage}] with status [${insp.status}]. Confidence: ${insp.confidence}% across ${insp.framesChecked} analyzed frames. Ask me about evidence, confidence, damage class, or reports.`,
        inspectionId: effectiveId,
        stage: agentState.currentStage,
      });
    }

    history.push(...newResponses);
    conversations.set(effectiveId, history);

    return newResponses;
  },
};
