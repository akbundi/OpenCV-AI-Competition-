import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, RotateCcw } from 'lucide-react';
import { InspectionUploader } from '../components/inspection/InspectionUploader';
import { ChatShell } from '../components/chat/ChatShell';
import { uploadImage, uploadVideo, startInspection } from '../services/api';

export const AIAssistant: React.FC = () => {
  const [pendingFile, setPendingFile] = useState<
    { file: File; type: 'IMAGE' | 'VIDEO' } | null
  >(null);
  const [activeInspectionId, setActiveInspectionId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartInspection = async () => {
    if (!pendingFile || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);

    try {
      let uploadRes: { uploadId: string };
      if (pendingFile.type === 'IMAGE') {
        uploadRes = await uploadImage(pendingFile.file);
      } else {
        uploadRes = await uploadVideo(pendingFile.file);
      }

      const { inspectionId } = await startInspection(
        uploadRes.uploadId,
        pendingFile.type
      );

      setActiveInspectionId(inspectionId);
      setPendingFile(null);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to initialize inspection.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    setPendingFile(null);
    setError(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-border">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-wider text-muted mb-2 font-medium">
            AI INSPECTION ASSISTANT
          </div>
          <h1 className="font-sans font-bold text-3xl sm:text-[40px] tracking-tight text-text leading-tight">
            Ask RoadGuard about road damage.
          </h1>
          <p className="text-muted text-sm sm:text-base mt-3 font-normal max-w-2xl font-sans leading-relaxed">
            Upload road imagery or video. The agent will analyze, verify, and explain every decision.
          </p>
        </div>
      </div>

      {/* Two-Column Layout Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT Panel (1/3 width): upload UI */}
        <section className="lg:col-span-1 rounded-none bg-surface border border-border flex flex-col min-h-[520px]">
          <div className="px-4 py-3 border-b border-border bg-surface-alt flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-wider text-muted font-bold">
              INSPECTION INPUT
            </span>
          </div>

          <div className="p-4 sm:p-5 flex flex-col gap-4 flex-1">
            <InspectionUploader
              variant="compact"
              file={pendingFile?.file ?? null}
              onFileAccepted={(file, type) => {
                setPendingFile({ file, type });
                setError(null);
              }}
              onClear={handleClear}
            />

            {/* Actions when file accepted */}
            {pendingFile && (
              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleStartInspection}
                  disabled={isSubmitting}
                  className="w-full bg-text text-bg border border-border-strong px-4 py-2.5 rounded-none font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>DISPATCHING...</span>
                    </>
                  ) : (
                    <span>START INSPECTION</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleClear}
                  disabled={isSubmitting}
                  className="w-full bg-surface hover:bg-surface-alt text-text border border-border px-4 py-2 rounded-none font-mono text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <span>CLEAR</span>
                </button>
              </div>
            )}

            {/* Error state */}
            {error && (
              <div className="p-3.5 rounded-none border border-sev-high/40 bg-sev-high/10 text-sev-high flex flex-col gap-2">
                <div className="font-mono text-xs leading-relaxed">
                  {error}
                </div>
                <button
                  type="button"
                  onClick={handleStartInspection}
                  className="self-start px-3 py-1.5 rounded-none border border-border-strong bg-surface hover:bg-surface-alt text-text font-mono text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3 stroke-[2]" />
                  <span>RETRY</span>
                </button>
              </div>
            )}

            {/* Active Inspection Status Chip */}
            {activeInspectionId && (
              <div className="p-3.5 rounded-none border border-border bg-surface-alt flex flex-col gap-2.5">
                <div className="font-mono text-xs uppercase tracking-wider text-text font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-none bg-accent animate-pulse" />
                  <span>INSPECTION {activeInspectionId} • OBSERVING</span>
                </div>
                <Link
                  to={`/live/${activeInspectionId}`}
                  className="font-mono text-xs text-text hover:text-accent uppercase tracking-wider flex items-center gap-1 transition-colors"
                >
                  <span>View Live Inspection →</span>
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* RIGHT Panel (2/3 width): AI Assistant Conversation Shell */}
        <div className="lg:col-span-2 flex flex-col min-h-[560px]">
          <ChatShell
            inspectionId={activeInspectionId}
            onAttachClick={() => {
              const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]');
              fileInput?.click();
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
