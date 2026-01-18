import { Wrench } from "lucide-react";

export default function Wip() {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <Wrench className="h-4 w-4" />
      En desarrollo
    </div>
  )
}