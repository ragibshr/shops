import { getTenant } from "@/lib/tenant-server"
import Celebration from "@/components/store/Celebration"

export const metadata = { title: "অর্ডার সফল!" }

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ no?: string; total?: string }>
}) {
  const [{ no, total }, tenant] = await Promise.all([searchParams, getTenant()])
  return (
    <Celebration
      orderNo={no ?? ""}
      total={Number(total) || 0}
      whatsapp={tenant.whatsappNumber}
      isOddbox={tenant.slug === "oddbox"}
    />
  )
}
