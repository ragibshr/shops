"use client"

import { useState, useCallback } from "react"
import { AnimatePresence } from "framer-motion"
import { useTenant } from "@/components/store/StoreProvider"
import ShopExterior from "./ShopExterior"
import ShopDoorTransition from "./ShopDoorTransition"
import ShopInterior from "./ShopInterior"
import RackProductDrawer from "./RackProductDrawer"
import type { TenantMall } from "@/lib/tenants"
import type { Category, Product } from "@/lib/types"

interface Props {
  mall: TenantMall
  categories: Category[]
  products: Product[]
}

export default function MallExperience({ mall, categories, products }: Props) {
  const tenant = useTenant()
  const [scene, setScene] = useState<"exterior" | "door" | "interior">("exterior")
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const handleEnter = useCallback(() => setScene("door"), [])

  const handleTransitionComplete = useCallback(() => setScene("interior"), [])

  const handleRackClick = useCallback((slug: string) => {
    setSelectedCategory(slug)
    setDrawerOpen(true)
  }, [])

  const handleExit = useCallback(() => setScene("exterior"), [])

  return (
    <>
      <AnimatePresence mode="wait">
        {scene === "exterior" && (
          <ShopExterior
            key="exterior"
            mall={mall}
            shopName={tenant.nameBn}
            tagline={tenant.taglineBn}
            onEnter={handleEnter}
          />
        )}

        {scene === "door" && (
          <ShopDoorTransition
            key="door"
            mall={mall}
            onComplete={handleTransitionComplete}
          />
        )}

        {scene === "interior" && (
          <ShopInterior
            key="interior"
            mall={mall}
            categories={categories}
            onRackClick={handleRackClick}
            onExit={handleExit}
          />
        )}
      </AnimatePresence>

      <RackProductDrawer
        open={drawerOpen}
        categorySlug={selectedCategory}
        products={products}
        categories={categories}
        onClose={() => setDrawerOpen(false)}
      />
    </>
  )
}
