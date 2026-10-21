import React from 'react';
import type { InspectionStatus } from '../../types/agent';
import type { ReportStatus } from '../../types/report';
import { cn } from '../../lib/utils';

export type BadgeStatus = InspectionStatus | ReportStatus;

export interface StatusBadgeProps {
  status: BadgeStatus;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
  className?: string;
}

const STATUS_STYLE_MAP: Record<
  BadgeStatus,
  { label: string; bg: string; text: string; border: string; dot: string; pulse?: boolean }
> = {
  UPLOADED: {
    label: 'UPLOADED',
    bg: 'bg-muted/10',
    text: 'text-muted',
    border: 'border-muted/30',
    dot: 'bg-muted',
  },
  PROCESSING: {
    label: 'PROCESSING',
    bg: 'bg-accent/10',
    text: 'text-text font-bold',
    border: 'border-accent/40',
    dot: 'bg-accent',
    pulse: true,
  },
  OBSERVING: {
    label: 'OBSERVING',
    bg: 'bg-accent/10',
    text: 'text-text font-bold',
    border: 'border-accent/40',
    dot: 'bg-accent',
    pulse: true,
  },
  DETECTING: {
    label: 'DETECTING',
    bg: 'bg-hazard/10',
    text: 'text-hazard',
    border: 'border-hazard/40',
    dot: 'bg-hazard',
    pulse: true,
  },
  VERIFYING: {
    label: 'VERIFYING',
    bg: 'bg-hazard/10',
    text: 'text-hazard',
    border: 'border-hazard/40',
    dot: 'bg-hazard',
    pulse: true,
  },
  REINSPECTING: {
    label: 'RE-INSPECTING',
    bg: 'bg-accent/10',
    text: 'text-text font-bold',
    border: 'border-accent/40',
    dot: 'bg-accent',
    pulse: true,
  },
  ASSESSING: {
    label: 'ASSESSING',
    bg: 'bg-hazard/10',
    text: 'text-hazard',
    border: 'border-hazard/40',
    dot: 'bg-hazard',
    pulse: true,
  },
  REPORT_GENERATING: {
    label: 'GENERATING REPORT',
    bg: 'bg-accent/10',
    text: 'text-text font-bold',
    border: 'border-accent/40',
    dot: 'bg-accent',
    pulse: true,
  },
  WAITING_FOR_APPROVAL: {
    label: 'WAITING APPROVAL',
    bg: 'bg-status-pending/10',
    text: 'text-status-pending',
    border: 'border-status-pending/40',
    dot: 'bg-status-pending',
    pulse: true,
  },
  PENDING: {
    label: 'PENDING APPROVAL',
    bg: 'bg-status-pending/10',
    text: 'text-status-pending',
    border: 'border-status-pending/40',
    dot: 'bg-status-pending',
    pulse: true,
  },
  APPROVED: {
    label: 'APPROVED',
    bg: 'bg-status-approved/10',
    text: 'text-status-approved',
    border: 'border-status-approved/40',
    dot: 'bg-status-approved',
  },
  REJECTED: {
    label: 'REJECTED',
    bg: 'bg-status-rejected/10',
    text: 'text-status-rejected',
    border: 'border-status-rejected/40',
    dot: 'bg-status-rejected',
  },
  CLOSED: {
    label: 'CLOSED',
    bg: 'bg-muted/10',
    text: 'text-muted',
    border: 'border-muted/30',
    dot: 'bg-muted',
  },
};

const SIZE_STYLES = {
  sm: 'text-[10px] px-2 py-0.5 gap-1.5',
  md: 'text-[11px] px-2.5 py-1 gap-2',
  lg: 'text-xs px-3 py-1.5 gap-2.5',
};

const DOT_SIZES = {
  sm: 'w-1.5 h-1.5',
  md: 'w-1.5 h-1.5',
  lg: 'w-2 h-2',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showDot = true,
  className,
}) => {
  const config = STATUS_STYLE_MAP[status] || {
    label: status,
    bg: 'bg-muted/10',
    text: 'text-muted',
    border: 'border-muted/30',
    dot: 'bg-muted',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-mono uppercase tracking-wider rounded-none border transition-colors select-none font-bold',
        config.bg,
        config.text,
        config.border,
        SIZE_STYLES[size],
        className
      )}
    >
      {showDot && (
        <span
          className={cn(
            'rounded-none shrink-0',
            config.dot,
            DOT_SIZES[size],
            config.pulse && 'animate-pulse'
          )}
        />
      )}
      {config.label}
    </span>
  );
};
