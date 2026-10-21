import React, { useState, useEffect } from 'react';
import { getBenchmarkResults } from '../services/api';
import { BenchmarkResult } from '../types';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { EmptyState } from '../components/ui/EmptyState';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  Zap,
  TrendingDown,
  DollarSign,
  Gauge,
  Server,
  Calculator,
} from 'lucide-react';

export const PerformanceBenchmark: React.FC = () => {
  const [benchmark, setBenchmark] = useState<BenchmarkResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [framesPerMonth, setFramesPerMonth] = useState<number>(500000);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getBenchmarkResults();
      setBenchmark(data);
    } catch (err: any) {
      console.error('Failed to load benchmarks:', err);
      setError(err?.message || 'Failed to load hardware benchmark telemetry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return <LoadingState variant="card" count={3} />;
  }

  if (error) {
    return (
      <ErrorState
        title="BENCHMARK TELEMETRY OFFLINE"
        reason={error}
        onRetry={loadData}
      />
    );
  }

  if (!benchmark || !benchmark.x86 || !benchmark.armCool) {
    return (
      <EmptyState
        title="NO BENCHMARK TELEMETRY"
        description="Hardware benchmark comparison data is currently unavailable."
        action={{ label: 'RETRY', onClick: loadData }}
      />
    );
  }

  const { x86, armCool } = benchmark;

  // Derived speedup & improvements
  const speedupRatio = (x86.latencyMs / (armCool.latencyMs || 1)).toFixed(2);
  const throughputExpansionPct = Math.round(
    ((armCool.throughputImgSec - x86.throughputImgSec) / (x86.throughputImgSec || 1)) * 100
  );
  const cpuReductionPct = Math.round(
    ((x86.cpuPct - armCool.cpuPct) / (x86.cpuPct || 1)) * 100
  );
  const costSavingsPct = (
    ((x86.costPer1kImg - armCool.costPer1kImg) / (x86.costPer1kImg || 1)) * 100
  ).toFixed(1);

  // Chart data formatting
  const latencyData = [
    {
      name: 'Inference Latency',
      standard: x86.latencyMs,
      optimized: armCool.latencyMs,
      unit: 'ms/image',
    },
    {
      name: 'CPU Core Utilization',
      standard: x86.cpuPct,
      optimized: armCool.cpuPct,
      unit: '% core load',
    },
  ];

  const throughputData = [
    {
      name: 'Pavement Scan Throughput',
      standard: x86.throughputImgSec,
      optimized: armCool.throughputImgSec,
      unit: 'FPS',
    },
  ];

  // Cost calculations
  const x86Cost = (framesPerMonth / 1000) * x86.costPer1kImg;
  const armCost = (framesPerMonth / 1000) * armCool.costPer1kImg;
  const monthlySavings = x86Cost - armCost;
  const annualSavings = monthlySavings * 12;

  // Metrics comparison breakdown
  const metricsTableRows = [
    {
      metric: 'Inference Latency',
      standard: `${x86.latencyMs} ms`,
      optimized: `${armCool.latencyMs} ms`,
      advantage: `${speedupRatio}x speedup`,
      reason: 'NEON 128-bit SIMD registers & cache-locality kernels.',
    },
    {
      metric: 'Inspection Throughput',
      standard: `${x86.throughputImgSec} FPS`,
      optimized: `${armCool.throughputImgSec} FPS`,
      advantage: `+${throughputExpansionPct}%`,
      reason: 'G-API pipelined asynchronous buffer dispatching.',
    },
    {
      metric: 'CPU Core Load',
      standard: `${x86.cpuPct}%`,
      optimized: `${armCool.cpuPct}%`,
      advantage: `-${cpuReductionPct}%`,
      reason: 'Fused multiply-accumulate & zero-copy memory transfers.',
    },
    {
      metric: 'Cost per 1,000 Images',
      standard: `$${x86.costPer1kImg.toFixed(3)}`,
      optimized: `$${armCool.costPer1kImg.toFixed(3)}`,
      advantage: `-${costSavingsPct}%`,
      reason: 'ARM Graviton3 hourly pricing + 3.42x faster execution.',
    },
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-border">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-wider text-muted mb-2 font-medium">
            HARDWARE ACCELERATION HARNESS // OPENCV 5 COOL
          </div>
          <h1 className="font-sans font-bold text-4xl sm:text-5xl tracking-tight text-text">
            COOL & Graviton Benchmarks
          </h1>
          <p className="text-muted text-sm mt-3 font-normal max-w-2xl font-sans leading-relaxed">
            Head-to-head empirical metrics measuring OpenCV 5 + COOL (Computer Vision Optimization & Open-Source Library) kernel execution on AWS Graviton3 (ARM NEON) vs Legacy x86_64 architecture.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-text bg-surface-alt border border-border px-4 py-2 rounded-none">
          <Server className="w-3.5 h-3.5 text-muted" />
          <span>HARNESS: {benchmark.date || 'October 2026'}</span>
        </div>
      </div>

      {/* KPI Headline Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 rounded-none bg-surface border border-border relative overflow-hidden group">
          <div className="flex items-center justify-between text-muted mb-2">
            <span className="font-mono text-[10px] uppercase tracking-wider font-medium">LATENCY SPEEDUP</span>
            <Gauge className="w-4 h-4 text-muted" />
          </div>
          <div className="font-mono font-bold text-4xl text-text">{speedupRatio}x</div>
          <div className="font-mono text-[11px] text-muted mt-2">
            {armCool.latencyMs} ms <span className="text-muted/70">vs {x86.latencyMs} ms on x86</span>
          </div>
        </div>

        <div className="p-6 rounded-none bg-surface border border-border relative overflow-hidden group">
          <div className="flex items-center justify-between text-muted mb-2">
            <span className="font-mono text-[10px] uppercase tracking-wider font-medium">THROUGHPUT EXPANSION</span>
            <Zap className="w-4 h-4 text-muted" />
          </div>
          <div className="font-mono font-bold text-4xl text-text">+{throughputExpansionPct}%</div>
          <div className="font-mono text-[11px] text-muted mt-2">
            {armCool.throughputImgSec} FPS <span className="text-muted/70">vs {x86.throughputImgSec} FPS baseline</span>
          </div>
        </div>

        <div className="p-6 rounded-none bg-surface border border-border relative overflow-hidden group">
          <div className="flex items-center justify-between text-muted mb-2">
            <span className="font-mono text-[10px] uppercase tracking-wider font-medium">CPU CORE LOAD</span>
            <TrendingDown className="w-4 h-4 text-muted" />
          </div>
          <div className="font-mono font-bold text-4xl text-text">-{cpuReductionPct}%</div>
          <div className="font-mono text-[11px] text-muted mt-2">
            {armCool.cpuPct}% <span className="text-muted/70">vs {x86.cpuPct}% core saturation</span>
          </div>
        </div>

        <div className="p-6 rounded-none bg-surface border border-border relative overflow-hidden group">
          <div className="flex items-center justify-between text-muted mb-2">
            <span className="font-mono text-[10px] uppercase tracking-wider font-medium">CLOUD COST EFFICIENCY</span>
            <DollarSign className="w-4 h-4 text-muted" />
          </div>
          <div className="font-mono font-bold text-4xl text-text">{costSavingsPct}%</div>
          <div className="font-mono text-[11px] text-muted mt-2">
            ${armCool.costPer1kImg.toFixed(3)} <span className="text-muted/70">per 1k frames vs ${x86.costPer1kImg.toFixed(3)}</span>
          </div>
        </div>
      </div>

      {/* Visual Chart Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latency & CPU Load Bar Chart */}
        <div className="p-6 rounded-none bg-surface border border-border space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted block font-medium">
                COMPUTE EFFICIENCY
              </span>
              <h3 className="font-sans font-bold text-2xl text-text">
                Latency & Core Load Comparison
              </h3>
            </div>
            <span className="font-mono text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-none bg-surface-alt border border-border text-text">
              LOWER IS BETTER
            </span>
          </div>

          <div className="w-full font-mono text-xs" style={{ height: 288, minHeight: 288 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={latencyData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.15)" />
                <XAxis dataKey="name" stroke="#8C8275" tick={{ fill: '#8C8275', fontSize: 11 }} />
                <YAxis stroke="#8C8275" tick={{ fill: '#8C8275', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1C1916',
                    border: '1px solid rgba(244, 241, 235, 0.2)',
                    borderRadius: '0px',
                    color: '#F4F1EB',
                    fontFamily: 'monospace',
                  }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: 10, fontFamily: 'monospace', fontSize: 11 }}
                />
                <Bar dataKey="standard" name="Standard x86_64 (Intel)" fill="#8C8275" radius={[0, 0, 0, 0]} />
                <Bar dataKey="optimized" name="ARM Graviton3 + COOL" fill="#F5C518" radius={[0, 0, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="font-sans text-xs text-muted leading-relaxed font-normal">
            OpenCV 5 COOL kernels with ARM NEON vectorization reduce processing time from {x86.latencyMs}ms to {armCool.latencyMs}ms per frame, ensuring sustained 60 FPS real-time processing without core thermal throttling.
          </p>
        </div>

        {/* Throughput Bar Chart */}
        <div className="p-6 rounded-none bg-surface border border-border space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted block font-medium">
                PROCESSING CAPACITY
              </span>
              <h3 className="font-sans font-bold text-2xl text-text">
                Sustained Scan Throughput (FPS)
              </h3>
            </div>
            <span className="font-mono text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-none bg-surface-alt border border-border text-text">
              HIGHER IS BETTER
            </span>
          </div>

          <div className="w-full font-mono text-xs" style={{ height: 288, minHeight: 288 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={throughputData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.15)" />
                <XAxis dataKey="name" stroke="#8C8275" tick={{ fill: '#8C8275', fontSize: 11 }} />
                <YAxis stroke="#8C8275" tick={{ fill: '#8C8275', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1C1916',
                    border: '1px solid rgba(244, 241, 235, 0.2)',
                    borderRadius: '0px',
                    color: '#F4F1EB',
                    fontFamily: 'monospace',
                  }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: 10, fontFamily: 'monospace', fontSize: 11 }}
                />
                <Bar dataKey="standard" name="Standard x86_64 (Intel)" fill="#8C8275" radius={[0, 0, 0, 0]} />
                <Bar dataKey="optimized" name="ARM Graviton3 + COOL" fill="#F5C518" radius={[0, 0, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="font-sans text-xs text-muted leading-relaxed font-normal">
            Throughput increases from {x86.throughputImgSec} to {armCool.throughputImgSec} frames per second (+{throughputExpansionPct}%). A single Graviton3 instance can simultaneously ingest multiple 4K camera streams in real-time patrol vehicle sweeps.
          </p>
        </div>
      </div>

      {/* Comprehensive Benchmark Table */}
      <div className="rounded-none bg-surface border border-border overflow-hidden">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-muted mb-1 font-medium">
              SYSTEM LEVEL BREAKDOWN
            </div>
            <h3 className="font-sans font-bold text-2xl text-text">
              Standard Platform vs Accelerated Stack
            </h3>
          </div>
          <span className="font-mono text-[10px] text-muted uppercase tracking-wider hidden sm:inline">
            4K RES (3840x2160)
          </span>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-border-strong bg-surface-alt text-muted text-[10px] uppercase tracking-wider font-medium">
                <th className="py-4 px-6">PERFORMANCE METRIC</th>
                <th className="py-4 px-6">STANDARD x86_64</th>
                <th className="py-4 px-6">ARM GRAVITON3 + COOL</th>
                <th className="py-4 px-6">MEASURED ADVANTAGE</th>
                <th className="py-4 px-6">ARCHITECTURAL REASON</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(metricsTableRows || []).map((row) => (
                <tr key={row.metric} className="hover:bg-surface-alt transition-colors">
                  <td className="py-4 px-6 font-semibold text-text">
                    {row.metric}
                  </td>
                  <td className="py-4 px-6 text-muted">
                    {row.standard}
                  </td>
                  <td className="py-4 px-6 text-text font-bold">
                    {row.optimized}
                  </td>
                  <td className="py-4 px-6 text-text">
                    <span className="px-2 py-0.5 rounded-none bg-surface-alt border border-border">
                      {row.advantage}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-muted font-sans text-xs font-normal">
                    {row.reason}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card List (below 768px) */}
        <div className="md:hidden divide-y divide-border p-4 space-y-4">
          {(metricsTableRows || []).map((row) => (
            <div key={row.metric} className="pt-3 first:pt-0 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-text text-xs">{row.metric}</span>
                <span className="px-2 py-0.5 rounded-none bg-surface-alt border border-border text-text text-[10px] font-mono">
                  {row.advantage}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 font-mono text-[11px] bg-surface-alt p-2 rounded-none border border-border">
                <div>
                  <span className="block text-[9px] text-muted uppercase tracking-wider font-medium">STANDARD x86</span>
                  <span className="text-muted">{row.standard}</span>
                </div>
                <div>
                  <span className="block text-[9px] text-muted uppercase tracking-wider font-medium">ARM + COOL</span>
                  <span className="text-text font-bold">{row.optimized}</span>
                </div>
              </div>
              <p className="text-[11px] text-muted font-sans font-normal leading-relaxed">
                {row.reason}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Cloud Economics ROI Calculator */}
      <div className="rounded-none bg-surface border border-border p-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-border">
          <div>
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-muted mb-1 font-medium">
              <Calculator className="w-3.5 h-3.5" />
              <span>MUNICIPAL SAVINGS MODEL</span>
            </div>
            <h3 className="font-sans font-bold text-2xl text-text">
              Cloud Infrastructure ROI Estimator
            </h3>
          </div>
          <div className="font-mono text-xs text-muted">
            BASED ON AWS US-WEST-2 REGION PRICING
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-muted">ESTIMATED MONTHLY INSPECTION FRAMES:</span>
            <span className="text-text font-bold text-sm">{framesPerMonth.toLocaleString()} FRAMES</span>
          </div>
          <input
            type="range"
            min={100000}
            max={5000000}
            step={100000}
            value={framesPerMonth}
            onChange={(e) => setFramesPerMonth(Number(e.target.value))}
            className="w-full accent-accent h-2 bg-surface-alt rounded-none cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-muted">
            <span>100K FRAMES (Small Municipality)</span>
            <span>2.5M FRAMES (State Corridor)</span>
            <span>5.0M FRAMES (National Highway Network)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-border">
          <div className="p-4 rounded-none bg-surface-alt border border-border">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted block mb-1 font-medium">
              STANDARD X86_64 COST
            </span>
            <div className="font-sans font-bold text-2xl text-text">
              ${x86Cost.toFixed(2)} <span className="text-xs font-mono font-normal">/ mo</span>
            </div>
            <span className="font-mono text-[10px] text-muted mt-1 block">
              ${(x86Cost * 12).toFixed(2)} annually
            </span>
          </div>

          <div className="p-4 rounded-none bg-surface-alt border border-border">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted block mb-1 font-medium">
              ARM GRAVITON3 + COOL COST
            </span>
            <div className="font-sans font-bold text-2xl text-text">
              ${armCost.toFixed(2)} <span className="text-xs font-mono font-normal">/ mo</span>
            </div>
            <span className="font-mono text-[10px] text-muted mt-1 block">
              ${(armCost * 12).toFixed(2)} annually
            </span>
          </div>

          <div className="p-4 rounded-none bg-sev-low/10 border border-sev-low/40">
            <span className="font-mono text-[10px] uppercase tracking-wider text-sev-low block mb-1 font-medium">
              ANNUAL TAXPAYER SAVINGS
            </span>
            <div className="font-sans font-bold text-2xl text-text">
              ${annualSavings.toFixed(2)}
            </div>
            <span className="font-mono text-[10px] text-sev-low mt-1 block font-bold">
              {costSavingsPct}% NET OPERATIONAL REDUCTION
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceBenchmark;
