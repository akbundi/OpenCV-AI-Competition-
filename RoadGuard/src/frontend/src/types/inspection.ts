/**
 * Inspection domain types: damage classification, detection, and inspection lifecycle.
 */

import type { InspectionStatus, AgentEvent } from './agent';
import type { FrameEvidence } from './evidence';

export type DamageClass = 'D00' | 'D10' | 'D20' | 'D40';

export interface DamageClassMeta {
  code: DamageClass;
  label: string;
  description: string;
}

export const DAMAGE_CLASSES: Record<DamageClass, DamageClassMeta> = {
  D00: {
    code: 'D00',
    label: 'Longitudinal Crack',
    description: 'Cracks running parallel to the direction of traffic travel along pavement joints or wheel paths',
  },
  D10: {
    code: 'D10',
    label: 'Transverse Crack',
    description: 'Thermal or shrinkage cracks perpendicular to the centerline of traffic travel',
  },
  D20: {
    code: 'D20',
    label: 'Alligator Crack',
    description: 'Interconnected series of fatigue cracks forming a pattern resembling reptile scales',
  },
  D40: {
    code: 'D40',
    label: 'Pothole',
    description: 'Bowl-shaped structural void in pavement surface with sharp edges and exposed aggregate',
  },
};

export const DAMAGE_CLASS_META = DAMAGE_CLASSES;

export type Severity = 'LOW' | 'MEDIUM' | 'HIGH';

export type InspectionInputType = 'IMAGE' | 'VIDEO';

export interface Detection {
  id: string;
  damageClass: DamageClass;
  confidence: number;
  bbox: { x: number; y: number; w: number; h: number };
  frameNumber?: number;
}

export interface InspectionSummary {
  id: string;
  createdAt: string;
  inputType: InspectionInputType;
  damageClass: DamageClass;
  severity: Severity;
  confidence: number;
  framesChecked: number;
  status: InspectionStatus;
}

export interface Inspection extends InspectionSummary {
  reportId?: string;
  evidence: FrameEvidence[];
  detections: Detection[];
  totalFrames: number;
  persistenceFrames: number;
  location: string;
  events: AgentEvent[];
}
