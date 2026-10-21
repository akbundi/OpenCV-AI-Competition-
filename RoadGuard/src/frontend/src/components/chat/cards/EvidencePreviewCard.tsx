import React from 'react';
import { Link } from 'react-router-dom';
import type { FrameEvidence } from '../../../types/evidence';
import { BoundingBox } from '../../evidence/BoundingBox';
import { Eye, Layers } from 'lucide-react';
import { cn } from '../../../lib/utils';

export interface EvidencePreviewCardProps {
  frame: FrameEvidence;
  inspectionId: string;
  className?: string;
}

export const EvidencePreviewCard: React.FC<EvidencePreviewCardProps> = ({
  frame,
  inspectionId,
  className,
}) => {
  const effectiveId = inspectionId || 'RG-0001';

  return (
    <div
      className={cn(
        'rounded-none bg-surface border border-border p-4 flex flex-col gap-3 text-left max-w-lg',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-accent stroke-[1.75]" />
          <h4 className="font-mono text-xs uppercase tracking-wider text-text font-bold">
            Optical Sensor Evidence
          </h4>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
          FRAME #{String(frame.frameNumber).padStart(4, '0')}
        </span>
      </div>

      {/* Frame Preview with Bounding Box */}
      <div className="relative aspect-[16/9] w-full bg-black rounded-none overflow-hidden border border-border">
        <img
          src={frame.annotatedUrl || frame.imageUrl}
          alt={`Frame #${frame.frameNumber}`}
          className="w-full h-full object-cover"
        />

        {frame.detection?.bbox && (
          <BoundingBox
            bbox={frame.detection.bbox}
            label={frame.detection.damageClass || 'D40'}
            confidence={frame.detection.confidence || frame.confidence}
          />
        )}
      </div>

      {/* Footer Info & Deep Link */}
      <div className="flex items-center justify-between pt-1 font-mono text-xs">
        <div className="flex items-center gap-2 text-[10px] text-muted">
          <span>CONF: {frame.confidence}%</span>
          <span>•</span>
          <span className="uppercase">{frame.status}</span>
        </div>

        <Link
          to={`/live/${effectiveId}#evidence`}
          className="inline-flex items-center gap-1 font-mono text-xs uppercase tracking-wider text-text hover:text-accent font-semibold transition-colors"
        >
          <span>View All Evidence →</span>
        </Link>
      </div>
    </div>
  );
};

export default EvidencePreviewCard;
