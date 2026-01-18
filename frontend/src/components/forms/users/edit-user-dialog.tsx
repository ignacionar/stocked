"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import UserForm from "./user-form"
import { User } from "@shared/types/entities"

type Props = {
  user: User & {
    commerceIds: string[]
  },
  open: boolean,
  onOpenChange: (open: boolean) => void,
}

export default function EditUserDialog({ user, open, onOpenChange }: Props) {

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
      </DialogTrigger>

      <DialogContent className="[&>button:last-child]:cursor-pointer">
        <DialogHeader>
          <DialogTitle>Editar usuario</DialogTitle>
        </DialogHeader>

        <UserForm
          mode="update"
          user={user}
          onSuccess={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}