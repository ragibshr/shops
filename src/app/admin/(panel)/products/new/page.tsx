import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getSession } from "@/lib/auth"
import { SHOP_ID } from "@/lib/tenants"
import ProductForm from "@/components/admin/ProductForm"

export default async function NewProductPage() {
  const session = await getSession()
  if (session?.profile.role !== "owner") redirect("/admin/stock")
  const sb = await createClient()
  const { data: categories } = await sb
    .from("categories")
    .select("*")
    .eq("tenant", SHOP_ID)
    .order("sort")

  return <ProductForm mode="new" tenant={SHOP_ID} categories={categories ?? []} />
}
