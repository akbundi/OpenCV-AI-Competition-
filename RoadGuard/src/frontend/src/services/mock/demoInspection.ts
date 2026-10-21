/**
 * Scripted demo inspection RG-0001 — drives the judge demo.
 * Input: VIDEO, 7 frames | Damage: D40 Pothole | Severity: HIGH
 * Confidence curve: 62% → 74% → 82% → 88% → 88% → 90% → 91%
 * Ends at WAITING_FOR_APPROVAL.
 */

import type { Inspection, Detection } from '../../types/inspection';
import type { FrameEvidence } from '../../types/evidence';
import type { PersistenceReport } from '../../types/evidence';
import type { AgentEvent } from '../../types/agent';
import type { Report } from '../../types/report';
import { generateRoadFrameSvg } from './roadSvgGenerator';

// ---------------------------------------------------------------------------
// Evidence frames — 7-frame progressive confidence climb
// ---------------------------------------------------------------------------

export const DEMO_EVIDENCE_FRAMES: FrameEvidence[] = [
  {
    frameNumber: 1,
    timestamp: '00:01.12',
    imageUrl: generateRoadFrameSvg(1, 'pothole', { showOverlay: false }),
    annotatedUrl: generateRoadFrameSvg(1, 'pothole', { showOverlay: true, confidence: 62 }),
    confidence: 62,
    status: 'POSSIBLE',
    detection: {
      id: 'det-0001-f1',
      damageClass: 'D40',
      confidence: 62,
      bbox: { x: 42, y: 56, w: 22, h: 16 },
      frameNumber: 1,
    },
  },
  {
    frameNumber: 2,
    timestamp: '00:01.18',
    imageUrl: generateRoadFrameSvg(2, 'pothole', { showOverlay: false }),
    annotatedUrl: generateRoadFrameSvg(2, 'pothole', { showOverlay: true, confidence: 74 }),
    confidence: 74,
    status: 'DETECTED',
    detection: {
      id: 'det-0001-f2',
      damageClass: 'D40',
      confidence: 74,
      bbox: { x: 42.5, y: 56.5, w: 22.5, h: 16.2 },
      frameNumber: 2,
    },
  },
  {
    frameNumber: 3,
    timestamp: '00:01.25',
    imageUrl: generateRoadFrameSvg(3, 'pothole', { showOverlay: false }),
    annotatedUrl: generateRoadFrameSvg(3, 'pothole', { showOverlay: true, confidence: 82 }),
    confidence: 82,
    status: 'DETECTED',
    detection: {
      id: 'det-0001-f3',
      damageClass: 'D40',
      confidence: 82,
      bbox: { x: 43, y: 57, w: 23, h: 16.5 },
      frameNumber: 3,
    },
  },
  {
    frameNumber: 4,
    timestamp: '00:01.32',
    imageUrl: generateRoadFrameSvg(4, 'pothole', { showOverlay: false }),
    annotatedUrl: generateRoadFrameSvg(4, 'pothole', { showOverlay: true, confidence: 88 }),
    confidence: 88,
    status: 'DETECTED',
    detection: {
      id: 'det-0001-f4',
      damageClass: 'D40',
      confidence: 88,
      bbox: { x: 43.2, y: 57.5, w: 23.2, h: 16.8 },
      frameNumber: 4,
    },
  },
  {
    frameNumber: 5,
    timestamp: '00:01.38',
    imageUrl: generateRoadFrameSvg(5, 'pothole', { showOverlay: false }),
    annotatedUrl: generateRoadFrameSvg(5, 'pothole', { showOverlay: true, confidence: 88 }),
    confidence: 88,
    status: 'CONFIRMED',
    detection: {
      id: 'det-0001-f5',
      damageClass: 'D40',
      confidence: 88,
      bbox: { x: 43.6, y: 58, w: 23.5, h: 17 },
      frameNumber: 5,
    },
  },
  {
    frameNumber: 6,
    timestamp: '00:01.45',
    imageUrl: generateRoadFrameSvg(6, 'pothole', { showOverlay: false }),
    annotatedUrl: generateRoadFrameSvg(6, 'pothole', { showOverlay: true, confidence: 90 }),
    confidence: 90,
    status: 'CONFIRMED',
    detection: {
      id: 'det-0001-f6',
      damageClass: 'D40',
      confidence: 90,
      bbox: { x: 44, y: 58.5, w: 23.8, h: 17.2 },
      frameNumber: 6,
    },
  },
  {
    frameNumber: 7,
    timestamp: '00:01.52',
    imageUrl: generateRoadFrameSvg(7, 'pothole', { showOverlay: false }),
    annotatedUrl: generateRoadFrameSvg(7, 'pothole', { showOverlay: true, confidence: 91 }),
    confidence: 91,
    status: 'CONFIRMED',
    detection: {
      id: 'det-0001-f7',
      damageClass: 'D40',
      confidence: 91,
      bbox: { x: 44.2, y: 59, w: 24, h: 17.5 },
      frameNumber: 7,
    },
  },
];

// ---------------------------------------------------------------------------
// Agent event timeline — 15 events telling the full autonomous reasoning story
// ---------------------------------------------------------------------------

