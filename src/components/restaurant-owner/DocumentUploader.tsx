import React, { useCallback, useState } from 'react';
import { Upload, X, FileText, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

export interface UploadedDocument {
  id: string;
  type: string;
  name: string;
  url: string;
  file?: File;
}

interface DocumentUploaderProps {
  docType: string;
  label: string;
  description?: string;
  optional?: boolean;
  onUpload: (file: File, docType: string) => Promise<string | null>;
  onRemove: (docId: string) => void;
  uploadedDocs: UploadedDocument[];
}

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  docType,
  label,
  description,
  optional = false,
  onUpload,
  onRemove,
  uploadedDocs,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        await handleFileUpload(files[0]);
      }
    },
    [docType]
  );

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        await handleFileUpload(files[0]);
      }
    },
    [docType]
  );

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => Math.min(prev + 10, 90));
    }, 100);

    const url = await onUpload(file, docType);

    clearInterval(progressInterval);
    setUploadProgress(100);

    setTimeout(() => {
      setIsUploading(false);
      setUploadProgress(0);
    }, 500);
  };

  const currentDoc = uploadedDocs.find((doc) => doc.type === docType);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">
          {label}
          {!optional && <span className="text-destructive ml-1">*</span>}
        </label>
        {optional && <span className="text-xs text-muted-foreground">Optional</span>}
      </div>

      {description && <p className="text-xs text-muted-foreground">{description}</p>}

      {currentDoc ? (
        <div className="flex items-center gap-3 p-4 border rounded-lg bg-muted/50">
          <div className="flex items-center gap-2 flex-1">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <FileText className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm font-medium truncate">{currentDoc.name}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemove(currentDoc.id)}
            className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={cn(
            'relative border-2 border-dashed rounded-lg p-6 transition-colors',
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-muted-foreground/50'
          )}
        >
          <input
            type="file"
            id={`file-${docType}`}
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileSelect}
            disabled={isUploading}
          />
          <label
            htmlFor={`file-${docType}`}
            className="flex flex-col items-center justify-center cursor-pointer"
          >
            <Upload className="w-8 h-8 text-muted-foreground mb-2" />
            <p className="text-sm font-medium mb-1">
              Drop file here or click to upload
            </p>
            <p className="text-xs text-muted-foreground">
              PDF, JPG, or PNG (max 10MB)
            </p>
          </label>

          {isUploading && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg">
              <div className="w-2/3 space-y-2">
                <Progress value={uploadProgress} />
                <p className="text-xs text-center text-muted-foreground">
                  Uploading... {uploadProgress}%
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
