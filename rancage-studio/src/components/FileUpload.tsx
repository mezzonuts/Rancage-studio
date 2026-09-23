'use client';

import { useCallback, useRef, useState, DragEvent, ChangeEvent } from 'react';
import { Upload, X, FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export interface FileUploadProps {
  onFilesSelected: (files: File[]) => Promise<void>;
  maxFiles?: number;
  maxFileSize?: number;
  acceptedTypes?: string[];
  disabled?: boolean;
}

export interface UploadedFile {
  file: File;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  preview?: unknown[][];
  columns?: string[];
  rowCount?: number;
}

const DEFAULT_ACCEPTED_TYPES = [
  'text/csv',
  'application/csv',
  'application/vnd.ms-excel',
  'application/parquet',
  'application/x-parquet',
];

const DEFAULT_MAX_FILE_SIZE = 100 * 1024 * 1024;

export function FileUpload({
  onFilesSelected,
  maxFiles = 5,
  maxFileSize = DEFAULT_MAX_FILE_SIZE,
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
  disabled = false,
}: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const validateFile = useCallback(
    (file: File): string | null => {
      if (file.size > maxFileSize) {
        return `File size exceeds ${maxFileSize / (1024 * 1024)}MB limit`;
      }
      const isValidType = acceptedTypes.some(
        (type) =>
          file.type === type ||
          file.name.toLowerCase().endsWith(type.replace('application/', '.').replace('text/', '.'))
      );
      if (!isValidType && !file.name.match(/\.(csv|parquet)$/i)) {
        return 'Only CSV and Parquet files are supported';
      }
      return null;
    },
    [acceptedTypes, maxFileSize]
  );

  const processFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const validFiles = fileArray.slice(0, maxFiles - uploadedFiles.length);

      if (validFiles.length === 0) return;

      setIsProcessing(true);

      const newFiles: UploadedFile[] = validFiles.map((file) => ({
        file,
        status: 'pending' as const,
      }));

      setUploadedFiles((prev) => [...prev, ...newFiles]);

      for (let i = 0; i < newFiles.length; i++) {
        const file = newFiles[i]!;
        const error = validateFile(file.file);

        if (error) {
          setUploadedFiles((prev) =>
            prev.map((f, idx) =>
              idx === uploadedFiles.length + i ? { ...f, status: 'error' as const, error } : f
            )
          );
          continue;
        }

        setUploadedFiles((prev) =>
          prev.map((f, idx) =>
            idx === uploadedFiles.length + i ? { ...f, status: 'uploading' as const } : f
          )
        );

        try {
          await onFilesSelected([file.file]);
          setUploadedFiles((prev) =>
            prev.map((f, idx) =>
              idx === uploadedFiles.length + i ? { ...f, status: 'success' as const } : f
            )
          );
        } catch (err) {
          setUploadedFiles((prev) =>
            prev.map((f, idx) =>
              idx === uploadedFiles.length + i
                ? {
                    ...f,
                    status: 'error' as const,
                    error: err instanceof Error ? err.message : 'Upload failed',
                  }
                : f
            )
          );
        }
      }

      setIsProcessing(false);
    },
    [maxFiles, onFilesSelected, uploadedFiles.length, validateFile]
  );

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragActive(false);

      if (disabled || isProcessing) return;

      if (e.dataTransfer.files.length > 0) {
        processFiles(e.dataTransfer.files);
      }
    },
    [disabled, isProcessing, processFiles]
  );

  const handleDragOver = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled && !isProcessing) {
        setIsDragActive(true);
      }
    },
    [disabled, isProcessing]
  );

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const handleFileInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        processFiles(e.target.files);
      }
      e.target.value = '';
    },
    [processFiles]
  );

  const removeFile = useCallback((index: number) => {
    setUploadedFiles((prev) => prev.filter((_, idx) => idx !== index));
  }, []);

  const clearAll = useCallback(() => {
    setUploadedFiles([]);
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (fileName: string) => {
    if (fileName.toLowerCase().endsWith('.parquet')) {
      return <FileText className="h-5 w-5 text-purple-500" />;
    }
    return <FileText className="h-5 w-5 text-green-500" />;
  };

  return (
    <div className="w-full">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && !isProcessing && fileInputRef.current?.click()}
        className={`relative rounded-xl border-2 border-dashed p-8 text-center transition-all duration-200 ${isDragActive ? 'border-primary-500 bg-primary-50' : 'border-border hover:border-primary-300'} ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} `}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !disabled && !isProcessing) {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',') + ',.csv,.parquet'}
          onChange={handleFileInputChange}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          disabled={disabled || isProcessing}
          aria-label="Upload CSV or Parquet files"
        />

        <div className="flex flex-col items-center gap-4">
          <div
            className={`flex h-16 w-16 items-center justify-center rounded-2xl transition-colors ${isDragActive ? 'bg-primary-100 text-primary-600' : 'bg-muted text-muted-foreground'} `}
          >
            <Upload className="h-8 w-8" />
          </div>

          <div>
            <p className="text-foreground text-lg font-medium">
              {isDragActive ? 'Drop files here' : 'Drag & drop CSV or Parquet files here'}
            </p>
            <p className="text-muted-foreground mt-1 text-sm">
              or click to browse • Max {maxFiles} files • {maxFileSize / (1024 * 1024)}MB each
            </p>
          </div>

          {isProcessing && (
            <div className="text-primary-600 flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Processing files...</span>
            </div>
          )}
        </div>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-foreground font-medium">
              Selected Files ({uploadedFiles.length}/{maxFiles})
            </h3>
            {uploadedFiles.some((f) => f.status === 'success') && (
              <button
                onClick={clearAll}
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="max-h-64 space-y-2 overflow-y-auto">
            {uploadedFiles.map((uploadedFile, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${uploadedFile.status === 'success' ? 'border-green-200 bg-green-50' : ''} ${uploadedFile.status === 'error' ? 'border-red-200 bg-red-50' : ''} ${uploadedFile.status === 'uploading' ? 'border-blue-200 bg-blue-50' : ''} ${uploadedFile.status === 'pending' ? 'border-yellow-200 bg-yellow-50' : ''} `}
              >
                {getFileIcon(uploadedFile.file.name)}

                <div className="min-w-0 flex-1">
                  <p className="text-foreground truncate font-medium">{uploadedFile.file.name}</p>
                  <p className="text-muted-foreground text-sm">
                    {formatFileSize(uploadedFile.file.size)}
                    {uploadedFile.rowCount && ` • ${uploadedFile.rowCount} rows`}
                    {uploadedFile.columns && ` • ${uploadedFile.columns.length} columns`}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {uploadedFile.status === 'pending' && (
                    <span className="text-sm text-yellow-600">Pending</span>
                  )}
                  {uploadedFile.status === 'uploading' && (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                      <span className="text-sm text-blue-600">Uploading...</span>
                    </>
                  )}
                  {uploadedFile.status === 'success' && (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600">Ready</span>
                    </>
                  )}
                  {uploadedFile.status === 'error' && (
                    <>
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm text-red-600">{uploadedFile.error}</span>
                    </>
                  )}

                  <button
                    onClick={() => removeFile(index)}
                    className="text-muted-foreground hover:text-foreground p-1 transition-colors"
                    aria-label="Remove file"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default FileUpload;
