"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import StockForm from "./stock-form"

export default function CreateStockDialog({ commerceId, suppliers }: { commerceId: string, suppliers: string[] }) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="cursor-pointer w-fit">
          <Plus className="mr-2 h-4 w-4" />
          Añadir Producto
        </Button>
      </DialogTrigger>

      <DialogContent className="[&>button:last-child]:cursor-pointer">
        <DialogHeader>
          <DialogTitle>Añadir producto</DialogTitle>
        </DialogHeader>

        <StockForm
          mode="create"
          commerceId={commerceId}
          onSuccess={() => setOpen(false)}
          suppliers={suppliers}
        />
      </DialogContent>
    </Dialog>
  )
}
