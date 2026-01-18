"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Edit } from "lucide-react"
import { useState } from "react"

type EditPaymentMethodDialogProps = {
  draft: string
  onDraftChange: (value: string) => void
  onSave: () => void
}

export default function EditPaymentMethodDialog({
  draft,
  onDraftChange,
  onSave,
}: EditPaymentMethodDialogProps) {

  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost" className="cursor-pointer">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="[&>button:last-child]:cursor-pointer">
        <DialogHeader>
          <DialogTitle>Editar método de pago</DialogTitle>
        </DialogHeader>

        <Input
          value={draft}
          onChange={(e) => onDraftChange(e.target.value.toUpperCase())}
          placeholder="Método de pago"
        />

        <DialogFooter>
          <Button onClick={() => {
              onSave()
              setOpen(false) 
            }} className="cursor-pointer">
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
