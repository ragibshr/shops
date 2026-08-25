"use client"

import Link from "next/link"
import { useState } from "react"
import { motion } from "framer-motion"
import { Check, Plus } from "lucide-react"
import { useCartStore } from "@/lib/cart-store"
import { bdt } from "@/lib/utils"
import type { Product } from "@/lib/types"

export default function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem)
  const [added, setAdded] = useState(false)

  const outOfStock = product.stock !== null && product.stock <= 0

  const quickAdd = () => {
    if (outOfStock) return
    addItem({
      productId: product.id,
      tenant: product.tenant,
      slug: product.slug,
      title: product.title_bn,
      price: product.price_bdt,
      image: product.images[0] ?? null,
      variantLabel: product.variants?.[0]?.label ?? null,
      qty: 1,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 1300)
  }

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-card"
    >
      <Link href={`/product/${product.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-surface-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.images[0]}
          alt={product.title_bn}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {product.badge_bn && (
          <span className="absolute left-3 top-3 rounded-full bg-accent px-2.5 py-1 text-[11px] font-bold text-white shadow-card">
            {product.badge_bn}
          </span>
        )}
        {product.stock !== null && product.stock > 0 && product.stock <= 10 && (
          <span className="absolute right-3 top-3 rounded-full bg-amber-400 px-2.5 py-1 text-[11px] font-bold text-amber-950">
            মাত্র {product.stock.toLocaleString("bn-BD")}টি!
          </span>
        )}
        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/45">
            <span className="rounded-full bg-white px-4 py-1.5 font-display text-sm font-bold text-gray-800">
              স্টক শেষ
            </span>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <Link href={`/product/${product.slug}`} className="flex-1">
          <h3 className="font-display text-base font-bold leading-snug hover:text-primary">
            {product.title_bn}
          </h3>
          {product.tagline_bn && (
            <p className="mt-1 line-clamp-2 text-xs text-muted">{product.tagline_bn}</p>
          )}
        </Link>
        <div className="mt-3 flex items-end justify-between gap-2">
          <div>
            <span className="font-display text-lg font-extrabold text-primary">
              {bdt(product.price_bdt)}
            </span>
            {product.compare_price_bdt && (
              <span className="ml-1.5 text-xs text-muted line-through">
                {bdt(product.compare_price_bdt)}
              </span>
            )}
          </div>
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={quickAdd}
            disabled={outOfStock}
            aria-label="কার্টে যোগ করুন"
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white shadow-card transition-colors ${
              added
                ? "bg-emerald-500"
                : "bg-primary hover:bg-primary-strong disabled:cursor-not-allowed disabled:bg-gray-300"
            }`}
          >
            {added ? <Check size={17} /> : <Plus size={17} />}
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
