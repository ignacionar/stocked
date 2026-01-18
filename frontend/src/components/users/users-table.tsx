"use client"

import {
  MoreHorizontal,
  Search,
  Filter,
  Edit
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import dayjs from "dayjs"
import { Role, User } from "@shared/types/entities"
import RemoveUserDialog from "../forms/users/remove-user-dialog"
import { useSession } from "@/lib/auth-client"
import { useMemo, useState } from "react"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import EditUserDialog from "../forms/users/edit-user-dialog"
import CreateUserDialog from "../forms/users/create-user-dialog"

type SortKey = "name" | "role" | "occupation" | "createdAt"

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

export default function UserManagementTable({ users, pageSize, occupations }:
  {
    users: (User & { commerces: { id: string; name: string }[] })[],
    occupations: string[],
    pageSize: number
  }) {

  const { data: session } = useSession()
  const [editingUser, setEditingUser] = useState<User & { commerceIds: string[] } | null>(null)

  const [search, setSearch] = useState("")
  const [occupation, setOccupation] = useState("all")
  const [page, setPage] = useState(1)

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

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch =
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())

      const matchesOccupation =
        occupation === "all" || user.occupation === occupation

      return matchesSearch && matchesOccupation
    })
  }, [users, search, occupation])

  const sortedUsers = useMemo(() => {
    return [...filteredUsers].sort((a, b) => {
      const dir = sort.direction === "asc" ? 1 : -1

      switch (sort.key) {
        case "name":
          return a.name.localeCompare(b.name) * dir

        case "role":
          return a.role.localeCompare(b.role) * dir

        case "occupation":
          return (a.occupation ?? "")
            .localeCompare(b.occupation ?? "") * dir

        case "createdAt":
          return (
            dayjs(a.createdAt).valueOf() -
            dayjs(b.createdAt).valueOf()
          ) * dir

        default:
          return 0
      }
    })
  }, [filteredUsers, sort])

  const totalPages = Math.ceil(filteredUsers.length / pageSize)

  const paginatedUsers = useMemo(() => {
    const start = (page - 1) * pageSize
    return sortedUsers.slice(start, start + pageSize)
  }, [sortedUsers, page, pageSize])

  return (
  <>
    <Card className="md:mx-20 sm:mx-10 border-none shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)] py-0">
      <ScrollArea className="grid">
        <CardContent className="p-5 h-fit">

          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold tracking-tight">
              Gestión de Usuarios
            </h2>
            <p className="text-sm text-muted-foreground">
              Administrá los usuarios con acceso al sistema de los comercios vinculados.
            </p>
          </div>

          <div className="flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar usuarios por nombre o email..."
                value={search}
                onChange={(e) => {
                  const value = e.target.value
                  setSearch(value)
                  setPage(1)
                }}
                className="pl-8 w-full bg-background"
              />
            </div>

            <div className="flex items-center gap-2">
              <Select
                value={occupation}
                onValueChange={(value) => {
                  setOccupation(value)
                  setPage(1)
                }}
              >
                <SelectTrigger className="w-[200px] text-xs">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Filter className="h-4 w-4" />
                    <SelectValue placeholder="Ocupación" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las ocupaciones</SelectItem>
                  {occupations.map((occ: string) => (
                    <SelectItem key={occ} value={occ}>
                      {occ}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <CreateUserDialog />
            </div>
          </div>

          <div className="rounded-md border">
              <Table className="min-w-[900px]">
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="w-[250px]">
                      <SortHeader label="Usuario" sortKey="name" sort={sort} onToggleSort={toggleSort} />
                    </TableHead>
                    <TableHead>
                      <SortHeader label="Rol" sortKey="role" sort={sort} onToggleSort={toggleSort} />
                    </TableHead>
                    <TableHead>
                      <SortHeader label="Fecha de creación" sortKey="createdAt" sort={sort} onToggleSort={toggleSort} />
                    </TableHead>
                    <TableHead>
                      <SortHeader label="Ocupación" sortKey="occupation" sort={sort} onToggleSort={toggleSort} />
                    </TableHead>
                    <TableHead>Sucursales asociadas</TableHead>
                    <TableHead className="flex justify-end items-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedUsers && paginatedUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-muted/5">
                      <TableCell>
                        <div className="flex gap-2">
                          <Avatar className="h-9 w-9 rounded-lg">
                            <AvatarImage src={user.image ?? undefined} alt={user.name} />
                            <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>

                          <div className="flex flex-col">
                            <span className="font-medium text-sm text-foreground max-w-[250px] break-words whitespace-normal">
                              {user.name}
                            </span>
                            <span className="text-xs text-muted-foreground max-w-[250px] break-words whitespace-normal">
                              {user.email}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant="secondary"
                          id={`role-badge-${user.id}`}
                          className={`rounded-full px-2.5 font-normal capitalize 
                          ${user.role === Role.OWNER
                                ? "bg-yellow-500 text-white hover:bg-yellow-600"
                                : (user.role === Role.ADMIN ? "bg-black text-white hover:bg-black-900" : "bg-slate-100 text-slate-700 hover:bg-slate-100/80")
                              }`}
                          >
                          {
                            user.role === Role.OWNER ? "Owner" : (user.role === Role.ADMIN ? "Admin" : "Usuario")
                          }
                        </Badge>
                      </TableCell>

                      <TableCell className="text-muted-foreground">
                        {dayjs(user.createdAt).format("DD/MM/YYYY HH:mm:ss")}
                      </TableCell>

                      <TableCell className="text-muted-foreground max-w-[250px] break-words whitespace-normal">
                        {user.occupation}
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-[220px]">
                          {user.commerces.map((commerce) => {
                          return (
                            <Badge
                              key={`${commerce.id}-${user.id}`}
                              variant="secondary"
                              className="text-xs"
                            >
                              {commerce.name}
                            </Badge>
                          )
                          })}
                        </div>
                      </TableCell>

                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer">
                              <span className="sr-only">Abrir menú</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-[160px] ">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {/* <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4 text-muted-foreground" />
                            Ver Detalles
                        </DropdownMenuItem> */}
                            {/* <DropdownMenuItem>
                            <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                            Enviar Email
                        </DropdownMenuItem> */}
                            <DropdownMenuItem
                              className="text-blue-600 focus:text-blue-600"
                              onClick={() => setEditingUser({ ...user, commerceIds: user.commerces.map(c => c.id) })}
                            >
                              <button className="flex items-center text-blue-600 hover:text-blue-700">
                                <Edit className="mr-2 h-4 w-4" />
                                Editar Usuario
                              </button>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {user.id !== session?.user.id &&
                              <DropdownMenuItem className="text-red-600 focus:text-red-600" onSelect={(e) => e.preventDefault()}>
                                <RemoveUserDialog userId={user.id} userName={user.name} userCommerces={user.commerces.map(c => c.id)} />
                              </DropdownMenuItem>}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {paginatedUsers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                        No se encontraron usuarios
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
 

          </div>

          <div className="flex items-center justify-between py-4">
            <div className="text-sm text-muted-foreground">
              Página {page} de {totalPages}
            </div>

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
      {editingUser && (
        <EditUserDialog
          user={editingUser}
          open={true}
          onOpenChange={(open) => {
            if (!open) setEditingUser(null)
          }}
        />
      )}
    </>
  )
}