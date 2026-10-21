import React, { useState } from 'react';
import {
  ArrowDown,
  Server,
  Code,
  CheckCircle2,
} from 'lucide-react';

interface ArchitectureNode {
  id: string;
  category: 'EDGE' | 'CLOUD' | 'COMPUTE' | 'VISION' | 'AGENT' | 'HUMAN';
  stepNumber: string;
  title: string;
  subtitle: string;
  description: string;
  techStack: string[];
  latency: string;
  protocols: string;
  details: {
    purpose: string;
    inputs: string;
    outputs: string;
    failureHandling: string;
  };
  codeSnippet?: string;
}

const ARCHITECTURE_NODES: ArchitectureNode[] = [
  {
    id: 'edge-ingress',
    category: 'EDGE',
    stepNumber: '01',
    title: 'Edge Ingress & Sensor Ingestion',
    subtitle: 'Municipal Fleet & Mobile Dashcam Ingress',
    description:
      'Continuous 4K 60FPS video capture from municipal patrol trucks, sanitation vehicles, and transit buses with synchronized GPS NMEA coordinates.',
    techStack: ['Dashcam Optic 4K HDR', 'GPS / IMU Telemetry', 'H.265 / HEVC', 'mTLS Streaming'],
    latency: '< 150 ms upload burst',
    protocols: 'HTTPS / WebRTC / S3 Multipart Upload',
    details: {
      purpose: 'Capture real-world pavement conditions across municipal road networks without dedicated survey hardware.',
      inputs: 'Raw optical road video streams, vehicle velocity vectors, timestamped GNSS fixes.',
      outputs: 'Signed S3 upload manifest and partitioned video chunks.',
      failureHandling: 'Local flash ring buffer (128GB) stores encrypted frames during cellular dead zones.',
    },
    codeSnippet: `// Edge Fleet Video Ingestion Manifest
{
  "vehicle_id": "MUNI-PATROL-114",
  "gps_coordinates": { "lat": 34.0522, "lng": -118.2437 },
  "speed_mph": 38.4,
  "codec": "H.265",
  "resolution": "3840x2160@60fps",
  "telemetry_stream_id": "corr-405-n-20261007"
}`,
  },
  {
    id: 'cloud-orchestration',
    category: 'CLOUD',
    stepNumber: '02',
    title: 'Serverless Orchestration & Storage',
    subtitle: 'Amazon S3 & DynamoDB Pavement Store',
    description:
      'Zero-idle serverless pipeline that extracts keyframe sequences, shards work across compute instances, and tracks state machine lifecycle.',
    techStack: ['AWS S3 Intelligent-Tiering', 'DynamoDB', 'AWS Lambda', 'Amazon EventBridge'],
    latency: '18 ms event fan-out',
    protocols: 'REST API / S3 Event Notifications',
    details: {
      purpose: 'Decouple high-bandwidth media ingestion from compute execution while providing an immutable audit trail.',
      inputs: 'Multipart S3 video uploads and upload metadata.',
      outputs: 'Frame extraction events and DynamoDB inspection documents with unique IDs.',
      failureHandling: 'Dead-letter queues (SQS DLQ) with automated 3x retry on failed chunk extraction.',
    },
    codeSnippet: `// DynamoDB Inspection Schema
{
  "InspectionId": "INSP-2026-0881",
  "CreatedAt": "2026-10-07T10:32:00Z",
  "Status": "WAITING_FOR_APPROVAL",
  "DamageClass": "D40",
  "Confidence": 91.4,
  "PersistenceFrames": 7,
  "S3KeyOriginal": "s3://roadguard-raw/runs/0881.mp4",
  "S3KeyEvidence": "s3://roadguard-evidence/0881/"
}`,
  },
  {
    id: 'graviton-compute',
    category: 'COMPUTE',
    stepNumber: '03',
    title: 'AWS Graviton3 Hardware Acceleration',
    subtitle: 'ARM Neoverse V1 SIMD Vector Processing',
    description:
      'Cost-optimized computing on AWS c7g.2xlarge instances delivering 3.42x faster inference and 73.8% cost savings versus legacy x86_64 nodes.',
    techStack: ['AWS Graviton3 (ARM64)', 'NEON Vector Instructions', 'c7g.2xlarge Instances', 'Linux Kernel 6.5'],
    latency: '14.1 ms per 4K frame',
    protocols: 'PCIe 4.0 / AWS Nitro Enclaves',
    details: {
      purpose: 'Slash high-throughput computer vision processing costs by leveraging ARM NEON vectorized hardware instructions.',
      inputs: 'Decompressed YUV420 frame tensors.',
      outputs: 'Feature-extracted bounding box candidates with confidence tensors.',
      failureHandling: 'Auto-scaling group across 3 Availability Zones maintains minimum 99.95% uptime SLA.',
    },
    codeSnippet: `// ARM NEON Vector SIMD Micro-Kernel
#include <arm_neon.h>

void neon_distress_filter_kernel(const uint8_t* src, uint8_t* dst, int len) {
  for (int i = 0; i < len; i += 16) {
    uint8x16_t pix = vld1q_u8(src + i);
    uint8x16_t threshold = vdupq_n_u8(42);
    uint8x16_t mask = vcgtq_u8(pix, threshold);
    vst1q_u8(dst + i, mask);
  }
}`,
  },
  {
    id: 'opencv-cool',
    category: 'VISION',
    stepNumber: '04',
    title: 'OpenCV 5 COOL Kernel Engine',
    subtitle: 'Graph API & Computer Vision Optimization',
    description:
      'G-API accelerated computation graph that fuses road-filtering kernels, normalizes varying lighting and wet surfaces, and extracts RDD2022 distress candidates.',
    techStack: ['OpenCV 5.0.0 (COOL)', 'G-API Computation Graph', 'INT8 Post-Training Quantization', 'NEON Backend'],
    latency: '70.9 frames / sec',
    protocols: 'In-Memory Zero-Copy Ring Buffer',
    details: {
      purpose: 'Execute deterministic image filtering, edge extraction, and defect proposal generation at line rate.',
      inputs: '4K raw frames sharded from edge upload chunks.',
      outputs: 'Predicted bounding boxes, RDD2022 classifications (D00-D40), and candidate masks.',
      failureHandling: 'Adaptive contrast fallback if over-exposure or nighttime glare is detected.',
    },
    codeSnippet: `// OpenCV 5 COOL G-API Computation Pipeline
cv::GMat in;
auto blurred    = cv::gapi::gaussianBlur(in, cv::Size(5, 5), 1.5);
auto edges      = cv::gapi::Canny(blurred, 50, 150);
auto candidates = roadguard::cool::extractDamageRegions(edges);
cv::GComputation pipeline(cv::GIn(in), cv::GOut(candidates));
pipeline.compile(cv::compile_args(cv::gapi::use_only{roadguard::cool::backend()}));`,
  },
  {
    id: 'agentic-loop',
    category: 'AGENT',
    stepNumber: '05',
    title: 'Autonomous Multi-Frame Reasoning Loop',
    subtitle: 'State Machine & Temporal Consensus Gate',
    description:
      'Autonomous supervisor engine executing the 6-stage lifecycle (Observe → Verify → Recheck → Assess → Report → Human Review). Filters single-frame visual artifacts.',
    techStack: ['State Machine Engine', 'Temporal Consensus Buffer', 'Confidence Gate (75%)', 'Multi-Frame Voting'],
    latency: '240 ms complete sequence',
    protocols: 'State Machine Event Stream',
    details: {
      purpose: 'Eliminate false positives by requiring damage to persist across temporal frames before generating work orders.',
      inputs: 'Stream of frame-by-frame detections from OpenCV COOL.',
      outputs: 'Consensus distress classification, severity assessment, and generated report brief.',
      failureHandling: 'Low confidence automatically triggers re-inspection buffer request; discarded if non-persistent.',
    },
    codeSnippet: `// Agentic Re-inspection & Persistence Consensus
async function evaluatePersistence(frameStream: Detection[]) {
  const candidate = frameStream[0];
  if (candidate.confidence < 0.75) {
    // Low confidence guard: request additional temporal frames
    const recheckFrames = await bufferService.requestWindow(candidate.time, 7);
    const confirmedCount = recheckFrames.filter(f => f.hasMatch(candidate)).length;
    if (confirmedCount >= 5) {
      return { status: "CONFIRMED", confidence: 0.91, severity: "HIGH" };
    }
    return { status: "DISCARDED_TRANSIENT" };
  }
}`,
  },
  {
    id: 'human-governance',
    category: 'HUMAN',
    stepNumber: '06',
    title: 'Human-in-the-Loop Municipal Sign-off',
    subtitle: 'Mandatory Supervisory Review Gate',
    description:
      'Strict governance interface requiring certified municipal engineers to review high-severity work orders before contractor dispatch.',
    techStack: ['Role-Based Access Control', 'Digital Signatures', 'Municipal ERP Export', 'Work Order PDF'],
    latency: 'Asynchronous (Supervisor SLA)',
    protocols: 'REST Webhooks / Open311 Protocol',
    details: {
      purpose: 'Ensure municipal accountability and prevent erroneous road closures or unnecessary public spending.',
      inputs: 'Evidence-backed maintenance brief with multi-frame filmstrip.',
      outputs: 'Authorized work order, contractor dispatch ticket, or documented rejection reason.',
      failureHandling: 'Rejection returns feedback to training archive for active learning re-training.',
    },
    codeSnippet: `// Municipal Sign-off Authorization Payload
{
  "work_order_id": "REP-2026-0881",
  "inspection_id": "INSP-2026-0881",
  "authorized_by": "Sarah Chen, PE",
  "supervisor_badge": "PW-4482",
  "status": "APPROVED",
  "dispatch_priority": "CRITICAL_24HR",
  "contractor_payload": {
    "material": "Hot-Mix Asphalt (HMA)",
    "square_meters": 1.4,
    "closure_lane": 2
  }
}`,
  },
];

