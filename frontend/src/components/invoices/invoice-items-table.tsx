"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ScrollArea, ScrollBar } from "../ui/scroll-area"
import { Button } from "../ui/button"
import { Card } from "../ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { Edit, MoreHorizontal, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import EditPaymentMethodDialog from "../forms/invoices/edit-payment-method-dialog"
import EditInvoiceItemDialog from "../forms/invoices/edit-invoice-item-dialog"
import SelectString from "../stock/stock-props-selector"
import { getAllSuppliers } from "@/app/(private)/[commerceId]/stock/actions"
import { useUndoable } from "@/hooks/use-undoable"
import RemoveInvoiceDialog from "../forms/invoices/remove-invoice-dialog"
import AcceptInvoiceDialog from "../forms/invoices/accept-invoice-dialog"

type LocalItem = {
  name: string
  quantity: number
  unit_price: number
  measure: string
  id: string
}

type InvoiceDraft = {
  items: LocalItem[]
  supplier: string
  paymentMethod: string
}

export function InvoiceItemsTable({
  items,
  supplier,
  paymentMethod,
  commerceId,
  changeJobResponse,
  imageId
}: {
  items: LocalItem[]
  supplier: string
  paymentMethod: string
  commerceId: string
  changeJobResponse: (id: string, method: "update" | "delete", updatedItems?: { updatedItems: LocalItem[], paymentMethod?: string, supplier?: string }) => void,
  imageId: string
}) {

  const [editItem, setEditItem] = useState<LocalItem | null>(null)
  const [allSuppliers, setAllSuppliers] = useState<string[]>([supplier])

  const {
    state: draft,
    commit,
    undo,
    canUndo,
  } = useUndoable<InvoiceDraft>({
    items,
    supplier,
    paymentMethod,
  })
  
  const { items: localItems, supplier: currentSupplier } = draft

  useEffect(() => {
    async function fetchSuppliers() {
      const suppliers = await getAllSuppliers(commerceId);
      setAllSuppliers(suppliers)
    }
    fetchSuppliers()

    function onKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault()
        undo()
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [commerceId, undo])

  const [paymentDraft, setPaymentDraft] = useState(paymentMethod)

  return (
    <>
      <ScrollArea className="grid">
        <Card className="px-4 max-h-200 overflow-auto mx-auto w-[1000px]">
          <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">Proveedor:</p>
              <SelectString
                type="supplier"
                value={currentSupplier}
                onSelect={(value) => {
                  const next = {
                    ...draft,
                    supplier: value,
                  }

                  commit(next)
                  changeJobResponse(imageId, "update", {
                    updatedItems: next.items,
                    supplier: value,
                    paymentMethod: next.paymentMethod,
                  })
                }}
                items={allSuppliers}
              />
            </div>

            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">Método de pago:</p>
              {draft.paymentMethod && <Badge>{draft.paymentMethod}</Badge>}

              <EditPaymentMethodDialog 
                draft={paymentDraft}
                onDraftChange={setPaymentDraft}
                onSave={() => {
                  const next = {
                    ...draft,
                    paymentMethod: paymentDraft,
                  }

                  commit(next)
                  changeJobResponse(imageId, "update", {
                    updatedItems: next.items,
                    paymentMethod: paymentDraft,
                    supplier: next.supplier,
                  })
                }}
              />
            </div>
          </div>

          <Table className="border mb-4">
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[300px]">Producto</TableHead>
                <TableHead>Cantidad</TableHead>
                <TableHead>Medida</TableHead>
                <TableHead>Precio Unit.</TableHead>
                <TableHead>Subtotal</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {localItems.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium break-words whitespace-normal">
                    {item.name.toUpperCase()}
                  </TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>
                    {item.measure && (
                      <Badge variant={"secondary"}>{item.measure}</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    ${(item.unit_price || 0).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    ${(item.quantity * item.unit_price).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0 cursor-pointer"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>
                          Acciones
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-blue-600 focus:text-blue-600"
                          onClick={() =>
                            setEditItem({ ...item })
                          }
                        >
                          <button className="flex items-center">
                            <Edit className="mr-2 h-4 w-4" />
                            Editar Item
                          </button>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600 focus:text-red-600">
                         <button
                            className="flex items-center"
                            onClick={() => {
                              const updatedItems = draft.items.filter((_, i) => i !== idx)
                              const next = {
                                ...draft,
                                items: updatedItems,
                              }

                              commit(next)
                              changeJobResponse(imageId, "update", { updatedItems })
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar Item
                          </button>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}

              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-right font-bold"
                >
                  Total:
                </TableCell>
                <TableCell className="font-bold">
                  ${localItems.reduce((acc, i) => acc + i.quantity * i.unit_price, 0).toFixed(2)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <div className="flex items-center gap-4 justify-end">
            <AcceptInvoiceDialog changeJobResponse={changeJobResponse} imageId={imageId} localItems={localItems} supplier={supplier} />
            <Button
              variant="outline"
              disabled={!canUndo}
              onClick={undo}
              className="cursor-pointer"
            >
              Revertir último cambio
            </Button>
            <RemoveInvoiceDialog changeJobResponse={changeJobResponse} imageId={imageId} />
          </div>

          <ScrollBar orientation="horizontal" />
        </Card>
      </ScrollArea>

      {editItem && (
        <EditInvoiceItemDialog
          item={editItem}
          open={true}
          onOpenChange={(open) => {
            if (!open) setEditItem(null)
          }}
          onSave={(updatedItem) => {
            const updatedItems = draft.items.map(i =>
              i.id === updatedItem.id ? updatedItem : i
            )

            const next = {
              ...draft,
              items: updatedItems,
            }

            commit(next)
            changeJobResponse(imageId, "update", { updatedItems })
          }}
        />
      )}
    </>
  )
}