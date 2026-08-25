"use client"

import { useState, useTransition } from "react"
import { updateTenantSettingsAction } from "@/app/admin/actions"
import type { TenantSettingsRow } from "@/lib/admin-types"

const SHOP_META: Record<string, { label: string; emoji: string }> = {
  oddbox: { label: "অডবক্স বিডি", emoji: "🎁" },
  mithai: { label: "মিষ্টি বাংলা", emoji: "🍯" },
}

export default function SettingsPanel({ tenant }: { tenant: TenantSettingsRow }) {
  const [announcement, setAnnouncement] = useState(tenant.announcement_bn ?? "")
  const [feeInside, setFeeInside] = useState(String(tenant.delivery_fee_inside))
  const [feeOutside, setFeeOutside] = useState(String(tenant.delivery_fee_outside))
  const [freeOver, setFreeOver] = useState(tenant.free_delivery_over?.toString() ?? "")
  const [whatsapp, setWhatsapp] = useState(tenant.whatsapp_number ?? "")
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null)
  const [pending, startTransition] = useTransition()

  const meta = SHOP_META[tenant.id] ?? { label: tenant.id, emoji: "🏬" }

  const save = () =>
    startTransition(async () => {
      const res = await updateTenantSettingsAction(tenant.id, {
        announcement_bn: announcement.trim() || null,
        delivery_fee_inside: Number(feeInside) || 0,
        delivery_fee_outside: Number(feeOutside) || 0,
        free_delivery_over: freeOver ? Number(freeOver) : null,
        whatsapp_number: whatsapp.trim() || null,
      })
      setFeedback(
        res.ok
          ? { ok: true, msg: "সংরক্ষিত হয়েছে ✅" }
          : { ok: false, msg: res.error ?? "সমস্যা হয়েছে" },
      )
      setTimeout(() => setFeedback(null), 2500)
    })

  return (
    <section className="space-y-4 rounded-3xl border border-line bg-surface p-5 shadow-card md:p-7">
      <h2 className="font-display text-lg font-extrabold">
        {meta.emoji} {meta.label}{" "}
        <span className="ml-1 rounded-full bg-surface-2 px-2 py-0.5 align-middle font-mono text-[10px] font-normal text-muted">
          {tenant.id === "oddbox" ? "oddboxbd.shop" : "mithebangla.shop"}
        </span>
      </h2>

      <Field label="উপরের ঘোষণা বার (খালি = লুকাবে)">
        <input value={announcement} onChange={(e) => setAnnouncement(e.target.value)} className={input} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="ঢাকার ভিতরে ফি (৳)">
          <input type="number" min={0} value={feeInside} onChange={(e) => setFeeInside(e.target.value)} className={input} />
        </Field>
        <Field label="ঢাকার বাইরে ফি (৳)">
          <input type="number" min={0} value={feeOutside} onChange={(e) => setFeeOutside(e.target.value)} className={input} />
        </Field>
        <Field label="ফ্রি ডেলিভারি এই পরিমাণে (৳, খালি = বন্ধ)">
          <input type="number" min={0} value={freeOver} onChange={(e) => setFreeOver(e.target.value)} className={input} />
        </Field>
      </div>

      <Field label="WhatsApp নম্বর (+8801XXXXXXXXX)">
        <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className={input} />
      </Field>

      <div className="flex items-center gap-4">
        <button
          onClick={save}
          disabled={pending}
          className="rounded-full bg-primary px-7 py-3 font-display text-sm font-bold text-on-primary shadow-card hover:bg-primary-strong disabled:opacity-60"
        >
          {pending ? "সংরক্ষণ হচ্ছে..." : "💾 সংরক্ষণ করুন"}
        </button>
        {feedback && (
          <span className={`text-sm font-semibold ${feedback.ok ? "text-emerald-600" : "text-red-500"}`}>
            {feedback.msg}
          </span>
        )}
      </div>
    </section>
  )
}

const input =
  "w-full rounded-2xl border border-line bg-bg px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-muted">{label}</span>
      {children}
    </label>
  )
}
