import Link from "next/link"
import { Mail, MessageCircle, Phone } from "lucide-react"
import type { Tenant } from "@/lib/tenants"

export default function Footer({ tenant }: { tenant: Tenant }) {
  return (
    <footer id="contact" className="mt-16 border-t border-line bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-3 md:px-6">
        <div>
          <p className="font-display text-2xl font-extrabold text-ink">
            {tenant.nameBn}
          </p>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted">
            {tenant.metaDescriptionBn}
          </p>
          <p className="mt-4 rounded-2xl bg-surface-2 px-4 py-3 text-xs italic text-muted">
            {tenant.footerNoteBn}
          </p>
        </div>

        <div>
          <p className="mb-4 font-display text-sm font-bold uppercase tracking-wider text-ink">
            যোগাযোগ
          </p>
          <ul className="space-y-3 text-sm">
            <li>
              <a
                href={`tel:${tenant.supportPhone}`}
                className="flex items-center gap-2.5 text-muted transition-colors hover:text-primary"
              >
                <Phone size={15} className="text-primary" />
                {tenant.supportPhone}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${tenant.supportEmail}`}
                className="flex items-center gap-2.5 break-all text-muted transition-colors hover:text-primary"
              >
                <Mail size={15} className="text-primary" />
                {tenant.supportEmail}
              </a>
            </li>
            <li>
              <a
                href={`https://wa.me/${tenant.whatsappNumber.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-muted transition-colors hover:text-primary"
              >
                <MessageCircle size={15} className="text-primary" />
                WhatsApp-এ মেসেজ দিন
              </a>
            </li>
            <li>
              <a
                href={tenant.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-muted transition-colors hover:text-primary"
              >
                <span className="flex h-[15px] w-[15px] items-center justify-center rounded-[4px] bg-primary text-[10px] font-black text-white">
                  f
                </span>
                ফেসবুক পেজ
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className="mb-4 font-display text-sm font-bold uppercase tracking-wider text-ink">
            দরকারি লিংক
          </p>
          <ul className="space-y-3 text-sm">
            <li><Link href="/shop" className="text-muted hover:text-primary">সব পণ্য</Link></li>
            <li><Link href="/track" className="text-muted hover:text-primary">অর্ডার ট্র্যাক করুন</Link></li>
            <li><Link href="/checkout" className="text-muted hover:text-primary">চেকআউট</Link></li>
            <li>
              <Link href="/admin/login" className="text-xs text-muted/50 hover:text-muted">
                অ্যাডমিন প্যানেল
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line py-5 text-center text-xs text-muted">
        © {new Date().getFullYear()} {tenant.legalName} · oddboxbd.shop · mithebangla.shop —
        {" "}সর্বস্বত্ব সংরক্ষিত · 💵 ক্যাশ অন ডেলিভারি
      </div>
    </footer>
  )
}
