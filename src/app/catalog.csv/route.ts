import { getProducts } from "@/lib/data"
import { BRAND } from "@/lib/tenants"

/**
 * Product feed for Meta Commerce Manager (Facebook & Instagram Shop).
 * In Commerce Manager → Catalog → Data sources → Data feed → "Scheduled feed",
 * paste https://<your-domain>/catalog.csv and set it to refresh daily.
 * Only products in live sections are included.
 */
export async function GET(request: Request) {
  const origin = new URL(request.url).origin
  const products = await getProducts()

  const abs = (u: string) => (/^https?:\/\//.test(u) ? u : `${origin}${u.startsWith("/") ? "" : "/"}${u}`)
  const cell = (v: string | number | null | undefined) => {
    const s = String(v ?? "").replace(/\r?\n/g, " ").trim()
    return /[",]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }

  const header = [
    "id", "title", "description", "availability", "condition", "price",
    "sale_price", "link", "image_link", "additional_image_link", "brand",
  ]
  const rows = products.map((p) => {
    const onSale = p.compare_price_bdt !== null && p.compare_price_bdt > p.price_bdt
    return [
      p.slug,
      p.title_bn,
      p.description_bn || p.tagline_bn || p.title_bn,
      p.stock !== null && p.stock <= 0 ? "out of stock" : "in stock",
      "new",
      `${onSale ? p.compare_price_bdt : p.price_bdt} BDT`,
      onSale ? `${p.price_bdt} BDT` : "",
      `${origin}/product/${p.slug}`,
      p.images[0] ? abs(p.images[0]) : "",
      p.images.slice(1, 10).map(abs).join(","),
      BRAND.legalName,
    ].map(cell).join(",")
  })

  return new Response([header.join(","), ...rows].join("\n") + "\n", {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  })
}
