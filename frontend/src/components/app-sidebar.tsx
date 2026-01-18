"use client"

import { Home, Search, Plus, Brain, User } from "lucide-react"
import { Separator } from "@/components/ui/separator"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter
} from "@/components/ui/sidebar"
import { NavUser } from "./users/nav-user"
import CommerceSelector from "./commerces/commerce-selector"
import { Role } from "@shared/types/entities"
import { usePathname } from "next/navigation"
import { useSyncExternalStore } from "react"

export function AppSidebar({ image, name, email, role } : { image: string; name: string; email: string; role: string; }) {
  
  const pathname = usePathname()

  function subscribe(callback: () => void) {
    window.addEventListener("storage", callback)
    return () => window.removeEventListener("storage", callback)
  }

  function getSnapshot() {
    return localStorage.getItem("selectedCommerce")
  }

  function getServerSnapshot() {
    return null
  }

  const commerceId = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  )
  
  // Menu items.
  const items = [
    {
      title: "Inicio",
      url: `/${commerceId}`,
      icon: Home,
    },
    {
      title: "Añadir Producto",
      url: "",
      icon: Plus,
    },
    {
      title: "Inventario",
      url: `/${commerceId}/stock`,
      icon: Search,
    },
    {
      title: "Procesar Factura con IA",
      url: `/${commerceId}/invoices`,
      icon: Brain,
    },
    {
      title: "Gestionar Usuarios",
      url: `/users`,
      icon: User,
    }
  ]
  
  return (
    <Sidebar className="shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)]">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            <h1 className="text-3xl font-extrabold text-sidebar-foreground tracking-tight">Stocked</h1>
          </SidebarGroupLabel>
          <Separator className="my-2" />
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                // Disable user management for non-admins
                if (item.url.includes("/users") && role === Role.USER) return;

                return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        { pathname !== "/users" &&
          <>
          <SidebarGroupLabel>
            <span className="text-sm font-medium text-sidebar-foreground/70">Sucursal actual</span>
          </SidebarGroupLabel>
          <CommerceSelector />
          </>
        }
        <Separator className="my-2" />
        <NavUser image={image} name={name} email={email} />
      </SidebarFooter>
    </Sidebar>
  )
}