import type { Category, Product } from "@/lib/types"

export const DEMO_CATEGORIES: Category[] = [
  { id: "c-ob-farm", tenant: "oddbox", slug: "farm", name_bn: "ফার্ম সিরিজ", emoji: "🐄", sort: 1 },
  { id: "c-ob-air", tenant: "oddbox", slug: "air", name_bn: "বাতাস সিরিজ", emoji: "💨", sort: 2 },
  { id: "c-ob-donkey", tenant: "oddbox", slug: "donkey", name_bn: "গাধা স্পেশাল", emoji: "🌿", sort: 3 },
  { id: "c-ob-combo", tenant: "oddbox", slug: "combo", name_bn: "কম্বো বক্স", emoji: "🎁", sort: 4 },
  { id: "c-m-sweets", tenant: "mithai", slug: "sweets", name_bn: "মিষ্টি", emoji: "🍮", sort: 1 },
  { id: "c-m-dairy", tenant: "mithai", slug: "dairy", name_bn: "ঘি ও দুধজাত", emoji: "🧈", sort: 2 },
  { id: "c-m-honey", tenant: "mithai", slug: "honey", name_bn: "মধু", emoji: "🍯", sort: 3 },
  { id: "c-m-fruits", tenant: "mithai", slug: "fruits", name_bn: "মৌসুমি ফল", emoji: "🥭", sort: 4 },
]

const P = (
  o: Partial<Product> & {
    id: string
    tenant: string
    category_id: string
    slug: string
    title_bn: string
    price_bdt: number
    images: string[]
  },
): Product => ({
  tagline_bn: null,
  description_bn: null,
  compare_price_bdt: null,
  variants: null,
  stock: null,
  badge_bn: null,
  is_active: true,
  is_featured: false,
  seasonal_from: null,
  seasonal_to: null,
  sort: 100,
  ...o,
})

