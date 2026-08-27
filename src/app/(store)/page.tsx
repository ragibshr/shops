import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { getTenant } from "@/lib/tenant-server"
import { getCategories, getProducts, isLiveMode } from "@/lib/data"
import Marquee from "@/components/store/Marquee"
import ProductCard from "@/components/store/ProductCard"
import SectionHeading from "@/components/store/SectionHeading"
import MallExperience from "@/components/store/mithai/MallExperience"

const STICKER_SPOTS = [
  "left-[4%] top-[16%]",
  "right-[6%] top-[12%]",
  "left-[10%] bottom-[18%]",
  "right-[9%] bottom-[24%]",
  "left-[26%] top-[6%] hidden md:block",
  "right-[27%] bottom-[8%] hidden md:block",
]

export default async function HomePage() {
  const tenant = await getTenant()
  const [categories, featured, allProducts] = await Promise.all([
    getCategories(tenant.slug),
    getProducts(tenant.slug, { featuredOnly: true }),
    getProducts(tenant.slug),
  ])

  if (tenant.mall) {
    return <MallExperience mall={tenant.mall} categories={categories} products={allProducts} />
  }

  const home = tenant.home

  return (
    <>
      {/* ---------- HERO ---------- */}
      <section className="relative overflow-hidden px-4 py-14 text-center md:py-24">
        {home.heroStickers.map((emoji, i) => (
          <span
            key={i}
            aria-hidden="true"
            className={`animate-floaty pointer-events-none absolute select-none text-4xl opacity-80 drop-shadow-md md:text-6xl ${STICKER_SPOTS[i]}`}
            style={
              {
                "--float-rot": `${(i % 2 === 0 ? -1 : 1) * (4 + i * 2)}deg`,
                animationDelay: `${i * 0.45}s`,
              } as React.CSSProperties
            }
          >
            {emoji}
          </span>
        ))}

        <div className="relative mx-auto max-w-3xl">
          <p className="mb-5 inline-block rounded-full border border-line bg-surface px-4 py-1.5 font-display text-xs font-semibold text-primary shadow-card md:text-sm">
            {home.heroKicker}
          </p>
          <h1 className="whitespace-pre-line font-display text-4xl font-extrabold leading-tight tracking-tight text-ink md:text-6xl">
            {home.heroTitle}
          </h1>
          <p className="mx-auto mt-6 max-w-xl leading-relaxed text-muted">
            {home.heroSub}
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/shop"
              className="group flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 font-display text-base font-bold text-on-primary shadow-card transition-all hover:scale-105 hover:bg-primary-strong"
            >
              {home.ctaPrimary}
              <ArrowRight
                size={17}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
            <Link
              href="#why-us"
              className="rounded-full border border-line bg-surface px-7 py-3.5 font-display text-base font-bold text-ink transition-colors hover:border-primary hover:text-primary"
            >
              {home.ctaSecondary}
            </Link>
          </div>
        </div>
      </section>

      <Marquee jokes={home.marqueeJokes} />

      {/* ---------- CATEGORIES ---------- */}
      <section className="mx-auto max-w-6xl px-4 pt-14 md:px-6">
        <SectionHeading title={home.categoriesTitle} sub={home.categoriesSub} />
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/shop?cat=${cat.slug}`}
              className="group flex flex-col items-center gap-2 rounded-3xl border border-line bg-surface p-5 text-center shadow-card transition-all hover:-translate-y-1 hover:border-primary"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-2 text-2xl transition-transform group-hover:scale-110 md:h-16 md:w-16 md:text-3xl">
                {cat.emoji}
              </span>
              <span className="font-display text-sm font-bold text-ink group-hover:text-primary md:text-base">
                {cat.name_bn}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------- FEATURED PRODUCTS ---------- */}
      <section className="mx-auto max-w-6xl px-4 pt-16 md:px-6">
        <SectionHeading title={home.featuredTitle} sub={home.featuredSub} />
        {featured.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {featured.slice(0, 8).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <DemoNotice live={isLiveMode()} />
        )}
        <div className="mt-8 text-center">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 font-display text-sm font-bold text-primary hover:underline"
          >
            সবগুলো দেখুন <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {/* ---------- WHY US ---------- */}
      <section id="why-us" className="mx-auto max-w-6xl scroll-mt-24 px-4 pt-16 md:px-6">
        <div className="grid gap-3 sm:gap-4 md:grid-cols-3">
          {home.trustItems.map((item) => (
            <div
              key={item.title}
              className="rounded-3xl border border-line bg-surface p-6 shadow-card"
            >
              <span className="text-3xl">{item.emoji}</span>
              <h3 className="mt-3 font-display text-lg font-bold">{item.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{item.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- STORY (mithai) or HOW IT WORKS (oddbox) ---------- */}
      {home.storyBlock ? (
        <section id="story" className="mx-auto max-w-6xl scroll-mt-24 px-4 pt-16 md:px-6">
          <div className="overflow-hidden rounded-[2rem] border border-line bg-surface p-8 shadow-card md:p-12">
            <p className="font-display text-xs font-bold uppercase tracking-[0.25em] text-accent">
              {home.storyBlock.kicker}
            </p>
            <h2 className="mt-3 font-display text-2xl font-extrabold md:text-4xl">
              {home.storyBlock.title}
            </h2>
            <p className="mt-4 max-w-3xl leading-relaxed text-muted">
              {home.storyBlock.body}
            </p>
          </div>
        </section>
      ) : (
        <section className="mx-auto max-w-6xl px-4 pt-16 md:px-6">
          <SectionHeading title="মাত্র ৩ ধাপে মজা!" sub="কোনো ঝামেলা নেই, কোনো রেজিস্ট্রেশন নেই।" />
          <div className="grid gap-3 sm:gap-4 md:grid-cols-3">
            {["১. পছন্দের উপহার বাছুন", "২. একটা ফর্ম পূরণ করুন", "৩. ডেলিভারি পেয়ে মেতে উঠুন"].map(
              (step, i) => (
                <div
                  key={step}
                  className="relative overflow-hidden rounded-3xl border border-line bg-surface p-6 shadow-card"
                >
                  <span className="absolute -right-3 -top-6 select-none font-display text-8xl font-black opacity-10">
                    {(i + 1).toLocaleString("bn-BD")}
                  </span>
                  <p className="font-display text-lg font-bold">{step}</p>
                  <p className="mt-2 text-sm text-muted">
                    {i === 0 && "কার্টে ছুড়ে ফেলুন — যত খুশি!"}
                    {i === 1 && "নাম, ফোন, ঠিকানা — ব্যস, ব্যস!"}
                    {i === 2 && "হাতে পেয়ে দেখুন, হাসি থামবে না 😄"}
                  </p>
                </div>
              ),
            )}
          </div>
        </section>
      )}

      {!isLiveMode() && (
        <p className="mx-auto mt-10 max-w-xl px-4 text-center text-[11px] text-muted/60">
          ⚠️ ডেমো মোড চলছে — Supabase যুক্ত হলে লাইভ ডেটা দেখাবে।
        </p>
      )}
    </>
  )
}

function DemoNotice({ live }: { live: boolean }) {
  if (!live) {
    return (
      <div className="rounded-3xl border border-dashed border-line bg-surface p-10 text-center text-sm text-muted">
        শীঘ্রই আসছে... 🎈
      </div>
    )
  }
  return null
}
