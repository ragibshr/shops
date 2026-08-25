import { createClient } from "@/lib/supabase/server"
import { DEMO_CATEGORIES, DEMO_PRODUCTS } from "@/lib/demo-data"
import { isSeasonalActive } from "@/lib/utils"
import type { Category, Product } from "@/lib/types"

const hasSupabase = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
)

export function isLiveMode(): boolean {
  return hasSupabase
}

export async function getCategories(tenant: string): Promise<Category[]> {
  if (!hasSupabase) {
    return DEMO_CATEGORIES.filter((c) => c.tenant === tenant)
  }
  try {
    const sb = await createClient()
    const { data } = await sb
      .from("categories")
      .select("*")
      .eq("tenant", tenant)
      .order("sort")
    return data ?? []
  } catch {
    return DEMO_CATEGORIES.filter((c) => c.tenant === tenant)
  }
}

export async function getProducts(
  tenant: string,
  opts: { categorySlug?: string; featuredOnly?: boolean } = {},
): Promise<Product[]> {
  let products: Product[]
  if (!hasSupabase) {
    products = DEMO_PRODUCTS.filter((p) => p.tenant === tenant && p.is_active)
  } else {
    try {
      const sb = await createClient()
      let query = sb.from("products").select("*").eq("tenant", tenant).eq("is_active", true)
      if (opts.featuredOnly) query = query.eq("is_featured", true)
      const { data, error } = await query.order("sort")
      if (error || !data) return []
      products = data as Product[]
    } catch {
      products = DEMO_PRODUCTS.filter((p) => p.tenant === tenant && p.is_active)
    }
  }

  let result = products.filter((p) => isSeasonalActive(p.seasonal_from, p.seasonal_to))
  if (opts.categorySlug) {
    const cat = DEMO_CATEGORIES.find(
      (c) => c.tenant === tenant && c.slug === opts.categorySlug,
    )
    result = result.filter((p) => p.category_id === cat?.id)
  }
  if (opts.featuredOnly) result = result.filter((p) => p.is_featured)
  return result
}

export async function getProductBySlug(
  tenant: string,
  slug: string,
): Promise<Product | null> {
  let product: Product | null = null
  if (!hasSupabase) {
    product = DEMO_PRODUCTS.find((p) => p.tenant === tenant && p.slug === slug) ?? null
  } else {
    try {
      const sb = await createClient()
      const { data } = await sb
        .from("products")
        .select("*")
        .eq("tenant", tenant)
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle()
      product = (data as Product) ?? null
    } catch {
      product =
        DEMO_PRODUCTS.find((p) => p.tenant === tenant && p.slug === slug) ?? null
    }
  }
  if (!product) return null
  return isSeasonalActive(product.seasonal_from, product.seasonal_to) ? product : null
}
