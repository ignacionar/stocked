"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { DropdownFiles } from "./dropdown-files";
import { useDropzone } from "@/components/ui/dropzone";
import { createInvoiceJob } from "@/app/(private)/[commerceId]/invoices/actions";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";

const MAX_FILES = 10;

export function CreateInvoiceJob({ commerceId }: { commerceId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { data: session } = useSession();

  const dropzone = useDropzone({
    onDropFile: async (file: File) => {
      return {
        status: "success",
        result: URL.createObjectURL(file),
      };
    },
    validation: {
      accept: {
        "image/*": [".png", ".jpg", ".jpeg"],
        "application/pdf": [".pdf"],
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
          [".docx"],
      },
      maxSize: 20 * 1024 * 1024,
      maxFiles: MAX_FILES,
      maxTotalSize: 20 * 1024 * 1024,
    },
    shiftOnMaxFiles: false, 
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validFiles = dropzone.fileStatuses
      .filter((f) => f.status === "success")
      .map((f) => f.file);

    if (!validFiles.length) {
      toast.error("Seleccioná al menos una factura");
      return;
    }

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("commerceId", commerceId);
        formData.append("userId", session?.user.id || "");

        validFiles.forEach((f) => formData.append("files", f));

        const job = await createInvoiceJob(commerceId, formData);

        for (const file of dropzone.fileStatuses) {
          await dropzone.onRemoveFile(file.id);
        }

        if (job) {
          router.push(`/${commerceId}/invoices/${job.id}`);
        }

      } catch (err) {
        console.error(err);
        toast.error("Error al enviar las imágenes a procesar");
      }
    })
  };

  return (
  <form encType="multipart/form-data" onSubmit={handleSubmit}>
    <Card className="w-[100%] md:w-[800px] mx-auto">
      <CardContent className="space-y-4">
        <div className="text-left md:text-center word-break">
          <h2 className="text-lg font-semibold">Subir Facturas</h2>
          <p className="text-sm text-muted-foreground">
            Analizar los documentos puede tardar unos minutos.
          </p>
        </div>

        <DropdownFiles dropzone={dropzone} maxFiles={MAX_FILES} />

        <Button
          className="w-full cursor-pointer"
          disabled={isPending || dropzone.fileStatuses.length === 0}
          type="submit"
        >
          {isPending ? "Procesando..." : "Subir y procesar"}
        </Button>
      </CardContent>
    </Card>
  </form>
  );
}