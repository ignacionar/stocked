"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createStock, updateStock } from "@/app/(private)/[commerceId]/stock/actions"
import { Stock } from "@shared/types/entities"
import SelectString from './../../stock/stock-props-selector';

type StockFormMode = "create" | "update"

type StockFormProps = {
  mode: StockFormMode
  commerceId: string
  stock?: Stock
  onSuccess: () => void
  suppliers: string[]
}

type StockFormState = {
  name: string
  supplier: string
  measure: string
  quantity: number | ""
  price: number | ""
  commerceId: string
}

export default function StockForm({
  mode,
  commerceId,
  stock,
  onSuccess,
  suppliers
}: StockFormProps) {
  const [isPending, startTransition] = useTransition()

  // use stockformstate
  const [form, setForm] = useState<StockFormState>({
    name: stock?.name ?? "",
    supplier: stock?.supplier ?? "",
    measure: stock?.measure ?? "",
    quantity: stock?.quantity ?? 0,
    price: stock?.price ?? 0,
    commerceId,
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!form.name.trim()) {
      return toast.error("El nombre es obligatorio")
    }

    if (!form.supplier.trim()) {
      return toast.error("El proveedor es obligatorio")
    }

    startTransition(async () => {
      try {
        const payload = {
          ...form,
          quantity: form.quantity === "" ? 0 : form.quantity,
          price: form.price === "" ? 0 : form.price,
        }
        if (mode === "create") {
          await createStock(payload)
          toast.success("Producto creado correctamente")
        } else {
          await updateStock({ id: stock!.id, ...payload })
          toast.success("Producto actualizado correctamente")
        }

        onSuccess()
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Error al guardar el producto"
        )
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label className="mb-2" htmlFor="name">Nombre</Label>
        <Input
          id="name"
          value={form.name}
          onChange={e => setForm(p => ({ ...p, name: e.target.value.toUpperCase() }))}
        />
      </div>

      <div>
        <Label className="mb-2" htmlFor="supplier">Proveedor</Label>
        {/* <Input
          id="supplier"
          value={form.supplier}
          onChange={e => setForm(p => ({ ...p, supplier: e.target.value.toUpperCase() }))}
        /> */}
        <SelectString 
          type="supplier"
          value={form.supplier}
          items={suppliers}
          onSelect={value => setForm(p => ({ ...p, supplier: value.toUpperCase() }))}
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
              quantity: val === "" ? "" : Number(val),
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
          value={form.price}
          onChange={e => {
            const val = e.target.value
            setForm(p => ({
              ...p,
              price: val === "" ? "" : Number(val),
            }))
          }}
        />
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending
          ? "Guardando..."
          : mode === "create"
            ? "Añadir producto"
            : "Actualizar producto"}
      </Button>
    </form>
  )
}