import React, { useState } from 'react';
import type { FrameEvidence } from '../../types/evidence';
import { FrameThumbnail } from './FrameThumbnail';
import { ConfidenceBar } from '../ui/ConfidenceBar';
import { EmptyState } from '../ui/EmptyState';
import { cn } from '../../lib/utils';
import { Layers, X, Sliders, ChevronLeft, ChevronRight } from 'lucide-react';

export interface EvidenceGalleryProps {
  frames: FrameEvidence[];
  title?: string;
  className?: string;
}

export const EvidenceGallery: React.FC<EvidenceGalleryProps> = ({
  frames,
  title,
  className,
}) => {
  const [lightboxFrameIndex, setLightboxFrameIndex] = useState<number | null>(null);
  const [showAnnotated, setShowAnnotated] = useState(true);

  if (!frames || frames.length === 0) {
    return (
      <EmptyState
        title="NO FRAME EVIDENCE AVAILABLE"
        description="Frames will populate as the autonomous pipeline processes the road inspection sequence."
        className={className}
      />
    );
  }

  const selectedFrame = lightboxFrameIndex !== null ? frames[lightboxFrameIndex] : null;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxFrameIndex !== null && lightboxFrameIndex > 0) {
      setLightboxFrameIndex(lightboxFrameIndex - 1);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxFrameIndex !== null && lightboxFrameIndex < frames.length - 1) {
      setLightboxFrameIndex(lightboxFrameIndex + 1);
    }
  };

  return (
    <div
      className={cn(
        'rounded-none bg-surface p-6 border border-border flex flex-col',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-border">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-muted stroke-[1.75]" />
          <h3 className="font-mono text-xs uppercase tracking-wider text-text font-bold">
            {title || `${frames.length} SUPPORTING FRAMES`}
          </h3>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
          CLICK FRAME TO ENLARGE
        </span>
      </div>

      {/* Grid of Frame Thumbnails */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {frames.map((frame, idx) => (
          <FrameThumbnail
            key={frame.frameNumber}
            frame={frame}
            isActive={lightboxFrameIndex === idx}
            onClick={() => setLightboxFrameIndex(idx)}
          />
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedFrame && lightboxFrameIndex !== null && (
        <div
          onClick={() => setLightboxFrameIndex(null)}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="rounded-none bg-surface border border-border-strong max-w-4xl w-full overflow-hidden flex flex-col shadow-none relative"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-surface-alt">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-none bg-surface border border-border font-mono text-xs font-bold text-text tracking-wider">
                  FRAME #{String(selectedFrame.frameNumber).padStart(4, '0')}
                </span>
                <span className="font-mono text-xs text-muted">
                  [{selectedFrame.timestamp}]
                </span>
                <span
                  className={cn(
                    'text-[10px] font-mono uppercase px-2 py-0.5 rounded-none font-bold border',
                    selectedFrame.status === 'CONFIRMED'
                      ? 'bg-sev-high/10 text-sev-high border-sev-high/40'
                      : selectedFrame.status === 'DETECTED'
                      ? 'bg-hazard/10 text-hazard border-hazard/40'
                      : 'bg-surface text-muted border-border'
                  )}
                >
                  {selectedFrame.status}
                </span>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowAnnotated(!showAnnotated)}
                  className="px-3 py-1 rounded-none bg-surface hover:bg-surface-alt border border-border font-mono text-[10px] text-text uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Sliders className="w-3 h-3" />
                  {showAnnotated ? 'SHOW RAW FRAME' : 'SHOW OVERLAY'}
                </button>
                <button
                  onClick={() => setLightboxFrameIndex(null)}
                  className="w-7 h-7 rounded-none bg-surface hover:bg-surface-alt border border-border flex items-center justify-center text-muted hover:text-text transition-colors cursor-pointer"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body / Image Viewport */}
            <div className="relative bg-black aspect-[16/9] flex items-center justify-center overflow-hidden">
              <img
                src={showAnnotated ? selectedFrame.annotatedUrl || selectedFrame.imageUrl : selectedFrame.imageUrl}
                alt={`Enlarged frame ${selectedFrame.frameNumber}`}
                className="w-full h-full object-contain"
              />

              {/* Prev Button */}
              {lightboxFrameIndex > 0 && (
                <button
                  onClick={handlePrev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-none bg-surface/90 border border-border flex items-center justify-center text-text hover:bg-surface transition-colors cursor-pointer"
                  title="Previous Frame"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}

              {/* Next Button */}
              {lightboxFrameIndex < frames.length - 1 && (
                <button
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-none bg-surface/90 border border-border flex items-center justify-center text-text hover:bg-surface transition-colors cursor-pointer"
                  title="Next Frame"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-surface-alt border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1 w-full sm:w-auto">
                <ConfidenceBar confidence={selectedFrame.confidence} size="md" />
              </div>
              {selectedFrame.detection && (
                <div className="flex items-center gap-3 font-mono text-xs text-text">
                  <span className="text-[10px] text-muted uppercase">Detection Lock:</span>
                  <span className="px-2 py-0.5 rounded-none bg-sev-high/10 border border-sev-high/40 text-sev-high font-bold">
                    {selectedFrame.detection.damageClass}
                  </span>
                  <span className="text-muted">
                    BBox: [{selectedFrame.detection.bbox.x}%, {selectedFrame.detection.bbox.y}%]
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
