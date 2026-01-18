"use client"

import { useRouter } from "next/navigation"
import { FileSearch, RefreshCcw, Trash2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { InvoiceJob, Role, JobStatus } from "@shared/types/entities"
import { deleteInvoiceJob } from "@/app/(private)/[commerceId]/invoices/actions"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import "dayjs/locale/es"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { useSession } from "@/lib/auth-client"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"

dayjs.extend(relativeTime)
dayjs.locale("es")

const JOB_STATUS_UI: Record<
  JobStatus,
  { label: string; badgeVariant: "default" | "secondary" | "destructive", backgroundColor?: string }
> = {
  APPROVED: { label: "Aprobado", badgeVariant: "secondary", backgroundColor: "bg-green-600 text-white" },
  PENDING: { label: "En cola", badgeVariant: "secondary", backgroundColor: "bg-yellow-600 text-white" },
  PROCESSING: { label: "En proceso", badgeVariant: "secondary", backgroundColor: "bg-yellow-600 text-white" },
  COMPLETED: { label: "Completado", badgeVariant: "default", backgroundColor: "bg-blue-600 text-white" },
  FAILED: { label: "Error", badgeVariant: "destructive", backgroundColor: "bg-red-600 text-white" },
  INVALID: { label: "Inválido", badgeVariant: "destructive", backgroundColor: "bg-orange-600 text-white" },
}

export function InvoiceJobsList({
  commerceId,
  jobs,
}: {
  commerceId: string
  jobs: (InvoiceJob & { user?: { name: string; image: string | null } })[]
}) {
  const router = useRouter()
  const [refreshing, setRefreshing] = useState(false)
  const { data: session } = useSession()

  if (!jobs.length) return null

  return (
  <Card className="mx-auto mb-5 w-[full] md:max-w-[500px] mx-auto ">
    <CardContent className="space-y-2">
      <div className="flex items-center justify-between mb-2">
      <h3 className="text-sm font-medium">Últimos procesos</h3>
      <Button
        className="cursor-pointer"
        size="icon"
        variant="ghost"
        disabled={refreshing}
        onClick={async () => {
          setRefreshing(true)
          router.refresh()
          setTimeout(() => setRefreshing(false), 500)
        }}
      >
        <RefreshCcw
          className={cn(
            "h-4 w-4 transition-transform",
            refreshing && "animate-spin"
          )}
        />
      </Button>
      </div>
      <ScrollArea className="h-48">  

      <div className="space-y-1">
        {jobs.map(job => {
          const ui = JOB_STATUS_UI[job.status]

          return (
            <div
            key={job.id}
            className="
              border-t px-3 py-3
              flex flex-col 
              md:flex-row md:items-center
            "
          >
              <div className="flex items-center gap-2 w-full">
                <Button
                  onClick={() =>
                    router.push(`/${commerceId}/invoices/${job.id}`)
                  }
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <FileSearch className="h-4 w-4" />
                  Ver {job.filesCount} archivo{job.filesCount > 1 ? "s" : ""}
                </Button>

                <Badge variant={ui.badgeVariant} className={ui.backgroundColor}>
                  {ui.label}
                </Badge>
              </div>

              <div className="flex items-center  text-xs text-muted-foreground gap-2 w-full">
                {
                  job.user ? (
                    <span className="flex items-center gap-2">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={job.user.image ?? undefined} alt={job.user.name} />
                      <AvatarFallback>{job.user.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    
                      Creado por {job.user.name} { dayjs(job.createdAt).fromNow()}    
                    </span>
                  ) : (
                    <>
                      Creado {dayjs(job.createdAt).fromNow()}
                    </>
                  )
                }
                 {
                  session?.user.role !== Role.USER && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive cursor-pointer self-end"
                      onClick={async (e) => {
                        e.stopPropagation()
                        await deleteInvoiceJob(commerceId, job.id)
                        router.refresh()
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )
                }
              </div> 
            </div>

            )
        })}
      </div>
      <ScrollBar orientation="vertical" />
      </ScrollArea>
    </CardContent>
  </Card>
  )
}
