"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import CommerceForm from "./commerce-form"

export function CreateCommerceDialog() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="cursor-pointer w-full justify-start">
          <Plus className="mr-2 h-4 w-4" />
          Crear una nueva sucursal
        </Button>
      </DialogTrigger>

      <DialogContent className="[&>button:last-child]:cursor-pointer">
        <DialogHeader>
          <DialogTitle>Crear otra sucursal</DialogTitle>
        </DialogHeader>

        <CommerceForm mode="create" onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
