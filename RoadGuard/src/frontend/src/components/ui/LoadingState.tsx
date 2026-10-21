import React from 'react';
import { cn } from '../../lib/utils';

export interface LoadingStateProps {
  variant?: 'card' | 'table' | 'list';
  count?: number;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  variant = 'card',
  count = 3,
  className,
}) => {
  const items = Array.from({ length: count });

  if (variant === 'card') {
    return (
      <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4', className)}>
        {items.map((_, i) => (
          <div
            key={i}
            className="rounded-none bg-surface p-5 space-y-4 border border-border animate-pulse"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 bg-surface-alt rounded-none" />
              <div className="h-5 w-16 bg-surface-alt rounded-none" />
            </div>
            <div className="space-y-2">
              <div className="h-6 w-3/4 bg-surface-alt rounded-none" />
              <div className="h-3 w-1/2 bg-surface-alt/70 rounded-none" />
            </div>
            <div className="pt-3 border-t border-border flex items-center justify-between">
              <div className="h-3 w-20 bg-surface-alt rounded-none" />
              <div className="h-3 w-14 bg-surface-alt rounded-none" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className={cn('rounded-none bg-surface overflow-hidden border border-border', className)}>
        {/* Header skeleton */}
        <div className="px-6 py-4 border-b border-border-strong bg-surface-alt flex items-center justify-between">
          <div className="h-4 w-32 bg-border rounded-none" />
          <div className="h-4 w-20 bg-border rounded-none" />
        </div>
        {/* Rows */}
        <div className="divide-y divide-border">
          {items.map((_, i) => (
            <div key={i} className="px-6 py-4.5 flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-none bg-surface-alt" />
                <div className="space-y-1.5">
                  <div className="h-4 w-40 bg-surface-alt rounded-none" />
                  <div className="h-3 w-24 bg-surface-alt/70 rounded-none" />
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="h-5 w-20 bg-surface-alt rounded-none" />
                <div className="h-5 w-16 bg-surface-alt rounded-none" />
                <div className="h-4 w-12 bg-surface-alt rounded-none hidden md:block" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 'list' variant
  return (
    <div className={cn('space-y-3', className)}>
      {items.map((_, i) => (
        <div
          key={i}
          className="rounded-none bg-surface p-4 flex items-center justify-between border border-border animate-pulse"
        >
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-none bg-surface-alt" />
            <div className="space-y-1">
              <div className="h-3.5 w-48 bg-surface-alt rounded-none" />
              <div className="h-2.5 w-28 bg-surface-alt/70 rounded-none" />
            </div>
          </div>
          <div className="h-4 w-16 bg-surface-alt rounded-none" />
        </div>
      ))}
    </div>
  );
};
