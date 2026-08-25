import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import ProductForm from "@/components/admin/ProductForm"

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const sb = await createClient()
  const { data: product } = await sb.from("products").select("*").eq("id", id).maybeSingle()
  if (!product) notFound()

  const { data: categories } = await sb
    .from("categories")
    .select("*")
    .eq("tenant", product.tenant)
    .order("sort")

  return <ProductForm mode="edit" tenant={product.tenant} categories={categories ?? []} product={product} />
}
