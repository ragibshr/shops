"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import type { OrderSource, OrderStatus, PaymentMethod, SectionStatus } from "@/lib/types"
import { SHOP_ID } from "@/lib/tenants"

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

export async function updateOrderStatusAction(orderId: string, status: OrderStatus) {
  const session = await requireSession()

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

/** Owner marks a bKash payment as received (paid) or not found (failed). */
export async function verifyPaymentAction(orderId: string, outcome: "paid" | "failed") {
  const session = await requireSession()
  requireOwner(session)
  const sb = await createClient()
  const { error } = await sb.from("orders").update({ payment_status: outcome }).eq("id", orderId)
  if (!error) {
    await sb.from("audit_log").insert({
      actor: session.userId,
      action: "payment_" + outcome,
      entity: "orders",
      entity_id: orderId,
    })
  }
  revalidatePath("/admin/orders")
  revalidatePath("/admin")
}

/** Any staff member (owner or delivery team) can update stock. */
export async function setStockAction(productId: string, stock: number | null) {
  await requireSession()
  if (stock !== null && (!Number.isInteger(stock) || stock < 0)) {
    return { ok: false, error: "স্টক ০ বা তার বেশি পূর্ণসংখ্যা হতে হবে" }
  }
  const sb = await createClient()
  const { data, error } = await sb.rpc("set_stock", { p_product: productId, p_stock: stock })
  revalidatePath("/admin/stock")
  revalidatePath("/", "layout")
  if (error || !data?.ok) return { ok: false, error: error?.message ?? data?.error ?? "সমস্যা হয়েছে" }
  return { ok: true }
}

export async function updateSectionStatusAction(sectionId: string, status: SectionStatus) {
  const session = await requireSession()
  requireOwner(session)
  const sb = await createClient()
  const { error } = await sb.from("sections").update({ status }).eq("id", sectionId)
  revalidatePath("/admin/settings")
  revalidatePath("/", "layout")
  return { ok: !error, error: error?.message }
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
  if (session.profile.role !== "owner") return { ok: false, error: "শুধু মালিক পণ্য এডিট করতে পারবে" }

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
  if (session.profile.role !== "owner") return { ok: false, error: "শুধু মালিক পণ্য মুছতে পারবে" }
  const sb = await createClient()

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
  const tenants = ["oddbox"]

  if (!email || password.length < 6 || !fullName) {
    return { error: "সবগুলো ঘর সঠিকভাবে পূরণ করুন (পাসওয়ার্ড ন্যূনতম ৬ অক্ষর)" }
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
  cod_enabled: boolean
  bkash_enabled: boolean
  bkash_number: string | null
  bkash_account_type: "personal" | "agent" | "merchant"
  instagram_handle: string | null
  facebook_page: string | null
  messenger_username: string | null
}

export async function updateTenantSettingsAction(
  tenantId: string,
  input: TenantSettingsInput,
) {
  const session = await requireSession()
  requireOwner(session)
  if (!input.cod_enabled && !input.bkash_enabled) {
    return { ok: false, error: "অন্তত একটি পেমেন্ট পদ্ধতি চালু রাখুন" }
  }
  if (input.bkash_enabled && !/^01[3-9]\d{8}$/.test(input.bkash_number ?? "")) {
    return { ok: false, error: "বিকাশ চালু করতে সঠিক ১১ ডিজিটের বিকাশ নম্বর দিন" }
  }
  const sb = await createClient()
  const { error } = await sb
    .from("tenants")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", tenantId)
  revalidatePath("/admin/settings")
  revalidatePath("/", "layout")
  return { ok: !error, error: error?.message }
}

/* ---------- Social posts (reels on the homepage) ---------- */

export async function addSocialPostAction(
  url: string,
  captionBn: string | null,
): Promise<{ ok: boolean; error?: string }> {
  const session = await requireSession()
  requireOwner(session)
  const clean = url.trim()
  const platform = /instagram\.com\//.test(clean)
    ? "instagram"
    : /(facebook\.com|fb\.watch)\//.test(clean)
      ? "facebook"
      : null
  if (!platform || !clean.startsWith("https://")) {
    return { ok: false, error: "Instagram বা Facebook-এর রিল/পোস্টের পুরো লিংক দিন (https://…)" }
  }
  const sb = await createClient()
  const { error } = await sb
    .from("social_posts")
    .insert({ platform, url: clean, caption_bn: captionBn?.trim() || null })
  revalidatePath("/admin/settings")
  revalidatePath("/", "layout")
  return { ok: !error, error: error?.message }
}

export async function deleteSocialPostAction(id: number) {
  const session = await requireSession()
  requireOwner(session)
  const sb = await createClient()
  const { error } = await sb.from("social_posts").delete().eq("id", id)
  revalidatePath("/admin/settings")
  revalidatePath("/", "layout")
  return { ok: !error, error: error?.message }
}

/* ---------- Orders taken in chat (WhatsApp, Messenger, …) ---------- */

export interface ChatOrderInput {
  source: OrderSource
  customer_name: string
  phone: string
  district: string
  zone: "inside_dhaka" | "outside_dhaka"
  thana_area: string | null
  address: string
  notes_bn: string | null
  gift_message_bn: string | null
  payment_method: PaymentMethod
  bkash_sender: string | null
  bkash_trx_id: string | null
  items: { product_id: string; variant_label: string | null; qty: number }[]
}

/** Owner or delivery team records an order that came in by chat or phone. */
export async function createChatOrderAction(
  input: ChatOrderInput,
): Promise<{ ok: boolean; order_no?: string; total?: number; error?: string }> {
  const session = await requireSession()
  if (input.source === "website") return { ok: false, error: "উৎস বাছুন" }

  const sb = await createClient()
  const { data, error } = await sb.rpc("place_order", {
    payload: { ...input, tenant: SHOP_ID },
  })
  if (error) return { ok: false, error: error.message }
  if (!data?.ok) return { ok: false, error: data?.error ?? "unknown" }

  await sb.from("orders").update({ source: input.source }).eq("order_no", data.order_no)
  await sb.from("audit_log").insert({
    actor: session.userId,
    action: "chat_order_create",
    entity: "orders",
    entity_id: data.order_no,
    meta: { source: input.source },
  })
  revalidatePath("/admin/orders")
  revalidatePath("/admin")
  return { ok: true, order_no: data.order_no, total: data.total }
}
