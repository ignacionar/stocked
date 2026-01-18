"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select"

import { useCommerces } from "@/contexts/commerce-context"
import { Commerce } from "@shared/types/entities"

type Props = {
  value?: string
  onChange: (commerceId: string) => void
  placeholder?: string
}

export function CommerceSelect({
  value,
  onChange,
  placeholder = "Seleccione la sucursal...",
}: Props) {

  const { commerces }: { commerces: Commerce[] } = useCommerces()

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full cursor-pointer">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>

      <SelectContent>
        <SelectGroup>
          <SelectLabel>Sucursales</SelectLabel>
          {commerces.map(commerce => (
            <SelectItem key={commerce.id} value={commerce.id}>
              {commerce.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}