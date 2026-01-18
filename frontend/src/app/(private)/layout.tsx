import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import React from 'react';
import { CommerceProvider } from "@/contexts/commerce-context";
import { CreateCommerceDialog } from '@/components/forms/commerces/create-commerce-dialog';
import { getAllUserCommerces } from './actions';
import { getSession } from '@/lib/auth-client';

export default async function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const { data: session } = await getSession();
  const commerces = await getAllUserCommerces()

  if (commerces.length === 0) {
    return (
      <div className='mx-auto w-fit absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>
        <h1 className="text-3xl font-bold tracking-tight mb-8">
          Hola, {session?.user.name} 👋. Empecemos creando una sucursal. 
        </h1>
        <div className='w-64 mx-auto'>
          <CreateCommerceDialog />
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <CommerceProvider commerces={commerces}>
        <div className="flex min-h-screen w-full">
          <AppSidebar image={session?.user.image ?? ""} name={session?.user.name ?? ""} email={session?.user.email ?? ""} role={session?.user.role ?? "USER"} />

          <main className="flex-1">
            <SidebarTrigger
              className="
              cursor-pointer
              p-6 h-14 w-14
              [&_svg]:h-8 [&_svg]:w-8
            "
            />
            {children}
          </main>
        </div>
      </CommerceProvider>
    </SidebarProvider>
  );

  
}