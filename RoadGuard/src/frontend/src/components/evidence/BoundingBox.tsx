import React from 'react';
import { cn } from '../../lib/utils';

export interface BoundingBoxProps {
  bbox: { x: number; y: number; w: number; h: number };
  label?: string;
  confidence?: number;
  color?: string; // e.g. '#E5484D' or 'rose'
  isHovered?: boolean;
  onClick?: () => void;
  className?: string;
}

export const BoundingBox: React.FC<BoundingBoxProps> = ({
  bbox,
  label,
  confidence,
  color,
  isHovered = false,
  onClick,
  className,
}) => {
  // Normalize coords: if values are <= 1, assume 0-1 range and multiply by 100
  const isNormalized = bbox.x <= 1 && bbox.y <= 1 && bbox.w <= 1 && bbox.h <= 1;
  const left = isNormalized ? `${bbox.x * 100}%` : `${bbox.x}%`;
  const top = isNormalized ? `${bbox.y * 100}%` : `${bbox.y}%`;
  const width = isNormalized ? `${bbox.w * 100}%` : `${bbox.w}%`;
  const height = isNormalized ? `${bbox.h * 100}%` : `${bbox.h}%`;

  const borderColor = color || '#E5484D';

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      style={{
        left,
        top,
        width,
        height,
        borderColor,
      }}
      className={cn(
        'absolute border-2 transition-colors pointer-events-auto rounded-none',
        isHovered
          ? 'ring-1 ring-white z-20'
          : 'z-10',
        onClick && 'cursor-pointer hover:border-white',
        className
      )}
    >
      {/* Box corner brackets */}
      <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-white pointer-events-none" />
      <div className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-white pointer-events-none" />
      <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 border-white pointer-events-none" />
      <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-white pointer-events-none" />

      {/* Floating tag label */}
      {(label || confidence !== undefined) && (
        <div
          style={{ backgroundColor: borderColor }}
          className="absolute -top-6 left-0 px-1.5 py-0.5 rounded-none text-[9px] font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1 whitespace-nowrap"
        >
          {label && <span>{label}</span>}
          {confidence !== undefined && (
            <span className="opacity-90 font-normal">
              {Math.round(confidence)}%
            </span>
          )}
        </div>
      )}
    </div>
  );
};
