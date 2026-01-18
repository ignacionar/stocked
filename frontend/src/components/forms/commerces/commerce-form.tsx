"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createCommerce, updateCommerce } from "@/app/(private)/actions"
import { Commerce } from "@shared/types/entities"

type CommerceFormMode = "create" | "update"

type Props = {
  mode: CommerceFormMode
  commerce?: Commerce
  onSuccess: () => void
}

export default function CommerceForm({
  mode,
  commerce,
  onSuccess,
}: Props) {
  const [isPending, startTransition] = useTransition()

  const [form, setForm] = useState({
    name: commerce?.name ?? "",
    location: commerce?.location ?? "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.name.trim()) {
      return toast.error("El nombre es obligatorio")
    }

    if (!form.location.trim()) {
      return toast.error("La ubicación es obligatoria")
    }

    startTransition(async () => {
      try {
        if (mode === "create") {
          await createCommerce(form)
          toast.success("Sucursal creada correctamente")
        } else {
          await updateCommerce({
            id: commerce!.id,
            ...form,
          })
          toast.success("Sucursal actualizada correctamente")
        }

        onSuccess()
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Error al guardar la sucursal"
        )
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label className="mb-2">Nombre</Label>
        <Input
          value={form.name}
          onChange={e =>
            setForm(prev => ({ ...prev, name: e.target.value }))
          }
        />
      </div>

      <div>
        <Label className="mb-2">Ubicación</Label>
        <Input
          value={form.location}
          onChange={e =>
            setForm(prev => ({ ...prev, location: e.target.value }))
          }
        />
      </div>

      <Button type="submit" disabled={isPending} className="w-full cursor-pointer">
        {isPending
          ? "Guardando..."
          : mode === "create"
            ? "Crear sucursal"
            : "Actualizar sucursal"}
      </Button>
    </form>
  )
}