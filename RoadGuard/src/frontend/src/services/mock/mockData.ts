/**
 * Mock data store — 12+ historical inspections spanning all 12 statuses,
 * 4 damage classes, 3 severity levels, and varied dates/locations.
 * Sample BenchmarkResult and ModelEvaluation clearly marked as samples.
 */

import type { Inspection } from '../../types/inspection';
import type { Report } from '../../types/report';
import type { BenchmarkResult, ModelEvaluation } from '../../types/evaluation';
import { DEMO_INSPECTION, DEMO_REPORT } from './demoInspection';

// ---------------------------------------------------------------------------
// Report objects for inspections that have progressed past REPORT_GENERATING
// ---------------------------------------------------------------------------

export const MOCK_REPORTS: Report[] = [
  DEMO_REPORT,
  {
    id: 'REP-0002',
    inspectionId: 'RG-0002',
    damageClass: 'D00',
    severity: 'MEDIUM',
    confidence: 88,
    persistenceFrames: 1,
    roadPosition: 'Center Lane Seam',
    recommendation: 'Scheduled rubberized bitumen crack sealing within 30 days.',
    status: 'APPROVED',
    approvedAt: '2026-10-07T09:20:12Z',
    reviewerNote: 'Standard pavement separation along construction seam. Approved for routine maintenance.',
  },
  {
    id: 'REP-0003',
    inspectionId: 'RG-0003',
    damageClass: 'D10',
    severity: 'LOW',
    confidence: 84,
    persistenceFrames: 5,
    roadPosition: 'Right Shoulder',
    recommendation: 'Monitor during next quarterly inspection cycle.',
    status: 'APPROVED',
    approvedAt: '2026-10-06T17:50:33Z',
  },
  {
    id: 'REP-0004',
    inspectionId: 'RG-0004',
    damageClass: 'D20',
    severity: 'HIGH',
    confidence: 93,
    persistenceFrames: 8,
    roadPosition: 'Heavy Freight Track, Lane 1',
    recommendation: 'Full-depth pavement reclamation and base subgrade reinforcement required.',
    status: 'APPROVED',
    approvedAt: '2026-10-06T15:40:00Z',
    reviewerNote: 'Severe sub-base pumping evident. Priority 1 repair scheduled for Sunday closure.',
  },
  {
    id: 'REP-0005',
    inspectionId: 'RG-0005',
    damageClass: 'D40',
    severity: 'HIGH',
    confidence: 68,
    persistenceFrames: 0,
    roadPosition: 'Industrial Parkway near Gate 3',
    recommendation: 'Verify with secondary oblique angle pass.',
    status: 'REJECTED',
    rejectedReason: 'Human inspector confirmed tree branch shadow was mistaken for surface void. Pavement is intact.',
  },
  {
    id: 'REP-0006',
    inspectionId: 'RG-0006',
    damageClass: 'D10',
    severity: 'MEDIUM',
    confidence: 86,
    persistenceFrames: 6,
    roadPosition: 'Pier Abutment Joint',
    recommendation: 'Elastomeric joint seal replacement.',
    status: 'APPROVED',
    approvedAt: '2026-10-06T11:15:00Z',
  },
  {
    id: 'REP-0007',
    inspectionId: 'RG-0007',
    damageClass: 'D40',
    severity: 'MEDIUM',
    confidence: 85,
    persistenceFrames: 5,
    roadPosition: 'Center Lane',
    recommendation: 'Mill and patch 2m section within 72 hours.',
    status: 'PENDING',
  },
  {
    id: 'REP-0008',
    inspectionId: 'RG-0008',
    damageClass: 'D00',
    severity: 'LOW',
    confidence: 79,
    persistenceFrames: 1,
    roadPosition: 'Shoulder Curb Edge',
    recommendation: 'Annual survey cataloging. No immediate action.',
    status: 'APPROVED',
    approvedAt: '2026-10-05T14:25:00Z',
  },
  {
    id: 'REP-0009',
    inspectionId: 'RG-0009',
    damageClass: 'D20',
    severity: 'HIGH',
    confidence: 94,
    persistenceFrames: 7,
    roadPosition: 'Axle Load Zone, Container Terminal',
    recommendation: 'Heavy duty asphalt resurfacing.',
    status: 'APPROVED',
    approvedAt: '2026-10-05T11:02:00Z',
  },
  {
    id: 'REP-0010',
    inspectionId: 'RG-0010',
    damageClass: 'D40',
    severity: 'HIGH',
    confidence: 95,
    persistenceFrames: 1,
    roadPosition: 'Bus Wheel Track, Transit Mall Station 4',
    recommendation: 'Emergency concrete collar pour around manhole fixture.',
    status: 'APPROVED',
    approvedAt: '2026-10-04T18:30:00Z',
  },
  {
    id: 'REP-0011',
    inspectionId: 'RG-0011',
    damageClass: 'D00',
    severity: 'LOW',
    confidence: 61,
    persistenceFrames: 2,
    roadPosition: 'Reflective Lane Marking',
    recommendation: 'Discard false positive caused by specular water glare.',
    status: 'REJECTED',
    rejectedReason: 'Rain slick puddle surface reflection erroneously picked up as longitudinal fissure.',
  },
  {
    id: 'REP-0012',
    inspectionId: 'RG-0012',
    damageClass: 'D10',
    severity: 'LOW',
    confidence: 82,
    persistenceFrames: 1,
    roadPosition: 'Crossroad Joint',
    recommendation: 'Normal joint settling within tolerance.',
    status: 'APPROVED',
    approvedAt: '2026-10-04T09:15:00Z',
  },
];

