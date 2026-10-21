import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, FileImage, FileVideo, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface InspectionUploaderProps {
  variant?: 'page' | 'compact';
  onFileAccepted: (file: File, type: 'IMAGE' | 'VIDEO') => void;
  onClear?: () => void;
  initialType?: 'IMAGE' | 'VIDEO';
  file?: File | null;
  children?: React.ReactNode;
  className?: string;
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm'];
const MAX_IMAGE_SIZE = 25 * 1024 * 1024; // 25 MB
const MAX_VIDEO_SIZE = 250 * 1024 * 1024; // 250 MB

export const InspectionUploader: React.FC<InspectionUploaderProps> = ({
  variant = 'page',
  onFileAccepted,
  onClear,
  initialType = 'VIDEO',
  file = null,
  children,
  className,
}) => {
  const [activeType, setActiveType] = useState<'IMAGE' | 'VIDEO'>(initialType);
  const [selectedFile, setSelectedFile] = useState<File | null>(file);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync controlled file prop
  useEffect(() => {
    if (file === null && selectedFile !== null) {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setSelectedFile(null);
      setPreviewUrl(null);
      setVideoDuration(null);
      setValidationError(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [file, selectedFile, previewUrl]);

  // Cleanup previewUrl on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleTabSwitch = (type: 'IMAGE' | 'VIDEO') => {
    setActiveType(type);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
    setVideoDuration(null);
    setValidationError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onClear?.();
  };

  const validateAndSetFile = (fileToValidate: File) => {
    setValidationError(null);

    if (activeType === 'IMAGE') {
      if (!ALLOWED_IMAGE_TYPES.includes(fileToValidate.type)) {
        setValidationError('Unsupported format. Only JPG, PNG, and WebP images are supported.');
        return;
      }
      if (fileToValidate.size > MAX_IMAGE_SIZE) {
        setValidationError('File size exceeds 25 MB limit for single image frames.');
        return;
      }
    } else {
      if (
        !ALLOWED_VIDEO_TYPES.includes(fileToValidate.type) &&
        !fileToValidate.name.match(/\.(mp4|mov|webm)$/i)
      ) {
        setValidationError('Unsupported format. Only MP4, MOV, and WebM video streams are supported.');
        return;
      }
      if (fileToValidate.size > MAX_VIDEO_SIZE) {
        setValidationError('File size exceeds 250 MB limit for roadway video uploads.');
        return;
      }
    }

    setSelectedFile(fileToValidate);
    const url = URL.createObjectURL(fileToValidate);
    setPreviewUrl(url);
    onFileAccepted(fileToValidate, activeType);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
    setVideoDuration(null);
    setValidationError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onClear?.();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn('space-y-4 w-full', className)}>
      {/* Tabs: [ IMAGE ] [ VIDEO ] */}
      {variant === 'compact' ? (
        <div className="grid grid-cols-2 gap-2 pb-3 border-b border-border">
          <button
            type="button"
            onClick={() => handleTabSwitch('IMAGE')}
            className={`font-mono text-[11px] uppercase tracking-wider py-1.5 px-3 rounded-none transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
              activeType === 'IMAGE'
                ? 'bg-text text-bg border border-border-strong font-bold'
                : 'bg-surface text-muted hover:text-text border border-border'
            }`}
          >
            <FileImage className="w-3.5 h-3.5" />
            <span>IMAGE</span>
          </button>
          <button
            type="button"
            onClick={() => handleTabSwitch('VIDEO')}
            className={`font-mono text-[11px] uppercase tracking-wider py-1.5 px-3 rounded-none transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
              activeType === 'VIDEO'
                ? 'bg-text text-bg border border-border-strong font-bold'
                : 'bg-surface text-muted hover:text-text border border-border'
            }`}
          >
            <FileVideo className="w-3.5 h-3.5" />
            <span>VIDEO</span>
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <button
            type="button"
            onClick={() => handleTabSwitch('VIDEO')}
            className={`font-mono text-xs uppercase tracking-wider px-4 py-2 rounded-none transition-colors flex items-center gap-2 cursor-pointer ${
              activeType === 'VIDEO'
                ? 'bg-text text-bg border border-border-strong font-bold'
                : 'bg-surface text-muted hover:text-text border border-border'
            }`}
          >
            <FileVideo className="w-3.5 h-3.5" />
            <span>VIDEO SEQUENCE (TEMPORAL RE-CHECK)</span>
          </button>
          <button
            type="button"
            onClick={() => handleTabSwitch('IMAGE')}
            className={`font-mono text-xs uppercase tracking-wider px-4 py-2 rounded-none transition-colors flex items-center gap-2 cursor-pointer ${
              activeType === 'IMAGE'
                ? 'bg-text text-bg border border-border-strong font-bold'
                : 'bg-surface text-muted hover:text-text border border-border'
            }`}
          >
            <FileImage className="w-3.5 h-3.5" />
            <span>SINGLE FRAME CAPTURE</span>
          </button>
        </div>
      )}

      {/* Inline Validation Errors */}
      {validationError && (
        <div className="p-3.5 rounded-none border border-sev-high/40 bg-sev-high/10 flex items-center justify-between gap-3 font-mono text-xs text-sev-high">
          <div className="flex items-center gap-2 min-w-0">
            <X className="w-4 h-4 shrink-0 text-sev-high" />
            <span>{validationError}</span>
          </div>
          <button
            type="button"
            onClick={() => setValidationError(null)}
            className="p-1 hover:bg-sev-high/20 rounded-none text-sev-high shrink-0 cursor-pointer"
            title="Dismiss error"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Drop zone or File preview */}
      {!selectedFile ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            'rounded-none bg-surface border border-dashed text-center cursor-pointer transition-colors flex flex-col items-center justify-center',
            variant === 'compact' ? 'p-8 sm:p-10' : 'p-14 md:p-20',
            isDragging
              ? 'border-accent bg-surface-alt'
              : 'border-border hover:border-border-strong'
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={
              activeType === 'VIDEO'
                ? 'video/mp4,video/quicktime,video/webm'
                : 'image/jpeg,image/png,image/webp'
            }
            onChange={handleFileInputChange}
            className="hidden"
          />

          <div className="w-12 h-12 rounded-none border border-border bg-surface-alt flex items-center justify-center text-muted mb-4">
            <UploadCloud className="w-6 h-6 stroke-[1.5]" />
          </div>

          <span className="font-mono text-xs uppercase tracking-wider text-text font-bold block mb-1">
            DROP SENSOR {activeType === 'VIDEO' ? 'VIDEO FOOTAGE' : 'IMAGE FILE'}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted block mb-5 font-medium">
            OR CLICK TO SELECT FROM DISK
          </span>

          <div className="px-3.5 py-1.5 rounded-none border border-border bg-surface-alt font-mono text-[10px] uppercase tracking-wider text-muted">
            {activeType === 'VIDEO'
              ? 'MP4, MOV, WEBM • MAX 250 MB'
              : 'JPG, PNG, WEBP • MAX 25 MB'}
          </div>
        </div>
      ) : (
        /* File Selected Preview */
        <div
          className={cn(
            'rounded-none bg-surface border border-border',
            variant === 'compact' ? 'p-4 space-y-4' : 'p-6 space-y-6'
          )}
        >
          <div className="flex items-start justify-between gap-3 pb-3 border-b border-border">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 rounded-none border border-border bg-surface-alt text-text shrink-0">
                {activeType === 'VIDEO' ? (
                  <FileVideo className="w-4 h-4 text-muted" />
                ) : (
                  <FileImage className="w-4 h-4 text-muted" />
                )}
              </div>
              <div className="min-w-0">
                <h3 className="font-mono text-xs font-bold text-text truncate">
                  {selectedFile.name}
                </h3>
                <div className="font-mono text-[10px] text-muted uppercase tracking-wider mt-0.5 flex flex-wrap items-center gap-x-2">
                  <span>SIZE: {formatFileSize(selectedFile.size)}</span>
                  <span>•</span>
                  <span>FORMAT: {selectedFile.type || (activeType === 'VIDEO' ? 'VIDEO' : 'IMAGE')}</span>
                  {activeType === 'VIDEO' && videoDuration !== null && (
                    <>
                      <span>•</span>
                      <span>DURATION: {formatDuration(videoDuration)}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRemove}
              className="shrink-0 p-1.5 sm:px-2.5 sm:py-1 rounded-none hover:bg-surface-alt text-muted hover:text-text border border-transparent hover:border-border font-mono text-[10px] sm:text-xs uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer"
              title="Remove file"
            >
              <X className="w-3.5 h-3.5" />
              <span>REMOVE</span>
            </button>
          </div>

          {/* Media Player / Thumbnail Preview */}
          <div
            className={cn(
              'w-full bg-black rounded-none overflow-hidden border border-border flex items-center justify-center',
              variant === 'compact' ? 'aspect-[16/9] max-h-48' : 'aspect-[16/9] max-h-80'
            )}
          >
            {activeType === 'VIDEO' && previewUrl ? (
              <video
                src={previewUrl}
                controls
                onLoadedMetadata={(e) => setVideoDuration(e.currentTarget.duration)}
                className="w-full h-full object-contain"
              />
            ) : previewUrl ? (
              <img
                src={previewUrl}
                alt="Selected preview"
                className="w-full h-full object-contain"
              />
            ) : null}
          </div>

          {children}
        </div>
      )}
    </div>
  );
};

export default InspectionUploader;
