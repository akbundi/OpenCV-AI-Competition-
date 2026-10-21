/**
 * Maintenance report types and approval lifecycle.
 */

import type { DamageClass, Severity } from './inspection';

export type ReportStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Report {
  id: string;
  inspectionId: string;
  damageClass: DamageClass;
  severity: Severity;
  confidence: number;
  persistenceFrames: number;
  roadPosition: string;
  recommendation: string;
  status: ReportStatus;
  reviewerNote?: string;
  approvedAt?: string;
  rejectedReason?: string;
}
