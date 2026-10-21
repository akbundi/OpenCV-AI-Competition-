/**
 * API layer — typed function signatures for all 15 canonical endpoints.
 * Each checks USE_MOCK from config.ts and delegates to MockService when true.
 */

import type {
  InspectionStatus,
  AgentState,
} from '../types/agent';
import type {
  Inspection,
  InspectionSummary,
  InspectionInputType,
  Detection,
  Severity,
  DamageClass,
} from '../types/inspection';
import type { FrameEvidence } from '../types/evidence';
import type { Report } from '../types/report';
import type { BenchmarkResult, ModelEvaluation } from '../types/evaluation';
import type { ChatMessage } from '../types/chat';
import { USE_MOCK, API_BASE_URL } from '../config';
import { MockService } from './mock/mockService';
import { ChatService } from './mock/chatService';

export async function uploadImage(file: File): Promise<{ uploadId: string }> {
  if (USE_MOCK) return MockService.uploadImage(file);
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE_URL}/upload/image`, { method: 'POST', body: formData });
  if (!res.ok) throw new Error(`Upload failed: ${res.statusText}`);
  return res.json();
}

export async function uploadVideo(file: File): Promise<{ uploadId: string }> {
  if (USE_MOCK) return MockService.uploadVideo(file);
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE_URL}/upload/video`, { method: 'POST', body: formData });
  if (!res.ok) throw new Error(`Upload failed: ${res.statusText}`);
  return res.json();
}

export async function startInspection(
  uploadId: string,
  type: InspectionInputType,
): Promise<{ inspectionId: string }> {
  if (USE_MOCK) return MockService.startInspection(uploadId, type);
  const res = await fetch(`${API_BASE_URL}/inspections`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uploadId, type }),
  });
  if (!res.ok) throw new Error(`Start inspection failed: ${res.statusText}`);
  return res.json();
}

export async function getInspectionStatus(id: string): Promise<InspectionStatus> {
  if (USE_MOCK) return MockService.getInspectionStatus(id);
  const res = await fetch(`${API_BASE_URL}/inspections/${id}/status`);
  if (!res.ok) throw new Error(`Status error: ${res.statusText}`);
  const data = await res.json();
  return data.status;
}

export async function getAgentState(id: string): Promise<AgentState> {
  if (USE_MOCK) return MockService.getAgentState(id);
  const res = await fetch(`${API_BASE_URL}/inspections/${id}/agent-state`);
  if (!res.ok) throw new Error(`Agent state error: ${res.statusText}`);
  return res.json();
}

export async function getDetectionResults(id: string): Promise<Detection[]> {
  if (USE_MOCK) return MockService.getDetectionResults(id);
  const res = await fetch(`${API_BASE_URL}/inspections/${id}/detections`);
  if (!res.ok) throw new Error(`Detection results error: ${res.statusText}`);
  return res.json();
}

export async function getFrameEvidence(id: string): Promise<FrameEvidence[]> {
  if (USE_MOCK) return MockService.getFrameEvidence(id);
  const res = await fetch(`${API_BASE_URL}/inspections/${id}/evidence`);
  if (!res.ok) throw new Error(`Evidence error: ${res.statusText}`);
  return res.json();
}

export async function getSeverity(
  id: string,
): Promise<{ severity: Severity; confidence: number; persistenceFrames: number; location: string }> {
  if (USE_MOCK) return MockService.getSeverity(id);
  const res = await fetch(`${API_BASE_URL}/inspections/${id}/severity`);
  if (!res.ok) throw new Error(`Severity error: ${res.statusText}`);
  return res.json();
}

export async function getReport(id: string): Promise<Report> {
  if (USE_MOCK) return MockService.getReport(id);
  const res = await fetch(`${API_BASE_URL}/inspections/${id}/report`);
  if (!res.ok) throw new Error(`Report error: ${res.statusText}`);
  return res.json();
}

export async function approveReport(id: string, note?: string): Promise<Report> {
  if (USE_MOCK) return MockService.approveReport(id, note);
  const res = await fetch(`${API_BASE_URL}/inspections/${id}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ note }),
  });
  if (!res.ok) throw new Error(`Approval failed: ${res.statusText}`);
  return res.json();
}

export async function rejectReport(id: string, reason: string): Promise<Report> {
  if (USE_MOCK) return MockService.rejectReport(id, reason);
  const res = await fetch(`${API_BASE_URL}/inspections/${id}/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason }),
  });
  if (!res.ok) throw new Error(`Rejection failed: ${res.statusText}`);
  return res.json();
}

export async function getInspectionHistory(filters?: {
  inputType?: InspectionInputType;
  damageClass?: DamageClass;
  severity?: Severity;
  status?: InspectionStatus;
}): Promise<InspectionSummary[]> {
  if (USE_MOCK) return MockService.getInspectionHistory(filters);
  const query = new URLSearchParams(filters as Record<string, string>).toString();
  const res = await fetch(`${API_BASE_URL}/inspections?${query}`);
  if (!res.ok) throw new Error(`History error: ${res.statusText}`);
  return res.json();
}

export async function getInspectionDetail(id: string): Promise<Inspection> {
  if (USE_MOCK) return MockService.getInspectionDetail(id);
  const res = await fetch(`${API_BASE_URL}/inspections/${id}`);
  if (!res.ok) throw new Error(`Inspection detail error: ${res.statusText}`);
  return res.json();
}

export async function getBenchmarkResults(): Promise<BenchmarkResult> {
  if (USE_MOCK) return MockService.getBenchmarkResults();
  const res = await fetch(`${API_BASE_URL}/benchmarks`);
  if (!res.ok) throw new Error(`Benchmark error: ${res.statusText}`);
  return res.json();
}

export async function getModelEvaluation(): Promise<ModelEvaluation> {
  if (USE_MOCK) return MockService.getModelEvaluation();
  const res = await fetch(`${API_BASE_URL}/evaluation`);
  if (!res.ok) throw new Error(`Model evaluation error: ${res.statusText}`);
  return res.json();
}

export async function sendAgentQuery(
  inspectionId: string,
  message: string,
): Promise<ChatMessage[]> {
  if (USE_MOCK) return ChatService.sendAgentQuery(inspectionId, message);
  const res = await fetch(`${API_BASE_URL}/inspections/${inspectionId}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) throw new Error(`Agent query failed: ${res.statusText}`);
  return res.json();
}

export async function getConversation(
  inspectionId: string,
): Promise<ChatMessage[]> {
  if (USE_MOCK) return ChatService.getConversation(inspectionId);
  const res = await fetch(`${API_BASE_URL}/inspections/${inspectionId}/chat`);
  if (!res.ok) throw new Error(`Get conversation failed: ${res.statusText}`);
  return res.json();
}

export async function clearConversation(
  inspectionId: string,
): Promise<void> {
  if (USE_MOCK) return ChatService.clearConversation(inspectionId);
  const res = await fetch(`${API_BASE_URL}/inspections/${inspectionId}/chat`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(`Clear conversation failed: ${res.statusText}`);
}
