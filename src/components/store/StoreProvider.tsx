"use client"

import { createContext, useContext, type ReactNode } from "react"
import type { Tenant } from "@/lib/tenants"

const TenantContext = createContext<Tenant | null>(null)

export function StoreProvider({
  tenant,
  children,
}: {
  tenant: Tenant
  children: ReactNode
}) {
  return <TenantContext.Provider value={tenant}>{children}</TenantContext.Provider>
}

export function useTenant(): Tenant {
  const t = useContext(TenantContext)
  if (!t) throw new Error("useTenant must be used inside StoreProvider")
  return t
}
