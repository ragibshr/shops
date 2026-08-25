"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import type { OrderStatus } from "@/lib/types"

async function requireSession() {
  const session = await getSession()
  if (!session) throw new Error("unauthorized")
  return session
}

export interface LoginState {
  error?: string
}

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim()
  const password = String(formData.get("password") ?? "")

  const sb = await createClient()
  const { error } = await sb.auth.signInWithPassword({ email, password })
  if (error) return { error: "ইমেইল বা পাসওয়ার্ড ভুল!" }
  redirect("/admin")
}

export async function logoutAction() {
  const sb = await createClient()
  await sb.auth.signOut()
  redirect("/admin/login")
}

export async function updateOrderStatusAction(
  orderId: string,
  tenant: string,
  status: OrderStatus,
) {
  const session = await requireSession()
  const allowed =
    session.profile.role === "owner" ||
    session.profile.assigned_tenants.includes(tenant)
  if (!allowed) throw new Error("forbidden")

  const sb = await createClient()
  const { error } = await sb
    .from("orders")
    .update({ status })
    .eq("id", orderId)

  if (!error) {
    await sb.from("audit_log").insert({
      actor: session.userId,
      action: "order_status_update",
      entity: "orders",
      entity_id: orderId,
      meta: { status },
    })
  }
  revalidatePath("/admin/orders")
  revalidatePath("/admin")
}

export interface ProductInput {
  id?: string
  tenant: string
  category_id: string | null
  slug: string
  title_bn: string
  tagline_bn: string | null
  description_bn: string | null
  price_bdt: number
  compare_price_bdt: number | null
  images: string[]
  variants: { label: string; priceDelta: number }[]
  stock: number | null
  badge_bn: string | null
  is_active: boolean
  is_featured: boolean
  seasonal_from: string | null
  seasonal_to: string | null
  sort: number
}

export async function saveProductAction(input: ProductInput): Promise<{ ok: boolean; error?: string }> {
  const session = await requireSession()
  const allowed =
    session.profile.role === "owner" ||
    session.profile.assigned_tenants.includes(input.tenant)
  if (!allowed) return { ok: false, error: "অনুমতি নেই" }

  const sb = await createClient()

  if (input.id) {
    const { error } = await sb
      .from("products")
      .update(input)
      .eq("id", input.id)
    if (error) return { ok: false, error: error.message }
  } else {
    const { error } = await sb.from("products").insert(input)
    if (error) return { ok: false, error: error.message }
  }

  await sb.from("audit_log").insert({
    actor: session.userId,
    action: input.id ? "product_update" : "product_create",
    entity: "products",
    entity_id: input.slug,
    meta: { tenant: input.tenant },
  })

  revalidatePath("/admin/products")
  revalidatePath("/", "layout")
  return { ok: true }
}

export async function deleteProductAction(id: string) {
  const session = await requireSession()
  const sb = await createClient()
  const { data: product } = await sb
    .from("products")
    .select("tenant")
    .eq("id", id)
    .maybeSingle()
  if (!product) return { ok: false }
  const allowed =
    session.profile.role === "owner" ||
    session.profile.assigned_tenants.includes(product.tenant)
  if (!allowed) return { ok: false, error: "অনুমতি নেই" }

  const { error } = await sb.from("products").delete().eq("id", id)
  revalidatePath("/admin/products")
  revalidatePath("/", "layout")
  return { ok: !error, error: error?.message }
}

/* ---------- Owner-only ---------- */

function requireOwner(session: { profile: { role: string } }) {
  if (session.profile.role !== "owner") throw new Error("owner_only")
}

export async function inviteTeamMemberAction(
  _prev: unknown,
  formData: FormData,
): Promise<{ error?: string; success?: string }> {
  const session = await requireSession()
  requireOwner(session)

  const email = String(formData.get("email") ?? "").trim()
  const password = String(formData.get("password") ?? "")
  const fullName = String(formData.get("full_name") ?? "").trim()
  const role = String(formData.get("role") ?? "moderator")
  const tenants = formData.getAll("tenants").map(String)

  if (!email || password.length < 6 || !fullName) {
    return { error: "সবগুলো ঘর সঠিকভাবে পূরণ করুন (পাসওয়ার্ড ন্যূনতম ৬ অক্ষর)" }
  }
  if (!tenants.length) {
    return { error: "অন্তত একটি শপ বাছাই করুন" }
  }

  try {
    const admin = createAdminClient()
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })
    if (error) return { error: error.message }
    if (!data.user) return { error: "ইউজার তৈরি হয়নি" }

    const { error: profileError } = await admin
      .from("profiles")
      .update({ full_name: fullName, role, assigned_tenants: tenants })
      .eq("id", data.user.id)
    if (profileError) return { error: profileError.message }

    revalidatePath("/admin/team")
    return { success: `${fullName} যোগ হয়ে গেছে ✅` }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "সার্ভার সমস্যা" }
  }
}

export async function updateMemberAction(
  userId: string,
  values: { role?: "owner" | "moderator"; assigned_tenants?: string[] },
) {
  const session = await requireSession()
  requireOwner(session)
  const admin = createAdminClient()
  const { error } = await admin.from("profiles").update(values).eq("id", userId)
  revalidatePath("/admin/team")
  return { ok: !error }
}

export async function removeMemberAction(userId: string) {
  const session = await requireSession()
  requireOwner(session)
  if (userId === session.userId) return { ok: false, error: "নিজেকে মুছা যাবে না!" }
  const admin = createAdminClient()
  const { error } = await admin.auth.admin.deleteUser(userId)
  revalidatePath("/admin/team")
  return { ok: !error, error: error?.message }
}

export interface TenantSettingsInput {
  announcement_bn: string | null
  delivery_fee_inside: number
  delivery_fee_outside: number
  free_delivery_over: number | null
  whatsapp_number: string | null
}

export async function updateTenantSettingsAction(
  tenantId: string,
  input: TenantSettingsInput,
) {
  const session = await requireSession()
  requireOwner(session)
  const sb = await createClient()
  const { error } = await sb
    .from("tenants")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", tenantId)
  revalidatePath("/admin/settings")
  revalidatePath("/", "layout")
  return { ok: !error, error: error?.message }
}
