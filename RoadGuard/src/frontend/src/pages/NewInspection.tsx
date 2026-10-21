import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { uploadImage, uploadVideo, startInspection } from '../services/api';
import { ArrowUpRight } from 'lucide-react';
import { InspectionUploader } from '../components/inspection/InspectionUploader';

export const NewInspection: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'image' ? 'IMAGE' : 'VIDEO';

  const [selectedFile, setSelectedFile] = useState<{ file: File; type: 'IMAGE' | 'VIDEO' } | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStartInspection = async () => {
    if (!selectedFile) return;
    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      let uploadRes;
      if (selectedFile.type === 'IMAGE') {
        uploadRes = await uploadImage(selectedFile.file);
      } else {
        uploadRes = await uploadVideo(selectedFile.file);
      }

      const { inspectionId } = await startInspection(
        uploadRes.uploadId,
        selectedFile.type
      );
      navigate(`/live/${inspectionId}`);
    } catch (err: any) {
      setSubmissionError(err?.message || 'Failed to initialize inspection pipeline.');
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setSubmissionError(null);
  };

  return (
    <div className="max-w-4xl space-y-10 animate-in fade-in duration-700">
      <div>
        <div className="font-mono text-[11px] uppercase tracking-wider text-muted mb-2 font-medium">
          INSPECTION INGESTION // STAGE 01
        </div>
        <h1 className="font-sans font-bold text-4xl sm:text-5xl tracking-tight text-text">
          Initialize Pavement Inspection
        </h1>
        <p className="text-muted text-sm mt-3 font-normal max-w-xl font-sans leading-relaxed">
          Upload multi-frame video runs (MP4/MOV) or calibrated high-resolution camera imagery for autonomous feature extraction and temporal persistence verification.
        </p>
      </div>

      {/* Submission Error Banner */}
      {submissionError && (
        <div className="p-4 rounded-none border border-sev-high/40 bg-sev-high/10 flex items-center gap-3 font-mono text-xs text-sev-high">
          <span>{submissionError}</span>
        </div>
      )}

      {/* Shared Inspection Uploader */}
      <InspectionUploader
        variant="page"
        initialType={initialTab}
        file={selectedFile?.file ?? null}
        onFileAccepted={(file, type) => {
          setSelectedFile({ file, type });
          setSubmissionError(null);
        }}
        onClear={() => {
          setSelectedFile(null);
          setSubmissionError(null);
        }}
      >
        {/* Action Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
            CLICKING START ENGAGES THE AUTONOMOUS AGENT STATE MACHINE
          </p>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-4 py-2.5 rounded-none border border-border hover:bg-surface-alt text-text font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleStartInspection}
              disabled={isSubmitting}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-none bg-text text-bg border border-border-strong font-mono text-xs font-bold uppercase tracking-wider disabled:opacity-50 hover:opacity-90 transition-opacity cursor-pointer"
            >
              <span>{isSubmitting ? 'ENGAGING AGENT...' : 'START INSPECTION'}</span>
              <ArrowUpRight className="w-4 h-4 stroke-[2]" />
            </button>
          </div>
        </div>
      </InspectionUploader>
    </div>
  );
};

export default NewInspection;
