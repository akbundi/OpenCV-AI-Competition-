/**
 * AI Inspection Assistant types — conversation models, message kinds, and quick actions.
 */

import type { WorkflowStage } from './agent';

export type ChatRole = 'user' | 'agent' | 'system';

export type ChatMessageKind =
  | 'text'            // plain text bubble
  | 'decision'        // Agent Decision card
  | 'detection'       // Damage Detected card
  | 'confidence'      // Confidence bar card
  | 'evidence'        // Inline evidence preview
  | 'evidence-strip'  // Multi-frame evidence strip
  | 'severity'        // Severity Assessment card
  | 'report'          // Report preview + approval buttons
  | 'error';          // Error state card

export interface ChatMessage {
  id: string;
  role: ChatRole;
  kind: ChatMessageKind;
  timestamp: string;      // ISO
  text?: string;          // for kind === 'text'
  inspectionId?: string;  // link to underlying inspection
  stage?: WorkflowStage;  // for kind === 'decision'
  meta?: Record<string, unknown>;  // kind-specific payload
}

export interface AssistantQuickAction {
  id: string;
  label: string;          // e.g. "Show Evidence"
  prompt: string;         // e.g. "Show me the evidence."
}
