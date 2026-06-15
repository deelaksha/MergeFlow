"use client";

import { Upload, FileText } from "lucide-react";
import { FileInfo } from "@/lib/types";

interface FileUploadProps {
  label: string;
  onFileSelect: (file: File) => void;
  file: FileInfo | null;
}

export function FileUpload({ label, onFileSelect, file }: FileUploadProps) {
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      onFileSelect(droppedFile);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      onFileSelect(selectedFile);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{label}</h3>

      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary transition-colors cursor-pointer"
      >
        <input
          type="file"
          onChange={handleFileInput}
          className="hidden"
          id={`file-input-${label}`}
          accept=".js,.jsx,.ts,.tsx,.py,.java,.go,.cpp,.c,.xml,.json,.yaml,.yml,.sh,.txt"
        />
        <label
          htmlFor={`file-input-${label}`}
          className="cursor-pointer flex flex-col items-center gap-4"
        >
          {file ? (
            <>
              <FileText className="w-16 h-16 text-primary" />
              <div>
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(file.size / 1024).toFixed(2)} KB · {file.language}
                </p>
              </div>
            </>
          ) : (
            <>
              <Upload className="w-16 h-16 text-muted-foreground" />
              <div>
                <p className="font-medium">Drop file here or click to browse</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Supported: JS, TS, Python, Java, Go, C++, XML, JSON, YAML
                </p>
              </div>
            </>
          )}
        </label>
      </div>
    </div>
  );
}
