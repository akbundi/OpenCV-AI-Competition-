import React, { useState } from 'react';
import type { Detection } from '../../types/inspection';
import { DAMAGE_CLASS_META } from '../../types/inspection';
import { BoundingBox } from './BoundingBox';
import { cn } from '../../lib/utils';

export interface DetectionOverlayProps {
  imageUrl: string;
  detections?: Detection[];
  alt?: string;
  selectedDetectionId?: string;
  onSelectDetection?: (id: string) => void;
  className?: string;
}

const CLASS_COLORS: Record<string, string> = {
  D00: '#38BDF8', // Sky
  D10: '#2DD4BF', // Teal
  D20: '#F59E0B', // Amber
  D40: '#E5484D', // Red / Rose
};

export const DetectionOverlay: React.FC<DetectionOverlayProps> = ({
  imageUrl,
  detections = [],
  alt = 'Inspection frame with detection overlay',
  selectedDetectionId,
  onSelectDetection,
  className,
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div
      className={cn(
        'relative rounded-none overflow-hidden bg-black select-none aspect-[16/9] border border-border',
        className
      )}
    >
      {/* Base Image */}
      <img
        src={imageUrl}
        alt={alt}
        className="w-full h-full object-cover block"
        loading="lazy"
      />

      {/* Render Bounding Boxes */}
      {detections.map((det) => {
        const meta = DAMAGE_CLASS_META[det.damageClass];
        const isSelected = selectedDetectionId === det.id;
        const isHovered = hoveredId === det.id || isSelected;
        const color = CLASS_COLORS[det.damageClass] || '#E5484D';
        const label = meta ? `${det.damageClass} ${meta.label}` : det.damageClass;

        return (
          <div
            key={det.id}
            onMouseEnter={() => setHoveredId(det.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <BoundingBox
              bbox={det.bbox}
              label={label}
              confidence={det.confidence}
              color={color}
              isHovered={isHovered}
              onClick={() => onSelectDetection && onSelectDetection(det.id)}
            />
          </div>
        );
      })}
    </div>
  );
};
