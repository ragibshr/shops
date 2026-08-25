import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/auth"
import { updateOrderStatusAction } from "@/app/admin/actions"
import { bdt, bnDate } from "@/lib/utils"
import type { OrderStatus } from "@/lib/types"

const STATUS_FLOW: Record<string, OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["shipped", "cancelled"],
  shipped: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
}

const TENANT_TABS = [
  { id: "", label: "🌐 দুই শপ" },
  { id: "oddbox", label: "🎁 অডবক্স" },
  { id: "mithai", label: "🍯 মিষ্টি বাংলা" },
]

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; tenant?: string }>
}) {
  const { status, tenant } = await searchParams
  const sb = await createClient()

  let query = sb.from("orders").select("*").order("created_at", { ascending: false }).limit(150)
  if (tenant === "oddbox" || tenant === "mithai") query = query.eq("tenant", tenant)
  if (status && status !== "all") query = query.eq("status", status)
  const { data: ordersRaw } = await query

  const orders = ordersRaw ?? []
  const itemMap = new Map<string, { id: string; title_snapshot_bn: string; variant_label_bn: string | null; qty: number; unit_price_bdt: number }[]>()
  if (orders.length > 0) {
    const { data: items } = await sb
      .from("order_items")
      .select("*")
      .in("order_id", orders.map((o) => o.id))
    for (const item of items ?? []) {
      const list = itemMap.get(item.order_id) ?? []
      list.push(item)
      itemMap.set(item.order_id, list)
    }
  }
  const withItems = orders.map((o) => ({ ...o, items: itemMap.get(o.id) ?? [] }))

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-extrabold md:text-3xl">🧾 অর্ডারসমূহ</h1>

      <div className="flex flex-wrap gap-2">
        {TENANT_TABS.map((t) => {
          const active = (tenant ?? "") === t.id && !status
          return (
            <Link
              key={t.label}
              href={t.id ? `/admin/orders?tenant=${t.id}` : "/admin/orders"}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                active ? "border-primary bg-primary text-on-primary" : "border-line bg-surface text-muted hover:border-primary"
              }`}
            >
              {t.label}
            </Link>
          )
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        <Pill href={hrefWith({ tenant })} active={!status}>
          সব
        </Pill>
        {Object.entries(STATUS_LABELS).map(([key, label]) => (
          <Pill key={key} href={hrefWith({ tenant }, key)} active={status === key}>
            {label}
          </Pill>
        ))}
      </div>

      {(withItems).length === 0 ? (
        <div className="rounded-3xl border border-dashed border-line bg-surface p-12 text-center text-muted">
          এই ফিল্টারে কোনো অর্ডার নেই 🍃
        </div>
      ) : (
        <div className="space-y-3">
          {(withItems).map((o) => (
            <details key={o.id} className="group rounded-3xl border border-line bg-surface shadow-card open:bg-bg">
              <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-3 p-4 md:p-5">
                <div className="min-w-0">
                  <p className="font-semibold">
                    {o.customer_name}
                    <span className="ml-2 font-mono text-[11px] text-muted">{o.order_no}</span>
                    <span className="ml-2 rounded-full bg-surface-2 px-2 py-0.5 text-[10px] text-muted">
                      {o.tenant === "mithai" ? "🍯" : "🎁"}
                    </span>
                  </p>
                  <p className="mt-0.5 text-xs text-muted">
                    📞 {o.phone} · {bnDate(o.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${STATUS_COLORS[o.status]}`}>
                    {STATUS_LABELS[o.status]}
                  </span>
                  <span className="font-display text-lg font-black text-primary">{bdt(o.total_bdt)}</span>
                </div>
              </summary>

              <div className="grid gap-5 border-t border-line px-4 pb-5 pt-4 md:grid-cols-2 md:px-5">
                <div className="space-y-2 text-sm">
                  <p><b>ঠিকানা:</b> {o.address}, {o.thana_area ? `${o.thana_area}, ` : ""}{o.district}</p>
                  <p><b>জোন:</b> {o.zone === "inside_dhaka" ? "ঢাকার ভিতরে" : "ঢাকার বাইরে"}</p>
                  {o.gift_message_bn && (
                    <p className="rounded-xl bg-accent-soft px-3 py-2">🎁 “{o.gift_message_bn}”</p>
                  )}
                  {o.notes_bn && <p className="text-muted">📝 {o.notes_bn}</p>}
                  <div className="rounded-2xl border border-line p-3">
                    {o.items?.length ? (
                      <ul className="space-y-1">
                        {o.items.map((item: { id: string; title_snapshot_bn: string; variant_label_bn: string | null; qty: number; unit_price_bdt: number }) => (
                          <li key={item.id} className="flex justify-between gap-2">
                            <span>
                              {item.title_snapshot_bn}
                              {item.variant_label_bn && <i className="text-xs text-muted"> ({item.variant_label_bn})</i>}
                              ×{item.qty.toLocaleString("bn-BD")}
                            </span>
                            <span>{bdt(item.unit_price_bdt * item.qty)}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-muted">আইটেম দেখতে ডেটাবেস কানেকশন দরকার</p>
                    )}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">
                    স্টেটাস আপডেট
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(STATUS_FLOW[o.status] ?? []).map((next) => (
                      <form
                        key={next}
                        action={async () => {
                          "use server"
                          await updateOrderStatusAction(o.id, o.tenant, next)
                        }}
                      >
                        <button
                          className={`rounded-full px-4 py-2 text-sm font-bold transition-transform hover:scale-105 ${
                            next === "cancelled"
                              ? "border border-red-300 bg-red-50 text-red-600"
                              : "bg-primary text-on-primary shadow-card"
                          }`}
                        >
                          {next === "cancelled" ? "❌ বাতিল" : `→ ${STATUS_LABELS[next]}`}
                        </button>
                      </form>
                    ))}
                    {STATUS_FLOW[o.status]?.length === 0 && (
                      <p className="text-sm text-muted">এই অর্ডার চূড়ান্ত হয়েছে ✅</p>
                    )}
                  </div>
                  <div className="mt-4 space-y-1 border-t border-dashed border-line pt-3 text-sm">
                    <Row label="সাবটোটাল" value={bdt(o.subtotal_bdt)} />
                    <Row label="ডেলিভারি" value={o.delivery_fee_bdt === 0 ? "ফ্রি" : bdt(o.delivery_fee_bdt)} />
                    <Row label="মোট (COD)" value={bdt(o.total_bdt)} strong />
                  </div>
                </div>
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  )
}

function Pill({ href, active, children }: { href: string; active?: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
        active ? "border-primary bg-primary text-on-primary" : "border-line bg-surface text-muted hover:border-primary"
      }`}
    >
      {children}
    </Link>
  )
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted">{label}</span>
      <span className={strong ? "font-display font-black text-primary" : "font-semibold"}>{value}</span>
    </div>
  )
}

function hrefWith(base: { tenant?: string }, status?: string): string {
  const params = new URLSearchParams()
  if (base.tenant) params.set("tenant", base.tenant)
  if (status && status !== "all") params.set("status", status)
  const qs = params.toString()
  return qs ? `/admin/orders?${qs}` : "/admin/orders"
}
