import { BRAND, type Tenant } from "@/lib/tenants"
import { getShopSettings } from "@/lib/data"
import { socialLinks } from "@/lib/social"

/** The brand, with live announcement, contact numbers and social links from Admin → Settings. */
export async function getTenant(): Promise<Tenant> {
  const settings = await getShopSettings()
  const whatsapp = settings.whatsapp_number || BRAND.whatsappNumber
  const links = socialLinks({ ...settings, whatsapp_number: whatsapp })
  return {
    ...BRAND,
    announcementBn: settings.announcement_bn,
    whatsappNumber: whatsapp,
    supportPhone: settings.whatsapp_number || BRAND.supportPhone,
    facebookUrl: links.facebook ?? BRAND.facebookUrl,
    links,
  }
}
