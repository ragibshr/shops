"use client"

import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import { Check, Minus, Plus, Zap } from "lucide-react"
import { useCartStore } from "@/lib/cart-store"
import { useTenant } from "@/components/store/StoreProvider"
import { bdt } from "@/lib/utils"
import type { Product } from "@/lib/types"

export default function AddToCartPanel({ product }: { product: Product }) {
  const tenant = useTenant()
  const router = useRouter()
  const addItem = useCartStore((s) => s.addItem)

  const variants = product.variants ?? []
  const [variantIdx, setVariantIdx] = useState(0)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  const variant = variants[variantIdx]
  const unitPrice = useMemo(
    () => product.price_bdt + (variant?.priceDelta ?? 0),
    [product.price_bdt, variant],
  )
  const outOfStock = product.stock !== null && product.stock <= 0

  const buildItem = () => ({
    productId: product.id,
    tenant: tenant.slug,
    slug: product.slug,
    title: product.title_bn,
    price: unitPrice,
    image: product.images[0] ?? null,
    variantLabel: variant?.label ?? null,
    qty,
  })

  const handleAdd = () => {
    addItem(buildItem())
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  const handleBuyNow = () => {
    addItem(buildItem())
    router.push("/checkout")
  }

  return (
    <div className="rounded-3xl border border-line bg-surface p-5 shadow-card">
      {variants.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
            সাইজ / অপশন বাছুন
          </p>
          <div className="flex flex-wrap gap-2">
            {variants.map((v, i) => (
              <button
                key={v.label}
                onClick={() => setVariantIdx(i)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                  i === variantIdx
                    ? "border-primary bg-primary text-on-primary shadow-card"
                    : "border-line text-muted hover:border-primary hover:text-primary"
                }`}
              >
                {v.label}
                {v.priceDelta !== 0 && (
                  <span className="ml-1 opacity-80">
                    (+৳{v.priceDelta.toLocaleString("bn-BD")})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted">পরিমাণ</span>
        <div className="flex items-center gap-3 rounded-full border border-line px-2 py-1">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            aria-label="কমান"
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-surface-2"
          >
            <Minus size={14} />
          </button>
          <span className="min-w-6 text-center font-display text-lg font-bold tabular-nums">
            {qty.toLocaleString("bn-BD")}
          </span>
          <button
            onClick={() => setQty((q) => Math.min(20, q + 1))}
            aria-label="বাড়ান"
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-surface-2"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between border-t border-dashed border-line pt-4">
        <span className="text-sm text-muted">মোট</span>
        <motion.span
          key={unitPrice * qty}
          initial={{ scale: 1.15 }}
          animate={{ scale: 1 }}
          className="font-display text-2xl font-black text-primary"
        >
          {bdt(unitPrice * qty)}
        </motion.span>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={handleAdd}
          disabled={outOfStock}
          className={`flex items-center justify-center gap-2 rounded-full border-2 py-3 font-display text-sm font-bold transition-colors ${
            added
              ? "border-emerald-500 bg-emerald-50 text-emerald-600"
              : "border-primary text-primary hover:bg-accent-soft disabled:border-gray-200 disabled:text-gray-300"
          }`}
        >
          {added ? <Check size={16} /> : <Plus size={16} />}
          {added ? "যোগ হয়েছে!" : "কার্টে দিন"}
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={handleBuyNow}
          disabled={outOfStock}
          className="flex items-center justify-center gap-1.5 rounded-full bg-primary py-3 font-display text-sm font-bold text-on-primary shadow-card transition-colors hover:bg-primary-strong disabled:bg-gray-300"
        >
          <Zap size={15} />
          এখনই অর্ডার
        </motion.button>
      </div>
      {outOfStock && (
        <p className="mt-3 text-center text-xs font-semibold text-red-500">
          😢 দুঃখিত, স্টক শেষ! শীঘ্রই আবার আসছে।
        </p>
      )}
    </div>
  )
}
