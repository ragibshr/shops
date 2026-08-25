export interface ProfileRow {
  id: string
  full_name: string
  role: "owner" | "moderator"
  assigned_tenants: string[]
  created_at: string
}

export interface TenantSettingsRow {
  id: string
  name_bn: string
  announcement_bn: string | null
  delivery_fee_inside: number
  delivery_fee_outside: number
  free_delivery_over: number | null
  whatsapp_number: string | null
}
