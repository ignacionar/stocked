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
import { Pencil } from "lucide-react"
import { Commerce } from "@shared/types/entities"
import CommerceForm from "./commerce-form"

export function EditCommerceDialog({ commerce }: { commerce: Commerce }) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white">
          <Pencil className="mr-2 h-4 w-4" />
          Editar
        </Button>
      </DialogTrigger>

      <DialogContent className="[&>button:last-child]:cursor-pointer">
        <DialogHeader>
          <DialogTitle>Editar comercio</DialogTitle>
        </DialogHeader>

        <CommerceForm mode="update" commerce={commerce} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
