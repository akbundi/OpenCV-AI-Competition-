import React from 'react';
import type { ChatMessage } from '../../types/chat';
import type { FrameEvidence } from '../../types/evidence';
import type { Report } from '../../types/report';
import type { Severity } from '../../types/inspection';
import { AgentDecisionCard } from './cards/AgentDecisionCard';
import { DamageDetectedCard } from './cards/DamageDetectedCard';
import { ConfidenceCard } from './cards/ConfidenceCard';
import { EvidencePreviewCard } from './cards/EvidencePreviewCard';
import { EvidenceStripCard } from './cards/EvidenceStripCard';
import { SeverityAssessmentCard } from './cards/SeverityAssessmentCard';
import { ReportPreviewCard } from './cards/ReportPreviewCard';
import { ErrorCard } from './cards/ErrorCard';
import { Bot, User, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ChatMessageBubbleProps {
  message: ChatMessage;
  onApprove?: (note?: string) => void;
  onReject?: (reason: string) => void;
  onRetry?: () => void;
  className?: string;
}

export const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({
  message,
  onApprove,
  onReject,
  onRetry,
  className,
}) => {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  // System Message
  if (isSystem) {
    return (
      <div className={cn('w-full flex justify-center my-2', className)}>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-none border border-sev-low/40 bg-sev-low/10 text-sev-low font-mono text-[11px] font-bold uppercase tracking-wider">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span>{message.text}</span>
        </div>
      </div>
    );
  }

  // Kind-based Dispatch
  const renderContent = () => {
    switch (message.kind) {
      case 'text':
        return (
          <div
            className={cn(
              'p-3.5 rounded-none border text-xs leading-relaxed max-w-lg',
              isUser
                ? 'bg-text text-bg border-border-strong font-sans'
                : 'bg-surface border-border text-text font-sans'
            )}
          >
            <p className="whitespace-pre-wrap">{message.text}</p>
          </div>
        );

      case 'decision': {
        const meta = message.meta as any;
        return (
          <AgentDecisionCard
            damageClass={meta?.damageClass || 'D40'}
            confidence={meta?.confidence || 91}
            stage={message.stage || 'RECHECK'}
            inspectionId={message.inspectionId || 'RG-0001'}
          />
        );
      }

      case 'detection': {
        const meta = message.meta as any;
        return (
          <DamageDetectedCard
            damageClass={meta?.damageClass || 'D40'}
            confidence={meta?.confidence || 91}
            persistenceFrames={meta?.persistenceFrames || 7}
            totalFrames={meta?.totalFrames || 7}
            roadPosition={meta?.roadPosition}
            severity={(meta?.severity as Severity) || 'HIGH'}
            inspectionId={message.inspectionId || 'RG-0001'}
            reportId={meta?.reportId || 'REP-0001'}
          />
        );
      }

      case 'confidence': {
        const meta = message.meta as any;
        return (
          <ConfidenceCard
            confidence={meta?.confidence ?? 91}
            status={meta?.status || 'CONFIRMED'}
            inspectionId={message.inspectionId || 'RG-0001'}
          />
        );
      }

      case 'evidence': {
        const meta = message.meta as any;
        const frame = meta?.frame as FrameEvidence;
        if (!frame) return null;
        return (
          <EvidencePreviewCard
            frame={frame}
            inspectionId={message.inspectionId || 'RG-0001'}
          />
        );
      }

      case 'evidence-strip': {
        const meta = message.meta as any;
        const frames = (meta?.evidence as FrameEvidence[]) || [];
        return (
          <EvidenceStripCard
            evidence={frames}
            persistenceCount={meta?.persistenceCount || 7}
            totalFrames={meta?.totalFrames || 7}
            inspectionId={message.inspectionId || 'RG-0001'}
          />
        );
      }

      case 'severity': {
        const meta = message.meta as any;
        return (
          <SeverityAssessmentCard
            damageType={meta?.damageType}
            confidence={meta?.confidence}
            severity={meta?.severity}
            roadPosition={meta?.roadPosition}
            persistenceFrames={meta?.persistenceFrames}
            recommendation={meta?.recommendation}
          />
        );
      }

      case 'report': {
        const meta = message.meta as any;
        const report = meta?.report as Report;
        if (!report) return null;
        return (
          <ReportPreviewCard
            report={report}
            inspectionId={message.inspectionId || 'RG-0001'}
            onApprove={onApprove}
            onReject={onReject}
          />
        );
      }

      case 'error': {
        const meta = message.meta as any;
        return (
          <ErrorCard
            message={message.text || meta?.message || 'Awaiting backend data'}
            onRetry={onRetry}
          />
        );
      }

      default:
        return (
          <div className="p-3 bg-surface border border-border text-xs font-mono">
            {message.text}
          </div>
        );
    }
  };

  return (
    <div
      className={cn(
        'w-full flex items-start gap-2.5 my-1.5',
        isUser ? 'justify-end' : 'justify-start',
        className
      )}
    >
      {!isUser && (
        <div className="w-7 h-7 rounded-none bg-surface-alt border border-border flex items-center justify-center text-text shrink-0 mt-0.5">
          <Bot className="w-4 h-4 stroke-[1.75]" />
        </div>
      )}

      <div className="flex flex-col gap-1 max-w-[85%]">
        {renderContent()}
        <span
          className={cn(
            'text-[9px] font-mono text-muted uppercase tracking-wider',
            isUser ? 'text-right' : 'text-left'
          )}
        >
          {message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
        </span>
      </div>

      {isUser && (
        <div className="w-7 h-7 rounded-none bg-text text-bg border border-border-strong flex items-center justify-center shrink-0 mt-0.5 font-mono text-xs font-bold">
          <User className="w-4 h-4 stroke-[2]" />
        </div>
      )}
    </div>
  );
};

export default ChatMessageBubble;
