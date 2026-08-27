"use client"

import { useMemo } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { X } from "lucide-react"
import ProductCard from "@/components/store/ProductCard"
import type { Product, Category } from "@/lib/types"

interface Props {
  open: boolean
  categorySlug: string | null
  products: Product[]
  categories: Category[]
  onClose: () => void
}

export default function RackProductDrawer({ open, categorySlug, products, categories, onClose }: Props) {
  const cat = useMemo(
    () => categories.find((c) => c.slug === categorySlug),
    [categories, categorySlug],
  )

  const filtered = useMemo(
    () => products.filter((p) => p.category_id === cat?.id),
    [products, cat],
  )

  const categoryName = cat?.name_bn ?? categorySlug ?? ""

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px]"
          />
          <motion.aside
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 280 }}
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-[2rem] bg-bg shadow-pop"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-bg/95 px-5 py-4 backdrop-blur-md">
              <h2 className="font-display text-lg font-bold">
                {categoryName} {filtered.length > 0 && <span className="text-muted">({filtered.length})</span>}
              </h2>
              <button
                onClick={onClose}
                aria-label="বন্ধ করুন"
                className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-surface-2"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-4 py-5">
              {filtered.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
                  {filtered.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center">
                  <span className="text-4xl">🫥</span>
                  <p className="mt-3 font-display text-base font-bold">এই ক্যাটাগরিতে এখন কিছু নেই</p>
                  <p className="mt-1 text-sm text-muted">শীঘ্রই যোগ করা হবে!</p>
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
