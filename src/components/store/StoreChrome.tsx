"use client"

import { useState, type ReactNode } from "react"
import Navbar from "@/components/store/Navbar"
import Footer from "@/components/store/Footer"
import CartDrawer from "@/components/store/CartDrawer"
import { useTenant } from "@/components/store/StoreProvider"

export default function StoreChrome({ children }: { children: ReactNode }) {
  const tenant = useTenant()
  const [cartOpen, setCartOpen] = useState(false)

  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar onCartOpen={() => setCartOpen(true)} />
      <main className="flex-1">{children}</main>
      <Footer tenant={tenant} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  )
}
