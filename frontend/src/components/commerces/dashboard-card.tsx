// components/dashboard-card.tsx
import { ReactNode } from "react"

export function DashboardCard({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <div className="rounded-xl border bg-background p-5 shadow-sm flex flex-col gap-5">
      <h3 className="mb-4 text-sm font-medium text-muted-foreground">
        {title}
      </h3>
      {children}
    </div>
  )
}