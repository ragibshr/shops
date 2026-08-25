import type { ReactNode } from "react"
import { getTenant } from "@/lib/tenant-server"
import { StoreProvider } from "@/components/store/StoreProvider"
import StoreChrome from "@/components/store/StoreChrome"

export default async function StoreLayout({
  children,
}: {
  children: ReactNode
}) {
  const tenant = await getTenant()
  return (
    <StoreProvider tenant={tenant}>
      <StoreChrome>{children}</StoreChrome>
    </StoreProvider>
  )
}
