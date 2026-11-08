"use client"

import { MessageCircle, Send } from "lucide-react"
import { useTenant } from "@/components/store/StoreProvider"

/** "Order on WhatsApp / ask on Messenger" for one product, with the product prefilled. */
export default function ChatOrderButtons({
  title,
  price,
  url,
  slug,
}: {
  title: string
  price: string
  url: string
  slug: string
}) {
  const { links } = useTenant()
  if (!links.whatsapp && !links.messenger) return null

  const text = `আসসালামু আলাইকুম! এই পণ্যটা অর্ডার করতে চাই:\n${title} (${price})\n${url}`

  return (
    <div className="mt-4 rounded-2xl border border-dashed border-line p-4">
      <p className="mb-2.5 text-xs font-semibold text-muted">
        ফর্ম পূরণ করতে চান না? চ্যাটেই অর্ডার দিন 👇
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {links.whatsapp && (
          <a
            href={`${links.whatsapp}?text=${encodeURIComponent(text)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-full bg-[#25D366] py-3 font-display text-sm font-bold text-white transition-transform hover:scale-[1.02]"
          >
            <MessageCircle size={17} /> WhatsApp-এ অর্ডার
          </a>
        )}
        {links.messenger && (
          <a
            href={`${links.messenger}${links.messenger.includes("?") ? "&" : "?"}ref=${encodeURIComponent(slug)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-full bg-[#0084FF] py-3 font-display text-sm font-bold text-white transition-transform hover:scale-[1.02]"
          >
            <Send size={16} /> Messenger-এ জিজ্ঞেস
          </a>
        )}
      </div>
    </div>
  )
}
