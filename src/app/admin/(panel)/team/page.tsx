import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getSession } from "@/lib/auth"
import TeamPanel from "@/components/admin/TeamPanel"

export default async function TeamPage() {
  const session = await getSession()
  if (session?.profile.role !== "owner") redirect("/admin")

  const sb = await createClient()
  const { data: members } = await sb.from("profiles").select("*").order("created_at")

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="font-display text-2xl font-extrabold md:text-3xl">👥 টিম ম্যানেজমেন্ট</h1>
      <p className="-mt-3 text-sm text-muted">
        মডারেটররা শুধু নির্বাচিত শপের অর্ডার ও পণ্য দেখবে। ভূমিকা ও শপ যেকোনো সময় বদলানো যাবে।
      </p>
      <TeamPanel members={members ?? []} />
    </div>
  )
}
