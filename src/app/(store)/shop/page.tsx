import Link from "next/link"
import { getCategories, getProducts, getVisibleSections } from "@/lib/data"
import ProductCard from "@/components/store/ProductCard"
import WaitlistForm from "@/components/store/WaitlistForm"
import { bdt } from "@/lib/utils"

export const metadata = { title: "শপ" }

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ section?: string; cat?: string }>
}) {
  const { section: sectionParam, cat } = await searchParams
  const [sections, categories] = await Promise.all([getVisibleSections(), getCategories()])

  // a category link implies its section
  const catRow = cat ? categories.find((c) => c.slug === cat) : undefined
  const activeSection = sections.find((s) => s.id === (sectionParam ?? catRow?.section_id))

  /* ---------- coming-soon section: teaser + waitlist ---------- */
  if (activeSection && activeSection.status === "coming_soon") {
    const upcoming = await getProducts({ sectionId: activeSection.id, includeUpcoming: true })
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
        <SectionTabs sections={sections} active={activeSection.id} />
        <div className="mt-8 overflow-hidden rounded-[2rem] border border-line bg-surface p-8 text-center shadow-card md:p-12">
          <span className="text-6xl">{activeSection.emoji}</span>
          <h1 className="mt-4 font-display text-3xl font-extrabold md:text-4xl">
            {activeSection.name_bn} — শীঘ্রই আসছে
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-muted">{activeSection.tagline_bn}</p>
          <div className="mx-auto mt-7 max-w-md text-left">
            <p className="mb-2 text-center text-sm font-semibold">
              চালু হওয়ার দিনই এসএমএস/ফোনে জানাতে নম্বর দিন 👇
            </p>
            <WaitlistForm sectionId={activeSection.id} />
          </div>
        </div>

        {upcoming.length > 0 && (
          <>
            <h2 className="mt-12 font-display text-xl font-bold">যা যা আসছে</h2>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {upcoming.map((p) => (
                <div
                  key={p.id}
                  className="overflow-hidden rounded-3xl border border-line bg-surface opacity-80 shadow-card"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.images[0]} alt="" className="aspect-[4/3] w-full object-cover grayscale-[40%]" />
                  <div className="p-4">
                    <p className="font-display text-sm font-bold leading-snug">{p.title_bn}</p>
                    <p className="mt-1 text-xs text-muted">সম্ভাব্য দাম {bdt(p.price_bdt)} থেকে</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    )
  }

  /* ---------- live catalogue ---------- */
  const products = await getProducts({ sectionId: activeSection?.id, categorySlug: cat })
  const sectionCats = activeSection
    ? categories.filter((c) => c.section_id === activeSection.id)
    : []

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
      <SectionTabs sections={sections} active={activeSection?.id} />

      <h1 className="mt-8 font-display text-3xl font-extrabold text-ink md:text-4xl">
        {catRow ? (
          <>
            <span className="text-primary">{catRow.emoji}</span> {catRow.name_bn}
          </>
        ) : activeSection ? (
          <>
            <span className="text-primary">{activeSection.emoji}</span> {activeSection.name_bn}
          </>
        ) : (
          "সব পণ্য"
        )}
      </h1>
      <p className="mt-2 text-sm text-muted">
        {products.length.toLocaleString("bn-BD")}টি পণ্য · ক্যাশ অন ডেলিভারি / বিকাশ · সারা দেশে 🚚
      </p>

      {sectionCats.length > 1 && (
        <div className="scrollbar-none -mx-4 mt-6 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:px-0">
          <Pill href={`/shop?section=${activeSection!.id}`} active={!cat}>
            ✨ সবগুলো
          </Pill>
          {sectionCats.map((c) => (
            <Pill key={c.id} href={`/shop?section=${activeSection!.id}&cat=${c.slug}`} active={cat === c.slug}>
              {c.emoji} {c.name_bn}
            </Pill>
          ))}
        </div>
      )}

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
          <p className="mt-1 text-sm text-muted">অন্য সেকশন দেখে নিন!</p>
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

function SectionTabs({
  sections,
  active,
}: {
  sections: { id: string; name_bn: string; emoji: string | null; status: string }[]
  active?: string
}) {
  return (
    <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
      <SectionTab href="/shop" active={!active}>
        🛍️ সব
      </SectionTab>
      {sections.map((s) => (
        <SectionTab key={s.id} href={`/shop?section=${s.id}`} active={active === s.id}>
          {s.emoji} {s.name_bn}
          {s.status === "coming_soon" && (
            <span className="ml-1.5 rounded-full bg-ink/10 px-2 py-0.5 text-[10px] font-semibold">
              শীঘ্রই
            </span>
          )}
        </SectionTab>
      ))}
    </div>
  )
}

function SectionTab({
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
      className={`flex shrink-0 items-center rounded-2xl border-2 px-5 py-3 font-display text-sm font-bold transition-all md:text-base ${
        active
          ? "border-ink bg-ink text-white shadow-card"
          : "border-line bg-surface text-ink hover:border-primary"
      }`}
    >
      {children}
    </Link>
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
