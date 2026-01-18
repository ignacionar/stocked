"use client"

import { Commerce } from "@shared/types/entities"
import { createContext, useContext } from "react"

type CommerceContextType = {
  commerces: Commerce[]
}

const CommerceContext = createContext<CommerceContextType | null>(null)

export function CommerceProvider({
  commerces,
  children,
}: {
  commerces: Commerce[]
  children: React.ReactNode
}) {
  return (
    <CommerceContext.Provider value={{ commerces }}>
      {children}
    </CommerceContext.Provider>
  )
}

export function useCommerces() {
  const ctx = useContext(CommerceContext)
  if (!ctx) {
    throw new Error("useCommerces must be used within CommerceProvider")
  }
  return ctx
}