export const SystemArchitecture: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<ArchitectureNode>(ARCHITECTURE_NODES[4]); // Default to Agentic Loop
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  const filteredNodes = ARCHITECTURE_NODES.filter(
    (n) => filterCategory === 'ALL' || n.category === filterCategory
  );

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-border">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-wider text-muted mb-2 font-medium">
            CLOUD & HARDWARE PIPELINE SPECIFICATION // SYSTEM TOPOLOGY
          </div>
          <h1 className="font-sans font-bold text-4xl sm:text-5xl tracking-tight text-text">
            System Architecture
          </h1>
          <p className="text-muted text-sm mt-3 font-normal max-w-2xl font-sans leading-relaxed">
            End-to-end telemetry overview tracing data flow from edge patrol fleet to AWS Graviton3 compute, OpenCV 5 COOL accelerated kernels, the agentic reasoning loop, and human supervisory sign-off.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-text bg-surface-alt border border-border px-4 py-2 rounded-none">
          <Server className="w-3.5 h-3.5 text-muted" />
          <span>PRODUCTION BLUEPRINT v2.4</span>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted mr-2 font-medium">
          FOCUS LAYER:
        </span>
        {[
          { id: 'ALL', label: 'ALL LAYERS' },
          { id: 'EDGE', label: 'EDGE & SENSORS' },
          { id: 'CLOUD', label: 'CLOUD INGESTION' },
          { id: 'COMPUTE', label: 'GRAVITON ARM' },
          { id: 'VISION', label: 'OPENCV COOL' },
          { id: 'AGENT', label: 'AGENTIC ENGINE' },
          { id: 'HUMAN', label: 'HUMAN GOVERNANCE' },
        ].map((btn) => (
          <button
            key={btn.id}
            onClick={() => setFilterCategory(btn.id)}
            className={`font-mono text-[11px] uppercase tracking-wider px-3.5 py-1.5 rounded-none transition-colors cursor-pointer border ${
              filterCategory === btn.id
                ? 'bg-text text-bg border-border-strong font-bold'
                : 'bg-surface text-muted hover:text-text border-border'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Main Architecture Workspace: Left Vertical Flow (7 cols), Right Inspector (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Vertical Pipeline Nodes (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {filteredNodes.map((node, index) => {
            const isSelected = selectedNode.id === node.id;
            return (
              <div key={node.id} className="relative">
                {/* Node Card */}
                <div
                  onClick={() => setSelectedNode(node)}
                  className={`p-6 rounded-none transition-colors cursor-pointer border ${
                    isSelected
                      ? 'bg-surface-alt border-border-strong'
                      : 'bg-surface border-border hover:border-border-strong hover:bg-surface-alt/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-none bg-surface-alt text-text border border-border">
                        {node.stepNumber}
                      </span>
                      <div>
                        <span className="font-mono text-[9px] uppercase tracking-wider text-muted font-medium">
                          {node.category} LAYER
                        </span>
                        <h3 className="font-sans font-bold text-2xl text-text">
                          {node.title}
                        </h3>
                      </div>
                    </div>

                    <div className="font-mono text-[10px] uppercase tracking-wider text-muted text-right font-medium">
                      {node.latency}
                    </div>
                  </div>

                  <p className="font-sans text-xs text-muted font-normal leading-relaxed mb-4">
                    {node.description}
                  </p>

                  {/* Tech Tags */}
                  <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-border">
                    {node.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-none bg-surface-alt text-text border border-border"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Connector Arrow (if not last) */}
                {index < filteredNodes.length - 1 && (
                  <div className="flex justify-center my-2 text-muted">
                    <ArrowDown className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right Column: Node Deep-Dive Inspector (5 cols, sticky) */}
        <div className="lg:col-span-5 sticky top-24 space-y-6">
          <div className="p-8 rounded-none bg-surface border border-border space-y-6">
            {/* Inspector Header */}
            <div className="pb-4 border-b border-border">
              <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-muted mb-1 font-medium">
                <span>COMPONENT INSPECTOR</span>
                <span className="text-text font-bold">{selectedNode.stepNumber} // {selectedNode.category}</span>
              </div>
              <h2 className="font-sans font-bold text-3xl text-text">
                {selectedNode.title}
              </h2>
              <p className="font-mono text-xs text-muted mt-1">
                {selectedNode.subtitle}
              </p>
            </div>

            {/* Spec Attributes */}
            <div className="grid grid-cols-2 gap-4 font-mono text-xs">
              <div className="p-3 rounded-none bg-surface-alt border border-border">
                <span className="text-muted text-[9px] uppercase tracking-wider block mb-1 font-medium">
                  LATENCY PROFILE
                </span>
                <span className="text-text font-bold">{selectedNode.latency}</span>
              </div>
              <div className="p-3 rounded-none bg-surface-alt border border-border">
                <span className="text-muted text-[9px] uppercase tracking-wider block mb-1 font-medium">
                  COMMUNICATION PROTOCOL
                </span>
                <span className="text-text font-semibold truncate block">{selectedNode.protocols}</span>
              </div>
            </div>

            {/* Functional Details */}
            <div className="space-y-3 font-sans text-xs">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted block mb-1 font-medium">
                  ARCHITECTURAL PURPOSE
                </span>
                <p className="text-text font-normal leading-relaxed">
                  {selectedNode.details.purpose}
                </p>
              </div>

              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted block mb-1 font-medium">
                  PRIMARY INPUTS & UPSTREAM DEPENDENCIES
                </span>
                <p className="text-muted font-normal">
                  {selectedNode.details.inputs}
                </p>
              </div>

              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted block mb-1 font-medium">
                  DOWNSTREAM OUTPUTS & CONTRACTS
                </span>
                <p className="text-muted font-normal">
                  {selectedNode.details.outputs}
                </p>
              </div>

              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted block mb-1 font-medium">
                  RESILIENCE & FAULT TOLERANCE
                </span>
                <p className="text-muted font-normal">
                  {selectedNode.details.failureHandling}
                </p>
              </div>
            </div>

            {/* Code / Schema Payload Snippet */}
            {selectedNode.codeSnippet && (
              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between mb-2 font-mono text-[10px] uppercase tracking-wider text-muted font-medium">
                  <span className="flex items-center gap-1.5">
                    <Code className="w-3.5 h-3.5" />
                    TECHNICAL ARTIFACT SPEC
                  </span>
                </div>
                <pre className="p-4 rounded-none bg-surface-alt border border-border font-mono text-[11px] text-text overflow-x-auto leading-relaxed max-h-64">
                  <code>{selectedNode.codeSnippet}</code>
                </pre>
              </div>
            )}
          </div>

          {/* Architectural Design Principles Box */}
          <div className="p-6 rounded-none bg-surface border border-border space-y-3">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted block font-medium">
              CORE PRINCIPLES
            </span>
            <div className="space-y-2 text-xs font-sans text-muted font-normal leading-relaxed">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-sev-low shrink-0 mt-0.5" />
                <span><strong className="text-text">No Single-Shot Decisions:</strong> Evidence is gathered across temporal frames before raising alerts.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-sev-low shrink-0 mt-0.5" />
                <span><strong className="text-text">Hardware-Conscious Vision:</strong> ARM Graviton3 NEON SIMD ensures continuous 60 FPS scanning at 73.8% lower cost.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-sev-low shrink-0 mt-0.5" />
                <span><strong className="text-text">Mandatory Human Authorization:</strong> Zero autonomous contractor dispatch without engineer sign-off.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemArchitecture;
