import React from 'react';
import type { WorkflowStage, WorkflowStageStatus } from '../../types/agent';
import { cn } from '../../lib/utils';
import {
  Eye,
  ShieldCheck,
  RefreshCw,
  BarChart2,
  FileText,
  UserCheck,
  Check,
  X,
  Loader2,
} from 'lucide-react';

export interface AgentWorkflowProps {
  currentStage: WorkflowStage;
  workflowStages?: Record<WorkflowStage, WorkflowStageStatus>;
  className?: string;
}

const STAGE_CONFIG: {
  stage: WorkflowStage;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { stage: 'OBSERVE', label: 'Observe', description: 'Stream Ingestion', icon: Eye },
  { stage: 'VERIFY', label: 'Verify', description: 'Anomaly Detection', icon: ShieldCheck },
  { stage: 'RECHECK', label: 'Recheck', description: 'Temporal Buffer', icon: RefreshCw },
  { stage: 'ASSESS', label: 'Assess', description: 'Severity Analysis', icon: BarChart2 },
  { stage: 'REPORT', label: 'Report', description: 'Dossier Generation', icon: FileText },
  { stage: 'HUMAN_REVIEW', label: 'Human Review', description: 'Inspector Signoff', icon: UserCheck },
];

const STAGE_ORDER: WorkflowStage[] = [
  'OBSERVE',
  'VERIFY',
  'RECHECK',
  'ASSESS',
  'REPORT',
  'HUMAN_REVIEW',
];

export const AgentWorkflow: React.FC<AgentWorkflowProps> = ({
  currentStage,
  workflowStages,
  className,
}) => {
  const currentIdx = STAGE_ORDER.indexOf(currentStage);

  const getStageStatus = (stage: WorkflowStage): WorkflowStageStatus => {
    if (workflowStages && workflowStages[stage]) {
      return workflowStages[stage];
    }
    const idx = STAGE_ORDER.indexOf(stage);
    if (idx < currentIdx) return 'COMPLETED';
    if (idx === currentIdx) return 'RUNNING';
    return 'PENDING';
  };

  return (
    <div className={cn('w-full rounded-none bg-surface border border-border p-6', className)}>
      {/* Header bar */}
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-none bg-sev-low" />
          <h3 className="font-mono text-xs uppercase tracking-wider text-text font-bold">
            Autonomous Agent Inspection Pipeline
          </h3>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px] text-muted">
          <span className="uppercase tracking-wider">Active Stage:</span>
          <span className="text-text font-bold px-2 py-0.5 rounded-none bg-surface-alt border border-border">
            {currentStage}
          </span>
        </div>
      </div>

      {/* Stepper container: Horizontal on desktop (md), Vertical on mobile */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 md:gap-0 relative">
        {STAGE_CONFIG.map((item, idx) => {
          const status = getStageStatus(item.stage);
          const Icon = item.icon;
          const isLast = idx === STAGE_CONFIG.length - 1;

          return (
            <React.Fragment key={item.stage}>
              {/* Step Node */}
              <div className="flex md:flex-col items-center md:items-center gap-4 md:gap-2.5 z-10 group relative flex-1">
                {/* Node Square */}
                <div
                  className={cn(
                    'w-10 h-10 rounded-none flex items-center justify-center transition-colors relative shrink-0 border',
                    status === 'COMPLETED' &&
                      'bg-sev-low border-sev-low text-white',
                    status === 'RUNNING' &&
                      'bg-accent border-accent text-black font-bold',
                    status === 'FAILED' &&
                      'bg-sev-high border-sev-high text-white',
                    status === 'PENDING' &&
                      'bg-surface border-border text-muted'
                  )}
                >
                  {status === 'COMPLETED' ? (
                    <Check className="w-5 h-5 stroke-[2.5]" />
                  ) : status === 'RUNNING' ? (
                    <div className="flex items-center justify-center relative">
                      <Loader2 className="w-5 h-5 stroke-[2.5] animate-spin text-black" />
                    </div>
                  ) : status === 'FAILED' ? (
                    <X className="w-5 h-5 stroke-[2.5]" />
                  ) : (
                    <Icon className="w-4 h-4 stroke-[1.75]" />
                  )}
                </div>

                {/* Node Labels */}
                <div className="flex flex-col md:items-center text-left md:text-center min-w-0">
                  <div className="flex items-center gap-1.5 md:justify-center">
                    <span
                      className={cn(
                        'font-mono text-[11px] font-bold uppercase tracking-wider transition-colors',
                        status === 'RUNNING'
                          ? 'text-text'
                          : status === 'COMPLETED'
                          ? 'text-text'
                          : status === 'FAILED'
                          ? 'text-sev-high'
                          : 'text-muted'
                      )}
                    >
                      {item.label}
                    </span>
                  </div>
                  <span className="text-[10px] text-muted font-sans truncate hidden sm:block">
                    {item.description}
                  </span>
                  <span
                    className={cn(
                      'font-mono text-[9px] uppercase tracking-wider mt-0.5 font-semibold',
                      status === 'COMPLETED' && 'text-sev-low',
                      status === 'RUNNING' && 'text-hazard',
                      status === 'FAILED' && 'text-sev-high',
                      status === 'PENDING' && 'text-muted'
                    )}
                  >
                    {status}
                  </span>
                </div>
              </div>

              {/* Connecting Line */}
              {!isLast && (
                <div className="md:flex-1 flex md:items-center justify-center my-[-4px] md:my-0 md:mx-[-8px] z-0">
                  {/* Desktop horizontal connector */}
                  <div className="hidden md:block w-full h-[1px] bg-border relative">
                    <div
                      className={cn(
                        'h-full transition-all duration-500',
                        status === 'COMPLETED'
                          ? 'w-full bg-border-strong'
                          : status === 'RUNNING'
                          ? 'w-1/2 bg-accent'
                          : 'w-0'
                      )}
                    />
                  </div>

                  {/* Mobile vertical connector */}
                  <div className="md:hidden w-[1px] h-6 ml-5 my-1 bg-border">
                    <div
                      className={cn(
                        'w-full transition-all duration-500',
                        status === 'COMPLETED' ? 'h-full bg-border-strong' : 'h-0'
                      )}
                    />
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
