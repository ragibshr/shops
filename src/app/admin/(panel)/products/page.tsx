import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Pencil, Plus, Star } from "lucide-react"
import DeleteProductButton from "@/components/admin/DeleteProductButton"

const TABS = [
  { id: "oddbox", label: "🎁 অডবক্স" },
  { id: "mithai", label: "🍯 মিষ্টি বাংলা" },
]

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ tenant?: string }>
}) {
  const { tenant } = await searchParams
  const current = tenant === "mithai" ? "mithai" : "oddbox"
  const sb = await createClient()

  const [{ data: products }, { data: categories }] = await Promise.all([
    sb.from("products").select("*").eq("tenant", current).order("sort"),
    sb.from("categories").select("*").eq("tenant", current).order("sort"),
  ])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-extrabold md:text-3xl">📦 পণ্য ব্যবস্থাপনা</h1>
        <Link
          href={`/admin/products/new?tenant=${current}`}
          className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 font-display text-sm font-bold text-on-primary shadow-card transition-transform hover:scale-105"
        >
          <Plus size={15} />
          নতুন পণ্য
        </Link>
      </div>

      <div className="flex gap-2">
        {TABS.map((t) => (
          <Link
            key={t.id}
            href={`/admin/products?tenant=${t.id}`}
            className={`rounded-full border px-4 py-2 text-sm font-semibold ${
              current === t.id ? "border-primary bg-primary text-on-primary" : "border-line bg-surface text-muted hover:border-primary"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <div className="overflow-hidden rounded-3xl border border-line bg-surface shadow-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-surface-2/60 text-xs uppercase tracking-wider text-muted">
            <tr>
              <th className="p-4">পণ্য</th>
              <th className="hidden p-4 md:table-cell">ক্যাটাগরি</th>
              <th className="p-4">দাম</th>
              <th className="p-4">স্টক</th>
              <th className="hidden p-4 sm:table-cell">স্টেটাস</th>
              <th className="p-4 text-right">অ্যাকশন</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line/60">
            {(products ?? []).map((p) => {
              const cat = (categories ?? []).find((c) => c.id === p.category_id)
              return (
                <tr key={p.id} className="hover:bg-surface-2/40">
                  <td className="max-w-[220px] p-4">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.images[0]} alt="" className="h-11 w-11 shrink-0 rounded-xl object-cover" />
                      <span className="truncate font-medium">{p.title_bn}</span>
                      {p.is_featured && <Star size={13} className="shrink-0 fill-amber-400 text-amber-400" />}
                    </div>
                  </td>
                  <td className="hidden p-4 text-muted md:table-cell">{cat?.emoji} {cat?.name_bn ?? "—"}</td>
                  <td className="whitespace-nowrap p-4 font-semibold">{p.price_bdt.toLocaleString("bn-BD")}৳</td>
                  <td className="p-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                        p.stock === null
                          ? "bg-surface-2 text-muted"
                          : p.stock === 0
                            ? "bg-red-100 text-red-600"
                            : p.stock <= 10
                              ? "bg-amber-100 text-amber-800"
                              : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {p.stock === null ? "আনলিমিটেড" : `${p.stock.toLocaleString("bn-BD")}`}
                    </span>
                  </td>
                  <td className="hidden p-4 sm:table-cell">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${p.is_active ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-400"}`}>
                      {p.is_active ? "লাইভ" : "বন্ধ"}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/admin/products/${p.id}/edit?tenant=${current}`}
                        aria-label="এডিট"
                        className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-surface-2"
                      >
                        <Pencil size={14} className="text-muted" />
                      </Link>
                      <DeleteProductButton id={p.id} />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {(products ?? []).length === 0 && (
          <p className="p-10 text-center text-muted">কোনো পণ্য নেই — নতুন একটা বানান!</p>
        )}
      </div>
    </div>
  )
}
