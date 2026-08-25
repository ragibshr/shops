"use client"

import Link from "next/link"
import { useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Minus, Plus, Trash2, X } from "lucide-react"
import {
  cartSubtotal,
  selectTenantItems,
  useCartStore,
} from "@/lib/cart-store"
import { useTenant } from "@/components/store/StoreProvider"
import { bdt } from "@/lib/utils"

const FREE_DELIVERY_OVER = 1500

export default function CartDrawer({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const tenant = useTenant()
  const rawItems = useCartStore((s) => s.items)
  const setQty = useCartStore((s) => s.setQty)
  const removeItem = useCartStore((s) => s.removeItem)
  const items = selectTenantItems(rawItems, tenant.slug)
  const subtotal = cartSubtotal(items)

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", onKey)
    }
  }, [open, onClose])

  const progress = Math.min(100, Math.round((subtotal / FREE_DELIVERY_OVER) * 100))
  const remaining = FREE_DELIVERY_OVER - subtotal

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[2px]"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className="fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-md flex-col bg-bg shadow-pop"
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="font-display text-lg font-bold">🛒 আপনার কার্ট</h2>
              <button
                onClick={onClose}
                aria-label="বন্ধ করুন"
                className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-surface-2"
              >
                <X size={18} />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
                <span className="text-5xl">🫙</span>
                <p className="font-display text-lg font-bold">কার্ট এখন খালি!</p>
                <p className="text-sm text-muted">
                  শপ থেকে পছন্দের জিনিস যোগ করুন, তারপর এখানে ফিরে এলেই অর্ডার সেরে ফেলবেন।
                </p>
                <Link
                  href="/shop"
                  onClick={onClose}
                  className="mt-3 rounded-full bg-primary px-6 py-2.5 font-display text-sm font-bold text-on-primary shadow-card transition-transform hover:scale-105"
                >
                  শপে যান →
                </Link>
              </div>
            ) : (
              <>
                <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
                  {items.map((item) => (
                    <motion.div
                      key={item.key}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 60 }}
                      className="flex gap-3 rounded-2xl border border-line bg-surface p-3 shadow-card"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image ?? "/products/placeholder.svg"}
                        alt=""
                        className="h-20 w-20 shrink-0 rounded-xl object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{item.title}</p>
                        {item.variantLabel && (
                          <p className="mt-0.5 text-xs text-muted">{item.variantLabel}</p>
                        )}
                        <p className="mt-1 font-display text-sm font-bold text-primary">
                          {bdt(item.price * item.qty)}
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center gap-2 rounded-full border border-line px-1 py-0.5">
                            <button
                              onClick={() => setQty(item.key, item.qty - 1)}
                              aria-label="কমান"
                              className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-surface-2"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="min-w-5 text-center text-sm font-bold tabular-nums">
                              {item.qty.toLocaleString("bn-BD")}
                            </span>
                            <button
                              onClick={() => setQty(item.key, item.qty + 1)}
                              aria-label="বাড়ান"
                              className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-surface-2"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(item.key)}
                            aria-label="সরান"
                            className="flex h-7 w-7 items-center justify-center rounded-full text-muted hover:bg-red-50 hover:text-red-500"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="border-t border-line bg-surface px-5 py-4">
                  {subtotal < FREE_DELIVERY_OVER ? (
                    <div className="mb-3">
                      <p className="mb-1.5 text-xs text-muted">
                        আর <b className="text-primary">{bdt(remaining)}</b> যোগ করলেই ডেলিভারি ফ্রি! 🎉
                      </p>
                      <div className="h-2 overflow-hidden rounded-full bg-surface-2">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                          initial={false}
                          animate={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="mb-3 rounded-xl bg-accent-soft px-3 py-2 text-center text-xs font-semibold text-accent">
                      🎉 অভিনন্দন! ডেলিভারি চার্জ ফ্রি হয়ে গেছে
                    </p>
                  )}
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm text-muted">সাবটোটাল</span>
                    <span className="font-display text-lg font-bold">{bdt(subtotal)}</span>
                  </div>
                  <Link
                    href="/checkout"
                    onClick={onClose}
                    className="block rounded-full bg-primary py-3.5 text-center font-display text-base font-bold text-on-primary shadow-card transition-transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    অর্ডার করুন → {bdt(subtotal)}
                  </Link>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
