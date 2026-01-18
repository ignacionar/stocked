"use client"

import { useState, useTransition } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"
import { deleteCommerce } from "@/app/(private)/actions"
import { useRouter } from "next/navigation"


export default function RemoveCommerceDialog({ id, name }: { id: string; name: string }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteCommerce(id)
        toast.success("Sucursal eliminada correctamente")
        setOpen(false)
        router.push('/-')

      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Error al eliminar la sucursal"
        )
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center w-full justify-start cursor-pointer bg-red-600 hover:bg-red-500 text-white">
          <Trash2 className="mr-2 h-4 w-4" />
          Eliminar Sucursal
        </Button>
      </DialogTrigger>

      <DialogContent className="[&>button:last-child]:cursor-pointer">
        <DialogHeader>
          <DialogTitle className="text-red-600">
            ¿Eliminar sucursal?
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          Esta acción es irreversible: 
          <br />
          - El inventario y los reportes asociados <strong>se perderán</strong>.

          <br />
          - Si hay usuarios <strong>vinculados SOLO a esta sucursal</strong>, también serán eliminados.
          <br />
          <br />
          Se eliminará la sucursal <strong>{name}</strong>.
        </p>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
            className="cursor-pointer"
          >
            Cancelar
          </Button>

          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
            className="cursor-pointer"
          >
            {isPending ? "Eliminando..." : "Eliminar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}