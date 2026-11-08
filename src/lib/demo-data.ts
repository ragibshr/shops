import type { Category, Product, Section, ShopSettings } from "@/lib/types"

export const DEMO_SECTIONS: Section[] = [
  { id: "fun", name_bn: "মজার উপহার", emoji: "🎁", tagline_bn: "বন্ধুকে হাসান, একটু জ্বালান — প্যাকেজিং একদম আসল", status: "live", sort: 1 },
  { id: "dairy", name_bn: "খাঁটি দুগ্ধজাত", emoji: "🥛", tagline_bn: "গাওয়া ঘি, টক-মিষ্টি দই — খামার থেকে সোজা ঘরে", status: "coming_soon", sort: 2 },
  { id: "mango", name_bn: "মৌসুমি আম", emoji: "🥭", tagline_bn: "গাছপাকা, কার্বাইডমুক্ত — বাছাই করে বাক্সে", status: "coming_soon", sort: 3 },
]

export const DEMO_SETTINGS: ShopSettings = {
  announcement_bn: "🚚 ১৫০০৳+ অর্ডারে ডেলিভারি ফ্রি!",
  delivery_fee_inside: 70,
  delivery_fee_outside: 140,
  free_delivery_over: 1500,
  whatsapp_number: "+8801711000000",
  cod_enabled: true,
  bkash_enabled: true,
  bkash_number: "01711000000",
  bkash_account_type: "personal",
}

export const DEMO_CATEGORIES: Category[] = [
  { id: "c-ob-farm", tenant: "oddbox", slug: "farm", name_bn: "ফার্ম সিরিজ", emoji: "🐄", sort: 1, section_id: "fun" },
  { id: "c-ob-air", tenant: "oddbox", slug: "air", name_bn: "বাতাস সিরিজ", emoji: "💨", sort: 2, section_id: "fun" },
  { id: "c-ob-donkey", tenant: "oddbox", slug: "donkey", name_bn: "গাধা স্পেশাল", emoji: "🌿", sort: 3, section_id: "fun" },
  { id: "c-ob-combo", tenant: "oddbox", slug: "combo", name_bn: "কম্বো বক্স", emoji: "🎁", sort: 4, section_id: "fun" },
  { id: "c-ob-ghee", tenant: "oddbox", slug: "ghee", name_bn: "ঘি ও মাখন", emoji: "🧈", sort: 10, section_id: "dairy" },
  { id: "c-ob-doi", tenant: "oddbox", slug: "doi", name_bn: "দই", emoji: "🍮", sort: 11, section_id: "dairy" },
  { id: "c-ob-mango", tenant: "oddbox", slug: "mango", name_bn: "আম", emoji: "🥭", sort: 20, section_id: "mango" },
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
    id: "p-ob-d1", tenant: "oddbox", category_id: "c-ob-ghee", slug: "gawa-ghee",
    title_bn: "খাঁটি গাওয়া ঘি",
    tagline_bn: "দেশি গরুর দুধের সর থেকে জ্বাল দেওয়া",
    description_bn:
      "গ্রামের খামারের দেশি গরুর দুধের সর জমিয়ে, ধীরে জ্বাল দিয়ে তৈরি। কোনো ডালডা, পাম অয়েল বা রং মেশানো নয়। কাচের বয়ামে প্যাক করা।",
    price_bdt: 850, compare_price_bdt: 950,
    images: ["/products/mb-ghee.svg"],
    variants: [
      { label: "৫০০ গ্রাম", priceDelta: 0 },
      { label: "১ কেজি", priceDelta: 800 },
    ],
    stock: 30, badge_bn: "🧈 খামার থেকে", is_featured: true, sort: 20,
  }),
  P({
    id: "p-ob-d2", tenant: "oddbox", category_id: "c-ob-doi", slug: "mishti-doi",
    title_bn: "বগুড়ার মিষ্টি দই",
    tagline_bn: "মাটির সরায় জমানো, ঘন আর মোলায়েম",
    description_bn: "খাঁটি দুধ ঘন করে জ্বাল দিয়ে মাটির সরায় জমানো মিষ্টি দই। ঢাকার ভিতরে ২৪ ঘণ্টায় ডেলিভারি।",
    price_bdt: 380,
    images: ["/products/mb-doi.svg"],
    variants: [
      { label: "১ কেজি সরা", priceDelta: 0 },
      { label: "২ কেজি সরা", priceDelta: 360 },
    ],
    stock: 20, sort: 21,
  }),
  P({
    id: "p-ob-m1", tenant: "oddbox", category_id: "c-ob-mango", slug: "himsagar-5kg",
    title_bn: "হিমসাগর আম (৫ কেজি)",
    tagline_bn: "মৌসুমের রাজা, সাতক্ষীরা থেকে",
    description_bn: "কার্বাইডমুক্ত, গাছপাকা হিমসাগর। বাছাই করে কাগজে মুড়িয়ে নরম বাক্সে পাঠানো হয়।",
    price_bdt: 1250, compare_price_bdt: 1500,
    images: ["/products/mb-mango.svg"], stock: 40,
    badge_bn: "🥭 মৌসুমি", is_featured: true, sort: 30,
  }),
  P({
    id: "p-ob-m2", tenant: "oddbox", category_id: "c-ob-mango", slug: "langra-5kg",
    title_bn: "ল্যাংড়া আম (৫ কেজি)",
    tagline_bn: "আঁশহীন, রসালো, মিষ্টি",
    description_bn: "রাজশাহী-চাঁপাইয়ের বাগান থেকে সরাসরি। পাকা অবস্থায় বাছাই করা।",
    price_bdt: 1150, compare_price_bdt: 1400,
    images: ["/products/mb-mango.svg"], stock: 40, sort: 31,
  }),
]
