export type TenantSlug = "oddbox" | "mithai"

export interface MallHotspot {
  id: string
  label: string
  categorySlug: string
  emoji: string
  area: { left: string; top: string; width: string; height: string }
}

export interface TenantMall {
  exteriorImage: string
  interiorImage: string
  doorHotspot: { left: string; top: string; width: string; height: string }
  racks: MallHotspot[]
}

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
  categoriesTitle: string
  categoriesSub: string
  trustItems: { emoji: string; title: string; sub: string }[]
  storyBlock?: { kicker: string; title: string; body: string }
}

export interface Tenant {
  slug: TenantSlug
  domain: string
  wwwDomain: string
  nameBn: string
  legalName: string
  taglineBn: string
  metaDescriptionBn: string
  announcementBn: string | null
  home: HomeCopy
  mall: TenantMall | null
  footerNoteBn: string
  supportPhone: string
  supportEmail: string
  facebookUrl: string
  whatsappNumber: string
}

export const TENANTS: Record<TenantSlug, Tenant> = {
  oddbox: {
    slug: "oddbox",
    domain: "oddboxbd.shop",
    wwwDomain: "www.oddboxbd.shop",
    nameBn: "অডবক্স বিডি",
    legalName: "OddBox BD",
    taglineBn: "সেরা মজার উপহার!",
    metaDescriptionBn:
      "বাংলাদেশের সবচেয়ে মজার গিফট শপ — ফ্রেশ গোবর, ব্যাগে বিশুদ্ধ বাতাস, গাধা বন্ধুর জন্য ঘাসের বক্স। ক্যাশ অন ডেলিভারিতে পুরো দেশে ডেলিভারি!",
    announcementBn:
      "🚚 ১৫০০৳+ অর্ডারে ডেলিভারি ফ্রি! — বন্ধুকে ঝাঁকি দিতে দেরি না করুন 😄",
    home: {
      heroKicker: "🤣 দেশের সেরা মজার গিফট শপ",
      heroTitle: "উপহার যা হাসি দেয়,\nআর একটু বকা-ও খাওয়ায়!",
      heroSub:
        "ফ্রেশ গোবর থেকে ব্যাগে বাঁধা বিশুদ্ধ বাতাস — যেই বন্ধুকে গরু বা গাধা বলতে ইচ্ছে করে, তাকে দিন মনের মতো উপহার। পুরোপুরি মজা, একদম আস্ত প্যাকেজিং!",
      ctaPrimary: "🎁 উপহার দেখুন",
      ctaSecondary: "মজা কীভাবে কাজ করে?",
      heroStickers: ["🐄", "💨", "🌿", "🎁", "🧅", "🌶️"],
      marqueeJokes: [
        "🐄 গরু বন্ধুর জন্য ফ্রেশ গোবর",
        "💨 ব্যাগে বিশুদ্ধ ঢাকার বাতাস",
        "🌿 গাধা বান্ধবীর জন্য ঘাসের বক্স",
        "📦 ১০০% লিক-প্রুফ প্যাকেজিং",
        "🚚 সারা দেশে ক্যাশ অন ডেলিভারি",
        "😂 রিফান্ড নয় — হাসির গ্যারান্টি",
      ],
      featuredTitle: "এই সপ্তাহের ভাইরাল উপহার",
      featuredSub: "যেগুলো নিয়ে পুরো গ্রুপ চ্যাটে মেলা হাসি নিশ্চিত",
      categoriesTitle: "কী ধরনের মজা চান?",
      categoriesSub: "প্রতিটি বক্সে থাকে একটা ছোট্ট ষড়যন্ত্র",
      trustItems: [
        { emoji: "📦", title: "ঝামেলাহীন অর্ডার", sub: "রেজিস্ট্রেশন লাগবে না — কার্টে দিন, ফর্ম পূরণ করুন, শেষ!" },
        { emoji: "💵", title: "ক্যাশ অন ডেলিভারি", sub: "হাতে পেয়ে, হাসতে হাসতে পেমেন্ট" },
        { emoji: "🎁", title: "ফ্রি মজার নোট", sub: "পাঠাবেন নিজের লেখা মজার মেসেজসহ" },
      ],
    },
    footerNoteBn: "সতর্কতা: এই শপের দায়িত্বে আমরা নই, আপনার হাসির দায়িত্বে আপনি 😄",
    supportPhone: "+8801711000000",
    supportEmail: "hello@oddboxbd.shop",
    facebookUrl: "https://facebook.com/oddboxbd",
    whatsappNumber: "+8801711000000",
    mall: null,
  },
  mithai: {
    slug: "mithai",
    domain: "mithebangla.shop",
    wwwDomain: "www.mithebangla.shop",
    nameBn: "মিষ্টি বাংলা",
    legalName: "Mithe Bangla",
    taglineBn: "খাঁটি স্বাদ, টাটকা মিষ্টি",
    metaDescriptionBn:
      "ঘরে বসে অর্ডার করুন টাটকা মিষ্টি দই, খাঁটি ঘি, সুন্দরবনের মধু ও মৌসুমি আম। সারা বাংলাদেশে ক্যাশ অন ডেলিভারি।",
    announcementBn:
      "🍃 সুন্দরবনের খাঁটি মধু এখন স্টকে — সীমিত সংখ্যক বোতল!",
    home: {
      heroKicker: "🍯 খাঁটি ও টাটকার ঠিকানা",
      heroTitle: "মিষ্টির দেশ থেকে,\nসোজা আপনার ঘরে",
      heroSub:
        "টাটকা মিষ্টি দই, ঘানি-ভাঙা ঘি, সুন্দরবনের মৌমাছির মধু আর মৌসুমের সেরা আম — সব আসে সরাসরি উৎপাদকের কাছ থেকে, কোনো ভেজাল ছাড়াই।",
      ctaPrimary: "🍬 মিষ্টি দেখুন",
      ctaSecondary: "আমাদের গল্প",
      heroStickers: ["🍯", "🥭", "🍮", "🌾", "🧈", "🍬"],
      marqueeJokes: [],
      featuredTitle: "আজকের টাটকা বাছাই",
      featuredSub: "প্রতিদিন সকালে তৈরি, সন্ধ্যার আগে আপনার দরজায়",
      categoriesTitle: "কী খেতে ইচ্ছে করছে?",
      categoriesSub: "মৌসুম বদলায়, আমাদের তালিকাও বদলায়",
      trustItems: [
        { emoji: "🌾", title: "সরাসরি উৎপাদক", sub: "মধ্যস্বত্বভোগী নেই — গ্রামের হাট থেকে আপনার ঘরে" },
        { emoji: "🧪", title: "ভেজালমুক্তের প্রতিশ্রুতি", sub: "প্রতিটি ব্যাচ পরীক্ষিত, নাহলে টাকা ফেরত" },
        { emoji: "🚚", title: "দ্রুত ডেলিভারি", sub: "ঢাকায় ২৪ ঘণ্টা, ঢাকার বাইরে ৪৮–৭২ ঘণ্টা" },
      ],
      storyBlock: {
        kicker: "🌿 আমাদের গল্প",
        title: "সুন্দরবনের মুখ থেকে আপনার মুখে",
        body: "মৌয়ালরা ভোরের আলোয় সুন্দরবনের গভীরে মধু সংগ্রহ করেন, আর আমরা তা ছাঁকনে ছেঁকে পাঠাই আপনার ঠিকানায়। একইভাবে, দেশের সেরা মিষ্টান্নর হাতে তৈরি হয় প্রতিটি মিষ্টি — দুধ, চিনি, আর ধৈর্য ছাড়া কিছুই নয়।",
      },
    },
    mall: {
      exteriorImage: "/images/mithai/exterior.png",
      interiorImage: "/images/mithai/interior.png",
      doorHotspot: { left: "42%", top: "55%", width: "16%", height: "35%" },
      racks: [
        { id: "sweets", label: "মিষ্টি", categorySlug: "sweets", emoji: "🍮", area: { left: "5%", top: "20%", width: "22%", height: "45%" } },
        { id: "dairy", label: "দুগ্ধজাত", categorySlug: "dairy", emoji: "🧈", area: { left: "28%", top: "20%", width: "22%", height: "45%" } },
        { id: "honey", label: "মধু", categorySlug: "honey", emoji: "🍯", area: { left: "52%", top: "20%", width: "22%", height: "45%" } },
        { id: "fruits", label: "আম", categorySlug: "fruits", emoji: "🥭", area: { left: "76%", top: "20%", width: "22%", height: "45%" } },
      ],
    },
    footerNoteBn: "প্রতিটি অর্ডারে থাকে খাঁটির অঙ্গীকার — নাহলে টাকা ফেরত 🍃",
    supportPhone: "+8801811000000",
    supportEmail: "hello@mithebangla.shop",
    facebookUrl: "https://facebook.com/mithebangla",
    whatsappNumber: "+8801811000000",
  },
}

export const DELIVERY_ZONES = [
  { id: "inside_dhaka", labelBn: "ঢাকার ভিতরে", feeDefault: 70, etaBn: "২৪ ঘণ্টার মধ্যে" },
  { id: "outside_dhaka", labelBn: "ঢাকার বাইরে", feeDefault: 140, etaBn: "৪৮–৭২ ঘণ্টার মধ্যে" },
] as const

export type ZoneId = (typeof DELIVERY_ZONES)[number]["id"]
