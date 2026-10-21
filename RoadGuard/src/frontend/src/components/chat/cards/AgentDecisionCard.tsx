import React from 'react';
import type { DamageClass } from '../../../types/inspection';
import type { WorkflowStage, InspectionStatus } from '../../../types/agent';
import { DamageClassChip } from '../../ui/DamageClassChip';
import { StatusBadge } from '../../ui/StatusBadge';
import { Bot } from 'lucide-react';
import { cn } from '../../../lib/utils';

export interface AgentDecisionCardProps {
  damageClass?: DamageClass;
  confidence?: number;
  stage?: WorkflowStage;
  status?: InspectionStatus;
  actionTaken?: string;
  inspectionId?: string;
  className?: string;
}

export const AgentDecisionCard: React.FC<AgentDecisionCardProps> = ({
  damageClass = 'D40',
  confidence = 91,
  stage = 'RECHECK',
  status = 'VERIFYING',
  actionTaken = 'Consecutive frame temporal verification initiated',
  inspectionId = 'RG-0001',
  className,
}) => {
  return (
    <div
      className={cn(
        'rounded-none bg-surface border border-border p-5 flex flex-col gap-4 text-left max-w-lg',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-accent stroke-[1.75]" />
          <h4 className="font-mono text-xs uppercase tracking-wider text-text font-bold">
            Agent Decision Matrix
          </h4>
        </div>
        <StatusBadge status={status} size="sm" />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-3 font-mono">
        <div className="p-2.5 rounded-none bg-surface-alt border border-border flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-wider text-muted font-medium">
            DISTRESS CLASS
          </span>
          <DamageClassChip damageClass={damageClass} size="sm" active />
        </div>

        <div className="p-2.5 rounded-none bg-surface-alt border border-border flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-wider text-muted font-medium">
            STAGE CONFIDENCE
          </span>
          <span className="text-sm font-bold text-text">
            {confidence}%
          </span>
        </div>
      </div>

      {/* Action Taken */}
      <div className="p-3 rounded-none bg-surface-alt border border-border flex flex-col gap-1">
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted font-medium">
          ACTION EXECUTED
        </span>
        <p className="font-mono text-xs text-text leading-relaxed">
          {actionTaken}
        </p>
      </div>

      {/* Pipeline State Footer */}
      <div className="flex items-center justify-between pt-1 font-mono text-[11px] text-muted border-t border-border">
        <span>ACTIVE STAGE: {stage}</span>
        <span>ID: #{inspectionId}</span>
      </div>
    </div>
  );
};

export default AgentDecisionCard;
