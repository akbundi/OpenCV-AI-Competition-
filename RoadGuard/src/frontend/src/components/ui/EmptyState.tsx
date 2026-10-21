import React from 'react';
import { cn } from '../../lib/utils';
import { Inbox } from 'lucide-react';

export interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ComponentType<{ className?: string }>;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}) => {
  const ActionIcon = action?.icon;

  return (
    <div
      className={cn(
        'rounded-none bg-surface p-10 flex flex-col items-center justify-center text-center border border-dashed border-border',
        className
      )}
    >
      <div className="w-12 h-12 rounded-none bg-surface-alt border border-border flex items-center justify-center text-muted mb-4">
        <Icon className="w-6 h-6 stroke-[1.5]" />
      </div>

      <h4 className="font-mono text-xs uppercase tracking-wider text-text mb-1.5 font-bold">
        {title}
      </h4>

      {description && (
        <p className="text-xs text-muted max-w-sm leading-relaxed mb-5 font-sans">
          {description}
        </p>
      )}

      {action && (
        <button
          onClick={action.onClick}
          className="bg-text text-bg border border-border-strong px-4 py-2 rounded-none text-xs font-mono font-semibold uppercase tracking-wider flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity"
        >
          {ActionIcon && <ActionIcon className="w-3.5 h-3.5" />}
          {action.label}
        </button>
      )}
    </div>
  );
};
