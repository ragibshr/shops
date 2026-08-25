import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { getSession, STATUS_LABELS, STATUS_COLORS } from "@/lib/auth"
import { bdt, bnDate } from "@/lib/utils"

export default async function AdminDashboard() {
  const session = await getSession()
  const sb = await createClient()

  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)

  const [todayRes, pendingRes, recentRes, lowStockRes] = await Promise.all([
    sb.from("orders").select("total_bdt,status", { count: "exact" }).gte("created_at", startOfDay.toISOString()),
    sb.from("orders").select("*", { count: "exact", head: true }).eq("status", "pending"),
    sb.from("orders").select("*").order("created_at", { ascending: false }).limit(6),
    sb.from("products").select("id,title_bn,tenant,stock,slug").not("stock", "is", null).lte("stock", 10).order("stock").limit(6),
  ])

  const todaysOrders = todayRes.data ?? []
  const todayRevenue = todaysOrders
    .filter((o: { status: string }) => o.status !== "cancelled")
    .reduce((sum: number, o: { total_bdt: number }) => sum + o.total_bdt, 0)

  return (
    <div className="space-y-7">
      <div>
        <h1 className="font-display text-2xl font-extrabold md:text-3xl">
          স্বাগতম, {session?.profile.full_name || "অ্যাডমিন"} 👋
        </h1>
        <p className="mt-1 text-sm text-muted">আজকের ব্যবসার চিত্র — এক নজরে</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard emoji="🧾" label="আজকের অর্ডার" value={(todayRes.count ?? 0).toLocaleString("bn-BD")} />
        <StatCard emoji="💰" label="আজকের আয় (COD)" value={bdt(todayRevenue)} accent />
        <StatCard emoji="⏳" label="পেন্ডিং অর্ডার" value={(pendingRes.count ?? 0).toLocaleString("bn-BD")} warn={(pendingRes.count ?? 0) > 5} />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Recent orders */}
        <section className="rounded-3xl border border-line bg-surface p-5 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display font-bold">🕒 সর্বশেষ অর্ডার</h2>
            <Link href="/admin/orders" className="text-xs font-semibold text-primary hover:underline">
              সবগুলো →
            </Link>
          </div>
          {(recentRes.data ?? []).length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">এখনো কোনো অর্ডার আসেনি 😴</p>
          ) : (
            <ul className="divide-y divide-line/60">
              {(recentRes.data ?? []).map((o) => (
                <li key={o.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {o.customer_name}
                      <span className="ml-2 font-mono text-[11px] font-normal text-muted">
                        {o.order_no}
                      </span>
                    </p>
                    <p className="text-xs text-muted">{bnDate(o.created_at)}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-bold">{bdt(o.total_bdt)}</p>
                    <span className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS_COLORS[o.status]}`}>
                      {STATUS_LABELS[o.status]}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Low stock */}
        <section className="rounded-3xl border border-line bg-surface p-5 shadow-card">
          <h2 className="mb-4 font-display font-bold">⚠️ স্টক কমে যাচ্ছে</h2>
          {(lowStockRes.data ?? []).length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">সব পণ্যে যথেষ্ট স্টক আছে ✅</p>
          ) : (
            <ul className="divide-y divide-line/60">
              {(lowStockRes.data ?? []).map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{p.title_bn}</p>
                    <p className="text-xs text-muted">
                      {p.tenant === "mithai" ? "🍯 মিষ্টি বাংলা" : "🎁 অডবক্স"}
                    </p>
                  </div>
                  <Link
                    href={`/admin/products/${p.id}/edit`}
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
                      p.stock === 0 ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {p.stock === 0 ? "স্টক শেষ!" : `${p.stock.toLocaleString("bn-BD")}টি বাকি`}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}

function StatCard({
  emoji,
  label,
  value,
  accent,
  warn,
}: {
  emoji: string
  label: string
  value: string
  accent?: boolean
  warn?: boolean
}) {
  return (
    <div className="rounded-3xl border border-line bg-surface p-5 shadow-card">
      <p className="text-sm text-muted">
        {emoji} {label}
      </p>
      <p
        className={`mt-2 font-display text-2xl font-black md:text-3xl ${
          warn ? "text-amber-500" : accent ? "text-primary" : "text-ink"
        }`}
      >
        {value}
      </p>
    </div>
  )
}
