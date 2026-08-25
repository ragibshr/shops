import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getSession } from "@/lib/auth"
import SettingsPanel from "@/components/admin/SettingsPanel"

export default async function SettingsPage() {
  const session = await getSession()
  if (session?.profile.role !== "owner") redirect("/admin")

  const sb = await createClient()
  const { data: tenants } = await sb.from("tenants").select("*").order("id")

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="font-display text-2xl font-extrabold md:text-3xl">⚙️ শপ সেটিংস</h1>
      <p className="-mt-3 text-sm text-muted">
        ঘোষণা বার, ডেলিভারি ফি ও যোগাযোগের তথ্য — দুই শপেরই আলাদা নিয়ন্ত্রণ।
      </p>
      <div className="space-y-6">
        {(tenants ?? []).map((t) => (
          <SettingsPanel key={t.id} tenant={t} />
        ))}
      </div>
    </div>
  )
}
