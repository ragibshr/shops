import { headers } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { getShopSettings } from "@/lib/data"
import { SHOP_ID } from "@/lib/tenants"
import ChatOrderForm from "@/components/admin/ChatOrderForm"
import type { Product } from "@/lib/types"

export default async function NewChatOrderPage() {
  const sb = await createClient()
  const [{ data: products }, { data: categories }, { data: sections }, settings, h] =
    await Promise.all([
      sb.from("products").select("*").eq("tenant", SHOP_ID).eq("is_active", true).order("sort"),
      sb.from("categories").select("id,section_id").eq("tenant", SHOP_ID),
      sb.from("sections").select("id,status"),
      getShopSettings(),
      headers(),
    ])

  const live = new Set((sections ?? []).filter((s) => s.status === "live").map((s) => s.id))
  const sectionOf = new Map((categories ?? []).map((c) => [c.id, c.section_id]))
  const sellable = ((products as Product[]) ?? []).filter((p) => {
    const sec = p.category_id ? sectionOf.get(p.category_id) : null
    return !sec || live.has(sec)
  })

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold md:text-3xl">💬 চ্যাট থেকে নতুন অর্ডার</h1>
        <p className="mt-1 text-sm text-muted">
          WhatsApp, Messenger, Instagram বা ফোনে আসা অর্ডার এখানে তুলুন। ওয়েবসাইটের অর্ডারের মতোই
          দাম, স্টক আর ডেলিভারি ফি হিসাব হবে, আর অর্ডার তালিকায় উৎস দেখাবে।
        </p>
      </div>
      <ChatOrderForm
        products={sellable}
        settings={settings}
        siteHost={h.get("host") ?? "oddboxbd.shop"}
      />
    </div>
  )
}
