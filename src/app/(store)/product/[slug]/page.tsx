import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { ArrowLeft, ShieldCheck, Truck, Banknote } from "lucide-react"
import { getTenant } from "@/lib/tenant-server"
import { getProductBySlug, getProducts } from "@/lib/data"
import AddToCartPanel from "@/components/store/AddToCartPanel"
import ProductCard from "@/components/store/ProductCard"
import ProductImageCarousel from "@/components/store/mithai/ProductImageCarousel"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const tenant = await getTenant()
  const product = await getProductBySlug(tenant.slug, slug)
  if (!product) return {}
  return {
    title: product.title_bn,
    description: product.tagline_bn ?? product.description_bn ?? undefined,
    openGraph: {
      title: `${product.title_bn} · ${tenant.nameBn}`,
      description: product.tagline_bn ?? undefined,
      images: product.images[0] ? [{ url: product.images[0] }] : undefined,
    },
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const tenant = await getTenant()
  const product = await getProductBySlug(tenant.slug, slug)
  if (!product) notFound()

  const related = (
    await getProducts(tenant.slug)
  ).filter((p) => p.id !== product.id && p.category_id === product.category_id).slice(0, 4)

  const discount =
    product.compare_price_bdt && product.compare_price_bdt > product.price_bdt
      ? Math.round(
          ((product.compare_price_bdt - product.price_bdt) / product.compare_price_bdt) * 100,
        )
      : null

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
      <Link
        href={tenant.mall ? "/" : "/shop"}
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-primary"
      >
        <ArrowLeft size={15} />
        {tenant.mall ? "দোকানে ফিরে যান" : "শপে ফিরে যান"}
      </Link>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Gallery */}
        {tenant.mall ? (
          <div className="relative">
            <ProductImageCarousel images={product.images} alt={product.title_bn} />
            {product.badge_bn && (
              <span className="absolute left-4 top-4 z-10 rounded-full bg-accent px-3 py-1.5 text-xs font-bold text-white shadow-card">
                {product.badge_bn}
              </span>
            )}
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-[2rem] border border-line bg-surface-2 shadow-card">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.images[0]}
              alt={product.title_bn}
              className="aspect-square w-full object-cover"
            />
            {product.badge_bn && (
              <span className="absolute left-4 top-4 rounded-full bg-accent px-3 py-1.5 text-xs font-bold text-white shadow-card">
                {product.badge_bn}
              </span>
            )}
          </div>
        )}

        {/* Info */}
        <div className="flex flex-col">
          <h1 className="font-display text-2xl font-extrabold leading-snug text-ink md:text-4xl">
            {product.title_bn}
          </h1>
          {product.tagline_bn && (
            <p className="mt-2.5 font-display text-base text-accent md:text-lg">
              “{product.tagline_bn}”
            </p>
          )}

          <div className="mt-5 flex flex-wrap items-baseline gap-2.5">
            <span className="font-display text-3xl font-black text-primary md:text-4xl">
              ৳{product.price_bdt.toLocaleString("bn-BD")}
            </span>
            {product.compare_price_bdt && (
              <>
                <span className="text-lg text-muted line-through">
                  ৳{product.compare_price_bdt.toLocaleString("bn-BD")}
                </span>
                {discount !== null && (
                  <span className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-bold text-accent">
                    {discount.toLocaleString("bn-BD")}% ছাড়!
                  </span>
                )}
              </>
            )}
          </div>

          {product.stock !== null && product.stock > 0 && product.stock <= 10 && (
            <p className="mt-3 inline-block w-fit rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
              ⏳ মাত্র {product.stock.toLocaleString("bn-BD")}টি বাকি — দ্রুত নিন!
            </p>
          )}

          <div className="mt-6">
            <AddToCartPanel product={product} />
          </div>

          <div className="mt-7 grid grid-cols-3 gap-2 text-center">
            {[
              { icon: Banknote, label: "ক্যাশ অন ডেলিভারি" },
              { icon: Truck, label: "সারা দেশে শিপিং" },
              { icon: ShieldCheck, label: "কোয়ালিটি গ্যারান্টি" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-1.5 rounded-2xl border border-line bg-surface px-2 py-3.5"
              >
                <Icon size={18} className="text-primary" />
                <span className="text-[11px] font-medium leading-tight text-muted">{label}</span>
              </div>
            ))}
          </div>

          {product.description_bn && (
            <div className="mt-7 rounded-3xl border border-line bg-surface p-5 md:p-6">
              <h2 className="mb-2 font-display text-base font-bold">বিস্তারিত</h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-muted">
                {product.description_bn}
              </p>
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 font-display text-xl font-extrabold md:text-2xl">
            এগুলোও দেখে নিন 👀
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
