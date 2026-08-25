"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { motion } from "framer-motion"
import { Loader2, Lock } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import {
  cartSubtotal,
  selectTenantItems,
  useCartStore,
} from "@/lib/cart-store"
import {
  DISTRICTS,
  FREE_DELIVERY_OVER,
  ZONE_FEES,
  zoneForDistrict,
} from "@/lib/districts"
import { bdt, makeOrderNo } from "@/lib/utils"

const schema = z.object({
  customer_name: z.string().min(2, "আপনার নাম লিখুন"),
  phone: z.string().regex(/^01[3-9]\d{8}$/, "১১ ডিজিটের সঠিক নম্বর দিন (01XXXXXXXXX)"),
  district: z.string().min(1, "জেলা বাছুন"),
  thana_area: z.string().optional(),
  address: z.string().min(8, "বিস্তারিত ঠিকানা লিখুন"),
  notes_bn: z.string().optional(),
  gift_message_bn: z.string().max(120, "১২০ অক্ষরের মধ্যে লিখুন").optional(),
})

type FormValues = z.infer<typeof schema>

const ERROR_MESSAGES: Record<string, string> = {
  invalid_phone: "মোবাইল নম্বরটি সঠিক নয়",
  invalid_address: "ঠিকানাটি আরেকটু বিস্তারিত লিখুন",
  invalid_name: "নামটি ঠিকভাবে লিখুন",
  empty_cart: "কার্ট খালি!",
  product_unavailable: "একটি পণ্য এখন পাওয়া যাচ্ছে না — কার্ট আপডেট করুন",
  out_of_stock: "দুঃখিত! একটি পণ্যের স্টক ঠিক এখনই শেষ হয়ে গেল 😢",
  season_closed: "এই পণ্যের মৌসুম শেষ হয়ে গেছে",
}

