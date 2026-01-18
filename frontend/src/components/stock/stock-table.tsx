"use client"

import {
  MoreHorizontal,
  Search,
  Filter,
  Edit,
  Bell,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import dayjs from "dayjs"
import { useMemo, useState } from "react"
import { Stock } from "@shared/types/entities"
import CreateStockDialog from './../forms/stock/create-dialog-stock';
import SelectString from "./stock-props-selector"
import RemoveStockDialog from "../forms/stock/remove-dialog-stock"
import EditStockDialog from './../forms/stock/edit-dialog-stock';
import Wip from "../wip"

type SortKey = "name" | "price" | "quantity" | "createdAt" | "supplier"

interface SortHeaderProps {
  label: string
  sortKey: SortKey
  sort: {
    key: SortKey
    direction: "asc" | "desc"
  }
  onToggleSort: (key: SortKey) => void
}

function SortHeader({ label, sortKey, sort, onToggleSort }: SortHeaderProps) {
  return (
    <button
      onClick={() => onToggleSort(sortKey)}
      className="flex items-center gap-1 font-medium hover:text-foreground cursor-pointer"
    >
      {label}
      {sort.key === sortKey && (
        <span className="text-xs">
          {sort.direction === "asc" ? "▲" : "▼"}
        </span>
      )}
    </button>
  )
}

export default function StockManagementTable({
  stockItems,
  pageSize,
  measures,
  commerceId,
  suppliers
}: {
  stockItems: Stock[]
  pageSize: number
  measures: string[]
  commerceId: string
  suppliers: string[]
}) {
  const [search, setSearch] = useState("")
  const [measure, setMeasure] = useState("all")
  const [supplier, setSupplier] = useState("")
  const [page, setPage] = useState(1)
  const [editingStock, setEditingStock] = useState<Stock | null>(null)

  const [sort, setSort] = useState<{
    key: SortKey
    direction: "asc" | "desc"
  }>({
    key: "createdAt",
    direction: "desc",
  })

  const toggleSort = (key: SortKey) => {
    setSort(prev => ({
      key,
      direction:
        prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }))
  }

  const filteredStock = useMemo(() => {
    return stockItems.filter(item => {
      const matchesSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) 

      const matchesMeasure =
        measure === "all" ||
        item.measure.toLowerCase().includes(measure.toLowerCase())

      const matchesSupplier =
        supplier === "" ||
        item.supplier.toLowerCase().includes(supplier.toLowerCase())

      return matchesSearch && matchesMeasure && matchesSupplier
    })
  }, [stockItems, search, measure, supplier])

  const sortedStock = useMemo(() => {
    return [...filteredStock].sort((a, b) => {
      const dir = sort.direction === "asc" ? 1 : -1

      switch (sort.key) {
        case "name":
          return a.name.localeCompare(b.name) * dir

        case "supplier":
          return a.supplier.localeCompare(b.supplier) * dir

        case "price":
          return (a.price - b.price) * dir

        case "quantity":
          return (a.quantity - b.quantity) * dir

        case "createdAt":
          return (
            dayjs(a.createdAt).valueOf() -
            dayjs(b.createdAt).valueOf()
          ) * dir

        default:
          return 0
      }
    })
  }, [filteredStock, sort])

  const totalPages = Math.ceil(filteredStock.length / pageSize)

  const paginatedStock = useMemo(() => {
    const start = (page - 1) * pageSize
    return sortedStock.slice(start, start + pageSize)
  }, [sortedStock, page, pageSize])

  return (
<>
  <Card className="md:mx-20 sm:mx-10 border-none py-0 shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)] ">
    <ScrollArea className="grid">  
      <CardContent className="p-5 h-fit">

        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold tracking-tight">
            Inventario
          </h2>
          <p className="text-sm text-muted-foreground">
            Administrá los productos disponibles en el stock del comercio.
          </p>
        </div>

        <div className="flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por nombre de producto..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="pl-8 w-full bg-background"
            />
          </div>

          <div className="flex gap-2 md:flex-row md:items-center w-fit">
          <Select
            value={measure}
            onValueChange={(value) => {
              setMeasure(value)
              setPage(1)
            }}
          >
            <SelectTrigger className="w-[200px] text-xs">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="Medida" />
              </div>
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">Todas las medidas</SelectItem>

              {measures
                .filter(m => typeof m === "string" && m.trim() !== "")
                .map(m => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

            <SelectString 
              items={suppliers}
              type="supplier"
              value={supplier}
              onSelect={(value) => {
                setSupplier(value)
                setPage(1)
              }}
            />
            
            <CreateStockDialog commerceId={commerceId} suppliers={suppliers} />
          </div>
        </div>

        <div className="rounded-md border">
          <ScrollArea>
            <Table className="min-w-[900px]">
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>
                    <SortHeader label="Producto" sortKey="name" sort={sort} onToggleSort={toggleSort} />
                  </TableHead>
                  <TableHead>
                    <SortHeader label="Proveedor" sortKey="supplier" sort={sort} onToggleSort={toggleSort} />
                  </TableHead>
                  <TableHead>
                    <SortHeader label="Precio Unit." sortKey="price" sort={sort} onToggleSort={toggleSort} />
                  </TableHead>
                  <TableHead>
                    <SortHeader label="Unidades" sortKey="quantity" sort={sort} onToggleSort={toggleSort} />
                  </TableHead>
                  <TableHead>Medida</TableHead>
                  <TableHead>
                    <SortHeader label="Creado" sortKey="createdAt" sort={sort} onToggleSort={toggleSort} />
                  </TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {paginatedStock.map(item => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.supplier}</TableCell>
                    <TableCell>${item.price.toFixed(2)}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{item.measure}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {dayjs(item.createdAt).format("DD/MM/YYYY HH:mm:ss")}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-blue-600 focus:text-blue-600"
                              onClick={() => setEditingStock({ ...item })}
                            >
                              <button className="flex items-center text-blue-600 hover:text-blue-700">
                                <Edit className="mr-2 h-4 w-4" />
                                Editar Item
                              </button>
                            </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600 focus:text-red-600" onSelect={(e) => e.preventDefault()}>
                            <RemoveStockDialog commerceId={commerceId} stockId={item.id} stockName={item.name} />
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Bell className="mr-2 h-4 w-4" />
                            Definir Alertas
                            <Wip />
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}

                {paginatedStock.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-6">
                      No se encontraron productos
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>

        <div className="flex items-center justify-between py-4">
          <span className="text-sm text-muted-foreground">
            Página {page} de {totalPages}
          </span>

          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              Siguiente
            </Button>
          </div>
        </div>

      </CardContent>
    <ScrollBar orientation="horizontal" />
    </ScrollArea>
  </Card>
  {editingStock && (
    <EditStockDialog
      stock={editingStock}
      open={true}
      onOpenChange={(open) => {
        if (!open) setEditingStock(null)
      }}
      suppliers={suppliers}
    />
  )}
  </>
)}