import { cache } from "react"
import { connection } from "next/server"
import { createClient } from "@/lib/supabase/server"
import {
  DEMO_CATEGORIES,
  DEMO_PRODUCTS,
  DEMO_SECTIONS,
  DEMO_SETTINGS,
} from "@/lib/demo-data"
import { isSeasonalActive } from "@/lib/utils"
import { SHOP_ID } from "@/lib/tenants"
import type { Category, Product, Section, ShopSettings } from "@/lib/types"

const hasSupabase = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
)

export function isLiveMode(): boolean {
  return hasSupabase
}

/**
 * Live data must be read per request (never baked in at build time).
 * Called OUTSIDE try/catch so Next's dynamic-rendering signal isn't swallowed.
 */
async function liveRequest(): Promise<boolean> {
  if (!hasSupabase) return false
  await connection()
  return true
}

/* ---------- settings ---------- */

export const getShopSettings = cache(async (): Promise<ShopSettings> => {
  if (!(await liveRequest())) return DEMO_SETTINGS
  try {
    const sb = await createClient()
    const { data } = await sb.from("tenants").select("*").eq("id", SHOP_ID).maybeSingle()
    if (!data) return DEMO_SETTINGS
    return {
      announcement_bn: data.announcement_bn ?? null,
      delivery_fee_inside: data.delivery_fee_inside ?? 70,
      delivery_fee_outside: data.delivery_fee_outside ?? 140,
      free_delivery_over: data.free_delivery_over ?? null,
      whatsapp_number: data.whatsapp_number ?? null,
      cod_enabled: data.cod_enabled ?? true,
      bkash_enabled: Boolean(data.bkash_enabled && data.bkash_number),
      bkash_number: data.bkash_number ?? null,
      bkash_account_type: data.bkash_account_type ?? "personal",
    }
  } catch {
    return DEMO_SETTINGS
  }
})

/* ---------- sections & categories ---------- */

export const getSections = cache(async (): Promise<Section[]> => {
  if (!(await liveRequest())) return DEMO_SECTIONS
  try {
    const sb = await createClient()
    const { data } = await sb.from("sections").select("*").order("sort")
    return (data as Section[]) ?? []
  } catch {
    return DEMO_SECTIONS
  }
})

/** Sections customers can see (live + coming soon). */
export async function getVisibleSections(): Promise<Section[]> {
  return (await getSections()).filter((s) => s.status !== "hidden")
}

export const getCategories = cache(async (): Promise<Category[]> => {
  if (!(await liveRequest())) return DEMO_CATEGORIES
  try {
    const sb = await createClient()
    const { data } = await sb
      .from("categories")
      .select("*")
      .eq("tenant", SHOP_ID)
      .order("sort")
    return (data as Category[]) ?? []
  } catch {
    return DEMO_CATEGORIES
  }
})

/** Category ids whose section is live (or that have no section). */
async function sellableCategoryIds(): Promise<Set<string | null>> {
  const [sections, categories] = await Promise.all([getSections(), getCategories()])
  const live = new Set(sections.filter((s) => s.status === "live").map((s) => s.id))
  const ids = new Set<string | null>([null])
  for (const c of categories) {
    if (!c.section_id || live.has(c.section_id)) ids.add(c.id)
  }
  return ids
}

/* ---------- products ---------- */

const getAllActiveProducts = cache(async (): Promise<Product[]> => {
  if (!(await liveRequest())) return DEMO_PRODUCTS.filter((p) => p.is_active)
  try {
    const sb = await createClient()
    const { data, error } = await sb
      .from("products")
      .select("*")
      .eq("tenant", SHOP_ID)
      .eq("is_active", true)
      .order("sort")
    if (error || !data) return []
    return data as Product[]
  } catch {
    return []
  }
})

/**
 * Products customers can buy right now. Products in "coming soon" sections
 * are excluded unless `includeUpcoming` is set (for teaser previews).
 */
export async function getProducts(
  opts: {
    sectionId?: string
    categorySlug?: string
    featuredOnly?: boolean
    includeUpcoming?: boolean
  } = {},
): Promise<Product[]> {
  const [products, categories, sellable] = await Promise.all([
    getAllActiveProducts(),
    getCategories(),
    sellableCategoryIds(),
  ])

  let result = products.filter((p) => isSeasonalActive(p.seasonal_from, p.seasonal_to))
  if (!opts.includeUpcoming) result = result.filter((p) => sellable.has(p.category_id))

  if (opts.sectionId) {
    const ids = new Set(
      categories.filter((c) => c.section_id === opts.sectionId).map((c) => c.id),
    )
    result = result.filter((p) => p.category_id && ids.has(p.category_id))
  }
  if (opts.categorySlug) {
    const cat = categories.find((c) => c.slug === opts.categorySlug)
    result = result.filter((p) => p.category_id === cat?.id)
  }
  if (opts.featuredOnly) result = result.filter((p) => p.is_featured)
  return result
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const [products, sellable] = await Promise.all([getAllActiveProducts(), sellableCategoryIds()])
  const product = products.find((p) => p.slug === slug) ?? null
  if (!product) return null
  if (!sellable.has(product.category_id)) return null
  return isSeasonalActive(product.seasonal_from, product.seasonal_to) ? product : null
}
