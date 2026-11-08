import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { getTenant } from "@/lib/tenant-server"
import { getProducts, getSocialPosts, getVisibleSections, isLiveMode } from "@/lib/data"
import SocialEmbed from "@/components/store/SocialEmbed"
import Marquee from "@/components/store/Marquee"
import ProductCard from "@/components/store/ProductCard"
import SectionHeading from "@/components/store/SectionHeading"
import WaitlistForm from "@/components/store/WaitlistForm"

const SECTION_LOOK: Record<string, string> = {
  fun: "from-orange-400 to-pink-500",
  dairy: "from-sky-300 to-amber-200",
  mango: "from-amber-400 to-lime-400",
}

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
  const [sections, featured, posts] = await Promise.all([
    getVisibleSections(),
    getProducts({ featuredOnly: true }),
    getSocialPosts(),
  ])
  const { links } = tenant
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
              href="#sections"
              className="rounded-full border border-line bg-surface px-7 py-3.5 font-display text-base font-bold text-ink transition-colors hover:border-primary hover:text-primary"
            >
              {home.ctaSecondary}
            </Link>
          </div>
        </div>
      </section>

      <Marquee jokes={home.marqueeJokes} />

      {/* ---------- SECTIONS: fun → dairy → mango ---------- */}
      <section id="sections" className="mx-auto max-w-6xl scroll-mt-24 px-4 pt-14 md:px-6">
        <SectionHeading title={home.sectionsTitle} sub={home.sectionsSub} />
        <div className="grid gap-4 md:grid-cols-3">
          {sections.map((section) => {
            const isLive = section.status === "live"
            return (
              <div
                key={section.id}
                className={`relative flex flex-col overflow-hidden rounded-[2rem] border border-line bg-surface shadow-card ${
                  isLive ? "" : "opacity-95"
                }`}
              >
                <div
                  className={`relative flex h-36 items-center justify-center bg-gradient-to-br ${
                    SECTION_LOOK[section.id] ?? "from-orange-300 to-amber-200"
                  } ${isLive ? "" : "grayscale-[35%]"}`}
                >
                  <span className="text-7xl drop-shadow-lg">{section.emoji}</span>
                  <span
                    className={`absolute right-4 top-4 rounded-full px-3 py-1 font-display text-xs font-bold shadow-card ${
                      isLive ? "bg-white text-emerald-600" : "bg-ink/80 text-white"
                    }`}
                  >
                    {isLive ? "● এখন চালু" : "⏳ শীঘ্রই আসছে"}
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-3 p-6">
                  <h3 className="font-display text-xl font-extrabold">{section.name_bn}</h3>
                  <p className="flex-1 text-sm leading-relaxed text-muted">{section.tagline_bn}</p>
                  {isLive ? (
                    <Link
                      href={`/shop?section=${section.id}`}
                      className="group mt-1 flex items-center justify-center gap-2 rounded-full bg-primary py-3 font-display text-sm font-bold text-on-primary shadow-card transition-transform hover:scale-[1.02]"
                    >
                      দেখুন ও কিনুন
                      <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                    </Link>
                  ) : (
                    <div>
                      <p className="mb-2 text-xs font-semibold text-muted">
                        চালু হলে জানতে নম্বর দিন:
                      </p>
                      <WaitlistForm sectionId={section.id} compact />
                    </div>
                  )}
                </div>
              </div>
            )
          })}
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

      {/* ---------- REELS / SOCIAL ---------- */}
      {(posts.length > 0 || links.instagram || links.facebook) && (
        <section id="reels" className="mx-auto max-w-6xl scroll-mt-24 px-4 pt-16 md:px-6">
          <SectionHeading
            title="🎬 আমাদের রিলস"
            sub="বন্ধুরা উপহার খুলে কী করল — দেখুন, হাসুন, ফলো করুন"
          />
          {posts.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {posts.slice(0, 6).map((p) => (
                <SocialEmbed key={p.id} platform={p.platform} url={p.url} />
              ))}
            </div>
          )}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {links.instagram && (
              <a
                href={links.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-gradient-to-r from-fuchsia-500 via-pink-500 to-orange-400 px-6 py-3 font-display text-sm font-bold text-white shadow-card transition-transform hover:scale-105"
              >
                📸 Instagram-এ ফলো করুন
              </a>
            )}
            {links.facebook && (
              <a
                href={links.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-[#1877F2] px-6 py-3 font-display text-sm font-bold text-white shadow-card transition-transform hover:scale-105"
              >
                📘 Facebook পেজ
              </a>
            )}
          </div>
        </section>
      )}

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

      {/* ---------- HOW IT WORKS ---------- */}
      <section className="mx-auto max-w-6xl px-4 pt-16 md:px-6">
        <SectionHeading title="মাত্র ৩ ধাপে মজা!" sub="কোনো ঝামেলা নেই, কোনো রেজিস্ট্রেশন নেই।" />
        <div className="grid gap-3 sm:gap-4 md:grid-cols-3">
          {["১. পছন্দের উপহার বাছুন", "২. ফর্ম পূরণ করে পেমেন্ট বাছুন", "৩. ডেলিভারি পেয়ে মেতে উঠুন"].map(
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
                  {i === 1 && "নাম, ফোন, ঠিকানা — তারপর ক্যাশ অন ডেলিভারি বা বিকাশ"}
                  {i === 2 && "ফোন নম্বর দিয়ে যেকোনো সময় অর্ডার ট্র্যাক করুন 😄"}
                </p>
              </div>
            ),
          )}
        </div>
      </section>

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
