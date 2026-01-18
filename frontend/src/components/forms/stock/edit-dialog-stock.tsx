"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Stock } from "@shared/types/entities"
import StockForm from "./stock-form"

type Props = {
  stock: Stock
  open: boolean
  onOpenChange: (open: boolean) => void
  suppliers: string[]
}

export default function EditStockDialog({ stock, open, onOpenChange, suppliers }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="[&>button:last-child]:cursor-pointer">
        <DialogHeader>
          <DialogTitle>Editar producto</DialogTitle>
        </DialogHeader>

        <StockForm
          suppliers={suppliers}
          mode="update"
          stock={stock}
          commerceId={stock.commerceId}
          onSuccess={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
