import Link from "next/link"
import { getTenant } from "@/lib/tenant-server"
import { getCategories, getProducts } from "@/lib/data"
import ProductCard from "@/components/store/ProductCard"

export const metadata = { title: "সব পণ্য" }

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>
}) {
  const { cat } = await searchParams
  const tenant = await getTenant()
  const [categories, products] = await Promise.all([
    getCategories(tenant.slug),
    getProducts(tenant.slug, { categorySlug: cat }),
  ])

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
      <h1 className="font-display text-3xl font-extrabold text-ink md:text-4xl">
        {cat ? (
          <>
            <span className="text-primary">{categories.find((c) => c.slug === cat)?.emoji}</span>{" "}
            {categories.find((c) => c.slug === cat)?.name_bn ?? "পণ্য"}
          </>
        ) : (
          "সব পণ্য"
        )}
      </h1>
      <p className="mt-2 text-sm text-muted">
        {products.length.toLocaleString("bn-BD")}টি পণ্য · ক্যাশ অন ডেলিভারিতে সারা দেশে 🚚
      </p>

      <div className="scrollbar-none -mx-4 mt-6 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:px-0">
        <Pill href="/shop" active={!cat}>
          ✨ সবগুলো
        </Pill>
        {categories.map((c) => (
          <Pill key={c.id} href={`/shop?cat=${c.slug}`} active={cat === c.slug}>
            {c.emoji} {c.name_bn}
          </Pill>
        ))}
      </div>

      {products.length > 0 ? (
        <div className="mt-7 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="mt-16 rounded-3xl border border-dashed border-line bg-surface p-12 text-center">
          <span className="text-5xl">🫥</span>
          <p className="mt-4 font-display text-lg font-bold">এই তালিকায় এখন কিছু নেই</p>
          <p className="mt-1 text-sm text-muted">অন্য ক্যাটাগরি দেখে নিন!</p>
          <Link
            href="/shop"
            className="mt-5 inline-block rounded-full bg-primary px-6 py-2.5 font-display text-sm font-bold text-on-primary"
          >
            সবগুলো দেখুন
          </Link>
        </div>
      )}
    </div>
  )
}

function Pill({
  href,
  active,
  children,
}: {
  href: string
  active?: boolean
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className={`shrink-0 rounded-full border px-4 py-2 font-display text-sm font-semibold transition-all ${
        active
          ? "border-primary bg-primary text-on-primary shadow-card"
          : "border-line bg-surface text-muted hover:border-primary hover:text-primary"
      }`}
    >
      {children}
    </Link>
  )
}
