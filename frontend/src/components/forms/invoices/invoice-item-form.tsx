import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { toast } from "sonner"

type LocalItem = {
  name: string
  quantity: number
  unit_price: number
  measure: string
  id: string
}

export default function InvoiceItemForm({ item, onOpenChange, onSave }: { item: LocalItem, onOpenChange: (open: boolean) => void, onSave: (updatedItem: LocalItem) => void }) {

  const [form, setForm] = useState<LocalItem>({
    name: item.name ?? "",
    quantity: item.quantity ?? 0,
    unit_price: item.unit_price ?? 0,
    measure: item.measure ?? "",
    id: item.id ?? "",
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!form.name.trim()) {
      return toast.error("El nombre es obligatorio")
    }

    onSave(form)
    onOpenChange(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label className="mb-2" htmlFor="name">Nombre</Label>
        <Input
          id="name"
          value={form.name.toUpperCase()}
          onChange={e => setForm(p => ({ ...p, name: e.target.value.toUpperCase() }))}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="mb-2" htmlFor="quantity">Unidades</Label>
          <Input
            id="quantity"
            type="number"
            min={0}
            step={1}
            value={form.quantity}
            onChange={e => {
              const val = e.target.value
              setForm(p => ({
                ...p,
                quantity: val === "" ? 0 : Number(val),
              }))
            }}
          />
        </div>

        <div>
          <Label className="mb-2" htmlFor="measure">Medida</Label>
          <Input
            id="measure"
            placeholder="kg, g, l, ml"
            value={form.measure}
            onChange={e => setForm(p => ({ ...p, measure: e.target.value }))}
          />
        </div>
      </div>

      <div>
        <Label className="mb-2" htmlFor="price">Precio Unit.</Label>
        <Input
          id="price"
          type="number"
          min={0}
          max={100_000_000}
          step="0.01"
          value={form.unit_price}
          onChange={e => {
            const val = e.target.value
            setForm(p => ({
              ...p,
              unit_price: val === "" ? 0 : Number(val),
            }))
          }}
        />
      </div>

      <Button type="submit" className="w-full cursor-pointer">Guardar</Button>
    </form>
  )
}