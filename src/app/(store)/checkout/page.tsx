import { getTenant } from "@/lib/tenant-server"
import CheckoutForm from "@/components/store/CheckoutForm"

export const metadata = { title: "চেকআউট" }

export default async function CheckoutPage() {
  const tenant = await getTenant()
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-6 md:py-14">
      <h1 className="font-display text-3xl font-extrabold text-ink md:text-4xl">
        🧾 অর্ডার সম্পন্ন করুন
      </h1>
      <p className="mt-2 text-sm text-muted">
        নিচের ছোট্ট ফর্মটি পূরণ করুন — কোনো রেজিস্ট্রেশন লাগবে না। পার্সেল হাতে পেয়ে টাকা দিলেই হবে!
      </p>
      <CheckoutForm tenantSlug={tenant.slug} isOddbox={tenant.slug === "oddbox"} />
    </div>
  )
}
