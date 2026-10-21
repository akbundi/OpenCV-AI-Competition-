/**
 * Frame-level evidence and persistence reporting types.
 */

import type { Detection } from './inspection';

export type FrameEvidenceStatus = 'NO_DAMAGE' | 'POSSIBLE' | 'DETECTED' | 'CONFIRMED';

export interface FrameEvidence {
  frameNumber: number;
  timestamp: string;
  imageUrl: string;
  annotatedUrl: string;
  confidence: number;
  status: FrameEvidenceStatus;
  detection?: Detection;
}

export interface PersistenceReport {
  frameCount: number;
  confirmationFrame: number;
  persistenceRatio: number;
}
