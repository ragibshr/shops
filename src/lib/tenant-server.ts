import { BRAND, type Tenant } from "@/lib/tenants"
import { getShopSettings } from "@/lib/data"

/** The brand, with the live announcement + WhatsApp from Admin → Settings. */
export async function getTenant(): Promise<Tenant> {
  const settings = await getShopSettings()
  return {
    ...BRAND,
    announcementBn: settings.announcement_bn,
    whatsappNumber: settings.whatsapp_number || BRAND.whatsappNumber,
  }
}
