import { createClient } from "@/lib/supabase/server"
import type { ProfileRow } from "@/lib/admin-types"

export interface SessionInfo {
  userId: string
  email: string | undefined
  profile: ProfileRow
}

export async function getSession(): Promise<SessionInfo | null> {
  try {
    const sb = await createClient()
    const {
      data: { user },
    } = await sb.auth.getUser()
    if (!user) return null

    const { data: profile } = await sb
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle()

    if (!profile) return null
    return { userId: user.id, email: user.email, profile }
  } catch {
    return null
  }
}

export const STATUS_LABELS: Record<string, string> = {
  pending: "গ্রহণ হয়েছে",
  confirmed: "কনফার্মড",
  shipped: "পাঠানো হয়েছে",
  delivered: "ডেলিভারি সম্পন্ন",
  cancelled: "বাতিল",
}

export const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-600",
}
