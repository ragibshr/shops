"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { type ReactNode } from "react"
import {
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  Users,
} from "lucide-react"
import { logoutAction } from "@/app/admin/actions"

const LINKS = [
  { href: "/admin", label: "ড্যাশবোর্ড", icon: LayoutDashboard },
  { href: "/admin/orders", label: "অর্ডারসমূহ", icon: ClipboardList },
  { href: "/admin/products", label: "পণ্য ব্যবস্থাপনা", icon: Package },
  { href: "/admin/team", label: "টিম (মালিক)", icon: Users, ownerOnly: true },
  { href: "/admin/settings", label: "সেটিংস (মালিক)", icon: Settings, ownerOnly: true },
]

export default function Sidebar({
  children,
  fullName,
  role,
  email,
}: {
  children: ReactNode
  fullName: string
  role: string
  email: string
}) {
  const pathname = usePathname()
  const isOwner = role === "owner"

  return (
    <div className="flex min-h-dvh bg-bg">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-line bg-surface lg:flex">
        <div className="border-b border-line px-5 py-5">
          <p className="font-display text-lg font-extrabold">⚙️ কন্ট্রোল প্যানেল</p>
          <p className="mt-0.5 truncate text-[11px] text-muted">{email}</p>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {LINKS.filter((l) => !l.ownerOnly || isOwner).map((link) => {
            const active =
              link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary text-on-primary shadow-card"
                    : "text-muted hover:bg-surface-2 hover:text-ink"
                }`}
              >
                <link.icon size={17} />
                {link.label}
              </Link>
            )
          })}
        </nav>
        <div className="border-t border-line p-4">
          <p className="truncate text-sm font-semibold">{fullName}</p>
          <span
            className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
              isOwner ? "bg-accent-soft text-accent" : "bg-surface-2 text-muted"
            }`}
          >
            {isOwner ? "👑 মালিক" : "🛡️ মডারেটর"}
          </span>
          <form action={logoutAction} className="mt-3">
            <button className="flex w-full items-center justify-center gap-2 rounded-full border border-line py-2 text-xs font-semibold text-muted hover:border-red-300 hover:text-red-500">
              <LogOut size={13} />
              লগআউট
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile topbar */}
      <div className="sticky top-0 z-40 flex w-full items-center justify-between border-b border-line bg-surface px-4 py-3 lg:hidden">
        <p className="font-display font-extrabold">⚙️ অ্যাডমিন</p>
        <div className="flex gap-2 overflow-x-auto">
          {LINKS.filter((l) => !l.ownerOnly || isOwner).map((link) => {
            const Icon = link.icon
            const active =
              link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-label={link.label}
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                  active ? "bg-primary text-on-primary" : "bg-surface-2 text-muted"
                }`}
              >
                <Icon size={16} />
              </Link>
            )
          })}
          <form action={logoutAction}>
            <button
              aria-label="লগআউট"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-2 text-muted"
            >
              <LogOut size={15} />
            </button>
          </form>
        </div>
      </div>

      <main className="min-w-0 flex-1 p-4 pb-16 pt-6 md:p-8 lg:ml-60">{children}</main>
    </div>
  )
}