export default function CheckoutForm({
  tenantSlug,
  isOddbox,
}: {
  tenantSlug: string
  isOddbox: boolean
}) {
  const router = useRouter()
  const rawItems = useCartStore((s) => s.items)
  const clearTenant = useCartStore((s) => s.clearTenant)
  const items = selectTenantItems(rawItems, tenantSlug)
  const subtotal = cartSubtotal(items)

  const [serverError, setServerError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { district: "" },
  })

  const district = watch("district") ?? ""
  const zone = zoneForDistrict(district || "")
  const fee = subtotal >= FREE_DELIVERY_OVER ? 0 : ZONE_FEES[zone]
  const total = subtotal + fee

  const giftValue = watch("gift_message_bn") ?? ""

  const onSubmit = async (values: FormValues) => {
    setServerError(null)
    setSubmitting(true)

    const payload = {
      tenant: tenantSlug,
      zone,
      items: items.map((i) => ({
        product_id: i.productId,
        variant_label: i.variantLabel,
        qty: i.qty,
      })),
      ...values,
    }

    let result: { ok?: boolean; order_no?: string; total?: number; error?: string }

    if (
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      try {
        const sb = createClient()
        const { data, error } = await sb.rpc("place_order", { payload })
        if (error) throw new Error(error.message)
        result = data as typeof result
      } catch {
        result = { ok: false, error: "network" }
      }
    } else {
      // Demo mode — simulate a successful order
      await new Promise((r) => setTimeout(r, 900))
      result = { ok: true, order_no: makeOrderNo(tenantSlug), total }
    }

    if (!result.ok) {
      setServerError(
        ERROR_MESSAGES[result.error ?? ""] ??
          "কিছু একটা সমস্যা হয়েছে! একটু পরে আবার চেষ্টা করুন।",
      )
      setSubmitting(false)
      return
    }

    clearTenant(tenantSlug)
    router.push(`/order-success?no=${result.order_no}&total=${result.total}`)
  }

  if (items.length === 0) {
    return (
      <div className="mt-10 rounded-3xl border border-dashed border-line bg-surface p-12 text-center">
        <span className="text-6xl">🛒</span>
        <p className="mt-4 font-display text-xl font-bold">কার্ট তো খালি!</p>
        <p className="mt-1.5 text-sm text-muted">আগে কিছু মজার/মিষ্টি জিনিস কার্টে দিন 😊</p>
        <Link
          href="/shop"
          className="mt-6 inline-block rounded-full bg-primary px-7 py-3 font-display font-bold text-on-primary shadow-card transition-transform hover:scale-105"
        >
          শপে যান →
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
      {/* ---------- FORM ---------- */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4 rounded-3xl border border-line bg-surface p-5 shadow-card md:p-7"
      >
        <h2 className="font-display text-lg font-bold">📦 ডেলিভারির তথ্য</h2>

        <Field label="আপনার নাম *" error={errors.customer_name?.message}>
          <input
            {...register("customer_name")}
            placeholder="যেমন: রহিম উদ্দিন"
            className={inputCls(errors.customer_name)}
          />
        </Field>

        <Field label="মোবাইল নম্বর *" error={errors.phone?.message}>
          <input
            {...register("phone")}
            inputMode="numeric"
            maxLength={11}
            placeholder="01XXXXXXXXX"
            className={inputCls(errors.phone)}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="জেলা *" error={errors.district?.message}>
            <select {...register("district")} className={inputCls(errors.district)}>
              <option value="">— জেলা বাছুন —</option>
              {DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </Field>
          <Field label="থানা / এলাকা">
            <input {...register("thana_area")} placeholder="যেমন: মিরপুর" className={inputCls()} />
          </Field>
        </div>

        {district && (
          <p className="rounded-xl bg-surface-2 px-3.5 py-2.5 text-xs font-medium text-muted">
            {zone === "inside_dhaka" ? "🏙️" : "🚌"} ডেলিভারি:{" "}
            <b className="text-ink">
              {zone === "inside_dhaka" ? "ঢাকার ভিতরে · ২৪ ঘণ্টার মধ্যে" : "ঢাকার বাইরে · ৪৮–৭২ ঘণ্টায়"}
            </b>{" "}
            — ফি {fee === 0 ? <b className="text-emerald-600">ফ্রি!</b> : bdt(fee)}
          </p>
        )}

        <Field label="বিস্তারিত ঠিকানা *" error={errors.address?.message}>
          <textarea
            {...register("address")}
            rows={3}
            placeholder="বাসা/হোল্ডিং নম্বর, রোড, এলাকা — যেন ডেলিভারি ম্যান সহজে খুঁজে পায়"
            className={inputCls(errors.address)}
          />
        </Field>

        <Field label="ডেলিভারি নোট (অপশনাল)">
          <input
            {...register("notes_bn")}
            placeholder="যেমন: বিকেলে কল দিয়ে আসবেন"
            className={inputCls()}
          />
        </Field>

        {isOddbox && (
          <Field
            label="🎁 মজার নোট লিখুন (অপশনাল)"
            hint={`${giftValue.length}/১২০`}
          >
            <textarea
              {...register("gift_message_bn")}
              rows={2}
              maxLength={120}
              placeholder="যেমন: গরুর জন্য গোবর, গাধার জন্য ঘাস — ভালো থাকো!"
              className={inputCls()}
            />
          </Field>
        )}
      </motion.div>

      {/* ---------- SUMMARY ---------- */}
      <motion.aside
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="h-fit space-y-4 rounded-3xl border border-line bg-surface p-5 shadow-card lg:sticky lg:top-24 md:p-6"
      >
        <h2 className="font-display text-lg font-bold">🧺 আপনার অর্ডার</h2>
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.key} className="flex justify-between gap-3 text-sm">
              <span className="text-muted">
                {item.title}
                {item.variantLabel && (
                  <span className="block text-xs opacity-70">{item.variantLabel}</span>
                )}
                <b className="text-ink"> ×{item.qty.toLocaleString("bn-BD")}</b>
              </span>
              <span className="shrink-0 font-semibold">{bdt(item.price * item.qty)}</span>
            </li>
          ))}
        </ul>

        <div className="space-y-2 border-t border-dashed border-line pt-4 text-sm">
          <Row label="সাবটোটাল" value={bdt(subtotal)} />
          <Row
            label="ডেলিভারি ফি"
            value={fee === 0 ? "ফ্রি 🎉" : bdt(fee)}
            highlight={fee === 0}
          />
          <div className="flex justify-between pt-1 font-display text-lg font-black">
            <span>সর্বমোট</span>
            <span className="text-primary">{bdt(total)}</span>
          </div>
        </div>

        {serverError && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-600">
            {serverError}
          </p>
        )}

        <motion.button
          whileTap={{ scale: 0.97 }}
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 font-display text-base font-bold text-on-primary shadow-card transition-colors hover:bg-primary-strong disabled:opacity-60"
        >
          {submitting ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              পাঠানো হচ্ছে...
            </>
          ) : (
            <>✅ অর্ডার কনফার্ম করুন</>
          )}
        </motion.button>

        <p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-muted">
          <Lock size={11} />
          💵 ক্যাশ অন ডেলিভারি — পার্সেল হাতে পেয়ে টাকা দিন
        </p>
      </motion.aside>
    </form>
  )
}

function Row({
  label,
  value,
  highlight,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className="flex justify-between">
      <span className="text-muted">{label}</span>
      <span className={highlight ? "font-semibold text-emerald-600" : "font-semibold"}>
        {value}
      </span>
    </div>
  )
}

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string
  error?: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center justify-between text-xs font-semibold text-muted">
        {label}
        {hint && <span className="opacity-70">{hint}</span>}
      </span>
      {children}
      {error && <span className="mt-1 block text-xs font-medium text-red-500">{error}</span>}
    </label>
  )
}

function inputCls(error?: unknown) {
  return `w-full rounded-2xl border bg-bg px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted/50 focus:border-primary focus:ring-2 focus:ring-primary/20 ${
    error ? "border-red-400" : "border-line"
  }`
}