// ---------------------------------------------------------------------------
// Historical inspections — 18 rows covering all 12 statuses
// ---------------------------------------------------------------------------

export const HISTORICAL_INSPECTIONS: Inspection[] = [
  // 1. RG-0001 — D40, HIGH, WAITING_FOR_APPROVAL (demo)
  DEMO_INSPECTION,

  // 2. RG-0002 — D00, MEDIUM, APPROVED
  {
    id: 'RG-0002',
    createdAt: '2026-10-07T09:14:22Z',
    inputType: 'IMAGE',
    damageClass: 'D00',
    severity: 'MEDIUM',
    confidence: 88,
    framesChecked: 1,
    status: 'APPROVED',
    reportId: 'REP-0002',
    evidence: [],
    detections: [
      { id: 'det-0002-1', damageClass: 'D00', confidence: 88, bbox: { x: 38, y: 35, w: 14, h: 48 }, frameNumber: 1 },
    ],
    totalFrames: 1,
    persistenceFrames: 1,
    location: 'Blvd 99 East, Intersection with 4th Ave',
    events: [],
  },

  // 3. RG-0003 — D10, LOW, APPROVED
  {
    id: 'RG-0003',
    createdAt: '2026-10-06T17:42:10Z',
    inputType: 'VIDEO',
    damageClass: 'D10',
    severity: 'LOW',
    confidence: 84,
    framesChecked: 5,
    status: 'APPROVED',
    reportId: 'REP-0003',
    evidence: [],
    detections: [
      { id: 'det-0003-1', damageClass: 'D10', confidence: 84, bbox: { x: 28, y: 58, w: 44, h: 12 }, frameNumber: 1 },
    ],
    totalFrames: 5,
    persistenceFrames: 5,
    location: 'Hwy 101 SB, Postmile 18.2',
    events: [],
  },

  // 4. RG-0004 — D20, HIGH, APPROVED
  {
    id: 'RG-0004',
    createdAt: '2026-10-06T15:10:04Z',
    inputType: 'VIDEO',
    damageClass: 'D20',
    severity: 'HIGH',
    confidence: 93,
    framesChecked: 8,
    status: 'APPROVED',
    reportId: 'REP-0004',
    evidence: [],
    detections: [],
    totalFrames: 8,
    persistenceFrames: 8,
    location: 'Metro Expressway Outer Loop KM 14.2',
    events: [],
  },

  // 5. RG-0005 — D40, HIGH, REJECTED (shadow false positive)
  {
    id: 'RG-0005',
    createdAt: '2026-10-06T13:22:15Z',
    inputType: 'IMAGE',
    damageClass: 'D40',
    severity: 'HIGH',
    confidence: 68,
    framesChecked: 1,
    status: 'REJECTED',
    reportId: 'REP-0005',
    evidence: [],
    detections: [],
    totalFrames: 1,
    persistenceFrames: 0,
    location: 'Industrial Parkway near Gate 3',
    events: [],
  },

  // 6. RG-0006 — D10, MEDIUM, CLOSED
  {
    id: 'RG-0006',
    createdAt: '2026-10-06T11:05:30Z',
    inputType: 'VIDEO',
    damageClass: 'D10',
    severity: 'MEDIUM',
    confidence: 86,
    framesChecked: 6,
    status: 'CLOSED',
    reportId: 'REP-0006',
    evidence: [],
    detections: [],
    totalFrames: 6,
    persistenceFrames: 6,
    location: 'Harbor Bridge North Pier Abutment',
    events: [],
  },

  // 7. RG-0007 — D40, MEDIUM, WAITING_FOR_APPROVAL
  {
    id: 'RG-0007',
    createdAt: '2026-10-05T16:30:22Z',
    inputType: 'VIDEO',
    damageClass: 'D40',
    severity: 'MEDIUM',
    confidence: 85,
    framesChecked: 6,
    status: 'WAITING_FOR_APPROVAL',
    reportId: 'REP-0007',
    evidence: [],
    detections: [],
    totalFrames: 6,
    persistenceFrames: 5,
    location: 'Airport Perimeter Loop Eastbound KM 2.1',
    events: [],
  },

  // 8. RG-0008 — D00, LOW, CLOSED
  {
    id: 'RG-0008',
    createdAt: '2026-10-05T14:18:00Z',
    inputType: 'IMAGE',
    damageClass: 'D00',
    severity: 'LOW',
    confidence: 79,
    framesChecked: 1,
    status: 'CLOSED',
    reportId: 'REP-0008',
    evidence: [],
    detections: [],
    totalFrames: 1,
    persistenceFrames: 1,
    location: 'University Ave, College Gate',
    events: [],
  },

  // 9. RG-0009 — D20, HIGH, REJECTED
  {
    id: 'RG-0009',
    createdAt: '2026-10-05T10:44:55Z',
    inputType: 'VIDEO',
    damageClass: 'D20',
    severity: 'HIGH',
    confidence: 94,
    framesChecked: 7,
    status: 'REJECTED',
    reportId: 'REP-0009',
    evidence: [],
    detections: [],
    totalFrames: 7,
    persistenceFrames: 7,
    location: 'Container Terminal Ramp West',
    events: [],
  },

  // 10. RG-0010 — D40, HIGH, APPROVED
  {
    id: 'RG-0010',
    createdAt: '2026-10-04T18:22:40Z',
    inputType: 'IMAGE',
    damageClass: 'D40',
    severity: 'HIGH',
    confidence: 95,
    framesChecked: 1,
    status: 'APPROVED',
    reportId: 'REP-0010',
    evidence: [],
    detections: [],
    totalFrames: 1,
    persistenceFrames: 1,
    location: 'Transit Mall Station 4',
    events: [],
  },

  // 11. RG-0011 — D00, LOW, REJECTED (rain false positive)
  {
    id: 'RG-0011',
    createdAt: '2026-10-04T14:15:33Z',
    inputType: 'VIDEO',
    damageClass: 'D00',
    severity: 'LOW',
    confidence: 61,
    framesChecked: 6,
    status: 'REJECTED',
    reportId: 'REP-0011',
    evidence: [],
    detections: [],
    totalFrames: 6,
    persistenceFrames: 2,
    location: 'Skyline Bypass North',
    events: [],
  },

  // 12. RG-0012 — D10, LOW, CLOSED
  {
    id: 'RG-0012',
    createdAt: '2026-10-04T09:05:12Z',
    inputType: 'IMAGE',
    damageClass: 'D10',
    severity: 'LOW',
    confidence: 82,
    framesChecked: 1,
    status: 'CLOSED',
    reportId: 'REP-0012',
    evidence: [],
    detections: [],
    totalFrames: 1,
    persistenceFrames: 1,
    location: 'Greenbelt Mile 3',
    events: [],
  },

  // 13. RG-0013 — D20, MEDIUM, REPORT_GENERATING (in-progress)
  {
    id: 'RG-0013',
    createdAt: '2026-10-07T11:30:00Z',
    inputType: 'VIDEO',
    damageClass: 'D20',
    severity: 'MEDIUM',
    confidence: 87,
    framesChecked: 6,
    status: 'REPORT_GENERATING',
    evidence: [],
    detections: [],
    totalFrames: 6,
    persistenceFrames: 6,
    location: 'Riverside Drive, KM 8.4',
    events: [
      { id: 'evt-0013-1', timestamp: '11:30:02', level: 'info', stage: 'REPORT', message: 'Compiling evidence packet for alligator cracking assessment.' },
    ],
  },

  // 14. RG-0014 — D00, LOW, ASSESSING (in-progress)
  {
    id: 'RG-0014',
    createdAt: '2026-10-07T12:00:00Z',
    inputType: 'IMAGE',
    damageClass: 'D00',
    severity: 'LOW',
    confidence: 76,
    framesChecked: 1,
    status: 'ASSESSING',
    evidence: [],
    detections: [
      { id: 'det-0014-1', damageClass: 'D00', confidence: 76, bbox: { x: 30, y: 40, w: 10, h: 45 }, frameNumber: 1 },
    ],
    totalFrames: 1,
    persistenceFrames: 1,
    location: 'Commerce Blvd, Median Strip',
    events: [
      { id: 'evt-0014-1', timestamp: '12:00:03', level: 'info', stage: 'ASSESS', message: 'Dimensional assessment: hairline longitudinal crack in median.' },
    ],
  },

  // 15. RG-0015 — D10, LOW, DETECTING (in-progress)
  {
    id: 'RG-0015',
    createdAt: '2026-10-07T13:15:00Z',
    inputType: 'VIDEO',
    damageClass: 'D10',
    severity: 'LOW',
    confidence: 55,
    framesChecked: 2,
    status: 'DETECTING',
    evidence: [],
    detections: [],
    totalFrames: 5,
    persistenceFrames: 0,
    location: 'Elm Street Connector, Shoulder',
    events: [
      { id: 'evt-0015-1', timestamp: '13:15:01', level: 'action', stage: 'VERIFY', message: 'Candidate transverse anomaly under analysis.' },
    ],
  },

  // 16. RG-0016 — D40, MEDIUM, VERIFYING (in-progress)
  {
    id: 'RG-0016',
    createdAt: '2026-10-07T14:00:00Z',
    inputType: 'VIDEO',
    damageClass: 'D40',
    severity: 'MEDIUM',
    confidence: 71,
    framesChecked: 3,
    status: 'VERIFYING',
    evidence: [],
    detections: [
      { id: 'det-0016-1', damageClass: 'D40', confidence: 71, bbox: { x: 50, y: 60, w: 18, h: 14 }, frameNumber: 1 },
    ],
    totalFrames: 7,
    persistenceFrames: 3,
    location: 'Oak Avenue, Vehicle Lane',
    events: [
      { id: 'evt-0016-1', timestamp: '14:00:02', level: 'warning', stage: 'VERIFY', message: 'Confidence 71% — below threshold. Verification pass in progress.' },
    ],
  },

  // 17. RG-0017 — D20, MEDIUM, REINSPECTING (in-progress)
  {
    id: 'RG-0017',
    createdAt: '2026-10-07T14:30:00Z',
    inputType: 'VIDEO',
    damageClass: 'D20',
    severity: 'MEDIUM',
    confidence: 69,
    framesChecked: 4,
    status: 'REINSPECTING',
    evidence: [],
    detections: [],
    totalFrames: 8,
    persistenceFrames: 2,
    location: 'Cedar Parkway, Median',
    events: [
      { id: 'evt-0017-1', timestamp: '14:30:03', level: 'action', stage: 'RECHECK', message: 'Re-inspecting frames 3-8 for alligator crack persistence.' },
    ],
  },

  // 18. RG-0018 — D00, LOW, UPLOADED (freshly uploaded)
  {
    id: 'RG-0018',
    createdAt: '2026-10-07T15:00:00Z',
    inputType: 'IMAGE',
    damageClass: 'D00',
    severity: 'LOW',
    confidence: 0,
    framesChecked: 0,
    status: 'UPLOADED',
    evidence: [],
    detections: [],
    totalFrames: 1,
    persistenceFrames: 0,
    location: 'Pine Street, Shoulder',
    events: [],
  },
];

