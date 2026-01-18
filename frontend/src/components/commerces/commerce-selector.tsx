"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useCommerces } from "@/contexts/commerce-context"
import { CommerceSelect } from "@/components/ui/commerce-select"

export default function CommerceSelector() {
  const router = useRouter()
  const pathname = usePathname()
  const { commerces } = useCommerces()

  const segments = pathname.split("/").filter(Boolean)

  const currentCommerce = commerces.find(c =>
    segments.includes(c.id)
  )

  const selectedCommerce = currentCommerce?.id ?? ""

  useEffect(() => {
    const storedCommerce = localStorage.getItem("selectedCommerce")
  
    if (!storedCommerce && commerces.length === 1) {
      localStorage.setItem("selectedCommerce", commerces[0].id)
    }

    const storedExists = storedCommerce
      ? commerces.some(c => c.id === storedCommerce)
      : false

    if (segments.length && !currentCommerce) {
      localStorage.removeItem("selectedCommerce")

      if (commerces.length > 0) {
        router.replace(`/${commerces[0].id}`)
      } 
      
      return
    }

    if (!currentCommerce && storedCommerce && storedExists) {
      const prefix = pathname === "/" ? "" : pathname
      router.replace(`${prefix}/${storedCommerce}`)
    }

    if (storedCommerce && !storedExists) {
      localStorage.removeItem("selectedCommerce")
    }
  }, [currentCommerce, pathname, router, segments, commerces])

  const handleChange = (commerceId: string) => {
    localStorage.setItem("selectedCommerce", commerceId)

    if (currentCommerce) {
      router.push(pathname.replace(currentCommerce.id, commerceId))
    } else {
      const prefix = pathname === "/" ? "" : pathname
      router.push(`${prefix}/${commerceId}`)
    }
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-sidebar-border">
      <CommerceSelect
        value={selectedCommerce}
        onChange={handleChange}
      />
    </div>
  )
}
