import { headers } from "next/headers"
import { TENANTS, type Tenant, type TenantSlug } from "@/lib/tenants"

export async function getTenant(): Promise<Tenant> {
  const headerList = await headers()
  const slug = (headerList.get("x-tenant") ?? "oddbox") as TenantSlug
  return TENANTS[slug] ?? TENANTS.oddbox
}

export function getStaticTenant(slug: TenantSlug): Tenant {
  return TENANTS[slug]
}
