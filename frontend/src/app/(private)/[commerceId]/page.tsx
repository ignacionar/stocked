import CommerceDashboard from "@/components/commerces/commerce-dashboard"
import { Suspense } from 'react';
import { Commerce, Role } from '@shared/types/entities';
import { getCommerce } from "../actions";
import { getSession } from "@/lib/auth-client";

export default async function CommercePage({ params }: { params: Promise<{ commerceId: string }> }) {
  const { commerceId } = await params
  const { data: session } = await getSession()

  const commerce: Commerce = await getCommerce(commerceId)

  return <>
    <Suspense fallback={<div className="mx-auto mt-5"></div>}>
      {commerce && <CommerceDashboard commerce={commerce} userName={session?.user.name ?? ""} role={(session?.user.role as Role) ?? Role.USER}  />}
    </Suspense>
  </>
}