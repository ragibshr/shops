import type { OrderSource, ShopSettings } from "@/lib/types"

/** Digits only, Bangladesh numbers normalised to 8801XXXXXXXXX. */
export function waNumber(raw: string | null | undefined): string {
  const d = (raw ?? "").replace(/[^0-9]/g, "")
  if (d.startsWith("01") && d.length === 11) return "88" + d
  return d
}

export function whatsappLink(number: string | null | undefined, text?: string): string | null {
  const n = waNumber(number)
  if (!n) return null
  return `https://wa.me/${n}${text ? `?text=${encodeURIComponent(text)}` : ""}`
}

export function messengerLink(username: string | null | undefined, ref?: string): string | null {
  const u = (username ?? "").trim().replace(/^@/, "")
  if (!u) return null
  return `https://m.me/${encodeURIComponent(u)}${ref ? `?ref=${encodeURIComponent(ref)}` : ""}`
}

export function instagramLink(handle: string | null | undefined): string | null {
  const h = (handle ?? "").trim().replace(/^@/, "")
  return h ? `https://instagram.com/${encodeURIComponent(h)}` : null
}

export function facebookLink(page: string | null | undefined): string | null {
  const p = (page ?? "").trim()
  if (!p) return null
  if (/^https?:\/\//.test(p)) return p
  return `https://facebook.com/${encodeURIComponent(p)}`
}

export interface SocialLinks {
  whatsapp: string | null
  messenger: string | null
  instagram: string | null
  facebook: string | null
}

export function socialLinks(s: ShopSettings): SocialLinks {
  return {
    whatsapp: whatsappLink(s.whatsapp_number),
    messenger: messengerLink(s.messenger_username),
    instagram: instagramLink(s.instagram_handle),
    facebook: facebookLink(s.facebook_page),
  }
}

export const SOURCE_LABELS: Record<OrderSource, string> = {
  website: "🌐 ওয়েবসাইট",
  whatsapp: "🟢 WhatsApp",
  messenger: "🔵 Messenger",
  instagram: "📸 Instagram",
  facebook: "📘 Facebook",
  phone: "📞 ফোন কল",
  other: "✳️ অন্যান্য",
}