export const DEMO_AGENT_EVENTS: AgentEvent[] = [
  {
    id: 'evt-001',
    timestamp: '10:00:00',
    level: 'info',
    stage: 'OBSERVE',
    message: 'Ingested raw video stream route_405_sectorB.mp4 (7 frames, 4K 60fps). Initializing OpenCV 5 NEON buffer.',
  },
  {
    id: 'evt-002',
    timestamp: '10:00:01',
    level: 'info',
    stage: 'OBSERVE',
    message: 'Frame 1 analyzed via OpenCV 5 ARM NEON accelerated pipeline.',
  },
  {
    id: 'evt-003',
    timestamp: '10:00:02',
    level: 'action',
    stage: 'VERIFY',
    message: 'Candidate road anomaly located on Frame 1 at pixel coordinates [x: 42%, y: 56%]. Possible pothole detected.',
  },
  {
    id: 'evt-004',
    timestamp: '10:00:03',
    level: 'warning',
    stage: 'VERIFY',
    message: 'Confidence: 62% — Below autonomous verification threshold (75%). Mark status: POSSIBLE.',
  },
  {
    id: 'evt-005',
    timestamp: '10:00:04',
    level: 'action',
    stage: 'RECHECK',
    message: 'Agent requested additional frames for multi-frame temporal re-inspection across consecutive buffer.',
  },
  {
    id: 'evt-006',
    timestamp: '10:00:05',
    level: 'info',
    stage: 'RECHECK',
    message: 'Frame 2 analyzed: IoU tracking lock 0.84 established. Confidence climbed to 74% (status: DETECTED).',
  },
  {
    id: 'evt-007',
    timestamp: '10:00:06',
    level: 'info',
    stage: 'RECHECK',
    message: 'Frame 3 analyzed: Fracture geometry verified across vehicle trajectory. Confidence climbed to 82% (status: DETECTED).',
  },
  {
    id: 'evt-008',
    timestamp: '10:00:07',
    level: 'info',
    stage: 'RECHECK',
    message: 'Frame 4 analyzed: Shadowing and asphalt rim confirmed. Confidence steady at 88% (status: DETECTED).',
  },
  {
    id: 'evt-009',
    timestamp: '10:00:08',
    level: 'success',
    stage: 'RECHECK',
    message: 'Frame 5 analyzed: Multi-frame persistence verified (5/5 consecutive frames). Status elevated to CONFIRMED (88%).',
  },
  {
    id: 'evt-010',
    timestamp: '10:00:09',
    level: 'info',
    stage: 'RECHECK',
    message: 'Frame 6 analyzed: Cavity aperture calculated at ~48cm diameter, ~12cm depth. Confidence elevated to 90% (status: CONFIRMED).',
  },
  {
    id: 'evt-011',
    timestamp: '10:00:10',
    level: 'success',
    stage: 'RECHECK',
    message: 'Frame 7 analyzed: Final confidence locked at 91%. Damage confirmed across 7/7 consecutive frames (100% persistence).',
  },
  {
    id: 'evt-012',
    timestamp: '10:00:11',
    level: 'info',
    stage: 'ASSESS',
    message: 'Spatial positioning: Pothole situated directly in Vehicle Lane — Right Wheel Track (Lane 2 of 4).',
  },
  {
    id: 'evt-013',
    timestamp: '10:00:12',
    level: 'alert',
    stage: 'ASSESS',
    message: 'Severity assessed: HIGH. Pavement cavity poses severe vehicular rim puncture and blowout risk.',
  },
  {
    id: 'evt-014',
    timestamp: '10:00:13',
    level: 'info',
    stage: 'REPORT',
    message: 'Report generated: Work order #REP-0001 drafted. Immediate cold-mix asphalt patch recommended within 4 hours.',
  },
  {
    id: 'evt-015',
    timestamp: '10:00:14',
    level: 'warning',
    stage: 'HUMAN_REVIEW',
    message: 'Safety policy enforced: HIGH severity inspection requires human authorization. Human approval required before dispatch.',
  },
];

// ---------------------------------------------------------------------------
// Demo report
// ---------------------------------------------------------------------------

export const DEMO_REPORT: Report = {
  id: 'REP-0001',
  inspectionId: 'RG-0001',
  damageClass: 'D40',
  severity: 'HIGH',
  confidence: 91,
  persistenceFrames: 7,
  roadPosition: 'Vehicle Lane — Right Wheel Track',
  recommendation: 'Immediate cold-mix asphalt patch within 4 hours. Follow with thermal infrared core seal within 14 days.',
  status: 'PENDING',
};

// ---------------------------------------------------------------------------
// Persistence report
// ---------------------------------------------------------------------------

export const DEMO_PERSISTENCE: PersistenceReport = {
  frameCount: 7,
  confirmationFrame: 5,
  persistenceRatio: 1.0,
};

// ---------------------------------------------------------------------------
// Demo detections (derived from evidence frames)
// ---------------------------------------------------------------------------

export const DEMO_DETECTIONS: Detection[] = DEMO_EVIDENCE_FRAMES
  .filter((f): f is FrameEvidence & { detection: Detection } => f.detection !== undefined)
  .map((f) => f.detection);

// ---------------------------------------------------------------------------
// Full demo inspection object
// ---------------------------------------------------------------------------

export const DEMO_INSPECTION: Inspection = {
  id: 'RG-0001',
  createdAt: '2026-10-07T10:00:00Z',
  inputType: 'VIDEO',
  damageClass: 'D40',
  severity: 'HIGH',
  confidence: 91,
  framesChecked: 7,
  status: 'WAITING_FOR_APPROVAL',
  reportId: 'REP-0001',
  evidence: DEMO_EVIDENCE_FRAMES,
  detections: DEMO_DETECTIONS,
  totalFrames: 7,
  persistenceFrames: 7,
  location: 'Interstate 405 NB, Mile Marker 24.8, Lane 2',
  events: DEMO_AGENT_EVENTS,
};
