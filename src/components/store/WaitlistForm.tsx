"use client"

import { useState } from "react"
import { Bell, Check, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

const live = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
)

/** "Tell me when it launches" — saves a phone number for a coming-soon section. */
export default function WaitlistForm({
  sectionId,
  compact = false,
}: {
  sectionId: string
  compact?: boolean
}) {
  const [phone, setPhone] = useState("")
  const [state, setState] = useState<"idle" | "saving" | "done" | "error">("idle")
  const [message, setMessage] = useState("")

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const value = phone.trim()
    if (!/^01[3-9]\d{8}$/.test(value)) {
      setState("error")
      setMessage("১১ ডিজিটের সঠিক নম্বর দিন")
      return
    }
    setState("saving")
    try {
      if (live) {
        const { data, error } = await createClient().rpc("join_waitlist", {
          p_section: sectionId,
          p_phone: value,
        })
        if (error || !data?.ok) throw new Error("failed")
      } else {
        await new Promise((r) => setTimeout(r, 600))
      }
      setState("done")
    } catch {
      setState("error")
      setMessage("সেভ হলো না, একটু পরে চেষ্টা করুন")
    }
  }

  if (state === "done") {
    return (
      <p className="flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
        <Check size={16} /> ঠিক আছে! চালু হলেই আপনাকে জানাব।
      </p>
    )
  }

  return (
    <form onSubmit={submit} className="space-y-1.5">
      <div className={`flex gap-2 ${compact ? "" : "flex-col sm:flex-row"}`}>
        <input
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value)
            if (state === "error") setState("idle")
          }}
          inputMode="numeric"
          maxLength={11}
          placeholder="01XXXXXXXXX"
          aria-label="মোবাইল নম্বর"
          className="min-w-0 flex-1 rounded-full border border-line bg-bg px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <button
          disabled={state === "saving"}
          className="flex shrink-0 items-center justify-center gap-1.5 rounded-full bg-ink px-5 py-2.5 font-display text-sm font-bold text-white transition-transform hover:scale-105 disabled:opacity-60"
        >
          {state === "saving" ? <Loader2 size={15} className="animate-spin" /> : <Bell size={15} />}
          জানাবেন
        </button>
      </div>
      {state === "error" && <p className="pl-3 text-xs font-medium text-red-500">{message}</p>}
    </form>
  )
}
