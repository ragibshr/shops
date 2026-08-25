"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { CartItem } from "@/lib/types"

interface CartState {
  items: CartItem[]
  addItem: (item: Omit<CartItem, "key">) => void
  removeItem: (key: string) => void
  setQty: (key: string, qty: number) => void
  clearTenant: (tenant: string) => void
}

function itemKey(productId: string, variantLabel: string | null) {
  return variantLabel ? `${productId}::${variantLabel}` : productId
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const key = itemKey(item.productId, item.variantLabel)
          const existing = state.items.find((i) => i.key === key)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.key === key ? { ...i, qty: Math.min(i.qty + item.qty, 20) } : i,
              ),
            }
          }
          return { items: [...state.items, { ...item, key }] }
        }),
      removeItem: (key) =>
        set((state) => ({ items: state.items.filter((i) => i.key !== key) })),
      setQty: (key, qty) =>
        set((state) => ({
          items:
            qty <= 0
              ? state.items.filter((i) => i.key !== key)
              : state.items.map((i) =>
                  i.key === key ? { ...i, qty: Math.min(qty, 20) } : i,
                ),
        })),
      clearTenant: (tenant) =>
        set((state) => ({ items: state.items.filter((i) => i.tenant !== tenant) })),
    }),
    { name: "shop-cart-v1" },
  ),
)

export function selectTenantItems(items: CartItem[], tenant: string) {
  return items.filter((i) => i.tenant === tenant)
}

export function cartSubtotal(items: CartItem[]) {
  return items.reduce((sum, i) => sum + i.price * i.qty, 0)
}

export function cartCount(items: CartItem[]) {
  return items.reduce((sum, i) => sum + i.qty, 0)
}
