import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import InvoiceItemForm from "./invoice-item-form";

type LocalItem = {
  name: string
  quantity: number
  unit_price: number
  measure: string
  id: string
}

export default function EditInvoiceItemDialog({ open, onOpenChange, item, onSave }: { open: boolean; onOpenChange: (open: boolean) => void, item: LocalItem, onSave: (updatedItem: LocalItem) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="[&>button:last-child]:cursor-pointer">
        <DialogHeader>
          <DialogTitle>Editar item</DialogTitle>
        </DialogHeader>

        <InvoiceItemForm item={item} onOpenChange={onOpenChange} onSave={onSave}/>        
      </DialogContent>
    </Dialog>
  )
}