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
import { deleteUser } from "@/app/(private)/users/actions"

type Props = {
  userId: string
  userName?: string
  userCommerces: string[]
}

export default function RemoveUserDialog({ userId, userName, userCommerces }: Props) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteUser(userId, userCommerces);
        toast.success("Usuario eliminado correctamente")
        setOpen(false)
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Error al eliminar el usuario"
        )
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center text-red-600 hover:text-red-700">
          <Trash2 className="mr-2 h-4 w-4" />
          Eliminar Usuario
        </button>
      </DialogTrigger>

      <DialogContent className="[&>button:last-child]:cursor-pointer">
        <DialogHeader>
          <DialogTitle className="text-red-600">
            ¿Eliminar usuario?
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          Esta acción es irreversible.
          {userName && (
            <>
              <br />
              Se eliminará el usuario <strong>{userName}</strong>.
            </>
          )}
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