// ---------------------------------------------------------------------------
// Sample Benchmark Result — CLEARLY MARKED AS SAMPLE DATA
// ---------------------------------------------------------------------------

/** Sample benchmark data — x86 vs ARM+COOL comparison. */
export const SAMPLE_BENCHMARK_RESULT: BenchmarkResult = {
  x86: {
    latencyMs: 48.2,
    throughputImgSec: 20.8,
    cpuPct: 82.5,
    costPer1kImg: 0.042,
  },
  armCool: {
    latencyMs: 14.1,
    throughputImgSec: 70.9,
    cpuPct: 38.0,
    costPer1kImg: 0.011,
  },
  title: 'COOL / Graviton Performance Benchmark',
  date: 'October 2026',
};

// ---------------------------------------------------------------------------
// Sample Model Evaluation — CLEARLY MARKED AS SAMPLE DATA
// ---------------------------------------------------------------------------

/** Sample model evaluation on RDD2022 dataset. */
export const SAMPLE_MODEL_EVALUATION: ModelEvaluation = {
  precision: 86.4,
  recall: 83.1,
  f1: 84.7,
  mAP: 88.2,
  perClass: {
    D00: { precision: 87.2, recall: 84.0, f1: 85.6 },
    D10: { precision: 85.1, recall: 81.7, f1: 83.4 },
    D20: { precision: 88.6, recall: 85.9, f1: 87.2 },
    D40: { precision: 91.4, recall: 88.5, f1: 89.9 },
  },
  confusionMatrix: {
    labels: ['D00', 'D10', 'D20', 'D40'],
    matrix: [
      [0.87, 0.06, 0.05, 0.02],
      [0.08, 0.85, 0.05, 0.02],
      [0.04, 0.03, 0.89, 0.04],
      [0.01, 0.01, 0.04, 0.94],
    ],
  },
};
