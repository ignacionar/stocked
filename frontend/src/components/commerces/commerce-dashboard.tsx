"use client"

import { Commerce, Role } from "@shared/types/entities";
import { DashboardCard } from './dashboard-card';
import { Button } from '../ui/button';
import { Plus, TrendingUp, AlertCircle, Package, FileText } from 'lucide-react';
import { EditCommerceDialog } from '../forms/commerces/edit-commerce-dialog';
import { Separator } from '../ui/separator';
import { CreateCommerceDialog } from '../forms/commerces/create-commerce-dialog';
import RemoveCommerceDialog from '../forms/commerces/remove-commerce-dialog';
import Wip from '../wip';

export default function CommerceDashboard({ commerce, userName, role }: { commerce: Commerce, userName: string, role: Role }) {

  const showAdminPanel = role !== Role.USER;

  return (
    <div className="max-w-7xl mx-auto p-8"> 
      
      <h1 className="text-3xl font-bold tracking-tight mb-8">
        Hola de nuevo, {userName} 👋
      </h1>

      <div className={`grid gap-6 ${showAdminPanel ? "md:grid-cols-3" : "md:grid-cols-2"}`} >
        
      {showAdminPanel && 
       <DashboardCard title="Administración">
        <div className="space-y-4">

          <div className="rounded-md border p-3 space-y-1">
            <p className="text-xs text-muted-foreground">Sucursal seleccionada</p>
            <p className="font-medium">{commerce.name}</p>
            <p className="text-sm text-muted-foreground">
              📍 Ubicación: {commerce.location}
            </p>

            <div className="pt-2">
              <EditCommerceDialog commerce={commerce} />
            </div>
          </div>

            <Separator className='my-3'/>

              <p className="text-xs text-muted-foreground">Acciones rápidas</p>

              <Button className="w-full justify-start cursor-pointer" variant="outline">
                <Plus className="mr-2 h-4 w-4" /> Nuevo producto
              </Button>

              <Button className="w-full justify-start cursor-pointer" variant="outline">
                <TrendingUp className="mr-2 h-4 w-4" /> Ver reportes
              </Button>

              <Button className="w-full justify-start bg-green-600 hover:bg-green-700 cursor-pointer text-white" >
                <FileText className="mr-2 h-4 w-4" /> Generar .csv
              </Button>

              <Wip />

              <Separator className='my-3'/>
              <p className="text-xs text-muted-foreground">Otras operaciones</p>

              <CreateCommerceDialog />

              <RemoveCommerceDialog id={commerce.id} name={commerce.name} />
          </div>
        </DashboardCard>
        }


        <div className="md:col-span-2 flex flex-col gap-6">
            
            <DashboardCard title="Alertas de Stock">
                <div className="border rounded-md">
                    <div className="grid grid-cols-3 p-3 bg-muted/50 text-xs font-medium">
                        <span>Producto</span>
                        <span>Stock Actual</span>
                        <span>Estado</span>
                    </div>
                    <div className="grid grid-cols-3 p-3 border-t text-sm items-center">
                        <span className="font-medium">Coca Cola 1.5L</span>
                        <span className="text-red-600 font-bold">2 u.</span>
                        <span className="flex items-center text-red-600 text-xs bg-red-100 w-fit px-2 py-1 rounded-full">
                            <AlertCircle className="w-3 h-3 mr-1"/> Crítico
                        </span>
                    </div>
                    <div className="grid grid-cols-3 p-3 border-t text-sm items-center">
                        <span className="font-medium">Harina 000</span>
                        <span className="text-orange-600 font-bold">5 u.</span>
                        <span className="flex items-center text-orange-600 text-xs bg-orange-100 w-fit px-2 py-1 rounded-full">
                            <Package className="w-3 h-3 mr-1"/> Bajo
                        </span>
                    </div>
                </div>
                <Button variant="link" className="px-0 mt-2 text-muted-foreground cursor-pointer w-fit mx-auto">Gestionar todo el inventario &rarr;</Button>
                <Wip />
            </DashboardCard>

            <DashboardCard title="Últimas ventas">
                 <div className="space-y-4">
                    <div className="flex justify-between items-center border-b pb-2">
                        <div>
                            <p className="font-medium">Venta #1024</p>
                            <p className="text-xs text-muted-foreground">Hace 10 min • Cliente Final</p>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-green-600">+$12.500</p>
                            <p className="text-xs text-muted-foreground">Efectivo</p>
                        </div>
                    </div>
                    <div className="flex justify-between items-center border-b pb-2">
                        <div>
                            <p className="font-medium">Venta #1023</p>
                            <p className="text-xs text-muted-foreground">Hace 45 min • Juan Pérez</p>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-green-600">+$4.200</p>
                            <p className="text-xs text-muted-foreground">Transferencia</p>
                        </div>
                    </div>
                 </div>
                 <Wip />
            </DashboardCard>

        </div>
      </div>
    </div>
  )
}