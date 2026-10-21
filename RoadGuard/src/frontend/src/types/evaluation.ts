/**
 * Model evaluation and performance benchmark types.
 */

import type { DamageClass } from './inspection';

export interface BenchmarkRun {
  latencyMs: number;
  throughputImgSec: number;
  cpuPct: number;
  costPer1kImg: number;
}

export interface BenchmarkResult {
  x86: BenchmarkRun;
  armCool: BenchmarkRun;
  title?: string;
  date?: string;
}

export interface ModelEvaluation {
  precision: number;
  recall: number;
  f1: number;
  mAP: number;
  perClass: Record<DamageClass, { precision: number; recall: number; f1: number }>;
  confusionMatrix: {
    labels: DamageClass[];
    matrix: number[][];
  };
}
