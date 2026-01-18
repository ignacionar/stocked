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
import { acceptInvoiceAnalysis } from "@/app/(private)/[commerceId]/invoices/actions"
import { useParams } from "next/navigation"
import { toast } from "sonner"

type LocalItem = {
  name: string
  quantity: number
  unit_price: number
  measure: string
  id: string
}

export default function AcceptInvoiceDialog({ changeJobResponse, imageId, localItems, supplier }: { changeJobResponse: (id: string, method: "update" | "delete") => void, imageId: string, localItems: LocalItem[], supplier: string }) {
  const [open, setOpen] = useState(false)
  const params = useParams()
  const commerceId = params.commerceId as string

  console.log(supplier);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="cursor-pointer">Registrar productos</Button>
      </DialogTrigger>

      <DialogContent className="[&>button:last-child]:cursor-pointer">
        <DialogHeader>
          <DialogTitle>
            Se registrarán los productos de esta factura analizada.
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          Se crearán los productos en el inventario según los datos extraídos de la factura. Si ya existe un producto con un nombre determinado, se actualizará su información en lugar de crear uno nuevo.
        </p>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="cursor-pointer"
          >
            Cancelar
          </Button>

        <Button className="cursor-pointer" onClick={() => {
          acceptInvoiceAnalysis(commerceId, supplier, localItems)
            .then(() => {
              changeJobResponse(imageId, "delete");
              setOpen(false);
            })
            .catch((err: unknown) => toast.error(
              err instanceof Error ? err.message : "Error al guardar cambios"
            ));
        }}>Aceptar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}