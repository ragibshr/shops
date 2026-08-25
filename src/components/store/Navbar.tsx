"use client"

import Link from "next/link"
import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Menu, Phone, ShoppingBag, X } from "lucide-react"
import { useTenant } from "@/components/store/StoreProvider"
import { selectTenantItems, useCartStore } from "@/lib/cart-store"

const LINKS = [
  { href: "/", label: "হোম" },
  { href: "/shop", label: "শপ" },
  { href: "/track", label: "অর্ডার ট্র্যাক" },
]

export default function Navbar({
  onCartOpen,
}: {
  onCartOpen: () => void
}) {
  const tenant = useTenant()
  const [open, setOpen] = useState(false)

  return (
    <>
      {tenant.announcementBn && (
        <div className="bg-primary px-4 py-2 text-center font-display text-xs font-semibold text-on-primary md:text-sm">
          {tenant.announcementBn}
        </div>
      )}

      <header className="sticky top-0 z-40 border-b border-line bg-surface/85 backdrop-blur-md">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 md:px-6">
          <Link href="/" className="group flex min-w-0 flex-col leading-tight">
            <span className="truncate font-display text-xl font-bold text-ink transition-colors group-hover:text-primary">
              {tenant.nameBn}
            </span>
            <span className="hidden truncate text-[11px] text-muted sm:block">
              {tenant.taglineBn}
            </span>
          </Link>

          <div className="hidden items-center gap-7 md:flex">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-muted transition-colors hover:text-primary"
              >
                {l.label}
              </Link>
            ))}
            <a
              href={`tel:${tenant.supportPhone}`}
              className="flex items-center gap-1.5 rounded-full border border-line px-3.5 py-1.5 text-xs font-medium text-muted transition-colors hover:border-primary hover:text-primary"
            >
              <Phone size={13} />
              হেল্পলাইন
            </a>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onCartOpen}
              aria-label="কার্ট খুলুন"
              className="relative flex h-10 w-10 items-center justify-center rounded-full bg-primary text-on-primary shadow-card transition-transform hover:scale-105 active:scale-95"
            >
              <ShoppingBag size={18} />
              <CartBadge />
            </button>
            <button
              onClick={() => setOpen((o) => !o)}
              aria-label="মেনু"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink md:hidden"
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </nav>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="overflow-hidden border-t border-line bg-surface md:hidden"
            >
              <div className="space-y-1 px-4 py-3">
                {LINKS.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-xl px-3 py-2.5 text-sm font-medium text-ink hover:bg-surface-2"
                  >
                    {l.label}
                  </Link>
                ))}
                <a
                  href={`tel:${tenant.supportPhone}`}
                  className="block rounded-xl px-3 py-2.5 text-sm font-medium text-primary"
                >
                  📞 হেল্পলাইন — {tenant.supportPhone}
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  )
}

function CartBadge() {
  const tenant = useTenant()
  const items = useCartStore((s) => s.items)
  const count = selectTenantItems(items, tenant.slug).reduce((sum, i) => sum + i.qty, 0)
  if (count === 0) return null
  return (
    <motion.span
      key={count}
      initial={{ scale: 0.4 }}
      animate={{ scale: 1 }}
      className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white"
    >
      {count.toLocaleString("bn-BD")}
    </motion.span>
  )
}
