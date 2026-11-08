import type { ShopSettings } from "@/lib/types"

export interface ProfileRow {
  id: string
  full_name: string
  role: "owner" | "moderator"
  assigned_tenants: string[]
  created_at: string
}

export interface TenantSettingsRow extends ShopSettings {
  id: string
  name_bn: string
}
