import React from 'react';
import { Link } from 'react-router-dom';
import type { FrameEvidence } from '../../../types/evidence';
import { FrameThumbnail } from '../../evidence/FrameThumbnail';
import { PersistenceIndicator } from '../../evidence/PersistenceIndicator';
import { Layers, ArrowRight } from 'lucide-react';
import { cn } from '../../../lib/utils';

export interface EvidenceStripCardProps {
  evidence: FrameEvidence[];
  persistenceCount?: number;
  totalFrames?: number;
  inspectionId: string;
  className?: string;
}

export const EvidenceStripCard: React.FC<EvidenceStripCardProps> = ({
  evidence,
  persistenceCount = 7,
  totalFrames = 7,
  inspectionId,
  className,
}) => {
  const frameList = evidence && evidence.length > 0 ? evidence : [];
  const count = frameList.length || totalFrames;

  return (
    <div
      className={cn(
        'rounded-none bg-surface border border-border p-4 flex flex-col gap-4 text-left max-w-2xl',
        className
      )}
    >
      {/* Header: "X SUPPORTING FRAMES" */}
      <div className="flex items-center justify-between pb-2.5 border-b border-border">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-accent stroke-[1.75]" />
          <h4 className="font-mono text-xs uppercase tracking-wider text-text font-bold">
            {count} SUPPORTING FRAMES
          </h4>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
          OPENCV 5 SENSOR BUFFER
        </span>
      </div>

      {/* Horizontal Scrollable Row of FrameThumbnail */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
        {frameList.map((frame) => (
          <div key={frame.frameNumber} className="w-40 shrink-0">
            <FrameThumbnail frame={frame} />
          </div>
        ))}
      </div>

      {/* Below the strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-border">
        {/* Persistence Indicator */}
        <PersistenceIndicator
          count={persistenceCount}
          total={totalFrames}
          status="CONFIRMED"
        />

        {/* Deep Link to Live Gallery */}
        <Link
          to={`/live/${inspectionId || 'RG-0001'}#evidence`}
          className="inline-flex items-center gap-1.5 font-mono text-xs text-text hover:text-accent font-semibold uppercase tracking-wider transition-colors"
        >
          <span>View Full Evidence Gallery →</span>
        </Link>
      </div>
    </div>
  );
};

export default EvidenceStripCard;
