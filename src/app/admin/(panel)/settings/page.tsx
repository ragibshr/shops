import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getSession } from "@/lib/auth"
import { SHOP_ID } from "@/lib/tenants"
import SettingsPanel from "@/components/admin/SettingsPanel"
import SectionsPanel from "@/components/admin/SectionsPanel"
import SocialPostsPanel from "@/components/admin/SocialPostsPanel"
import type { Section, SocialPost } from "@/lib/types"

export default async function SettingsPage() {
  const session = await getSession()
  if (session?.profile.role !== "owner") redirect("/admin")

  const sb = await createClient()
  const [{ data: shop }, { data: sections }, { data: waitlistRows }, { data: posts }] = await Promise.all([
    sb.from("tenants").select("*").eq("id", SHOP_ID).maybeSingle(),
    sb.from("sections").select("*").order("sort"),
    sb.from("waitlist").select("section_id,phone").order("created_at"),
    sb.from("social_posts").select("*").order("created_at", { ascending: false }),
  ])

  const waitlist: Record<string, string[]> = {}
  for (const row of waitlistRows ?? []) {
    ;(waitlist[row.section_id] ??= []).push(row.phone)
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="font-display text-2xl font-extrabold md:text-3xl">⚙️ সেটিংস ও পেমেন্ট</h1>
      <SectionsPanel sections={(sections as Section[]) ?? []} waitlist={waitlist} />
      {shop ? (
        <SettingsPanel tenant={shop} />
      ) : (
        <p className="rounded-3xl border border-dashed border-line p-8 text-center text-muted">
          দোকানের সেটিংস পাওয়া যায়নি — 0002 মাইগ্রেশন চালানো হয়েছে কি?
        </p>
      )}
      <SocialPostsPanel posts={(posts as SocialPost[]) ?? []} />
    </div>
  )
}
