import { SHOP_ID } from "@/lib/tenants"
import { getShopSettings } from "@/lib/data"
import CheckoutForm from "@/components/store/CheckoutForm"

export const metadata = { title: "চেকআউট" }

export default async function CheckoutPage() {
  const settings = await getShopSettings()
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-6 md:py-14">
      <h1 className="font-display text-3xl font-extrabold text-ink md:text-4xl">
        🧾 অর্ডার সম্পন্ন করুন
      </h1>
      <p className="mt-2 text-sm text-muted">
        নিচের ছোট্ট ফর্মটি পূরণ করুন, রেজিস্ট্রেশন লাগবে না। পেমেন্ট: ক্যাশ অন ডেলিভারি অথবা বিকাশ।
      </p>
      <CheckoutForm tenantSlug={SHOP_ID} settings={settings} />
    </div>
  )
}
