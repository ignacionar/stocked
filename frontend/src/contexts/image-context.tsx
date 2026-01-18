"use client";

import { createContext, useContext, useState } from "react";

export type VisualFile = {
  id: string;
  name: string;
  mimeType: string;
  preview?: string; // solo imágenes
  source: "local" | "job";
};

type FilesContextValue = {
  files: VisualFile[];
  addFiles: (files: VisualFile[]) => void;
  removeFile: (id: string) => void;
  clearFiles: () => void;
};

const FilesContext = createContext<FilesContextValue | null>(null);

export function FilesProvider({ children }: { children: React.ReactNode }) {
  const [files, setFiles] = useState<VisualFile[]>([]);

  const addFiles = (newFiles: VisualFile[]) => {
    setFiles((prev) => {
      const existingIds = new Set(prev.map((f) => f.id));
      const unique = newFiles.filter((f) => !existingIds.has(f.id));
      return unique.length ? [...prev, ...unique] : prev;
    });
  };

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id);

      if (file?.preview?.startsWith("blob:")) {
        URL.revokeObjectURL(file.preview);
      }

      return prev.filter((f) => f.id !== id);
    });
  };

  const clearFiles = () => {
    setFiles((prev) => {
      prev.forEach((f) => {
        if (f.preview?.startsWith("blob:")) {
          URL.revokeObjectURL(f.preview);
        }
      });
      return [];
    });
  };

  return (
    <FilesContext.Provider value={{ files, addFiles, removeFile, clearFiles }}>
      {children}
    </FilesContext.Provider>
  );
}

export function useFiles() {
  const ctx = useContext(FilesContext);
  if (!ctx) {
    throw new Error("useFiles must be used within FilesProvider");
  }
  return ctx;
}