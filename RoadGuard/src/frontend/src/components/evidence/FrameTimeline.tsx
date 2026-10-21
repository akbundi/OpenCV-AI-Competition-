import React from 'react';
import type { FrameEvidence } from '../../types/evidence';
import { FrameThumbnail } from './FrameThumbnail';
import { cn } from '../../lib/utils';
import { ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';

export interface FrameTimelineProps {
  frames: FrameEvidence[];
  activeFrameNumber: number;
  onSelect: (frameNumber: number) => void;
  className?: string;
}

export const FrameTimeline: React.FC<FrameTimelineProps> = ({
  frames,
  activeFrameNumber,
  onSelect,
  className,
}) => {
  const currentIndex = frames.findIndex((f) => f.frameNumber === activeFrameNumber);

  const handlePrev = () => {
    if (currentIndex > 0) {
      onSelect(frames[currentIndex - 1].frameNumber);
    }
  };

  const handleNext = () => {
    if (currentIndex < frames.length - 1) {
      onSelect(frames[currentIndex + 1].frameNumber);
    }
  };

  return (
    <div
      className={cn(
        'rounded-none bg-surface p-4 border border-border flex flex-col gap-3',
        className
      )}
    >
      {/* Header bar with controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-3.5 h-3.5 text-muted stroke-[1.75]" />
          <span className="font-mono text-[10px] uppercase tracking-wider text-text font-bold">
            Temporal Multi-Frame Scrubber
          </span>
          <span className="font-mono text-[10px] text-muted">
            ({frames.length} TOTAL FRAMES)
          </span>
        </div>

        {/* Stepper buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePrev}
            disabled={currentIndex <= 0}
            className="w-6 h-6 rounded-none bg-surface-alt border border-border flex items-center justify-center text-text hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="Previous Frame"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="font-mono text-xs font-bold text-text px-1">
            F#{String(activeFrameNumber).padStart(4, '0')}
          </span>
          <button
            onClick={handleNext}
            disabled={currentIndex >= frames.length - 1}
            className="w-6 h-6 rounded-none bg-surface-alt border border-border flex items-center justify-center text-text hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="Next Frame"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Scrubbable Frame Strip */}
      <div className="overflow-x-auto pb-2 pt-1 flex items-center gap-3 no-scrollbar scroll-smooth">
        {frames.map((frame) => {
          const isActive = frame.frameNumber === activeFrameNumber;

          return (
            <div key={frame.frameNumber} className="w-36 flex-shrink-0 flex flex-col gap-1.5">
              <FrameThumbnail
                frame={frame}
                isActive={isActive}
                onClick={() => onSelect(frame.frameNumber)}
              />

              {/* Confidence progress indicator beneath frame */}
              <div className="flex items-center justify-between font-mono text-[9px] text-muted px-0.5">
                <span className={cn(isActive && 'text-text font-bold')}>
                  F#{frame.frameNumber}
                </span>
                <span
                  className={cn(
                    'font-semibold',
                    frame.confidence >= 75 ? 'text-sev-low' : 'text-hazard'
                  )}
                >
                  {frame.confidence}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
