"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { decode, encode } from "@toon-format/toon"
import { FileTextIcon } from "lucide-react"
import { JobStatus, InvoiceJob } from "@shared/types/entities"
import { getInvoiceJob, updateInvoiceJobResponse, updateInvoiceJobStatus } from "@/app/(private)/[commerceId]/invoices/actions"
import { useFiles } from "@/contexts/image-context"
import { Spinner } from "@/components/ui/spinner"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { InvoiceItemsTable } from "./invoice-items-table"
import { toast } from 'sonner';

type AIResponse = {
  images: {
    items: Item[]
    payment_method: string
    supplier: string
    valid: boolean
    id: string
  }[]
}

type Item = {
  name: string
  quantity: number
  unit_price: number
  measure: string
  id: string
}

export function JobClientView({ initialJob }: { initialJob: InvoiceJob }) {
  const [job, setJob] = useState(initialJob)
  const { files } = useFiles()
  const router = useRouter()
  const [imageIndex, setImageIndex] = useState<number | null>(null)

  const [imagesData, setImagesData] = useState<AIResponse | null>(null)
  
  useEffect(() => {
    if (job.status === JobStatus.COMPLETED && imagesData?.images.length === 1 && !imagesData.images[0].valid) {
      updateInvoiceJobStatus(job.commerceId, job.id, JobStatus.INVALID)
      .then(() => {
        router.back();
      })
    }

    if (job.status === JobStatus.COMPLETED && imagesData?.images.length === 0) {
      router.back();
      router.refresh();
    }
    
    if (job.status !== JobStatus.PENDING && job.status !== JobStatus.PROCESSING) return

    const interval = setInterval(async () => {
      const res = await getInvoiceJob(job.commerceId, job.id)
      if (res) setJob(res)
    }, 3000)

    return () => clearInterval(interval)
  }, [job.commerceId, job.id, job.status, imagesData?.images, router])

  useEffect(() => {
    if (!job.response) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setImagesData(null)
      return
    }

    const decoded = decode(job.response) as AIResponse | null
    if (!decoded?.images) {
      setImagesData(decoded)
      return
    }

    setImagesData({
      ...decoded,
      images: decoded.images.map((image) => ({
        ...image,
        id: image.id ?? crypto.randomUUID(),
        items: Array.isArray(image.items)
          ? image.items.map((item) => ({
            ...item,
            id: item.id ?? crypto.randomUUID(),
          }))
          : [],
      })),
    })

  }, [job.response, job.id])

  const changeJobResponse = async (imageId: string, method: "update" | "delete", newData?: { updatedItems: Item[], paymentMethod?: string, supplier?: string }) => {
    if (!imagesData) return

    let updated: AIResponse = { ...imagesData }

    try {
      if (method === "delete") {
         updated = {
          ...imagesData,
          images: imagesData.images.filter(img => img.id !== imageId),
        }
        setImageIndex(null)
      } else {
        updated = {
          ...imagesData,
          images: imagesData.images.map(img =>
            img.id === imageId
              ? { ...img, items: newData?.updatedItems ?? img.items, payment_method: newData?.paymentMethod ?? img.payment_method, supplier: newData?.supplier ?? img.supplier }
              : img
        ),
      }
    }
      await updateInvoiceJobResponse(job.commerceId, job.id, encode(updated), updated.images.length)
      setImagesData(updated)
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Error al guardar cambios"
      )
    }
  }

  if (job.status === JobStatus.PENDING || job.status === JobStatus.PROCESSING) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Spinner className="mb-4 size-10" />
        <p className="text-muted-foreground">Procesando documentos…</p>
        <p className="text-muted-foreground">Esto puede llevar unos minutos</p>
      </div>
    )
  }

  if (job.status === JobStatus.INVALID) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <h1 className="mb-6 text-3xl font-bold text-center">
          Se encontraron archivos inválidos
        </h1>
        <Button className="mb-6 cursor-pointer text-muted-foreground" variant="link" onClick={() => router.back()}>
          ← Volver atrás
        </Button>
      </div>
    )
  }

  if (job.status === JobStatus.FAILED) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <h1 className="mb-6 text-3xl font-bold text-center">
          Error procesando el documento. Contacte al soporte.
        </h1>
        <p className="mb-6 text-sm">ID: {job.id}</p>
        <Button className="mb-6 cursor-pointer text-muted-foreground" variant="link" onClick={() => router.back()}>
          ← Volver atrás
        </Button>
      </div>
    )
  }


  if (job.status === JobStatus.COMPLETED && imageIndex === null) {
    return (
      <section className="px-4 py-10">
        {
          <>
            <h1 className="mb-2 text-center text-3xl font-bold">
              Documentos procesados
            </h1>
            <p className="mb-6 text-center text-muted-foreground">
              Seleccione una factura para ver el detalle
            </p>

            <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 sm:grid-cols-3">
              {imagesData?.images.map((image, index) => (
                <Card
                  className={`group p-3 transition
                    ${image.valid
                      ? "cursor-pointer hover:shadow-lg"
                      : "cursor-not-allowed opacity-50"
                    }
                  `}
                  key={index}
                  onClick={() => setImageIndex(image.valid ? index : null)}
                >
                  <div className="flex aspect-square items-center justify-center overflow-hidden rounded-md bg-muted">
                    {files[index]?.preview ? (
                      <Image
                        src={files[index].preview}
                        alt={files[index].name}
                        width={300}
                        height={300}
                        className="h-full w-full object-cover transition group-hover:scale-105"
                      />
                    ) : (
                      <FileTextIcon className="size-12 text-muted-foreground" />
                    )}
                  </div>

                  <p className="mt-2 truncate text-center text-sm">
                    {files[index]?.name ?? `Factura ${index + 1}`}{!image.valid && " (inválida)"}
                  </p>
                </Card>
              ))}
            </div>
            <Button
              className="mb-6 text-muted-foreground w-full cursor-pointer mt-5"
              variant="link"
              onClick={() => router.back()}
            >
              ← Volver atrás
            </Button>
          </>
          }
      </section>
    )
  }

  if (job.status === JobStatus.COMPLETED && imageIndex !== null) {
    return <>
      <InvoiceItemsTable
        imageId={imagesData?.images[imageIndex].id || ""}
        changeJobResponse={changeJobResponse}
        commerceId={job.commerceId}
        items={imagesData?.images[imageIndex].items || []}
        supplier={imagesData?.images[imageIndex].supplier || ""}
        paymentMethod={imagesData?.images[imageIndex].payment_method || ""}
      />
      <Button
        className="mb-6 text-muted-foreground w-full cursor-pointer mt-5"
        variant="link"
        onClick={() => setImageIndex(null)}
      >
        ← Volver atrás
      </Button>
    </>
  }
}