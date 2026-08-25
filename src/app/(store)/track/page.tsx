"use client"

import Link from "next/link"
import { useState } from "react"
import { motion } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { useTenant } from "@/components/store/StoreProvider"
import { bnDate, bdt } from "@/lib/utils"
import type { OrderStatus } from "@/lib/types"

interface TrackedResult {
  found: boolean
  order?: {
    order_no: string
    tenant: string
    status: OrderStatus
    subtotal_bdt: number
    delivery_fee_bdt: number
    total_bdt: number
    created_at: string
    district: string
    customer_name: string
  }
  items?: { title: string; variant: string | null; unitPrice: number; qty: number }[]
}

const STEPS: { key: OrderStatus; labelBn: string; emoji: string }[] = [
  { key: "pending", labelBn: "অর্ডার গ্রহণ", emoji: "📝" },
  { key: "confirmed", labelBn: "নিশ্চিত", emoji: "✅" },
  { key: "shipped", labelBn: "পাঠানো হয়েছে", emoji: "🚚" },
  { key: "delivered", labelBn: "ডেলিভারি সম্পন্ন", emoji: "🎉" },
]

export default function TrackPage() {
  const tenant = useTenant()
  const [phone, setPhone] = useState("")
  const [orderNo, setOrderNo] = useState("")
  const [result, setResult] = useState<TrackedResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const search = async () => {
    setError(null)
    setResult(null)
    if (!/^01[3-9]\d{8}$/.test(phone.trim())) {
      setError("১১ ডিজিটের সঠিক মোবাইল নম্বর দিন")
      return
    }
    if (!orderNo.trim()) {
      setError("অর্ডার নম্বর লিখুন (যেমন: OB-260101-1234)")
      return
    }
    setLoading(true)
    if (
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      try {
        const sb = createClient()
        const { data, error: rpcError } = await sb.rpc("track_order", {
          p_phone: phone.trim(),
          p_order_no: orderNo.trim(),
        })
        if (rpcError) throw rpcError
        setResult(data as TrackedResult)
      } catch {
        setError("খুঁজে দেখা গেল না — একটু পরে আবার চেষ্টা করুন")
      }
    } else {
      await new Promise((r) => setTimeout(r, 800))
      setError("(ডেমো মোড) Supabase যুক্ত হলে এখানে আসল অর্ডার দেখা যাবে")
    }
    setLoading(false)
  }

  const stepIndex = result?.order
    ? STEPS.findIndex((s) => s.key === result.order!.status)
    : -1

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 md:py-16">
      <h1 className="text-center font-display text-3xl font-extrabold md:text-4xl">
        🔍 অর্ডার ট্র্যাক করুন
      </h1>
      <p className="mt-2 text-center text-sm text-muted">
        {tenant.nameBn}-এ দেওয়া মোবাইল নম্বর আর অর্ডার নম্বর দিন — ব্যস!
      </p>

      <div className="mt-8 space-y-3 rounded-3xl border border-line bg-surface p-5 shadow-card md:p-6">
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          inputMode="numeric"
          maxLength={11}
          placeholder="মোবাইল নম্বর (01XXXXXXXXX)"
          className="w-full rounded-2xl border border-line bg-bg px-4 py-3.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <input
          value={orderNo}
          onChange={(e) => setOrderNo(e.target.value)}
          placeholder="অর্ডার নম্বর"
          className="w-full rounded-2xl border border-line bg-bg px-4 py-3.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <button
          onClick={search}
          disabled={loading}
          className="w-full rounded-full bg-primary py-3.5 font-display font-bold text-on-primary shadow-card transition-colors hover:bg-primary-strong disabled:opacity-60"
        >
          {loading ? "খুঁজছি..." : "খুঁজে দেখুন"}
        </button>
        {error && (
          <p className="text-center text-sm font-medium text-red-500">{error}</p>
        )}
      </div>

      {result && !result.found && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 rounded-3xl border border-dashed border-line bg-surface p-8 text-center"
        >
          <span className="text-4xl">🕵️</span>
          <p className="mt-3 font-display text-lg font-bold">কিছু পাওয়া যায়নি!</p>
          <p className="mt-1 text-sm text-muted">
            নম্বর আর অর্ডার নম্বরটি মিলিয়ে আবার দেখুন।
          </p>
        </motion.div>
      )}

      {result?.found && result.order && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 space-y-5 rounded-3xl border border-line bg-surface p-5 shadow-card md:p-7"
        >
          {result.order.status === "cancelled" ? (
            <div className="rounded-2xl bg-red-50 px-4 py-3 text-center font-semibold text-red-600">
              ❌ এই অর্ডারটি বাতিল করা হয়েছে
            </div>
          ) : (
            <div className="flex items-center">
              {STEPS.map((step, i) => (
                <div key={step.key} className="flex flex-1 items-center last:flex-none">
                  <div className="flex flex-col items-center gap-1.5">
                    <span
                      className={`flex h-11 w-11 items-center justify-center rounded-full text-lg transition-all ${
                        i <= stepIndex
                          ? "bg-primary text-on-primary shadow-card"
                          : "bg-surface-2 grayscale opacity-50"
                      }`}
                    >
                      {step.emoji}
                    </span>
                    <span
                      className={`max-w-[72px] text-center text-[10px] font-medium leading-tight ${
                        i <= stepIndex ? "text-ink" : "text-muted"
                      }`}
                    >
                      {step.labelBn}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className={`mx-1 mb-5 h-1 flex-1 rounded-full ${
                        i < stepIndex ? "bg-primary" : "bg-surface-2"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2 rounded-2xl bg-bg p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">অর্ডার নম্বর</span>
              <b className="font-mono">{result.order.order_no}</b>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">তারিখ</span>
              <b>{bnDate(result.order.created_at)}</b>
            </div>
            {result.items?.map((it, i) => (
              <div key={i} className="flex justify-between gap-3 border-t border-dashed border-line pt-2">
                <span className="text-muted">
                  {it.title}
                  {it.variant && <span className="block text-xs opacity-70">{it.variant}</span>}
                  ×{it.qty.toLocaleString("bn-BD")}
                </span>
                <span>{bdt(it.unitPrice * it.qty)}</span>
              </div>
            ))}
            <div className="flex justify-between border-t border-dashed border-line pt-2 font-display text-base font-black">
              <span>সর্বমোট (COD)</span>
              <span className="text-primary">{bdt(result.order.total_bdt)}</span>
            </div>
          </div>
        </motion.div>
      )}

      <p className="mt-8 text-center text-sm text-muted">
        অর্ডার করা নেই?{" "}
        <Link href="/shop" className="font-semibold text-primary hover:underline">
          এখনই করে ফেলুন →
        </Link>
      </p>
    </div>
  )
}
