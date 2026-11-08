/**
 * Brand copy for Oddbox BD.
 *
 * The codebase used to serve two shops by domain; it is now ONE brand
 * (Oddbox BD) with sections — মজার উপহার → দুগ্ধজাত → আম. The "tenant"
 * naming is kept internally (DB column `tenant = 'oddbox'`) so older data
 * stays valid.
 *
 * Things you change often (announcement bar, delivery fees, WhatsApp,
 * bKash number) live in the database — Admin → Settings — not here.
 */

import type { SocialLinks } from "@/lib/social"

export type TenantSlug = "oddbox"

export const SHOP_ID: TenantSlug = "oddbox"

export interface HomeCopy {
  heroKicker: string
  heroTitle: string
  heroSub: string
  ctaPrimary: string
  ctaSecondary: string
  heroStickers: string[]
  marqueeJokes: string[]
  featuredTitle: string
  featuredSub: string
  sectionsTitle: string
  sectionsSub: string
  trustItems: { emoji: string; title: string; sub: string }[]
}

export interface Tenant {
  slug: TenantSlug
  domain: string
  nameBn: string
  legalName: string
  taglineBn: string
  metaDescriptionBn: string
  /** Fallback only — the live value comes from Admin → Settings. */
  announcementBn: string | null
  home: HomeCopy
  footerNoteBn: string
  supportPhone: string
  supportEmail: string
  facebookUrl: string
  /** Fallback only — the live value comes from Admin → Settings. */
  whatsappNumber: string
  /** WhatsApp / Messenger / Instagram / Facebook links (from Admin → Settings). */
  links: SocialLinks
}

export const BRAND: Tenant = {
  slug: "oddbox",
  domain: "oddboxbd.shop",
  nameBn: "অডবক্স বিডি",
  legalName: "Oddbox BD",
  taglineBn: "অদ্ভুত মজা থেকে খাঁটি স্বাদ — সব এক বাক্সে",
  metaDescriptionBn:
    "অডবক্স বিডি — বন্ধুকে জ্বালানোর মতো মজার উপহার, আর শীঘ্রই খাঁটি ঘি-দই ও মৌসুমি আম। ক্যাশ অন ডেলিভারি ও বিকাশে সারা দেশে ডেলিভারি।",
  announcementBn: "🚚 ১৫০০৳+ অর্ডারে ডেলিভারি ফ্রি!",
  home: {
    heroKicker: "📦 এক বাক্সে যত অদ্ভুত আর খাঁটি জিনিস",
    heroTitle: "বাক্সটা অদ্ভুত,\nভেতরের জিনিস খাঁটি!",
    heroSub:
      "আজ বন্ধুকে পাঠান ফ্রেশ গোবর বা ব্যাগভর্তি ঢাকার বাতাস। কাল ঘরে আসবে গাওয়া ঘি আর গাছপাকা আম। সব অর্ডার একই জায়গায়, পুরো দেশে ডেলিভারি।",
    ctaPrimary: "🎁 মজার উপহার দেখুন",
    ctaSecondary: "কী কী আসছে?",
    heroStickers: ["🐄", "💨", "🥭", "🎁", "🧈", "🌶️"],
    marqueeJokes: [
      "🐄 গরু বন্ধুর জন্য ফ্রেশ গোবর",
      "💨 ব্যাগে বিশুদ্ধ ঢাকার বাতাস",
      "🌿 গাধা বন্ধুর জন্য ঘাসের বক্স",
      "🧈 শীঘ্রই: খাঁটি গাওয়া ঘি",
      "🥭 মৌসুমে: গাছপাকা হিমসাগর",
      "💵 ক্যাশ অন ডেলিভারি · বিকাশ",
    ],
    featuredTitle: "এই সপ্তাহের হিট",
    featuredSub: "যেগুলো নিয়ে পুরো গ্রুপ চ্যাটে হাসাহাসি চলছে",
    sectionsTitle: "অডবক্সে কী কী আছে?",
    sectionsSub: "একটা করে বাক্স খুলছি — আগে মজা, তারপর স্বাদ",
    trustItems: [
      { emoji: "📦", title: "রেজিস্ট্রেশন লাগে না", sub: "কার্টে দিন, একটা ফর্ম পূরণ করুন, ব্যস!" },
      { emoji: "💵", title: "ক্যাশ অন ডেলিভারি / বিকাশ", sub: "হাতে পেয়ে টাকা দিন, অথবা আগেই বিকাশ করুন" },
      { emoji: "🚚", title: "সারা দেশে ডেলিভারি", sub: "ঢাকায় ২৪ ঘণ্টা, ঢাকার বাইরে ৪৮–৭২ ঘণ্টা" },
    ],
  },
  footerNoteBn: "মজার উপহারগুলো শুধু মজার জন্য 😄 খাবারগুলো একদম সিরিয়াস, খাঁটি।",
  supportPhone: "+8801711000000",
  supportEmail: "hello@oddboxbd.shop",
  facebookUrl: "https://facebook.com/oddboxbd",
  whatsappNumber: "+8801711000000",
  links: { whatsapp: null, messenger: null, instagram: null, facebook: null },
}

/** @deprecated kept so old imports compile; there is only one shop now. */
export const TENANTS: Record<TenantSlug, Tenant> = { oddbox: BRAND }

export const DELIVERY_ZONES = [
  { id: "inside_dhaka", labelBn: "ঢাকার ভিতরে", feeDefault: 70, etaBn: "২৪ ঘণ্টার মধ্যে" },
  { id: "outside_dhaka", labelBn: "ঢাকার বাইরে", feeDefault: 140, etaBn: "৪৮–৭২ ঘণ্টার মধ্যে" },
] as const

export type ZoneId = (typeof DELIVERY_ZONES)[number]["id"]
