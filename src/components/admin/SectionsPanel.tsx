"use client"

import { useState, useTransition } from "react"
import { updateSectionStatusAction } from "@/app/admin/actions"
import type { Section, SectionStatus } from "@/lib/types"

const OPTIONS: { value: SectionStatus; label: string }[] = [
  { value: "live", label: "🟢 চালু — বিক্রি হচ্ছে" },
  { value: "coming_soon", label: "⏳ শীঘ্রই আসছে — দেখা যাবে, কেনা যাবে না" },
  { value: "hidden", label: "🙈 লুকানো" },
]

export default function SectionsPanel({
  sections,
  waitlist,
}: {
  sections: Section[]
  waitlist: Record<string, string[]>
}) {
  return (
    <section className="space-y-4 rounded-3xl border border-line bg-surface p-5 shadow-card md:p-7">
      <div>
        <h2 className="font-display text-lg font-extrabold">🗂️ সেকশন (কোনটা কখন চালু)</h2>
        <p className="mt-1 text-sm text-muted">
          মজার উপহার দিয়ে শুরু। দুগ্ধজাত বা আম রেডি হলে এখানে “চালু” করে দিন, সাইটে সাথে সাথে বিক্রি শুরু হবে।
        </p>
      </div>
      <ul className="divide-y divide-line/60">
        {sections.map((s) => (
          <SectionRow key={s.id} section={s} phones={waitlist[s.id] ?? []} />
        ))}
      </ul>
    </section>
  )
}

function SectionRow({ section, phones }: { section: Section; phones: string[] }) {
  const [status, setStatus] = useState(section.status)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const change = (next: SectionStatus) => {
    const prev = status
    setStatus(next)
    startTransition(async () => {
      const res = await updateSectionStatusAction(section.id, next)
      if (!res.ok) {
        setStatus(prev)
        setError(res.error ?? "সমস্যা হয়েছে")
      }
    })
  }

  return (
    <li className="space-y-2 py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-display font-bold">
          {section.emoji} {section.name_bn}
        </p>
        <select
          value={status}
          disabled={pending}
          onChange={(e) => change(e.target.value as SectionStatus)}
          className="rounded-xl border border-line bg-bg px-3 py-2 text-sm"
        >
          {OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      {phones.length > 0 && (
        <details className="rounded-2xl bg-bg px-4 py-2.5 text-sm">
          <summary className="cursor-pointer font-semibold">
            🔔 {phones.length.toLocaleString("bn-BD")} জন চালু হওয়ার খবর চেয়েছে
          </summary>
          <textarea
            readOnly
            value={phones.join("\n")}
            rows={Math.min(phones.length, 8)}
            className="mt-2 w-full rounded-xl border border-line bg-surface p-2 font-mono text-xs"
          />
          <p className="text-[11px] text-muted">কপি করে SMS/WhatsApp-এ পাঠাতে পারবেন।</p>
        </details>
      )}
    </li>
  )
}
