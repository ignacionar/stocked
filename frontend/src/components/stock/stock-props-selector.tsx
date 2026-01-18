"use client"

import { CheckIcon, ChevronsUpDownIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useState } from "react"
import { Separator } from "../ui/separator"

interface SelectStringProps {
  items: string[]
  type: "name" | "supplier"
  value?: string
  onSelect?: (value: string) => void
}

export default function SelectString({
  items,
  type,
  value: propValue,
  onSelect,
}: SelectStringProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const selected = propValue ?? ""
    
  const handleSelect = (val: string) => {
    const value = val.toUpperCase()

    setSearch("")
    setOpen(false)

    if (onSelect) {
      onSelect(value)
      return
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[180px] h-10 px-3 flex items-center gap-2"
        >
          <span className="flex-1 truncate text-left font-normal">
            {selected || `Buscar ${type === "name" ? "nombre" : "proveedor"}...`}
          </span>

          <ChevronsUpDownIcon className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[350px] p-0"
        align="start"
        sideOffset={4}
      >
        <Command className="h-[200px]">
          <CommandInput
            placeholder={`Buscar ${type === "name" ? "nombre" : "proveedor"}...`}
            value={search}
            onValueChange={(val) => setSearch(val.toUpperCase())}
            onKeyDown={(e) => {
              if (e.key === "Enter" && search.trim() !== "") {
                e.preventDefault()
                handleSelect(search.trim())
              }
            }}
          />

          <CommandList className="max-h-[150px] overflow-y-auto">
            <CommandEmpty>
              No se encontró el{" "}
              {type === "name" ? "nombre" : "proveedor"}.
            </CommandEmpty>

            <CommandGroup>
              {items && items.map((item) => (
                <CommandItem
                  key={item}
                  value={item}
                  onSelect={() => handleSelect(item)}
                >
                  <CheckIcon
                    className={cn(
                      "mr-2 h-4 w-4",
                      selected === item ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {item}
                </CommandItem>
              ))}
            </CommandGroup>
            {selected && 
            <CommandGroup>
            <Separator className="mb-2"/>
              <CommandItem
                value="__clear__"
                className="justify-center text-muted-foreground"
                onSelect={() => {
                  setSearch("")
                  setOpen(false)

                  if (onSelect) {
                    onSelect("")
                    return
                  }
                }}
              >
                Limpiar selección
              </CommandItem>
          </CommandGroup>}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}