export const DEMO_PRODUCTS: Product[] = [
  P({
    id: "p-ob-1", tenant: "oddbox", category_id: "c-ob-farm", slug: "fresh-cowdung",
    title_bn: "ফ্রেশ গরুর গোবর (প্রিমিয়াম প্যাক)",
    tagline_bn: "গরু বন্ধুকে তার প্রাপ্য উপহার!",
    description_bn:
      "আপনার সেই বন্ধুকে কি “গরু” বলে ডাকা হয় গ্রুপে? এবার তাকে অফিসিয়ালি সার্টিফিকেট দিন! সুস্বাদু, সুগঠিত, ফ্রেশ গোবর — এয়ারটাইট বক্সে সাজানো। সাথে থাকছে “বৃষভূষণ সম্মাননা সনদ”।",
    price_bdt: 299, compare_price_bdt: 449,
    images: ["/products/ob-fresh-cowdung.svg"],
    variants: [
      { label: "সিঙ্গেল পিস", priceDelta: 0 },
      { label: "ফ্যামিলি প্যাক (৩ পিস)", priceDelta: 200 },
    ],
    stock: 50, badge_bn: "🔥 ভাইরাল", is_featured: true, sort: 1,
  }),
  P({
    id: "p-ob-2", tenant: "oddbox", category_id: "c-ob-air", slug: "pure-air-bag",
    title_bn: "ব্যাগে বিশুদ্ধ ঢাকার বাতাস",
    tagline_bn: "যে উপহার শোঁকার পরও শেষ হয় না (নাকি?)",
    description_bn:
      "ঢাকার বাতাস এখন দুর্লভ সম্পদ — তাই তো আমরা সংগ্রহ করেছি সকাল ৫টার সবচেয়ে টাটকা বাতাস, ভ্যাকুয়াম-সিল ব্যাগে!",
    price_bdt: 149, compare_price_bdt: 249,
    images: ["/products/ob-pure-air.svg"],
    variants: [
      { label: "রেগুলার ব্যাগ", priceDelta: 0 },
      { label: "জাম্বো ব্যাগ", priceDelta: 100 },
    ],
    badge_bn: "💨 নতুন", is_featured: true, sort: 2,
  }),
  P({
    id: "p-ob-3", tenant: "oddbox", category_id: "c-ob-donkey", slug: "grass-box",
    title_bn: "গাধা বন্ধুর জন্য ঘাসের বক্স",
    tagline_bn: "“খাও, সুস্থ থাও” — সদ্য কাটা ঘাস",
    description_bn:
      "যে বন্ধু প্রতি প্ল্যানে দেরি করে, যে ক্লাসমেট প্রতি বছর ফেল করে — তাদের সবার জন্য এক বান্ডেল টাটকা ঘাস। হাতে-কলমে বাছাইকৃত, ছাগল-অনুমোদিত কোয়ালিটি।",
    price_bdt: 349, compare_price_bdt: 499,
    images: ["/products/ob-grass-box.svg"],
    stock: 40, badge_bn: "🌿 গাধা অ্যাপ্রুভড", is_featured: true, sort: 3,
  }),
  P({
    id: "p-ob-4", tenant: "oddbox", category_id: "c-ob-farm", slug: "brick-diamond",
    title_bn: "“হিরা” উপহার সেট",
    tagline_bn: "কারণ মূল্যবোধ মূল্য ছাড়াই দেওয়া যায়",
    description_bn: "ভেলভেট বক্সে সাজানো একটি আস্ত ইট। বক্স খুলে বন্ধু যা ভাববে, তা-ই আসল উপহার।",
    price_bdt: 199, compare_price_bdt: 299,
    images: ["/products/ob-brick.svg"], stock: 60, sort: 4,
  }),
  P({
    id: "p-ob-5", tenant: "oddbox", category_id: "c-ob-combo", slug: "chili-bomb",
    title_bn: "ঝাল চকলেট বোম্বা",
    tagline_bn: "মিষ্টি মুখে, আগুন পেটে 😈",
    description_bn:
      "দেখতে সাধারণ চকলেট, ভিতরে ভুট্টান-লেভেল ঝাল! শেয়ার করলে বন্ধুত্ব, একা খেলে সাহস।",
    price_bdt: 249, compare_price_bdt: 349,
    images: ["/products/ob-chili.svg"],
    variants: [
      { label: "হালকা ঝাল", priceDelta: 0 },
      { label: "আগুন মোড 🔥", priceDelta: 50 },
    ],
    stock: 80, badge_bn: "😈 প্র্যাংক ক্লাসিক", is_featured: true, sort: 5,
  }),
  P({
    id: "p-ob-6", tenant: "oddbox", category_id: "c-ob-combo", slug: "future-gift",
    title_bn: "সম্পূর্ণ খালি বক্স — “ভবিষ্যতের উপহার”",
    tagline_bn: "দার্শনিকদের জন্য বিশেষ প্যাকেজ",
    description_bn: "বক্সটি সম্পূর্ণ খালি। কারণ সবচেয়ে বড় উপহার হলো আশা।",
    price_bdt: 99, compare_price_bdt: 149,
    images: ["/products/ob-empty-box.svg"], badge_bn: "🧠 দার্শনিক পছন্দ", sort: 6,
  }),
  P({
    id: "p-ob-7", tenant: "oddbox", category_id: "c-ob-farm", slug: "onion-tears",
    title_bn: "পেঁয়াজ টিয়ার্স বুকে (১০টি পেঁয়াজ)",
    tagline_bn: "কাঁদানো আর দাম বাড়ানো — দুটোই গ্যারান্টেড",
    description_bn: "দেশের যেখানে পেঁয়াজের দাম আবেগের চেয়েও ঊর্ধ্বে, সেখানে ১০টি ফ্রেশ পেঁয়াজের বুকে আসলেই রাজকীয় উপহার।",
    price_bdt: 179, compare_price_bdt: 259,
    images: ["/products/ob-onion.svg"], stock: 70, sort: 7,
  }),
  P({
    id: "p-ob-8", tenant: "oddbox", category_id: "c-ob-combo", slug: "donkey-full-pack",
    title_bn: "সম্পূর্ণ গাধা প্যাক",
    tagline_bn: "গোবর + ঘাস + বাতাস — ফুল সেট, ফুল মজা",
    description_bn: "এক বন্ধুকে তিন ধরনের সম্মান একসাথে! জন্মদিনে এটা পেলে বুঝতে হবে — বন্ধুরা আর রেহাই দেবে না।",
    price_bdt: 599, compare_price_bdt: 899,
    images: ["/products/ob-combo.svg"], stock: 30, badge_bn: "💎 বেস্ট ভ্যালু", is_featured: true, sort: 8,
  }),

  P({
    id: "p-mb-1", tenant: "mithai", category_id: "c-m-sweets", slug: "misti-doi",
    title_bn: "টাটকা মিষ্টি দই",
    tagline_bn: "প্রতিদিন ভোরে টবে জমে, দুপুরে ঘরে পৌঁছায়",
    description_bn:
      "ঘি-মাখা উপরের লেয়ার, নরম ছানার ভিতরে টক-মিষ্টি সমতা। প্রতিদিন সকালে মাটির ভাঁড়ে জমানো হয় সীমিত সংখ্যক দই — শেষ হলে আগামীকাল অপেক্ষা।",
    price_bdt: 250, compare_price_bdt: 300,
    images: ["/products/mb-doi.svg"],
    variants: [
      { label: "৫০০ গ্রাম (মাটির ভাঁড়)", priceDelta: 0 },
      { label: "১ কেজি (মাটির ভাঁড়)", priceDelta: 230 },
    ],
    stock: 40, badge_bn: "🆕 আজকের ব্যাচ", is_featured: true, sort: 1,
  }),
  P({
    id: "p-mb-2", tenant: "mithai", category_id: "c-m-dairy", slug: "gawa-ghee",
    title_bn: "ঘানি ভাঙা খাঁটি গরুর ঘি",
    tagline_bn: "এক চামচে গ্রামবাংলার সকাল",
    description_bn: "দেশি গরুর দুধের সর থেকে, ঐতিহ্যবাহী ঘানিতে ভাঙা খাঁটি ঘি। কোনো মেশানো তেল নেই।",
    price_bdt: 1250, compare_price_bdt: 1450,
    images: ["/products/mb-ghee.svg"],
    variants: [
      { label: "৫০০ গ্রাম", priceDelta: 0 },
      { label: "১ কেজি", priceDelta: 1150 },
    ],
    stock: 25, is_featured: true, sort: 2,
  }),
  P({
    id: "p-mb-3", tenant: "mithai", category_id: "c-m-sweets", slug: "roshogolla",
    title_bn: "নরম রসগোল্লা (১২ পিস)",
    tagline_bn: "চিনির সিরায় ভেসে থাকা ছানার তুলো",
    description_bn: "হালকা চিবালেই গলে যায় — এমন নরম রসগোল্লা। বিকেলের দুধচা-র সেরা সঙ্গী।",
    price_bdt: 380, compare_price_bdt: 450,
    images: ["/products/mb-roshogolla.svg"],
    variants: [
      { label: "১২ পিস", priceDelta: 0 },
      { label: "২৫ পিস", priceDelta: 400 },
    ],
    stock: 35, is_featured: true, sort: 3,
  }),
  P({
    id: "p-mb-4", tenant: "mithai", category_id: "c-m-sweets", slug: "nolen-gurer-sandesh",
    title_bn: "নলেন গুড়ের সন্দেশ",
    tagline_bn: "শীতের সকালের সেরা মিষ্টি, এখন সারাবছর",
    description_bn: "খেজুর গাছের নলেন গুড়ের গন্ধে যেন পুরো শীতকাল মুড়িয়ে রাখা।",
    price_bdt: 480, compare_price_bdt: 550,
    images: ["/products/mb-sandesh.svg"],
    variants: [
      { label: "১২ পিস", priceDelta: 0 },
      { label: "২৪ পিস", priceDelta: 440 },
    ],
    stock: 30, sort: 4,
  }),
  P({
    id: "p-mb-5", tenant: "mithai", category_id: "c-m-sweets", slug: "chanar-payesh",
    title_bn: "ছানার পায়েস",
    tagline_bn: "দাদির রান্নার সেই চেনা স্বাদ",
    description_bn: "ঘন দুধে ছানা ফুটিয়ে, এলাচ আর কিশমিশ ছড়িয়ে তৈরি ঘরোয়া ছানার পায়েস।",
    price_bdt: 580, compare_price_bdt: 650,
    images: ["/products/mb-payesh.svg"],
    variants: [
      { label: "৫০০ গ্রাম", priceDelta: 0 },
      { label: "১ কেজি", priceDelta: 520 },
    ],
    stock: 20, sort: 5,
  }),
  P({
    id: "p-mb-6", tenant: "mithai", category_id: "c-m-honey", slug: "sundarban-honey",
    title_bn: "সুন্দরবনের খাঁটি মধু",
    tagline_bn: "মৌয়ালের হাত থেকে সোজা বোতলে",
    description_bn:
      "প্রতি বর্ষার শুরুতে সুন্দরবনের মৌয়ালরা খালি হাতে মৌচাক সংগ্রহ করেন। ছাঁকনে ছাঁকা, কোনো চিনি বা মোলাস মেশানো নয়।",
    price_bdt: 1850, compare_price_bdt: 2200,
    images: ["/products/mb-honey.svg"],
    variants: [
      { label: "৫০০ গ্রাম", priceDelta: 0 },
      { label: "১ কেজি", priceDelta: 1600 },
    ],
    stock: 18, badge_bn: "🍯 সীমিত স্টক", is_featured: true, sort: 6,
  }),
  P({
    id: "p-mb-7", tenant: "mithai", category_id: "c-m-fruits", slug: "himsagar-mango",
    title_bn: "হিমসাগর আম (৫ কেজি বক্স)",
    tagline_bn: "মৌসুমের রাজা, সরাসরি সাতক্ষীরা থেকে",
    description_bn:
      "কার্বাইডমুক্ত, গাছপাকা হিমসাগর — একবার খেলে বাজারের আম ভুলে যাবেন। মৌসুম: জুন–আগস্ট।",
    price_bdt: 1250, compare_price_bdt: 1500,
    images: ["/products/mb-mango.svg"], stock: 45,
    badge_bn: "🥭 মৌসুমি", is_featured: true, sort: 7,
    seasonal_from: "2026-06-01", seasonal_to: "2026-08-15",
  }),
  P({
    id: "p-mb-8", tenant: "mithai", category_id: "c-m-dairy", slug: "malai-cream-roll",
    title_bn: "মালাই ক্রিম রোল",
    tagline_bn: "বাইরে মোচা-ক্রাঞ্চি, ভিতরে ঠান্ডা মালাই",
    description_bn: "লেয়ারে লেয়ারে কুরকুরে পেস্ট্রি, ভিতরে ঘন দুধের মালাই ক্রিম।",
    price_bdt: 520, compare_price_bdt: 600,
    images: ["/products/mb-creamroll.svg"],
    variants: [
      { label: "৬ পিস", priceDelta: 0 },
      { label: "১২ পিস", priceDelta: 480 },
    ],
    stock: 22, sort: 8,
  }),
]
