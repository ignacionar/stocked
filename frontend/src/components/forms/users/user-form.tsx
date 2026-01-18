"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { CommerceSelect } from "../../ui/commerce-select"
import { useCommerces } from "@/contexts/commerce-context"
import { createUser, updateUser } from "@/app/(private)/users/actions"
import { useSession } from "@/lib/auth-client"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Role, Plan } from "@shared/types/entities"

type UserFormMode = "create" | "update"

type UserFormProps = {
  mode: UserFormMode
  user?: {
    id: string
    name: string
    email: string
    occupation?: string
    role: Role
    plan: Plan
    commerceIds: string[]
  }
  onSuccess: () => void
}

export default function UserForm({
  mode,
  user,
  onSuccess,
}: UserFormProps) {
  const { commerces } = useCommerces()
  const [isPending, startTransition] = useTransition()

  const { data: session } = useSession();

  const [selectedCommerceIds, setSelectedCommerceIds] = useState<string[]>(
    user?.commerceIds ?? []
  )

  const onChange = (value: Role) => {
    setForm(prev => ({ ...prev, role: value }))
  }

  const [form, setForm] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    occupation: user?.occupation ?? "",
    oldPassword: "",
    newPassword: "",
    role: user?.role ?? Role.USER,
    plan: user?.plan ?? Plan.BASIC,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedCommerceIds.length) {
      return toast.error("Debe asignar al menos una sucursal.")
    }

    if (mode === "create" && form.newPassword.length < 8) {
      return toast.error("La contraseña debe tener al menos 8 caracteres.")
    }

    startTransition(async () => {
      try {
        if (mode === "create") {
          await createUser({
            name: form.name,
            email: form.email,
            role: form.role,
            plan: form.plan,
            occupation: form.occupation,
            newPassword: form.newPassword,
            commerceIds: selectedCommerceIds,
          })
          toast.success("Usuario creado correctamente")
        } else {
          await updateUser({
            id: user!.id,
            name: form.name,
            occupation: form.occupation,
            oldPassword: form.oldPassword || undefined,
            newPassword: form.newPassword || undefined,
            commerceIds: selectedCommerceIds,
          })
          toast.success("Usuario actualizado correctamente")
        }

        onSuccess()
      } catch (err) {
        console.log(err)
        toast.error("Error al guardar el usuario")
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label className="mb-2" htmlFor="name">Nombre</Label>
        <Input
          id="name"
          name="name"
          onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
          value={form.name}
        />
      </div>

      <div>
        <Label className="mb-2" htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          value={form.email}
          disabled={mode === "update"}
          onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
        />
      </div>

      {
        mode === "update" &&
        <div>
          <Label className="mb-2" htmlFor="oldPassword">
            Contraseña Anterior {mode === "update" && "(opcional)"}
          </Label>
          <Input
            id="oldPassword"
            name="oldPassword"
            type="password"
            value={form.oldPassword}
            onChange={e => setForm(prev => ({ ...prev, oldPassword: e.target.value }))}
            autoComplete="new-password"
          />
        </div>
      }

      <div>
        <Label className="mb-2" htmlFor="newPassword">
          Contraseña {mode === "update" && "Nueva"}
        </Label>
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          value={form.newPassword}
          onChange={e => setForm(prev => ({ ...prev, newPassword: e.target.value }))}
          required={mode === "create"}
          autoComplete="new-password"
        />
      </div>

      <div>
        <Label className="mb-2" htmlFor="occupation">Ocupación</Label>
        <Input
          id="occupation"
          name="occupation"
          value={form.occupation}
          onChange={e => setForm(prev => ({ ...prev, occupation: e.target.value }))}
        />
      </div>

      {
        session?.user.role === Role.OWNER && (
          <div>
            <Label className="mb-2" htmlFor="role">Rol</Label>
            <Select value={form.role} onValueChange={onChange}>
            <SelectTrigger className="w-full cursor-pointer">
              <SelectValue placeholder={"Seleccionar Rol"} />
            </SelectTrigger>

            <SelectContent>
              <SelectGroup>
                <SelectLabel>Roles</SelectLabel>
                <SelectItem value={Role.USER}>Usuario</SelectItem>
                <SelectItem value={Role.ADMIN}>Admin</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          </div>
        )
      }

      {(user?.role === Role.USER || mode === "create") && (
        <div className="space-y-2">
          <Label>Sucursales</Label>

          <CommerceSelect
            value=""
            onChange={(commerceId) => {
              setSelectedCommerceIds(prev =>
                prev.includes(commerceId)
                  ? prev
                  : [...prev, commerceId]
              )
            }}
          />

          <div className="flex flex-wrap gap-2">
            {selectedCommerceIds.map(id => {
              const commerce = commerces.find(c => c.id === id)
              if (!commerce) return null

              return (
                <Badge key={id} variant="secondary">
                  {commerce.name}
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-4 w-4 cursor-pointer"
                    onClick={() =>
                      setSelectedCommerceIds(prev =>
                        prev.filter(x => x !== id)
                      )
                    }
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )
            })}
          </div>
        </div>
      )}

      <Button type="submit" disabled={isPending} className="w-full cursor-pointer">
        {isPending
          ? "Guardando..."
          : mode === "create"
            ? "Crear usuario"
            : "Actualizar usuario"}
      </Button>
    </form>
  )
}