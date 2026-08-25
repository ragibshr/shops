export interface VariantOption {
  label: string
  priceDelta: number
}

export interface Product {
  id: string
  tenant: string
  slug: string
  category_id: string | null
  title_bn: string
  tagline_bn: string | null
  description_bn: string | null
  price_bdt: number
  compare_price_bdt: number | null
  images: string[]
  variants: VariantOption[] | null
  stock: number | null
  badge_bn: string | null
  is_active: boolean
  is_featured: boolean
  seasonal_from: string | null
  seasonal_to: string | null
  sort: number
}

export interface Category {
  id: string
  tenant: string
  slug: string
  name_bn: string
  emoji: string | null
  sort: number
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled"

export interface OrderRow {
  id: string
  tenant: string
  order_no: string
  customer_name: string
  phone: string
  address: string
  district: string
  thana_area: string | null
  notes_bn: string | null
  gift_message_bn: string | null
  subtotal_bdt: number
  delivery_fee_bdt: number
  total_bdt: number
  status: OrderStatus
  created_at: string
}

export interface OrderItemRow {
  id: string
  product_id: string | null
  title_snapshot_bn: string
  variant_label_bn: string | null
  unit_price_bdt: number
  qty: number
}

export interface CartItem {
  key: string
  productId: string
  tenant: string
  slug: string
  title: string
  price: number
  image: string | null
  variantLabel: string | null
  qty: number
}

export interface TrackedOrder extends OrderRow {
  items: OrderItemRow[]
}
