import React from 'react';
import type { DamageClass } from '../../types/inspection';
import { DAMAGE_CLASS_META } from '../../types/inspection';
import { cn } from '../../lib/utils';

export interface DamageClassChipProps {
  damageClass: DamageClass;
  size?: 'sm' | 'md';
  showDescription?: boolean;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

const CLASS_ACCENTS: Record<DamageClass, { border: string; bg: string; text: string; dot: string }> = {
  D00: {
    border: 'border-[#38BDF8]/40',
    bg: 'bg-[#38BDF8]/10',
    text: 'text-[#38BDF8]',
    dot: 'bg-[#38BDF8]',
  },
  D10: {
    border: 'border-[#2DD4BF]/40',
    bg: 'bg-[#2DD4BF]/10',
    text: 'text-[#2DD4BF]',
    dot: 'bg-[#2DD4BF]',
  },
  D20: {
    border: 'border-[#F59E0B]/40',
    bg: 'bg-[#F59E0B]/10',
    text: 'text-[#F59E0B]',
    dot: 'bg-[#F59E0B]',
  },
  D40: {
    border: 'border-[#E5484D]/40',
    bg: 'bg-[#E5484D]/10',
    text: 'text-[#E5484D]',
    dot: 'bg-[#E5484D]',
  },
};

export const DamageClassChip: React.FC<DamageClassChipProps> = ({
  damageClass,
  size = 'md',
  showDescription = false,
  active = false,
  onClick,
  className,
}) => {
  const meta = DAMAGE_CLASS_META[damageClass];
  const accent = CLASS_ACCENTS[damageClass] || CLASS_ACCENTS.D40;

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      title={meta ? `${meta.label}: ${meta.description}` : damageClass}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-none font-mono transition-colors select-none border',
        accent.bg,
        accent.border,
        onClick && 'cursor-pointer hover:border-border-strong',
        active && 'border-border-strong ring-1 ring-border-strong',
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs',
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-none shrink-0', accent.dot)} />
      <span className="font-bold text-text tracking-wider">{damageClass}</span>
      {meta && (
        <span className={cn('font-medium opacity-90 truncate', accent.text)}>
          {meta.label}
        </span>
      )}
      {showDescription && meta && (
        <span className="text-[10px] text-muted hidden sm:inline ml-1 border-l border-border pl-1.5">
          {meta.description}
        </span>
      )}
    </div>
  );
};
