import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  getInspectionHistory,
  getModelEvaluation,
  getAgentState,
} from '../services/api';
import type { InspectionSummary } from '../types/inspection';
import type { ModelEvaluation } from '../types/evaluation';
import type { AgentEvent } from '../types/agent';
import { MetricCard } from '../components/ui/MetricCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { SeverityBadge } from '../components/ui/SeverityBadge';
import { DamageClassChip } from '../components/ui/DamageClassChip';
import { ConfidenceBar } from '../components/ui/ConfidenceBar';
import { LoadingState } from '../components/ui/LoadingState';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { EventLog } from '../components/agent/EventLog';
import {
  Activity,
  AlertTriangle,
  Clock,
  Target,
  FileText,
  ArrowRight,
  ArrowUpRight,
  Play,
  Plus,
  Image as ImageIcon,
  Video,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const [inspections, setInspections] = useState<InspectionSummary[]>([]);
  const [modelEval, setModelEval] = useState<ModelEvaluation | null>(null);
  const [agentEvents, setAgentEvents] = useState<AgentEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all dashboard telemetry
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [history, evaluation, agentState] = await Promise.all([
        getInspectionHistory(),
        getModelEvaluation(),
        getAgentState('RG-0001'),
      ]);

      setInspections(history);
      setModelEval(evaluation);

      // Order newest events first (~8 latest)
      const sortedEvents = [...agentState.events].reverse().slice(0, 8);
      setAgentEvents(sortedEvents);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to retrieve telemetry data.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Periodic refresh for agent activity feed every 10 seconds
  useEffect(() => {
    const timer = window.setInterval(async () => {
      try {
        const agentState = await getAgentState('RG-0001');
        const sortedEvents = [...agentState.events].reverse().slice(0, 8);
        setAgentEvents(sortedEvents);
      } catch {
        // Silently continue polling
      }
    }, 10000);

    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="h-40 rounded-none bg-surface border border-border animate-pulse" />
        <LoadingState variant="card" count={5} />
        <LoadingState variant="table" count={6} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ErrorState
          title="COMMAND TELEMETRY OFFLINE"
          reason={error}
          onRetry={loadDashboardData}
        />
      </div>
    );
  }

  // Derive real KPI metrics from API results only
  const totalInspections = inspections.length;
  const activeInspections = inspections.filter(
    (i) => !['APPROVED', 'REJECTED', 'CLOSED'].includes(i.status)
  ).length;
  const highSeverityIssues = inspections.filter(
    (i) => i.severity === 'HIGH' && i.status !== 'CLOSED'
  ).length;
  const reportsPending = inspections.filter(
    (i) => i.status === 'WAITING_FOR_APPROVAL'
  ).length;
  const accuracyPct = modelEval ? `${modelEval.mAP.toFixed(1)}%` : '—';

  // 8 latest inspections sorted desc by createdAt
  const recentInspections = [...inspections]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* 1. HERO BAND — Compact, max-height ~40vh, prevents pushing KPIs below fold on 1080p */}
      <section className="relative rounded-none bg-surface p-6 sm:p-8 border border-border overflow-hidden">
        <div className="max-w-3xl space-y-3 relative z-10">
          {/* Mono label */}
          <div className="inline-flex items-center gap-2">
            <span className="w-2 h-2 rounded-none bg-sev-low" />
            <span className="font-mono text-[11px] uppercase tracking-wider text-muted font-medium">
              AGENTIC ROAD INSPECTION
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-sans font-bold text-3xl sm:text-4xl lg:text-[46px] text-text tracking-tight leading-[1.05]">
            Autonomous road-inspection system.
          </h1>

          {/* One-line subhead */}
          <p className="font-sans text-sm sm:text-base text-muted font-normal leading-snug">
            Multi-frame verification for pavement distress.
          </p>

          {/* CTAs */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/new')}
              className="bg-text text-bg border border-border-strong px-5 py-2.5 rounded-none font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>NEW INSPECTION</span>
            </button>

            <button
              onClick={() => navigate('/live/RG-0001')}
              className="bg-surface hover:bg-surface-alt text-text border border-border px-5 py-2.5 rounded-none font-mono text-xs font-semibold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Play className="w-3.5 h-3.5 stroke-[2]" />
              <span>VIEW LIVE DEMO</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. KPI ROW — 5 MetricCards in responsive grid */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <MetricCard
          label="Total Inspections"
          value={totalInspections}
          icon={FileText}
        />
        <MetricCard
          label="Active Inspections"
          value={activeInspections}
          icon={Activity}
          delta={
            activeInspections > 0
              ? { value: `${activeInspections} in pipeline`, neutral: true }
              : undefined
          }
        />
        <MetricCard
          label="High Severity Issues"
          value={highSeverityIssues}
          icon={AlertTriangle}
          delta={
            highSeverityIssues > 0
              ? { value: 'Requires human review', positive: false }
              : undefined
          }
        />
        <MetricCard
          label="Reports Pending"
          value={reportsPending}
          icon={Clock}
          delta={
            reportsPending > 0
              ? { value: `${reportsPending} awaiting`, neutral: true }
              : undefined
          }
        />
        <MetricCard
          label="Detection Accuracy"
          value={accuracyPct}
          description="sample data"
          icon={Target}
        />
      </section>

      {/* 3. TWO-COLUMN SECTION */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* LEFT (2/3) — Recent Inspections Table */}
        <div className="lg:col-span-2 rounded-none bg-surface border border-border p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-border">
            <div>
              <h2 className="font-mono text-xs uppercase tracking-wider text-text font-bold">
                Recent Inspections
              </h2>
              <p className="text-[11px] text-muted font-sans mt-0.5">
                8 latest autonomous inspection passes sorted by creation time
              </p>
            </div>
            <Link
              to="/history"
              className="font-mono text-[11px] text-muted hover:text-text uppercase tracking-wider flex items-center gap-1 transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {recentInspections.length === 0 ? (
            <EmptyState
              title="NO INSPECTIONS RECORDED"
              description="Initiate an automated survey to populate pavement telemetry data."
              action={{
                label: "START INSPECTION",
                onClick: () => navigate('/new'),
              }}
            />
          ) : (
            <div>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border-strong bg-surface-alt text-[11px] font-mono uppercase tracking-wider text-muted">
                      <th className="py-2.5 px-3">ID</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Damage</th>
                      <th className="py-2.5 px-3">Severity</th>
                      <th className="py-2.5 px-3 min-w-[120px]">Confidence</th>
                      <th className="py-2.5 px-3">Frames</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-2 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {recentInspections.map((insp) => (
                      <tr
                        key={insp.id}
                        onClick={() => navigate(`/inspection/${insp.id}`)}
                        className="group hover:bg-surface-alt transition-colors cursor-pointer text-xs font-mono"
                      >
                        {/* ID */}
                        <td className="py-3 px-3 font-bold text-text">
                          {insp.id}
                        </td>

                        {/* Date */}
                        <td className="py-3 px-3 text-muted text-[11px]">
                          {new Date(insp.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>

                        {/* Damage */}
                        <td className="py-3 px-3">
                          <DamageClassChip damageClass={insp.damageClass} size="sm" />
                        </td>

                        {/* Severity */}
                        <td className="py-3 px-3">
                          <SeverityBadge severity={insp.severity} size="sm" />
                        </td>

                        {/* Confidence */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <ConfidenceBar
                              confidence={insp.confidence}
                              size="sm"
                              showLabel={false}
                            />
                            <span className="text-[10px] text-muted w-8 text-right shrink-0">
                              {insp.confidence}%
                            </span>
                          </div>
                        </td>

                        {/* Frames Checked */}
                        <td className="py-3 px-3 text-muted text-[11px]">
                          {insp.framesChecked}f
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3">
                          <StatusBadge status={insp.status} size="sm" />
                        </td>

                        {/* Action Arrow */}
                        <td className="py-3 px-2 text-right">
                          <ArrowUpRight className="w-3.5 h-3.5 text-muted group-hover:text-text transition-colors ml-auto" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card List (below 768px) */}
              <div className="md:hidden divide-y divide-border space-y-3">
                {recentInspections.map((insp) => (
                  <div
                    key={insp.id}
                    onClick={() => navigate(`/inspection/${insp.id}`)}
                    className="pt-3 first:pt-0 hover:bg-surface-alt p-2 rounded-none transition-colors cursor-pointer flex flex-col gap-2 font-mono text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-text">{insp.id}</span>
                      <span className="text-[10px] text-muted">
                        {new Date(insp.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <DamageClassChip damageClass={insp.damageClass} size="sm" />
                        <SeverityBadge severity={insp.severity} size="sm" />
                      </div>
                      <StatusBadge status={insp.status} size="sm" />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-muted pt-0.5">
                      <span>Confidence: {insp.confidence}% ({insp.framesChecked}f)</span>
                      <ArrowUpRight className="w-3 h-3 text-muted" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT (1/3) — Recent Agent Activity */}
        <div className="lg:col-span-1 flex flex-col gap-3">
          <EventLog
            events={agentEvents}
            title="RECENT AGENT ACTIVITY"
            maxHeight="max-h-[460px]"
            autoScroll={false}
          />
        </div>
      </section>

      {/* 4. QUICK ACTIONS ROW */}
      <section className="rounded-none bg-surface p-5 border border-border flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted block mb-1 font-medium">
            RAPID WORKFLOW DISPATCH
          </span>
          <h3 className="font-sans font-semibold text-sm text-text">
            Quick Inspection Actions
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => navigate('/new?type=image')}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-none bg-surface hover:bg-surface-alt border border-border text-text font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <ImageIcon className="w-3.5 h-3.5 text-muted" />
            <span>New Image Inspection</span>
          </button>

          <button
            onClick={() => navigate('/new?type=video')}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-none bg-surface hover:bg-surface-alt border border-border text-text font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Video className="w-3.5 h-3.5 text-muted" />
            <span>New Video Inspection</span>
          </button>

          <button
            onClick={() => navigate('/history')}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-none bg-surface hover:bg-surface-alt border border-border text-text font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <span>View All Inspections</span>
            <ArrowRight className="w-3.5 h-3.5 text-muted" />
          </button>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
