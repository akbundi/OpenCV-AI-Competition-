import React from 'react';
import type { FrameEvidence, FrameEvidenceStatus } from '../../types/evidence';
import { cn } from '../../lib/utils';

export interface FrameThumbnailProps {
  frame: FrameEvidence;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

const STATUS_DOT: Record<FrameEvidenceStatus, { dot: string; label: string; text: string }> = {
  NO_DAMAGE: { dot: 'bg-muted', label: 'CLEAN', text: 'text-muted' },
  POSSIBLE: { dot: 'bg-hazard', label: 'POSSIBLE', text: 'text-hazard' },
  DETECTED: { dot: 'bg-hazard', label: 'DETECTED', text: 'text-hazard' },
  CONFIRMED: { dot: 'bg-sev-high', label: 'CONFIRMED', text: 'text-sev-high' },
};

export const FrameThumbnail: React.FC<FrameThumbnailProps> = ({
  frame,
  isActive = false,
  onClick,
  className,
}) => {
  const statusInfo = STATUS_DOT[frame.status] || STATUS_DOT.NO_DAMAGE;

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={cn(
        'relative rounded-none overflow-hidden border transition-colors group bg-surface-alt aspect-[16/9] flex-shrink-0 select-none',
        isActive
          ? 'border-accent ring-1 ring-accent'
          : 'border-border hover:border-border-strong',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {/* Frame image (prefers annotated if present) */}
      <img
        src={frame.annotatedUrl || frame.imageUrl}
        alt={`Frame #${frame.frameNumber}`}
        className="w-full h-full object-cover"
        loading="lazy"
      />

      {/* Frame Number Tag (top left) */}
      <div className="absolute top-1 left-1 bg-surface/90 border border-border rounded-none px-1.5 py-0.5 text-[9px] font-mono text-text">
        F#{String(frame.frameNumber).padStart(4, '0')}
      </div>

      {/* Status dot + label (top right) */}
      <div className="absolute top-1 right-1 bg-surface/90 border border-border rounded-none px-1.5 py-0.5 flex items-center gap-1.5">
        <span className={cn('w-1.5 h-1.5 rounded-none', statusInfo.dot)} />
        <span className={cn('text-[8px] font-mono uppercase tracking-wider font-bold', statusInfo.text)}>
          {statusInfo.label}
        </span>
      </div>

      {/* Confidence Pill (bottom right) */}
      <div className="absolute bottom-1 right-1 bg-surface/90 border border-border rounded-none px-1.5 py-0.5 font-mono text-[9px] font-bold text-text">
        {frame.confidence}%
      </div>

      {/* Timestamp (bottom left) */}
      <div className="absolute bottom-1 left-1 font-mono text-[8px] text-muted bg-surface/90 border border-border px-1 rounded-none">
        {frame.timestamp}
      </div>
    </div>
  );
};
