"use client"

import { useState, useTransition } from "react"
import { updateTenantSettingsAction } from "@/app/admin/actions"
import type { TenantSettingsRow } from "@/lib/admin-types"

export default function SettingsPanel({ tenant }: { tenant: TenantSettingsRow }) {
  const [announcement, setAnnouncement] = useState(tenant.announcement_bn ?? "")
  const [feeInside, setFeeInside] = useState(String(tenant.delivery_fee_inside))
  const [feeOutside, setFeeOutside] = useState(String(tenant.delivery_fee_outside))
  const [freeOver, setFreeOver] = useState(tenant.free_delivery_over?.toString() ?? "")
  const [whatsapp, setWhatsapp] = useState(tenant.whatsapp_number ?? "")
  const [codEnabled, setCodEnabled] = useState(tenant.cod_enabled ?? true)
  const [bkashEnabled, setBkashEnabled] = useState(tenant.bkash_enabled ?? false)
  const [bkashNumber, setBkashNumber] = useState(tenant.bkash_number ?? "")
  const [bkashType, setBkashType] = useState<TenantSettingsRow["bkash_account_type"]>(
    tenant.bkash_account_type ?? "personal",
  )
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null)
  const [pending, startTransition] = useTransition()

  const save = () =>
    startTransition(async () => {
      const res = await updateTenantSettingsAction(tenant.id, {
        announcement_bn: announcement.trim() || null,
        delivery_fee_inside: Number(feeInside) || 0,
        delivery_fee_outside: Number(feeOutside) || 0,
        free_delivery_over: freeOver ? Number(freeOver) : null,
        whatsapp_number: whatsapp.trim() || null,
        cod_enabled: codEnabled,
        bkash_enabled: bkashEnabled,
        bkash_number: bkashNumber.trim() || null,
        bkash_account_type: bkashType,
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
      <h2 className="font-display text-lg font-extrabold">🏪 দোকানের সেটিংস</h2>

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

      <div className="space-y-3 rounded-2xl border border-line bg-bg p-4">
        <p className="font-display font-bold">💳 পেমেন্ট</p>
        <label className="flex items-center gap-2.5 text-sm">
          <input type="checkbox" checked={codEnabled} onChange={(e) => setCodEnabled(e.target.checked)} className="h-4 w-4 accent-[var(--primary)]" />
          💵 ক্যাশ অন ডেলিভারি চালু
        </label>
        <label className="flex items-center gap-2.5 text-sm">
          <input type="checkbox" checked={bkashEnabled} onChange={(e) => setBkashEnabled(e.target.checked)} className="h-4 w-4 accent-[var(--primary)]" />
          📱 বিকাশ চালু (কাস্টমার টাকা পাঠিয়ে TrxID দেবে, আপনি মিলিয়ে কনফার্ম করবেন)
        </label>
        {bkashEnabled && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="বিকাশ নম্বর (01XXXXXXXXX)">
              <input value={bkashNumber} onChange={(e) => setBkashNumber(e.target.value)} inputMode="numeric" maxLength={11} className={input} />
            </Field>
            <Field label="অ্যাকাউন্টের ধরন">
              <select value={bkashType} onChange={(e) => setBkashType(e.target.value as typeof bkashType)} className={input}>
                <option value="personal">পার্সোনাল (কাস্টমার Send Money করবে)</option>
                <option value="merchant">মার্চেন্ট (কাস্টমার Payment করবে)</option>
                <option value="agent">এজেন্ট (কাস্টমার Cash Out করবে)</option>
              </select>
            </Field>
          </div>
        )}
      </div>

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
