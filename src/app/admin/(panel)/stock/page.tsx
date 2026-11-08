import { createClient } from "@/lib/supabase/server"
import { SHOP_ID } from "@/lib/tenants"
import StockRow from "@/components/admin/StockRow"

export default async function StockPage() {
  const sb = await createClient()
  const [{ data: products }, { data: categories }, { data: sections }] = await Promise.all([
    sb.from("products").select("id,title_bn,images,stock,category_id,is_active").eq("tenant", SHOP_ID).order("sort"),
    sb.from("categories").select("id,section_id").eq("tenant", SHOP_ID),
    sb.from("sections").select("*").order("sort"),
  ])

  const sectionOf = new Map((categories ?? []).map((c) => [c.id, c.section_id as string | null]))
  const groups = [
    ...(sections ?? []).map((s) => ({
      id: s.id as string,
      title: `${s.emoji ?? ""} ${s.name_bn}`,
      live: s.status === "live",
    })),
    { id: "__none", title: "📦 অন্যান্য", live: true },
  ]

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold md:text-3xl">📦 স্টক আপডেট</h1>
        <p className="mt-1 text-sm text-muted">
          হাতে কতগুলো আছে লিখে সেভ দিন। ০ দিলে কাস্টমার আর অর্ডার করতে পারবে না। খালি রাখলে আনলিমিটেড।
        </p>
      </div>

      {groups.map((g) => {
        const rows = (products ?? []).filter(
          (p) => (sectionOf.get(p.category_id) ?? "__none") === g.id,
        )
        if (rows.length === 0) return null
        return (
          <section key={g.id} className="overflow-hidden rounded-3xl border border-line bg-surface shadow-card">
            <h2 className="flex items-center justify-between border-b border-line bg-surface-2/60 px-5 py-3 font-display font-bold">
              {g.title}
              {!g.live && <span className="text-xs font-normal text-muted">এখনো বিক্রি শুরু হয়নি</span>}
            </h2>
            <ul className="divide-y divide-line/60">
              {rows.map((p) => (
                <StockRow
                  key={p.id}
                  id={p.id}
                  title={p.title_bn}
                  image={p.images?.[0] ?? null}
                  stock={p.stock}
                  inactive={!p.is_active}
                />
              ))}
            </ul>
          </section>
        )
      })}
    </div>
  )
}
