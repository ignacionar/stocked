"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export default function RemoveInvoiceDialog({ changeJobResponse, imageId }: { changeJobResponse: (id: string, method: "update" | "delete") => void, imageId: string }) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" className="cursor-pointer">Eliminar análisis</Button>
      </DialogTrigger>

      <DialogContent className="[&>button:last-child]:cursor-pointer">
        <DialogHeader>
          <DialogTitle className="text-red-600">
            ¿Eliminar análisis de la IA?
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          Esta acción es irreversible.
          <br />
          Se eliminará el análisis de la IA 
        </p>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="cursor-pointer"
          >
            Cancelar
          </Button>

          <Button
            variant="destructive"
            className="cursor-pointer"
            onClick={() => changeJobResponse(imageId, "delete")}
          >
            Eliminar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}