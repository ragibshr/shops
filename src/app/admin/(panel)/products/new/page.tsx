import { createClient } from "@/lib/supabase/server"
import ProductForm from "@/components/admin/ProductForm"

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ tenant?: string }>
}) {
  const { tenant } = await searchParams
  const current = tenant === "mithai" ? "mithai" : "oddbox"
  const sb = await createClient()
  const { data: categories } = await sb
    .from("categories")
    .select("*")
    .eq("tenant", current)
    .order("sort")

  return (
    <ProductForm
      mode="new"
      tenant={current}
      categories={categories ?? []}
    />
  )
}
