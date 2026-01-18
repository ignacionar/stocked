"use client";

import {
  Dropzone,
  DropZoneArea,
  DropzoneDescription,
  DropzoneFileList,
  DropzoneFileListItem,
  DropzoneMessage,
  DropzoneRemoveFile,
  DropzoneTrigger,
  useDropzone,
} from "@/components/ui/dropzone";
import { CloudUploadIcon, FileTextIcon, Trash2Icon } from "lucide-react";
import { useFiles, VisualFile } from "@/contexts/image-context";
import { useEffect, useRef } from "react";

interface DropdownFilesProps {
  dropzone: ReturnType<typeof useDropzone>;
  maxFiles: number;
}

export function DropdownFiles({ dropzone, maxFiles }: DropdownFilesProps) {
  const { addFiles, removeFile } = useFiles();
  const processedIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    const newFiles: VisualFile[] = dropzone.fileStatuses
      .filter(
        (f) =>
          f.status === "success" && !processedIds.current.has(f.id),
      )
      .map((f) => {
        processedIds.current.add(f.id);

        return {
          id: f.id,
          name: f.fileName,
          mimeType: f.file.type,
          preview: f.file.type.startsWith("image/")
            ? (f.result as string)
            : undefined,
          source: "local",
        };
      });

    if (newFiles.length) {
      addFiles(newFiles);
    }
  }, [dropzone.fileStatuses, addFiles]);

  return (
    <div className={`not-prose flex flex-col gap-4`}>
      <Dropzone {...dropzone}>
        <div>
          <div className="flex justify-between">
            <DropzoneDescription>
              Seleccione <strong>hasta {maxFiles} archivos</strong> (.jpg, .jpeg, .pdf,
              .docx...)
            </DropzoneDescription>
            <DropzoneMessage />
          </div>
          <DropZoneArea>
            <DropzoneTrigger className="flex flex-col items-center gap-4 bg-transparent p-10 text-center text-sm">
              <CloudUploadIcon className="size-8" />
              <div>
                <p className="font-semibold">Subir archivos</p>
                <p className="text-sm text-muted-foreground">
                  Presiona o suelta los archivos en esta área para subirlos
                </p>
              </div>
            </DropzoneTrigger>
          </DropZoneArea>
        </div>

        <DropzoneFileList className="grid gap-3 p-0 grid-cols-2 md:grid-cols-3 max-h-[420px] overflow-y-auto pr-1">
          {dropzone.fileStatuses.map((file) => {
            const isImage = file.file.type.startsWith("image/");

            return (
              <DropzoneFileListItem
                className="overflow-hidden rounded-md bg-secondary p-0 shadow-sm"
                key={file.id}
                file={file}
              >
                {file.status === "pending" && (
                  <div className="aspect-video animate-pulse bg-black/20" />
                )}
                {file.status === "success" && isImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={file.result as string}
                    alt={`uploaded-${file.fileName}`}
                    className="aspect-video object-cover rounded-t-md"
                  />
                )}
                {file.status === "success" && !isImage && (
                  <div className="flex aspect-video items-center justify-center bg-muted">
                    <FileTextIcon className="size-10 text-muted-foreground" />
                  </div>
                )}
                <div className="flex items-center justify-between p-2 pl-">
                  <div className="min-w-0">
                    <p className="truncate text-sm">{file.fileName}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                  <span onClick={() => removeFile(file.id)}>
                    <DropzoneRemoveFile >
                      <Trash2Icon className="size-4 cursor-pointer" />
                    </DropzoneRemoveFile>
                  </span>
                </div>
              </DropzoneFileListItem>
            );
          })}
        </DropzoneFileList>
      </Dropzone>
    </div>
  );
}